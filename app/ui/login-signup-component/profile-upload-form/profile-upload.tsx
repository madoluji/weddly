"use client";

import { countries } from "@/app/lib/data";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createFirebaseUser, db, storage } from "../../../lib/firebase"; // Import Firebase storage
import Image from "next/image";

import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/app/providers";
import useFirebaseAuth from "@/app/hooks/useFirebaseAuth";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

const ProfileUploadForm = () => {
  const { session, status } = useAuth();
  const [uploading, setUploading] = useState(false);
  useFirebaseAuth();
  createFirebaseUser(
    session?.user.name + " " + session?.user.lastName || "",
    session?.user.email || "",
    session?.user.id || ""
  );

  interface formData {
    dob: string;
    country: string;
    streetAddress: string;
    city: string;
    state: string;
    zipPostalCode: string;
    phone: string;
    profilePicture: string;
  }

  const [formData, setFormData] = useState<formData>({
    dob: "",
    country: "",
    streetAddress: "",
    city: "",
    state: "",
    zipPostalCode: "",
    phone: "",
    profilePicture: "",
  });
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("/image1.png");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      // Create preview URL for uploaded file
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview("/images/image.png");
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview); // Clean up blob URL
    }
  };

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    setUploading(true);
    e.preventDefault();
    try {
      console.log("Submitting form data:", formData);

      if (file) {
        const fileRef = ref(storage, `profile-pictures/${file.name}`);
        await uploadBytes(fileRef, file);
        formData.profilePicture = await getDownloadURL(fileRef);
      }

      console.log("Final form data:", formData);
      const response = await fetchWithAuth("/api/profile-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const userId = session?.user.id ?? "111"; // Provide a default empty string
      // update profilePicture url in firebase db for chat
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        avatar: formData.profilePicture,
      });

      if (response.ok) {
        alert("Portfolio submitted successfully!");
        setFormData(formData);

        router.push("/signup/usermode-select");
      } else {
        alert("Error submitting portfolio.");
      }
    } catch (error) {
      console.error("An error occurred while submitting the form", error);
      alert("Error submitting portfolio.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col p-14 px-20 h-screen">
      <div className="md:w-2/3 p-10">
        <div className="md:text-5xl text-3xl">
          {" "}
          A few details to publish on your profile.
        </div>
        <p className="text-gray-600 md:text-lg text-base my-6">
          A professional photo helps you build trust with venues and vendors. To keep
          things safe and simple, they&apos;ll pay you through us—which is why
          we need your personal information.
        </p>
      </div>
      <form className="space-y-6 ml-14" onSubmit={handleSubmit}>
        <div className="flex flex-row gap-32">
          <div>
            <div className="relative  rounded-[100%]  w-[150px] h-[150px] overflow-hidden ">
              <Image
                src={preview}
                alt="Profile preview"
                width={150}
                height={150}
              />
              {file && (
                <button
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 text-sm bg-red-500 text-white rounded-full p-1"
                  type="button"
                >
                  X
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="profile-upload"
            />
            <label
              htmlFor="profile-upload"
              className="cursor-pointer border-primary-500 border-2 text-primary-500 p-3 rounded-md mt-10 inline-block"
            >
              {file ? "Change Photo" : "+ Upload Photo"}
            </label>
          </div>
          <div className=" flex flex-col gap-6">
            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-gray-700 font-medium">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="mt-1 block w-72 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
              />
            </div>
            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-gray-700 font-medium"
              >
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="mt-1 block w-96 border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
              >
                <option value="" disabled>
                  Select Country
                </option>
                {countries.map((country, index) => (
                  <option key={index} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-5 flex-wrap">
              <div>
                {/* Address Fields */}
                <div className="mb-5">
                  <label
                    htmlFor="streetAddress"
                    className="block text-gray-700  font-medium"
                  >
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    required
                    className="mt-1 block  border w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-gray-700 font-medium"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-96 border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
                  />
                </div>
              </div>
              <div>
                <div className="mb-5">
                  <label
                    htmlFor="state"
                    className="block text-gray-700 font-medium"
                  >
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="m-1 block  w-96 border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="zipPostalCode"
                    className="block text-gray-700 font-medium"
                  >
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipPostalCode"
                    name="zipPostalCode"
                    value={formData.zipPostalCode}
                    onChange={handleChange}
                    className="mt-1 block w-70 border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
                  />
                </div>
              </div>
              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-gray-700 font-medium"
                >
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+977 Enter number"
                  className="mt-1 block w-60 border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-primary-700 text-white py-2 px-4 rounded-md hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
                disabled={uploading}
              >
                {uploading ? "Publishing..." : "Publish Profile"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileUploadForm;
