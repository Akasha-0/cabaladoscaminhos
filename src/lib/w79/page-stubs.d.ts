// Stubs for Next-style @/* imports used by the pages
declare module '@/lib/utils' {
  export const cn: (...args: ReadonlyArray<unknown>) => string;
}
declare module '@/components/shared/LoadingSpinner' {
  export const LoadingSpinner: (props: { variant?: string; size?: string }) => JSX.Element;
}

declare module 'clsx' {
  const clsx: (...args: ReadonlyArray<unknown>) => string;
  export default clsx;
}
declare module 'tailwind-merge' {
  const twMerge: (...args: ReadonlyArray<unknown>) => string;
  export default twMerge;
}
