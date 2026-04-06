import {
  DEFAULT_FILTER_OPERATORS,
  getDefaultOperatorForField,
  getOperatorsForField,
  normalizeFilterValues,
} from "./operators";
import type {
  Filter,
  FilterDraft,
  FilterFieldConfig,
  FilterFieldDefinition,
  FilterFieldGroup,
  FilterOperatorDefinition,
  FilterSummary,
  FilterValidationIssue,
  FilterValidationReport,
  HeadlessFiltersChange,
  HeadlessFiltersController,
  HeadlessFiltersControllerOptions,
  HeadlessFiltersState,
} from "./types";

function defaultCreateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `filter_${Math.random().toString(36).slice(2, 10)}`;
}

function isGroup<TRecord, TValue>(
  field: FilterFieldDefinition<TRecord, TValue>,
): field is FilterFieldGroup<TRecord, TValue> {
  return field.type === "group";
}

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
  const flattened: FilterFieldConfig<TRecord, TValue>[] = [];

  for (const field of fields) {
    if (isGroup(field)) {
      flattened.push(...flattenFields(field.fields));
      continue;
    }

    if (isFilterField(field)) {
      flattened.push(field);
    }
  }

  return flattened;
}

function matchesQuery<TRecord, TValue>(
  field: FilterFieldConfig<TRecord, TValue>,
  query: string,
): boolean {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();
  return [field.key, field.label, field.description]
    .filter((value): value is string => typeof value === "string")
    .some((value) => value.toLowerCase().includes(normalizedQuery));
}

function getOptionLabel<TValue>(
  field: FilterFieldConfig<any, TValue>,
  value: TValue,
): string {
  const option = field.options?.find((item) => Object.is(item.value, value));
  if (option) {
    return option.label;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return JSON.stringify(value) ?? String(value);
}

function serializeFieldValue<TValue>(
  field: FilterFieldConfig<any, TValue> | undefined,
  value: TValue,
): unknown {
  if (field?.serializeValue) {
    return field.serializeValue(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function parseFieldValue<TValue>(
  field: FilterFieldConfig<any, TValue> | undefined,
  value: unknown,
): TValue {
  if (field?.parseValue) {
    return field.parseValue(value);
  }

  return value as TValue;
}

function cloneFilter<TValue>(filter: Filter<TValue>): Filter<TValue> {
  return {
    ...filter,
    values: [...filter.values],
  };
}

function createSummary<TRecord, TValue>(
  filter: Filter<TValue>,
  field: FilterFieldConfig<TRecord, TValue> | undefined,
  registry: Record<string, FilterOperatorDefinition<TValue>>,
): FilterSummary<TValue> {
  const operatorLabel = registry[filter.operator]?.label ?? filter.operator;
  const valueLabels = field
    ? filter.values.map((value) => getOptionLabel(field, value))
    : filter.values.map((value) => String(value));
  const fieldLabel = field?.label ?? filter.field;
  const text = [fieldLabel, operatorLabel, valueLabels.join(", ")]
    .filter((value) => value.length > 0)
    .join(" ");

  return {
    filter,
    fieldLabel,
    operatorLabel,
    valueLabels,
    text,
  };
}

export function createFilter<TValue = unknown>(
  field: string,
  operator = "is",
  values: TValue[] = [],
  createId: () => string = defaultCreateId,
): Filter<TValue> {
  return {
    id: createId(),
    field,
    operator,
    values: [...values],
  };
}

export function createFilterGroup<TRecord = unknown, TValue = unknown>(
  key: string,
  label: string,
  fields: FilterFieldDefinition<TRecord, TValue>[],
  initialFilters: Filter<TValue>[] = [],
) {
  return {
    key,
    label,
    type: "group" as const,
    fields,
    initialFilters,
  };
}

export function createHeadlessFiltersController<
  TRecord = unknown,
  TValue = unknown,
>(
  options: HeadlessFiltersControllerOptions<TRecord, TValue>,
): HeadlessFiltersController<TRecord, TValue> {
  const createId = options.createId ?? defaultCreateId;
  const fields = flattenFields(options.fields);
  const fieldMap = new Map<string, FilterFieldConfig<TRecord, TValue>>(
    fields.map((field) => [field.key, field]),
  );
  const registry = {
    ...(DEFAULT_FILTER_OPERATORS as Record<string, FilterOperatorDefinition<TValue>>),
    ...options.operatorRegistry,
  };
  const listeners = new Set<(state: HeadlessFiltersState<TValue>) => void>();
  const allowMultiple = options.allowMultiple ?? true;

  let state: HeadlessFiltersState<TValue> = {
    filters: (options.filters ?? []).map(cloneFilter),
    draft: null,
    query: "",
  };

  function emit(): void {
    for (const listener of listeners) {
      listener(controller.getState());
    }
  }

  function notify(change: HeadlessFiltersChange<TValue>): void {
    options.onChange?.(change);
    emit();
  }

  function normalize(filter: Filter<TValue>): Filter<TValue> {
    const field = fieldMap.get(filter.field);
    if (!field) {
      return cloneFilter(filter);
    }

    return {
      ...filter,
      values: normalizeFilterValues(filter, field, registry),
    };
  }

  function buildReport(filter: Filter<TValue>): FilterValidationReport<TValue> {
    const issues: FilterValidationIssue<TValue>[] = [];
    const field = fieldMap.get(filter.field);

    if (!field) {
      issues.push({
        filter,
        reason: `Unknown field "${filter.field}".`,
      });
      return {
        valid: false,
        issues,
      };
    }

    const operator = registry[filter.operator];
    if (!operator) {
      issues.push({
        filter,
        reason: `Unknown operator "${filter.operator}".`,
      });
    }

    const allowedOperators = getOperatorsForField(field, registry).map(
      (item) => item.key,
    );
    if (allowedOperators.length > 0 && !allowedOperators.includes(filter.operator)) {
      issues.push({
        filter,
        reason: `Operator "${filter.operator}" is not allowed for "${field.label}".`,
      });
    }

    if (
      operator?.arity === "single" &&
      filter.values.length !== 1 &&
      !(field.type === "text" && filter.values.length > 0)
    ) {
      issues.push({
        filter,
        reason: `"${field.label}" expects a single value.`,
      });
    }

    if (operator?.arity === "none" && filter.values.length > 0) {
      issues.push({
        filter,
        reason: `"${field.label}" does not accept values for "${operator.label}".`,
      });
    }

    if (
      field.type === "multiselect" &&
      typeof field.maxSelections === "number" &&
      filter.values.length > field.maxSelections
    ) {
      issues.push({
        filter,
        reason: `"${field.label}" allows at most ${field.maxSelections} selections.`,
      });
    }

    if (field.type === "select" && filter.values.length > 1) {
      issues.push({
        filter,
        reason: `"${field.label}" allows a single selected value.`,
      });
    }

    if (field.pattern && filter.values.length > 0) {
      const expression = new RegExp(field.pattern);
      const matches = filter.values.every((value) =>
        expression.test(String(value ?? "")),
      );
      if (!matches) {
        issues.push({
          filter,
          reason: `"${field.label}" does not match the required pattern.`,
        });
      }
    }

    if (field.validation) {
      const result = field.validation({
        field,
        filter,
        operator,
      });

      if (result !== true) {
        if (typeof result === "string") {
          issues.push({ filter, reason: result });
        } else if (!result.valid) {
          issues.push({
            filter,
            reason: result.reason ?? `Invalid value for "${field.label}".`,
          });
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  function applyFilterUpdate(
    nextFilter: Filter<TValue>,
    changeType: HeadlessFiltersChange<TValue>["type"],
  ): Filter<TValue> {
    const normalized = normalize(nextFilter);
    const isExisting = state.filters.some((item) => item.id === normalized.id);

    let nextFilters = state.filters.slice();
    if (!allowMultiple) {
      nextFilters = nextFilters.filter(
        (item) => item.id === normalized.id || item.field !== normalized.field,
      );
    }

    if (isExisting) {
      nextFilters = nextFilters.map((item) =>
        item.id === normalized.id ? normalized : item,
      );
    } else {
      nextFilters.push(normalized);
    }

    state = {
      ...state,
      filters: nextFilters,
    };

    notify({
      type: changeType,
      filters: state.filters.map(cloneFilter),
      filter: normalized,
    });

    return normalized;
  }

  const controller: HeadlessFiltersController<TRecord, TValue> = {
    getState: () => ({
      filters: state.filters.map(cloneFilter),
      draft: state.draft
        ? {
            ...state.draft,
            values: [...state.draft.values],
          }
        : null,
      query: state.query,
    }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getField: (fieldKey) => fieldMap.get(fieldKey),
    getFields: (query = state.query) => fields.filter((field) => matchesQuery(field, query)),
    getOperators: (fieldKey) => {
      const field = fieldMap.get(fieldKey);
      if (!field) {
        return [];
      }

      return getOperatorsForField(field, registry);
    },
    getFilterSummary: (filter) =>
      createSummary(filter, fieldMap.get(filter.field), registry),
    setQuery: (query) => {
      state = {
        ...state,
        query,
      };
      emit();
      return controller.getState();
    },
    beginDraft: (fieldKey, seed) => {
      const field = fieldMap.get(fieldKey);
      if (!field) {
        throw new Error(`Unknown field "${fieldKey}".`);
      }

      const operator =
        seed?.operator ??
        getDefaultOperatorForField(field, registry)?.key ??
        field.defaultOperator ??
        "is";

      state = {
        ...state,
        draft: normalize({
          id: seed?.id ?? createId(),
          field: fieldKey,
          operator,
          values: [...(seed?.values ?? [])],
        }),
      };
      emit();
      const draft = state.draft;
      if (!draft) {
        throw new Error("Failed to initialize draft filter.");
      }
      return {
        ...draft,
        values: [...draft.values],
      };
    },
    updateDraft: (patch) => {
      if (!state.draft) {
        return null;
      }

      const fieldKey = patch.field ?? state.draft.field;
      const field = fieldMap.get(fieldKey);
      if (!field) {
        throw new Error(`Unknown field "${fieldKey}".`);
      }

      const nextDraft: FilterDraft<TValue> = {
        id: patch.id ?? state.draft.id,
        field: fieldKey,
        operator:
          patch.operator ??
          state.draft.operator ??
          getDefaultOperatorForField(field, registry)?.key ??
          "is",
        values: [...(patch.values ?? state.draft.values)],
      };

      state = {
        ...state,
        draft: normalize(nextDraft),
      };
      emit();
      const draft = state.draft;
      if (!draft) {
        throw new Error("Failed to update draft filter.");
      }
      return {
        ...draft,
        values: [...draft.values],
      };
    },
    discardDraft: () => {
      state = {
        ...state,
        draft: null,
      };
      emit();
      return controller.getState();
    },
    commitDraft: () => {
      if (!state.draft) {
        return {
          ok: false as const,
          reason: "There is no active draft filter.",
        };
      }

      const nextFilter: Filter<TValue> = {
        ...state.draft,
        values: [...state.draft.values],
      };
      const report = buildReport(nextFilter);
      if (!report.valid) {
        return {
          ok: false as const,
          reason: report.issues[0]?.reason ?? "Invalid draft filter.",
        };
      }

      state = {
        ...state,
        draft: null,
      };
      const committed = applyFilterUpdate(nextFilter, "commit-draft");
      return {
        ok: true as const,
        filter: committed,
      };
    },
    setFilters: (filters) => {
      state = {
        ...state,
        filters: filters.map((filter) => normalize(filter)),
      };
      notify({
        type: "set-filters",
        filters: state.filters.map(cloneFilter),
      });
      return state.filters.map(cloneFilter);
    },
    addFilter: (filter) =>
      applyFilterUpdate(
        {
          id: filter.id ?? createId(),
          field: filter.field,
          operator: filter.operator,
          values: [...filter.values],
        },
        "add-filter",
      ),
    updateFilter: (id, patch) => {
      const current = state.filters.find((item) => item.id === id);
      if (!current) {
        return undefined;
      }

      return applyFilterUpdate(
        {
          ...current,
          ...patch,
          values: [...(patch.values ?? current.values)],
        },
        "update-filter",
      );
    },
    removeFilter: (id) => {
      const exists = state.filters.some((filter) => filter.id === id);
      if (!exists) {
        return false;
      }

      state = {
        ...state,
        filters: state.filters.filter((filter) => filter.id !== id),
      };
      notify({
        type: "remove-filter",
        filters: state.filters.map(cloneFilter),
      });
      return true;
    },
    clearFilters: () => {
      state = {
        ...state,
        filters: [],
      };
      notify({
        type: "clear-filters",
        filters: [],
      });
    },
    validateFilter: buildReport,
    validateDraft: () => {
      if (!state.draft) {
        return null;
      }

      return buildReport({
        ...state.draft,
        values: [...state.draft.values],
      });
    },
    serialize: () =>
      JSON.stringify(
        state.filters.map((filter) => {
          const field = fieldMap.get(filter.field);
          return {
            ...filter,
            values: filter.values.map((value) => serializeFieldValue(field, value)),
          };
        }),
      ),
  };

  return controller;
}

export function deserializeFilters<TRecord = unknown, TValue = unknown>(
  serialized: string,
  fields: FilterFieldDefinition<TRecord, TValue>[],
): Filter<TValue>[] {
  const fieldMap = new Map(
    flattenFields(fields).map((field) => [field.key, field] as const),
  );

  const payload = JSON.parse(serialized) as Filter<unknown>[];
  return payload.map((filter) => {
    const field = fieldMap.get(filter.field);
    return {
      id: filter.id,
      field: filter.field,
      operator: filter.operator,
      values: filter.values.map((value) => parseFieldValue(field, value)),
    };
  });
}
