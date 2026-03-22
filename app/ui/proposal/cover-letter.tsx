"use client";

import { PaperClipIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, { useRef } from "react";

interface CoverLetterProps {
  coverLetter: string;
  setCoverLetter: (value: string) => void;
  isSubmitted: boolean;
  files: File[];
  setFiles: (files: File[]) => void;
}


const CoverLetter = ({
  coverLetter,
  setCoverLetter,
  isSubmitted,
  files,
  setFiles,
}: CoverLetterProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference to hidden file input

  // Handles file selection via input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles([...files, ...selectedFiles]);
    }
  };

  // Handles drag-and-drop file selection
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      setFiles([...files, ...droppedFiles]);
    }
  };

  // Prevents default drag behavior
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Handles file removal
  const handleFileRemove = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  // Triggers the hidden file input on click
  const handleFileSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="border-[1px] border-gray-300 rounded-xl p-6 w-full bg-white">
      <p className="font-semibold text-2xl mb-4">Cover Letter</p>

      <textarea
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        placeholder="Write your cover letter here..."
        className={`border p-3 rounded-md w-full h-32 resize-none text-lg ${
          isSubmitted && !coverLetter.trim()
            ? "border-red-500"
            : "border-gray-300"
        }`}
      />

      {isSubmitted && !coverLetter.trim() && (
        <p className="text-red-500 text-sm mt-1">Cover letter is required.</p>
      )}

      {/* Drag-and-Drop + Click File Upload Section */}
      <div
        className="border-dashed border-2 border-gray-300 rounded-lg p-4 mt-4 text-center cursor-pointer hover:bg-gray-100"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleFileSelectClick} // Clicking the area triggers file input
      >
        <p className="text-gray-500">
          Drag & Drop files here, or click to upload
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef} // Hidden file input reference
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <ul className="mt-3 text-sm text-gray-600">
          {files.map((file) => (
            <li key={file.name} className="flex gap-2 items-center">
              <PaperClipIcon className="h-5 w-5" />
              <span>{file.name}</span>
              <button
                className="text-red-500 hover:underline"
                onClick={() => handleFileRemove(file.name)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CoverLetter;
