// useOutfitActions.ts
import { useState } from 'react';

interface useOutfitActions<T> {
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => Promise<void> | void;
}

export function useOutfitActions<T extends { id: string; name?: string }>({
  onView,
  onEdit,
  onDelete,
}: useOutfitActions<T> = {}) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<T | null>(null);
  const [showEditModal, setShowEditModal] = useState<T | null>(null);
  const [showViewModal, setShowViewModal] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleView = (item: T) => {
    setSelectedItem(item);
    setShowViewModal(item);
    onView?.(item);
  };

  const handleEdit = (item: T) => {
    setSelectedItem(item);
    setShowEditModal(item);
    onEdit?.(item);
  };

  const handleDelete = (item: T) => {
    setSelectedItem(item);
    setShowDeleteModal(item);
  };

  const confirmDelete = async () => {
    if (!showDeleteModal || !onDelete) return;

    try {
      setIsDeleting(true);
      setError(null);
      await onDelete(showDeleteModal);
      setShowDeleteModal(null);
      setSelectedItem(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModals = () => {
    setShowDeleteModal(null);
    setShowEditModal(null);
    setShowViewModal(null);
    setSelectedItem(null);
    setError(null);
  };

  return {
    // State
    selectedItem,
    showDeleteModal,
    showEditModal,
    showViewModal,
    isDeleting,
    error,

    // Actions
    handleView,
    handleEdit,
    handleDelete,
    confirmDelete,
    closeModals,
    setError,

    // Modal controls
    setShowDeleteModal,
    setShowEditModal,
    setShowViewModal,
  };
}
