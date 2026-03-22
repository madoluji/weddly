"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";

interface Props {
  deliverables: string[];
  contractId: string;
  userRole: "client" | "freelancer";
  projectStatus: "ongoing" | "completed" | "revisions" | "canceled";
}

const Deliveries = ({
  deliverables: initialDeliverables,
  contractId,
  userRole,
  projectStatus,
}: Props) => {
  const [deliverables, setDeliverables] = useState<string[]>(
    initialDeliverables || []
  );
  const [newDeliverable, setNewDeliverable] = useState("");
  const [isAddDeliverableOpen, setIsAddDeliverableOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    deliverables: true,
  });

  // Sync initial deliverables from props safely
  useEffect(() => {
    if (Array.isArray(initialDeliverables)) {
      setDeliverables(initialDeliverables);
    }
  }, [initialDeliverables]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Freelancer can add deliverables if project is ongoing or in revisions
  const handleAddDeliverable = async () => {
    if (!newDeliverable.trim()) return;
    if (
      userRole !== "freelancer" ||
      (projectStatus !== "ongoing" && projectStatus !== "revisions")
    )
      return;

    const updatedDeliverables = [...deliverables, newDeliverable];
    setDeliverables(updatedDeliverables);

    try {
      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { deliveries: updatedDeliverables },
        }),
      });

      if (!response.ok) throw new Error("Failed to update deliverables");

      const data = await response.json();
      console.log("Deliverables updated successfully:", data);
      setNewDeliverable("");
      setIsAddDeliverableOpen(false);
    } catch (error) {
      console.error("Error updating deliverables:", error);
      setDeliverables(deliverables); // Revert to previous state
      alert("Failed to add deliverable. Please try again.");
    }
  };

  // Freelancer can edit deliverables if project is ongoing or in revisions
  const handleEditDeliverable = async (index: number) => {
    if (!editValue.trim()) return;
    if (
      userRole !== "freelancer" ||
      (projectStatus !== "ongoing" && projectStatus !== "revisions")
    )
      return;

    const updatedDeliverables = deliverables.map((del, i) =>
      i === index ? editValue : del
    );
    setDeliverables(updatedDeliverables);
    setEditIndex(null);

    try {
      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { deliveries: updatedDeliverables },
        }),
      });

      if (!response.ok) throw new Error("Failed to update deliverables");

      console.log("Deliverable edited successfully");
    } catch (error) {
      console.error("Error updating deliverables:", error);
      setDeliverables(deliverables); // Revert to previous state
      alert("Failed to edit deliverable. Please try again.");
    }
  };

  // Freelancer can delete deliverables if project is ongoing or in revisions
  const handleDeleteDeliverable = async (index: number) => {
    if (
      userRole !== "freelancer" ||
      (projectStatus !== "ongoing" && projectStatus !== "revisions")
    )
      return;

    const updatedDeliverables = deliverables.filter((_, i) => i !== index);
    setDeliverables(updatedDeliverables);

    try {
      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { deliveries: updatedDeliverables },
        }),
      });

      if (!response.ok) throw new Error("Failed to delete deliverable");

      console.log("Deliverable deleted successfully");
    } catch (error) {
      console.error("Error deleting deliverable:", error);
      setDeliverables(deliverables); // Revert to previous state
      alert("Failed to delete deliverable. Please try again.");
    }
  };

  const isEditable =
    userRole === "freelancer" &&
    (projectStatus === "ongoing" || projectStatus === "revisions");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => toggleSection("deliverables")}
      >
        <h2 className="text-lg font-semibold">Deliverables</h2>
        {expandedSections.deliverables ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {expandedSections.deliverables && (
        <div className="p-4">
          {/* Add Deliverable Button - Only for freelancer if ongoing or revisions */}
          {isEditable && (
            <div className="flex justify-end mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddDeliverableOpen(true);
                }}
                className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Deliverable
              </button>
            </div>
          )}
          <ul className="space-y-2">
            {deliverables.length > 0 ? (
              deliverables.map((del, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEditDeliverable(index)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleEditDeliverable(index)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-700">{del}</span>
                    )}
                  </div>
                  {/* Edit/Delete Buttons - Only for freelancer if editable */}
                  {isEditable && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditIndex(index);
                          setEditValue(del);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeliverable(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <p className="text-gray-500">No deliverables available.</p>
            )}
          </ul>
          {/* Read-only notice for completed or canceled */}
          {(projectStatus === "completed" || projectStatus === "canceled") && (
            <p className="text-sm text-gray-500 italic mt-4">
              This project is {projectStatus}. No edits allowed.
            </p>
          )}
        </div>
      )}

      {isAddDeliverableOpen && isEditable && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Add Deliverable</h3>
              <p className="text-gray-500 mt-1">
                Add a new deliverable to the project.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="deliverable"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deliverable
                </label>
                <input
                  type="text"
                  id="deliverable"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Final Design Mockup"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddDeliverableOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDeliverable}
                disabled={!newDeliverable.trim()}
                className={`px-4 py-2 rounded-md text-white font-medium text-sm ${
                  !newDeliverable.trim()
                    ? "bg-primary-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                }`}
              >
                Add Deliverable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
