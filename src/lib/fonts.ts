import { Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";

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
  display: "swap",
});

export const replica = localFont({
  src: [
    {
      path: "../../public/fonts/Replica/ReplicaTrial-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Replica/ReplicaTrial-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-replica",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const activeFont = testDieGrotesk;
