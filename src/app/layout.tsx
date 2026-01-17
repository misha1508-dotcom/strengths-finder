import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Найди свои сильные стороны | Бесплатный AI-анализ личности",
  description: "Бесплатное психологическое упражнение для самопознания. Опиши 2-15 жизненных ситуаций — AI найдёт твои качества, сильные стороны и подскажет, где тебе будет легко.",
  keywords: ["сильные стороны", "самопознание", "психология", "тест личности", "профориентация", "AI анализ"],
  authors: [{ name: "Михаил", url: "https://t.me/krechet_mike" }],
  creator: "Михаил",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "Найди свои сильные стороны | Бесплатный AI-анализ",
    description: "Опиши ситуации из жизни — AI найдёт твои качества, сильные стороны и подскажет идеальные роли для тебя",
    siteName: "Strengths Finder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Найди свои сильные стороны",
    description: "Бесплатный AI-анализ личности через жизненные ситуации",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
