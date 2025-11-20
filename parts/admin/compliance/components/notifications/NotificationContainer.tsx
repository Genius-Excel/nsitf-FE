import React from "react";
import { NotificationType as N } from "./Notification";
import type { Notification } from "@/lib/types";

export const NotificationContainer: React.FC<{
  notifications: Notification[];
  onClose: (id: string) => void;
}> = ({ notifications, onClose }) => {
  if (!notifications?.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
      {notifications.map((n) => (
        <N key={n.id} notification={n} onClose={onClose} />
      ))}
    </div>
  );
};
