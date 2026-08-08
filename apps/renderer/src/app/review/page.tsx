import type { Metadata } from "next";
import { ReviewShell } from "./review-shell";

export const metadata: Metadata = { title: "Review · htmlpub" };

export default function ReviewPage() {
  return <ReviewShell />;
}
