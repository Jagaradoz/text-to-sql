"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, LoaderCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { DatabaseCard } from "@/components/databases/database-card";
import { EmptyState } from "@/components/databases/empty-state";
import { uploadFile } from "@/lib/api";

export default function DatabasesPage() {
  const databases = useAppStore((state) => state.databases);
  const isLoading = useAppStore((state) => state.isLoading);
  const getDatabases = useAppStore((state) => state.getDatabases);
  const apiKey = useAppStore((state) => state.apiKey);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void getDatabases();
  }, [getDatabases]);

  const handleUploadClick = () => {
    setUploadError(null);
    if (!apiKey) {
      setUploadError("An API key is required in Settings to analyze uploaded data.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await uploadFile(file, apiKey);
      // Refresh the database list after a successful upload
      await getDatabases();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Failed to upload file.";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if it failed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="text-center pt-10">
        <h1 className="text-4xl font-black leading-none sm:text-5xl">
          Databases
        </h1>
        <p className="mt-3 font-medium text-muted-foreground/70">
          Manage your connected data sources.
        </p>
      </div>

      {/* Content area */}
      <div className="space-y-3">
        {isLoading && databases.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading databases…</p>
          </div>
        ) : databases.length === 0 ? (
          <EmptyState />
        ) : (
          databases.map((db) => (
            <DatabaseCard key={db.name} db={db} />
          ))
        )}

        {/* Upload Error Alert */}
        {uploadError && (
          <div className="rounded border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {uploadError}
          </div>
        )}

        {/* Add File Button */}
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-transparent py-5 text-sm font-medium text-muted-foreground transition hover:border-foreground/50 hover:bg-secondary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Uploading & Analyzing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add CSV or XLSX file
            </>
          )}
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}