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
  title: "Инверсия | Преврати провалы в сильные стороны",
  description: "Бесплатный AI-инструмент самопознания. Опиши свои провалы и неудачи — нейросеть найдёт скрытые качества и покажет твои настоящие сильные стороны.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔄</text></svg>",
  },
  keywords: ["инверсия", "сильные стороны", "самопознание", "психология", "провалы", "AI анализ", "личностный рост"],
  authors: [{ name: "Михаил", url: "https://t.me/krechet_mike" }],
  creator: "Михаил",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "Инверсия | Преврати провалы в сильные стороны",
    description: "Опиши свои провалы — AI найдёт в них скрытые качества и покажет твои настоящие сильные стороны",
    siteName: "Инверсия",
  },
  twitter: {
    card: "summary_large_image",
    title: "Инверсия | Провалы → Сильные стороны",
    description: "Бесплатный AI-инструмент: преврати неудачи в понимание себя",
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
