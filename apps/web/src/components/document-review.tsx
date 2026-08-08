"use client";

import type { ReviewStatus } from "@htmlpub/core";
import { ReviewWorkspace } from "@htmlpub/ui/components/review-workspace";

export function DocumentReview({ slug, title, src, rawSrc, initialReview }: { slug: string; title: string; src: string; rawSrc: string; initialReview: ReviewStatus }) {
  return <ReviewWorkspace title={title} src={src} rawSrc={rawSrc} initialReview={initialReview} reviewPath={`/api/v1/documents/${encodeURIComponent(slug)}/review`} />;
}
