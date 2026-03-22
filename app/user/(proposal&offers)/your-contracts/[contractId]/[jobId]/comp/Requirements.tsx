"use client";

import {
  ChevronUpIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface Props {
  requirements?: string[]; // Allow undefined
  contractId: string; // Required for PATCH requests
  userRole: "client" | "freelancer"; // To restrict editing
  projectStatus?: "ongoing" | "completed" | "revisions" | "canceled"; // To restrict editing
}

const Requirements = ({
  requirements = [],
  contractId,
  userRole,
  projectStatus,
}: Props) => {
  const [expandedSections, setExpandedSections] = useState({
    requirements: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequirements, setEditedRequirements] =
    useState<string[]>(requirements);
  const [newRequirement, setNewRequirement] = useState("");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const canEdit =
    userRole === "client" &&
    (projectStatus === "ongoing" || projectStatus === "revisions");

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setEditedRequirements([...editedRequirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const handleEditRequirement = (index: number, value: string) => {
    const updated = [...editedRequirements];
    updated[index] = value;
    setEditedRequirements(updated);
  };

  const handleRemoveRequirement = (index: number) => {
    setEditedRequirements(editedRequirements.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { requirements: editedRequirements },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update requirements");
      }

      setIsEditing(false);
      // No need to update local state here; assume parent component refreshes data
    } catch (error: any) {
      console.error("Error updating requirements:", error);
      alert(`Failed to save requirements: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setEditedRequirements(requirements); // Revert to original
    setNewRequirement("");
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => toggleSection("requirements")}
      >
        <h2 className="text-lg font-semibold">Project Requirements</h2>
        {expandedSections.requirements ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </div>
      {expandedSections.requirements && (
        <div className="p-4">
          {isEditing ? (
            <div className="space-y-3">
              {/* Editable Requirements List */}
              {editedRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) =>
                      handleEditRequirement(index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter requirement"
                  />
                  <button
                    onClick={() => handleRemoveRequirement(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {/* Add New Requirement */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add new requirement"
                />
                <button
                  onClick={handleAddRequirement}
                  className="text-primary-600 hover:text-primary-800"
                  disabled={!newRequirement.trim()}
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              {/* Save/Cancel Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400"
                  disabled={
                    editedRequirements.length === 0 ||
                    editedRequirements.some((r) => !r.trim())
                  }
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {requirements.length > 0 ? (
                <ul className="space-y-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  No requirements specified.
                </p>
              )}
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 mt-4"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit Requirements
                </button>
              )}
              {!canEdit &&
                projectStatus !== "completed" &&
                projectStatus !== "canceled" && (
                  <p className="text-gray-500 italic mt-2">
                    Only the client can edit requirements.
                  </p>
                )}
            </div>
          )}
          {(projectStatus === "completed" || projectStatus === "canceled") && (
            <p className="text-gray-500 italic mt-2">
              This project is {projectStatus}. Requirements can no longer be
              edited.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Requirements;
