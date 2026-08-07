import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Clínica Amalia", template: "%s · Clínica Amalia" },
  description: "Entorno demostrativo privado para la gestión clínica de Clínica Amalia.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
