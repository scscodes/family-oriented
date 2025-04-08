import type { Metadata } from "next";

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
        {children}
      </body>
    </html>
  );
}
