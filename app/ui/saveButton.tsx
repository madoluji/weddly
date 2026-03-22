import { useState } from "react";
import { HeartIcon as Liked } from "@heroicons/react/24/solid";
import { HeartIcon as Unliked } from "@heroicons/react/24/outline";
import { fetchWithAuth } from "../lib/fetchWIthAuth";

interface SaveButtonProps {
  itemId?: string;
  saved?: boolean;
  itemType: "job" | "freelancer"; // Add itemType prop to specify the type of item
}

const SaveButton = ({ itemId, saved, itemType }: SaveButtonProps) => {
  const [isSaved, setIsSaved] = useState(saved);
  const [loading, setLoading] = useState(false); // Loading state

  const toggleSave = async () => {
    if (loading) return; // Prevent multiple clicks while loading

    setLoading(true); // Start loading
    const previousState = isSaved; // Save the previous state
    setIsSaved(!isSaved); // Optimistically update the UI

    try {
      const endpoint =
        itemType === "job" ? "/api/saveJob" : "/api/saveFreelancer";
      const response = await fetchWithAuth(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [`${itemType}Id`]: itemId }), // Dynamically set the key based on itemType
      });

      if (!response.ok) {
        throw new Error(`Error saving/unsaving ${itemType}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsSaved(previousState); // Revert to the previous state on error
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
      {isSaved ? (
        <Liked
          onClick={toggleSave}
          className={`w-6 h-6 text-red-600 absolute top-5 right-0 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        />
      ) : (
        <Unliked
          onClick={toggleSave}
          className={`w-6 h-6 absolute top-5 right-0 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        />
      )}
    </>
  );
};

export default SaveButton;
