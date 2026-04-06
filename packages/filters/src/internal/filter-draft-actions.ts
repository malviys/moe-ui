import { getDefaultOperatorForField } from "../core/operators";
import type {
  Filter,
  FilterFieldConfig,
  FilterOperatorDefinition,
  FilterValidationReport,
  HeadlessFiltersController,
  HeadlessFiltersState,
} from "../core/types";
import {
  areFilterValuesEqual,
  formatFilterDraftValue,
  getFirstFilterField,
} from "./adapter-utils";

export interface FilterDraftSnapshot<TRecord = unknown, TValue = unknown> {
  draft: HeadlessFiltersState<TValue>["draft"];
  field?: FilterFieldConfig<TRecord, TValue>;
  validationReport: FilterValidationReport<TValue> | null;
  validationError: string | null;
}

export interface FilterDraftActionsOptions<TRecord = unknown, TValue = unknown> {
  controller: HeadlessFiltersController<TRecord, TValue>;
  operatorRegistry?: Record<string, FilterOperatorDefinition<TValue>>;
}

export interface FilterDraftActions<TRecord = unknown, TValue = unknown> {
  getSnapshot: () => FilterDraftSnapshot<TRecord, TValue>;
  openDraft: () => void;
  discardDraft: () => void;
  commitDraft: () =>
    | {
        ok: true;
        filter: Filter<TValue>;
      }
    | {
        ok: false;
        reason: string;
      };
  editFilter: (filter: Filter<TValue>) => void;
  selectField: (field: FilterFieldConfig<TRecord, TValue>) => void;
  updateTextValue: (value: string) => void;
  toggleOption: (value: TValue) => void;
}

export function createFilterDraftActions<TRecord = unknown, TValue = unknown>(
  options: FilterDraftActionsOptions<TRecord, TValue>,
): FilterDraftActions<TRecord, TValue> {
  const { controller, operatorRegistry } = options;

  function getSnapshot(): FilterDraftSnapshot<TRecord, TValue> {
    const state = controller.getState();
    const draft = state.draft;
    const field = draft ? controller.getField(draft.field) : undefined;
    const validationReport = controller.validateDraft();

    return {
      draft,
      field,
      validationReport,
      validationError:
        validationReport && !validationReport.valid
          ? validationReport.issues[0]?.reason ?? "Invalid draft filter."
          : null,
    };
  }

  function openDraft(): void {
    const snapshot = getSnapshot();
    if (snapshot.draft) {
      return;
    }

    const firstField = getFirstFilterField(controller);
    if (!firstField) {
      return;
    }

    controller.setQuery("");
    controller.beginDraft(firstField.key);
  }

  function discardDraft(): void {
    controller.setQuery("");
    controller.discardDraft();
  }

  function commitDraft() {
    const result = controller.commitDraft();
    if (result.ok) {
      controller.setQuery("");
    }

    return result;
  }

  function editFilter(filter: Filter<TValue>): void {
    controller.setQuery("");
    controller.beginDraft(filter.field, {
      id: filter.id,
      operator: filter.operator,
      values: filter.values,
    });
  }

  function selectField(field: FilterFieldConfig<TRecord, TValue>): void {
    controller.updateDraft({
      field: field.key,
      operator:
        getDefaultOperatorForField(field, {
          ...controller
            .getOperators(field.key)
            .reduce<Record<string, FilterOperatorDefinition<TValue>>>(
              (accumulator, operator) => {
                accumulator[operator.key] = operator;
                return accumulator;
              },
              {},
            ),
          ...(operatorRegistry ?? {}),
        })?.key ??
        field.defaultOperator ??
        "is",
      values: [],
    });
  }

  function updateTextValue(value: string): void {
    const snapshot = getSnapshot();
    if (!snapshot.field) {
      return;
    }

    controller.updateDraft({
      values:
        value.length === 0 ? [] : [formatFilterDraftValue(snapshot.field, value)],
    });
  }

  function toggleOption(value: TValue): void {
    const snapshot = getSnapshot();
    if (!snapshot.draft || !snapshot.field) {
      return;
    }

    if (snapshot.field.type === "select") {
      controller.updateDraft({
        values: [value],
      });
      return;
    }

    const isSelected = snapshot.draft.values.some((item) =>
      areFilterValuesEqual(item, value),
    );

    controller.updateDraft({
      values: isSelected
        ? snapshot.draft.values.filter((item) => !areFilterValuesEqual(item, value))
        : [...snapshot.draft.values, value],
    });
  }

  return {
    getSnapshot,
    openDraft,
    discardDraft,
    commitDraft,
    editFilter,
    selectField,
    updateTextValue,
    toggleOption,
  };
}
