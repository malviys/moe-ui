"use client";

import { useEffect } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (element) =>
      !element.hidden &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0,
  );
}

export function MobileSidebarAccessibility() {
  useEffect(() => {
    let trigger: HTMLButtonElement | null = null;
    let activeDrawer: HTMLElement | null = null;

    const restoreFocus = () => {
      const lastTrigger = trigger;
      trigger = null;
      activeDrawer = null;
      requestAnimationFrame(() => lastTrigger?.focus());
    };

    const syncDrawer = () => {
      const drawer = document.getElementById("nd-sidebar-mobile");
      const isOpen = drawer?.dataset.state === "open";

      if (!(drawer && isOpen)) {
        if (activeDrawer) restoreFocus();
        return;
      }

      if (activeDrawer === drawer) return;
      activeDrawer = drawer;
      drawer.setAttribute("role", "dialog");
      drawer.setAttribute("aria-modal", "true");
      drawer.setAttribute("aria-label", "Documentation navigation");
      drawer.tabIndex = -1;

      requestAnimationFrame(() => {
        (getFocusableElements(drawer)[0] ?? drawer).focus();
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>(
        'button[aria-label="Open Sidebar"]',
      );
      if (button) trigger = button;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!activeDrawer) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        trigger?.click();
        restoreFocus();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(activeDrawer);
      if (focusable.length === 0) {
        event.preventDefault();
        activeDrawer.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const observer = new MutationObserver(syncDrawer);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-state"],
      childList: true,
      subtree: true,
    });
    syncDrawer();

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
