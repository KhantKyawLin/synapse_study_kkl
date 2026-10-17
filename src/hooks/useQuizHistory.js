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
          // Exclude soft-deleted records from active history view
          const activeRecords = data.filter((item) => !item.is_deleted);
          setHistory(activeRecords);
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
      const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : `local_${Date.now()}`;

      const newRecord = {
        id: attempt.id || generatedId,
        student_name: attempt.student_name || 'Student',
        module_name: attempt.module_name || 'General',
        category: attempt.category || 'All',
        score: typeof attempt.score === 'number' ? attempt.score : 0,
        total_questions: attempt.total_questions || 1,
        percentage: typeof attempt.percentage === 'number' ? attempt.percentage : 0,
        is_full_quiz: Boolean(attempt.is_full_quiz),
        time_spent_seconds: attempt.time_spent_seconds || 0,
        total_allocated_seconds: attempt.total_allocated_seconds,
        is_deleted: false,
        completed_at: attempt.completed_at || new Date().toISOString(),
      };

      // Update state locally immediately
      setHistory((prev) => [newRecord, ...prev]);

      // If user is authenticated, save to Supabase
      if (isSupabaseConfigured && supabase && user) {
        try {
          const payload = {
            user_id: user.id,
            student_name: newRecord.student_name,
            module_name: newRecord.module_name,
            category: newRecord.category,
            score: newRecord.score,
            total_questions: newRecord.total_questions,
            percentage: newRecord.percentage,
            is_full_quiz: newRecord.is_full_quiz,
            time_spent_seconds: newRecord.time_spent_seconds,
            is_deleted: false,
            completed_at: newRecord.completed_at,
          };

          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (newRecord.id && uuidRegex.test(newRecord.id)) {
            payload.id = newRecord.id;
          }

          const { data, error } = await supabase.from('quiz_attempts').insert([payload]).select().single();
          if (!error && data?.id && data.id !== newRecord.id) {
            setHistory((prev) =>
              prev.map((item) => (item.id === newRecord.id ? { ...item, id: data.id } : item))
            );
          }
        } catch (err) {
          console.error('Failed to log quiz attempt to Supabase:', err);
        }
      }

      return newRecord;
    },
    [user]
  );

  // Soft-delete a quiz attempt locally and in Supabase
  const deleteQuizAttempt = useCallback(
    async (attemptId) => {
      if (!attemptId) return;

      // Optimistically remove from active view immediately
      setHistory((prev) => prev.filter((item) => item.id !== attemptId));

      // Soft delete in Supabase by setting is_deleted: true and timestamp
      if (isSupabaseConfigured && supabase && user) {
        try {
          const { error } = await supabase
            .from('quiz_attempts')
            .update({ 
              is_deleted: true, 
              deleted_at: new Date().toISOString() 
            })
            .eq('id', attemptId)
            .eq('user_id', user.id);

          if (error) {
            console.error('Failed to soft delete quiz attempt in Supabase:', error);
          }
        } catch (err) {
          console.error('Failed to soft delete quiz attempt from Supabase:', err);
        }
      }
    },
    [user]
  );

  // Restore a soft-deleted quiz attempt
  const restoreQuizAttempt = useCallback(
    async (attemptId) => {
      if (!attemptId) return null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('quiz_attempts')
            .update({ is_deleted: false, deleted_at: null })
            .eq('id', attemptId)
            .select()
            .single();

          if (!error && data) {
            setHistory((prev) => [data, ...prev.filter((item) => item.id !== attemptId)]);
            return data;
          }
        } catch (err) {
          console.error('Failed to restore quiz attempt:', err);
        }
      }
      return null;
    },
    []
  );

  // Compute aggregate metrics
  const fullExams = history.filter((h) => h.is_full_quiz || (h.total_questions >= 30));
  const passedFullExams = fullExams.filter((h) => (h.percentage || 0) >= 60);

  const stats = {
    totalQuizzes: history.length,
    averageScore: history.length
      ? Math.round(history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / history.length)
      : 0,
    passedQuizzes: history.filter((h) => (h.percentage || 0) >= 60).length,
    fullExamsCount: fullExams.length,
    passedFullExamsCount: passedFullExams.length,
    totalTimeSpentSeconds: history.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0),
  };

  return {
    history,
    loading,
    saveQuizAttempt,
    deleteQuizAttempt,
    restoreQuizAttempt,
    stats,
  };
}
