import { useState, useCallback } from "react";

interface DeleteDialogState {
  userId: string;
  userName: string;
}

/**
 * Delete confirmation dialog state management
 * Encapsulates dialog open/close and user tracking
 */
export const useDeleteDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteDialogState | null>(
    null
  );

  const openDialog = useCallback((userId: string, userName: string) => {
    setDeleteState({ userId, userName });
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    // Delay reset to avoid visual glitch during close animation
    setTimeout(() => {
      setDeleteState(null);
    }, 200);
  }, []);

  return {
    isOpen,
    userId: deleteState?.userId ?? null,
    userName: deleteState?.userName ?? "",
    openDialog,
    closeDialog,
  };
};
