"use client";

import { useState } from "react";
import { useEntities } from "@/hooks/useApi";
import { client } from "@/lib/api-client";
import type { components } from "@/lib/api-client";
import Header from "@/components/Header";
import EditEntityModal from "@/components/EditEntityModal";
import DeleteEntityModal from "@/components/DeleteEntityModal";
import CreateEntityModal from "@/components/CreateEntityModal";

type Entity = components["schemas"]["Entity"];
type EntityCreate = components["schemas"]["EntityCreate"];

export default function EntitiesPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [deletingEntity, setDeletingEntity] = useState<Entity | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const queryParams: { type?: string; status?: string } = {};
  if (selectedType !== "all") queryParams.type = selectedType;
  if (selectedStatus !== "all") queryParams.status = selectedStatus;

  const { data: entities, error, isLoading, mutate } = useEntities(queryParams);

  const handleSaveEntity = async (entityId: string, updates: Partial<Entity>) => {
    const { error } = await client.PUT("/entities/{entity_id}", {
      params: { path: { entity_id: entityId } },
      body: updates,
    });

    if (error) {
      throw new Error("Failed to update entity");
    }

    // Refresh the entity list
    mutate();
  };

  const handleDeleteEntity = async (entityId: string) => {
    const { error } = await client.DELETE("/entities/{entity_id}", {
      params: { path: { entity_id: entityId } },
    });

    if (error) {
      throw new Error("Failed to delete entity");
    }

    // Refresh the entity list
    mutate();
  };

  const handleCreateEntity = async (entity: EntityCreate) => {
    const { error } = await client.POST("/entities", {
      body: entity,
    });

    if (error) {
      throw new Error("Failed to create entity");
    }

    // Refresh the entity list
    mutate();
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading entities...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-semibold">Failed to load entities</p>
          </div>
        </main>
      </>
    );
  }

  // Sorting function with tie-breaking logic
  const sortEntities = (entityList: Entity[]) => {
    return [...entityList].sort((a, b) => {
      if (sortOrder === "alphabetical") {
        // Primary: alphabetical by name
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;

        // Tie-breaker 1: oldest to newest by updated_at
        const aUpdated = new Date(a.updated_at).getTime();
        const bUpdated = new Date(b.updated_at).getTime();
        if (aUpdated !== bUpdated) return aUpdated - bUpdated;

        // Tie-breaker 2: oldest to newest by created_at
        const aCreated = new Date(a.created_at).getTime();
        const bCreated = new Date(b.created_at).getTime();
        return aCreated - bCreated;
      } else if (sortOrder === "oldest") {
        // Primary: oldest to newest by updated_at
        const aUpdated = new Date(a.updated_at).getTime();
        const bUpdated = new Date(b.updated_at).getTime();
        if (aUpdated !== bUpdated) return aUpdated - bUpdated;

        // Tie-breaker: alphabetical by name
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;

        // Final tie-breaker: oldest to newest by created_at
        const aCreated = new Date(a.created_at).getTime();
        const bCreated = new Date(b.created_at).getTime();
        return aCreated - bCreated;
      } else { // "newest"
        // Primary: newest to oldest by updated_at
        const aUpdated = new Date(a.updated_at).getTime();
        const bUpdated = new Date(b.updated_at).getTime();
        if (aUpdated !== bUpdated) return bUpdated - aUpdated;

        // Tie-breaker: alphabetical by name
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;

        // Final tie-breaker: newest to oldest by created_at
        const aCreated = new Date(a.created_at).getTime();
        const bCreated = new Date(b.created_at).getTime();
        return bCreated - aCreated;
      }
    });
  };

  // Group entities by type and sort within each group
  const groupedEntities = (entities || []).reduce((acc, entity) => {
    if (!acc[entity.type]) {
      acc[entity.type] = [];
    }
    acc[entity.type]?.push(entity);
    return acc;
  }, {} as Record<string, Entity[]>);

  // Sort entities within each group
  Object.keys(groupedEntities).forEach(type => {
    groupedEntities[type] = sortEntities(groupedEntities[type] || []);
  });

  const allEntityTypes = [
    "decision",
    "goal",
    "person",
    "priority",
    "system",
    "tool",
    "value",
  ];

  const typeIcons: Record<string, string> = {
    person: "👤",
    goal: "🎯",
    system: "⚙️",
    value: "💎",
    decision: "🤔",
    priority: "⭐",
    tool: "🔧",
  };

  const typePlurals: Record<string, string> = {
    person: "People",
    priority: "Priorities",
    decision: "Decisions",
    goal: "Goals",
    system: "Systems",
    tool: "Tools",
    value: "Values",
  };

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Entities</h2>
          <p className="text-gray-600">People, goals, systems, values, and tools in your life</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
              >
                <option value="all">All Types</option>
                <option value="decision">Decision</option>
                <option value="goal">Goal</option>
                <option value="person">Person</option>
                <option value="priority">Priority</option>
                <option value="system">System</option>
                <option value="tool">Tool</option>
                <option value="value">Value</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {entities?.length || 0} entit{entities?.length !== 1 ? "ies" : "y"}
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                <span className="font-bold">+</span> Add Entity
              </button>
            </div>
          </div>
        </div>

        {/* Entities by Type */}
        <div className="space-y-8">
          {(selectedType === "all" ? allEntityTypes : [selectedType]).map((type) => {
            const entitiesOfType = groupedEntities[type] || [];

            return (
              <div key={type} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span>{typeIcons[type] || "📦"}</span>
                    <span>{typePlurals[type] || type}</span>
                    <span className="text-sm font-normal text-gray-500">({entitiesOfType.length})</span>
                  </h3>
                </div>
                <div className="p-6">
                  {entitiesOfType.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">
                      No {typePlurals[type]?.toLowerCase() || type + "s"} found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {entitiesOfType.map((entity) => (
                        <div key={entity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{entity.name}</h4>
                            <div className="flex items-center gap-2">
                              {entity.status && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  entity.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                }`}>
                                  {entity.status}
                                </span>
                              )}
                              <button
                                onClick={() => setEditingEntity(entity)}
                                className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingEntity(entity)}
                                className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200"
                                title="Delete entity"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          {entity.description && (
                            <p className="text-sm text-gray-600 mb-2">{entity.description}</p>
                          )}
                          {entity.metadata && Object.keys(entity.metadata).length > 0 && (
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                              {Object.entries(entity.metadata).slice(0, 3).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Entity Modal */}
        <CreateEntityModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onCreate={handleCreateEntity}
          defaultType={selectedType !== "all" ? selectedType : undefined}
        />

        {/* Edit Entity Modal */}
        {editingEntity && (
          <EditEntityModal
            entity={editingEntity}
            isOpen={!!editingEntity}
            onClose={() => setEditingEntity(null)}
            onSave={handleSaveEntity}
          />
        )}

        {/* Delete Entity Modal */}
        {deletingEntity && (
          <DeleteEntityModal
            entity={deletingEntity}
            isOpen={!!deletingEntity}
            onClose={() => setDeletingEntity(null)}
            onDelete={handleDeleteEntity}
          />
        )}
      </main>
    </>
  );
}
