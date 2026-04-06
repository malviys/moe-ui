import { describe, expect, test } from "bun:test";

import {
  DEFAULT_FILTER_OPERATORS,
  getDefaultOperatorForField,
  getDefaultOperatorKeysForField,
  getOperatorsForField,
  normalizeFilterValues,
} from "../src/core/operators";
import type { FilterFieldConfig } from "../src/core/types";

// --- Field fixtures ---

const textField: FilterFieldConfig = {
  key: "title",
  label: "Title",
  type: "text",
};

const selectField: FilterFieldConfig = {
  key: "status",
  label: "Status",
  type: "select",
  options: [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ],
};

const multiselectField: FilterFieldConfig = {
  key: "tags",
  label: "Tags",
  type: "multiselect",
  options: [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
  ],
  maxSelections: 2,
};

const customField: FilterFieldConfig = {
  key: "date",
  label: "Date",
  type: "custom",
};

const customOperatorsField: FilterFieldConfig = {
  key: "priority",
  label: "Priority",
  type: "select",
  operators: ["is", "is_not"],
};

// --- Tests for DEFAULT_FILTER_OPERATORS ---

describe("DEFAULT_FILTER_OPERATORS", () => {
  describe("is", () => {
    const { matches, normalizeValues } = DEFAULT_FILTER_OPERATORS["is"]!;
    test("matches identical primitive values", () => {
      expect(matches!("hello", ["hello"], {} as any)).toBe(true);
      expect(matches!("hello", ["world"], {} as any)).toBe(false);
    });
    test("trims whitespace before comparing strings", () => {
      expect(matches!("  hello  ", ["hello"], {} as any)).toBe(true);
    });
    test("compares dates by timestamp", () => {
      const d1 = new Date("2024-01-01");
      const d2 = new Date("2024-01-01");
      const d3 = new Date("2024-01-02");
      expect(matches!(d1, [d2], {} as any)).toBe(true);
      expect(matches!(d1, [d3], {} as any)).toBe(false);
    });
    test("normalizeValues keeps only first value", () => {
      expect(normalizeValues!(["a", "b", "c"], textField)).toEqual(["a"]);
      expect(normalizeValues!([], textField)).toEqual([]);
    });
  });

  describe("is_not", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["is_not"]!;
    test("returns true when values differ", () => {
      expect(matches!("hello", ["world"], {} as any)).toBe(true);
      expect(matches!("hello", ["hello"], {} as any)).toBe(false);
    });
  });

  describe("contains", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["contains"]!;
    test("case-insensitive substring match", () => {
      expect(matches!("Hello World", ["world"], {} as any)).toBe(true);
      expect(matches!("Hello World", ["HELLO"], {} as any)).toBe(true);
      expect(matches!("Hello World", ["xyz"], {} as any)).toBe(false);
    });
    test("empty search string matches everything", () => {
      expect(matches!("Hello", [""], {} as any)).toBe(true);
    });
    test("handles non-string candidate via String()", () => {
      expect(matches!(12345, ["234"], {} as any)).toBe(true);
    });
  });

  describe("does_not_contain", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["does_not_contain"]!;
    test("returns true when substring not present", () => {
      expect(matches!("Hello World", ["xyz"], {} as any)).toBe(true);
      expect(matches!("Hello World", ["world"], {} as any)).toBe(false);
    });
  });

  describe("starts_with", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["starts_with"]!;
    test("case-insensitive prefix match", () => {
      expect(matches!("Hello World", ["hello"], {} as any)).toBe(true);
      expect(matches!("Hello World", ["world"], {} as any)).toBe(false);
    });
  });

  describe("ends_with", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["ends_with"]!;
    test("case-insensitive suffix match", () => {
      expect(matches!("Hello World", ["world"], {} as any)).toBe(true);
      expect(matches!("Hello World", ["hello"], {} as any)).toBe(false);
    });
  });

  describe("is_any_of", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["is_any_of"]!;
    test("matches scalar candidate against multiple values", () => {
      expect(matches!("open", ["open", "closed"], {} as any)).toBe(true);
      expect(matches!("archived", ["open", "closed"], {} as any)).toBe(false);
    });
    test("matches array candidate if any value overlaps", () => {
      expect(matches!(["bug", "feature"], ["bug"], {} as any)).toBe(true);
      expect(matches!(["bug"], ["feature"], {} as any)).toBe(false);
    });
  });

  describe("is_none_of", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["is_none_of"]!;
    test("scalar candidate - returns true when not in values", () => {
      expect(matches!("archived", ["open", "closed"], {} as any)).toBe(true);
      expect(matches!("open", ["open", "closed"], {} as any)).toBe(false);
    });
    test("array candidate - returns true when no overlap", () => {
      expect(matches!(["bug"], ["feature"], {} as any)).toBe(true);
      expect(matches!(["bug", "feature"], ["feature"], {} as any)).toBe(false);
    });
  });

  describe("has_all_of", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["has_all_of"]!;
    test("returns true only when all filter values are in array", () => {
      expect(matches!(["a", "b", "c"], ["a", "b"], {} as any)).toBe(true);
      expect(matches!(["a"], ["a", "b"], {} as any)).toBe(false);
    });
    test("returns false for non-array candidate", () => {
      expect(matches!("a", ["a"], {} as any)).toBe(false);
    });
  });

  describe("is_empty", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["is_empty"]!;
    test("empty string is empty", () => {
      expect(matches!("", [], {} as any)).toBe(true);
    });
    test("whitespace-only string is empty", () => {
      expect(matches!("   ", [], {} as any)).toBe(true);
    });
    test("null is empty", () => {
      expect(matches!(null, [], {} as any)).toBe(true);
    });
    test("undefined is empty", () => {
      expect(matches!(undefined, [], {} as any)).toBe(true);
    });
    test("empty array is empty", () => {
      expect(matches!([], [], {} as any)).toBe(true);
    });
    test("non-empty string is not empty", () => {
      expect(matches!("hello", [], {} as any)).toBe(false);
    });
    test("non-empty array is not empty", () => {
      expect(matches!(["item"], [], {} as any)).toBe(false);
    });
    test("number 0 is NOT empty (has meaningful value)", () => {
      expect(matches!(0, [], {} as any)).toBe(false);
    });
  });

  describe("is_not_empty", () => {
    const { matches } = DEFAULT_FILTER_OPERATORS["is_not_empty"]!;
    test("non-empty string is not empty", () => {
      expect(matches!("hello", [], {} as any)).toBe(true);
    });
    test("empty string IS empty", () => {
      expect(matches!("", [], {} as any)).toBe(false);
    });
    test("null IS empty", () => {
      expect(matches!(null, [], {} as any)).toBe(false);
    });
  });
});

// --- Tests for helper functions ---

describe("getDefaultOperatorKeysForField", () => {
  test("text field defaults", () => {
    const keys = getDefaultOperatorKeysForField(textField);
    expect(keys).toContain("contains");
    expect(keys).toContain("is");
    expect(keys).toContain("starts_with");
    expect(keys).toContain("ends_with");
    expect(keys).toContain("is_empty");
  });

  test("select field defaults", () => {
    const keys = getDefaultOperatorKeysForField(selectField);
    expect(keys).toEqual(["is", "is_not", "is_empty", "is_not_empty"]);
  });

  test("multiselect field defaults", () => {
    const keys = getDefaultOperatorKeysForField(multiselectField);
    expect(keys).toEqual(["is_any_of", "is_none_of", "has_all_of", "is_empty", "is_not_empty"]);
  });

  test("custom field defaults", () => {
    const keys = getDefaultOperatorKeysForField(customField);
    expect(keys).toEqual(["is", "is_not", "is_empty", "is_not_empty"]);
  });

  test("field with custom operators array overrides defaults", () => {
    const keys = getDefaultOperatorKeysForField(customOperatorsField);
    expect(keys).toEqual(["is", "is_not"]);
  });
});

describe("getOperatorsForField", () => {
  test("returns operator definitions from registry", () => {
    const operators = getOperatorsForField(
      textField,
      DEFAULT_FILTER_OPERATORS as any,
    );
    expect(operators.length).toBeGreaterThan(0);
    expect(operators[0]).toHaveProperty("key");
    expect(operators[0]).toHaveProperty("matches");
  });

  test("skips operators not found in registry", () => {
    const sparseRegistry = { is: DEFAULT_FILTER_OPERATORS["is"] };
    const operators = getOperatorsForField(
      textField,
      sparseRegistry as any,
    );
    // Only "is" is in the sparse registry
    expect(operators).toHaveLength(1);
    expect(operators[0]!.key).toBe("is");
  });
});

describe("getDefaultOperatorForField", () => {
  test("returns first available operator when no defaultOperator set", () => {
    const op = getDefaultOperatorForField(textField, DEFAULT_FILTER_OPERATORS as any);
    expect(op?.key).toBe("contains"); // first in text's list
  });

  test("respects field.defaultOperator when set", () => {
    const fieldWithDefault: FilterFieldConfig = {
      ...textField,
      defaultOperator: "starts_with",
    };
    const op = getDefaultOperatorForField(fieldWithDefault, DEFAULT_FILTER_OPERATORS as any);
    expect(op?.key).toBe("starts_with");
  });

  test("falls back to first operator if defaultOperator not in registry", () => {
    const fieldWithBadDefault: FilterFieldConfig = {
      ...textField,
      defaultOperator: "nonexistent",
    };
    const op = getDefaultOperatorForField(fieldWithBadDefault, DEFAULT_FILTER_OPERATORS as any);
    expect(op?.key).toBe("contains"); // falls back to first
  });
});

describe("normalizeFilterValues", () => {
  test("single-arity operator keeps only first value", () => {
    const result = normalizeFilterValues(
      { id: "1", field: "title", operator: "is", values: ["a", "b", "c"] },
      textField,
      DEFAULT_FILTER_OPERATORS as any,
    );
    expect(result).toEqual(["a"]);
  });

  test("none-arity operator always returns empty array", () => {
    const result = normalizeFilterValues(
      { id: "1", field: "title", operator: "is_empty", values: ["some-value"] },
      textField,
      DEFAULT_FILTER_OPERATORS as any,
    );
    expect(result).toEqual([]);
  });

  test("multiple-arity operator without maxSelections keeps all values", () => {
    const unlimitedMultiselect: FilterFieldConfig = {
      key: "labels",
      label: "Labels",
      type: "multiselect",
      // no maxSelections
    };
    const result = normalizeFilterValues(
      { id: "1", field: "labels", operator: "is_any_of", values: ["bug", "feature", "enhancement"] },
      unlimitedMultiselect,
      DEFAULT_FILTER_OPERATORS as any,
    );
    expect(result).toEqual(["bug", "feature", "enhancement"]);
  });

  test("multiselect maxSelections caps the values", () => {
    const result = normalizeFilterValues(
      { id: "1", field: "tags", operator: "is_any_of", values: ["bug", "feature", "enhancement"] },
      multiselectField, // maxSelections: 2
      DEFAULT_FILTER_OPERATORS as any,
    );
    expect(result).toHaveLength(2);
    expect(result).toEqual(["bug", "feature"]);
  });

  test("unknown operator returns values unchanged", () => {
    const result = normalizeFilterValues(
      { id: "1", field: "title", operator: "unknown_op", values: ["a", "b"] },
      textField,
      DEFAULT_FILTER_OPERATORS as any,
    );
    expect(result).toEqual(["a", "b"]);
  });
});
