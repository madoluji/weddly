"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { Button } from "@/app/ui/button";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { jobCategories, skills as predefinedSkills } from "@/app/lib/data";

interface ClientFormData {
  userId?: string;
  fullName: string;
  isCompany: boolean;
  industry: string[];
  companySize?: "Startup" | "Small" | "Medium" | "Large";
  location: string;
  preferredSkills: string[];
  averageBudget: number;
  rating?: number; // Default to 0, can be updated later
}

const ClientForm = () => {
  const router = useRouter();
  const { session, status } = useAuth();
  // Initial form data
  const initialFormData: ClientFormData = {
    userId: "",
    fullName: "",
    isCompany: false,
    industry: [],
    companySize: undefined,
    location: "",
    preferredSkills: [],
    averageBudget: 0,
    rating: 0,
  };

  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  // Tag input states
  const [tagInput, setTagInput] = useState<{ [key: string]: string }>({
    industry: "",
    preferredSkills: "",
  });

  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        userId: session.user.id,
        fullName: session.user.name + " " + session.user.lastName,
      }));
    }
  }, [session]);

  // Handles adding tags dynamically
  const handleTagChange = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "industry" | "preferredSkills"
  ) => {
    if (e.key === "Enter" && tagInput[field].trim()) {
      e.preventDefault();
      if (!formData[field].includes(tagInput[field].trim())) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...(prev[field] as string[]), tagInput[field].trim()],
        }));
      }
      setTagInput((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Removes a selected tag
  const removeTag = (field: "industry" | "preferredSkills", tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field].filter((t) => t !== tag)
        : prev[field],
    }));
  };

  // Filters recommendations based on input
  const filteredRecommendations = {
    industry: jobCategories.filter(
      (industry) =>
        industry.toLowerCase().includes(tagInput.industry.toLowerCase()) &&
        !formData.industry.includes(industry)
    ),
    preferredSkills: predefinedSkills.filter(
      (skill) =>
        skill.toLowerCase().includes(tagInput.preferredSkills.toLowerCase()) &&
        !formData.preferredSkills.includes(skill)
    ),
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCompanyLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let companyLogoURL = "";

      const finalFormData = {
        ...formData,
        companyLogo: companyLogoURL || null,
      };

      // Send data to API
      const response = await fetchWithAuth("/api/clientInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      if (response.ok) {
        router.push(`/client/best-matches`); // Redirect after successful registration
      } else {
        alert("Error submitting client details.");
      }
    } catch (error) {
      console.error("Error submitting client form:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto border p-6 rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Client Registration</h2>

      {/* Full Name */}
      <div>
        <label className="block font-medium">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          required
        />
      </div>

      {/* Is Company */}
      <div className="flex items-center mt-3">
        <input
          type="checkbox"
          id="isCompany"
          name="isCompany"
          checked={formData.isCompany}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="isCompany" className="font-medium">
          Registering as a Company
        </label>
      </div>

      {/* Company Size (if Company) */}
      {formData.isCompany && (
        <div className="mt-3">
          <label className="block font-medium">Company Size</label>
          <select
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select Size</option>
            <option value="Startup">Startup</option>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
        </div>
      )}

      {/* Location */}
      <div className="mt-3">
        <label className="block font-medium">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          required
        />
      </div>

      {/* Industry Selection with Tags */}
      <div className="mt-3">
        <label className="block font-medium">Preferred Industry</label>
        <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[40px]">
          {formData.industry.map((industry, index) => (
            <span
              key={index}
              className="bg-blue-200 text-blue-800 px-2 py-1 rounded-md text-sm cursor-pointer"
              onClick={() => removeTag("industry", industry)}
            >
              {industry} ✕
            </span>
          ))}
          <input
            type="text"
            value={tagInput.industry}
            onChange={(e) =>
              setTagInput({ ...tagInput, industry: e.target.value })
            }
            onKeyDown={(e) => handleTagChange(e, "industry")}
            className="border-none outline-none flex-grow"
            placeholder="Type an industry and press Enter..."
          />
        </div>

        {/* Recommended industries dropdown */}
        {tagInput.industry && filteredRecommendations.industry.length > 0 && (
          <div className="border rounded-md mt-2 p-2 bg-white shadow-md max-h-40 overflow-y-auto">
            {filteredRecommendations.industry.map((industry, index) => (
              <div
                key={index}
                className="p-1 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    industry: [...prev.industry, industry],
                  }));
                  setTagInput({ ...tagInput, industry: "" });
                }}
              >
                {industry}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferred Skills Selection with Tags */}
      <div className="mt-3">
        <label className="block font-medium">Preferred Skills</label>
        <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[40px]">
          {formData.preferredSkills.map((skill, index) => (
            <span
              key={index}
              className="bg-green-200 text-green-800 px-2 py-1 rounded-md text-sm cursor-pointer"
              onClick={() => removeTag("preferredSkills", skill)}
            >
              {skill} ✕
            </span>
          ))}
          <input
            type="text"
            value={tagInput.preferredSkills}
            onChange={(e) =>
              setTagInput({ ...tagInput, preferredSkills: e.target.value })
            }
            onKeyDown={(e) => handleTagChange(e, "preferredSkills")}
            className="border-none outline-none flex-grow"
            placeholder="Type a skill and press Enter..."
          />
        </div>

        {/* Recommended industries dropdown */}
        {tagInput.preferredSkills &&
          filteredRecommendations.preferredSkills.length > 0 && (
            <div className="border rounded-md mt-2 p-2 bg-white shadow-md max-h-40 overflow-y-auto">
              {filteredRecommendations.preferredSkills.map(
                (preferredSkills, index) => (
                  <div
                    key={index}
                    className="p-1 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        preferredSkills: [
                          ...prev.preferredSkills,
                          preferredSkills,
                        ],
                      }));
                      setTagInput({ ...tagInput, preferredSkills: "" });
                    }}
                  >
                    {preferredSkills}
                  </div>
                )
              )}
            </div>
          )}
      </div>

      {/* Average Budget */}
      <div className="mt-3">
        <label className="block font-medium">Average Budget ($)</label>
        <input
          type="number"
          name="averageBudget"
          value={formData.averageBudget}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          min={0}
        />
      </div>

      {/* Submit Button */}
      <div className="mt-5">
        <Button
          type="submit"
          className={clsx("w-full bg-blue-500 text-white py-2 rounded", {
            "opacity-50 cursor-not-allowed": uploading,
          })}
        >
          {uploading ? "Submitting..." : "Register Client"}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
