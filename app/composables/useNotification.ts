export const useNotification = () => {
  const { $notification } = useNuxtApp()
  return {
    notify: $notification.notify.bind($notification),
    remove: $notification.remove.bind($notification),
    clear: $notification.clear.bind($notification),
    notifications: $notification.notifications,
  }
}
