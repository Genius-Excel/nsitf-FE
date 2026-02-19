"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle, XCircle } from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";

interface TutorialVideoModalProps {
  /**
   * Auto-show modal on mount if tutorial hasn't been dismissed
   * Default: true
   */
  autoShow?: boolean;
  /**
   * For testing: Override video URL
   */
  testVideoUrl?: string;
  /**
   * For testing: Force show modal regardless of dismissal status
   */
  forceShow?: boolean;
}

export function TutorialVideoModal({
  autoShow = true,
  testVideoUrl,
  forceShow = false,
}: TutorialVideoModalProps) {
  const { videoUrl, shouldShowTutorial, dismissTutorial, isLoading } =
    useTutorial();

  const [isOpen, setIsOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Use test URL if provided, otherwise use real URL
  const finalVideoUrl = testVideoUrl || videoUrl;

  // Auto-show tutorial on mount if conditions are met
  useEffect(() => {
    if (
      autoShow &&
      (forceShow || shouldShowTutorial) &&
      finalVideoUrl &&
      !isLoading
    ) {
      setIsOpen(true);
    }
  }, [autoShow, shouldShowTutorial, finalVideoUrl, isLoading, forceShow]);

  const handleDontShowAgain = () => {
    dismissTutorial();
    setIsOpen(false);
  };

  const handleClose = () => {
    // Just close without dismissing - will show again next time
    setIsOpen(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  // Don't render if no video URL or already dismissed (unless forced)
  if (!finalVideoUrl || (!shouldShowTutorial && !isOpen && !forceShow)) {
    return null;
  }

  // Detect if URL is YouTube or Vimeo
  const isYouTube =
    finalVideoUrl.includes("youtube.com") || finalVideoUrl.includes("youtu.be");
  const isVimeo = finalVideoUrl.includes("vimeo.com");

  // Convert YouTube URL to embed format with start time
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
    )?.[1];
    if (!videoId) return url;

    // Add autoplay and start at 11 seconds
    return `https://www.youtube.com/embed/${videoId}?start=11&autoplay=1&rel=0`;
  };

  // Convert Vimeo URL to embed format
  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId
      ? `https://player.vimeo.com/video/${videoId}?autoplay=1`
      : url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            Welcome! Here's Your Tutorial
          </DialogTitle>
          <DialogDescription>
            Watch this quick tutorial to get started with your dashboard and
            learn about key features.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
          {videoError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Video Failed to Load
                </h3>
                <p className="text-sm text-muted-foreground">
                  We couldn't load the tutorial video. Please check your
                  internet connection or contact support.
                </p>
              </div>
            </div>
          ) : isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(finalVideoUrl)}
              title="Tutorial Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={handleVideoError}
            />
          ) : isVimeo ? (
            <iframe
              src={getVimeoEmbedUrl(finalVideoUrl)}
              title="Tutorial Video"
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onError={handleVideoError}
            />
          ) : (
            <video
              controls
              autoPlay
              className="w-full h-full"
              onError={handleVideoError}
              preload="metadata"
            >
              <source src={finalVideoUrl} type="video/mp4" />
              <source src={finalVideoUrl} type="video/webm" />
              <source src={finalVideoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="sm:flex-1">
            Close (Show Again Later)
          </Button>
          <Button onClick={handleDontShowAgain} className="sm:flex-1">
            Don't Show Me Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
