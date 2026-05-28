import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting spiritual data seed...')

  // =====================
  // DIAS DA SEMANA (7)
  // =====================
  const diasSemana = [
    { nome: 'Domingo', numero: 1, planeta: 'Sol', elemento: 'Fogo', cor: 'Dourado' },
    { nome: 'Segunda-feira', numero: 2, planeta: 'Lua', elemento: 'Água', cor: 'Prata' },
    { nome: 'Terça-feira', numero: 3, planeta: 'Marte', elemento: 'Fogo', cor: 'Vermelho' },
    { nome: 'Quarta-feira', numero: 4, planeta: 'Mercúrio', elemento: 'Terra', cor: 'Verde' },
    { nome: 'Quinta-feira', numero: 5, planeta: 'Júpiter', elemento: 'Água', cor: 'Azul' },
    { nome: 'Sexta-feira', numero: 6, planeta: 'Vênus', elemento: 'Terra', cor: 'Rosa' },
    { nome: 'Sábado', numero: 7, planeta: 'Saturno', elemento: 'Terra', cor: 'Preto' },
  ]

  for (const dia of diasSemana) {
    await prisma.diaSemana.upsert({
      where: { numero: dia.numero },
      update: dia,
      create: dia,
    })
  }
  console.log('✅ 7 dias da semana created')

  // =====================
  // ORIXÁS (12)
  // =====================
  const orixas = [
    { nome: 'Oxalá', saudacao: 'Epaô!', planeta: 'Sol', elemento: 'Ar', cores: ['Branco', 'Dourado'], chakraPrincipal: 7 },
    { nome: 'Iemanjá', saudacao: 'Oê êê!', planeta: 'Lua', elemento: 'Água', cores: ['Azul', 'Branco'], chakraPrincipal: 2 },
    { nome: 'Ogum', saudacao: 'Oiá!', planeta: 'Marte', elemento: 'Fogo', cores: ['Verde', 'Amarelo'], chakraPrincipal: 3 },
    { nome: 'Xangô', saudacao: 'Kaô!', planeta: 'Júpiter', elemento: 'Fogo', cores: ['Laranja', 'Vermelho'], chakraPrincipal: 4 },
    { nome: 'Oxum', saudacao: 'Oriê!', planeta: 'Vênus', elemento: 'Água', cores: ['Amarelo', 'Dourado'], chakraPrincipal: 2 },
    { nome: 'Nanã', saudacao: 'Murunã!', planeta: 'Saturno', elemento: 'Água', cores: ['Azul', 'Roxo'], chakraPrincipal: 1 },
    { nome: 'Ibeji', saudacao: 'Epaô!', planeta: 'Sol', elemento: 'Ar', cores: ['Branco', 'Vermelho'], chakraPrincipal: 5 },
    { nome: 'Obá', saudacao: 'Sarê!', planeta: 'Vênus', elemento: 'Terra', cores: ['Vermelho', 'Laranja'], chakraPrincipal: 3 },
    { nome: 'Logun Edé', saudacao: 'Humm!', planeta: 'Júpiter', elemento: 'Água', cores: ['Verde', 'Azul'], chakraPrincipal: 4 },
    { nome: 'Oba', saudacao: 'Êntrin!', planeta: 'Marte', elemento: 'Fogo', cores: ['Laranja', 'Amarelo'], chakraPrincipal: 3 },
    { nome: 'Eshu', saudacao: 'Eeee!', planeta: 'Mercúrio', elemento: 'Ar', cores: ['Preto', 'Vermelho'], chakraPrincipal: 5 },
    { nome: 'Yori', saudacao: 'Ogunhê!', planeta: 'Mercúrio', elemento: 'Ar', cores: ['Verde', 'Branco'], chakraPrincipal: 5 },
  ]

  for (const orixa of orixas) {
    await prisma.orixa.upsert({
      where: { nome: orixa.nome },
      update: orixa,
      create: orixa,
    })
  }
  console.log('✅ 12 orixás created')

  // =====================
  // ODÚS (16)
  // =====================
  const odus = [
    { numero: 1, nome: 'Okanran', significado: 'Início, renovação, criação', elemento: 'Ar', planeta: 'Mercúrio', orixaRegente: 'Ogum', quizilas: ['Cabaça', 'Palha'], preceptos: ['Honrar os antepassados'], ebos: ['Água de cheiro'] },
    { numero: 2, nome: 'Eji', significado: 'Dualidade, parceria, escolha', elemento: 'Água', planeta: 'Lua', orixaRegente: 'Iemanjá', quizilas: ['Milho', 'Coco'], preceptos: ['Buscar equilíbrio'], ebos: ['Pepites de dendê'] },
    { numero: 3, nome: 'Ogundá', significado: 'Determinação, batalha, vitória', elemento: 'Fogo', planeta: 'Marte', orixaRegente: 'Ogum', quizilas: ['Faca', 'Espada'], preceptos: ['Lutar pelo que é correto'], ebos: ['Gengibre com mel'] },
    { numero: 4, nome: 'Irosun', significado: 'Segredos, mistérios, intuição', elemento: 'Água', planeta: 'Lua', orixaRegente: 'Iemanjá', quizilas: ['Pente', 'Espelho'], preceptos: ['Guardar segredos'], ebos: ['Quiabo com camarão'] },
    { numero: 5, nome: 'Oxê', significado: 'Comunicação, sabedoria, Palavra', elemento: 'Terra', planeta: 'Mercúrio', orixaRegente: 'Oxalá', quizilas: ['Bastão', 'Cajado'], preceptos: ['Falar com verdade'], ebos: ['Farinha deuba'] },
    { numero: 6, nome: 'Obrá', significado: 'Justiça, equilíbrio, ordem', elemento: 'Terra', planeta: 'Vênus', orixaRegente: 'Oxum', quizilas: ['Balança', 'Fio'], preceptos: ['Buscar harmonia'], ebos: ['Maçã com mel'] },
    { numero: 7, nome: 'Eyi', significado: 'Aprendizado, conhecimento, destino', elemento: 'Ar', planeta: 'Mercúrio', orixaRegente: 'Oxalá', quizilas: ['Pena', 'Livro'], preceptos: ['Estudar sempre'], ebos: ['Pamonha com mel'] },
    { numero: 8, nome: 'Oworin', significado: 'Sorte, abundância, destino', elemento: 'Terra', planeta: 'Júpiter', orixaRegente: 'Xangô', quizilas: ['Moeda', 'Chave'], preceptos: ['Agradecer sempre'], ebos: ['Amendoim torrado'] },
    { numero: 9, nome: 'Be', significado: 'Fecundidade, reprodução, criação', elemento: 'Água', planeta: 'Vênus', orixaRegente: 'Oxum', quizilas: ['Vaso', 'Flor'], preceptos: ['Nutrir a vida'], ebos: ['Frutas colhidas'] },
    { numero: 10, nome: 'Ogundara', significado: 'Progresso, evolução, sucesso', elemento: 'Fogo', planeta: 'Marte', orixaRegente: 'Ogum', quizilas: ['Ferramenta', 'Arado'], preceptos: ['Trabalhar com dedicação'], ebos: ['Pipoca com mel'] },
    { numero: 11, nome: 'Eri', significado: 'Morte e renascimento, transformação', elemento: 'Ar', planeta: 'Saturno', orixaRegente: 'Nanã', quizilas: ['Caveira', 'Osso'], preceptos: ['Aceitar a mudança'], ebos: ['Quiabo cozido'] },
    { numero: 12, nome: 'Ike', significado: 'Força, poder, vitalidade', elemento: 'Fogo', planeta: 'Marte', orixaRegente: 'Xangô', quizilas: ['Trovão', 'Pedra'], preceptos: ['Ser forte'], ebos: ['Carne assada'] },
    { numero: 13, nome: 'Otura', significado: 'Pureza, proteção, cura', elemento: 'Água', planeta: 'Sol', orixaRegente: 'Oxalá', quizilas: ['Rosto', 'Espelho'], preceptos: ['Manter a limpeza'], ebos: ['Pepites brancos'] },
    { numero: 14, nome: 'Ibadá', significado: 'Iniciação, sacrifício, entrega', elemento: 'Terra', planeta: 'Saturno', orixaRegente: 'Nanã', quizilas: ['Cesto', 'Jarra'], preceptos: ['Sacrificar pelo bem maior'], ebos: ['Fubá com água'] },
    { numero: 15, nome: 'Osi', significado: 'Destruição, ruptura, limpezas', elemento: 'Fogo', planeta: 'Marte', orixaRegente: 'Eshu', quizilas: ['Fogo', 'Fumaça'], preceptos: ['Saber destruir o que não serve'], ebos: ['Pimenta com mel'] },
    { numero: 16, nome: 'Oparun', significado: 'Conexão divina, revelação, verdade', elemento: 'Ar', planeta: 'Sol', orixaRegente: 'Oxalá', quizilas: ['Coroa', 'Cruz'], preceptos: ['Buscar a verdade'], ebos: ['Milho com mel'] },
  ]

  for (const odu of odus) {
    await prisma.odú.upsert({
      where: { numero: odu.numero },
      update: odu,
      create: odu,
    })
  }
  console.log('✅ 16 odús created')

  // =====================
  // CHAKRAS (7)
  // =====================
  const chakras = [
    { numero: 1, nome: 'Muladhara', cor: 'Vermelho', elemento: 'Terra', glandula: 'Suprarrenal', mantras: ['LAM'], funcoes: ['Sobrevivência', 'Estabilidade', 'Conexão com a terra'] },
    { numero: 2, nome: 'Svadhisthana', cor: 'Laranja', elemento: 'Água', glandula: 'Reprodutoras', mantras: ['VAM'], funcoes: ['Criatividade', 'Sexualidade', 'Emocional'] },
    { numero: 3, nome: 'Manipura', cor: 'Amarelo', elemento: 'Fogo', glandula: 'Pâncreas', mantras: ['RAM'], funcoes: ['Poder pessoal', 'Vontade', 'Digestão'] },
    { numero: 4, nome: 'Anahata', cor: 'Verde', elemento: 'Ar', glandula: 'Timo', mantras: ['YAM'], funcoes: ['Amor', 'Compassão', 'Conexão'] },
    { numero: 5, nome: 'Vishuddha', cor: 'Azul', elemento: 'Éter', glandula: 'Tireoide', mantras: ['HAM'], funcoes: ['Comunicação', 'Expressão', 'Verdade'] },
    { numero: 6, nome: 'Ajna', cor: 'Indigo', elemento: 'Luz', glandula: 'Pituitária', mantras: ['OM'], funcoes: ['Intuição', 'Visão', 'Consciência'] },
    { numero: 7, nome: 'Sahasrara', cor: 'Branco/Roxo', elemento: 'Consciência', glandula: 'Pineal', mantras: ['SILENCE'], funcoes: ['Iluminação', 'Transcendência', 'Conexão divina'] },
  ]

  for (const chakra of chakras) {
    await prisma.chakra.upsert({
      where: { numero: chakra.numero },
      update: chakra,
      create: chakra,
    })
  }
  console.log('✅ 7 chakras created')

  // =====================
  // SEFIROT (10)
  // =====================
  const sefirots = [
    { numero: 1, nome: 'Kether', caminho: 'Coroa', aspecto: 'Divindade', cor: 'Branco', planeta: 'Beyond' },
    { numero: 2, nome: 'Chokmah', caminho: 'Sabedoria', aspecto: 'Dinâmica', cor: 'Azul-cinza', planeta: 'Zodiac' },
    { numero: 3, nome: 'Binah', caminho: 'Compreensão', aspecto: 'Estática', cor: 'Preto', planeta: 'Saturno' },
    { numero: 4, nome: 'Chesed', caminho: 'Misericórdia', aspecto: 'Expansão', cor: 'Azul', planeta: 'Júpiter' },
    { numero: 5, nome: 'Geburah', caminho: 'Força', aspecto: 'Contração', cor: 'Vermelho', planeta: 'Marte' },
    { numero: 6, nome: 'Tiferet', caminho: 'Beleza', aspecto: 'Equilíbrio', cor: 'Amarelo', planeta: 'Sol' },
    { numero: 7, nome: 'Netzach', caminho: 'Vitória', aspecto: 'Emoção', cor: 'Verde', planeta: 'Vênus' },
    { numero: 8, nome: 'Hod', caminho: 'Glória', aspecto: 'Integração', cor: 'Laranja', planeta: 'Mercúrio' },
    { numero: 9, nome: 'Yesod', caminho: 'Fundação', aspecto: 'Base', cor: 'Violeta', planeta: 'Lua' },
    { numero: 10, nome: 'Malkuth', caminho: 'Reino', aspecto: 'Manifestação', cor: 'Marrom', planeta: 'Terra' },
  ]

  for (const sefirot of sefirots) {
    await prisma.sefirot.upsert({
      where: { numero: sefirot.numero },
      update: sefirot,
      create: sefirot,
    })
  }
  console.log('✅ 10 sefirots created')

  // =====================
  // FASES DA LUA (4)
  // =====================
  const fasesLua = [
    { nome: 'Lua Nova', energia: 'Introspecção, inícios, renovação interior', rituais: ['Meditação', 'Defumação', 'Novas intenções'], evitar: ['Grandes decisões', 'Iniciar projetos longos'] },
    { nome: 'Lua Crescente', energia: 'Crescimento, ação, implementação de planos', rituais: ['Amarração', 'Feitiços de crescimento', 'Pedidos de proteção'], evitar: ['Inveja', 'Ciúmes'] },
    { nome: 'Lua Cheia', energia: 'Culminação, clareza, manifestações', rituais: ['Rituais de amor', 'Carrego de cristais', 'Profecias'], evitar: ['Conflitos', 'Consumo excessivo'] },
    { nome: 'Lua Minguante', energia: 'Liberação, purificação, encerramento', rituais: ['Descantação', 'Banhos de limpeza', 'Descarrego'], evitar: ['Novoscomeços', 'Assinar contratos'] },
  ]

  for (const fase of fasesLua) {
    await prisma.faseLua.upsert({
      where: { nome: fase.nome },
      update: fase,
      create: fase,
    })
  }
  console.log('✅ 4 fases da lua created')

  console.log('🎉 Spiritual data seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })