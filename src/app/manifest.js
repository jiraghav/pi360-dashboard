export default function manifest() {
  return {
    id: "/",
    name: "PI360 Dashboard",
    short_name: "PI360",
    description: "Complete Injury Centers — PI360 dashboard",
    lang: "en",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "fullscreen",
    orientation: "portrait-primary",
    background_color: "#0b0f16",
    theme_color: "#0b0f16",
    categories: ["medical", "business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
