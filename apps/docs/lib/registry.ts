import registryManifest from "../../../packages/registry/registry.json";

export const components = registryManifest.components;
export type ComponentMetadata = (typeof components)[number];

export function getComponent(name: string) {
  return components.find((component) => component.name === name);
}
