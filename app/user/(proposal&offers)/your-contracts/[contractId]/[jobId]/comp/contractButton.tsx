"use client";

import React from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface ButtonProps {
  action: "completed" | "revisions" | "canceled" | "withdraw"; // Added "withdraw"
  contractId: string;
  userRole: "client" | "freelancer";
  projectStatus?: "ongoing" | "completed" | "revisions" | "canceled";
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  action,
  contractId,
  userRole,
  projectStatus,
  onSuccess,
  onError,
  disabled = false,
  children,
  className = "",
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  // Determine if the action is allowed based on role and current status
  const isActionAllowed = () => {
    // No changes allowed if already completed or canceled
    if (projectStatus === "completed" || projectStatus === "canceled")
      return false;

    // Freelancer-specific actions
    if (userRole === "freelancer") {
      if (action === "revisions" && projectStatus === "ongoing") return true;
      if (action === "withdraw" && projectStatus === "revisions") return true;
      if (action === "canceled") return true;
      return false;
    }

    // Client-specific actions
    if (userRole === "client") {
      if (action === "completed") return true; // Client can complete from any non-final state
      if (action === "canceled") return true;
      return false;
    }

    return false;
  };

  // Styles based on action type
  const baseStyles =
    "px-4 py-2 rounded-md text-white font-medium text-sm focus:outline-none";
  const actionStyles =
    action === "completed"
      ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400" // Green for completed
      : action === "revisions"
        ? "bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400" // Blue for revisions
        : action === "withdraw"
          ? "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400" // Yellow for withdraw
          : "bg-red-600 hover:bg-red-700 disabled:bg-red-400"; // Red for canceled
  const combinedStyles = `${baseStyles} ${actionStyles} ${className} ${
    disabled || isLoading || !isActionAllowed() ? "cursor-not-allowed" : ""
  }`;

  // Default text based on action
  const defaultText =
    action === "completed"
      ? "Mark as Completed"
      : action === "revisions"
        ? "Request Revisions"
        : action === "withdraw"
          ? "Withdraw Submission"
          : "Cancel Project";

  const handleAction = async () => {
    if (isLoading || disabled || !isActionAllowed()) return;

    setIsLoading(true);

    try {
      const endpoint = "/api/project-details";
      const updates = {
        status: action === "withdraw" ? "ongoing" : action, // "withdraw" reverts to "ongoing"
      };

      const response = await fetchWithAuth(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to update project status to ${action}`
        );
      }

      const data = await response.json();
      console.log(
        `Project status updated to ${updates.status} successfully:`,
        data
      );

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Error updating project status to ${action}:`, error);
      if (onError) {
        onError(error instanceof Error ? error : new Error("Unknown error"));
      }

      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      alert(`Failed to update project status to ${action}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAction}
      disabled={disabled || isLoading || !isActionAllowed()}
      className={combinedStyles}
      title={
        !isActionAllowed()
          ? userRole === "freelancer" && action === "completed"
            ? "Only clients can mark the project as completed"
            : userRole === "client" &&
                (action === "revisions" || action === "withdraw")
              ? "Only freelancers can request revisions or withdraw submissions"
              : userRole === "freelancer" &&
                  action === "withdraw" &&
                  projectStatus !== "revisions"
                ? "Can only withdraw submission when in revisions status"
                : `Cannot ${action} project in ${projectStatus} status`
          : undefined
      }
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
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
              d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
            />
          </svg>
          {action === "completed"
            ? "Completing..."
            : action === "revisions"
              ? "Requesting..."
              : action === "withdraw"
                ? "Withdrawing..."
                : "Canceling..."}
        </span>
      ) : (
        children || defaultText
      )}
    </button>
  );
};

export default Button;
