import {
    Inter,
    Roboto_Mono,
    Playfair_Display,
    Fraunces,
    Space_Grotesk,
    Outfit,
    Plus_Jakarta_Sans,
} from "next/font/google";

// 1. Configure your fonts here
const inter = Inter({ subsets: ["latin"], variable: "--font-app" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-app" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-app" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-app" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-app" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-app" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-app" });

// 2. Select the font you want to use by uncommenting ONE line below
// export const activeFont = inter;
// export const activeFont = robotoMono;
// export const activeFont = playfair;
// export const activeFont = fraunces;
// export const activeFont = spaceGrotesk;
export const activeFont = outfit;
//export const activeFont = plusJakarta;
