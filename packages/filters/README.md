# filters

Headless filter primitives for Moe UI. The core lives in [`src/core`](./src/core) and is designed to be consumed by multiple render layers, including web React, Vue, and React Native clients.

## Surface

```ts
import {
  createFilter,
  createFilterGroup,
  createHeadlessFiltersController,
  filterRecords,
  type FilterFieldConfig,
} from "@moe-ui/filters/core";
```

## Example

```ts
const fields: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "multiselect",
    options: [
      { value: "todo", label: "Todo" },
      { value: "done", label: "Done" },
    ],
  },
  {
    key: "title",
    label: "Title",
    type: "text",
  },
];

const controller = createHeadlessFiltersController({
  fields,
  filters: [createFilter("status", "is_any_of", ["todo"])],
});

controller.beginDraft("title");
controller.updateDraft({ operator: "contains", values: ["ship"] });
controller.commitDraft();
```

## React Native

```tsx
import { ReactNativeFilters, type FilterFieldConfig } from "@moe-ui/filters/react-native";

const fields: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "multiselect",
    options: [
      { value: "todo", label: "Todo" },
      { value: "done", label: "Done" },
    ],
  },
];

<ReactNativeFilters
  fields={fields}
  slots={{
    root: { className: "gap-4" },
    filterChip: ({ selected }) => ({
      className: selected ? "bg-black border-black" : "bg-white border-zinc-300",
    }),
  }}
  renderers={{
    renderFilterChip: ({ item, props, textProps }) => (
      <Pressable {...props}>
        <Text {...textProps}>{item.summary}</Text>
      </Pressable>
    ),
  }}
/>;
```

## React

```tsx
import { ReactFilters, type FilterFieldConfig } from "@moe-ui/filters/react";

const fields: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "multiselect",
    options: [
      { value: "todo", label: "Todo" },
      { value: "done", label: "Done" },
    ],
  },
];

<ReactFilters
  fields={fields}
  className="grid gap-4"
  components={{
    FilterChip: "button",
    Composer: "section",
  }}
  slots={{
    addButton: { className: "rounded-full border px-3 py-2" },
    valueOption: ({ selected }) => ({
      className: selected ? "bg-black text-white" : "bg-white text-black",
    }),
  }}
  renderers={{
    renderAddButton: ({ open, props, textProps, label }) => (
      <button {...props} onClick={open}>
        <span {...textProps}>{label}</span>
      </button>
    ),
  }}
/>;
```

## Vue

```ts
import { ref } from "vue";
import { VueFilters, type FilterFieldConfig } from "@moe-ui/filters/vue";

const filters = ref([]);

const fields: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "multiselect",
    options: [
      { value: "todo", label: "Todo" },
      { value: "done", label: "Done" },
    ],
  },
];
```

```vue
<template>
  <VueFilters
    v-model="filters"
    :fields="fields"
    :components="{ Composer: 'section' }"
    :ui="{
      addButton: { class: 'rounded-full border px-3 py-2' },
      valueOption: ({ selected }) => ({
        class: selected ? 'bg-black text-white' : 'bg-white text-black',
      }),
    }"
    :renderers="{
      renderAddButton: ({ open, props, textProps, label }) =>
        h('button', { ...props, onClick: open }, [h('span', textProps, () => label)]),
    }"
  />
</template>
```
