/**
 * Life Path Number Calculator
 * @module numerologia/life-path
 *
 * Calculates the Cabala Life Path number from a birth date (DD/MM/YYYY).
 * Simple sum of day + month + year, reduced to single digit or master number.
 */

// Master numbers preserved without reduction
function reduzirNumero(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = String(num).split('').reduce((a, b) => a + Number(b), 0)
  }
  return num
}

export function calcularCaminhoVida(dataNascimento: string): number {
  const [dia, mes, ano] = dataNascimento.split('/')
  const soma = Number(dia) + Number(mes) + Number(ano)
  return reduzirNumero(soma)
}
