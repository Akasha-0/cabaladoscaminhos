#!/usr/bin/env node
// CLI Login command

import React, { useState } from 'react';
import { render, Text, Box } from 'ink';
import { useInput } from 'ink';

function LoginScreen() {
  const [step, setStep] = useState<'email' | 'password' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useInput((input, key) => {
    if (key.return && step === 'email') {
      if (email.includes('@')) {
        setStep('password');
      }
    } else if (key.return && step === 'password') {
      if (password.length >= 6) {
        setStep('done');
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Akasha Mentor Login</Text>
      <Text>{"\n"}</Text>
      
      {step === 'email' && (
        <>
          <Text>Email: {email || '...'}</Text>
          <Text dimColor>Type your email and press Enter</Text>
        </>
      )}
      
      {step === 'password' && (
        <>
          <Text>Password: {'*'.repeat(password.length) || '...'}</Text>
          <Text dimColor>Type your password and press Enter</Text>
        </>
      )}
      
      {step === 'done' && (
        <Text color="green">Login successful!</Text>
      )}
    </Box>
  );
}

export { LoginScreen };
