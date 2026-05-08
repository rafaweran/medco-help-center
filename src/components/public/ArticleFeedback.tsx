"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ArticleFeedbackProps {
  articleId: string;
}

export function ArticleFeedback({ articleId }: ArticleFeedbackProps) {
  const [voted, setVoted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleVote(isHelpful: boolean) {
    if (voted !== null || loading) return;
    setLoading(true);
    setVoted(isHelpful);

    try {
      await fetch(`/api/articles/${articleId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isHelpful,
          sessionId: sessionStorage.getItem("sessionId") ?? crypto.randomUUID(),
        }),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);

    await fetch(`/api/articles/${articleId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHelpful: false, comment }),
    });

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">
          Obrigado pelo seu feedback! Ele nos ajuda a melhorar nossos conteúdos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
      <p className="text-center text-sm font-medium text-gray-700 mb-4">
        Este artigo foi útil?
      </p>

      {voted === null ? (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleVote(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" />
            Sim, ajudou
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="w-4 h-4" />
            Não ajudou
          </button>
        </div>
      ) : voted ? (
        <p className="text-center text-sm text-green-600 font-medium">
          Que ótimo! Fico feliz que tenha ajudado.
        </p>
      ) : (
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <p className="text-center text-sm text-gray-600">
            Sentimos muito. O que poderia ser melhor?
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Descreva o que estava procurando..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Enviar feedback
          </button>
        </form>
      )}
    </div>
  );
}
