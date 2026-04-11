"use client";

import { countries } from "@/app/lib/data";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createFirebaseUser, db, storage } from "../../../lib/firebase";
import SafeImage from "@/app/ui/shared/SafeImage";
import { PhotoIcon } from "@heroicons/react/24/outline";

import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/app/providers";
import useFirebaseAuth from "@/app/hooks/useFirebaseAuth";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

const PHONE_PREFIX = "+977";

const ProfileUploadForm = () => {
  const { session, update: updateSession } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useFirebaseAuth();

  // Hydration guard – ensures date input only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    createFirebaseUser(
      `${session.user.name || ""} ${session.user.lastName || ""}`.trim(),
      session.user.email || "",
      session.user.id
    );
  }, [session?.user?.id, session?.user?.name, session?.user?.lastName, session?.user?.email]);

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
    phone: PHONE_PREFIX,
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

  // Phone handler – always preserves the +977 prefix
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Prevent user from deleting the prefix
    if (!value.startsWith(PHONE_PREFIX)) {
      // If the user tried to delete part of the prefix, restore it
      const digitsOnly = value.replace(/[^\d]/g, "");
      value = PHONE_PREFIX + digitsOnly;
    }

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "" >("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview("");
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
    e.preventDefault();
    setUploading(true);
    try {
      const updatedFormData = { ...formData };

      if (file) {
        const fileRef = ref(storage, `profile-pictures/${file.name}`);
        await uploadBytes(fileRef, file);
        updatedFormData.profilePicture = await getDownloadURL(fileRef);
      }

      // Ensure phone always has the prefix in the final payload
      if (!updatedFormData.phone.startsWith(PHONE_PREFIX)) {
        updatedFormData.phone = PHONE_PREFIX + updatedFormData.phone.replace(/[^\d]/g, "");
      }

      const response = await fetchWithAuth("/api/profile-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      const userId = session?.user.id ?? "111";
      const docRef = doc(db, "users", userId);
      await setDoc(
        docRef,
        { avatar: updatedFormData.profilePicture },
        { merge: true }
      );

      if (response.ok) {
        setStatusType("success");
        setStatusMessage("Portfolio submitted successfully!");
        setFormData(updatedFormData);

        await updateSession({
          profilePicture: updatedFormData.profilePicture,
        });

        router.push("/signup/usermode-select");
      } else {
        setStatusType("error");
        setStatusMessage("Error submitting portfolio. Please try again.");
      }
    } catch (error) {
      console.error("An error occurred while submitting the form", error);
      setStatusType("error");
      setStatusMessage("Error submitting portfolio. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 sm:p-10 md:p-14 lg:px-20">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
          A few details to publish on your profile.
        </h1>
        <p className="text-gray-600 md:text-lg text-base my-6">
          A professional photo helps you build trust with venues and vendors. To
          keep things safe and simple, they&apos;ll pay you through us—which is
          why we need your personal information.
        </p>
      </div>

      {/* Form */}
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12">
          {/* Left column – Photo upload */}
          <div className="flex flex-col items-center lg:items-start">
            <label
              htmlFor="profile-upload"
              className="group relative flex h-[190px] w-[190px] cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-primary-500"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-upload"
              />

              {file && preview ? (
                <>
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <SafeImage
                      src={preview}
                      alt="Profile preview"
                      width={190}
                      height={190}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-slate-900/15 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                      Change photo
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-center px-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm">
                    <PhotoIcon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">Upload Photo</div>
                  <div className="text-xs text-slate-500">
                    Add a clear headshot in JPG or PNG format.
                  </div>
                </div>
              )}
            </label>

            {file && (
              <button
                onClick={handleRemoveFile}
                className="mt-4 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
                type="button"
              >
                Remove photo
              </button>
            )}

            <p className="mt-4 max-w-[220px] text-sm text-slate-500">
              A professional photo helps you stand out and builds trust with
              venues and vendors.
            </p>
          </div>

          {/* Right column – Form fields */}
          <div className="flex flex-col gap-6">
            {/* Top row: DOB + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm text-gray-700 font-medium mb-1"
                >
                  Date of Birth *
                </label>
                {mounted ? (
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5"
                  />
                ) : (
                  <input
                    type="text"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    placeholder="YYYY-MM-DD"
                    readOnly
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 bg-gray-50"
                  />
                )}
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm text-gray-700 font-medium mb-1"
                >
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5"
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
            </div>

            {/* Street Address – full width (col-span-2 equivalent via w-full) */}
            <div>
              <label
                htmlFor="streetAddress"
                className="block text-sm text-gray-700 font-medium mb-1"
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
                className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5"
              />
            </div>

            {/* City, State, Zip – single responsive row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm text-gray-700 font-medium mb-1"
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
                  className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm text-gray-700 font-medium mb-1"
                >
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5"
                />
              </div>
              <div>
                <label
                  htmlFor="zipPostalCode"
                  className="block text-sm text-gray-700 font-medium mb-1"
                >
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  id="zipPostalCode"
                  name="zipPostalCode"
                  value={formData.zipPostalCode}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5"
                />
              </div>
            </div>

            {/* Phone Number with fixed prefix */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm text-gray-700 font-medium mb-1"
              >
                Phone *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600 font-medium select-none">
                  {PHONE_PREFIX}
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone.replace(PHONE_PREFIX, "")}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^\d]/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      phone: PHONE_PREFIX + digits,
                    }));
                  }}
                  required
                  placeholder="Enter number"
                  className="block w-full border border-gray-300 rounded-r-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2.5"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold text-base hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={uploading}
              >
                {uploading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {uploading ? "Publishing..." : "Publish Profile"}
              </button>

              {statusMessage && (
                <div
                  className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
                    statusType === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileUploadForm;
