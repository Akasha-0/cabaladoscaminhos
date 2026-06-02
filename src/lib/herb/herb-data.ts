// Herb data - culinary and medicinal properties
// @ts-nocheck

export interface HerbProperties {
  name: string;
  scientificName: string;
  family: string;
  flavor: string[];
  uses: string[];
  properties: string[];
}

export interface HerbData {
  [key: string]: HerbProperties;
}

const herbs: HerbData = {
  "alecrim": {
    name: "Alecrim",
    scientificName: "Rosmarinus officinalis",
    family: "Lamiaceae",
    flavor: ["pinheiro", "cítrico", "terroso"],
    uses: ["culinária", "medicina", "aromaterapia"],
    properties: ["anti-inflamatório", "antioxidante", "estimulante"]
  },
  "manjericão": {
    name: "Manjericão",
    scientificName: "Ocimum basilicum",
    family: "Lamiaceae",
    flavor: ["doce", "anisado", "picante"],
    uses: ["culinária", "medicina", "ornamental"],
    properties: ["anti-inflamatório", "antimicrobial", "antioxidante"]
  },
  "hortelã": {
    name: "Hortelã",
    scientificName: "Mentha piperita",
    family: "Lamiaceae",
    flavor: ["mentolado", "fresco", "adocicado"],
    uses: ["culinária", "medicina", "bebidas"],
    properties: ["digestivo", "antiespasmódico", "refrigerante"]
  },
  "sálvia": {
    name: "Sálvia",
    scientificName: "Salvia officinalis",
    family: "Lamiaceae",
    flavor: ["amargo", "terroso", "canforado"],
    uses: ["culinária", "medicina", "cosmético"],
    properties: ["antisséptico", "adstringente", "anti-inflamatório"]
  },
  "tomilho": {
    name: "Tomilho",
    scientificName: "Thymus vulgaris",
    family: "Lamiaceae",
    flavor: ["terroso", "fungos", "pimentado"],
    uses: ["culinária", "medicina", "aromaterapia"],
    properties: ["antisséptico", "expectorante", "antioxidante"]
  },
  "orégano": {
    name: "Orégano",
    scientificName: "Origanum vulgare",
    family: "Lamiaceae",
    flavor: ["pungente", "picante", "herbáceo"],
    uses: ["culinária", "medicina", "conservante"],
    properties: ["antimicrobial", "antioxidante", "anti-inflamatório"]
  },
  "louro": {
    name: "Louro",
    scientificName: "Laurus nobilis",
    family: "Lauraceae",
    flavor: ["amargo", "terroso", "aromático"],
    uses: ["culinária", "medicina", "aromaterapia"],
    properties: ["digestivo", "antisséptico", "anti-inflamatório"]
  },
  "cebolinha": {
    name: "Cebolinha",
    scientificName: "Allium schoenoprasum",
    family: "Amaryllidaceae",
    flavor: ["cebola suave", "cítrico", "fresco"],
    uses: ["culinária", "decorativo"],
    properties: ["antioxidante", "digestivo leve"]
  },
  "salsa": {
    name: "Salsa",
    scientificName: "Petroselinum crispum",
    family: "Apiaceae",
    flavor: ["verde", " herbáceo", "citrino"],
    uses: ["culinária", "medicina", "decorativo"],
    properties: ["diurético", "antioxidante", "anti-inflamatório"]
  },
  "coentro": {
    name: "Coentro",
    scientificName: "Coriandrum sativum",
    family: "Apiaceae",
    flavor: ["cítrico", "pinho", "sabonete"],
    uses: ["culinária", "medicina", "bebidas"],
    properties: ["digestivo", "antioxidante", "antimicrobial"]
  },
  "endro": {
    name: "Endro",
    scientificName: "Anethum graveolens",
    family: "Apiaceae",
    flavor: ["alcaravia", "anis", "limão"],
    uses: ["culinária", "medicina", "conservante"],
    properties: ["digestivo", "antisséptico", "antioxidante"]
  },
  "estragão": {
    name: "Estragão",
    scientificName: "Artemisia dracunculus",
    family: "Asteraceae",
    flavor: ["anis", "doce", "pungente"],
    uses: ["culinária", "medicina", "vinagre"],
    properties: ["digestivo", "diurético", "anti-inflamatório"]
  },
  "poejo": {
    name: "Poejo",
    scientificName: "Mentha pulegium",
    family: "Lamiaceae",
    flavor: ["mentolado", "pungente", "herbáceo"],
    uses: ["medicina", "aromaterapia", "culinária"],
    properties: ["digestivo", "antisséptico", "expectorante"]
  },
  "lavanda": {
    name: "Lavanda",
    scientificName: "Lavandula angustifolia",
    family: "Lamiaceae",
    flavor: ["floral", "herbáceo", "doce"],
    uses: ["aromaterapia", "cosmético", "medicina"],
    properties: ["calmante", "antisséptico", "anti-inflamatório"]
  },
  "camomila": {
    name: "Camomila",
    scientificName: "Matricaria chamomilla",
    family: "Asteraceae",
    flavor: ["doce", "floral", "maçã"],
    uses: ["medicina", "bebidas", "cosmético"],
    properties: ["calmante", "anti-inflamatório", "digestivo"]
  },
  "boldo": {
    name: "Boldo",
    scientificName: "Peumus boldus",
    family: "Monimiaceae",
    flavor: ["amargo", "terroso", "pinho"],
    uses: ["medicina", "culinária"],
    properties: ["digestivo", "hepático", "anti-inflamatório"]
  },
  "guaçatonga": {
    name: "Guaçatonga",
    scientificName: "Casearia sylvestris",
    family: "Salicaceae",
    flavor: ["amargo", "pungente"],
    uses: ["medicina tradicional"],
    properties: ["anti-inflamatório", "analgésico", "antimicrobial"]
  },
  "ipê-roxo": {
    name: "Ipê-roxo",
    scientificName: "Handroanthus impetiginosus",
    family: "Bignoniaceae",
    flavor: ["terroso", "amargo"],
    uses: ["medicina tradicional"],
    properties: ["anti-inflamatório", "antibacteriano", "antifúngico"]
  },
  "cravagem": {
    name: "Cravagem",
    scientificName: "Lilium brownii",
    family: "Liliaceae",
    flavor: ["doce", "floral"],
    uses: ["medicina tradicional"],
    properties: ["calmante", "expectorante"]
  },
  "carqueja": {
    name: "Carqueja",
    scientificName: "Baccharis trimera",
    family: "Asteraceae",
    flavor: ["amargo", "herbáceo"],
    uses: ["medicina tradicional"],
    properties: ["digestivo", "hepático", "anti-inflamatório"]
  },
  "quebra-pedra": {
    name: "Quebra-pedra",
    scientificName: "Phyllanthus niruri",
    family: "Phyllanthaceae",
    flavor: ["amargo", "adstringente"],
    uses: ["medicina tradicional"],
    properties: ["diurétic", "litolítico", "anti-inflamatório"]
  },
  "espinheira-santa": {
    name: "Espinheira-santa",
    scientificName: "Maytenus ilicifolia",
    family: "Celastraceae",
    flavor: ["amargo", "adstringente"],
    uses: ["medicina tradicional"],
    properties: ["anti-ulceroso", "anti-inflamatório", "antimicrobial"]
  }
}

export function getData(): HerbData {
  return herbs
}

export default herbs
