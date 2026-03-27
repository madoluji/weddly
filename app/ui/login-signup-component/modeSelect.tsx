"use client";

import {
  SparklesIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "../button";
import clsx from "clsx";
import { useRouter } from "next/navigation";

interface SelectProps {
  selected: boolean;
}

const Circle = ({ selected }: SelectProps) => (
  <div
    className={clsx(
      "rounded-full border-2 h-8 w-8 absolute top-3 right-3 flex items-center justify-center",
      selected && "bg-primary-600"
    )}
  >
    {selected && <div className="rounded-full h-5 w-5 border-2"></div>}
  </div>
);

const ModeSelect = () => {
  const router = useRouter();
  const [mode, setMode] = useState("");

  const handleModeSelection = (selectedMode: string) => {
    setMode(selectedMode);
  };

  const handleContinue = () => {
    if (!mode) {
      console.log("Please select a mode");
      return;
    }
    router.push(`/signup/${mode}`);
  };

  return (
    <div className="flex flex-col items-center top-2/3 mt-[10%] h-screen">
      <div className="text-4xl">Join as a venue/vendor or wedding specialist</div>
      <div className="input flex gap-9 mt-10">
        <button
          className={clsx(
            "h-44 border-2 w-60 relative rounded-xl",
            mode === "client" && "border-primary-600"
          )}
          onClick={() => handleModeSelection("client")}
        >
          <Circle selected={mode === "client"} />
          <SparklesIcon className="h-10 w-10 absolute top-2 left-3" />
          <p className="text-xl">I&apos;m a venue/vendor, looking for wedding specialists</p>
        </button>
        <button
          className={clsx(
            "h-44 border-2 w-60 relative rounded-xl",
            mode === "freelancer" && "border-primary-600"
          )}
          onClick={() => handleModeSelection("freelancer")}
        >
          <Circle selected={mode === "freelancer"} />
          <ComputerDesktopIcon className="h-10 w-10 absolute top-2 left-3" />
          <p className="text-xl text-left ml-2">
            I&apos;m a wedding specialist, looking for gigs
          </p>
        </button>
      </div>
      <Button
        className={clsx(
          "button bg-primary-600 rounded-xl p-6 mt-5 text-white",
          !mode && "cursor-not-allowed opacity-50 disabled"
        )}
        onClick={handleContinue}
      >
        {(mode === "client" && "Continue as a venue/vendor") ||
          (mode === "freelancer" && "Continue as a wedding specialist") ||
          "Continue"}
      </Button>
    </div>
  );
};

export default ModeSelect;
