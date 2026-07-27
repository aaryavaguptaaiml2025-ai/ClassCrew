import { supabase } from '../config/supabase.js';
import type { DbUser, DbTeacher, DbStudent } from '../types/database.js';

export const userRepository = {
  async findByFirebaseUid(firebaseUid: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();
    if (error || !data) return null;
    return data as DbUser;
  },

  async findById(id: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as DbUser;
  },

  async findByEmail(email: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !data) return null;
    return data as DbUser;
  },

  async create(user: { firebase_uid: string; role: string; email: string }): Promise<DbUser> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as DbUser;
  },

  async getTeacherProfile(userId: string): Promise<DbTeacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data as DbTeacher;
  },

  async getStudentProfile(userId: string): Promise<DbStudent | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data as DbStudent;
  },

  async createTeacher(teacher: Omit<DbTeacher, 'teacher_id' | 'created_at' | 'updated_at'>): Promise<DbTeacher> {
    const { data, error } = await supabase
      .from('teachers')
      .insert(teacher)
      .select()
      .single();
    if (error) throw new Error(`Failed to create teacher: ${error.message}`);
    return data as DbTeacher;
  },

  async createStudent(student: Omit<DbStudent, 'student_id' | 'created_at' | 'updated_at'>): Promise<DbStudent> {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();
    if (error) throw new Error(`Failed to create student: ${error.message}`);
    return data as DbStudent;
  },

  async updateTeacher(userId: string, updates: Partial<DbTeacher>): Promise<DbTeacher> {
    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update teacher: ${error.message}`);
    return data as DbTeacher;
  },

  async updateStudent(userId: string, updates: Partial<DbStudent>): Promise<DbStudent> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update student: ${error.message}`);
    return data as DbStudent;
  },
};
