import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@akasha/core-humandesign',
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
