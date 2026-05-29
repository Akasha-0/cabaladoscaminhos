import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface RouteDefinition {
  method: string;
  path: string;
  description: string;
  parameters: ParameterDefinition[];
  requestBody?: RequestBodyDefinition;
  responses: ResponseDefinition[];
  authRequired: boolean;
}

interface ParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
  location: 'query' | 'path' | 'header';
}

interface RequestBodyDefinition {
  contentType: string;
  schema?: string;
  example?: unknown;
}

interface ResponseDefinition {
  status: number;
  description: string;
  schema?: string;
}

/**
 * Generate API documentation from route files
 */
export async function generateAPIDocs(): Promise<string> {
  const routesDir = join(process.cwd(), 'src/app/api');
  const routes = await parseRoutes(routesDir);

  let markdown = '# API Reference\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `Total endpoints: ${routes.length}\n\n`;
  markdown += '---\n\n';

  // Group routes by category
  const grouped = groupByCategory(routes);
  for (const [category, endpoints] of Object.entries(grouped)) {
    markdown += `## ${category}\n\n`;
    for (const route of endpoints) {
      markdown += formatRoute(route);
    }
  }

  return markdown;
}

async function parseRoutes(dir: string, basePath = ''): Promise<RouteDefinition[]> {
  const routes: RouteDefinition[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const routePath = entry.isDirectory()
        ? `${basePath}/${entry.name}`
        : basePath;

      if (entry.isDirectory()) {
        const subRoutes = await parseRoutes(fullPath, routePath);
        routes.push(...subRoutes);
      } else if (entry.name === 'route.ts') {
        const relativePath = basePath || '/';
        const route = await parseRouteFile(fullPath, relativePath);
        if (route) routes.push(route);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return routes;
}

async function parseRouteFile(
  filePath: string,
  routePath: string
): Promise<RouteDefinition | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const methods = detectHTTPMethods(content);

    if (methods.length === 0) return null;

    return {
      method: methods.join(' | '),
      path: normalizePath(routePath),
      description: extractDescription(content),
      parameters: extractParameters(content, routePath),
      requestBody: extractRequestBody(content),
      responses: extractResponses(content),
      authRequired: detectAuth(content),
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

function detectHTTPMethods(content: string): string[] {
  const methods: string[] = [];
  const patterns = [
    /export\s+const\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*=/,
    /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*\(/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const method = match[1] || match[2];
      if (!methods.includes(method)) {
        methods.push(method);
      }
    }
  }

  return methods;
}

function extractDescription(content: string): string {
  // Try to extract from JSDoc comment
  const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/);
  if (jsdocMatch) return jsdocMatch[1].trim();

  // Try single line comment
  const commentMatch = content.match(/\/\/\s*(.+)/);
  if (commentMatch) return commentMatch[1].trim();

  // Extract from status checks or error messages
  const errorMatch = content.match(/error:\s*['"](.+?)['"]/);
  if (errorMatch) return errorMatch[1];

  return 'API endpoint';
}

function extractParameters(content: string, routePath: string): ParameterDefinition[] {
  const params: ParameterDefinition[] = [];

  // Extract searchParams usage (query params)
  const searchParamsMatches = content.matchAll(/searchParams\.get\(['"]([^'"]+)['"]\)/g);
 for (const match of Array.from(searchParamsMatches)) {
    params.push({
      name: match[1],
      type: 'string',
      required: false,
      description: `Query parameter: ${match[1]}`,
      location: 'query',
    });
  }

  // Extract route params from path
  const pathParams = routePath.match(/\[([^\]]+)\]/g);
  if (pathParams) {
    for (const param of pathParams) {
      const name = param.slice(1, -1);
      params.push({
        name,
        type: 'string',
        required: true,
        description: `Path parameter: ${name}`,
        location: 'path',
      });
    }
  }

  return params;
}

function extractRequestBody(content: string): RequestBodyDefinition | undefined {
  // Check for request.json() usage
  if (content.includes('request.json()')) {
    // Try to extract example from the code
    const bodyMatch = content.match(/const\s+\{\s*([^}]+)\s*\}.*?=\s*body/);
    return {
      contentType: 'application/json',
      schema: bodyMatch ? bodyMatch[1].split(',').map(s => s.trim()).join(', ') : undefined,
    };
  }
  return undefined;
}

function extractResponses(content: string): ResponseDefinition[] {
  const responses: ResponseDefinition[] = [];

  // Extract status codes from NextResponse.json calls
  const statusMatches = content.matchAll(/status:\s*(\d{3})/g);
  const statuses = new Set<number>();

 for (const match of Array.from(statusMatches)) {
    statuses.add(parseInt(match[1], 10));
  }

  // Common status codes and their meanings
  const statusDescriptions: Record<number, string> = {
    200: 'Success',
    201: 'Created',
    400: 'Bad Request - Invalid input',
    401: 'Unauthorized - Authentication required',
    403: 'Forbidden - Insufficient permissions',
    404: 'Not Found',
    429: 'Too Many Requests - Rate limit exceeded',
    500: 'Internal Server Error',
  };

 for (const status of Array.from(statuses)) {
    responses.push({
      status,
      description: statusDescriptions[status] || 'Response',
    });
  }

  // Always include 500 as fallback
  if (!responses.some(r => r.status === 500)) {
    responses.push({
      status: 500,
      description: 'Internal Server Error',
    });
  }

  return responses;
}

function detectAuth(content: string): boolean {
  // Check for auth-related imports and middleware
  const authPatterns = [
    /auth.*required/i,
    /withAuth/i,
    /requireAuth/i,
    /verifyToken/i,
    /signToken/i,
    /Authorization/i,
    /bearer/i,
  ];

  return authPatterns.some(pattern => pattern.test(content));
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

function groupByCategory(routes: RouteDefinition[]): Record<string, RouteDefinition[]> {
  const grouped: Record<string, RouteDefinition[]> = {};

  for (const route of routes) {
    const parts = route.path.split('/').filter(Boolean);
    const category = parts.length > 1 ? capitalize(parts[0]) : 'General';

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(route);
  }

  return grouped;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRoute(route: RouteDefinition): string {
  let md = `### ${route.method} ${route.path}\n\n`;
  md += `${route.description}\n\n`;

  if (route.authRequired) {
    md += '**Auth Required:** Yes\n\n';
  }

  if (route.parameters.length > 0) {
    md += '**Parameters:**\n\n';
    md += '| Name | Type | Location | Required | Description |\n';
    md += '|------|------|----------|----------|-------------|\n';

    for (const param of route.parameters) {
      md += `| ${param.name} | ${param.type} | ${param.location} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
    }
    md += '\n';
  }

  if (route.requestBody) {
    md += '**Request Body:**\n\n';
    md += `Type: ${route.requestBody.contentType}\n`;
    if (route.requestBody.schema) {
      md += `Schema: \`${route.requestBody.schema}\`\n`;
    }
    md += '\n';
  }

  md += '**Responses:**\n\n';
  for (const response of route.responses) {
    md += `- \`${response.status}\` - ${response.description}\n`;
  }
  md += '\n---\n\n';

  return md;
}

// CLI entry point
if (require.main === module) {
  generateAPIDocs()
    .then((markdown) => {
      console.log(markdown);
    })
    .catch((error) => {
      console.error('Error generating docs:', error);
      process.exit(1);
    });
}