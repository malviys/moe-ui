import { DEFAULT_FILTER_OPERATORS } from "./operators";
import type {
  Filter,
  FilterFieldConfig,
  FilterFieldDefinition,
  FilterOperatorDefinition,
} from "./types";

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

function flattenFields<TRecord, TValue>(
  fields: FilterFieldDefinition<TRecord, TValue>[],
): FilterFieldConfig<TRecord, TValue>[] {
  return fields.flatMap((field) => {
    if (field.type === "group") {
      return flattenFields(field.fields);
    }

    return isFilterField(field) ? [field] : [];
  });
}

function getRecordValue<TRecord, TValue>(
  record: TRecord,
  field: FilterFieldConfig<TRecord, TValue>,
): unknown {
  if (typeof field.accessor === "function") {
    return field.accessor(record);
  }

  if (typeof field.accessor === "string") {
    return (record as Record<string, unknown>)[field.accessor];
  }

  return (record as Record<string, unknown>)[field.key];
}

export interface FilterRecordsOptions<TValue = unknown> {
  operatorRegistry?: Record<string, FilterOperatorDefinition<TValue>>;
}

export function matchesFilter<TRecord, TValue = unknown>(
  record: TRecord,
  filter: Filter<TValue>,
  fields: FilterFieldDefinition<TRecord, TValue>[],
  options: FilterRecordsOptions<TValue> = {},
): boolean {
  const field = flattenFields(fields).find((item) => item.key === filter.field);
  if (!field) {
    return false;
  }

  const registry = {
    ...(DEFAULT_FILTER_OPERATORS as Record<string, FilterOperatorDefinition<TValue>>),
    ...options.operatorRegistry,
  };
  const operator = registry[filter.operator];
  if (!operator?.matches) {
    return false;
  }

  return operator.matches(getRecordValue(record, field), filter.values, filter);
}

export function filterRecords<TRecord, TValue = unknown>(
  records: TRecord[],
  filters: Filter<TValue>[],
  fields: FilterFieldDefinition<TRecord, TValue>[],
  options: FilterRecordsOptions<TValue> = {},
): TRecord[] {
  if (filters.length === 0) {
    return records.slice();
  }

  return records.filter((record) =>
    filters.every((filter) => matchesFilter(record, filter, fields, options)),
  );
}
