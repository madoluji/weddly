"use client";
import React, { useState } from "react";
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
  const [selected, setSelected] = useState(false);

  const existingFilter = params.get("Experience"); // Get the existing Experience filter

  const handleModeSelection = (selectedExperience: string) => {
    if (!selected) {
      setSelected(true);

      if (existingFilter) {
        // Add the selected experience to the existing list, separated by commas
        const updatedExperience = `${existingFilter},${selectedExperience}`;
        params.set("Experience", updatedExperience); // Replace with new comma-separated string
        console.log("Updated Experience:", updatedExperience);
      } else {
        // If no existing filter, just set the new experience
        params.set("Experience", selectedExperience);
        console.log("Appended Experience:", selectedExperience);
      }
    } else {
      setSelected(false);
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
    console.log("New URL:", newUrl);
    replace(newUrl);
  };

  return (
    <span className="flex gap-2">
      <button
        className={clsx(
          "rounded-lg border-2 h-6 w-6",
          selected && "bg-primary-600"
        )}
        onClick={() => handleModeSelection(Experience)}
      ></button>
      {Experience}
    </span>
  );
};

export default Filter;
