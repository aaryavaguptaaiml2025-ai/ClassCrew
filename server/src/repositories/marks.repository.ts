import { supabase } from '../config/supabase.js';
import type { DbMarks } from '../types/database.js';

export const marksRepository = {
  async findByClassroomId(classroomId: string): Promise<DbMarks[]> {
    const { data, error } = await supabase
      .from('marks')
      .select('*, students(name, roll_number, profile_image)')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to fetch marks: ${error.message}`);
    return (data || []) as DbMarks[];
  },

  async findByStudentId(studentId: string): Promise<DbMarks[]> {
    const { data, error } = await supabase
      .from('marks')
      .select('*, classrooms(title, subject)')
      .eq('student_id', studentId);
    if (error) throw new Error(`Failed to fetch student marks: ${error.message}`);
    return (data || []) as DbMarks[];
  },

  async findByClassroomAndStudent(classroomId: string, studentId: string): Promise<DbMarks | null> {
    const { data, error } = await supabase
      .from('marks')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId)
      .single();
    if (error || !data) return null;
    return data as DbMarks;
  },

  async upsert(marks: Omit<DbMarks, 'marks_id' | 'created_at' | 'updated_at'>): Promise<DbMarks> {
    const { data, error } = await supabase
      .from('marks')
      .upsert(marks, { onConflict: 'classroom_id,student_id' })
      .select()
      .single();
    if (error) throw new Error(`Failed to save marks: ${error.message}`);
    return data as DbMarks;
  },

  async update(marksId: string, updates: Partial<DbMarks>): Promise<DbMarks> {
    const { data, error } = await supabase
      .from('marks')
      .update(updates)
      .eq('marks_id', marksId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update marks: ${error.message}`);
    return data as DbMarks;
  },

  async updateQuizMarks(classroomId: string, studentId: string, quizScore: number): Promise<void> {
    const existing = await marksRepository.findByClassroomAndStudent(classroomId, studentId);
    if (existing) {
      await supabase
        .from('marks')
        .update({ quiz: quizScore })
        .eq('marks_id', existing.marks_id);
    } else {
      await supabase
        .from('marks')
        .insert({ classroom_id: classroomId, student_id: studentId, quiz: quizScore });
    }
  },

  async ensureMarksRowExists(classroomId: string, studentId: string): Promise<void> {
    const existing = await marksRepository.findByClassroomAndStudent(classroomId, studentId);
    if (!existing) {
      await supabase.from('marks').insert({ classroom_id: classroomId, student_id: studentId });
    }
  },
};
