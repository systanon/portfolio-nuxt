import type { NotificationService } from '~/application/services/client/notification.service'

export const useNotification = (): NotificationService => {
  const { $notification } = useNuxtApp()
  return $notification as NotificationService
}
