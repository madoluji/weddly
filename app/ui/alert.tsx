import React from "react";

interface AlertProps {
  type: "success" | "error";
  message: string;
}

const Alert = ({ type, message }: AlertProps) => {
  return (
    <div
      className={`rounded-md p-3 text-sm font-medium text-white ${
        type === "success" ? "bg-primary-700" : "bg-slate-700"
      }`}
    >
      {message}
    </div>
  );
};

export default Alert;
