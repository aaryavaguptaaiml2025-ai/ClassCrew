import { supabase } from '../config/supabase.js';
import type { DbNotification, NotificationType } from '../types/database.js';

export const notificationRepository = {
  async findByUserId(userId: string, limit = 20): Promise<DbNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
    return (data || []) as DbNotification[];
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) return 0;
    return count || 0;
  },

  async create(notification: {
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    reference_id?: string;
    reference_type?: string;
  }): Promise<DbNotification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    return data as DbNotification;
  },

  async createBulk(notifications: {
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    reference_id?: string;
    reference_type?: string;
  }[]): Promise<void> {
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) throw new Error(`Failed to create bulk notifications: ${error.message}`);
  },

  async markAllRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw new Error(`Failed to mark notifications read: ${error.message}`);
  },

  async delete(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('notification_id', notificationId);
    if (error) throw new Error(`Failed to delete notification: ${error.message}`);
  },
};
