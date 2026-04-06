import type {
  Filter,
  FilterFieldConfig,
  FilterFieldDefinition,
  HeadlessFiltersController,
} from "../core/types";

function isFilterField<TRecord, TValue>(
  field: FilterFieldDefinition<TRecord, TValue>,
): field is FilterFieldConfig<TRecord, TValue> {
  return (
    field.type === "text" ||
    field.type === "select" ||
    field.type === "multiselect" ||
    field.type === "custom"
  );
}

export function getFilterSignature<TValue>(filters: Filter<TValue>[]): string {
  return JSON.stringify(filters);
}

export function flattenFilterFields<TRecord, TValue>(
  fields: FilterFieldDefinition<TRecord, TValue>[],
): FilterFieldConfig<TRecord, TValue>[] {
  const flattened: FilterFieldConfig<TRecord, TValue>[] = [];

  for (const field of fields) {
    if (field.type === "group") {
      flattened.push(...flattenFilterFields(field.fields));
      continue;
    }

    if (isFilterField(field)) {
      flattened.push(field);
    }
  }

  return flattened;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((value, index) => deepEqual(value, right[index]));
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    if (!deepEqual(leftKeys, rightKeys)) {
      return false;
    }

    return leftKeys.every((key) => deepEqual(left[key], right[key]));
  }

  return false;
}

export function areFilterValuesEqual<TValue>(left: TValue, right: TValue): boolean {
  return deepEqual(left, right);
}

export function formatFilterDraftValue<TValue>(
  field: FilterFieldConfig<any, TValue> | undefined,
  value: string,
): TValue {
  if (field?.parseValue) {
    return field.parseValue(value);
  }

  return value as TValue;
}

export function getFilterOptionLabel<TValue>(
  field: FilterFieldConfig<any, TValue> | undefined,
  value: TValue,
): string {
  const option = field?.options?.find((item) =>
    areFilterValuesEqual(item.value, value),
  );
  if (option) {
    return option.label;
  }

  return String(value ?? "");
}

export function getFilterTextInputValue<TValue>(
  field: FilterFieldConfig<any, TValue> | undefined,
  values: TValue[],
): string {
  if (values.length === 0) {
    return "";
  }

  return getFilterOptionLabel(field, values[0] as TValue);
}

export function getFirstFilterField<TRecord, TValue>(
  controller: HeadlessFiltersController<TRecord, TValue>,
): FilterFieldConfig<TRecord, TValue> | undefined {
  return controller.getFields("")[0];
}
