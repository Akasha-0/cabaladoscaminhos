export interface TranscendenceData {
  name: string
  description: string
  aspects: string[]
}

export function getData(): TranscendenceData {
  return {
    name: 'Transcendência',
    description: 'A jornada de transcendência espiritual e evolução da consciência.',
    aspects: [
      'Iluminação',
      'Consciência cósmica',
      'Unidade com o todo',
      'Libertação',
      'Expansão além do ego',
    ],
  }
}