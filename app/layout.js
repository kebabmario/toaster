import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const font = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font" });

export const metadata = {
  title: "Toaster — Internet speed test",
  description: "A fast, minimal internet speed test.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}
