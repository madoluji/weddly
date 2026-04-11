import "./ui/globals.css";
import { montserrat, playfairDisplay, inter, notoSerif } from "./ui/fonts";
import AuthProvider from "./providers";
import Appcontextprovider from "./context/appContext";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import { UserAccessProvider } from "./ui/UserAccessProvider";
import { ThemeScript } from "@/app/ui/ThemeScript";
import { ThemeProvider } from "@/app/context/ThemeProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`scroll-smooth subpixel-antialiased ${inter.variable} ${notoSerif.variable} ${montserrat.variable} ${playfairDisplay.variable} ${montserrat.className}`}
    >
      <head>
        <ThemeScript />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <title>Weddly</title>
      </head>
      <body className="bg-white dark:bg-dark-background text-on-surface dark:text-dark-on-surface">
        <div className="min-h-screen bg-white dark:bg-dark-background">
          <AuthProvider session={session}>
            <UserAccessProvider>
              <ThemeProvider defaultTheme="light" storageKey="weddly-theme">
                <Appcontextprovider>{children}</Appcontextprovider>
              </ThemeProvider>
            </UserAccessProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
