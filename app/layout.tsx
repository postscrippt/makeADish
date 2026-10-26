import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import LiffBoot from "@/components/LiffBoot";

// Prompt: Thai + Latin geometric face that pairs with the deck's Poppins look.
const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MakeADish",
  description: "ถ่ายรูปวัตถุดิบในครัว แล้วหาเมนูที่ทำได้เลย",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${prompt.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Runs before the first paint: a LIFF link lands on "/" with ?liff.state=… and is forwarded a moment later,
            so hide the home page instead of flashing it. LiffBoot shows it again if no forward happens. */}
        <script dangerouslySetInnerHTML={{ __html: `if(location.search.indexOf("liff.state")>-1)document.documentElement.classList.add("liff-forwarding")` }} />
      </head>
      <body className="min-h-full bg-brand font-sans text-ink">
        {/* Phone-width column; centered on desktop so it looks like the LINE in-app view. */}
        <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-mist shadow-card">
          {children}
        </div>
        <LiffBoot />
      </body>
    </html>
  );
}
