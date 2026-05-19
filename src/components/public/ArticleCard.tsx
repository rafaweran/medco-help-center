import Link from "next/link";
import { ChevronRight, Eye, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ArticleListItem } from "@/types";

interface ArticleCardProps {
  article: ArticleListItem;
  showAudience?: boolean;
  compact?: boolean;
}

export function ArticleCard({ article, showAudience = false, compact = false }: ArticleCardProps) {
  const helpfulRate =
    article.helpfulYes + article.helpfulNo > 0
      ? Math.round((article.helpfulYes / (article.helpfulYes + article.helpfulNo)) * 100)
      : null;

  return (
    <Link
      href={`/artigo/${article.slug}`}
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {article.isFeatured && (
            <span className="text-xs text-amber-700 bg-amber-50 ring-1 ring-inset ring-amber-200 px-2 py-0.5 rounded-full">
              Destaque
            </span>
          )}
          {showAudience && (
            <Badge variant={article.audience as "doctor" | "patient" | "both"}>
              {article.audience}
            </Badge>
          )}
          {article.category && (
            <span className="text-xs text-blue-700 bg-blue-50 ring-1 ring-inset ring-blue-200 px-2 py-0.5 rounded-full">
              {article.category.name}
            </span>
          )}
        </div>

        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-snug">
          {article.title}
        </h3>

        {!compact && article.summary && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{article.summary}</p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.viewCount.toLocaleString("pt-BR")}
          </span>
          {helpfulRate !== null && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {helpfulRate}% útil
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
    </Link>
  );
}
