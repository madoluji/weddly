"use client";

import {
  CloudArrowUpIcon,
  PaperClipIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles([...files, ...selectedFiles]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      setFiles([...files, ...droppedFiles]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileRemove = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const handleFileSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-sm">
      <div className="border-b border-[#efe5d6] px-5 py-5 sm:px-6">
        <p className="text-2xl font-semibold text-slate-900">Cover letter</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Help the client understand your style, experience, and why you are a
          strong fit for this event.
        </p>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Introduce your approach, highlight relevant wedding experience, and explain how you would make this event memorable."
            className={`min-h-[220px] w-full resize-y rounded-[1.5rem] border bg-[#fffdfa] p-5 text-base leading-7 text-slate-700 outline-none transition ${
              isSubmitted && !coverLetter.trim()
                ? "border-red-400 ring-2 ring-red-100"
                : "border-[#e6dccd] focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            }`}
          />

          <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-slate-500">
              Aim for a concise message that feels personal and specific to the
              gig.
            </span>
            <span className="font-medium text-slate-400">
              {coverLetter.trim().length} characters
            </span>
          </div>

          {isSubmitted && !coverLetter.trim() && (
            <p className="mt-3 text-sm text-red-500">
              Cover letter is required.
            </p>
          )}
        </div>

        <div
          className="rounded-[1.5rem] border-2 border-dashed border-[#d8c9ad] bg-[#fffaf2] p-6 text-center transition hover:border-primary-300 hover:bg-white"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleFileSelectClick}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm">
            <CloudArrowUpIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-900">
            Add supporting files
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Drag and drop files here, or click to browse your device.
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>

        {files.length > 0 && (
          <ul className="grid gap-3">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#efe5d6] bg-[#fffdfa] px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-primary-700 shadow-sm">
                    <PaperClipIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  onClick={() => handleFileRemove(file.name)}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CoverLetter;
