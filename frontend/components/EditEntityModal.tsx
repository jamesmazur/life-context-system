"use client";

import { useState } from "react";
import type { components } from "@/lib/api-client";

type Entity = components["schemas"]["Entity"];

interface EditEntityModalProps {
  entity: Entity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entityId: string, updates: Partial<Entity>) => Promise<void>;
}

export default function EditEntityModal({
  entity,
  isOpen,
  onClose,
  onSave,
}: EditEntityModalProps) {
  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(entity.description || "");
  const [status, setStatus] = useState(entity.status || "active");
  const [metadata, setMetadata] = useState<Record<string, unknown>>(
    entity.metadata || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMetadata = () => {
    const key = `key${Object.keys(metadata).length + 1}`;
    setMetadata({ ...metadata, [key]: "" });
  };

  const handleRemoveMetadata = (key: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[key];
    setMetadata(newMetadata);
  };

  const handleMetadataKeyChange = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    const newMetadata = { ...metadata };
    newMetadata[newKey] = newMetadata[oldKey];
    delete newMetadata[oldKey];
    setMetadata(newMetadata);
  };

  const handleMetadataValueChange = (key: string, value: string | unknown) => {
    setMetadata({ ...metadata, [key]: value });
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      await onSave(entity.id, {
        name,
        description: description || undefined,
        status,
        metadata,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entity");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setName(entity.name);
    setDescription(entity.description || "");
    setStatus(entity.status || "active");
    setMetadata(entity.metadata || {});
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Edit Entity</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Type (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600 capitalize">
              {entity.type}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Metadata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metadata
            </label>
            <div className="space-y-2">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => handleMetadataKeyChange(key, e.target.value)}
                    placeholder="Key"
                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm"
                  />
                  <input
                    type="text"
                    value={String(value ?? "")}
                    onChange={(e) => handleMetadataValueChange(key, e.target.value)}
                    placeholder="Value"
                    className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMetadata(key)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 border border-gray-300 rounded-md hover:bg-red-50 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddMetadata}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add metadata field
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
