import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CabalaNumerologiaSchema = z.object({
  action: z.literal('numerologia'),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  data_nascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/YYYY'),
})
const CabalaCaminhoVidaSchema = z.object({
  action: z.literal('caminho-vida'),
  data_nascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/YYYY'),
})
const CabalaCompatibilidadeSchema = z.object({
  action: z.literal('nomes-compatibilidade'),
  nome1: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  nome2: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
})
const CabalaQuerySchema = z.discriminatedUnion('action', [
  CabalaNumerologiaSchema,
  CabalaCaminhoVidaSchema,
  CabalaCompatibilidadeSchema,
  z.object({ action: z.undefined() }),
])
// GET /api/cabala - List all available endpoints
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const parseResult = CabalaQuerySchema.safeParse({
    action: searchParams.get('action') || undefined,
    nome: searchParams.get('nome') || undefined,
    data_nascimento: searchParams.get('data_nascimento') || undefined,
    nome1: searchParams.get('nome1') || undefined,
    nome2: searchParams.get('nome2') || undefined,
  })
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }
  const params = parseResult.data
  if (!params.action) {
    return NextResponse.json({
      endpoints: {
        numerologia: '/api/cabala?action=numerologia&nome=&data_nascimento=',
        caminho_vida: '/api/cabala?action=caminho-vida&data_nascimento=',
        nomes_compatibilidade: '/api/cabala?action=nomes-compatibilidade&nome1=&nome2=',
      },
      message: 'API Cabala dos Caminhos ativa',
    })
  }
  switch (params.action) {
    case 'numerologia': {
      const numerologia = calcularNumerologia(params.nome, params.data_nascimento)
      return NextResponse.json(numerologia)
    }
    case 'caminho-vida': {
      const caminhoVida = calcularCaminhoVida(params.data_nascimento)
      return NextResponse.json(caminhoVida)
    }
    case 'nomes-compatibilidade': {
      const compatibilidade = calcularCompatibilidade(params.nome1, params.nome2)
      return NextResponse.json(compatibilidade)
    }
    default:
      return NextResponse.json({ error: 'Action inválida' }, { status: 400 })
  }
}
// Cabala numerology: A=1, B=2, ... I=9, J=1, K=2, ...
const CABALA_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
}
function somaCabala(texto: string): number {
  return texto
    .toLowerCase()
    .split('')
    .reduce((acc, char) => acc + (CABALA_MAP[char] ?? 0), 0)
}
function reduzirNumero(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = String(num).split('').reduce((a, b) => a + Number(b), 0)
  }
  return num
}

function calcularNumerologia(nome: string, dataNascimento: string) {
  const valorNome = reduzirNumero(somaCabala(nome))
  const [dia, mes, ano] = dataNascimento.split('/')
  const valorData = reduzirNumero(
    Number(dia) + Number(mes) + Number(ano)
  )
  const numeroAlma = reduzirNumero(somaCabala(nome.replace(/\s/g, '')))
  const numeroPersonalidade = reduzirNumero(somaCabala(nome.split(' ').pop() ?? ''))

  return {
    nome,
    numero_expressao: valorNome,
    numero_caminho: valorData,
    numero_alma: numeroAlma,
    numero_personalidade: numeroPersonalidade,
  }
}

function calcularCaminhoVida(dataNascimento: string) {
  const [dia, mes, ano] = dataNascimento.split('/')
  const soma = Number(dia) + Number(mes) + Number(ano)
  const numero = reduzirNumero(soma)

  const significados: Record<number, string> = {
    1: 'Independência e liderança',
    2: 'Parceria e cooperação',
    3: 'Criatividade e comunicação',
    4: 'Estabilidade e trabalho',
    5: 'Liberdade e aventura',
    6: 'Harmonia e família',
    7: 'Espiritualidade e análise',
    8: 'Poder e realizações',
    9: 'Humanitarismo e compaixão',
    11: 'Intuição e iluminação',
    22: 'Mestria e transformação',
    33: 'Serviço altruísta',
  }

  return {
    data_nascimento: dataNascimento,
    numero_caminho_vida: numero,
    significado: significados[numero] ?? '',
  }
}

function calcularCompatibilidade(nome1: string, nome2: string) {
  const val1 = reduzirNumero(somaCabala(nome1))
  const val2 = reduzirNumero(somaCabala(nome2))
  const compatibilidade = reduzirNumero(val1 + val2)

  const percentuais: Record<number, number> = {
    1: 85, 2: 78, 3: 92, 4: 70, 5: 88,
    6: 95, 7: 65, 8: 75, 9: 82, 11: 90,
    22: 88, 33: 85,
  }

  return {
    nome1,
    nome2,
    numero1: val1,
    numero2: val2,
    compatibilidade: compatibilidade,
    percentual: percentuais[compatibilidade] ?? 70,
  }
}