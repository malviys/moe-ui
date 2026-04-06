export type FilterFieldType = "text" | "select" | "multiselect" | "custom";

export type FilterDefinitionType = FilterFieldType | "group" | "separator";

export type FilterValueArity = "none" | "single" | "multiple";

export type FilterValidationResult =
  | true
  | string
  | {
      valid: boolean;
      reason?: string;
    };

export interface FilterOption<TValue = unknown> {
  value: TValue;
  label: string;
  keywords?: string[];
  disabled?: boolean;
  data?: Record<string, unknown>;
}

export interface Filter<TValue = unknown> {
  id: string;
  field: string;
  operator: string;
  values: TValue[];
}

export interface FilterDraft<TValue = unknown> {
  id: string;
  field: string;
  operator: string;
  values: TValue[];
}

export interface FilterOperatorDefinition<TValue = unknown> {
  key: string;
  label: string;
  arity: FilterValueArity;
  matches?: (candidate: unknown, values: TValue[], filter: Filter<TValue>) => boolean;
  normalizeValues?: (
    values: TValue[],
    field: FilterFieldConfig<any, TValue>,
  ) => TValue[];
}

export interface FilterValidationContext<TRecord = unknown, TValue = unknown> {
  field: FilterFieldConfig<TRecord, TValue>;
  filter: Filter<TValue>;
  operator?: FilterOperatorDefinition<TValue>;
}

export interface FilterFieldConfig<TRecord = unknown, TValue = unknown> {
  key: string;
  label: string;
  type: FilterFieldType;
  description?: string;
  options?: FilterOption<TValue>[];
  operators?: string[];
  defaultOperator?: string;
  placeholder?: string;
  searchable?: boolean;
  maxSelections?: number;
  pattern?: string;
  accessor?: Extract<keyof TRecord, string> | ((record: TRecord) => unknown);
  validation?: (
    context: FilterValidationContext<TRecord, TValue>,
  ) => FilterValidationResult;
  serializeValue?: (value: TValue) => unknown;
  parseValue?: (value: unknown) => TValue;
  metadata?: Record<string, unknown>;
}

export interface FilterFieldGroup<TRecord = unknown, TValue = unknown> {
  key: string;
  label: string;
  type: "group";
  fields: FilterFieldDefinition<TRecord, TValue>[];
  initialFilters?: Filter<TValue>[];
}

export interface FilterFieldSeparator {
  key: string;
  label: string;
  type: "separator";
}

export type FilterFieldDefinition<TRecord = unknown, TValue = unknown> =
  | FilterFieldConfig<TRecord, TValue>
  | FilterFieldGroup<TRecord, TValue>
  | FilterFieldSeparator;

export interface FilterSummary<TValue = unknown> {
  filter: Filter<TValue>;
  fieldLabel: string;
  operatorLabel: string;
  valueLabels: string[];
  text: string;
}

export interface FilterValidationIssue<TValue = unknown> {
  filter: Filter<TValue>;
  reason: string;
}

export interface FilterValidationReport<TValue = unknown> {
  valid: boolean;
  issues: FilterValidationIssue<TValue>[];
}

export interface HeadlessFiltersState<TValue = unknown> {
  filters: Filter<TValue>[];
  draft: FilterDraft<TValue> | null;
  query: string;
}

export interface HeadlessFiltersChange<TValue = unknown> {
  type:
    | "set-filters"
    | "add-filter"
    | "update-filter"
    | "remove-filter"
    | "clear-filters"
    | "commit-draft";
  filters: Filter<TValue>[];
  filter?: Filter<TValue>;
}

export interface HeadlessFiltersControllerOptions<
  TRecord = unknown,
  TValue = unknown,
> {
  fields: FilterFieldDefinition<TRecord, TValue>[];
  filters?: Filter<TValue>[];
  allowMultiple?: boolean;
  operatorRegistry?: Record<string, FilterOperatorDefinition<TValue>>;
  createId?: () => string;
  onChange?: (change: HeadlessFiltersChange<TValue>) => void;
}

export interface HeadlessFiltersController<TRecord = unknown, TValue = unknown> {
  getState: () => HeadlessFiltersState<TValue>;
  subscribe: (
    listener: (state: HeadlessFiltersState<TValue>) => void,
  ) => () => void;
  getField: (fieldKey: string) => FilterFieldConfig<TRecord, TValue> | undefined;
  getFields: (query?: string) => FilterFieldConfig<TRecord, TValue>[];
  getOperators: (fieldKey: string) => FilterOperatorDefinition<TValue>[];
  getFilterSummary: (filter: Filter<TValue>) => FilterSummary<TValue>;
  setQuery: (query: string) => HeadlessFiltersState<TValue>;
  beginDraft: (
    fieldKey: string,
    seed?: Partial<Omit<FilterDraft<TValue>, "field">>,
  ) => FilterDraft<TValue>;
  updateDraft: (patch: Partial<FilterDraft<TValue>>) => FilterDraft<TValue> | null;
  discardDraft: () => HeadlessFiltersState<TValue>;
  commitDraft: () =>
    | {
        ok: true;
        filter: Filter<TValue>;
      }
    | {
        ok: false;
        reason: string;
      };
  setFilters: (filters: Filter<TValue>[]) => Filter<TValue>[];
  addFilter: (filter: Omit<Filter<TValue>, "id"> & { id?: string }) => Filter<TValue>;
  updateFilter: (
    id: string,
    patch: Partial<Omit<Filter<TValue>, "id">>,
  ) => Filter<TValue> | undefined;
  removeFilter: (id: string) => boolean;
  clearFilters: () => void;
  validateFilter: (filter: Filter<TValue>) => FilterValidationReport<TValue>;
  validateDraft: () => FilterValidationReport<TValue> | null;
  serialize: () => string;
}
