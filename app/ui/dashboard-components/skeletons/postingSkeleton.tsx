import React from "react";

// Define the types for the props of SkeletonBlock
interface SkeletonBlockProps {
  width?: string;
  marginBottom?: string;
}

// SkeletonBlock: Reusable component for rendering each skeleton line with customizable width and margin
const SkeletonBlock = ({ width, marginBottom }: SkeletonBlockProps) => (
  <div
    className={`h-3 bg-gray-200 rounded-full dark:bg-slate-200 ${width} ${marginBottom}`}
  ></div>
);

// SkeletonGroup: A group of skeleton blocks arranged in a flex column, representing a section of the skeleton
const SkeletonGroup = () => (
  <div className="flex flex-col gap-4">
    {/* SkeletonBlock with specific width and margin for visual consistency */}
    <SkeletonBlock width="w-48" marginBottom="mb-4" />
    <SkeletonBlock width="max-w-[600px]" marginBottom="mb-2.5" />
    <SkeletonBlock width="w-full" marginBottom="mb-2.5" />
    <SkeletonBlock width="max-w-[500px]" marginBottom="mb-2.5" />
    <SkeletonBlock width="max-w-[520px]" marginBottom="mb-2.5" />
    <SkeletonBlock width="max-w-[360px]" />
  </div>
);

// PostingSkeleton: Main component that renders multiple skeleton groups to simulate the loading state
const PostingSkeleton: React.FC = () => {
  return (
    <div className="w-full flex gap-10 flex-col col-span-3 mt-16">
      {/* Rendering 4 groups of skeleton blocks to mimic multiple sections of content */}
      <SkeletonGroup />
      <SkeletonGroup />
      <SkeletonGroup />
      <SkeletonGroup />
    </div>
  );
};

export default PostingSkeleton;
