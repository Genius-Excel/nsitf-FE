import DashboardPage from "@/parts/manager/dashboard";
import { TutorialVideoModal } from "@/components/tutorial-video-modal";
import React from "react";

const page = () => {
  return (
    <div>
      <TutorialVideoModal />
      <DashboardPage />
    </div>
  );
};

export default page;
