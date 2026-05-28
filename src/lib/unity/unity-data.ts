/* eslint-disable @typescript-eslint/no-explicit-any */
/* prettier-ignore */

export interface UnityData {
  title: string;
  description: string;
  path: string;
  pratica?: string;
  api?: string;
  data?: string;
}

export function getData(): UnityData[] {
  return [
    {
      title: "Tiferet",
      description: "Beleza - O coração do árbol da vida",
      path: "/dashboard/tiferet",
      pratica: "Prática de Tiferet",
      api: "api/tiferet",
    },
    {
      title: "Hod",
      description: "Glória - A persistência sagrada",
      path: "/dashboard/hod",
      pratica: "Prática de Hod",
      api: "api/hod",
    },
    {
      title: "Netzah",
      description: "Vitória - A eternidade do compromisso",
      path: "/dashboard/netzah",
      pratica: "Prática de Netzah",
      api: "api/netzah",
    },
    {
      title: "Gevurah",
      description: "Força - A justa restrição",
      path: "/dashboard/gevurah",
      pratica: "Prática de Gevurah",
      api: "api/gevurah",
    },
    {
      title: "Hesed",
      description: "Amor - A extensão infinita",
      path: "/dashboard/hesed",
      pratica: "Prática de Hesed",
      api: "api/hesed",
    },
    {
      title: "Biná",
      description: "Compreensão - A sabedoria aplicada",
      path: "/dashboard/bina",
      pratica: "Prática de Biná",
      api: "api/bina",
    },
    {
      title: "Daat",
      description: "Conhecimento - A síntese do conhecimento oculto",
      path: "/dashboard/daat",
      pratica: "Prática de Daat",
      api: "api/daat",
    },
    {
      title: "Keter",
      description: "Coroa - A vontade divina suprema",
      path: "/dashboard/keter",
      pratica: "Prática de Keter",
      api: "api/keter",
    },
    {
      title: "Malchut",
      description: "Reino - A presença divina no mundo físico",
      path: "/dashboard/malchut",
      pratica: "Prática de Malchut",
      api: "api/malchut",
    },
    {
      title: "Yesod",
      description: "Fundação - A base da realidade etérea",
      path: "/dashboard/yesod",
      pratica: "Prática de Yesod",
      api: "api/yesod",
    },
    {
      title: "Chesed",
      description: "Gentileza - A misericórdia infinita",
      path: "/dashboard/chesed",
      pratica: "Prática de Chesed",
      api: "api/chesed",
    },
    {
      title: "Chocmá",
      description: "Sabedoria - A centelha da iluminação",
      path: "/dashboard/chocma",
      pratica: "Prática de Chocmá",
      api: "api/chocma",
    },
  ];
}
