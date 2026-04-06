import type {
  Filter,
  FilterFieldConfig,
  FilterOperatorDefinition,
  FilterValueArity,
} from "./types";

const LOWERCASE_TEXT_OPERATORS = new Set([
  "contains",
  "does_not_contain",
  "starts_with",
  "ends_with",
]);

function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [value];
}

function toComparable(value: unknown): unknown {
  if (isDate(value)) {
    return value.getTime();
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return value;
}

function toNormalizedText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function arraysShareValues(candidate: unknown[], values: unknown[]): boolean {
  const normalizedCandidate = candidate.map(toComparable);
  return values.some((value) =>
    normalizedCandidate.some((item) => Object.is(item, toComparable(value))),
  );
}

function arrayHasAllValues(candidate: unknown[], values: unknown[]): boolean {
  const normalizedCandidate = candidate.map(toComparable);
  return values.every((value) =>
    normalizedCandidate.some((item) => Object.is(item, toComparable(value))),
  );
}

function normalizeValues<TValue>(
  values: TValue[],
  arity: FilterValueArity,
): TValue[] {
  if (arity === "none") {
    return [];
  }

  if (arity === "single") {
    return values.length === 0 ? [] : [values[0] as TValue];
  }

  return values;
}

function createOperator(
  definition: FilterOperatorDefinition<unknown>,
): FilterOperatorDefinition<unknown> {
  return definition;
}

export const DEFAULT_FILTER_OPERATORS: Record<
  string,
  FilterOperatorDefinition<unknown>
> = {
  is: createOperator({
    key: "is",
    label: "is",
    arity: "single",
    matches: (candidate, values) =>
      Object.is(toComparable(candidate), toComparable(values[0])),
    normalizeValues: (values) => normalizeValues(values, "single"),
  }),
  is_not: createOperator({
    key: "is_not",
    label: "is not",
    arity: "single",
    matches: (candidate, values) =>
      !Object.is(toComparable(candidate), toComparable(values[0])),
    normalizeValues: (values) => normalizeValues(values, "single"),
  }),
  contains: createOperator({
    key: "contains",
    label: "contains",
    arity: "single",
    matches: (candidate, values) => {
      const candidateText = toNormalizedText(candidate);
      const valueText = toNormalizedText(values[0]);
      return candidateText.includes(valueText);
    },
    normalizeValues: (values) => normalizeValues(values, "single"),
  }),
  does_not_contain: createOperator({
    key: "does_not_contain",
    label: "does not contain",
    arity: "single",
    matches: (candidate, values) => {
      const candidateText = toNormalizedText(candidate);
      const valueText = toNormalizedText(values[0]);
      return !candidateText.includes(valueText);
    },
    normalizeValues: (values) => normalizeValues(values, "single"),
  }),
  starts_with: createOperator({
    key: "starts_with",
    label: "starts with",
    arity: "single",
    matches: (candidate, values) => {
      const candidateText = toNormalizedText(candidate);
      const valueText = toNormalizedText(values[0]);
      return candidateText.startsWith(valueText);
    },
    normalizeValues: (values) => normalizeValues(values, "single"),
  }),
  ends_with: createOperator({
    key: "ends_with",
    label: "ends with",
    arity: "single",
    matches: (candidate, values) => {
      const candidateText = toNormalizedText(candidate);
      const valueText = toNormalizedText(values[0]);
      return candidateText.endsWith(valueText);
    },
    normalizeValues: (values) => normalizeValues(values, "single"),
  }),
  is_any_of: createOperator({
    key: "is_any_of",
    label: "is any of",
    arity: "multiple",
    matches: (candidate, values) => {
      if (Array.isArray(candidate)) {
        return arraysShareValues(candidate, values);
      }

      return values.some((value) =>
        Object.is(toComparable(candidate), toComparable(value)),
      );
    },
  }),
  is_none_of: createOperator({
    key: "is_none_of",
    label: "is none of",
    arity: "multiple",
    matches: (candidate, values) => {
      if (Array.isArray(candidate)) {
        return !arraysShareValues(candidate, values);
      }

      return values.every(
        (value) => !Object.is(toComparable(candidate), toComparable(value)),
      );
    },
  }),
  has_all_of: createOperator({
    key: "has_all_of",
    label: "has all of",
    arity: "multiple",
    matches: (candidate, values) =>
      Array.isArray(candidate) && arrayHasAllValues(candidate, values),
  }),
  is_empty: createOperator({
    key: "is_empty",
    label: "is empty",
    arity: "none",
    matches: (candidate) => !hasMeaningfulValue(candidate),
    normalizeValues: () => [],
  }),
  is_not_empty: createOperator({
    key: "is_not_empty",
    label: "is not empty",
    arity: "none",
    matches: (candidate) => hasMeaningfulValue(candidate),
    normalizeValues: () => [],
  }),
};

const DEFAULT_OPERATORS_BY_TYPE: Record<
  FilterFieldConfig["type"],
  string[]
> = {
  text: [
    "contains",
    "does_not_contain",
    "is",
    "is_not",
    "starts_with",
    "ends_with",
    "is_empty",
    "is_not_empty",
  ],
  select: ["is", "is_not", "is_empty", "is_not_empty"],
  multiselect: ["is_any_of", "is_none_of", "has_all_of", "is_empty", "is_not_empty"],
  custom: ["is", "is_not", "is_empty", "is_not_empty"],
};

export function getDefaultOperatorKeysForField<TRecord = unknown, TValue = unknown>(
  field: FilterFieldConfig<TRecord, TValue>,
): string[] {
  return field.operators ?? DEFAULT_OPERATORS_BY_TYPE[field.type];
}

export function getOperatorsForField<TRecord = unknown, TValue = unknown>(
  field: FilterFieldConfig<TRecord, TValue>,
  registry: Record<string, FilterOperatorDefinition<TValue>>,
): FilterOperatorDefinition<TValue>[] {
  return getDefaultOperatorKeysForField(field)
    .map((key) => registry[key])
    .filter(
      (operator): operator is FilterOperatorDefinition<TValue> =>
        operator !== undefined,
    );
}

export function getDefaultOperatorForField<TRecord = unknown, TValue = unknown>(
  field: FilterFieldConfig<TRecord, TValue>,
  registry: Record<string, FilterOperatorDefinition<TValue>>,
): FilterOperatorDefinition<TValue> | undefined {
  if (field.defaultOperator && registry[field.defaultOperator]) {
    return registry[field.defaultOperator];
  }

  return getOperatorsForField(field, registry)[0];
}

export function normalizeFilterValues<TRecord = unknown, TValue = unknown>(
  filter: Filter<TValue>,
  field: FilterFieldConfig<TRecord, TValue>,
  registry: Record<string, FilterOperatorDefinition<TValue>>,
): TValue[] {
  const operator = registry[filter.operator];
  if (!operator) {
    return filter.values;
  }

  const values = operator.normalizeValues
    ? operator.normalizeValues(filter.values, field)
    : normalizeValues(filter.values, operator.arity);

  if (field.type === "multiselect" && typeof field.maxSelections === "number") {
    return values.slice(0, field.maxSelections);
  }

  if (
    field.type === "text" &&
    LOWERCASE_TEXT_OPERATORS.has(operator.key) &&
    values.length > 0
  ) {
    return [values[0]] as TValue[];
  }

  return values;
}
