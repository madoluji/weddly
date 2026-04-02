import { Montserrat, Playfair_Display, Inter, Noto_Serif } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
  variable: "--font-montserrat",
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  preload: false,
  variable: "--font-playfair-display",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
  variable: "--font-inter",
});

export const notoSerif = Noto_Serif({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
  preload: false,
  variable: "--font-noto-serif",
});

export const poppins = montserrat;