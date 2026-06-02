// fallow-ignore-file unused-file
"use client";

/**
 * Dashboard configuration hook
 * Provides layout, widgets, and settings for the dashboard
 */
export function useDashboardConfig() {
  const layout = {
    sidebar: { collapsed: false, width: 280 },
    header: { visible: true, height: 64 },
    grid: { columns: 12, gap: 24 },
  };

  const widgets = [
    { id: "numerologia", type: "widget", title: "Numerologia", visible: true, order: 1 },
    { id: "ciclos", type: "widget", title: "Ciclos de Vida", visible: true, order: 2 },
    { id: "mapa-natal", type: "widget", title: "Mapa Natal", visible: true, order: 3 },
    { id: "rituais", type: "widget", title: "Rituais", visible: true, order: 4 },
    { id: "afirmacoes", type: "widget", title: "Afirmações", visible: true, order: 5 },
  ];

  const settings = {
    theme: "default",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    notifications: { enabled: true, sound: false },
  };

  return { layout, widgets, settings };
}