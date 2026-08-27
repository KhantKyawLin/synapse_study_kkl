import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const LOCAL_STORAGE_KEY = 'synapse_quiz_history';

export function useQuizHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse local quiz history:', e);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync with localStorage (or clean when empty)
  useEffect(() => {
    try {
      if (history.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save quiz history locally:', e);
    }
  }, [history]);

  // When user signs out, clear history state and remove localStorage for fresh guest mode
  useEffect(() => {
    if (!user) {
      setHistory([]);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.warn(e);
      }
    }
  }, [user]);

  // Fetch attempts from Supabase when user is logged in
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    let isMounted = true;

    async function fetchCloudHistory() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;

        if (isMounted && data) {
          setHistory(data);
        }
      } catch (err) {
        console.error('Error fetching quiz history from cloud:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCloudHistory();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Save new quiz attempt
  const saveQuizAttempt = useCallback(
    async (attempt) => {
      const newRecord = {
        id: attempt.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}`),
        student_name: attempt.student_name || 'Student',
        module_name: attempt.module_name || 'General',
        category: attempt.category || 'All',
        score: attempt.score,
        total_questions: attempt.total_questions,
        percentage: attempt.percentage,
        time_spent_seconds: attempt.time_spent_seconds,
        total_allocated_seconds: attempt.total_allocated_seconds,
        completed_at: attempt.completed_at || new Date().toISOString(),
      };

      // Update state locally
      setHistory((prev) => [newRecord, ...prev]);

      // If user is authenticated, save to Supabase
      if (isSupabaseConfigured && supabase && user) {
        try {
          await supabase.from('quiz_attempts').insert([
            {
              id: newRecord.id.startsWith('local_') ? undefined : newRecord.id,
              user_id: user.id,
              student_name: newRecord.student_name,
              module_name: newRecord.module_name,
              category: newRecord.category,
              score: newRecord.score,
              total_questions: newRecord.total_questions,
              percentage: newRecord.percentage,
              time_spent_seconds: newRecord.time_spent_seconds,
              total_allocated_seconds: newRecord.total_allocated_seconds,
              completed_at: newRecord.completed_at,
            },
          ]);
        } catch (err) {
          console.error('Failed to log quiz attempt to Supabase:', err);
        }
      }

      return newRecord;
    },
    [user]
  );

  // Compute aggregate metrics
  const stats = {
    totalQuizzes: history.length,
    averageScore: history.length
      ? Math.round(history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / history.length)
      : 0,
    passedQuizzes: history.filter((h) => (h.percentage || 0) >= 70).length,
    totalTimeSpentSeconds: history.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0),
  };

  return {
    history,
    loading,
    saveQuizAttempt,
    stats,
  };
}
