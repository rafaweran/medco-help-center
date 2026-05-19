"use client";

import { useState } from "react";
import { FolderOpen, Plus, Pencil, Trash2, X, Check, BookOpen, Stethoscope, User, GripVertical } from "lucide-react";

type Audience = "doctor" | "patient" | "both";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  audience: Audience;
  orderIndex: number;
  isActive: boolean;
  _count: { articles: number };
}

interface FormState {
  name: string;
  description: string;
  icon: string;
  audience: Audience;
  orderIndex: number;
  isActive: boolean;
}

const ICONS = [
  { value: "", label: "Nenhum", el: <FolderOpen className="w-4 h-4" /> },
  { value: "stethoscope", label: "Estetoscópio", el: <Stethoscope className="w-4 h-4" /> },
  { value: "user", label: "Usuário", el: <User className="w-4 h-4" /> },
  { value: "book", label: "Livro", el: <BookOpen className="w-4 h-4" /> },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  stethoscope: <Stethoscope className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
};

const AUDIENCE_LABELS: Record<Audience, string> = {
  doctor: "Médico",
  patient: "Paciente",
  both: "Ambos",
};

const defaultForm = (): FormState => ({
  name: "",
  description: "",
  icon: "",
  audience: "both",
  orderIndex: 0,
  isActive: true,
});

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm());
    setError(null);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      icon: cat.icon ?? "",
      audience: cat.audience,
      orderIndex: cat.orderIndex,
      isActive: cat.isActive,
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      icon: form.icon || null,
      audience: form.audience,
      orderIndex: form.orderIndex,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Erro ao atualizar");
        }
        const updated: Category = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Erro ao criar");
        }
        const created: Category = await res.json();
        setCategories((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao excluir");
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
      setDeleteConfirm(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categorias</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categoria{categories.length !== 1 ? "s" : ""} cadastrada{categories.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova categoria
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Form panel */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-900">
              {editingId ? "Editar categoria" : "Nova categoria"}
            </h2>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nome *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Primeiros passos"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Audience */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Público</label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as Audience }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="both">Ambos</option>
                  <option value="doctor">Médico</option>
                  <option value="patient">Paciente</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Descrição</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descrição curta da categoria"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Icon */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Ícone</label>
                <div className="flex gap-2">
                  {ICONS.map(({ value, label, el }) => (
                    <button
                      key={value}
                      type="button"
                      title={label}
                      onClick={() => setForm((f) => ({ ...f, icon: value }))}
                      className={`flex-1 flex items-center justify-center h-9 rounded-lg border text-sm transition-all ${
                        form.icon === value
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {el}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Ordem</label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={(e) => setForm((f) => ({ ...f, orderIndex: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Active */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-all ${
                    form.isActive
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-400"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${form.isActive ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
                    {form.isActive && <Check className="w-2 h-2 text-white" />}
                  </div>
                  {form.isActive ? "Ativa" : "Inativa"}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Salvando…" : editingId ? "Salvar alterações" : "Criar categoria"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-16 text-center">
          <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Nenhuma categoria ainda</p>
          <p className="text-xs text-gray-400 mt-1">Crie a primeira categoria para organizar os artigos.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span className="w-4" />
            <span>Categoria</span>
            <span className="w-24 text-center">Público</span>
            <span className="w-20 text-center">Artigos</span>
            <span className="w-16 text-center">Status</span>
            <span className="w-16 text-right">Ações</span>
          </div>

          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors"
              >
                {/* Drag handle (visual only) */}
                <GripVertical className="w-4 h-4 text-gray-200" />

                {/* Name + desc */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                      {cat.icon && ICON_MAP[cat.icon] ? ICON_MAP[cat.icon] : <FolderOpen className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-medium text-sm text-gray-900 truncate">{cat.name}</span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-gray-400 mt-0.5 ml-9 truncate">{cat.description}</p>
                  )}
                </div>

                {/* Audience */}
                <span className="w-24 text-center text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {AUDIENCE_LABELS[cat.audience]}
                </span>

                {/* Article count */}
                <span className="w-20 text-center text-sm text-gray-600">
                  {cat._count.articles}
                </span>

                {/* Active */}
                <div className="w-16 flex justify-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? "bg-gray-100 text-gray-500" : "bg-gray-50 text-gray-300"}`}>
                    {cat.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>

                {/* Actions */}
                <div className="w-16 flex items-center justify-end gap-1">
                  {deleteConfirm === cat.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={loading}
                        className="text-xs text-red-600 hover:text-red-700 font-medium px-1.5 py-1"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-gray-400 px-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cat.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
