'use client';

/**
 * useVisualViewport — hook para iOS keyboard handling & visual viewport API.
 * ----------------------------------------------------------------------------
 * Resolve problemas clássicos em iOS Safari:
 *   - `100vh` inclui área do teclado (jumps + layout quebrado)
 *   - Inputs fixos na parte de baixo são cobertos pelo teclado
 *   - `window.innerHeight` não atualiza quando keyboard abre
 *
 * API (visualViewport):
 *   - height: altura visível EXCLUINDO teclado
 *   - offsetTop: scroll atual do viewport (útil quando keyboard empurra layout)
 *   - pageTop: deslocamento real do viewport em relação ao layout viewport
 *
 * Uso:
 *   const { height, offsetTop, isKeyboardOpen } = useVisualViewport();
 *   <div style={{ height: `${height}px` }}>...</div>
 *
 * Compatibilidade:
 *   - iOS Safari 13+ ✓
 *   - Chrome Android ✓
 *   - Desktop ✓ (keyboard resizes window normally)
 *
 * Refs:
 *   - MDN VisualViewport: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
 *   - web.dev visualViewport: https://web.dev/articles/visual-viewport
 */

import { useEffect, useState } from 'react';

export interface VisualViewportState {
  /** Altura visível do viewport (excluindo teclado virtual) */
  height: number;
  /** Largura visível */
  width: number;
  /** Scroll offset do viewport (keyboard empurra) */
  offsetTop: number;
  /** Posição absoluta no documento */
  pageTop: number;
  /** Scale atual (pinch zoom, geralmente 1) */
  scale: number;
  /** True se keyboard provavelmente está aberto (iOS) */
  isKeyboardOpen: boolean;
  /** True se browser suporta a API */
  isSupported: boolean;
}

/**
 * Detecta keyboard aberto quando viewport.height cai significativamente.
 * Threshold: 30% da window.innerHeight (heurística conservadora).
 */
function detectKeyboardOpen(
  visualHeight: number,
  windowHeight: number,
): boolean {
  if (typeof window === 'undefined') return false;
  const ratio = visualHeight / windowHeight;
  return ratio < 0.7;
}

export function useVisualViewport(): VisualViewportState {
  const isSupported = typeof window !== 'undefined' && 'visualViewport' in window;

  const [state, setState] = useState<VisualViewportState>(() => {
    if (typeof window === 'undefined') {
      return {
        height: 0,
        width: 0,
        offsetTop: 0,
        pageTop: 0,
        scale: 1,
        isKeyboardOpen: false,
        isSupported: false,
      };
    }
    const vv = window.visualViewport;
    return {
      height: vv?.height ?? window.innerHeight,
      width: vv?.width ?? window.innerWidth,
      offsetTop: vv?.offsetTop ?? 0,
      pageTop: vv?.pageTop ?? 0,
      scale: vv?.scale ?? 1,
      isKeyboardOpen: false,
      isSupported,
    };
  });

  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setState({
        height: vv.height,
        width: vv.width,
        offsetTop: vv.offsetTop,
        pageTop: vv.pageTop,
        scale: vv.scale,
        isKeyboardOpen: detectKeyboardOpen(vv.height, window.innerHeight),
        isSupported: true,
      });
    };

    // Initial sync (em alguns browsers há delay)
    update();

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [isSupported]);

  return state;
}
