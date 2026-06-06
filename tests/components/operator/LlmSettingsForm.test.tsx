import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LlmSettingsForm } from '@/components/operator/llm/LlmSettingsForm';
import { saveActiveOperatorLlmSetting } from '@/lib/db/llm-settings-actions';

vi.mock('@/lib/db/llm-settings-actions', () => ({
  saveActiveOperatorLlmSetting: vi.fn(),
}));

const mockInitialSettings = {
  provider: 'openai' as const,
  openaiKey: 'env-key',
  openaiModel: 'gpt-4o',
  minimaxKey: '',
  minimaxModel: 'minimax/m3',
  anthropicKey: '',
  anthropicModel: 'claude-3-5-sonnet',
  localEndpoint: 'http://localhost:1234/v1',
  localModel: 'meta-llama-3-8b-instruct',
};

describe('LlmSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully with initial settings', () => {
    render(<LlmSettingsForm initialSettings={mockInitialSettings} />);
    expect(screen.getByText('Provedor Ativo de LLM')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Minimax')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('IA Local')).toBeInTheDocument();
  });

  it('switches tabs and displays custom provider input fields', async () => {
    render(<LlmSettingsForm initialSettings={mockInitialSettings} />);

    // Initial tab: OpenAI
    expect(screen.getByLabelText(/Chave de API OpenAI/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Token de API Minimax/i)).not.toBeInTheDocument();

    // Click Minimax
    fireEvent.click(screen.getByText('Minimax'));
    expect(screen.getByLabelText(/Token de API Minimax/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Chave de API OpenAI/i)).not.toBeInTheDocument();

    // Click Local
    fireEvent.click(screen.getByText('IA Local'));
    expect(screen.getByLabelText(/Endpoint da API Local/i)).toBeInTheDocument();
  });

  it('submits correctly calling saveActiveOperatorLlmSetting action', async () => {
    vi.mocked(saveActiveOperatorLlmSetting).mockResolvedValueOnce({ ok: true });

    render(<LlmSettingsForm initialSettings={mockInitialSettings} />);

    // Change OpenAI Key
    const input = screen.getByLabelText(/Chave de API OpenAI/i);
    fireEvent.change(input, { target: { value: 'sk-newkey' } });

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Salvar Provedor LLM/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(saveActiveOperatorLlmSetting).toHaveBeenCalledWith(expect.objectContaining({
        provider: 'openai',
        openaiKey: 'sk-newkey',
        openaiModel: 'gpt-4o',
      }));
    });
    
    expect(screen.getByText(/Configurações salvas com sucesso/i)).toBeInTheDocument();
  });
});
