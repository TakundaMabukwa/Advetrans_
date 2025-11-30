import { createClient } from "@/lib/supabase/client";
import React, { useState } from "react";

interface ModalProps {
  request: any;
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
}

export default function Modal({
  request,
  onClose,
  onUpdateStatus,
}: ModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  const handleFileUpload = async () => {
    if (!file) return;

    setUploading(true);

    // Store file inside jobs/{jobId}/filename
    const filePath = `jobs/${request.id}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("job-attachments")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error.message);
      setUploading(false);
      return;
    }

    const { publicUrl } = supabase.storage
      .from("job-attachments")
      .getPublicUrl(filePath).data;

    // Update job status and attachments
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("job_assignments")
      .update({
        status: "completed",
        job_status: "completed",
        completed_at: new Date().toISOString(),
        attachments: [publicUrl],
        updated_by: user?.aud ?? "",
      })
      .eq("id", request.id);

    onUpdateStatus("completed");
    setUploading(false);
    onClose();
  };

  return (
    <div className="space-y-6 text-gray-800">
      <h2 className="text-2xl font-bold text-indigo-600 border-b pb-2">
        🚛 Complete Job #{request.job_id}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Description</p>
          <p className="font-medium">{request.description}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium">{request.location}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Emergency Type</p>
          <p className="font-medium">{request.emergency_type}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Current Status</p>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
            {request.status}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📎 Upload Attachment
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleFileUpload}
          disabled={uploading || !file}
          className={`px-5 py-2 rounded-lg text-white transition ${
            uploading || !file
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {uploading ? "Uploading..." : "🟢 Complete Job"}
        </button>
      </div>
    </div>
  );
}
