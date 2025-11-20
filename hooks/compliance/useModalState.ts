import { useCallback, useState } from "react";

export const useModalState = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close, setIsOpen };
};
