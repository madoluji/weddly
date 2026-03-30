"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

const WEDDING_STYLES = [
  "Traditional",
  "Modern",
  "Rustic",
  "Minimalist",
  "Bohemian",
  "Glamorous",
  "Vintage",
  "Destination",
];

interface ClientFormData {
  userId?: string;
  fullName: string;
  isWeddingPlanner: boolean;
  weddingStyle: string;
  targetWeddingDate: string;
  location: string;
  averageBudget: number;
}

const ClientForm = () => {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);

  const initialFormData: ClientFormData = {
    userId: "",
    fullName: "",
    isWeddingPlanner: false,
    weddingStyle: "",
    targetWeddingDate: "",
    location: "",
    averageBudget: 0,
  };

  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [uploading, setUploading] = useState(false);

  // Hydration guard for date input
  useEffect(() => {
    setMounted(true);
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (session) {
      const dateParam = searchParams.get("date") || "";
      const budgetParam = searchParams.get("budget") || "";

      // Map budget range string to a numeric value
      const budgetMap: Record<string, number> = {
        "Under $10,000": 10000,
        "$10,000 – $25,000": 25000,
        "$25,000 – $50,000": 50000,
        "$50,000 – $100,000": 100000,
        "$100,000+": 150000,
      };

      setFormData((prev) => ({
        ...prev,
        userId: session.user.id,
        fullName: `${session.user.name || ""} ${session.user.lastName || ""}`.trim(),
        ...(dateParam && { targetWeddingDate: dateParam }),
        ...(budgetParam && budgetMap[budgetParam] && { averageBudget: budgetMap[budgetParam] }),
      }));
    }
  }, [session, searchParams]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Use the ID from the URL params
      const finalFormData = {
        ...formData,
        userId: params.id || formData.userId,
      };

      const response = await fetchWithAuth("/api/clientInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      if (response.ok) {
        router.push(`/client/best-matches`);
      } else {
        alert("Error submitting client details.");
      }
    } catch (error) {
      console.error("Error submitting client form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto p-8 rounded-2xl bg-white shadow-lg border border-gray-100"
    >
      {/* Step indicator */}
      <p className="text-sm font-medium text-primary-500 tracking-wide mb-1">
        Step 2 of 2
      </p>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Tell us about your <span className="text-primary-500">Big Day</span>
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Just a few details so we can match you with the perfect vendors.
      </p>

      <div className="flex flex-col gap-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, Country"
            className="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
            required
          />
        </div>

        {/* Wedding Planner Checkbox */}
        <div className="flex items-center gap-3 p-3 bg-primary-100 rounded-lg">
          <input
            type="checkbox"
            id="isWeddingPlanner"
            name="isWeddingPlanner"
            checked={formData.isWeddingPlanner}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <label
            htmlFor="isWeddingPlanner"
            className="text-sm font-medium text-gray-700 select-none cursor-pointer"
          >
            Planning on behalf of a couple (Wedding Planner)
          </label>
        </div>

        {/* Wedding Style */}
        <div>
          <label
            htmlFor="weddingStyle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Wedding Style <span className="text-red-400">*</span>
          </label>
          <select
            id="weddingStyle"
            name="weddingStyle"
            value={formData.weddingStyle}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="" disabled>
              Choose a style
            </option>
            {WEDDING_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* Target Wedding Date */}
        <div>
          <label
            htmlFor="targetWeddingDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Target Wedding Date <span className="text-red-400">*</span>
          </label>
          {mounted ? (
            <input
              type="date"
              id="targetWeddingDate"
              name="targetWeddingDate"
              value={formData.targetWeddingDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          ) : (
            <input
              type="text"
              id="targetWeddingDate"
              name="targetWeddingDate"
              value={formData.targetWeddingDate}
              placeholder="YYYY-MM-DD"
              readOnly
              className="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm bg-gray-50"
            />
          )}
        </div>

        {/* Average Budget */}
        <div>
          <label
            htmlFor="averageBudget"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Average Budget ($)
          </label>
          <input
            type="number"
            id="averageBudget"
            name="averageBudget"
            value={formData.averageBudget}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
            min={0}
            placeholder="e.g. 15000"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-[#2f5f4a] text-white py-3 px-6 rounded-lg font-semibold text-base hover:bg-[#265040] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            {uploading ? "Submitting..." : "Continue"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClientForm;
