// @ts-ignore
/// <reference types="nativewind/types" />

// CSS module declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// DOM types for web-only files (+html.tsx)
/// <reference lib="dom" />
