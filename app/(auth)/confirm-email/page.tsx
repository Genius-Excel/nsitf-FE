import EmailConfirmationFlow from "@/parts/auth/confirm-email/confirm-email_func";
import React, { Suspense } from "react";

const ConfirmEmailPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading ...</div>}>
        <EmailConfirmationFlow />
      </Suspense>
    </div>
  );
};

export default ConfirmEmailPage;
