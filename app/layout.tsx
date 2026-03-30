import "./ui/globals.css";
import { montserrat, playfairDisplay, inter, notoSerif } from "./ui/fonts";
import AuthProvider from "./providers";
import Appcontextprovider from "./context/appContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`scroll-smooth subpixel-antialiased ${inter.variable} ${notoSerif.variable} ${montserrat.variable} ${playfairDisplay.variable} ${montserrat.className}`}
    >
      <head>
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
      <body>
        <div className="min-h-screen">
          <AuthProvider>
            <Appcontextprovider>{children}</Appcontextprovider>
          </AuthProvider>

        </div>
      </body>
    </html>
  );
}
