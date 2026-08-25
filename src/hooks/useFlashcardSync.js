import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const LOCAL_STORAGE_KEY = 'synapse_flashcard_status';

export function useFlashcardSync() {
  const { user } = useAuth();
  const [cardStatusMap, setCardStatusMap] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
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

  // Save to localStorage whenever cardStatusMap changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cardStatusMap));
    } catch (e) {
      console.error('Failed to save card status to localStorage:', e);
    }
  }, [cardStatusMap]);

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
            }
          });

          // Merge: cloud map takes priority, but merge guest local cards if cloud is missing them
          setCardStatusMap((localPrev) => {
            const merged = { ...localPrev, ...cloudMap };
            
            // If local had unsynced cards, sync them up to cloud in background
            const unsyncedCards = [];
            Object.keys(localPrev).forEach((cardId) => {
              if (!cloudMap[cardId]) {
                unsyncedCards.push({
                  user_id: user.id,
                  card_id: cardId,
                  status: localPrev[cardId],
                  updated_at: new Date().toISOString(),
                });
              }
            });

            if (unsyncedCards.length > 0) {
              supabase.from('flashcard_progress').upsert(unsyncedCards, { onConflict: 'user_id,card_id' }).then();
            }

            return merged;
          });

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
