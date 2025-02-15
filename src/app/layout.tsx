import type { Metadata } from "next";
import QueryProvider from "./payments/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Next App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"min-h-screen bg-background font-sans antialiased"}>
        <QueryProvider children={children} />
      </body>
    </html>
  );
}
