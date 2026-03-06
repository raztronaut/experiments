export interface PaintingData {
  artist: string;
  depthPath: string; // The depth map
  description?: string;
  imagePath: string; // The original image
  title: string;
  year: string;
}

export const PAINTINGS: PaintingData[] = [
  {
    title: "Nighthawks",
    artist: "Edward Hopper",
    year: "1942",
    imagePath: "/experiments/cursor-depth-explorer/nighthawks.jpg",
    depthPath: "/experiments/cursor-depth-explorer/depth.png",
  },
  {
    title: "The Astronomer",
    artist: "Johannes Vermeer",
    year: "c. 1668",
    imagePath: "/experiments/cursor-depth-explorer/theastronomer.jpg",
    depthPath: "/experiments/cursor-depth-explorer/depth2.png",
  },
  {
    title: "Wanderer above the Sea of Fog",
    artist: "Caspar David Friedrich",
    year: "1818",
    imagePath: "/experiments/cursor-depth-explorer/wandererabovethesea.jpeg",
    depthPath: "/experiments/cursor-depth-explorer/depth3.png",
  },
  {
    title: "The Carpet Merchant",
    artist: "Jean-Léon Gérôme",
    year: "1887",
    imagePath: "/experiments/cursor-depth-explorer/carpetmerchent.jpg",
    depthPath: "/experiments/cursor-depth-explorer/depth4.png",
  },
  {
    title: "Napoleon Crossing the Alps",
    artist: "Jacques-Louis David",
    year: "1801",
    imagePath: "/experiments/cursor-depth-explorer/crossingthealps.jpg",
    depthPath: "/experiments/cursor-depth-explorer/depth5.png",
  },
];
