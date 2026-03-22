"use client";

import {
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/app/lib/firebase";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface FileItem {
  _id?: string; // Added for potential ID-based updates
  file_name: string;
  url: string;
  uploaded_at: string | Date;
}

interface Props {
  files: FileItem[];
  contractId: string;
  userRole: "client" | "freelancer";
  projectStatus?: "ongoing" | "completed" | "revisions" | "canceled";
}

const FileSection = ({
  files: initialFiles,
  contractId,
  userRole,
  projectStatus,
}: Props) => {
  const [files, setFiles] = useState<FileItem[]>(initialFiles || []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [expandedSections, setExpandedSections] = useState({ files: true });

  // Sync initial files from props to local state
  useEffect(() => {
    console.log("Initial files from props:", initialFiles);
    setFiles(initialFiles);
  }, [initialFiles]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Freelancer can upload files if project is ongoing or in revisions
  const handleUploadFile = async () => {
    if (
      !selectedFile ||
      userRole !== "freelancer" ||
      (projectStatus !== "ongoing" && projectStatus !== "revisions")
    )
      return;

    setIsUploading(true);

    try {
      const fileRef = ref(
        storage,
        `project_files/${contractId}/${selectedFile.name}`
      );
      await uploadBytes(fileRef, selectedFile);
      const fileUrl = await getDownloadURL(fileRef);

      const newFile: FileItem = {
        file_name: selectedFile.name,
        url: fileUrl,
        uploaded_at: new Date().toISOString(),
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);

      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { project_files: updatedFiles },
        }),
      });

      if (!response.ok) throw new Error("Failed to update project files");

      const data = await response.json();
      console.log("Project files updated successfully:", data);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file or updating project:", error);
      setFiles(files); // Revert on failure
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Freelancer can edit file names if project is ongoing or in revisions
  const handleEditFile = async (index: number) => {
    if (
      !editFileName.trim() ||
      userRole !== "freelancer" ||
      (projectStatus !== "ongoing" && projectStatus !== "revisions")
    )
      return;

    const updatedFiles = files.map((file, i) =>
      i === index ? { ...file, file_name: editFileName } : file
    );
    setFiles(updatedFiles);
    setEditIndex(null);

    try {
      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { project_files: updatedFiles },
        }),
      });

      if (!response.ok) throw new Error("Failed to update project files");

      console.log("File name updated successfully");
    } catch (error) {
      console.error("Error updating file name:", error);
      setFiles(files); // Revert on failure
      alert("Failed to edit file name. Please try again.");
    }
  };

  // Freelancer can delete files if project is ongoing or in revisions
  const handleDeleteFile = async (index: number) => {
    if (
      userRole !== "freelancer" ||
      (projectStatus !== "ongoing" && projectStatus !== "revisions")
    )
      return;

    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);

    try {
      const response = await fetchWithAuth("/api/project-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          updates: { project_files: updatedFiles },
        }),
      });

      if (!response.ok) throw new Error("Failed to delete file");

      console.log("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      setFiles(files); // Revert on failure
      alert("Failed to delete file. Please try again.");
    }
  };

  // Download file (available to both client and freelancer)
  const handleDownloadFile = (file: FileItem) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isEditable =
    userRole === "freelancer" &&
    (projectStatus === "ongoing" || projectStatus === "revisions");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => toggleSection("files")}
      >
        <h2 className="text-lg font-semibold">Project Files</h2>
        {expandedSections.files ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </div>
      {expandedSections.files && (
        <div className="p-4">
          {/* Upload File - Only for freelancer if ongoing or revisions */}
          {isEditable && (
            <div className="flex justify-end mb-4">
              <label
                htmlFor="file-upload"
                className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center cursor-pointer"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add File
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          )}
          {selectedFile && isEditable && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Selected file: {selectedFile.name}
              </p>
              <button
                onClick={handleUploadFile}
                disabled={isUploading}
                className={`mt-2 px-4 py-2 rounded-md text-white font-medium text-sm ${
                  isUploading
                    ? "bg-primary-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                }`}
              >
                {isUploading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          )}
          <ul className="space-y-2">
            {files.length > 0 ? (
              files.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editFileName}
                        onChange={(e) => setEditFileName(e.target.value)}
                        onBlur={() => handleEditFile(index)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleEditFile(index)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        autoFocus
                      />
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {file.file_name}
                      </a>
                    )}
                    <span className="ml-2 text-sm text-gray-500">
                      (Uploaded:{" "}
                      {typeof file.uploaded_at === "string"
                        ? new Date(file.uploaded_at).toLocaleDateString()
                        : file.uploaded_at.toLocaleDateString()}
                      )
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {/* Download Button - Available to both */}
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    {/* Edit/Delete Buttons - Only for freelancer if editable */}
                    {isEditable && (
                      <>
                        <button
                          onClick={() => {
                            setEditIndex(index);
                            setEditFileName(file.file_name);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No files available.</p>
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
    </div>
  );
};

export default FileSection;
