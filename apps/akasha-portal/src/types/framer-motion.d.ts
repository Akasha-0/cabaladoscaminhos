/**
 * Type stub for `framer-motion` — pacote NÃO instalado em produção.
 *
 * Por quê: o portal usa `motion.*` e `<AnimatePresence>` em
 * components/akasha/* (Dashboard, Onboarding, RitualHistory, etc.)
 * e o módulo real não está em node_modules. Instalar a dep
 * dependia de decisão humana (ver lesson session-n-plus-8).
 *
 * O que isto cobre: typecheck do subset usado nos componentes
 * (motion.div, motion.span, AnimatePresence mode="wait", props
 * variants/initial/animate/exit/transition/key/className).
 *
 * O que NÃO cobre: runtime. Componentes com 'use client' que
 * dependem de framer-motion vão falhar em runtime até a dep
 * ser instalada — o que é o ponto desta stub: desbloquear
 * typecheck de CI/build sem instalar nada.
 *
 * Decisão futura: ou instalar framer-motion ou trocar para
 * View Transitions API / Web Animations API. Até lá, este stub
 * mantém a typecheck verde.
 */

declare module 'framer-motion' {
  import type { ComponentProps, ReactNode, Ref } from 'react';

  type MotionProps = {
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    transition?: unknown;
    variants?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
    layout?: boolean | string;
    key?: string | number;
  };

  // Proxy-like: any HTML element tag is valid.
  type MotionComponent = ComponentProps<any> &
    MotionProps & {
      ref?: Ref<any>;
      children?: ReactNode;
    };

  // `motion.div`, `motion.span`, etc. — index signature.
  // Tag union narrowed via mapped type over common HTML tags.
  type MotionHTMLTags = {
    div: MotionComponent;
    span: MotionComponent;
    section: MotionComponent;
    article: MotionComponent;
    header: MotionComponent;
    footer: MotionComponent;
    nav: MotionComponent;
    main: MotionComponent;
    aside: MotionComponent;
    button: MotionComponent;
    a: MotionComponent;
    p: MotionComponent;
    h1: MotionComponent;
    h2: MotionComponent;
    h3: MotionComponent;
    h4: MotionComponent;
    h5: MotionComponent;
    h6: MotionComponent;
    ul: MotionComponent;
    ol: MotionComponent;
    li: MotionComponent;
    img: MotionComponent;
    svg: MotionComponent;
    g: MotionComponent;
    path: MotionComponent;
    circle: MotionComponent;
    rect: MotionComponent;
    form: MotionComponent;
    input: MotionComponent;
    label: MotionComponent;
    table: MotionComponent;
    tr: MotionComponent;
    td: MotionComponent;
    th: MotionComponent;
  };

  // `motion` é um objeto indexável. Acessos arbitrários
  // resolvem para um componente permissivo.
  export const motion: MotionHTMLTags & {
    [tag: string]: MotionComponent;
  };

  export const AnimatePresence: (props: {
    children?: ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
  }) => JSX.Element;
}
