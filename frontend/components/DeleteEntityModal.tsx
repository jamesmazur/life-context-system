"use client";

import { useState } from "react";
import type { components } from "@/lib/api-client";

type Entity = components["schemas"]["Entity"];

interface DeleteEntityModalProps {
  entity: Entity;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (entityId: string) => Promise<void>;
}

export default function DeleteEntityModal({
  entity,
  isOpen,
  onClose,
  onDelete,
}: DeleteEntityModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      await onDelete(entity.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entity");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Entity</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{entity.name}</span>?
          </p>
          <p className="text-gray-600 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
