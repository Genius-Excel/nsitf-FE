"use client";

import React, { useState } from "react";
import { TutorialVideoModal } from "@/components/tutorial-video-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlayCircle, RefreshCcw, Trash2 } from "lucide-react";

/**
 * Testing Prototype for Tutorial Video Modal
 *
 * This page allows you to test the tutorial video feature without logging in.
 * It simulates a new user login experience.
 */
export default function TutorialPrototypePage() {
  const [showModal, setShowModal] = useState(false);
  const [dismissalCleared, setDismissalCleared] = useState(false);

  const testVideoUrl = "https://www.youtube.com/watch?v=4n4rBrs5-LY";

  const handleShowPrototype = () => {
    setShowModal(true);
    setDismissalCleared(false);
  };

  const handleClearDismissal = () => {
    // Clear all tutorial dismissal flags from localStorage
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("tutorial_dismissed_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      setDismissalCleared(true);
      console.log(
        "[Prototype] Cleared tutorial dismissal flags:",
        keysToRemove,
      );
    }
  };

  const handleResetAll = () => {
    setShowModal(false);
    setDismissalCleared(false);
    handleClearDismissal();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            Tutorial Video Feature - Testing Prototype
          </CardTitle>
          <CardDescription>
            Test the tutorial video modal that appears for new users on their
            first login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">How to Test:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>
                Click "Show Tutorial Modal" to see the modal as a new user would
              </li>
              <li>The video will start at 11 seconds (as specified)</li>
              <li>
                Test both buttons:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>
                    <strong>"Don't Show Me Again"</strong> - Dismisses
                    permanently
                  </li>
                  <li>
                    <strong>"Close"</strong> - Closes but will show again
                  </li>
                </ul>
              </li>
              <li>After dismissing, click "Clear Dismissal Flags" to reset</li>
            </ol>
          </div>

          {/* Video Info */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">Test Video Details:</h3>
            <p className="text-sm text-muted-foreground break-all">
              <strong>URL:</strong> {testVideoUrl}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Start Time:</strong> 11 seconds
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Auto-play:</strong> Enabled
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleShowPrototype} className="w-full" size="lg">
              <PlayCircle className="h-4 w-4 mr-2" />
              Show Tutorial Modal (New User Experience)
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleClearDismissal}
                variant="outline"
                size="lg"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Dismissal Flags
              </Button>

              <Button onClick={handleResetAll} variant="outline" size="lg">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Reset Everything
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {dismissalCleared && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Tutorial dismissal flags cleared! Modal will show again.
              </p>
            </div>
          )}

          {/* Technical Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
              Technical Details:
            </h3>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Modal uses shadcn/ui Dialog component</li>
              <li>• Dismissal status stored in localStorage</li>
              <li>• YouTube video embedded with autoplay and start time</li>
              <li>
                • Component supports YouTube, Vimeo, and direct video files
              </li>
              <li>
                • In production, video URL comes from backend login response
              </li>
            </ul>
          </div>

          {/* Usage Note */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Production Usage:</h3>
            <p className="text-sm text-muted-foreground">
              In production, the tutorial video modal will automatically show
              when a user logs in for the first time. The backend should include
              a{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                tutorial_video
              </code>{" "}
              field in the login response with the URL specific to the user's
              role.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* The Modal Component with Test Props */}
      {showModal && (
        <TutorialVideoModal
          testVideoUrl={testVideoUrl}
          forceShow={true}
          autoShow={true}
        />
      )}
    </div>
  );
}
