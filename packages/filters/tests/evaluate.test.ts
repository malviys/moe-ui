import { describe, expect, test } from "bun:test";

import {
  createFilter,
  filterRecords,
  matchesFilter,
} from "../src/core";
import type { FilterFieldDefinition } from "../src/core";

type Product = {
  name: string;
  category: string;
  tags: string[];
  price: number;
  description: string | null;
};

const fields: FilterFieldDefinition<Product, string>[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    accessor: (r) => r.name,
  },
  {
    key: "description",
    label: "Description",
    type: "text",
    accessor: (r) => r.description,
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "electronics", label: "Electronics" },
      { value: "clothing", label: "Clothing" },
    ],
    accessor: "category",
  },
  {
    key: "tags",
    label: "Tags",
    type: "multiselect",
    options: [
      { value: "sale", label: "Sale" },
      { value: "new", label: "New" },
      { value: "featured", label: "Featured" },
    ],
    accessor: (r) => r.tags,
  },
  {
    key: "group",
    label: "Group",
    type: "group",
    fields: [
      {
        key: "price",
        label: "Price",
        type: "custom",
        accessor: (r) => String(r.price),
      },
    ],
  },
];

const records: Product[] = [
  {
    name: "Laptop Pro",
    category: "electronics",
    tags: ["sale", "featured"],
    price: 999,
    description: "A high-end laptop",
  },
  {
    name: "Blue Shirt",
    category: "clothing",
    tags: ["new"],
    price: 29,
    description: null,
  },
  {
    name: "Wireless Mouse",
    category: "electronics",
    tags: ["sale"],
    price: 49,
    description: "  ",
  },
];

describe("matchesFilter", () => {
  describe("text operators", () => {
    test("contains - case-insensitive match", () => {
      const filter = createFilter("name", "contains", ["laptop"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false);
    });

    test("does_not_contain", () => {
      const filter = createFilter("name", "does_not_contain", ["shirt"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false);
    });

    test("starts_with - case-insensitive", () => {
      const filter = createFilter("name", "starts_with", ["LAPTOP"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false);
    });

    test("ends_with - case-insensitive", () => {
      const filter = createFilter("name", "ends_with", ["PRO"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false);
    });

    test("is - exact equality", () => {
      const filter = createFilter("name", "is", ["Laptop Pro"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false);
    });

    test("is_not", () => {
      const filter = createFilter("name", "is_not", ["Laptop Pro"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(false);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(true);
    });

    test("is_empty - null value", () => {
      const filter = createFilter("description", "is_empty", []);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(true); // null
      expect(matchesFilter(records[2]!, filter, fields)).toBe(true); // whitespace-only "  "
      expect(matchesFilter(records[0]!, filter, fields)).toBe(false); // "A high-end laptop"
    });

    test("is_not_empty", () => {
      const filter = createFilter("description", "is_not_empty", []);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false);
    });
  });

  describe("select operators", () => {
    test("is - select field", () => {
      const filter = createFilter("category", "is", ["electronics"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false);
    });

    test("is_not - select field", () => {
      const filter = createFilter("category", "is_not", ["electronics"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(false);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(true);
    });
  });

  describe("multiselect operators", () => {
    test("is_any_of - matches if any value in array matches any filter value", () => {
      const filter = createFilter("tags", "is_any_of", ["sale", "new"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true); // has "sale"
      expect(matchesFilter(records[1]!, filter, fields)).toBe(true); // has "new"
      expect(matchesFilter(records[2]!, filter, fields)).toBe(true); // has "sale"
    });

    test("is_none_of - matches if no array value is in filter values", () => {
      const filter = createFilter("tags", "is_none_of", ["featured"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(false); // has "featured"
      expect(matchesFilter(records[1]!, filter, fields)).toBe(true);  // no "featured"
      expect(matchesFilter(records[2]!, filter, fields)).toBe(true);  // no "featured"
    });

    test("has_all_of - requires all filter values in the array", () => {
      const filter = createFilter("tags", "has_all_of", ["sale", "featured"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);  // has both
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false); // missing "sale"
      expect(matchesFilter(records[2]!, filter, fields)).toBe(false); // missing "featured"
    });

    test("is_empty - empty array", () => {
      const emptyTagsRecord: Product = {
        name: "Plain",
        category: "clothing",
        tags: [],
        price: 10,
        description: null,
      };
      const filter = createFilter("tags", "is_empty", []);
      expect(matchesFilter(emptyTagsRecord, filter, fields)).toBe(true);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(false);
    });
  });

  describe("field access patterns", () => {
    test("accessor string - direct property access", () => {
      const filter = createFilter("category", "is", ["electronics"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
    });

    test("field inside a group is accessible", () => {
      const filter = createFilter("price", "is", ["999"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(true);
      expect(matchesFilter(records[1]!, filter, fields)).toBe(false);
    });

    test("returns false for unknown field", () => {
      const filter = createFilter("nonexistent", "is", ["value"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(false);
    });

    test("returns false for unknown operator", () => {
      const filter = createFilter("name", "not_an_operator" as any, ["Laptop Pro"]);
      expect(matchesFilter(records[0]!, filter, fields)).toBe(false);
    });
  });

  describe("custom operator registry", () => {
    test("custom operator is used when provided", () => {
      // Filter: name length > 10
      const filter = createFilter<string>("name", "longer_than", ["10"]);
      const customRegistry = {
        longer_than: {
          key: "longer_than",
          label: "longer than",
          arity: "single" as const,
          matches: (candidate: unknown, values: unknown[]) =>
            String(candidate).length > Number(values[0]),
        },
      };
      // "Laptop Pro" length 10 — NOT > 10
      expect(
        matchesFilter<Product, string>(records[0]!, filter, fields, {
          operatorRegistry: customRegistry as any,
        }),
      ).toBe(false);
      // "Wireless Mouse" length 14 — IS > 10
      expect(
        matchesFilter<Product, string>(records[2]!, filter, fields, {
          operatorRegistry: customRegistry as any,
        }),
      ).toBe(true);
    });
  });
});

describe("filterRecords", () => {
  test("returns all records when filters list is empty", () => {
    const result = filterRecords(records, [], fields);
    expect(result).toHaveLength(3);
    expect(result).not.toBe(records); // returns a copy
  });

  test("applies single filter", () => {
    const result = filterRecords(
      records,
      [createFilter("category", "is", ["electronics"])],
      fields,
    );
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(["Laptop Pro", "Wireless Mouse"]);
  });

  test("applies multiple filters with AND logic", () => {
    const result = filterRecords(
      records,
      [
        createFilter("category", "is", ["electronics"]),
        createFilter("tags", "has_all_of", ["sale", "featured"]),
      ],
      fields,
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Laptop Pro");
  });

  test("returns empty array when no records match", () => {
    const result = filterRecords(
      records,
      [createFilter("category", "is", ["furniture"])],
      fields,
    );
    expect(result).toHaveLength(0);
  });

  test("handles empty records array", () => {
    const result = filterRecords<Product, string>(
      [],
      [createFilter("category", "is", ["electronics"])],
      fields,
    );
    expect(result).toHaveLength(0);
  });

  test("preserves record order", () => {
    const result = filterRecords<Product, string>(
      records,
      [createFilter("tags", "is_any_of", ["sale"])],
      fields,
    );
    expect(result[0]!.name).toBe("Laptop Pro");
    expect(result[1]!.name).toBe("Wireless Mouse");
  });
});
