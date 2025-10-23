import UserProfileFlow from "@/parts/admin/user-profile/userProfile_func";
import React, { Suspense } from "react";

const UserProfilePage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading ...</div>}>
        <UserProfileFlow />
      </Suspense>
    </div>
  );
};

export default UserProfilePage;
