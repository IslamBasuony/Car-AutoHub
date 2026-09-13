import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CarStoreProvider } from "@/components/CarStore";
import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "AutoHub — New & Used Cars",
  description:
    "Browse new and pre-owned cars — real Wikimedia Commons photos, community listings, and premium vehicles.",
};

const themeInit = `(function(){try{var s=localStorage.getItem("car-app-theme");if(s!=="dark"&&s!=="light"){s=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";}document.documentElement.setAttribute("data-theme",s);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeProvider>
          <CarStoreProvider>
            <TooltipProvider>
              <ToastProvider>
                <Navbar />
                <main className="pt-16 min-h-[72vh]">{children}</main>
                <Footer />
              </ToastProvider>
            </TooltipProvider>
          </CarStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}