import { Application } from '~/application/application'
import { NotificationModule } from '~/application/modules/notification/notification.module'

export default defineNuxtPlugin({
  name: 'application',
  async setup() {
    const application = new Application()

    return {
      provide: {
        application,
        notification: new NotificationModule(),
      },
    }
  },
})
