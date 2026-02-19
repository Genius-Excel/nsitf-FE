import { useState, useEffect } from "react";
import { User } from "@/lib/auth";

const TUTORIAL_DISMISSED_PREFIX = "tutorial_dismissed_";

/**
 * Custom hook to manage tutorial video display
 * Handles checking if tutorial should show and managing dismissal state
 */
export function useTutorial() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const getUserData = (): User | null => {
      if (typeof window === "undefined") return null;

      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        return JSON.parse(userStr) as User;
      } catch (error) {
        console.error("[useTutorial] Failed to parse user data:", error);
        return null;
      }
    };

    // Check if tutorial has been dismissed for this user
    const isTutorialDismissed = (userId: string): boolean => {
      if (typeof window === "undefined") return true;

      try {
        const dismissedFlag = localStorage.getItem(
          `${TUTORIAL_DISMISSED_PREFIX}${userId}`,
        );
        return dismissedFlag === "true";
      } catch (error) {
        console.error("[useTutorial] Failed to check dismissal status:", error);
        return false;
      }
    };

    const initializeTutorial = () => {
      const user = getUserData();

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get user ID (handle different possible field names)
      const userIdentifier = user.user_id || user.id || user.email;
      setUserId(userIdentifier || null);

      // Get video URL from user data
      const tutorialVideo = (user as any).tutorial_video;

      if (tutorialVideo) {
        setVideoUrl(tutorialVideo);

        // Check if already dismissed
        if (userIdentifier) {
          const dismissed = isTutorialDismissed(userIdentifier);
          setShouldShowTutorial(!dismissed);
        } else {
          // If no user ID, show tutorial anyway
          setShouldShowTutorial(true);
        }
      } else {
        // No tutorial video for this user/role
        setShouldShowTutorial(false);
      }

      setIsLoading(false);
    };

    initializeTutorial();
  }, []);

  /**
   * Mark tutorial as dismissed for current user
   */
  const dismissTutorial = () => {
    if (!userId || typeof window === "undefined") return;

    try {
      localStorage.setItem(`${TUTORIAL_DISMISSED_PREFIX}${userId}`, "true");
      setShouldShowTutorial(false);
      console.log("[useTutorial] Tutorial dismissed for user:", userId);
    } catch (error) {
      console.error("[useTutorial] Failed to dismiss tutorial:", error);
    }
  };

  /**
   * Reset tutorial dismissal (for testing or if user wants to see again)
   */
  const resetTutorial = () => {
    if (!userId || typeof window === "undefined") return;

    try {
      localStorage.removeItem(`${TUTORIAL_DISMISSED_PREFIX}${userId}`);
      setShouldShowTutorial(true);
      console.log("[useTutorial] Tutorial reset for user:", userId);
    } catch (error) {
      console.error("[useTutorial] Failed to reset tutorial:", error);
    }
  };

  return {
    videoUrl,
    shouldShowTutorial,
    dismissTutorial,
    resetTutorial,
    isLoading,
  };
}
