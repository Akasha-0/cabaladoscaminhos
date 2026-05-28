export interface ManifestData {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  orientation: string;
  background_color: string;
  theme_color: string;
  scope: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }>;
  categories: string[];
  screenshots: unknown[];
  shortcuts: Array<{
    name: string;
    short_name: string;
    description: string;
    url: string;
    icons: Array<{ src: string; sizes: string }>;
  }>;
  prefer_related_applications: boolean;
  related_applications: unknown[];
}

export function getData(): ManifestData {
  return {
    name: "Cabala dos Caminhos",
    short_name: "Cabala",
    description: "Plataforma digital de autoconhecimento espiritual unificado",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#020617",
    theme_color: "#4338ca",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    categories: ["lifestyle", "health", "education"],
    screenshots: [],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Home",
        description: "Ir para o dashboard principal",
        url: "/dashboard",
        icons: [{ src: "/icons/shortcut-dashboard.png", sizes: "96x96" }]
      },
      {
        name: "Rituals",
        short_name: "Rituals",
        description: "Acessar rituals sagrados",
        url: "/dashboard/rituals",
        icons: [{ src: "/icons/shortcut-rituals.png", sizes: "96x96" }]
      }
    ],
    prefer_related_applications: false,
    related_applications: []
  };
}