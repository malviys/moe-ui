"use client";

import { useEffect } from "react";

export function SearchFocusRestoration() {
  useEffect(() => {
    let trigger: HTMLButtonElement | null = null;
    let wasOpen = false;

    const syncDialog = () => {
      const isOpen = Boolean(
        document.querySelector('[role="dialog"][data-state="open"]'),
      );

      if (isOpen && trigger) {
        wasOpen = true;
      } else if (!isOpen && wasOpen) {
        const lastTrigger = trigger;
        trigger = null;
        wasOpen = false;
        requestAnimationFrame(() => lastTrigger?.focus());
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>(
        "button[data-search], button[data-search-full]",
      );
      if (button) trigger = button;
    };

    const observer = new MutationObserver(syncDialog);
    document.addEventListener("click", onClick, true);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-state"],
      childList: true,
      subtree: true,
    });

    return () => {
      document.removeEventListener("click", onClick, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
