export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleFeedback } from "@/components/public/ArticleFeedback";
import { ArticleCard } from "@/components/public/ArticleCard";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/public/Footer";
import { formatDate } from "@/lib/utils";
import { ChevronRight, Home, Clock, Eye } from "lucide-react";
import type { ArticleListItem, Step } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type MediaItem = { id: string; type: string; url: string; caption: string | null; position: string };

function MediaBlock({ items }: { items: MediaItem[] }) {
  if (!items.length) return null;
  const images = items.filter((m) => m.type === "image");
  const videos = items.filter((m) => m.type === "video_link");
  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((img) => (
            <figure key={img.id}>
              <img
                src={img.url}
                alt={img.caption ?? ""}
                className="rounded-xl w-full object-cover border border-gray-100"
              />
              {img.caption && (
                <figcaption className="mt-2 text-xs text-center text-gray-400">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      {videos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Vídeos relacionados</h3>
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 hover:border-blue-200 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                ▶
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                {video.caption ?? video.url}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

async function getData(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug, status: "published" },
    include: {
      category: true,
      tags: { include: { tag: true } },
      media: { orderBy: { orderIndex: "asc" } },
      relatedFrom: {
        include: {
          relatedArticle: {
            select: {
              id: true, slug: true, title: true, summary: true,
              audience: true, status: true, isFeatured: true,
              viewCount: true, helpfulYes: true, helpfulNo: true,
              publishedAt: true, updatedAt: true,
              category: { select: { name: true, slug: true } },
              tags: { select: { tag: { select: { name: true, slug: true } } } },
            },
          },
        },
        take: 3,
      },
    },
  });

  return article;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getData(slug);

  if (!article) notFound();

  const steps = article.steps as Step[] | null;
  type Media = { id: string; type: string; url: string; caption: string | null; position: string };
  const allMedia = article.media as Media[];
  const mediaAt = (pos: string) => allMedia.filter((m) => m.position === pos);
  const related = article.relatedFrom.map((r: { relatedArticle: ArticleListItem }) => r.relatedArticle);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Central de Ajuda</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 flex-wrap">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          {article.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/categoria/${article.category.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {article.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600 truncate max-w-[200px]">{article.title}</span>
        </nav>

        <article className="space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={article.audience as "doctor" | "patient" | "both"}>
                {article.audience}
              </Badge>
              {article.tags.map(({ tag }: { tag: { id: string; name: string } }) => (
                <span
                  key={tag.id}
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h1>

            {article.summary && (
              <p className="mt-3 text-gray-500 leading-relaxed">{article.summary}</p>
            )}

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Atualizado em {formatDate(article.updatedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.viewCount.toLocaleString("pt-BR")} visualizações
              </span>
            </div>
          </div>

          {/* Media: before content */}
          <MediaBlock items={mediaAt("before_content")} />

          {/* Content */}
          <div
            className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Media: after content */}
          <MediaBlock items={mediaAt("after_content")} />

          {/* Steps */}
          {steps && steps.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">
                Passo a passo
              </h2>
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={step.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                      {step.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Media: after steps */}
          <MediaBlock items={mediaAt("after_steps")} />

          {/* Feedback */}
          <ArticleFeedback articleId={article.id} />

          {/* Related articles */}
          {related.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Artigos relacionados
              </h2>
              <div className="space-y-2">
                {related.map((rel) => (
                  <ArticleCard key={rel.id} article={rel} compact />
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
      <Footer />
    </div>
  );
}
