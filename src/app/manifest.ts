import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Katalume",
    short_name: "Katalume",
    description:
      "Katalume is the training ground for machine learning — solve real ML problems in an in-browser judge, compete in contests, and climb to mastery. LeetCode rigor meets Kaggle depth.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f0e47",
    icons: [
      {
        src: "/brand/katalume-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
