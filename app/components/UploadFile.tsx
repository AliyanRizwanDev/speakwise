"use client";
import React, { type ChangeEvent, useState } from "react";

export const UploadFile = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    console.log(selectedFile.name);
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="file"
        accept="audio/*,video/*"
        onChange={handleFileChange}
        className="cursor-pointer rounded border border-gray-300 p-2"
      />
      <button
        type="button"
        onClick={handleUploadClick}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      >
        Upload
      </button>
    </div>
  );
};
