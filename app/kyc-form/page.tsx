"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/app/lib/firebase";
import Image from "next/image";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "../providers";

const KYCForm = () => {
  const { session, status } = useAuth();
  const [uploading, setUploading] = useState(false);

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
      // Upload files and get download URLs
      const profilePictureUrl = formData.documents.profilePicture
        ? await uploadFile(formData.documents.profilePicture, "profilePicture")
        : "";
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

      if (res.ok) {
        alert("KYC Submitted Successfully!");
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">KYC Verification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div>
          <label className="block text-gray-700">Full Name *</label>
          <input
            type="text"
            name="fullName"
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
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-gray-700">Gender *</label>
          <select
            name="gender"
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
              type="text"
              name="wardNumber"
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
                  required
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
          disabled={uploading}
          className="w-full bg-blue-500 text-white py-2 rounded-md"
        >
          {uploading ? "Uploading..." : "Submit KYC"}
        </button>
      </form>
    </div>
  );
};

export default KYCForm;
