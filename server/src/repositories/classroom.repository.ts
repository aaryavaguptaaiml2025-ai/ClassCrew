import { supabase } from '../config/supabase.js';
import type { DbClassroom, DbClassroomMember } from '../types/database.js';

export const classroomRepository = {
  async findById(classroomId: string): Promise<DbClassroom | null> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('classroom_id', classroomId)
      .single();
    if (error || !data) return null;
    return data as DbClassroom;
  },

  async findByJoinCode(joinCode: string): Promise<DbClassroom | null> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('join_code', joinCode)
      .single();
    if (error || !data) return null;
    return data as DbClassroom;
  },

  async findByTeacherId(teacherId: string): Promise<DbClassroom[]> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch classrooms: ${error.message}`);
    return (data || []) as DbClassroom[];
  },

  async findByStudentId(studentId: string): Promise<(DbClassroom & { joined_at: string })[]> {
    const { data, error } = await supabase
      .from('classroom_members')
      .select('joined_at, classrooms(*)')
      .eq('student_id', studentId)
      .order('joined_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch student classrooms: ${error.message}`);
    return (data || []).map((row: Record<string, unknown>) => ({
      ...(row.classrooms as DbClassroom),
      joined_at: row.joined_at as string,
    }));
  },

  async create(classroom: Omit<DbClassroom, 'classroom_id' | 'created_at' | 'updated_at'>): Promise<DbClassroom> {
    const { data, error } = await supabase
      .from('classrooms')
      .insert(classroom)
      .select()
      .single();
    if (error) throw new Error(`Failed to create classroom: ${error.message}`);
    return data as DbClassroom;
  },

  async update(classroomId: string, updates: Partial<DbClassroom>): Promise<DbClassroom> {
    const { data, error } = await supabase
      .from('classrooms')
      .update(updates)
      .eq('classroom_id', classroomId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update classroom: ${error.message}`);
    return data as DbClassroom;
  },

  async delete(classroomId: string): Promise<void> {
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('classroom_id', classroomId);
    if (error) throw new Error(`Failed to delete classroom: ${error.message}`);
  },

  async addMember(classroomId: string, studentId: string): Promise<DbClassroomMember> {
    const { data, error } = await supabase
      .from('classroom_members')
      .insert({ classroom_id: classroomId, student_id: studentId })
      .select()
      .single();
    if (error) throw new Error(`Failed to add member: ${error.message}`);
    return data as DbClassroomMember;
  },

  async removeMember(classroomId: string, studentId: string): Promise<void> {
    const { error } = await supabase
      .from('classroom_members')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId);
    if (error) throw new Error(`Failed to remove member: ${error.message}`);
  },

  async isMember(classroomId: string, studentId: string): Promise<boolean> {
    const { data } = await supabase
      .from('classroom_members')
      .select('id')
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId)
      .single();
    return !!data;
  },

  async getMembers(classroomId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from('classroom_members')
      .select('*, students(student_id, name, roll_number, branch, semester, section, profile_image)')
      .eq('classroom_id', classroomId)
      .order('joined_at', { ascending: true });
    if (error) throw new Error(`Failed to fetch members: ${error.message}`);
    return data || [];
  },

  async getMemberCount(classroomId: string): Promise<number> {
    const { count, error } = await supabase
      .from('classroom_members')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroomId);
    if (error) return 0;
    return count || 0;
  },
};
