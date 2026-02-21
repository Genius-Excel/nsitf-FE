"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { useGetTutorialVideo, useDismissTutorial } from "@/services/tutorial";

export function TutorialVideoModal() {
  const [isOpen, setIsOpen] = useState(false);

  const { tutorialData, tutorialIsLoading } = useGetTutorialVideo();

  const { dismissTutorial, dismissIsLoading } = useDismissTutorial(() => {
    setIsOpen(false);
  });

  useEffect(() => {
    if (tutorialData?.show_tutorial && tutorialData?.data?.video_url) {
      setIsOpen(true);
    }
  }, [tutorialData]);

  const handleClose = () => setIsOpen(false);

  // Build embed URL
  const getEmbedUrl = (
    url: string,
  ): { src: string; type: "youtube" | "vimeo" | "direct" } => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const id = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/,
      )?.[1];
      return {
        src: id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url,
        type: "youtube",
      };
    }
    if (url.includes("vimeo.com")) {
      const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return {
        src: id ? `https://player.vimeo.com/video/${id}?autoplay=1` : url,
        type: "vimeo",
      };
    }
    return { src: url, type: "direct" };
  };

  if (tutorialIsLoading || !isOpen || !tutorialData?.data?.video_url)
    return null;

  const { src, type } = getEmbedUrl(tutorialData.data.video_url);
  const videoTitle = tutorialData.data.title ?? "Welcome! Here's Your Tutorial";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            {videoTitle}
          </DialogTitle>
          <DialogDescription>
            Watch this quick tutorial to get started with your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
          {type === "direct" ? (
            <video
              controls
              autoPlay
              className="w-full h-full"
              preload="metadata"
            >
              <source src={src} type="video/mp4" />
              <source src={src} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              src={src}
              title="Tutorial Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="sm:flex-1"
            disabled={dismissIsLoading}
          >
            Close (Show Again Later)
          </Button>
          <Button
            onClick={dismissTutorial}
            className="sm:flex-1"
            disabled={dismissIsLoading}
          >
            {dismissIsLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {dismissIsLoading ? "Dismissing..." : "Don't Show Me Again"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
