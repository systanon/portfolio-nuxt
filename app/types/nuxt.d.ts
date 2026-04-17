declare module '#app' {
  interface NuxtApp {
    $application: ClientApplication | ServerApplication
    $httpClient: HTTPClient
    $wsService?: WSService
    $notification?: NotificationService
    $syncModule?: SyncModule
  }
}

export {}
