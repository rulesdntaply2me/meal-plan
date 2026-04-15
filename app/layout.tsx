import React from "react";

export const metadata = {
  title: "Sclass Savory App",
  description: "Savory meal builder for Sclass Fitness",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
