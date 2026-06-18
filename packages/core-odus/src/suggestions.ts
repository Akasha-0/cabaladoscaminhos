// Ritual Suggestions based on Odu - Cabala Dos Caminhos
// Traditional Ifa practices for each of the 16 Merindilogun Odus
import { Odu, getOduNome } from './draw';

// Ebós (Sacrificial Offerings)
export interface Ebo {
  nome: string;
  descricao: string;
  elementos: string[];
  oracoes?: string[];
}

// Oraciones (Prayers)
export interface Oracion {
  texto: string;
  idioma: 'yoruba' | 'portugues' | '两者';
  momento: 'antes' | 'despues' | 'durante';
}

// Banhos (Ritual Baths)
export interface Banho {
  nome: string;
  ingredientes: string[];
  modoPreparo: string;
  frecuencia: string;
}

// Complete ritual suggestion set for an Odu
export interface RitualSuggestion {
  odu: number;
  oduNome: string;
  ebos: Ebo[];
  oraciones: Oracion[];
  banhos: Banho[];
  notasAdicionales?: string[];
}

// EBÓS (Sacrificial Offerings) for each Odu
const ebosPorOdu: Record<number, Ebo[]> = {
  1: [
    // Oyeku
    {
      nome: 'Ebo de Ossos de Animais',
      descricao: 'Sacrifício de ossos para proteção contra entidades negativas',
      elementos: ['ossos de galinha', 'fumo de palo', 'akoko leaf', 'dinheiro cobntado'],
    },
  ],
  2: [
    // Iwori
    {
      nome: 'Ebo de Áudio',
      descricao: 'Sacrifício para conhecimento ancestral e sabedoria',
      elementos: ['coco fresco', 'mel de abelha', 'farinha de inhame', 'ogbe frasco'],
    },
  ],
  3: [
    // Odi
    {
      nome: 'Ebo de Olho',
      descricao: 'Proteção contra mau-olhado e inveja',
      elementos: ['gema de ovo cru', 'alcool', 'farinha de milo', 'pedra de proteção'],
    },
  ],
  4: [
    // Ossa
    {
      nome: 'Ebo de Fogo',
      descricao: 'Purificação e afastamento de feitiçaria',
      elementos: ['palha seca', 'cabaça queimada', 'cabaça queimada', 'cinzas sagradas'],
    },
  ],
  5: [
    // Iwonrin
    {
      nome: 'Ebo de Longevidade',
      descricao: 'Sacrifício para saúde e vida longa',
      elementos: ['cabrito branco', 'farinha de arroz', 'coco', 'mel'],
    },
  ],
  6: [
    // Obara
    {
      nome: 'Ebo de Justice',
      descricao: 'Sacrifício para reparação de injustiças',
      elementos: ['pano branco', 'alcool de palma', 'noz de cola', 'obí'],
    },
  ],
  7: [
    // Okanran
    {
      nome: 'Ebo de Prosperidade',
      descricao: 'Sacrifício para abundância material',
      elementos: ['dinheiro novo', 'akara frito', 'ogbe frasco', 'milho'],
    },
  ],
  8: [
    // Ogo
    {
      nome: 'Ebo de Visibilidade',
      descricao: 'Sacrifício para ser visto e reconhecido',
      elementos: ['espelho pequeno', 'alcool', 'farinha de mandioca', 'pimenta'],
    },
  ],
  9: [
    // Owonrin
    {
      nome: 'Ebo de Fuga',
      descricao: 'Sacrifício para escapar de problemas e inimigos',
      elementos: ['pano azul', 'cabaça', 'alho', 'vinagre'],
    },
  ],
  10: [
    // Obatala
    {
      nome: 'Ebo de Pureza',
      descricao: 'Sacrifício para limpeza espiritual e branca',
      elementos: ['pano branco', 'leite de coco', 'farinha de inhame', 'coco branco'],
    },
  ],
  11: [
    // Ofrenda de Paz
    {
      nome: 'Ebo de Harmonia',
      descricao: 'Sacrifício para paz e reconciliación',
      elementos: ['pomba branca', 'farinha branca', 'coco', 'mel'],
    },
  ],
  12: [
    // Iragbe
    {
      nome: 'Ebo de Fertilidad',
      descricao: 'Sacrifício para fertilidade y descendencia',
      elementos: ['cabrito manchado', 'ogbe frasco', 'planta de fertility', 'dinheiro'],
    },
  ],
  13: [
    // Ose
    {
      nome: 'Ebo de Victoria',
      descricao: 'Sacrifício para vitória em disputas y batallas',
      elementos: ['gallina negra', 'akoko leaf', 'vinagre', 'alho'],
    },
  ],
  14: [
    // Ofun
    {
      nome: 'Ebo de Sanación',
      descricao: 'Sacrifício para cura de enfermedades',
      elementos: ['coco fresco', 'hierbas medicinales', 'mel de abelha', 'farinha'],
    },
  ],
  15: [
    // Ologbosere
    {
      nome: 'Ebo de Fuerza',
      descricao: 'Sacrifício para força y poder',
      elementos: ['bode negro', 'akoko leaf', 'palma oil', 'ogbe frasco'],
    },
  ],
  16: [
    // Oji
    {
      nome: 'Ebo de Abundancia',
      descricao: 'Sacrifício para prosperidade y buena cosecha',
      elementos: ['dinheiro', 'granos de maíz', 'coco', 'ogbe frasco'],
    },
  ],
};

// ORACIONES (Prayers) for each Odu
const oracionesPorOdu: Record<number, Oracion[]> = {
  1: [
    {
      texto: 'Oyeku, oyeku, libame das trevas',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Eji Ogbe, open me to the ancestors',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  2: [
    {
      texto: 'Iwori, dame sabiduria para ver la verdad',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Ori, guide my path',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  3: [
    {
      texto: 'Odi, protecteme del mal de ojo',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Olodumare, shield your child',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  4: [
    {
      texto: 'Ossa, purifica mi ser con fuego sagrado',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Ogun, cleanse all negativity',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  5: [
    {
      texto: 'Iwonrin, dame vida longa y salud',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Olodumare, grant me longevity',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  6: [
    {
      texto: 'Obara, haz justicia en mi causa',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Ogun, fight for my rights',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  7: [
    {
      texto: 'Okanran, abre las puertas de la abundancia',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Ogun, provide for your children',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  8: [
    {
      texto: 'Ogo, hazme visible ante el mundo',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Olodumare, let my light shine',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  9: [
    {
      texto: 'Owonrin, libame de mis enemigos',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Eshu, protect me from harm',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  10: [
    {
      texto: 'Obatala, limpia mi alma de toda mancha',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Orunmila, purify my spirit',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  11: [
    {
      texto: 'Ofrenda, trae paz a mi hogar',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Olodumare, bring peace to my house',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  12: [
    {
      texto: 'Iragbe, bendice mi descendencia',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Olodumare, bless my lineage',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  13: [
    {
      texto: 'Ose, dame la victoria en mi batalla',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Ogun, grant me victory',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  14: [
    {
      texto: 'Ofun, cura mi cuerpo y mi alma',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Olodumare, heal your servant',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  15: [
    {
      texto: 'Ologbosere, dame fuerza para continuar',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Ogun, give me strength',
      idioma: '两者',
      momento: 'antes',
    },
  ],
  16: [
    {
      texto: 'Oji, abre los caminos de la prosperidad',
      idioma: 'portugues',
      momento: 'durante',
    },
    {
      texto: 'Olodumare, open the paths of abundance',
      idioma: '两者',
      momento: 'antes',
    },
  ],
};

// BANHOS (Ritual Baths) for each Odu
const banhosPorOdu: Record<number, Banho[]> = {
  1: [
    {
      nome: 'Banho de Ossos',
      ingredientes: ['casca de árbol de hueso', 'albahaca santa', 'agua de lluvia', 'sal marina'],
      modoPreparo:
        'Herver todos los ingredientes por 30 minutos, colar y dejar enfriar antes de bañarse',
      frecuencia: '2 veces por semana durante 21 días',
    },
  ],
  2: [
    {
      nome: 'Banho de Sabiduria',
      ingredientes: ['hojas de coco', 'agua de coco', 'flores blancas', 'VERBENA'],
      modoPreparo:
        'Machacar las hojas, mezclar con agua de coco, agregar flores y dejar reposar toda la noche',
      frecuencia: '3 veces por semana durante 14 días',
    },
  ],
  3: [
    {
      nome: 'Banho de Proteccion',
      ingredientes: ['aloe vera', 'ajo machacado', 'agua de mar', 'romero'],
      modoPreparo: 'Mezclar aloe vera con ajo machacado en agua de mar, agregar romero y bañarse',
      frecuencia: 'Una vez al día por 7 días',
    },
  ],
  4: [
    {
      nome: 'Banho de Fuego',
      ingredientes: ['pimienta de cravo', 'canela', 'agua caliente', 'ceniza sagrada'],
      modoPreparo:
        'Mezclar cravo y canela en agua caliente, agregar ceniza sagrada, bañarse inmediatamente',
      frecuencia: 'Una vez al día por 3 días',
    },
  ],
  5: [
    {
      nome: 'Banho de Longevidad',
      ingredientes: ['hojas de guayaba', 'jengibre', 'agua de lluvia', 'miel'],
      modoPreparo: 'Herver las hojas de guayaba con jengibre, agregar agua de lluvia y miel',
      frecuencia: '2 veces por semana durante 1 mes',
    },
  ],
  6: [
    {
      nome: 'Banho de Justicia',
      ingredientes: ['agua de rosas', 'lavanda', 'sal gruesa', 'jabon blanco'],
      modoPreparo: 'Mezclar agua de rosas con lavanda y sal gruesa, usar jabon blanco para bañarse',
      frecuencia: '3 veces por semana hasta resolver el asunto',
    },
  ],
  7: [
    {
      nome: 'Banho de Prosperidad',
      ingredientes: ['hojas de dinero', 'agua de siete mares', 'ajo', 'cobre'],
      modoPreparo:
        'Herver las hojas de dinero con ajo en agua de siete mares, agregar una moneda de cobre',
      frecuencia: 'Cada lunes por 4 semanas',
    },
  ],
  8: [
    {
      nome: 'Banho de Visibilidad',
      ingredientes: ['flores amarillas', 'agua de sol', 'miel', 'canela'],
      modoPreparo: 'Dejar flores amarillas en agua al sol por 3 horas, agregar miel y canela',
      frecuencia: '2 veces por semana por 21 días',
    },
  ],
  9: [
    {
      nome: 'Banho de Fuga',
      ingredientes: ['hierbas de protección', 'vinagre blanco', 'ajo', 'agua de lluvia'],
      modoPreparo: 'Mezclar hierbas con vinagre y ajo en agua de lluvia, bañarse rápidamente',
      frecuencia: 'Una vez al día por 9 días',
    },
  ],
  10: [
    {
      nome: 'Banho de Pureza',
      ingredientes: ['leche de coco', 'flores blancas', 'VERBENA', 'agua de lluvia'],
      modoPreparo:
        'Mezclar leche de coco con flores blancas machacadas y verbena en agua de lluvia',
      frecuencia: '2 veces por semana por 1 mes',
    },
  ],
  11: [
    {
      nome: 'Banho de Paz',
      ingredientes: ['flores de azahar', 'lavanda', 'agua de rosas', 'sal rosa'],
      modoPreparo: 'Infusionar flores de azahar con lavanda en agua de rosas, agregar sal rosa',
      frecuencia: 'Cada fin de semana hasta lograr paz',
    },
  ],
  12: [
    {
      nome: 'Banho de Fertilidad',
      ingredientes: ['hojas de higuera', 'coco rallado', 'semillas de sesamo', 'agua tibia'],
      modoPreparo: 'Herver hojas de higuera con coco rallado, agregar semillas de sesamo',
      frecuencia: '2 veces por mes durante 3 meses',
    },
  ],
  13: [
    {
      nome: 'Banho de Victoria',
      ingredientes: ['hierbas de Ogun', 'pimienta', 'agua de rio', 'aceite de palma'],
      modoPreparo: 'Mezclar hierbas de Ogun con pimienta en agua de rio, agregar aceite de palma',
      frecuencia: 'Antes de cualquier batalla o competencia',
    },
  ],
  14: [
    {
      nome: 'Banho de Curación',
      ingredientes: ['hojas medicinales', 'miel', 'ajo', 'agua purificada'],
      modoPreparo: 'Herver hojas medicinales con ajo, agregar miel al enfriarse',
      frecuencia: '2 veces al día hasta recuperación',
    },
  ],
  15: [
    {
      nome: 'Banho de Fuerza',
      ingredientes: ['raiz de ginseng', 'jengibre', 'semillas de success', 'agua caliente'],
      modoPreparo: 'Herver raiz de ginseng con jengibre, agregar semillas y bañarse caliente',
      frecuencia: '3 veces por semana por 21 días',
    },
  ],
  16: [
    {
      nome: 'Banho de Abundancia',
      ingredientes: ['hojas de prosperity', 'coco', 'miel', 'granos de maiz'],
      modoPreparo: 'Herver hojas con coco rallado, agregar miel y granos de maiz',
      frecuencia: 'Cada Luna Nueva por 3 meses',
    },
  ],
};

/**
 * Get complete ritual suggestions for an Odu
 */
export function getRitualSuggestions(odu: Odu | number): RitualSuggestion {
  const oduNum = typeof odu === 'number' ? odu : odu.numero;

  const ebos = ebosPorOdu[oduNum] || [];
  const oraciones = oracionesPorOdu[oduNum] || [];
  const banhos = banhosPorOdu[oduNum] || [];

  return {
    odu: oduNum,
    oduNome: getOduNome(oduNum),
    ebos,
    oraciones,
    banhos,
    notasAdicionales: getNotasAdicionales(oduNum),
  };
}

/**
 * Get additional notes for each Odu
 */
function getNotasAdicionales(numero: number): string[] {
  const notasMap: Record<number, string[]> = {
    1: ['Evitar caminar de noche', 'No consumir alcohol durante 21 días'],
    2: ['Beber agua de coco diariamente', 'Visitar un río al amanecer'],
    3: ['Usar amuleto de protección', 'Evitar contacto con personas negativas'],
    4: ['No comer alimentos rojos', 'Realizar el baño de fuego antes del amanecer'],
    5: ['Dormir temprano', 'Recitar Orikis antes de dormir'],
    6: ['Hablar siempre la verdad', 'Evitar mentiras, aunque sean piadosas'],
    7: ['Plantar una semilla', 'Dar limosna a los necesitados'],
    8: ['Usar ropa de colores claros', 'Evitar ropa oscura por 30 días'],
    9: ['Huir de conflictos', 'No responder a provocaciones'],
    10: ['Vestir de blanco', 'Evitar el alcohol y tabaco'],
    11: ['Reconciliarse con enemigos', 'Perdonar las ofensas pasadas'],
    12: ['Plantar un árbol frutal', 'Cuidar de los niños pequeños'],
    13: ['Usar herramientas de hierro', 'No tener miedo de trabajar'],
    14: ['Guardar ayuno un día a la semana', 'Beber solo agua hervida'],
    15: ['Usar ropa roja en ceremonias', 'Tener siempre un cuchillo handy'],
    16: ['Dar primero a los demás', 'No acumular riqueza'],
  };
  return notasMap[numero] || [];
}

/**
 * Get ritual suggestions for multiple Odus
 */
function getRitualSuggestionsMultiple(odus: (Odu | number)[]): RitualSuggestion[] {
  return odus.map((odu) => getRitualSuggestions(odu));
}

/**
 * Get suggested timing for rituals based on Odu
 */
export function getRitualTiming(oduNum: number): {
  mejorMomento: string;
  diasFavorables: number[];
  禁忌: string[];
} {
  const timingMap: Record<
    number,
    { mejorMomento: string; diasFavorables: number[]; 禁忌: string[] }
  > = {
    1: { mejorMomento: 'Medianoche', diasFavorables: [1, 9, 17], 禁忌: ['Martes'] },
    2: { mejorMomento: 'Amanecer', diasFavorables: [2, 10, 18], 禁忌: ['Domingo'] },
    3: { mejorMomento: 'Mediodia', diasFavorables: [3, 11, 19], 禁忌: ['Jueves'] },
    4: { mejorMomento: 'Antes del amanecer', diasFavorables: [4, 12, 20], 禁忌: ['Viernes'] },
    5: { mejorMomento: 'Mediodia', diasFavorables: [5, 13, 21], 禁忌: ['Domingo'] },
    6: { mejorMomento: 'Tarde', diasFavorables: [6, 14, 22], 禁忌: ['Sabado'] },
    7: { mejorMomento: 'Amanecer', diasFavorables: [7, 15, 23], 禁忌: ['Lunes'] },
    8: { mejorMomento: 'Mediodia', diasFavorables: [8, 16, 24], 禁忌: ['Miercoles'] },
    9: { mejorMomento: 'Medianoche', diasFavorables: [9, 17, 25], 禁忌: ['Domingo'] },
    10: { mejorMomento: 'Mediodia', diasFavorables: [10, 18, 26], 禁忌: ['Martes'] },
    11: { mejorMomento: 'Tarde', diasFavorables: [11, 19, 27], 禁忌: ['Jueves'] },
    12: { mejorMomento: 'Amanecer', diasFavorables: [12, 20, 28], 禁忌: ['Viernes'] },
    13: { mejorMomento: 'Medianoche', diasFavorables: [13, 21, 29], 禁忌: ['Domingo'] },
    14: { mejorMomento: 'Mediodia', diasFavorables: [14, 22, 30], 禁忌: ['Lunes'] },
    15: { mejorMomento: 'Antes del amanecer', diasFavorables: [15, 23, 31], 禁忌: ['Miercoles'] },
    16: { mejorMomento: 'Amanecer', diasFavorables: [16, 24], 禁忌: ['Sabado'] },
  };
  return timingMap[oduNum] || { mejorMomento: 'Indeterminado', diasFavorables: [], 禁忌: [] };
}
