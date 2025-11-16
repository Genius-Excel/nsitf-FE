import React, { useEffect } from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import type { Notification } from "@/lib/types";

interface Props {
  notification: Notification;
  onClose: (id: string) => void;
}

export const NotificationType: React.FC<Props> = ({ notification, onClose }) => {
  const { id, message, type } = notification;

  useEffect(() => {
    const t = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(t);
  }, [id, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error": return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "info": default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success": return "bg-green-50 border-green-200 text-green-800";
      case "error": return "bg-red-50 border-red-200 text-red-800";
      case "warning": return "bg-orange-50 border-orange-200 text-orange-800";
      case "info": default: return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div role="alert" className={`p-3 rounded-lg border ${getStyles()} shadow-md max-w-md animate-slide-in-right`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={() => onClose(id)} aria-label="Close notification" className="p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
