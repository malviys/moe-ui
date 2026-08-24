import "@testing-library/jest-dom/vitest";

if (!("CSSRuleList" in globalThis)) {
  Object.defineProperty(globalThis, "CSSRuleList", {
    value: class CSSRuleList extends Array {},
  });
}

if (!("matchMedia" in window)) {
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  });
}
