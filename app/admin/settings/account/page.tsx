import ChangePasswordForm from "@/app/ui/admin-components/login-component/change-password-form";
import ProfilePictureUploader from "@/app/ui/profilepicture-update";
import React from "react";

const page = () => {
  return (
    <div className="flex items-center justify-center gap-2 mx-5 h-screen">
      <ProfilePictureUploader /> <ChangePasswordForm />
    </div>
  );
};

export default page;
