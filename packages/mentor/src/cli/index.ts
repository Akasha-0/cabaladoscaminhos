#!/usr/bin/env node
// CLI entry point for mentor

import { render } from 'ink';
import React from 'react';
import { MentorChat } from './chat';

const { waitUntilExit } = render(React.createElement(MentorChat));

waitUntilExit().then(() => {
  console.log('Goodbye!');
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
