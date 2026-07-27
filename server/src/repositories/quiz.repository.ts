import { supabase } from '../config/supabase.js';
import type { DbQuiz, DbQuizQuestion, DbQuizAttempt } from '../types/database.js';

export const quizRepository = {
  async findById(quizId: string): Promise<DbQuiz | null> {
    const { data, error } = await supabase.from('quizzes').select('*').eq('quiz_id', quizId).single();
    if (error || !data) return null;
    return data as DbQuiz;
  },

  async findByClassroomId(classroomId: string): Promise<DbQuiz[]> {
    const { data, error } = await supabase.from('quizzes').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch quizzes: ${error.message}`);
    return (data || []) as DbQuiz[];
  },

  async create(quiz: Omit<DbQuiz, 'quiz_id' | 'created_at' | 'updated_at'>): Promise<DbQuiz> {
    const { data, error } = await supabase.from('quizzes').insert(quiz).select().single();
    if (error) throw new Error(`Failed to create quiz: ${error.message}`);
    return data as DbQuiz;
  },

  async update(quizId: string, updates: Partial<DbQuiz>): Promise<DbQuiz> {
    const { data, error } = await supabase.from('quizzes').update(updates).eq('quiz_id', quizId).select().single();
    if (error) throw new Error(`Failed to update quiz: ${error.message}`);
    return data as DbQuiz;
  },

  async delete(quizId: string): Promise<void> {
    const { error } = await supabase.from('quizzes').delete().eq('quiz_id', quizId);
    if (error) throw new Error(`Failed to delete quiz: ${error.message}`);
  },

  async getQuestions(quizId: string): Promise<DbQuizQuestion[]> {
    const { data, error } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quizId).order('sort_order', { ascending: true });
    if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
    return (data || []) as DbQuizQuestion[];
  },

  async createQuestion(question: Omit<DbQuizQuestion, 'question_id' | 'created_at'>): Promise<DbQuizQuestion> {
    const { data, error } = await supabase.from('quiz_questions').insert(question).select().single();
    if (error) throw new Error(`Failed to create question: ${error.message}`);
    return data as DbQuizQuestion;
  },

  async updateQuestion(questionId: string, updates: Partial<DbQuizQuestion>): Promise<DbQuizQuestion> {
    const { data, error } = await supabase.from('quiz_questions').update(updates).eq('question_id', questionId).select().single();
    if (error) throw new Error(`Failed to update question: ${error.message}`);
    return data as DbQuizQuestion;
  },

  async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await supabase.from('quiz_questions').delete().eq('question_id', questionId);
    if (error) throw new Error(`Failed to delete question: ${error.message}`);
  },

  async createAttempt(attempt: Omit<DbQuizAttempt, 'attempt_id' | 'submitted_at'>): Promise<DbQuizAttempt> {
    const { data, error } = await supabase.from('quiz_attempts').insert(attempt).select().single();
    if (error) throw new Error(`Failed to create attempt: ${error.message}`);
    return data as DbQuizAttempt;
  },

  async getAttempt(quizId: string, studentId: string): Promise<DbQuizAttempt | null> {
    const { data, error } = await supabase.from('quiz_attempts').select('*').eq('quiz_id', quizId).eq('student_id', studentId).single();
    if (error || !data) return null;
    return data as DbQuizAttempt;
  },

  async getAttempts(quizId: string): Promise<DbQuizAttempt[]> {
    const { data, error } = await supabase.from('quiz_attempts').select('*, students(name, roll_number, profile_image)').eq('quiz_id', quizId).order('score', { ascending: false });
    if (error) throw new Error(`Failed to fetch attempts: ${error.message}`);
    return (data || []) as DbQuizAttempt[];
  },

  async getQuestionCount(quizId: string): Promise<number> {
    const { count } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('quiz_id', quizId);
    return count || 0;
  },

  async getAttemptCount(quizId: string): Promise<number> {
    const { count } = await supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('quiz_id', quizId);
    return count || 0;
  },
};
