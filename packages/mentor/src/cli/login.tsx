import { Text, Box } from 'ink';
import { render } from 'ink';
import React, { useState, useEffect, useCallback } from 'react';

interface LoginProps {
  supabaseUrl: string;
  supabaseKey: string;
  onSuccess: (userId: string, token: string) => void;
  onError?: (error: string) => void;
}

type LoginStep = 'email' | 'password' | 'loading' | 'error' | 'success';

interface LoginState {
  step: LoginStep;
  email: string;
  password: string;
  error: string;
  isLoading: boolean;
}

export const Login: React.FC<LoginProps> = ({ supabaseUrl, supabaseKey, onSuccess, onError }) => {
  const [state, setState] = useState<LoginState>({
    step: 'email',
    email: '',
    password: '',
    error: '',
    isLoading: false,
  });

  const handleSubmit = useCallback(async () => {
    if (state.step === 'email') {
      if (!state.email.includes('@')) {
        setState((prev) => ({ ...prev, error: 'Email inválido' }));
        return;
      }
      setState((prev) => ({ ...prev, step: 'password', error: '' }));
      return;
    }

    if (state.step === 'password') {
      setState((prev) => ({ ...prev, isLoading: true, step: 'loading' }));

      try {
        // Dynamic import do Supabase para evitar erros em ambiente não-browser
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: state.email,
          password: state.password,
        });

        if (error) {
          setState((prev) => ({
            ...prev,
            step: 'error',
            error: error.message,
            isLoading: false,
          }));
          onError?.(error.message);
          return;
        }

        if (data.user && data.session) {
          setState((prev) => ({ ...prev, step: 'success', isLoading: false }));
          onSuccess(data.user.id, data.session.access_token);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        setState((prev) => ({
          ...prev,
          step: 'error',
          error: errorMsg,
          isLoading: false,
        }));
        onError?.(errorMsg);
      }
    }
  }, [state.step, state.email, state.password, supabaseUrl, supabaseKey, onSuccess, onError]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (state.isLoading || state.step === 'success') return;

      if (key === '\r' || key === '\n') {
        handleSubmit();
        return;
      }

      if (key === '\x7f' || key === '\b') {
        if (state.step === 'email') {
          setState((prev) => ({ ...prev, email: prev.email.slice(0, -1) }));
        } else if (state.step === 'password') {
          setState((prev) => ({ ...prev, password: prev.password.slice(0, -1) }));
        }
        return;
      }

      if (key.length === 1 && !key.startsWith('\x1b')) {
        if (state.step === 'email') {
          setState((prev) => ({ ...prev, email: prev.email + key }));
        } else if (state.step === 'password') {
          setState((prev) => ({ ...prev, password: prev.password + key }));
        }
      }
    },
    [state.step, state.isLoading, handleSubmit]
  );

  // Input handling
  useEffect(() => {
    const handleInput = (chunk: Buffer) => {
      handleKeyPress(chunk.toString());
    };

    process.stdin.on('data', handleInput);
    return () => {
      process.stdin.removeListener('data', handleInput);
    };
  }, [handleKeyPress]);

  const maskPassword = (pwd: string) => '*'.repeat(pwd.length);

  if (state.step === 'loading' || state.isLoading) {
    return (
      <Box flexDirection="column" alignItems="center">
        <Text>Autenticando...</Text>
      </Box>
    );
  }

  if (state.step === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red" bold>
          ✖ Erro de Autenticação
        </Text>
        <Text color="red">{state.error}</Text>
        <Text dimColor>Pressione 'r' para tentar novamente ou Ctrl+C para sair...</Text>
      </Box>
    );
  }

  if (state.step === 'success') {
    return (
      <Box flexDirection="column">
        <Text color="green" bold>
          ✓ Login realizado com sucesso!
        </Text>
        <Text>Redirecionando para o chat...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold color="cyan">
          🔐 Login Akáshico
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Entre com suas credenciais para acessar o Mentor.</Text>
      </Box>

      {/* Email Input */}
      <Box marginBottom={1}>
        <Text bold>Email: </Text>
        <Text>{state.email}</Text>
        <Text dimColor>▌</Text>
      </Box>

      {/* Password Input */}
      {state.step === 'password' && (
        <Box marginBottom={1}>
          <Text bold>Senha: </Text>
          <Text>{maskPassword(state.password)}</Text>
          <Text dimColor>▌</Text>
        </Box>
      )}

      {/* Instructions */}
      <Box marginTop={1}>
        {state.step === 'email' && <Text dimColor>Digite seu email e pressione Enter</Text>}
        {state.step === 'password' && <Text dimColor>Digite sua senha e pressione Enter</Text>}
      </Box>

      {/* Error Display */}
      {state.error && (
        <Box marginTop={1}>
          <Text color="red">{state.error}</Text>
        </Box>
      )}
    </Box>
  );
};

// Exporta função para uso standalone
export async function runLogin(
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ userId: string; token: string } | null> {
  return new Promise((resolve) => {
    const instance = render(
      React.createElement(Login, {
        supabaseUrl,
        supabaseKey,
        onSuccess: (userId, token) => {
          instance.unmount();
          resolve({ userId, token });
        },
        onError: () => {
          // Keep waiting for retry
        },
      })
    );

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
  });
}
