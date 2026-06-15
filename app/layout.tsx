import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1111.tn — Comparateur de prix Tunisie",
  description:
    "Comparez plus de 250 000 produits, surveillez les prix, détectez les vraies promotions et économisez sur tous vos achats en Tunisie.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
