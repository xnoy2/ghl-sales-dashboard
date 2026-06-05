type Notification = {
  id: string;
  text: string;
  createdAt: number;
};

let notifications: Notification[] = [];

export function addNotification(text: string) {
  notifications.unshift({
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now(),
  });
  // Keep last 50
  if (notifications.length > 50) notifications = notifications.slice(0, 50);
}

export function getNotifications(): Notification[] {
  return notifications.slice(0, 20);
}

export function clearNotifications() {
  notifications = [];
}
