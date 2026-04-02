"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import dynamic from "next/dynamic";

import { useRouter } from "next/navigation";
import { Button } from "../button";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase"; // Import Firebase storage
import SafeImage from "@/app/ui/shared/SafeImage";
import useFirebaseAuth from "@/app/hooks/useFirebaseAuth";
import clsx from "clsx";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { skills as predefinedSkills } from "@/app/lib/data";
import {
  type JobLocation,
  getLocationDisplay,
  toLocationPayload,
} from "@/app/lib/jobLocation";

const JobLocationPicker = dynamic(
  () => import("@/app/ui/maps/JobLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
        Loading map...
      </div>
    ),
  }
);

const DetailsForm = () => {
  type FormDataState = {
    title: string;
    type: string;
    experience: string;
    budget: string;
    description: string;
    tags: string[];
    location: JobLocation | null;
    locationText: string;
    fileUrls: string[];
  };

  const router = useRouter();
  const [step, setStep] = useState(0);
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const initialFormData: FormDataState = {
    title: "",
    type: "",
    experience: "",
    budget: "",
    description: "",
    tags: [],
    location: null,
    locationText: "",
    fileUrls: [],
  };

  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [files, setFiles] = useState<File[]>([]); // Store file data
  const [uploading, setUploading] = useState<boolean>(false); // State for file upload

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files); // Convert FileList to an array
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Removes a selected tag
  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: Array.isArray(prev.tags)
        ? prev.tags.filter((t) => t !== tag)
        : prev.tags,
    }));
  };

  useFirebaseAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setUploading(true);

      // Upload the files to Firebase Storage
      const fileUrls: string[] = [];
      for (const file of files) {
        const fileRef = ref(storage, `jobs-images/${file.name}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        fileUrls.push(fileUrl);
      }

      const payload = {
        ...formData,
        location: formData.location ? toLocationPayload(formData.location) : null,
        locationText: formData.locationText,
        fileUrls,
      };

      const response = await fetchWithAuth("/api/post-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Form submitted successfully");
        setFormData(initialFormData); // Reset form data to initial state
        router.push("/client/best-matches");
      } else {
        console.error("Form submission failed");
        setUploading(false);
      }
    } catch (error) {
      console.error("An error occurred while submitting the form", error);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-5 flex-col w-1/2">
      {step === 0 && (
        <>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Ocassion Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Choose Job Type</option>
              <option value="Engagement (Wagdan)">Engagement (Wagdan)</option>
              <option value="Pre-Wedding">Pre-Wedding</option>
              <option value="Haldi">Haldi</option>
              <option value="Mehendi">Mehendi</option>
              <option value="Sangeet">Sangeet</option>
              <option value="Wedding Day (Janti & Bibaha)">Wedding Day (Janti & Bibaha)</option>
              <option value="Reception">Reception</option>
              <option value="Post-Wedding (Mukh Herne)">Post-Wedding (Mukh Herne)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="experience"
              className="block text-sm font-medium text-gray-700"
            >
              Experience Level <span className="text-red-500">*</span>
            </label>
            <select
              name="experience"
              id="experience"
              value={formData.experience}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select experience level</option>
              <option value="Entry">Entry</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="flex justify-between">
            <Button
              className="text-white disabled cursor-not-allowed opacity-50"
              disabled
            >
              Back
            </Button>
            <Button 
               type="button"
               onClick={nextStep} 
               className={clsx("text-white", {
                 "opacity-50 cursor-not-allowed": !formData.title.trim() || !formData.type || !formData.experience
               })}
               disabled={!formData.title.trim() || !formData.type || !formData.experience}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-medium text-gray-700"
            >
              Budget ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="budget"
              id="budget"
              value={formData.budget}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          {/* <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700"
            >
              Skills Required
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags.join(", ")}
              onChange={handleChangeArray}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div> */}

          <div className="mt-3">
            <label className="block font-medium">Preferred Skills <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[40px]">
              {formData.tags.map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-200 text-green-800 px-2 py-1 rounded-md text-sm cursor-pointer"
                  onClick={() => removeTag(skill)}
                >
                  {skill} ✕
                </span>
              ))}
              <select
                value=""
                onChange={(e) => {
                  const skill = e.target.value;
                  if (skill && !formData.tags.includes(skill)) {
                    setFormData((prev) => ({
                      ...prev,
                      tags: [...(prev.tags as string[]), skill],
                    }));
                  }
                }}
                className="border-none outline-none flex-grow bg-transparent text-sm min-w-[200px]"
              >
                <option value="" disabled>
                  Select a skill...
                </option>
                {predefinedSkills
                  .filter((skill) => !formData.tags.includes(skill))
                  .map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" onClick={prevStep} className="text-white">
              Back
            </Button>
            <Button 
               type="button"
               onClick={nextStep} 
               className={clsx("text-white", {
                 "opacity-50 cursor-not-allowed": !formData.budget.trim() || !formData.description.trim() || formData.tags.length === 0
               })}
               disabled={!formData.budget.trim() || !formData.description.trim() || formData.tags.length === 0}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div>
            <label
              htmlFor="locationText"
              className="block text-sm font-medium text-gray-700"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Search a place, use your current location, or click on the map to pin the venue.
            </p>

            <JobLocationPicker
              value={formData.location}
              onChange={(location) => {
                setFormData((prev) => ({
                  ...prev,
                  location,
                  locationText: getLocationDisplay(location, ""),
                }));
              }}
            />

            <div className="mt-3">
              <label
                htmlFor="locationText"
                className="block text-sm font-medium text-gray-700"
              >
                Selected Address
              </label>
              <input
                type="text"
                name="locationText"
                id="locationText"
                required
                value={formData.locationText}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                placeholder="Address will appear here after pinning"
              />
            </div>

            {formData.location && (
              <p className="mt-2 text-xs text-gray-600">
                Coordinates: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <Button type="button" onClick={prevStep} className="text-white">
              Back
            </Button>
            <Button 
               type="button"
               onClick={nextStep} 
               className={clsx("text-white", {
                 "opacity-50 cursor-not-allowed": !formData.location || !formData.locationText.trim()
               })}
               disabled={!formData.location || !formData.locationText.trim()}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Files
            </label>
            <p className="text-xs text-gray-500 mb-2 mt-1">
              Add inspirational photos, moodboards, or references to help vendors understand your vision.
            </p>
            <input
              type="file"
              name="file"
              id="file"
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
            {/* Preview selected files */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Files
              </h3>
              <div className="flex gap-2 mt-2">
                {files.map((file, index) => (
                  <div key={index} className="relative">
                    <SafeImage
                      src={URL.createObjectURL(file)} // Preview image using Object URL
                      alt={file.name}
                      className="h-20 w-20 object-cover rounded-md"
                      width={80}
                      height={80}
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-0 right-0 p-1"
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <Button type="button" onClick={prevStep} className="text-white">
                Back
              </Button>
              <Button
                type="submit"
                className={clsx("text-white bg-primary-500", {
                  "bg-neutral-400 opacity-50 cursor-not-allowed": uploading,
                })}
                success={true}
                disabled={uploading}
              >
                Submit
              </Button>
            </div>
          </div>
        </>
      )}
    </form>
  );
};

export default DetailsForm;
