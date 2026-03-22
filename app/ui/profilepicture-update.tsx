"use client";

import { useState, useEffect } from "react";
import { storage } from "../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { PaintBrushIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { fetchWithAuth } from "../lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";

const ProfilePictureUploader: React.FC = () => {
  const { session, status } = useAuth();
  const [currentProfilePic, setCurrentProfilePic] = useState<string | null>(
    session?.user?.profilePicture || null
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload image to Firebase and update profile
  const uploadImage = async () => {
    if (!selectedImage) {
      alert("Please select an image first!");
      return;
    }

    setUploading(true);
    const fileRef = ref(
      storage,
      `profile-pictures/${session?.user.id}/${selectedImage.name}`
    );
    const uploadTask = uploadBytesResumable(fileRef, selectedImage);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File available at:", downloadURL);

        await updateProfilePicture(downloadURL);
        setUploading(false);
        setShowModal(false);
      }
    );
  };

  // Send profile picture URL to backend
  const updateProfilePicture = async (imageUrl: string) => {
    try {
      const response = await fetchWithAuth("/api/update-profile-picture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profilePicture: imageUrl }),
      });

      if (!response.ok) throw new Error("Failed to update profile picture");

      setCurrentProfilePic(imageUrl);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Profile Picture Display */}
      <div className="relative w-32 h-32">
        <Image
          width={300}
          height={300}
          src={currentProfilePic || "/images/image.png"}
          alt="Profile"
          className="w-full h-full rounded-full border object-cover"
        />
        {/* Edit Icon */}
        <button
          onClick={() => setShowModal(true)}
          className="absolute bottom-2 right-2 bg-gray-800 p-2 rounded-full text-white"
        >
          <PaintBrushIcon className="w-5 h-5 opacity-80" />
        </button>
      </div>

      {/* Layover Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-4">
              Change Profile Picture
            </h2>

            {preview ? (
              <Image
                src={preview}
                width={300}
                height={300}
                alt="Preview"
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
            ) : (
              <p>No image selected</p>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4"
            />

            <div className="flex justify-center space-x-4">
              <button
                onClick={uploadImage}
                disabled={uploading}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUploader;
