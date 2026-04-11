"use client";
import React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

interface Props {
  Experience: string;
}

const Filter = ({ Experience }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = new URLSearchParams(searchParams);

  const existingFilter = params.get("Experience"); // Get the existing Experience filter
  const selected = existingFilter?.split(",").includes(Experience) ?? false;

  const handleModeSelection = (selectedExperience: string) => {
    if (!selected) {

      if (existingFilter) {
        // Add the selected experience to the existing list, separated by commas
        const updatedExperience = `${existingFilter},${selectedExperience}`;
        params.set("Experience", updatedExperience); // Replace with new comma-separated string
      } else {
        // If no existing filter, just set the new experience
        params.set("Experience", selectedExperience);
      }
    } else {
      // Remove the selected experience from the comma-separated string
      const updatedExperiences = existingFilter
        ?.split(",")
        .filter((exp) => exp !== selectedExperience)
        .join(",");
      if (updatedExperiences) {
        params.set("Experience", updatedExperiences); // Set the remaining experiences
      } else {
        params.delete("Experience"); // Delete the parameter if no experiences left
      }
    }

    const newUrl =
      pathname + (params.toString() ? `?${params.toString()}` : "");
    replace(newUrl);
  };

  return (
    <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
      <button
        type="button"
        className={clsx(
          "h-5 w-5 rounded-md border-2 transition",
          selected
            ? "border-primary-700 bg-primary-700"
            : "border-slate-300 bg-white hover:border-primary-300"
        )}
        onClick={() => handleModeSelection(Experience)}
        aria-pressed={selected}
      />
      {Experience}
    </span>
  );
};

export default Filter;
