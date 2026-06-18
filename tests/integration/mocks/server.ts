import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Start the MSW server before all tests
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
