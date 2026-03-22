"use client";

import { motion } from "framer-motion";

import { ReactNode } from "react";

interface SliderProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Slider = ({ visible, onClose, children }: SliderProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-100 ${
        visible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-1000 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`relative bg-white w-full max-w-4xl h-full p-6 shadow-xl transform transition-transform duration-1000 overflow-y-auto ${
          visible ? "translate-x-0" : "translate-x-full"
        } rounded-l-lg`}
      >
        {children}
      </div>
    </div>
  );
};

export default Slider;
