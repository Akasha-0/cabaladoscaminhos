import { describe, it, expect } from 'vitest';
import { renderHook, result } from '@testing-library/react';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';

describe('useDashboardConfig', () => {
  it('returns config object', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('has layout property', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.layout).toBeDefined();
    expect(typeof result.current.layout).toBe('object');
  });

  it('has widgets property', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.widgets).toBeDefined();
    expect(Array.isArray(result.current.widgets)).toBe(true);
  });

  it('has settings property', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.settings).toBeDefined();
    expect(typeof result.current.settings).toBe('object');
  });

  it('layout has sidebar config', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.layout.sidebar).toBeDefined();
    expect(result.current.layout.sidebar.collapsed).toBe(false);
    expect(result.current.layout.sidebar.width).toBe(280);
  });

  it('layout has header config', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.layout.header).toBeDefined();
    expect(result.current.layout.header.visible).toBe(true);
    expect(result.current.layout.header.height).toBe(64);
  });

  it('layout has grid config', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.layout.grid).toBeDefined();
    expect(result.current.layout.grid.columns).toBe(12);
    expect(result.current.layout.grid.gap).toBe(24);
  });

  it('widgets is non-empty array', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.widgets.length).toBeGreaterThan(0);
  });

  it('widgets have id, type, title, visible, order', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    result.current.widgets.forEach(widget => {
      expect(widget).toHaveProperty('id');
      expect(widget).toHaveProperty('type');
      expect(widget).toHaveProperty('title');
      expect(widget).toHaveProperty('visible');
      expect(widget).toHaveProperty('order');
    });
  });

  it('widgets have correct types', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    result.current.widgets.forEach(widget => {
      expect(typeof widget.id).toBe('string');
      expect(typeof widget.type).toBe('string');
      expect(typeof widget.title).toBe('string');
      expect(typeof widget.visible).toBe('boolean');
      expect(typeof widget.order).toBe('number');
    });
  });

  it('includes numerologia widget', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    const numerologia = result.current.widgets.find(w => w.id === 'numerologia');
    expect(numerologia).toBeDefined();
    expect(numerologia?.visible).toBe(true);
  });

  it('includes ciclos widget', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    const ciclos = result.current.widgets.find(w => w.id === 'ciclos');
    expect(ciclos).toBeDefined();
  });

  it('includes mapa-natal widget', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    const mapaNatal = result.current.widgets.find(w => w.id === 'mapa-natal');
    expect(mapaNatal).toBeDefined();
  });

  it('includes rituais widget', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    const rituais = result.current.widgets.find(w => w.id === 'rituais');
    expect(rituais).toBeDefined();
  });

  it('includes afirmacoes widget', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    const afirmacoes = result.current.widgets.find(w => w.id === 'afirmacoes');
    expect(afirmacoes).toBeDefined();
  });

  it('settings has theme', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.settings.theme).toBe('default');
  });

  it('settings has language', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.settings.language).toBe('pt-BR');
  });

  it('settings has timezone', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.settings.timezone).toBe('America/Sao_Paulo');
  });

  it('settings has notifications config', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    expect(result.current.settings.notifications).toBeDefined();
    expect(result.current.settings.notifications.enabled).toBe(true);
    expect(result.current.settings.notifications.sound).toBe(false);
  });

  it('widgets are in correct order', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    const orders = result.current.widgets.map(w => w.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);
  });

  it('all widgets have type "widget"', () => {
    const { result } = renderHook(() => useDashboardConfig());
    
    result.current.widgets.forEach(widget => {
      expect(widget.type).toBe('widget');
    });
  });
});