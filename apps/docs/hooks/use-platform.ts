"use client";

import { useReactiveGetCookie, useReactiveSetCookie } from "cookies-next";

export type Platform = "web" | "native";

export function usePlatform() {
  const getCookie = useReactiveGetCookie();
  const setCookie = useReactiveSetCookie();

  const platform = (getCookie("user.platform") as Platform) ?? "web";

  function onPlatformChange(value: Platform) {
    setCookie("user.platform", value);
  }

  return [platform, onPlatformChange] as const;
}
