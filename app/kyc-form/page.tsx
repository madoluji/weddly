"use client";

import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/app/lib/firebase";
import Image from "next/image";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "../providers";
import { useRouter } from "next/navigation";

const KYCForm = () => {
  const { session, status } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "Nepal",
    documentType: "citizenship",
    citizenshipNumber: "",
    passportNumber: "",
    panNumber: "",
    address: {
      province: "",
      district: "",
      municipality: "",
      wardNumber: "",
      streetAddress: "",
    },
    documents: {
      profilePicture: null as File | null,
      citizenshipFront: null as File | null,
      citizenshipBack: null as File | null,
    },
    documentUrls: {
      profilePicture: "",
      citizenshipFront: "",
      citizenshipBack: "",
    },
  });

  const [previewImages, setPreviewImages] = useState({
    profilePicture: "",
    citizenshipFront: "",
    citizenshipBack: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasPendingKYC, setHasPendingKYC] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(
          "/api/user?fields=name,lastName,email,dob,country,city,state,streetAddress,profilePicture"
        );

        if (response.ok) {
          const userData = await response.json();

          // Pre-fill form with fetched user data
          const fullName = `${userData.name || ""} ${userData.lastName || ""}`.trim();
          
          setFormData((prevData) => ({
            ...prevData,
            email: userData.email || session?.user.email || "",
            fullName: fullName,
            dateOfBirth: userData.dob || "",
            nationality: userData.country || "Nepal",
            address: {
              ...prevData.address,
              province: userData.state || "",
              district: userData.city || "",
              streetAddress: userData.streetAddress || "",
            },
          }));

          // Set profile picture preview if exists
          if (userData.profilePicture) {
            setPreviewImages((prev) => ({
              ...prev,
              profilePicture: userData.profilePicture,
            }));
            
            setFormData((prevData) => ({
              ...prevData,
              documentUrls: {
                ...prevData.documentUrls,
                profilePicture: userData.profilePicture,
              },
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session?.user?.id, session?.user?.email]);

  // Check for existing pending KYC submission
  useEffect(() => {
    const checkPendingKYC = async () => {
      try {
        const response = await fetch("/api/kyc-submit", {
          method: "GET",
        });
        // If API has GET endpoint to check status, use it
        // For now, we'll check in the submission attempt
      } catch (error) {
        console.error("Error checking KYC status:", error);
      }
    };

    if (session?.user?.id) {
      // Check is done during submit
    }
  }, [session?.user?.id]);

  // Handle text input changes for regular fields
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle text input changes for address object fields
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      address: {
        ...prevData.address,
        [name]: value,
      },
    }));
  };

  // Handle file selection and previews
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof previewImages
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prevData) => ({
        ...prevData,
        documents: { ...prevData.documents, [field]: file },
      }));

      setPreviewImages((prevPreviews) => ({
        ...prevPreviews,
        [field]: URL.createObjectURL(file),
      }));
    }
  };

  // Upload files to Firebase Storage
  const uploadFile = async (file: File, fieldName: string) => {
    try {
      const storageRef = ref(storage, `kyc/${session?.user.id}/${fieldName}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      return "";
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload new files if selected, otherwise use existing URLs
      const profilePictureUrl = formData.documents.profilePicture
        ? await uploadFile(formData.documents.profilePicture, "profilePicture")
        : formData.documentUrls.profilePicture || "";
      
      const citizenshipFrontUrl = formData.documents.citizenshipFront
        ? await uploadFile(
            formData.documents.citizenshipFront,
            "citizenshipFront"
          )
        : "";
      
      const citizenshipBackUrl = formData.documents.citizenshipBack
        ? await uploadFile(
            formData.documents.citizenshipBack,
            "citizenshipBack"
          )
        : "";

      // Prepare final submission data matching Mongoose schema
      const submissionData: any = {
        userId: session?.user.id,
        fullName: formData.fullName,
        email: session?.user.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        documentType: formData.documentType,
        address: {
          province: formData.address.province,
          district: formData.address.district,
          municipality: formData.address.municipality,
          wardNumber: formData.address.wardNumber,
          streetAddress: formData.address.streetAddress,
        },
        documents: {
          profilePicture: profilePictureUrl,
          citizenshipFront: citizenshipFrontUrl,
          citizenshipBack: citizenshipBackUrl,
        },
        status: "pending",
      };

      // Conditionally add document numbers
      if (
        formData.documentType === "citizenship" &&
        formData.citizenshipNumber
      ) {
        submissionData.citizenshipNumber = formData.citizenshipNumber;
      }
      if (formData.documentType === "passport" && formData.passportNumber) {
        submissionData.passportNumber = formData.passportNumber;
      }
      if (formData.documentType === "pan" && formData.panNumber) {
        submissionData.panNumber = formData.panNumber;
      }

      // Send data to API
      const res = await fetchWithAuth(`/api/kyc-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const resData = await res.json();

      if (res.ok) {
        setIsSubmitted(true);
        alert("KYC Submitted Successfully!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        // Check if already submitted
        if (resData.alreadySubmitted) {
          setHasPendingKYC(true);
          throw new Error(resData.message || "You already have a pending KYC submission.");
        }
        throw new Error(resData.message || "Submission failed");
      }
    } catch (error: any) {
      console.error("Error submitting KYC:", error);
      alert(error?.message || "Submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">KYC Verification</h2>
      
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your information...</p>
        </div>
      )}

      {isSubmitted && (
        <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700 font-semibold text-lg">✓ KYC Submitted Successfully!</p>
          <p className="text-green-600 mt-2">Your submission is pending admin review. You will be redirected shortly.</p>
        </div>
      )}

      {!isLoading && !isSubmitted && hasPendingKYC && (
        <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-300 mb-6">
          <p className="text-yellow-800 font-semibold">⚠ You already have a pending KYC submission</p>
          <p className="text-yellow-700 text-sm mt-2">You can resubmit after 24 hours. Please wait for admin verification.</p>
        </div>
      )}

      {!isLoading && !isSubmitted && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div>
            <label className="block text-gray-700">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Nationality *</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Document Type Selection */}
          <div>
            <label className="block text-gray-700">Document Type *</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="citizenship">Citizenship</option>
              <option value="passport">Passport</option>
              <option value="pan">PAN</option>
            </select>
          </div>

          {/* Conditionally Render Document Number Input */}
          {formData.documentType === "citizenship" && (
            <div>
              <label className="block text-gray-700">Citizenship Number *</label>
              <input
                type="text"
                name="citizenshipNumber"
                value={formData.citizenshipNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
          )}
          {formData.documentType === "passport" && (
            <div>
              <label className="block text-gray-700">Passport Number *</label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
          )}
          {formData.documentType === "pan" && (
            <div>
              <label className="block text-gray-700">PAN Number *</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
          )}

          {/* Address Details */}
          <div>
            <label className="block text-gray-700">Province *</label>
            <input
              type="text"
              name="province"
              value={formData.address.province}
              onChange={handleAddressChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">District *</label>
              <input
                type="text"
                name="district"
                value={formData.address.district}
                onChange={handleAddressChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Municipality *</label>
              <input
                type="text"
                name="municipality"
                value={formData.address.municipality}
                onChange={handleAddressChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Ward Number *</label>
              <input
                type="number"
                name="wardNumber"
                value={formData.address.wardNumber}
                onChange={handleAddressChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Street Address *</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.address.streetAddress}
                onChange={handleAddressChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          {/* File Upload Section with Preview */}
          <div className="grid grid-cols-3 gap-4">
            {["profilePicture", "citizenshipFront", "citizenshipBack"].map(
              (field) => (
                <div key={field} className="text-center">
                  <label className="block text-gray-700">
                    {field === "profilePicture"
                      ? "Profile Picture *"
                      : field === "citizenshipFront"
                        ? "Citizenship Front *"
                        : "Citizenship Back *"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, field as any)}
                    required={!previewImages[field as keyof typeof previewImages]}
                  />
                  {previewImages[field as keyof typeof previewImages] && (
                    <Image
                      src={previewImages[field as keyof typeof previewImages]}
                      alt={`${field} Preview`}
                      width={100}
                      height={100}
                      className="mt-2 rounded-md"
                    />
                  )}
                </div>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={uploading || hasPendingKYC}
            className={`w-full py-2 rounded-md text-white font-semibold ${
              uploading || hasPendingKYC
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            title={hasPendingKYC ? "You already have a pending KYC submission. Please wait 24 hours to resubmit." : ""}
          >
            {uploading ? "Uploading..." : hasPendingKYC ? "Resubmit after 24 hours" : "Submit KYC"}
          </button>
        </form>
      )}
    </div>
  );
};

export default KYCForm;
