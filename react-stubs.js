// react-stubs.js — runtime h() helper.
// Used by every .ts component. Mirrors a tiny subset of React's createElement.

export function h(type, props, ...children) {
  const flat = [];
  for (const c of children) {
    if (Array.isArray(c)) {
      for (const cc of c) flat.push(cc);
    } else if (c != null && c !== false) {
      flat.push(c);
    }
  }
  return {
    type,
    props: Object.assign({}, props ?? {}, { children: flat }),
    key: (props && props.key) ?? null,
  };
}

export const Fragment = Symbol.for('react.fragment');