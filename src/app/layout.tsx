import type { Metadata } from "next";
import { EnhancedThemeProvider } from "@/theme/EnhancedThemeProvider";
import { SettingsProvider } from "@/context/SettingsContext";
import { UserProvider } from "@/context/UserContext";
import UnifiedDebugBanner from "@/shared/components/debug/UnifiedDebugBanner";

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
        <EnhancedThemeProvider>
          <UserProvider>
            <SettingsProvider>
              <UnifiedDebugBanner />
              {children}
            </SettingsProvider>
          </UserProvider>
        </EnhancedThemeProvider>
      </body>
    </html>
  );
}
