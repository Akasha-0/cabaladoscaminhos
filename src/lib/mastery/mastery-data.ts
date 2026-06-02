// fallow-ignore-file unused-file
export function getData() {
  return {
    practices: [
      {
        id: 'unity',
        name: 'Unidade',
        description: 'Prática de integração e wholeness',
        focus: 'Conectar opostos, integrar sombras, harmonizar polaridades',
      },
      {
        id: 'transcendence',
        name: 'Transcendência',
        description: 'Prática de elevação além do ego',
        focus: 'Soltar apegos, transcender identidade pessoal, acesso aoHigher Self',
      },
      {
        id: 'cosmic',
        name: 'Cósmico',
        description: 'Prática de conexão universal',
        focus: 'Alinhar comfreqüências cósmicas, acessar sabedoria infinita, expandir consciência',
      },
    ],
    paths: [
      {
        id: 'mastery',
        name: 'Maestria',
        description: 'O caminho do dominio completo',
        stages: ['Iniciação', 'Prática', 'Integração', 'Maestria'],
      },
    ],
    metrics: {
      unity: { level: 0, label: 'Unidade', description: 'Grau de integração interior' },
      transcendence: { level: 0, label: 'Transcendência', description: 'Grau de elevação além do ego' },
      cosmic: { level: 0, label: 'Cósmico', description: 'Grau de conexão universal' },
    },
  };
}