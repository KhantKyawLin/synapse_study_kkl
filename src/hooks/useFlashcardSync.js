import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const LOCAL_STORAGE_KEY = 'synapse_flashcard_status';

export function useFlashcardSync() {
  const { user } = useAuth();
  const [cardStatusMap, setCardStatusMap] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach((k) => {
          if (k.startsWith('Final Part 2 Surgery - Module ')) {
            const migratedKey = k.replace('Final Part 2 Surgery - Module ', 'Final Part 2 Surgery - Surgery Module ');
            if (!parsed[migratedKey]) parsed[migratedKey] = parsed[k];
          }
        });
        return parsed;
      }
      return {};
    } catch (e) {
      console.error('Failed to load card status from localStorage:', e);
      return {};
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const isInitialSyncDone = useRef(false);

  // Helper to generate unique ID for a card
  const getCardId = useCallback((card) => {
    if (!card) return '';
    return `${card.category || 'General'}::${card.question}`;
  }, []);

  // Save to localStorage whenever cardStatusMap changes (or clean on empty)
  useEffect(() => {
    try {
      if (Object.keys(cardStatusMap).length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cardStatusMap));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save card status to localStorage:', e);
    }
  }, [cardStatusMap]);

  // When user signs out, reset to clean guest state
  useEffect(() => {
    if (!user) {
      setCardStatusMap({});
      setCloudSynced(false);
      isInitialSyncDone.current = false;
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.warn(e);
      }
    }
  }, [user]);

  // Initial Sync from Supabase when user logs in
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setCloudSynced(false);
      isInitialSyncDone.current = false;
      return;
    }

    let isMounted = true;

    async function syncFromCloud() {
      try {
        setIsSyncing(true);
        const { data, error } = await supabase
          .from('flashcard_progress')
          .select('card_id, status')
          .eq('user_id', user.id);

        if (error) throw error;

        if (isMounted) {
          const cloudMap = {};
          (data || []).forEach((row) => {
            if (row.card_id && row.status) {
              cloudMap[row.card_id] = row.status;
              if (row.card_id.startsWith('Final Part 2 Surgery - Module ')) {
                const migratedKey = row.card_id.replace('Final Part 2 Surgery - Module ', 'Final Part 2 Surgery - Surgery Module ');
                if (!cloudMap[migratedKey]) cloudMap[migratedKey] = row.status;
              }
            }
          });

          // Set state to cloud map
          setCardStatusMap(cloudMap);
          setCloudSynced(true);
          isInitialSyncDone.current = true;
        }
      } catch (err) {
        console.error('Error syncing flashcards from cloud:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    syncFromCloud();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Toggle card status (mastered | review)
  const handleToggleStatus = useCallback((card, targetStatus) => {
    const cardId = getCardId(card);
    if (!cardId) return;

    setCardStatusMap((prev) => {
      const current = prev[cardId];
      const nextMap = { ...prev };
      let newStatus = null;

      if (current === targetStatus) {
        delete nextMap[cardId]; // Toggle off if clicked again
        newStatus = null;
      } else {
        nextMap[cardId] = targetStatus;
        newStatus = targetStatus;
      }

      // If logged in, sync to Supabase
      if (isSupabaseConfigured && supabase && user) {
        if (newStatus) {
          supabase
            .from('flashcard_progress')
            .upsert(
              {
                user_id: user.id,
                card_id: cardId,
                status: newStatus,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,card_id' }
            )
            .then(({ error }) => {
              if (error) console.error('Cloud upsert error:', error);
            });
        } else {
          supabase
            .from('flashcard_progress')
            .delete()
            .match({ user_id: user.id, card_id: cardId })
            .then(({ error }) => {
              if (error) console.error('Cloud delete error:', error);
            });
        }
      }

      return nextMap;
    });
  }, [getCardId, user]);

  return {
    cardStatusMap,
    handleToggleStatus,
    getCardId,
    isSyncing,
    cloudSynced,
  };
}
