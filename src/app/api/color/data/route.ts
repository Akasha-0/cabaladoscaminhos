import { NextResponse } from 'next/server'

const colorData = [
  { id: 1, name: 'Vermelho', hex: '#E53935', rgb: [229, 57, 53], meaning: 'Energia, paixão, coragem', element: 'Fogo', chakra: 'Muladhara' },
  { id: 2, name: 'Laranja', hex: '#FB8C00', rgb: [251, 140, 0], meaning: 'Criatividade, entusiasmo, vitalidade', element: 'Fogo', chakra: 'Svadhisthana' },
  { id: 3, name: 'Amarelo', hex: '#FDD835', rgb: [253, 216, 53], meaning: 'Inteligência, alegria, comunicação', element: 'Terra', chakra: 'Manipura' },
  { id: 4, name: 'Verde', hex: '#43A047', rgb: [67, 160, 71], meaning: 'Equilíbrio, cura, crescimento', element: 'Terra', chakra: 'Anahata' },
  { id: 5, name: 'Azul', hex: '#1E88E5', rgb: [30, 136, 229], meaning: 'Calma, verdade, expressão', element: 'Água', chakra: 'Vishuddha' },
  { id: 6, name: 'Índigo', hex: '#3949AB', rgb: [57, 73, 171], meaning: 'Intuição, profundo, introspecção', element: 'Água', chakra: 'Ajna' },
  { id: 7, name: 'Violeta', hex: '#8E24AA', rgb: [142, 36, 170], meaning: 'Espiritualidade, transformação, inspiração', element: 'Éter', chakra: 'Sahasrara' },
  { id: 8, name: 'Branco', hex: '#FAFAFA', rgb: [250, 250, 250], meaning: 'Pureza, paz, integração', element: 'Éter', chakra: 'Sahasrara' },
  { id: 9, name: 'Preto', hex: '#212121', rgb: [33, 33, 33], meaning: 'Proteção, mistério, potencial', element: 'Terra', chakra: 'Muladhara' },
  { id: 10, name: 'Rosa', hex: '#EC407A', rgb: [236, 64, 122], meaning: 'Amor, compaixão, ternura', element: 'Água', chakra: 'Anahata' },
  { id: 11, name: 'Dourado', hex: '#FFB300', rgb: [255, 179, 0], meaning: 'Abundância, sabedoria, clareza', element: 'Fogo', chakra: 'Manipura' },
  { id: 12, name: 'Prata', hex: '#90A4AE', rgb: [144, 164, 174], meaning: 'Intuição, empatia, suavidade', element: 'Água', chakra: 'Ajna' },
]

export async function GET() {
  return NextResponse.json({ colors: colorData })
}