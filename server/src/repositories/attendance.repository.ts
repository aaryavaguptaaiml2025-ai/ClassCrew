import { supabase } from '../config/supabase.js';
import type { DbAttendance } from '../types/database.js';

export const attendanceRepository = {
  async findByClassroomAndDate(classroomId: string, date: string): Promise<DbAttendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(name, roll_number, profile_image)')
      .eq('classroom_id', classroomId)
      .eq('date', date)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to fetch attendance: ${error.message}`);
    return (data || []) as DbAttendance[];
  },

  async findByClassroomId(classroomId: string): Promise<DbAttendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('date', { ascending: false });
    if (error) throw new Error(`Failed to fetch attendance: ${error.message}`);
    return (data || []) as DbAttendance[];
  },

  async findByStudentId(studentId: string, classroomId?: string): Promise<DbAttendance[]> {
    let query = supabase.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: false });
    if (classroomId) query = query.eq('classroom_id', classroomId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch student attendance: ${error.message}`);
    return (data || []) as DbAttendance[];
  },

  async upsert(records: Omit<DbAttendance, 'attendance_id' | 'created_at' | 'updated_at'>[]): Promise<DbAttendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'classroom_id,student_id,date' })
      .select();
    if (error) throw new Error(`Failed to save attendance: ${error.message}`);
    return (data || []) as DbAttendance[];
  },

  async update(attendanceId: string, updates: Partial<DbAttendance>): Promise<DbAttendance> {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('attendance_id', attendanceId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update attendance: ${error.message}`);
    return data as DbAttendance;
  },

  async getAttendancePercentage(studentId: string, classroomId: string): Promise<number> {
    const { count: totalCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('classroom_id', classroomId);
    const { count: presentCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('classroom_id', classroomId)
      .eq('status', 'present');
    if (!totalCount) return 0;
    return Math.round(((presentCount || 0) / totalCount) * 100);
  },

  async getClassroomAverageAttendance(classroomId: string): Promise<number> {
    const { count: totalCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroomId);
    const { count: presentCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroomId)
      .eq('status', 'present');
    if (!totalCount) return 0;
    return Math.round(((presentCount || 0) / totalCount) * 100);
  },

  async getAttendanceDates(classroomId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('date')
      .eq('classroom_id', classroomId)
      .order('date', { ascending: false });
    if (error) return [];
    const uniqueDates = [...new Set((data || []).map((d: { date: string }) => d.date))];
    return uniqueDates;
  },
};
