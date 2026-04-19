"use client";
import axios from "axios";
import React, { type ChangeEvent, useState } from "react";

type UploadResponse = {
  meetingId: string;
  blobUrl: string;
  error?: string;
};

export const UploadFile = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file first.");
      setSuccessMessage(null);
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", "temp");

      const { data } = await axios.post<UploadResponse>("/api/upload", formData);

      setSuccessMessage(
        `Upload successful. Meeting ID: ${data.meetingId}`,
      );
      console.log("Upload result:", {
        meetingId: data.meetingId,
        blobUrl: data.blobUrl,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as UploadResponse | undefined)?.error ||
          error.message ||
          "Upload failed"
        : error instanceof Error
          ? error.message
          : "Unexpected upload error";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="file"
        accept="audio/*,video/*"
        onChange={handleFileChange}
        className="cursor-pointer rounded border border-gray-300 p-2"
      />
      <button
        type="button"
        onClick={handleUploadClick}
        disabled={isUploading}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
    </div>
  );
};

export default UploadFile;
