"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, GripVertical, Save, Eye,
  ImagePlus, Link as LinkIcon, Upload, X, Play,
} from "lucide-react";
import type { Category, Tag, Step, Article, MediaPosition } from "@/types";

interface MediaItem {
  id: string;
  type: "image" | "video_link";
  url: string;
  caption: string;
  position: MediaPosition;
  uploading?: boolean;
  previewUrl?: string;
}

const POSITION_LABELS: Record<MediaPosition, string> = {
  before_content: "Antes do conteúdo",
  after_content:  "Após o conteúdo",
  after_steps:    "Após o passo a passo",
};

interface ArticleFormProps {
  categories: Category[];
  tags: Tag[];
  article?: Article;
}

export function ArticleForm({ categories, tags, article }: ArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(article?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [audience, setAudience] = useState<"doctor" | "patient" | "both">(article?.audience ?? "both");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(article?.status ?? "draft");
  const [categoryId, setCategoryId] = useState(article?.category?.id ?? "");
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [isPinned, setIsPinned] = useState(article?.isPinned ?? false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags?.map((t) => t.tag.id) ?? []
  );
  const [steps, setSteps] = useState<Step[]>((article?.steps as Step[]) ?? []);
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(article?.seoDescription ?? "");

  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    article?.media?.map((m) => ({
      id: m.id,
      type: m.type as "image" | "video_link",
      url: m.url,
      caption: m.caption ?? "",
      position: (m.position as MediaPosition) ?? "after_content",
      previewUrl: m.type === "image" ? m.url : undefined,
    })) ?? []
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ─── Tags ────────────────────────────────────────────────
  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  // ─── Steps ───────────────────────────────────────────────
  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, { id: crypto.randomUUID(), title: "", description: "" }]);
  }, []);
  const updateStep = useCallback((id: string, field: keyof Step, value: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }, []);
  const removeStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ─── Media: Image upload ──────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const tempId = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);

    setMediaItems((prev) => [
      ...prev,
      { id: tempId, type: "image", url: "", caption: "", position: "after_content", uploading: true, previewUrl },
    ]);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao fazer upload");

      setMediaItems((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, url: data.url, uploading: false } : m))
      );
    } catch (err) {
      setMediaItems((prev) => prev.filter((m) => m.id !== tempId));
      setUploadError(err instanceof Error ? err.message : "Erro no upload");
    }

    e.target.value = "";
  }

  // ─── Media: Add video ────────────────────────────────────
  function addVideo() {
    setMediaItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "video_link", url: "", caption: "", position: "after_content" },
    ]);
  }

  // ─── Media: Update field ──────────────────────────────────
  function updateMedia(id: string, field: keyof MediaItem, value: string) {
    setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  // ─── Media: Remove ───────────────────────────────────────
  function removeMedia(id: string) {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
  }

  // ─── Submit ──────────────────────────────────────────────
  async function handleSubmit(submitStatus?: "published") {
    setSaving(true);
    setError(null);

    const finalStatus = submitStatus ?? status;

    // Filter out incomplete video links
    const validMedia = mediaItems.filter((m) => m.url.trim() !== "");

    try {
      const body = {
        title, summary, content,
        steps: steps.length > 0 ? steps : null,
        audience, status: finalStatus,
        categoryId: categoryId || null,
        tagIds: selectedTagIds,
        isFeatured, isPinned,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        media: validMedia.map((m, i) => ({
          type: m.type,
          url: m.url,
          caption: m.caption || null,
          position: m.position,
          orderIndex: i,
        })),
      };

      const res = article
        ? await fetch(`/api/admin/articles/${article.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar artigo");
      }

      router.push("/admin/artigos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  // ─── Helper: YouTube embed preview ───────────────────────
  function getYouTubeThumbnail(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Main content ── */}
      <div className="lg:col-span-2 space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Como iniciar uma teleconsulta"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <label className="block text-xs font-medium text-gray-700 mb-2">Resumo curto</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Breve descrição do artigo (exibida nas listas e buscas)"
            rows={2}
            maxLength={300}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400 text-right">{summary.length}/300</p>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Conteúdo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conteúdo completo do artigo. Suporta HTML básico."
            rows={12}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-y font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Suporta HTML: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;a&gt;
          </p>
        </div>

        {/* ── MÍDIA (imagens + vídeos) ── */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-medium text-gray-700">Imagens e vídeos</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Escolha onde cada item aparece no artigo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                Imagem
              </button>
              <button
                type="button"
                onClick={addVideo}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Vídeo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {uploadError && (
            <p className="mb-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{uploadError}</p>
          )}

          {mediaItems.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-10 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-300" />
              <p className="text-xs text-gray-400">Clique para adicionar uma imagem</p>
              <p className="text-[10px] text-gray-300">JPG, PNG, WebP ou GIF · máx. 5MB</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    {item.uploading ? (
                      <div className="animate-pulse w-full h-full bg-gray-300" />
                    ) : item.type === "image" && item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl || item.url} alt="" className="w-full h-full object-cover" />
                    ) : item.type === "video_link" ? (
                      (() => {
                        const thumb = getYouTubeThumbnail(item.url);
                        return thumb ? (
                          <div className="relative w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <Play className="w-6 h-6 text-gray-400" />
                        );
                      })()
                    ) : (
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {item.type === "video_link" && (
                      <div className="relative">
                        <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="url"
                          value={item.url}
                          onChange={(e) => updateMedia(item.id, "url", e.target.value)}
                          placeholder="URL do vídeo (YouTube, Vimeo...)"
                          className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => updateMedia(item.id, "caption", e.target.value)}
                      placeholder={item.type === "image" ? "Legenda da imagem (opcional)" : "Título do vídeo (opcional)"}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    {/* Position selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">Posição:</span>
                      <div className="flex gap-1 flex-wrap">
                        {(Object.entries(POSITION_LABELS) as [MediaPosition, string][]).map(([pos, label]) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => updateMedia(item.id, "position", pos)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap ${
                              item.position === pos
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {item.uploading && (
                      <p className="text-[10px] text-blue-500 animate-pulse">Fazendo upload...</p>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeMedia(item.id)}
                    disabled={item.uploading}
                    className="flex-shrink-0 self-start text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30 mt-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add more */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar imagem
                </button>
                <span className="text-gray-200">·</span>
                <button
                  type="button"
                  onClick={addVideo}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar vídeo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-medium text-gray-700">Passo a passo</label>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar passo
            </button>
          </div>

          {steps.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Nenhum passo adicionado.
            </p>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-shrink-0 mt-2">
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(step.id, "title", e.target.value)}
                      placeholder="Título do passo"
                      className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => updateStep(step.id, "description", e.target.value)}
                      placeholder="Descrição (opcional)"
                      className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="mt-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <label className="block text-xs font-medium text-gray-700 mb-4">SEO (opcional)</label>
          <div className="space-y-3">
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Título SEO (deixe vazio para usar o título do artigo)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Descrição SEO (meta description)"
              rows={2}
              maxLength={160}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="space-y-4">
        {/* Actions */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving || !title || !content}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {status === "draft" ? "Salvar rascunho" : "Salvar alterações"}
          </button>
          {status !== "published" && (
            <button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={saving || !title || !content}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Publicar artigo
            </button>
          )}
        </div>

        {/* Status */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <label className="block text-xs font-medium text-gray-700 mb-3">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>

        {/* Audience */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <label className="block text-xs font-medium text-gray-700 mb-3">Público-alvo</label>
          <div className="space-y-2">
            {(["both", "patient", "doctor"] as const).map((aud) => {
              const labels = { both: "Ambos (médico e paciente)", patient: "Paciente", doctor: "Médico" };
              return (
                <label key={aud} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="audience"
                    value={aud}
                    checked={audience === aud}
                    onChange={() => setAudience(aud)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{labels[aud]}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <label className="block text-xs font-medium text-gray-700 mb-3">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <label className="block text-xs font-medium text-gray-700 mb-3">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-600 border border-transparent hover:border-gray-300"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <label className="block text-xs font-medium text-gray-700 mb-3">Opções</label>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-blue-600"
              />
              <div>
                <p className="text-sm text-gray-700">Artigo em destaque</p>
                <p className="text-xs text-gray-400">Exibido na home com ícone especial</p>
              </div>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded text-blue-600"
              />
              <div>
                <p className="text-sm text-gray-700">Fixar no topo da categoria</p>
                <p className="text-xs text-gray-400">Aparece sempre primeiro na listagem</p>
              </div>
            </label>
          </div>
        </div>

        {/* Media summary */}
        {mediaItems.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-xs font-medium text-gray-700 mb-3">Mídia adicionada</p>
            <div className="space-y-1.5">
              {mediaItems.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-xs text-gray-500">
                  {m.type === "image"
                    ? <ImagePlus className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    : <Play className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                  <span className="truncate">{m.caption || (m.type === "image" ? "Imagem" : "Vídeo")}</span>
                  <span className="ml-auto text-gray-300 whitespace-nowrap text-[10px]">
                    {POSITION_LABELS[m.position].replace("Após o ", "").replace("Antes do ", "Antes/")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
