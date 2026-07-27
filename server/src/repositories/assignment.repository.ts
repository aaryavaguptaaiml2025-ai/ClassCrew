import { supabase } from '../config/supabase.js';
import type { DbAssignment, DbAssignmentSubmission } from '../types/database.js';

export const assignmentRepository = {
  async findById(assignmentId: string): Promise<DbAssignment | null> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('assignment_id', assignmentId)
      .single();
    if (error || !data) return null;
    return data as DbAssignment;
  },

  async findByClassroomId(classroomId: string): Promise<DbAssignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch assignments: ${error.message}`);
    return (data || []) as DbAssignment[];
  },

  async create(assignment: Omit<DbAssignment, 'assignment_id' | 'created_at' | 'updated_at'>): Promise<DbAssignment> {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignment)
      .select()
      .single();
    if (error) throw new Error(`Failed to create assignment: ${error.message}`);
    return data as DbAssignment;
  },

  async update(assignmentId: string, updates: Partial<DbAssignment>): Promise<DbAssignment> {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('assignment_id', assignmentId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update assignment: ${error.message}`);
    return data as DbAssignment;
  },

  async delete(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('assignment_id', assignmentId);
    if (error) throw new Error(`Failed to delete assignment: ${error.message}`);
  },

  async getSubmissions(assignmentId: string): Promise<DbAssignmentSubmission[]> {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*, students(name, roll_number, profile_image)')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to fetch submissions: ${error.message}`);
    return (data || []) as DbAssignmentSubmission[];
  },

  async getSubmission(assignmentId: string, studentId: string): Promise<DbAssignmentSubmission | null> {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .single();
    if (error || !data) return null;
    return data as DbAssignmentSubmission;
  },

  async createSubmission(submission: Omit<DbAssignmentSubmission, 'submission_id' | 'created_at' | 'updated_at'>): Promise<DbAssignmentSubmission> {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .insert(submission)
      .select()
      .single();
    if (error) throw new Error(`Failed to create submission: ${error.message}`);
    return data as DbAssignmentSubmission;
  },

  async updateSubmission(submissionId: string, updates: Partial<DbAssignmentSubmission>): Promise<DbAssignmentSubmission> {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update(updates)
      .eq('submission_id', submissionId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update submission: ${error.message}`);
    return data as DbAssignmentSubmission;
  },

  async getSubmissionCount(assignmentId: string): Promise<{ submitted: number; total: number }> {
    const { count: submitted } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', assignmentId)
      .in('status', ['submitted', 'reviewed']);
    const { count: total } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', assignmentId);
    return { submitted: submitted || 0, total: total || 0 };
  },

  async getPendingCountForStudent(studentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('status', 'pending');
    if (error) return 0;
    return count || 0;
  },
};
