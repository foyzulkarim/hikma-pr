import React from "react";
import "./globals.css";

export const metadata = {
  title: "Hikma PR Reviews - Database Viewer",
  description: "View PR review entries from the Hikma PR database",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
