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
}

export function getNotifications() {
  return notifications.slice(0, 10);
}