'use client';
import { useContext, useEffect } from "react";


import { useAuth } from "../providers";
import { Appcontext } from "../context/appContext";

const UserProfileLoader: React.FC = () => {
  const { session, status } = useAuth();
  const { loadUserData } = useContext(Appcontext);

  useEffect(() => {
    if (session?.user?.id) {
      loadUserData(session.user.id, {
        name: session.user.name,
        username: session.user.name,
        email: session.user.email,
        profilePicture: session.user.profilePicture,
        avatar: session.user.profilePicture,
      });
    }

  }, [session?.user?.id, loadUserData]);

  return null;
};

export default UserProfileLoader;