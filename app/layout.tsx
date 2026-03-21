import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GrindBoard — Study Platform for Exam Preparation",
    template: "%s | GrindBoard",
  },
  description:
    "Pomodoro timer, study schedule, topic tracking, flashcards, and study statistics. Organize your study sessions and ace your exams.",
  keywords: [
    "study app",
    "pomodoro timer",
    "exam preparation",
    "study schedule",
    "topic tracking",
    "flashcards",
    "study statistics",
  ],
  metadataBase: new URL("https://grindboard.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://grindboard.org",
    siteName: "GrindBoard",
    title: "GrindBoard — Study Platform for Exam Preparation",
    description:
      "Pomodoro timer, study schedule, topic tracking, flashcards, and study statistics. Organize your study sessions and ace your exams.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GrindBoard — Study Platform for Exam Preparation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GrindBoard — Study Platform for Exam Preparation",
    description:
      "Pomodoro timer, study schedule, topic tracking, flashcards, and study statistics. Organize your study sessions and ace your exams.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className="scroll-smooth">
      <body className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
