import { notificationRepository } from '../repositories/notification.repository.js';

export const notificationService = {
  async getNotifications(userId: string) {
    const notifications = await notificationRepository.findByUserId(userId);
    const unreadCount = await notificationRepository.getUnreadCount(userId);
    return { notifications, unreadCount };
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
  },

  async delete(notificationId: string) {
    await notificationRepository.delete(notificationId);
  },
};
