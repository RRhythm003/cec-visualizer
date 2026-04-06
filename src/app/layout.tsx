import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { MeetingProvider } from "@/context/MeetingContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CEC Meeting Visualizer — IDLC Finance PLC",
  description:
    "Credit Evaluation Committee Meeting Visualizer — interactive proposal management for CEC meetings.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>
          <MeetingProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #E4E4E0",
                },
              }}
            />
          </MeetingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
