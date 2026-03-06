import {
  Fraunces,
  Instrument_Serif,
  Inter,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Roboto_Mono,
  Space_Grotesk,
} from "next/font/google";
import localFont from "next/font/local";

// 1. Configure local fonts
export const testDieGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/Test Die Grotesk/test-die-grotesk-vf-roman.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/Test Die Grotesk/test-die-grotesk-vf-italic.woff2",
      style: "italic",
    },
  ],
  weight: "100 900",
  variable: "--font-app",
});

export const replica = localFont({
  src: [
    {
      path: "../../public/fonts/Replica/ReplicaTrial-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Replica/ReplicaTrial-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-replica",
});

// 2. Configure Google fonts
const _inter = Inter({ subsets: ["latin"], variable: "--font-app" });
const _robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-app" });
const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-app",
});
const _fraunces = Fraunces({ subsets: ["latin"], variable: "--font-app" });
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-app",
});
const _outfit = Outfit({ subsets: ["latin"], variable: "--font-app" });
const _plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-app",
});
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

// 3. Select the font you want to use by uncommenting ONE line below
// export const activeFont = inter;
// export const activeFont = robotoMono;
// export const activeFont = playfair;
// export const activeFont = fraunces;
// export const activeFont = spaceGrotesk;
// export const activeFont = outfit;
// export const activeFont = plusJakarta;
export const activeFont = testDieGrotesk;
