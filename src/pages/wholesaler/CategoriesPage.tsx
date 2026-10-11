import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getOperationsNavigation } from "../../config/operationsNavigation";
import { useAuth } from "../../context/AuthContext";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "../../services/categoryService";
import type { Category } from "../../services/productService";
import ErrorModal from "../../components/ui/ErrorModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function CategoriesPage() {
  const { token, user } = useAuth();
  const operations = getOperationsNavigation(user?.role);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setCategories(await getCategories(token));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    setIsSubmitting(true);
    try {
      await createCategory(token, { category_name: newName.trim() });
      setNewName("");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!token || !pendingDelete || isDeleting) return;

    const categoryId = pendingDelete.category_id;

    setIsDeleting(true);
    setError("");

    try {
      await deleteCategory(token, categoryId);

      setCategories((current) =>
        current.filter((category) => category.category_id !== categoryId),
      );

      setPendingDelete(null);
    } catch (err) {
      setPendingDelete(null);
      setError(
        err instanceof Error ? err.message : "Failed to delete category.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (error && !isLoading) {
    return (
      <DashboardLayout navItems={operations.navItems}>
        <ErrorModal message={error} homePath={operations.dashboardPath} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={operations.navItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-6">Categories</h1>

      <form
        onSubmit={handleAdd}
        className="bg-white rounded-lg shadow p-4 mb-6 flex gap-2"
      >
        <input
          type="text"
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-300"
        >
          <Plus size={16} /> Add
        </button>
      </form>

      <div className="bg-white rounded-lg shadow divide-y">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-400">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">
            No categories yet — add one above.
          </p>
        ) : (
          categories.map((c) => (
            <div
              key={c.category_id}
              className="flex justify-between items-center p-4"
            >
              <span className="text-sm font-medium text-[#003049]">
                {c.category_name}
              </span>
              <button
                onClick={() => setPendingDelete(c)}
                className="text-gray-400 hover:text-[#d62828]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete Category"
        message={`Delete "${pendingDelete?.category_name}"? Products using this category may be affected.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </DashboardLayout>
  );
}
