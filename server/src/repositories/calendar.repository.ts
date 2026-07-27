import { supabase } from '../config/supabase.js';
import type { DbCalendarEvent } from '../types/database.js';

export const calendarRepository = {
  async findByClassroomId(classroomId: string): Promise<DbCalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('date', { ascending: true });
    if (error) throw new Error(`Failed to fetch events: ${error.message}`);
    return (data || []) as DbCalendarEvent[];
  },

  async findById(eventId: string): Promise<DbCalendarEvent | null> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('event_id', eventId)
      .single();
    if (error || !data) return null;
    return data as DbCalendarEvent;
  },

  async create(event: Omit<DbCalendarEvent, 'event_id' | 'created_at' | 'updated_at'>): Promise<DbCalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single();
    if (error) throw new Error(`Failed to create event: ${error.message}`);
    return data as DbCalendarEvent;
  },

  async update(eventId: string, updates: Partial<DbCalendarEvent>): Promise<DbCalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('event_id', eventId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return data as DbCalendarEvent;
  },

  async delete(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('event_id', eventId);
    if (error) throw new Error(`Failed to delete event: ${error.message}`);
  },

  async findByStudentClassrooms(studentId: string): Promise<DbCalendarEvent[]> {
    const { data: memberships } = await supabase
      .from('classroom_members')
      .select('classroom_id')
      .eq('student_id', studentId);
    if (!memberships || memberships.length === 0) return [];
    const classroomIds = memberships.map((m: { classroom_id: string }) => m.classroom_id);
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*, classrooms(title)')
      .in('classroom_id', classroomIds)
      .order('date', { ascending: true });
    if (error) throw new Error(`Failed to fetch student events: ${error.message}`);
    return (data || []) as DbCalendarEvent[];
  },
};
