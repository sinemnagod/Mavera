import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mavera",
  description: "Restaurant operations system for a five-location group in Istanbul.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-100">
        <div className="hidden lg:flex lg:flex-1 lg:flex-col">{children}</div>

        {/* Below 1024px: Mavera's dense operational screens don't fit a phone.
            The AI chat panel is the one exception once it exists (SPEC.md responsive strategy). */}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center lg:hidden">
          <h1 className="text-2xl font-semibold">Mavera is built for tablet and desktop</h1>
          <p className="max-w-sm text-stone-400">
            Floor plans, kitchen rails, and five-location dashboards need more room than a phone
            screen gives them. Open Mavera on a tablet or a larger display.
          </p>
        </div>
      </body>
    </html>
  );
}
