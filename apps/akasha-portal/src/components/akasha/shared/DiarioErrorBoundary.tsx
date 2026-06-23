'use client';

/**
 * DiarioErrorBoundary — catches errors in the diario page and shows a
 * friendly error state with a retry button.
 * Uses inline locale strings so it works without a React context provider.
 */
import { Component, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  locale?: string;
}

interface State {
  hasError: boolean;
  error: string;
}

const PT = {
  titulo: 'Erro no Diário',
  mensagem:
    'Não conseguimos carregar o seu Diário energético. Tente novamente em alguns instantes.',
  retry: 'Tentar novamente',
};

const EN = {
  titulo: 'Diary Error',
  mensagem: "We couldn't load your energetic Diary. Please try again in a moment.",
  retry: 'Try again',
};

function getLabels(locale?: string) {
  return locale?.startsWith('en') ? EN : PT;
}

export class DiarioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: '' });
    void useRouter().refresh();
  };

  render() {
    if (this.state.hasError) {
      const labels = getLabels(this.props.locale);
      return (
        <div className="min-h-dvh bg-[#06070F] flex items-center justify-center p-6">
          <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-[#FB5781]/40 border-l-4 border-l-[#FB5781] rounded-2xl p-6 max-w-md w-full">
            <span className="block text-[0.7rem] font-cinzel tracking-[0.2em] uppercase text-[#FB5781] mb-3">
              {labels.titulo}
            </span>
            <p className="text-[0.9rem] leading-relaxed text-[#A7AECF] mb-4">
              {labels.mensagem}
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[rgba(124,92,255,0.18)] to-[rgba(45,212,191,0.10)] border border-[rgba(124,92,255,0.40)] text-[#7C5CFF] text-[0.88rem] tracking-wide font-cinzel transition-opacity hover:opacity-80"
            >
              {labels.retry}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
