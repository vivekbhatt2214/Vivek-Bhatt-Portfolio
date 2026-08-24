import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vivek Bhatt | Data Analyst & Developer",
  description: "Portfolio of Vivek Bhatt — data analytics, dashboards, web development and projects.",
  keywords: ["Vivek Bhatt", "Data Analyst", "Power BI", "Excel", "SQL", "Next.js", "Portfolio"]
};

/**
 * Root layout intentionally contains NO public/admin navigation.
 * This keeps the private /admin workspace isolated from the public portfolio.
 * Public navigation is rendered only on public portfolio/case-study pages.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div id="top" />
        {children}
      </body>
    </html>
  );
}
