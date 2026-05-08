export type Audience = "doctor" | "patient" | "both";
export type ArticleStatus = "draft" | "published" | "archived";
export type AdminRole = "super_admin" | "editor" | "viewer";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  audience: Audience;
  orderIndex: number;
  isActive: boolean;
  _count?: { articles: number };
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  createdAt: Date;
}

export type MediaPosition = "before_content" | "after_content" | "after_steps";

export interface ArticleMedia {
  id: string;
  type: "image" | "video_link" | "attachment";
  url: string;
  caption?: string | null;
  orderIndex: number;
  position?: MediaPosition;
}

export interface Step {
  id: string;
  title: string;
  description: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  content: string;
  steps?: Step[] | null;
  audience: Audience;
  status: ArticleStatus;
  isFeatured: boolean;
  isPinned: boolean;
  viewCount: number;
  helpfulYes: number;
  helpfulNo: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: Date | null;
  category?: Category | null;
  tags?: { tag: Tag }[];
  media?: ArticleMedia[];
  relatedFrom?: { relatedArticle: ArticleListItem }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  audience: Audience;
  status: ArticleStatus;
  isFeatured: boolean;
  viewCount: number;
  helpfulYes: number;
  helpfulNo: number;
  publishedAt?: Date | null;
  category?: { name: string; slug: string } | null;
  tags?: { tag: { name: string; slug: string } }[];
  updatedAt: Date;
}

export interface SearchResult {
  articles: ArticleListItem[];
  total: number;
  query: string;
}
