import { useCallback, useState } from "react";
import { Notification } from "@/lib/types";
import { generateId } from "@/lib/utils";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const push = useCallback((type: Notification["type"], message: string) => {
    const n: Notification = { id: generateId(), type, message };
    setNotifications((s) => [...s, n]);
    return n.id;
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((s) => s.filter((n) => n.id !== id));
  }, []);

  return { notifications, push, remove, setNotifications };
};
