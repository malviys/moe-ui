import { describe, expect, test } from "bun:test";

import {
  areFilterValuesEqual,
  flattenFilterFields,
  formatFilterDraftValue,
  getFilterOptionLabel,
  getFilterTextInputValue,
  getFirstFilterField,
} from "../src/internal/adapter-utils";
import { createHeadlessFiltersController } from "../src/core";
import type { FilterFieldDefinition, FilterFieldConfig } from "../src/core";

type Record = { title: string; status: string };

const fields: FilterFieldDefinition<Record, string>[] = [
  {
    key: "group-a",
    label: "Group A",
    type: "group",
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ],
      },
    ],
  },
  {
    key: "sep",
    label: "Separator",
    type: "separator",
  },
  {
    key: "priority",
    label: "Priority",
    type: "multiselect",
    options: [
      { value: "low", label: "Low" },
      { value: "high", label: "High" },
    ],
  },
];

describe("flattenFilterFields", () => {
  test("flattens nested groups recursively", () => {
    const flat = flattenFilterFields(fields);
    expect(flat.map((f) => f.key)).toEqual(["title", "status", "priority"]);
  });

  test("excludes separators", () => {
    const flat = flattenFilterFields(fields);
    expect(flat.find((f) => f.key === "sep")).toBeUndefined();
  });

  test("returns empty array for empty input", () => {
    expect(flattenFilterFields([])).toEqual([]);
  });

  test("handles deeply nested groups", () => {
    const deepFields: FilterFieldDefinition<Record, string>[] = [
      {
        key: "outer",
        label: "Outer",
        type: "group",
        fields: [
          {
            key: "inner",
            label: "Inner",
            type: "group",
            fields: [
              { key: "deep", label: "Deep Field", type: "text" },
            ],
          },
        ],
      },
    ];
    const flat = flattenFilterFields(deepFields);
    expect(flat).toHaveLength(1);
    expect(flat[0]!.key).toBe("deep");
  });
});

describe("areFilterValuesEqual", () => {
  test("primitive equality", () => {
    expect(areFilterValuesEqual("a", "a")).toBe(true);
    expect(areFilterValuesEqual("a", "b")).toBe(false);
    expect(areFilterValuesEqual(1, 1)).toBe(true);
    expect(areFilterValuesEqual(1, 2)).toBe(false);
  });

  test("null and undefined handling", () => {
    expect(areFilterValuesEqual(null, null)).toBe(true);
    expect(areFilterValuesEqual(undefined, undefined)).toBe(true);
    expect(areFilterValuesEqual(null, undefined)).toBe(false);
  });

  test("Date equality by value", () => {
    const d1 = new Date("2024-01-01");
    const d2 = new Date("2024-01-01");
    const d3 = new Date("2024-01-02");
    expect(areFilterValuesEqual(d1, d2)).toBe(true);
    expect(areFilterValuesEqual(d1, d3)).toBe(false);
  });

  test("plain object deep equality", () => {
    expect(areFilterValuesEqual({ id: 1, role: "admin" }, { id: 1, role: "admin" })).toBe(true);
    expect(areFilterValuesEqual({ id: 1, role: "admin" }, { id: 1, role: "user" })).toBe(false);
    // Key order shouldn't matter
    expect(areFilterValuesEqual({ b: 2, a: 1 }, { a: 1, b: 2 })).toBe(true);
  });

  test("nested object deep equality", () => {
    expect(
      areFilterValuesEqual(
        { user: { id: 1, name: "Alice" } },
        { user: { id: 1, name: "Alice" } },
      ),
    ).toBe(true);
    expect(
      areFilterValuesEqual(
        { user: { id: 1, name: "Alice" } },
        { user: { id: 1, name: "Bob" } },
      ),
    ).toBe(false);
  });

  test("array equality", () => {
    expect(areFilterValuesEqual(["a", "b"], ["a", "b"])).toBe(true);
    expect(areFilterValuesEqual(["a", "b"], ["b", "a"])).toBe(false); // order matters
    expect(areFilterValuesEqual(["a"], ["a", "b"])).toBe(false);
  });

  test("Date is not equal to plain object", () => {
    const d = new Date("2024-01-01");
    expect(areFilterValuesEqual(d, { time: d.getTime() } as any)).toBe(false);
  });
});

describe("formatFilterDraftValue", () => {
  test("returns string as-is when field has no parseValue", () => {
    const field: FilterFieldConfig<Record, string> = {
      key: "title",
      label: "Title",
      type: "text",
    };
    expect(formatFilterDraftValue(field, "hello")).toBe("hello");
  });

  test("uses field.parseValue when defined", () => {
    const field: FilterFieldConfig<Record, Date> = {
      key: "createdAt",
      label: "Created At",
      type: "custom",
      parseValue: (v) => new Date(String(v)),
    };
    const result = formatFilterDraftValue(field, "2024-01-01");
    expect(result).toBeInstanceOf(Date);
    expect((result as unknown as Date).getFullYear()).toBe(2024);
  });

  test("returns string value when field is undefined", () => {
    expect(formatFilterDraftValue<string>(undefined, "raw")).toBe("raw");
  });
});

describe("getFilterOptionLabel", () => {
  const selectField: FilterFieldConfig<Record, string> = {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
    ],
  };

  test("returns label from matching option", () => {
    expect(getFilterOptionLabel(selectField, "open")).toBe("Open");
    expect(getFilterOptionLabel(selectField, "closed")).toBe("Closed");
  });

  test("falls back to String(value) when no option matches", () => {
    expect(getFilterOptionLabel(selectField, "archived")).toBe("archived");
  });

  test("returns empty string for null/undefined value", () => {
    expect(getFilterOptionLabel(selectField, null as any)).toBe("");
    expect(getFilterOptionLabel(selectField, undefined as any)).toBe("");
  });

  test("returns String(value) when field is undefined", () => {
    expect(getFilterOptionLabel(undefined, "test")).toBe("test");
  });

  test("works with object values using deep equality", () => {
    const field: FilterFieldConfig<Record, { id: number }> = {
      key: "assignee",
      label: "Assignee",
      type: "multiselect",
      options: [
        { value: { id: 1 }, label: "Alice" },
        { value: { id: 2 }, label: "Bob" },
      ],
    };
    expect(getFilterOptionLabel(field, { id: 1 })).toBe("Alice");
    expect(getFilterOptionLabel(field, { id: 2 })).toBe("Bob");
    expect(getFilterOptionLabel(field, { id: 3 } as any)).toBe("[object Object]");
  });
});

describe("getFilterTextInputValue", () => {
  const textField: FilterFieldConfig<Record, string> = {
    key: "title",
    label: "Title",
    type: "text",
  };

  test("returns empty string for empty values array", () => {
    expect(getFilterTextInputValue(textField, [])).toBe("");
  });

  test("returns label for first value", () => {
    expect(getFilterTextInputValue(textField, ["hello"])).toBe("hello");
  });

  test("ignores extra values beyond the first", () => {
    expect(getFilterTextInputValue(textField, ["hello", "world"])).toBe("hello");
  });
});

describe("getFirstFilterField", () => {
  test("returns the first flattened field from the controller", () => {
    const controller = createHeadlessFiltersController({ fields });
    const first = getFirstFilterField(controller);
    expect(first?.key).toBe("title"); // first in flattened order
  });

  test("returns undefined for empty fields", () => {
    const controller = createHeadlessFiltersController({ fields: [] });
    const first = getFirstFilterField(controller);
    expect(first).toBeUndefined();
  });
});
