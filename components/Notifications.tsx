"use client";
import React, { useEffect } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Notification as NotificationType } from "@/lib/types";

interface NotificationProps {
  notification: NotificationType;
  onClose: (id: string) => void;
}

export const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  const { type, message, id } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") {
      onClose(id);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-600" aria-hidden="true" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" aria-hidden="true" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "info":
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-orange-800";
      case "info":
        return "text-blue-800";
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "text-green-600 hover:text-green-800 focus:ring-green-300";
      case "error":
        return "text-red-600 hover:text-red-800 focus:ring-red-300";
      case "warning":
        return "text-orange-600 hover:text-orange-800 focus:ring-orange-300";
      case "info":
        return "text-blue-600 hover:text-blue-800 focus:ring-blue-300";
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${getStyles()} animate-slide-in-right max-w-md`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <p className={`text-sm font-medium flex-1 ${getTextColor()}`}>
          {message}
        </p>
        <button
          onClick={() => onClose(id)}
          className={`flex-shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColor()}`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

// Notification Container
interface NotificationContainerProps {
  notifications: NotificationType[];
  onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};