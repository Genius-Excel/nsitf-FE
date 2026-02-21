import { useState } from "react";
import { useGetTutorialVideo, useDismissTutorial } from "@/services/tutorial";

/**
 * Manages tutorial video display logic.
 *
 * - Calls GET /api/tutorial on every mount (no cache).
 * - The backend's `show_tutorial` flag is the single source of truth — derived
 *   directly so there is no timing gap from useEffect + state.
 * - `dismissed` state lets the user hide the modal instantly before the next
 *   API call confirms the dismissal.
 */
export function useTutorial() {
  const [dismissed, setDismissed] = useState(false);

  const { tutorialData, tutorialIsLoading, tutorialError } =
    useGetTutorialVideo();

  const { dismissTutorial: callDismissAPI, dismissIsLoading } =
    useDismissTutorial(() => {});

  // Derive directly from API data — no intermediate state, no timing gap.
  // Handle both nested { data: { video_url } } and flat { video_url } shapes.
  const videoUrl =
    tutorialData?.data?.video_url || tutorialData?.video_url || null;

  const videoTitle = tutorialData?.data?.title || tutorialData?.title || null;

  const shouldShowTutorial =
    !tutorialIsLoading &&
    !dismissed &&
    tutorialData?.show_tutorial === true &&
    !!videoUrl;

  const dismissTutorial = () => {
    setDismissed(true); // instant hide — no re-show until next page load
    callDismissAPI(); // persist on backend
  };

  return {
    videoUrl,
    videoTitle,
    shouldShowTutorial,
    dismissTutorial,
    isLoading: tutorialIsLoading,
    isDismissing: dismissIsLoading,
    error: tutorialError,
  };
}
