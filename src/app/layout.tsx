import type { Metadata } from "next";
import { ZustandProvider } from "@/stores/ZustandProvider";
import { ZustandThemeProvider } from "./ZustandThemeProvider";
import ClientStyleRegistry from "@/lib/emotion/ClientStyleRegistry";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "This or That - Fun Learning Games for Kids",
  description: "Simple educational games for kids to learn numbers, letters, shapes, colors, and patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ClientStyleRegistry>
            <ZustandProvider>
              <ZustandThemeProvider>
                {children}
              </ZustandThemeProvider>
            </ZustandProvider>
          </ClientStyleRegistry>
        </ErrorBoundary>
      </body>
    </html>
  );
} 