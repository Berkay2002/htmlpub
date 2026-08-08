import { Toaster } from "sonner";
import "./globals.css";

export default function RendererLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<Toaster position="bottom-right" richColors /></body></html>;
}
