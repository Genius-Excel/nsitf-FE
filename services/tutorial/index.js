import HttpService from "../httpServices";
import useMutateItem from "../useMutateItem";
import { ErrorHandler } from "../errorHandler";
import { useQuery } from "@tanstack/react-query";

const httpService = new HttpService();

/**
 * GET /api/tutorial
 * Returns: { show_tutorial: boolean, data: { title: string, video_url: string } }
 * No caching — fresh call on every dashboard mount.
 */
export const useGetTutorialVideo = () => {
  const { data, error, isPending } = useQuery({
    queryKey: ["tutorial-video"],
    queryFn: async () => {
      const res = await httpService.getData("/api/tutorial");
      console.log("[tutorial] raw axios response:", res);
      console.log("[tutorial] res.data:", res?.data);
      return res;
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnMount: true,
  });

  return {
    // Axios wraps: res.data = API body
    tutorialData: data?.data ?? null,
    tutorialError: error ? ErrorHandler(error) : null,
    tutorialIsLoading: isPending,
  };
};

/**
 * POST /api/tutorial
 * Marks the tutorial as dismissed for the current user on the backend.
 */
export const useDismissTutorial = (onSuccess) => {
  const { isPending, mutate } = useMutateItem({
    mutationFn: () => httpService.postData({}, "/api/tutorial"),
    onSuccess: (res) => {
      onSuccess?.(res?.data ?? {});
    },
  });

  return {
    dismissTutorial: () => mutate(),
    dismissIsLoading: isPending,
  };
};
