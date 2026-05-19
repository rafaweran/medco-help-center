export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/public/SearchBar";
import { ArticleCard } from "@/components/public/ArticleCard";
import { HomeHeader } from "@/components/public/HomeHeader";
import { Footer } from "@/components/public/Footer";
import { BookOpen, Stethoscope, User, Mail, MessageCircle, ChevronRight, Lightbulb } from "lucide-react";
import type { ArticleListItem } from "@/types";

const SUGGESTIONS = ["Teleorientação", "Receita digital", "Videochamada", "Conta Med.co", "Exames"];

const categoryIcons: Record<string, React.ReactNode> = {
  stethoscope: <Stethoscope className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  book: <BookOpen className="w-5 h-5" />,
};

const audiencePill: Record<string, { label: string; className: string }> = {
  doctor: {
    label: "Médico",
    className: "bg-[#E8FFFB] text-[#01B3A0] ring-1 ring-inset ring-[#A3EFE7]",
  },
  patient: {
    label: "Paciente",
    className: "bg-[#F0F4FF] text-[#1844AA] ring-1 ring-inset ring-[#C9D7FF]",
  },
  both: {
    label: "Ambos",
    className: "bg-white text-slate-600 ring-1 ring-inset ring-slate-200",
  },
};


type AudienceEnum = "doctor" | "patient" | "both";

async function getData(audience?: string) {
  const audienceWhere =
    audience === "doctor"
      ? { audience: { in: ["doctor", "both"] as AudienceEnum[] } }
      : audience === "patient"
      ? { audience: { in: ["patient", "both"] as AudienceEnum[] } }
      : {};

  const [categories, featured, popular] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null, ...audienceWhere },
      include: { _count: { select: { articles: { where: { status: "published" } } } } },
      orderBy: { orderIndex: "asc" },
      take: 8,
    }),
    prisma.article.findMany({
      where: { status: "published", isFeatured: true, ...audienceWhere },
      select: {
        id: true, slug: true, title: true, summary: true,
        audience: true, status: true, isFeatured: true,
        viewCount: true, helpfulYes: true, helpfulNo: true,
        publishedAt: true, updatedAt: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
      orderBy: { viewCount: "desc" },
      take: 4,
    }),
    prisma.article.findMany({
      where: { status: "published", ...audienceWhere },
      select: {
        id: true, slug: true, title: true, summary: true,
        audience: true, status: true, isFeatured: true,
        viewCount: true, helpfulYes: true, helpfulNo: true,
        publishedAt: true, updatedAt: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
      orderBy: { viewCount: "desc" },
      take: 6,
    }),
  ]);

  return {
    categories,
    featured: featured as ArticleListItem[],
    popular: popular as ArticleListItem[],
  };
}

interface PageProps {
  searchParams: Promise<{ audience?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { audience } = await searchParams;
  const { categories, featured, popular } = await getData(audience);
  const hasContent = categories.length > 0 || featured.length > 0;

  const tabs = [
    { label: "Todos", href: "/", active: !audience },
    { label: "Médicos", href: "/?audience=doctor", active: audience === "doctor" },
    { label: "Pacientes", href: "/?audience=patient", active: audience === "patient" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Hero */}
      <section className="py-16 px-4" style={{ backgroundColor: "#1844AA" }}>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Como podemos ajudar?</h1>
          <p className="mb-8 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            Encontre respostas, tutoriais e dicas para usar a plataforma Med.co
          </p>
          <SearchBar size="lg" suggestions={SUGGESTIONS} />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        {/* Audience filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-xl w-fit shadow-sm">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-5 py-2 text-sm rounded-lg font-medium transition-all ${
                tab.active
                  ? "bg-[#1844AA] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {hasContent ? (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Categorias</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {categories.map((cat: typeof categories[number]) => {
                    return (
                      <Link
                        key={cat.id}
                        href={`/categoria/${cat.slug}`}
                        className="group flex flex-col items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-sm transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-400 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                          {cat.icon && categoryIcons[cat.icon]
                            ? categoryIcons[cat.icon]
                            : <BookOpen className="w-5 h-5" />}
                        </div>
                        <div className="w-full space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${audiencePill[cat.audience]?.className ?? audiencePill.both.className}`}
                            >
                              {audiencePill[cat.audience]?.label ?? audiencePill.both.label}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {cat.description}
                            </p>
                          )}
                          <p className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                            Ver guias
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Featured */}
            {featured.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h2 className="text-base font-semibold text-gray-900">Dúvidas frequentes</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {featured.map((article) => (
                    <ArticleCard key={article.id} article={article} showAudience />
                  ))}
                </div>
              </section>
            )}

            {/* Popular */}
            {popular.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Mais acessados</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {popular.map((article) => (
                    <ArticleCard key={article.id} article={article} compact />
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <section>
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: "linear-gradient(135deg, #1844AA 0%, #2260d9 100%)" }}
              >
                <h2 className="text-xl font-bold text-white mb-2">
                  Não encontrou o que precisava?
                </h2>
                <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Nossa equipe está pronta para ajudar você.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <a
                    href="mailto:contato@medcoapp.com"
                    className="flex items-center gap-2 bg-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                    style={{ color: "#1844AA" }}
                  >
                    <Mail className="w-4 h-4" />
                    Enviar e-mail
                  </a>
                  <a
                    href="https://www.medcoapp.com/contato"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border text-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.3)" }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Falar com suporte
                  </a>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-24">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              className="mx-auto mb-6"
            >
              <circle cx="60" cy="60" r="56" fill="#EFF6FF" />
              <rect x="32" y="22" width="52" height="66" rx="6" fill="white" stroke="#BFDBFE" strokeWidth="2" />
              <rect x="42" y="38" width="32" height="4" rx="2" fill="#BFDBFE" />
              <rect x="42" y="50" width="24" height="4" rx="2" fill="#BFDBFE" />
              <rect x="42" y="62" width="16" height="4" rx="2" fill="#BFDBFE" />
              <circle cx="78" cy="82" r="14" fill="#EFF6FF" stroke="#1844AA" strokeWidth="2" strokeOpacity="0.4" />
              <circle cx="75" cy="79" r="8" fill="none" stroke="#1844AA" strokeWidth="2.5" strokeOpacity="0.7" />
              <line x1="81" y1="85" x2="88" y2="92" stroke="#1844AA" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Ainda sem conteúdo publicado
            </h3>
            <p className="text-sm text-gray-400 mb-7 max-w-xs mx-auto">
              Crie categorias e artigos no painel admin para que apareçam aqui.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors hover:opacity-90"
              style={{ backgroundColor: "#1844AA" }}
            >
              Ir para o Admin →
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
