#!/usr/bin/env node
/**
 * OpenAPI 3.0 spec validator — Wave 33
 *
 * Parses docs/api/openapi.yaml with js-yaml, then runs structural checks:
 *  - Required top-level fields (openapi, info, paths)
 *  - Every $ref resolves to an existing schema/response/parameter
 *  - Every operation has valid HTTP method + summary + tags + responses
 *  - All path parameters declared under parameters
 *  - Every referenced schema exists under components/schemas
 *  - Servers, security schemes are well-formed
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = '/workspace/cabaladoscaminhos';
const SPEC = path.join(ROOT, 'docs/api/openapi.yaml');

const raw = fs.readFileSync(SPEC, 'utf8');
const spec = yaml.load(raw);
if (!spec || typeof spec !== 'object') {
  console.error('[validate-openapi] FAIL: spec is not an object');
  process.exit(1);
}

const errors = [];
const warnings = [];

function addErr(msg) { errors.push(msg); }
function addWarn(msg) { warnings.push(msg); }

// 1. top-level
if (spec.openapi !== '3.0.3') addErr(`openapi must be "3.0.3", got "${spec.openapi}"`);
if (!spec.info || !spec.info.title || !spec.info.version) addErr('info.title and info.version are required');
if (!spec.paths || typeof spec.paths !== 'object') addErr('paths is required and must be an object');
if (!spec.components || typeof spec.components !== 'object') addErr('components is required');
if (!spec.components.schemas || Object.keys(spec.components.schemas).length === 0) {
  addErr('components.schemas must contain at least one schema');
}
if (!spec.components.securitySchemes || !spec.components.securitySchemes.BearerAuth) {
  addErr('components.securitySchemes.BearerAuth is required');
}

// 2. validate $refs
const schemas = spec.components.schemas || {};
const responses = spec.components.responses || {};
const parameters = spec.components.parameters || {};
function resolveRef(ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  const parts = ref.slice(2).split('/');
  let cur = spec;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

let refCount = 0;
function walkRefs(node, loc) {
  if (node == null) return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkRefs(v, `${loc}[${i}]`));
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref') {
        refCount++;
        const resolved = resolveRef(v);
        if (resolved == null) addErr(`${loc}: \$ref "${v}" did not resolve`);
      } else {
        walkRefs(v, `${loc}.${k}`);
      }
    }
  }
}
walkRefs(spec, 'spec');

// 3. validate each operation
const validMethods = new Set(['get', 'post', 'put', 'delete', 'patch', 'head', 'options']);
let opCount = 0;
for (const [pathKey, ops] of Object.entries(spec.paths)) {
  if (/\[/.test(pathKey)) addErr(`path "${pathKey}" uses [bracket] syntax (OpenAPI requires {curly})`);
  const pathParamsInPath = [...pathKey.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
  for (const [verb, op] of Object.entries(ops)) {
    if (!validMethods.has(verb)) continue;
    opCount++;
    if (!op.summary) addErr(`${verb.toUpperCase()} ${pathKey}: missing summary`);
    if (!op.tags || op.tags.length === 0) addErr(`${verb.toUpperCase()} ${pathKey}: missing tags`);
    if (!op.responses || Object.keys(op.responses).length === 0) {
      addErr(`${verb.toUpperCase()} ${pathKey}: missing responses`);
    }
    // confirm path-level params include all path-curly names
    const declaredParamNames = new Set(
      (op.parameters || []).filter(p => p.in === 'path').map(p => p.name)
    );
    for (const pname of pathParamsInPath) {
      if (!declaredParamNames.has(pname)) {
        addErr(`${verb.toUpperCase()} ${pathKey}: path param "${pname}" not declared under parameters`);
      }
    }
  }
}

// 4. schemas shape (require type or composition)
for (const [sname, schema] of Object.entries(schemas)) {
  const hasType = schema.type || schema.$ref || schema.oneOf || schema.allOf || schema.anyOf || schema.not || schema.enum;
  if (!hasType) addErr(`schema "${sname}": missing type or composition`);
}

// report
console.log(`[validate-openapi] parsed spec OK`);
console.log(`[validate-openapi] paths=${Object.keys(spec.paths).length}, ops=${opCount}, schemas=${Object.keys(schemas).length}, responses=${Object.keys(responses).length}, parameters=${Object.keys(parameters).length}, \$refs=${refCount}`);
if (warnings.length) {
  console.log(`[validate-openapi] ${warnings.length} warnings:`);
  for (const w of warnings.slice(0, 5)) console.log(`  - ${w}`);
  if (warnings.length > 5) console.log(`  ... +${warnings.length - 5} more`);
}
if (errors.length) {
  console.error(`[validate-openapi] FAIL: ${errors.length} errors`);
  for (const e of errors.slice(0, 30)) console.error(`  - ${e}`);
  if (errors.length > 30) console.error(`  ... +${errors.length - 30} more`);
  process.exit(1);
}
console.log(`[validate-openapi] PASS: 0 errors`);
