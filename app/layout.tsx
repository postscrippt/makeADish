import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "AI Menu",
  description: "ผู้ช่วยทำอาหารจากวัตถุดิบในครัวคุณ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-200 font-sans text-zinc-900">
        {/* Phone-width column; centered on desktop so it looks like the LINE in-app view. */}
        <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-white shadow-sm">
          {children}
        </div>
      </body>
    </html>
  );
}
