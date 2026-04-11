'use client';
import { useContext, useEffect } from "react";


import { useAuth } from "../providers";
import { Appcontext } from "../context/appContext";

const UserProfileLoader: React.FC = () => {
  const { session, status } = useAuth();
  const { loadUserData } = useContext(Appcontext);

  useEffect(() => {
    if (session?.user?.id) {
      loadUserData(session.user.id);
    }

  }, [session?.user?.id, loadUserData]);

  return null;
};

export default UserProfileLoader;