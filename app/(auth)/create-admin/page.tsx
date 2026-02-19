import { CreateAdminForm } from "@/parts/create-admin";
import Image from "next/image";
import React from "react";

const CreateAdminPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background rounded-lg  border-2">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <Image
            src="/nsitf-logo.png"
            alt="NSITF Logo"
            width={64}
            height={64}
            priority
            className="object-contain"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-balance ">
            Nigerian Social Insurance Trust Fund
          </h1>
          <p className="text-muted-foreground text-balance">
            Secure access to Automated and Digital Actuarial Data Structure
          </p>
        </div>
        <CreateAdminForm />
      </div>
    </div>
  );
};

export default CreateAdminPage;
