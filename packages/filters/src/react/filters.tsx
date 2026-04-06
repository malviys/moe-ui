import React, {
  useMemo,
  useId,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import type {
  Filter,
  FilterFieldConfig,
  FilterFieldDefinition,
  FilterOperatorDefinition,
  HeadlessFiltersController,
  HeadlessFiltersState,
  FilterValidationReport,
} from "../core/types";
import {
  areFilterValuesEqual,
  flattenFilterFields,
  getFilterTextInputValue,
} from "../internal/adapter-utils";
import { createFilterDraftActions } from "../internal/filter-draft-actions";
import { useHeadlessFiltersController } from "../internal/react/use-headless-filters-controller";

type SlotFactory<TProps, TContext> = TProps | ((context: TContext) => TProps);

type DivSlotProps = HTMLAttributes<HTMLDivElement>;
type ButtonSlotProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type InputSlotProps = InputHTMLAttributes<HTMLInputElement>;
type SpanSlotProps = HTMLAttributes<HTMLSpanElement>;

const styles = {
  root: {
    display: "grid",
    gap: "12px",
  } satisfies CSSProperties,
  toolbar: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    overflowX: "auto",
    flexWrap: "wrap",
  } satisfies CSSProperties,
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "999px",
    border: "1px solid #d4d4d8",
    background: "#ffffff",
    padding: "8px 12px",
    cursor: "pointer",
  } satisfies CSSProperties,
  chipText: {
    color: "#18181b",
    fontSize: "14px",
    lineHeight: 1.2,
  } satisfies CSSProperties,
  mutedText: {
    color: "#71717a",
  } satisfies CSSProperties,
  removeButton: {
    border: "none",
    background: "transparent",
    color: "#a1a1aa",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
  } satisfies CSSProperties,
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    border: "1px solid #d4d4d8",
    background: "#f4f4f5",
    color: "#18181b",
    padding: "8px 14px",
    cursor: "pointer",
  } satisfies CSSProperties,
  buttonText: {
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.2,
  } satisfies CSSProperties,
  composer: {
    display: "grid",
    gap: "12px",
    borderRadius: "20px",
    border: "1px solid #e4e4e7",
    background: "#ffffff",
    padding: "16px",
  } satisfies CSSProperties,
  section: {
    display: "grid",
    gap: "8px",
  } satisfies CSSProperties,
  sectionTitle: {
    color: "#3f3f46",
    fontSize: "13px",
    fontWeight: 600,
  } satisfies CSSProperties,
  input: {
    width: "100%",
    borderRadius: "14px",
    border: "1px solid #d4d4d8",
    background: "#fafafa",
    color: "#18181b",
    padding: "10px 12px",
    outline: "none",
  } satisfies CSSProperties,
  selectionWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  } satisfies CSSProperties,
  selectionItem: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    border: "1px solid #d4d4d8",
    background: "#ffffff",
    color: "#18181b",
    padding: "8px 12px",
    cursor: "pointer",
  } satisfies CSSProperties,
  selectionItemActive: {
    borderColor: "#18181b",
    background: "#18181b",
    color: "#ffffff",
  } satisfies CSSProperties,
  selectionItemText: {
    fontSize: "14px",
    lineHeight: 1.2,
  } satisfies CSSProperties,
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    flexWrap: "wrap",
  } satisfies CSSProperties,
} as const;

function resolveSlotProps<TProps, TContext>(
  factory: SlotFactory<TProps, TContext> | undefined,
  context: TContext,
): TProps | undefined {
  if (typeof factory === "function") {
    return (factory as (value: TContext) => TProps)(context);
  }

  return factory;
}

function mergeClassName(
  ...values: Array<string | undefined>
): string | undefined {
  const className = values.filter(Boolean).join(" ").trim();
  return className.length > 0 ? className : undefined;
}

function mergeStyle(
  base: CSSProperties | undefined,
  extra?: CSSProperties,
): CSSProperties | undefined {
  if (!base) {
    return extra;
  }

  if (!extra) {
    return base;
  }

  return {
    ...base,
    ...extra,
  };
}

export interface ReactFilterChipContext<TValue = unknown> {
  filter: Filter<TValue>;
  summary: string;
  remove: () => void;
  edit: () => void;
  selected: boolean;
}

export interface ReactFilterOptionContext<TRecord = unknown, TValue = unknown> {
  field: FilterFieldConfig<TRecord, TValue>;
  selected: boolean;
  select: () => void;
}

export interface ReactOperatorOptionContext<
  TRecord = unknown,
  TValue = unknown,
> {
  field: FilterFieldConfig<TRecord, TValue>;
  operator: FilterOperatorDefinition<TValue>;
  selected: boolean;
  select: () => void;
}

export interface ReactValueOptionContext<TRecord = unknown, TValue = unknown> {
  field: FilterFieldConfig<TRecord, TValue>;
  option: { value: TValue; label: string };
  selected: boolean;
  toggle: () => void;
}

export interface ReactDraftContext<TRecord = unknown, TValue = unknown> {
  controller: HeadlessFiltersController<TRecord, TValue>;
  state: HeadlessFiltersState<TValue>;
  field?: FilterFieldConfig<TRecord, TValue>;
  validationReport: FilterValidationReport<TValue> | null;
  validationError: string | null;
  commit: () => void;
  discard: () => void;
}

export interface ReactFiltersLabels {
  addFilter: string;
  searchFields: string;
  searchFieldsPlaceholder: string;
  fieldSection: string;
  operatorSection: string;
  valueSection: string;
  apply: string;
  cancel: string;
  remove: string;
  noFields: string;
  noOptions: string;
}

export interface ReactFiltersComponents {
  Root?: ElementType;
  Toolbar?: ElementType;
  Composer?: ElementType;
  Section?: ElementType;
  SectionTitle?: ElementType;
  AddButton?: ElementType;
  AddButtonText?: ElementType;
  FilterChip?: ElementType;
  FilterChipText?: ElementType;
  RemoveButton?: ElementType;
  RemoveButtonText?: ElementType;
  Input?: ElementType;
  Footer?: ElementType;
  OptionButton?: ElementType;
  OptionText?: ElementType;
  EmptyState?: ElementType;
}

export interface ReactFiltersSlots<TRecord = unknown, TValue = unknown> {
  root?: DivSlotProps;
  toolbar?: DivSlotProps;
  composer?: DivSlotProps;
  searchInput?: InputSlotProps;
  footer?: DivSlotProps;
  emptyState?: HTMLAttributes<HTMLElement>;
  filterChip?: SlotFactory<ButtonSlotProps, ReactFilterChipContext<TValue>>;
  filterChipText?: SlotFactory<SpanSlotProps, ReactFilterChipContext<TValue>>;
  removeButton?: SlotFactory<ButtonSlotProps, ReactFilterChipContext<TValue>>;
  removeButtonText?: SlotFactory<SpanSlotProps, ReactFilterChipContext<TValue>>;
  addButton?: ButtonSlotProps;
  addButtonText?: SpanSlotProps;
  section?: DivSlotProps;
  sectionTitle?: HTMLAttributes<HTMLElement>;
  fieldOption?: SlotFactory<
    ButtonSlotProps,
    ReactFilterOptionContext<TRecord, TValue>
  >;
  fieldOptionText?: SlotFactory<
    SpanSlotProps,
    ReactFilterOptionContext<TRecord, TValue>
  >;
  operatorOption?: SlotFactory<
    ButtonSlotProps,
    ReactOperatorOptionContext<TRecord, TValue>
  >;
  operatorOptionText?: SlotFactory<
    SpanSlotProps,
    ReactOperatorOptionContext<TRecord, TValue>
  >;
  valueInput?: InputSlotProps;
  valueOption?: SlotFactory<
    ButtonSlotProps,
    ReactValueOptionContext<TRecord, TValue>
  >;
  valueOptionText?: SlotFactory<
    SpanSlotProps,
    ReactValueOptionContext<TRecord, TValue>
  >;
  applyButton?: ButtonSlotProps;
  applyButtonText?: SpanSlotProps;
  cancelButton?: ButtonSlotProps;
  cancelButtonText?: SpanSlotProps;
}

export interface ReactFiltersRenderers<TRecord = unknown, TValue = unknown> {
  renderAddButton?: (context: {
    isOpen: boolean;
    open: () => void;
    props: ButtonSlotProps;
    textProps: SpanSlotProps;
    label: string;
  }) => ReactNode;
  renderFilterChip?: (context: {
    item: ReactFilterChipContext<TValue>;
    props: ButtonSlotProps;
    textProps: SpanSlotProps;
    removeProps: ButtonSlotProps;
    removeTextProps: SpanSlotProps;
  }) => ReactNode;
  renderDraft?: (context: ReactDraftContext<TRecord, TValue>) => ReactNode;
  renderFieldOption?: (context: {
    item: ReactFilterOptionContext<TRecord, TValue>;
    props: ButtonSlotProps;
    textProps: SpanSlotProps;
  }) => ReactNode;
  renderOperatorOption?: (context: {
    item: ReactOperatorOptionContext<TRecord, TValue>;
    props: ButtonSlotProps;
    textProps: SpanSlotProps;
  }) => ReactNode;
  renderValueInput?: (context: {
    field: FilterFieldConfig<TRecord, TValue>;
    value: string;
    setValue: (value: string) => void;
    props: InputSlotProps;
  }) => ReactNode;
  renderValueOption?: (context: {
    item: ReactValueOptionContext<TRecord, TValue>;
    props: ButtonSlotProps;
    textProps: SpanSlotProps;
  }) => ReactNode;
}

export interface ReactFiltersProps<TRecord = unknown, TValue = unknown> {
  fields: FilterFieldDefinition<TRecord, TValue>[];
  filters?: Filter<TValue>[];
  defaultFilters?: Filter<TValue>[];
  onFiltersChange?: (filters: Filter<TValue>[]) => void;
  allowMultiple?: boolean;
  operatorRegistry?: Record<string, FilterOperatorDefinition<TValue>>;
  createId?: () => string;
  showSearchInput?: boolean;
  labels?: Partial<ReactFiltersLabels>;
  slots?: ReactFiltersSlots<TRecord, TValue>;
  components?: ReactFiltersComponents;
  renderers?: ReactFiltersRenderers<TRecord, TValue>;
  style?: CSSProperties;
  className?: string;
}

const defaultLabels: ReactFiltersLabels = {
  addFilter: "Add filter",
  searchFields: "Search fields",
  searchFieldsPlaceholder: "Search fields...",
  fieldSection: "Field",
  operatorSection: "Operator",
  valueSection: "Value",
  apply: "Apply",
  cancel: "Cancel",
  remove: "Remove",
  noFields: "No matching fields.",
  noOptions: "No options available.",
};

export function ReactFilters<TRecord = unknown, TValue = unknown>(
  props: ReactFiltersProps<TRecord, TValue>,
) {
  const {
    fields,
    filters,
    defaultFilters,
    onFiltersChange,
    allowMultiple,
    operatorRegistry,
    createId,
    showSearchInput = true,
    labels: labelOverrides,
    slots,
    components,
    renderers,
    style,
    className,
  } = props;

  const labels = {
    ...defaultLabels,
    ...labelOverrides,
  };

  const { controller, controllerState } = useHeadlessFiltersController({
    fields,
    filters,
    defaultFilters,
    allowMultiple,
    operatorRegistry,
    createId,
    onChange: onFiltersChange,
  });

  const flattenedFields = useMemo(() => flattenFilterFields(fields), [fields]);
  const composerId = useId();
  const searchSectionTitleId = `${composerId}-search-title`;
  const fieldSectionTitleId = `${composerId}-field-title`;
  const operatorSectionTitleId = `${composerId}-operator-title`;
  const valueSectionTitleId = `${composerId}-value-title`;
  const validationMessageId = `${composerId}-validation-message`;
  const draft = controllerState.draft;
  const selectedField = draft ? controller.getField(draft.field) : undefined;
  const selectedOperators = selectedField
    ? controller.getOperators(selectedField.key)
    : [];
  const visibleFields = controller.getFields();
  const selectedFilterId = draft?.id;
  const draftActions = createFilterDraftActions({
    controller,
    operatorRegistry,
  });
  const draftSnapshot = draftActions.getSnapshot();
  const validationError = draftSnapshot.validationError;

  const Root = components?.Root ?? "div";
  const Toolbar = components?.Toolbar ?? "div";
  const Composer = components?.Composer ?? "div";
  const Section = components?.Section ?? "div";
  const SectionTitle = components?.SectionTitle ?? "div";
  const AddButton = components?.AddButton ?? "button";
  const AddButtonText = components?.AddButtonText ?? "span";
  const FilterChip = components?.FilterChip ?? "button";
  const FilterChipText = components?.FilterChipText ?? "span";
  const RemoveButton = components?.RemoveButton ?? "button";
  const RemoveButtonText = components?.RemoveButtonText ?? "span";
  const Input = components?.Input ?? "input";
  const Footer = components?.Footer ?? "div";
  const OptionButton = components?.OptionButton ?? "button";
  const OptionText = components?.OptionText ?? "span";
  const EmptyState = components?.EmptyState ?? "div";

  const rootProps: DivSlotProps = {
    ...(slots?.root ?? {}),
    className: mergeClassName(className, slots?.root?.className),
    style: mergeStyle(
      mergeStyle(styles.root, style),
      slots?.root?.style as CSSProperties,
    ),
  };

  const toolbarProps: DivSlotProps = {
    role: "toolbar",
    "aria-label": "Filters",
    ...(slots?.toolbar ?? {}),
    className: mergeClassName(slots?.toolbar?.className),
    style: mergeStyle(styles.toolbar, slots?.toolbar?.style as CSSProperties),
  };

  const composerProps: DivSlotProps = {
    id: composerId,
    role: "dialog",
    "aria-modal": false,
    "aria-label": "Filter composer",
    ...(slots?.composer ?? {}),
    className: mergeClassName(slots?.composer?.className),
    style: mergeStyle(styles.composer, slots?.composer?.style as CSSProperties),
  };

  const addButtonProps: ButtonSlotProps = {
    type: "button",
    "aria-controls": composerId,
    "aria-expanded": draft !== null,
    "aria-haspopup": "dialog",
    ...(slots?.addButton ?? {}),
    className: mergeClassName(slots?.addButton?.className),
    style: mergeStyle(styles.button, slots?.addButton?.style as CSSProperties),
  };

  const addButtonTextProps: SpanSlotProps = {
    ...(slots?.addButtonText ?? {}),
    className: mergeClassName(slots?.addButtonText?.className),
    style: mergeStyle(
      styles.buttonText,
      slots?.addButtonText?.style as CSSProperties,
    ),
  };

  const searchInputProps: InputSlotProps = {
    "aria-label": labels.searchFields,
    placeholder: labels.searchFieldsPlaceholder,
    value: controllerState.query,
    onChange: (event) => controller.setQuery(event.currentTarget.value),
    ...(slots?.searchInput ?? {}),
    className: mergeClassName(slots?.searchInput?.className),
    style: mergeStyle(styles.input, slots?.searchInput?.style as CSSProperties),
  };

  const footerProps: DivSlotProps = {
    ...(slots?.footer ?? {}),
    className: mergeClassName(slots?.footer?.className),
    style: mergeStyle(styles.footer, slots?.footer?.style as CSSProperties),
  };

  return (
    <Root {...rootProps}>
      <Toolbar {...toolbarProps}>
        {controllerState.filters.map((filter) => {
          const chipContext: ReactFilterChipContext<TValue> = {
            filter,
            summary: controller.getFilterSummary(filter).text,
            remove: () => controller.removeFilter(filter.id),
            edit: () => draftActions.editFilter(filter),
            selected: selectedFilterId === filter.id,
          };

          const slotChipProps = resolveSlotProps(
            slots?.filterChip,
            chipContext,
          );
          const slotChipTextProps = resolveSlotProps(
            slots?.filterChipText,
            chipContext,
          );
          const slotRemoveProps = resolveSlotProps(
            slots?.removeButton,
            chipContext,
          );
          const slotRemoveTextProps = resolveSlotProps(
            slots?.removeButtonText,
            chipContext,
          );

          const chipProps: ButtonSlotProps = {
            type: "button",
            "aria-label": `Edit filter ${chipContext.summary}`,
            "aria-pressed": chipContext.selected,
            ...slotChipProps,
            onClick: chipContext.edit,
            className: mergeClassName(slotChipProps?.className),
            style: mergeStyle(
              styles.chip,
              slotChipProps?.style as CSSProperties,
            ),
          };
          const chipTextProps: SpanSlotProps = {
            ...slotChipTextProps,
            className: mergeClassName(slotChipTextProps?.className),
            style: mergeStyle(
              mergeStyle(
                styles.chipText,
                chipContext.selected ? undefined : styles.mutedText,
              ),
              slotChipTextProps?.style as CSSProperties,
            ),
          };
          const removeButtonProps: ButtonSlotProps = {
            type: "button",
            "aria-label": `${labels.remove} ${chipContext.summary}`,
            ...slotRemoveProps,
            onClick: (event) => {
              event.stopPropagation();
              chipContext.remove();
            },
            className: mergeClassName(slotRemoveProps?.className),
            style: mergeStyle(
              styles.removeButton,
              slotRemoveProps?.style as CSSProperties,
            ),
          };
          const removeTextProps: SpanSlotProps = {
            ...slotRemoveTextProps,
            className: mergeClassName(slotRemoveTextProps?.className),
            style: mergeStyle(
              undefined,
              slotRemoveTextProps?.style as CSSProperties,
            ),
          };

          if (renderers?.renderFilterChip) {
            return (
              <React.Fragment key={filter.id}>
                {renderers.renderFilterChip({
                  item: chipContext,
                  props: chipProps,
                  textProps: chipTextProps,
                  removeProps: removeButtonProps,
                  removeTextProps,
                })}
              </React.Fragment>
            );
          }

          return (
            <FilterChip key={filter.id} {...chipProps}>
              <FilterChipText {...chipTextProps}>
                {chipContext.summary}
              </FilterChipText>
              <RemoveButton {...removeButtonProps}>
                <RemoveButtonText {...removeTextProps}>×</RemoveButtonText>
              </RemoveButton>
            </FilterChip>
          );
        })}

        {renderers?.renderAddButton ? (
          renderers.renderAddButton({
            isOpen: draft !== null,
            open: draftActions.openDraft,
            props: addButtonProps,
            textProps: addButtonTextProps,
            label: labels.addFilter,
          })
        ) : (
          <AddButton {...addButtonProps} onClick={draftActions.openDraft}>
            <AddButtonText {...addButtonTextProps}>
              {labels.addFilter}
            </AddButtonText>
          </AddButton>
        )}
      </Toolbar>

      {draft && renderers?.renderDraft
        ? renderers.renderDraft({
            controller,
            state: controllerState,
            field: selectedField,
            validationReport: draftSnapshot.validationReport,
            validationError,
            commit: () => {
              draftActions.commitDraft();
            },
            discard: draftActions.discardDraft,
          })
        : null}

      {draft && !renderers?.renderDraft && (
        <Composer {...composerProps}>
          {showSearchInput && (
            <Section
              {...(slots?.section ?? {})}
              aria-labelledby={searchSectionTitleId}
              className={mergeClassName(slots?.section?.className)}
              style={mergeStyle(
                styles.section,
                slots?.section?.style as CSSProperties,
              )}
            >
              <SectionTitle
                id={searchSectionTitleId}
                {...(slots?.sectionTitle ?? {})}
                className={mergeClassName(slots?.sectionTitle?.className)}
                style={mergeStyle(
                  styles.sectionTitle,
                  slots?.sectionTitle?.style as CSSProperties,
                )}
              >
                {labels.searchFields}
              </SectionTitle>
              <Input {...searchInputProps} />
            </Section>
          )}

          <Section
            {...(slots?.section ?? {})}
            aria-labelledby={fieldSectionTitleId}
            className={mergeClassName(slots?.section?.className)}
            style={mergeStyle(
              styles.section,
              slots?.section?.style as CSSProperties,
            )}
          >
            <SectionTitle
              id={fieldSectionTitleId}
              {...(slots?.sectionTitle ?? {})}
              className={mergeClassName(slots?.sectionTitle?.className)}
              style={mergeStyle(
                styles.sectionTitle,
                slots?.sectionTitle?.style as CSSProperties,
              )}
            >
              {labels.fieldSection}
            </SectionTitle>

            <div style={styles.selectionWrap}>
              {(visibleFields.length > 0 ? visibleFields : flattenedFields).map(
                (field) => {
                  const item: ReactFilterOptionContext<TRecord, TValue> = {
                    field,
                    selected: draft.field === field.key,
                    select: () => draftActions.selectField(field),
                  };
                  const optionProps = resolveSlotProps(
                    slots?.fieldOption,
                    item,
                  );
                  const textProps = resolveSlotProps(
                    slots?.fieldOptionText,
                    item,
                  );
                  const mergedOptionProps: ButtonSlotProps = {
                    type: "button",
                    "aria-pressed": item.selected,
                    ...optionProps,
                    onClick: item.select,
                    className: mergeClassName(optionProps?.className),
                    style: mergeStyle(
                      mergeStyle(
                        styles.selectionItem,
                        item.selected ? styles.selectionItemActive : undefined,
                      ),
                      optionProps?.style as CSSProperties,
                    ),
                  };
                  const mergedTextProps: SpanSlotProps = {
                    ...textProps,
                    className: mergeClassName(textProps?.className),
                    style: mergeStyle(
                      styles.selectionItemText,
                      textProps?.style as CSSProperties,
                    ),
                  };

                  if (renderers?.renderFieldOption) {
                    return (
                      <React.Fragment key={field.key}>
                        {renderers.renderFieldOption({
                          item,
                          props: mergedOptionProps,
                          textProps: mergedTextProps,
                        })}
                      </React.Fragment>
                    );
                  }

                  return (
                    <OptionButton key={field.key} {...mergedOptionProps}>
                      <OptionText {...mergedTextProps}>
                        {field.label}
                      </OptionText>
                    </OptionButton>
                  );
                },
              )}
            </div>

            {visibleFields.length === 0 && (
              <EmptyState
                {...(slots?.emptyState ?? {})}
                className={mergeClassName(slots?.emptyState?.className)}
                style={mergeStyle(
                  styles.mutedText,
                  slots?.emptyState?.style as CSSProperties,
                )}
              >
                {labels.noFields}
              </EmptyState>
            )}
          </Section>

          {selectedField && (
            <Section
              {...(slots?.section ?? {})}
              aria-labelledby={operatorSectionTitleId}
              className={mergeClassName(slots?.section?.className)}
              style={mergeStyle(
                styles.section,
                slots?.section?.style as CSSProperties,
              )}
            >
              <SectionTitle
                id={operatorSectionTitleId}
                {...(slots?.sectionTitle ?? {})}
                className={mergeClassName(slots?.sectionTitle?.className)}
                style={mergeStyle(
                  styles.sectionTitle,
                  slots?.sectionTitle?.style as CSSProperties,
                )}
              >
                {labels.operatorSection}
              </SectionTitle>

              <div style={styles.selectionWrap}>
                {selectedOperators.map((operator) => {
                  const item: ReactOperatorOptionContext<TRecord, TValue> = {
                    field: selectedField,
                    operator,
                    selected: draft.operator === operator.key,
                    select: () =>
                      controller.updateDraft({ operator: operator.key }),
                  };
                  const optionProps = resolveSlotProps(
                    slots?.operatorOption,
                    item,
                  );
                  const textProps = resolveSlotProps(
                    slots?.operatorOptionText,
                    item,
                  );
                  const mergedOptionProps: ButtonSlotProps = {
                    type: "button",
                    "aria-pressed": item.selected,
                    ...optionProps,
                    onClick: item.select,
                    className: mergeClassName(optionProps?.className),
                    style: mergeStyle(
                      mergeStyle(
                        styles.selectionItem,
                        item.selected ? styles.selectionItemActive : undefined,
                      ),
                      optionProps?.style as CSSProperties,
                    ),
                  };
                  const mergedTextProps: SpanSlotProps = {
                    ...textProps,
                    className: mergeClassName(textProps?.className),
                    style: mergeStyle(
                      styles.selectionItemText,
                      textProps?.style as CSSProperties,
                    ),
                  };

                  if (renderers?.renderOperatorOption) {
                    return (
                      <React.Fragment key={operator.key}>
                        {renderers.renderOperatorOption({
                          item,
                          props: mergedOptionProps,
                          textProps: mergedTextProps,
                        })}
                      </React.Fragment>
                    );
                  }

                  return (
                    <OptionButton key={operator.key} {...mergedOptionProps}>
                      <OptionText {...mergedTextProps}>
                        {operator.label}
                      </OptionText>
                    </OptionButton>
                  );
                })}
              </div>
            </Section>
          )}

          {selectedField && (
            <Section
              {...(slots?.section ?? {})}
              aria-labelledby={valueSectionTitleId}
              className={mergeClassName(slots?.section?.className)}
              style={mergeStyle(
                styles.section,
                slots?.section?.style as CSSProperties,
              )}
            >
              <SectionTitle
                id={valueSectionTitleId}
                {...(slots?.sectionTitle ?? {})}
                className={mergeClassName(slots?.sectionTitle?.className)}
                style={mergeStyle(
                  styles.sectionTitle,
                  slots?.sectionTitle?.style as CSSProperties,
                )}
              >
                {labels.valueSection}
              </SectionTitle>

              {(selectedField.type === "text" ||
                selectedField.type === "custom") &&
                (renderers?.renderValueInput ? (
                  renderers.renderValueInput({
                    field: selectedField,
                    value: getFilterTextInputValue(selectedField, draft.values),
                    setValue: draftActions.updateTextValue,
                    props: {
                      "aria-label": `${selectedField.label} ${labels.valueSection}`,
                      ...(slots?.valueInput ?? {}),
                      value: getFilterTextInputValue(selectedField, draft.values),
                      onChange: (event) =>
                        draftActions.updateTextValue(event.currentTarget.value),
                      className: mergeClassName(slots?.valueInput?.className),
                      style: mergeStyle(
                        styles.input,
                        slots?.valueInput?.style as CSSProperties,
                      ),
                    },
                  })
                ) : (
                  <Input
                    aria-label={`${selectedField.label} ${labels.valueSection}`}
                    {...(slots?.valueInput ?? {})}
                    value={getFilterTextInputValue(selectedField, draft.values)}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      draftActions.updateTextValue(event.currentTarget.value)
                    }
                    className={mergeClassName(slots?.valueInput?.className)}
                    style={mergeStyle(
                      styles.input,
                      slots?.valueInput?.style as CSSProperties,
                    )}
                  />
                ))}

              {(selectedField.type === "select" ||
                selectedField.type === "multiselect") && (
                <div style={styles.selectionWrap}>
                  {(selectedField.options ?? []).map((option) => {
                    const item: ReactValueOptionContext<TRecord, TValue> = {
                      field: selectedField,
                      option,
                      selected: draft.values.some((value) =>
                        areFilterValuesEqual(value, option.value),
                      ),
                      toggle: () => draftActions.toggleOption(option.value),
                    };
                    const optionProps = resolveSlotProps(
                      slots?.valueOption,
                      item,
                    );
                    const textProps = resolveSlotProps(
                      slots?.valueOptionText,
                      item,
                    );
                    const mergedOptionProps: ButtonSlotProps = {
                      type: "button",
                      "aria-pressed": item.selected,
                      ...optionProps,
                      onClick: item.toggle,
                      className: mergeClassName(optionProps?.className),
                      style: mergeStyle(
                        mergeStyle(
                          styles.selectionItem,
                          item.selected
                            ? styles.selectionItemActive
                            : undefined,
                        ),
                        optionProps?.style as CSSProperties,
                      ),
                    };
                    const mergedTextProps: SpanSlotProps = {
                      ...textProps,
                      className: mergeClassName(textProps?.className),
                      style: mergeStyle(
                        styles.selectionItemText,
                        textProps?.style as CSSProperties,
                      ),
                    };

                    if (renderers?.renderValueOption) {
                      return (
                        <React.Fragment key={option.label}>
                          {renderers.renderValueOption({
                            item,
                            props: mergedOptionProps,
                            textProps: mergedTextProps,
                          })}
                        </React.Fragment>
                      );
                    }

                    return (
                      <OptionButton key={option.label} {...mergedOptionProps}>
                        <OptionText {...mergedTextProps}>
                          {option.label}
                        </OptionText>
                      </OptionButton>
                    );
                  })}

                  {(selectedField.options ?? []).length === 0 && (
                    <EmptyState
                      {...(slots?.emptyState ?? {})}
                      className={mergeClassName(slots?.emptyState?.className)}
                      style={mergeStyle(
                        styles.mutedText,
                        slots?.emptyState?.style as CSSProperties,
                      )}
                    >
                      {labels.noOptions}
                    </EmptyState>
                  )}
                </div>
              )}
            </Section>
          )}

          {validationError && (
            <EmptyState
              id={validationMessageId}
              role="alert"
              aria-live="assertive"
              {...(slots?.emptyState ?? {})}
              className={mergeClassName(slots?.emptyState?.className)}
              style={mergeStyle(
                { color: "#b91c1c", fontSize: "13px" },
                slots?.emptyState?.style as CSSProperties,
              )}
            >
              {validationError}
            </EmptyState>
          )}

          <Footer {...footerProps}>
            <AddButton
              {...(slots?.cancelButton ?? {})}
              type="button"
              onClick={draftActions.discardDraft}
              className={mergeClassName(slots?.cancelButton?.className)}
              style={mergeStyle(
                styles.button,
                slots?.cancelButton?.style as CSSProperties,
              )}
            >
              <AddButtonText
                {...(slots?.cancelButtonText ?? {})}
                className={mergeClassName(slots?.cancelButtonText?.className)}
                style={mergeStyle(
                  styles.buttonText,
                  slots?.cancelButtonText?.style as CSSProperties,
                )}
              >
                {labels.cancel}
              </AddButtonText>
            </AddButton>
            <AddButton
              {...(slots?.applyButton ?? {})}
              type="button"
              onClick={() => {
                draftActions.commitDraft();
              }}
              className={mergeClassName(slots?.applyButton?.className)}
              style={mergeStyle(
                styles.button,
                slots?.applyButton?.style as CSSProperties,
              )}
            >
              <AddButtonText
                {...(slots?.applyButtonText ?? {})}
                className={mergeClassName(slots?.applyButtonText?.className)}
                style={mergeStyle(
                  styles.buttonText,
                  slots?.applyButtonText?.style as CSSProperties,
                )}
              >
                {labels.apply}
              </AddButtonText>
            </AddButton>
          </Footer>
        </Composer>
      )}
    </Root>
  );
}

export default ReactFilters;
