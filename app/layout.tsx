"use client";
import "./ui/globals.css";
import { montserrat, playfairDisplay } from "./ui/fonts";
import AuthProvider from "./providers";
import Appcontextprovider from "./context/appContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth subpixel-antialiased ">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <link rel="icon" href="/favicon.ico" />
        <title>Weddly</title>
      </head>
      <body>
        <div
          className={`min-h-screen ${montserrat.variable} ${playfairDisplay.variable} ${montserrat.className}`}
        >
          <AuthProvider>
            <Appcontextprovider>{children}</Appcontextprovider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
