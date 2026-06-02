// fallow-ignore-file unused-file
'use client';

import jsPDF from 'jspdf';

export interface DashboardPDFData {
  userName: string;
  email: string;
  sign: string;
  house: string;
  cycle: string;
  cyclePhase: string;
  metrics: {
    energia: number;
    emocional: number;
    mental: number;
    espiritual: number;
  };
  activeRituals: Array<{ name: string; frequency: string; nextDate: string }>;
  oduMatch?: {
    odu: string;
    sign: string;
    compatibility: number;
    message: string;
  };
  affirmations: string[];
  breathingSessions: number;
  gratitudeEntries: number;
  generatedAt: string;
}

export async function generateDashboardPDF(data: DashboardPDFData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addHeader = () => {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Cábala dos Caminhos', margin, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Dashboard Pessoal', margin, y);
    y += 10;
  };

  const addDivider = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  const sectionTitle = (title: string) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += 7;
  };

  const addText = (text: string, fontSize = 10) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.4) + 2;
  };

  // Header
  addHeader();
  addDivider();

  // User Info
  sectionTitle('Informações do Usuário');
  addText(`Nome: ${data.userName}`);
  addText(`Email: ${data.email}`);
  addText(`Signo: ${data.sign}`);
  addText(`Casa: ${data.house}`);
  addText(`Ciclo: ${data.cycle}`);
  addText(`Fase do Ciclo: ${data.cyclePhase}`);
  y += 5;

  // Metrics
  sectionTitle('Métricas Diárias');
  addText(`Energia: ${data.metrics.energia}/100`);
  addText(`Emocional: ${data.metrics.emocional}/100`);
  addText(`Mental: ${data.metrics.mental}/100`);
  addText(`Espiritual: ${data.metrics.espiritual}/100`);
  y += 5;

  // Rituals
  sectionTitle('Rituais Ativos');
  if (data.activeRituals.length === 0) {
    addText('Nenhum ritual ativo.');
  } else {
    data.activeRituals.forEach((ritual) => {
      addText(`• ${ritual.name} (${ritual.frequency}) - Próximo: ${ritual.nextDate}`);
    });
  }
  y += 5;

  // Odu Match
  if (data.oduMatch) {
    sectionTitle('Odu Match');
    addText(`Odu: ${data.oduMatch.odu}`);
    addText(`Signo: ${data.oduMatch.sign}`);
    addText(`Compatibilidade: ${data.oduMatch.compatibility}%`);
    addText(`Mensagem: ${data.oduMatch.message}`);
    y += 5;
  }

  // Affirmations
  sectionTitle('Afirmações do Dia');
  if (data.affirmations.length === 0) {
    addText('Nenhuma afirmação registrada.');
  } else {
    data.affirmations.forEach((affirmation, i) => {
      addText(`${i + 1}. ${affirmation}`);
    });
  }
  y += 5;

  // Breathing & Gratitude Stats
  sectionTitle('Estatísticas de Práticas');
  addText(`Sessões de Respiração: ${data.breathingSessions}`);
  addText(`Registros de Gratidão: ${data.gratitudeEntries}`);
  y += 5;

  // Footer
  addDivider();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  addText(`Gerado em: ${data.generatedAt}`, 8);

  return doc.output('blob');
}