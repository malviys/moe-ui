import {
  defineComponent,
  getCurrentInstance,
  h,
  useAttrs,
  type CSSProperties,
  type Component,
  type PropType,
  type VNodeChild,
} from "vue";

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
import { useVueHeadlessFiltersController } from "../internal/vue/use-headless-filters-controller";

type DOMSlotProps = {
  class?: unknown;
  style?: unknown;
  [key: string]: unknown;
};

type SlotFactory<TProps, TContext> = TProps | ((context: TContext) => TProps);

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

function mergeClassName(...values: Array<unknown | undefined>): unknown[] {
  return values.filter((value) => value !== undefined);
}

function mergeStyle(base: CSSProperties | undefined, extra?: unknown): unknown {
  if (!base) {
    return extra;
  }

  if (!extra) {
    return base;
  }

  return [base, extra];
}

function normalizeChildren(
  children?: VNodeChild | VNodeChild[],
): VNodeChild[] {
  const items = Array.isArray(children) ? children : [children];
  return items.filter(
    (child): child is VNodeChild =>
      child !== null && child !== undefined && child !== false,
  );
}

function renderNode(
  node: string | Component,
  props: DOMSlotProps,
  children?: VNodeChild | VNodeChild[],
) {
  const normalizedChildren = normalizeChildren(children);
  if (typeof node === "string") {
    return h(node, props, normalizedChildren);
  }

  return h(node, props, {
    default: () => normalizedChildren,
  });
}

export interface VueFilterChipContext<TValue = unknown> {
  filter: Filter<TValue>;
  summary: string;
  remove: () => void;
  edit: () => void;
  selected: boolean;
}

export interface VueFilterOptionContext<TRecord = unknown, TValue = unknown> {
  field: FilterFieldConfig<TRecord, TValue>;
  selected: boolean;
  select: () => void;
}

export interface VueOperatorOptionContext<TRecord = unknown, TValue = unknown> {
  field: FilterFieldConfig<TRecord, TValue>;
  operator: FilterOperatorDefinition<TValue>;
  selected: boolean;
  select: () => void;
}

export interface VueValueOptionContext<TRecord = unknown, TValue = unknown> {
  field: FilterFieldConfig<TRecord, TValue>;
  option: { value: TValue; label: string };
  selected: boolean;
  toggle: () => void;
}

export interface VueDraftContext<TRecord = unknown, TValue = unknown> {
  controller: HeadlessFiltersController<TRecord, TValue>;
  state: HeadlessFiltersState<TValue>;
  field?: FilterFieldConfig<TRecord, TValue>;
  validationReport: FilterValidationReport<TValue> | null;
  validationError: string | null;
  commit: () => void;
  discard: () => void;
}

export interface VueFiltersLabels {
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

export interface VueFiltersComponents {
  Root?: string | Component;
  Toolbar?: string | Component;
  Composer?: string | Component;
  Section?: string | Component;
  SectionTitle?: string | Component;
  AddButton?: string | Component;
  AddButtonText?: string | Component;
  FilterChip?: string | Component;
  FilterChipText?: string | Component;
  RemoveButton?: string | Component;
  RemoveButtonText?: string | Component;
  Input?: string | Component;
  Footer?: string | Component;
  OptionButton?: string | Component;
  OptionText?: string | Component;
  EmptyState?: string | Component;
}

export interface VueFiltersUI<TRecord = unknown, TValue = unknown> {
  root?: DOMSlotProps;
  toolbar?: DOMSlotProps;
  composer?: DOMSlotProps;
  searchInput?: DOMSlotProps;
  footer?: DOMSlotProps;
  emptyState?: DOMSlotProps;
  filterChip?: SlotFactory<DOMSlotProps, VueFilterChipContext<TValue>>;
  filterChipText?: SlotFactory<DOMSlotProps, VueFilterChipContext<TValue>>;
  removeButton?: SlotFactory<DOMSlotProps, VueFilterChipContext<TValue>>;
  removeButtonText?: SlotFactory<DOMSlotProps, VueFilterChipContext<TValue>>;
  addButton?: DOMSlotProps;
  addButtonText?: DOMSlotProps;
  section?: DOMSlotProps;
  sectionTitle?: DOMSlotProps;
  fieldOption?: SlotFactory<
    DOMSlotProps,
    VueFilterOptionContext<TRecord, TValue>
  >;
  fieldOptionText?: SlotFactory<
    DOMSlotProps,
    VueFilterOptionContext<TRecord, TValue>
  >;
  operatorOption?: SlotFactory<
    DOMSlotProps,
    VueOperatorOptionContext<TRecord, TValue>
  >;
  operatorOptionText?: SlotFactory<
    DOMSlotProps,
    VueOperatorOptionContext<TRecord, TValue>
  >;
  valueInput?: DOMSlotProps;
  valueOption?: SlotFactory<
    DOMSlotProps,
    VueValueOptionContext<TRecord, TValue>
  >;
  valueOptionText?: SlotFactory<
    DOMSlotProps,
    VueValueOptionContext<TRecord, TValue>
  >;
  applyButton?: DOMSlotProps;
  applyButtonText?: DOMSlotProps;
  cancelButton?: DOMSlotProps;
  cancelButtonText?: DOMSlotProps;
}

export interface VueFiltersRenderers<TRecord = unknown, TValue = unknown> {
  renderAddButton?: (context: {
    isOpen: boolean;
    open: () => void;
    props: DOMSlotProps;
    textProps: DOMSlotProps;
    label: string;
  }) => VNodeChild;
  renderFilterChip?: (context: {
    item: VueFilterChipContext<TValue>;
    props: DOMSlotProps;
    textProps: DOMSlotProps;
    removeProps: DOMSlotProps;
    removeTextProps: DOMSlotProps;
  }) => VNodeChild;
  renderDraft?: (context: VueDraftContext<TRecord, TValue>) => VNodeChild;
  renderFieldOption?: (context: {
    item: VueFilterOptionContext<TRecord, TValue>;
    props: DOMSlotProps;
    textProps: DOMSlotProps;
  }) => VNodeChild;
  renderOperatorOption?: (context: {
    item: VueOperatorOptionContext<TRecord, TValue>;
    props: DOMSlotProps;
    textProps: DOMSlotProps;
  }) => VNodeChild;
  renderValueInput?: (context: {
    field: FilterFieldConfig<TRecord, TValue>;
    value: string;
    setValue: (value: string) => void;
    props: DOMSlotProps;
  }) => VNodeChild;
  renderValueOption?: (context: {
    item: VueValueOptionContext<TRecord, TValue>;
    props: DOMSlotProps;
    textProps: DOMSlotProps;
  }) => VNodeChild;
}

export interface VueFiltersProps<TRecord = unknown, TValue = unknown> {
  fields: FilterFieldDefinition<TRecord, TValue>[];
  filters?: Filter<TValue>[];
  modelValue?: Filter<TValue>[];
  defaultFilters?: Filter<TValue>[];
  allowMultiple?: boolean;
  operatorRegistry?: Record<string, FilterOperatorDefinition<TValue>>;
  createId?: () => string;
  showSearchInput?: boolean;
  labels?: Partial<VueFiltersLabels>;
  ui?: VueFiltersUI<TRecord, TValue>;
  components?: VueFiltersComponents;
  renderers?: VueFiltersRenderers<TRecord, TValue>;
}

const defaultLabels: VueFiltersLabels = {
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

export const VueFilters = defineComponent({
  name: "VueFilters",
  inheritAttrs: false,
  props: {
    fields: {
      type: Array as PropType<FilterFieldDefinition<unknown, unknown>[]>,
      required: true,
    },
    filters: {
      type: Array as PropType<Filter<unknown>[]>,
      default: undefined,
    },
    modelValue: {
      type: Array as PropType<Filter<unknown>[]>,
      default: undefined,
    },
    defaultFilters: {
      type: Array as PropType<Filter<unknown>[]>,
      default: () => [],
    },
    allowMultiple: {
      type: Boolean,
      default: true,
    },
    operatorRegistry: {
      type: Object as PropType<
        Record<string, FilterOperatorDefinition<unknown>>
      >,
      default: undefined,
    },
    createId: {
      type: Function as PropType<() => string>,
      default: undefined,
    },
    showSearchInput: {
      type: Boolean,
      default: true,
    },
    labels: {
      type: Object as PropType<Partial<VueFiltersLabels>>,
      default: undefined,
    },
    ui: {
      type: Object as PropType<VueFiltersUI<unknown, unknown>>,
      default: undefined,
    },
    components: {
      type: Object as PropType<VueFiltersComponents>,
      default: undefined,
    },
    renderers: {
      type: Object as PropType<VueFiltersRenderers<unknown, unknown>>,
      default: undefined,
    },
  },
  emits: {
    "update:modelValue": (_filters: Filter<unknown>[]) => true,
    change: (_filters: Filter<unknown>[]) => true,
  },
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    const composerId = `vue-filters-${instance?.uid ?? 0}-composer`;
    const attrs = useAttrs();
    const { controller, controllerState } = useVueHeadlessFiltersController(() => ({
      fields: props.fields,
      filters: props.filters,
      modelValue: props.modelValue,
      defaultFilters: props.defaultFilters,
      allowMultiple: props.allowMultiple,
      operatorRegistry: props.operatorRegistry,
      createId: props.createId,
      onChange: (filters) => {
        emit("update:modelValue", filters);
        emit("change", filters);
      },
    }));
    const getDraftActions = () =>
      createFilterDraftActions({
        controller: controller.value,
        operatorRegistry: props.operatorRegistry,
      });

    function openDraft(): void {
      getDraftActions().openDraft();
    }

    function discardDraft(): void {
      getDraftActions().discardDraft();
    }

    function commitDraft(): void {
      getDraftActions().commitDraft();
    }

    function editFilter(filter: Filter<unknown>): void {
      getDraftActions().editFilter(filter);
    }

    function selectField(field: FilterFieldConfig<unknown, unknown>): void {
      getDraftActions().selectField(field);
    }

    function updateTextValue(value: string): void {
      getDraftActions().updateTextValue(value);
    }

    function toggleOption(value: unknown): void {
      getDraftActions().toggleOption(value);
    }

    return () => {
      const labels = {
        ...defaultLabels,
        ...props.labels,
      };
      const ui = props.ui;
      const renderers = props.renderers;
      const flattenedFields = flattenFilterFields(props.fields);
      const draft = controllerState.value.draft;
      const selectedField = draft
        ? controller.value.getField(draft.field)
        : undefined;
      const selectedOperators = selectedField
        ? controller.value.getOperators(selectedField.key)
        : [];
      const visibleFields = controller.value.getFields();
      const selectedFilterId = draft?.id;
      const draftSnapshot = getDraftActions().getSnapshot();
      const validationError = draftSnapshot.validationError;

      const Root = props.components?.Root ?? "div";
      const Toolbar = props.components?.Toolbar ?? "div";
      const Composer = props.components?.Composer ?? "div";
      const Section = props.components?.Section ?? "div";
      const SectionTitle = props.components?.SectionTitle ?? "div";
      const AddButton = props.components?.AddButton ?? "button";
      const AddButtonText = props.components?.AddButtonText ?? "span";
      const FilterChip = props.components?.FilterChip ?? "button";
      const FilterChipText = props.components?.FilterChipText ?? "span";
      const RemoveButton = props.components?.RemoveButton ?? "button";
      const RemoveButtonText = props.components?.RemoveButtonText ?? "span";
      const Input = props.components?.Input ?? "input";
      const Footer = props.components?.Footer ?? "div";
      const OptionButton = props.components?.OptionButton ?? "button";
      const OptionText = props.components?.OptionText ?? "span";
      const EmptyState = props.components?.EmptyState ?? "div";

      const rootProps: DOMSlotProps = {
        ...(ui?.root ?? {}),
        ...attrs,
        class: mergeClassName(attrs.class, ui?.root?.class),
        style: mergeStyle(
          styles.root,
          mergeStyle(attrs.style as CSSProperties, ui?.root?.style),
        ),
      };

      const toolbarProps: DOMSlotProps = {
        role: "toolbar",
        "aria-label": "Filters",
        ...(ui?.toolbar ?? {}),
        class: mergeClassName(ui?.toolbar?.class),
        style: mergeStyle(styles.toolbar, ui?.toolbar?.style),
      };

      const composerProps: DOMSlotProps = {
        id: composerId,
        role: "dialog",
        "aria-modal": false,
        "aria-label": "Filter composer",
        ...(ui?.composer ?? {}),
        class: mergeClassName(ui?.composer?.class),
        style: mergeStyle(styles.composer, ui?.composer?.style),
      };

      const addButtonProps: DOMSlotProps = {
        type: "button",
        "aria-label": labels.addFilter,
        "aria-controls": composerId,
        "aria-expanded": draft !== null,
        "aria-haspopup": "dialog",
        ...(ui?.addButton ?? {}),
        class: mergeClassName(ui?.addButton?.class),
        style: mergeStyle(styles.button, ui?.addButton?.style),
      };

      const addButtonTextProps: DOMSlotProps = {
        ...(ui?.addButtonText ?? {}),
        class: mergeClassName(ui?.addButtonText?.class),
        style: mergeStyle(styles.buttonText, ui?.addButtonText?.style),
      };

      const searchInputProps: DOMSlotProps = {
        value: controllerState.value.query,
        "aria-label": labels.searchFields,
        placeholder: labels.searchFieldsPlaceholder,
        onInput: (event: Event) =>
          controller.value.setQuery((event.target as HTMLInputElement).value),
        ...(ui?.searchInput ?? {}),
        class: mergeClassName(ui?.searchInput?.class),
        style: mergeStyle(styles.input, ui?.searchInput?.style),
      };

      const footerProps: DOMSlotProps = {
        ...(ui?.footer ?? {}),
        class: mergeClassName(ui?.footer?.class),
        style: mergeStyle(styles.footer, ui?.footer?.style),
      };

      return renderNode(Root as string | Component, rootProps, [
        renderNode(Toolbar as string | Component, toolbarProps, [
          ...controllerState.value.filters.map((filter) => {
            const chipContext: VueFilterChipContext = {
              filter,
              summary: controller.value.getFilterSummary(filter).text,
              remove: () => controller.value.removeFilter(filter.id),
              edit: () => editFilter(filter),
              selected: selectedFilterId === filter.id,
            };

            const chipProps = resolveSlotProps(ui?.filterChip, chipContext);
            const chipTextProps = resolveSlotProps(
              ui?.filterChipText,
              chipContext,
            );
            const removeProps = resolveSlotProps(ui?.removeButton, chipContext);
            const removeTextProps = resolveSlotProps(
              ui?.removeButtonText,
              chipContext,
            );

            const mergedChipProps: DOMSlotProps = {
              type: "button",
              "aria-label": `Edit filter ${chipContext.summary}`,
              "aria-pressed": chipContext.selected,
              ...chipProps,
              onClick: chipContext.edit,
              class: mergeClassName(chipProps?.class),
              style: mergeStyle(styles.chip, chipProps?.style),
            };
            const mergedChipTextProps: DOMSlotProps = {
              ...chipTextProps,
              class: mergeClassName(chipTextProps?.class),
              style: mergeStyle(
                mergeStyle(
                  styles.chipText,
                  chipContext.selected ? undefined : styles.mutedText,
                ) as CSSProperties,
                chipTextProps?.style,
              ),
            };
            const mergedRemoveProps: DOMSlotProps = {
              type: "button",
              "aria-label": `${labels.remove} ${chipContext.summary}`,
              ...removeProps,
              onClick: (event: Event) => {
                event.stopPropagation();
                chipContext.remove();
              },
              class: mergeClassName(removeProps?.class),
              style: mergeStyle(styles.removeButton, removeProps?.style),
            };
            const mergedRemoveTextProps: DOMSlotProps = {
              ...removeTextProps,
              class: mergeClassName(removeTextProps?.class),
              style: removeTextProps?.style,
            };

            if (renderers?.renderFilterChip) {
              return renderers.renderFilterChip({
                item: chipContext,
                props: mergedChipProps,
                textProps: mergedChipTextProps,
                removeProps: mergedRemoveProps,
                removeTextProps: mergedRemoveTextProps,
              });
            }

            return renderNode(
              FilterChip as string | Component,
              { key: filter.id, ...mergedChipProps },
              [
                renderNode(
                  FilterChipText as string | Component,
                  mergedChipTextProps,
                  chipContext.summary,
                ),
                renderNode(
                  RemoveButton as string | Component,
                  mergedRemoveProps,
                  renderNode(
                    RemoveButtonText as string | Component,
                    mergedRemoveTextProps,
                    "×",
                  ),
                ),
              ],
            );
          }),
          renderers?.renderAddButton
            ? renderers.renderAddButton({
                isOpen: draft !== null,
                open: openDraft,
                props: addButtonProps,
                textProps: addButtonTextProps,
                label: labels.addFilter,
              })
            : renderNode(
                AddButton as string | Component,
                {
                  ...addButtonProps,
                  onClick: openDraft,
                },
                renderNode(
                    AddButtonText as string | Component,
                    addButtonTextProps,
                    labels.addFilter,
                  ),
              ),
        ]),
        draft && renderers?.renderDraft
          ? renderers.renderDraft({
              controller: controller.value,
              state: controllerState.value,
              field: selectedField,
              validationReport: draftSnapshot.validationReport,
              validationError,
              commit: commitDraft,
              discard: discardDraft,
            })
          : null,
        draft && !renderers?.renderDraft
          ? renderNode(Composer as string | Component, composerProps, [
              props.showSearchInput
                ? renderNode(
                    Section as string | Component,
                    {
                      ...(ui?.section ?? {}),
                      class: mergeClassName(ui?.section?.class),
                      style: mergeStyle(styles.section, ui?.section?.style),
                    },
                    [
                      renderNode(
                        SectionTitle as string | Component,
                        {
                          ...(ui?.sectionTitle ?? {}),
                          class: mergeClassName(ui?.sectionTitle?.class),
                          style: mergeStyle(
                            styles.sectionTitle,
                            ui?.sectionTitle?.style,
                          ),
                        },
                        labels.searchFields,
                      ),
                      renderNode(Input as string | Component, searchInputProps),
                    ],
                  )
                : null,
              renderNode(
                Section as string | Component,
                {
                  ...(ui?.section ?? {}),
                  class: mergeClassName(ui?.section?.class),
                  style: mergeStyle(styles.section, ui?.section?.style),
                },
                [
                  renderNode(
                    SectionTitle as string | Component,
                    {
                      ...(ui?.sectionTitle ?? {}),
                      class: mergeClassName(ui?.sectionTitle?.class),
                      style: mergeStyle(
                        styles.sectionTitle,
                        ui?.sectionTitle?.style,
                      ),
                    },
                    labels.fieldSection,
                  ),
                  renderNode(
                    "div",
                    { style: styles.selectionWrap },
                    (visibleFields.length > 0
                      ? visibleFields
                      : flattenedFields
                    ).map((field) => {
                      const item: VueFilterOptionContext = {
                        field,
                        selected: draft.field === field.key,
                        select: () => selectField(field),
                      };
                      const optionProps = resolveSlotProps(
                        ui?.fieldOption,
                        item,
                      );
                      const textProps = resolveSlotProps(
                        ui?.fieldOptionText,
                        item,
                      );
                      const mergedOptionProps: DOMSlotProps = {
                        type: "button",
                        "aria-pressed": item.selected,
                        ...optionProps,
                        onClick: item.select,
                        class: mergeClassName(optionProps?.class),
                        style: mergeStyle(
                          mergeStyle(
                            styles.selectionItem,
                            item.selected
                              ? styles.selectionItemActive
                              : undefined,
                          ) as CSSProperties,
                          optionProps?.style,
                        ),
                      };
                      const mergedTextProps: DOMSlotProps = {
                        ...textProps,
                        class: mergeClassName(textProps?.class),
                        style: mergeStyle(
                          styles.selectionItemText,
                          textProps?.style,
                        ),
                      };

                      if (renderers?.renderFieldOption) {
                        return renderers.renderFieldOption({
                          item,
                          props: mergedOptionProps,
                          textProps: mergedTextProps,
                        });
                      }

                      return renderNode(
                        OptionButton as string | Component,
                        { key: field.key, ...mergedOptionProps },
                        renderNode(
                            OptionText as string | Component,
                            mergedTextProps,
                            field.label,
                          ),
                      );
                    }),
                  ),
                  visibleFields.length === 0
                    ? renderNode(
                        EmptyState as string | Component,
                        {
                          ...(ui?.emptyState ?? {}),
                          class: mergeClassName(ui?.emptyState?.class),
                          style: mergeStyle(
                            styles.mutedText,
                            ui?.emptyState?.style,
                          ),
                        },
                        labels.noFields,
                      )
                    : null,
                ],
              ),
              selectedField
                ? renderNode(
                    Section as string | Component,
                    {
                      ...(ui?.section ?? {}),
                      class: mergeClassName(ui?.section?.class),
                      style: mergeStyle(styles.section, ui?.section?.style),
                    },
                    [
                      renderNode(
                        SectionTitle as string | Component,
                        {
                          ...(ui?.sectionTitle ?? {}),
                          class: mergeClassName(ui?.sectionTitle?.class),
                          style: mergeStyle(
                            styles.sectionTitle,
                            ui?.sectionTitle?.style,
                          ),
                        },
                        labels.operatorSection,
                      ),
                      renderNode(
                        "div",
                        { style: styles.selectionWrap },
                        selectedOperators.map((operator) => {
                          const item: VueOperatorOptionContext = {
                            field: selectedField,
                            operator,
                            selected: draft.operator === operator.key,
                            select: () =>
                              controller.value.updateDraft({
                                operator: operator.key,
                              }),
                          };
                          const optionProps = resolveSlotProps(
                            ui?.operatorOption,
                            item,
                          );
                          const textProps = resolveSlotProps(
                            ui?.operatorOptionText,
                            item,
                          );
                          const mergedOptionProps: DOMSlotProps = {
                            type: "button",
                            "aria-pressed": item.selected,
                            ...optionProps,
                            onClick: item.select,
                            class: mergeClassName(optionProps?.class),
                            style: mergeStyle(
                              mergeStyle(
                                styles.selectionItem,
                                item.selected
                                  ? styles.selectionItemActive
                                  : undefined,
                              ) as CSSProperties,
                              optionProps?.style,
                            ),
                          };
                          const mergedTextProps: DOMSlotProps = {
                            ...textProps,
                            class: mergeClassName(textProps?.class),
                            style: mergeStyle(
                              styles.selectionItemText,
                              textProps?.style,
                            ),
                          };

                          if (renderers?.renderOperatorOption) {
                            return renderers.renderOperatorOption({
                              item,
                              props: mergedOptionProps,
                              textProps: mergedTextProps,
                            });
                          }

                          return renderNode(
                            OptionButton as string | Component,
                            { key: operator.key, ...mergedOptionProps },
                            renderNode(
                                OptionText as string | Component,
                                mergedTextProps,
                                operator.label,
                              ),
                          );
                        }),
                      ),
                    ],
                  )
                : null,
              selectedField
                ? renderNode(
                    Section as string | Component,
                    {
                      ...(ui?.section ?? {}),
                      class: mergeClassName(ui?.section?.class),
                      style: mergeStyle(styles.section, ui?.section?.style),
                    },
                    [
                      renderNode(
                        SectionTitle as string | Component,
                        {
                          ...(ui?.sectionTitle ?? {}),
                          class: mergeClassName(ui?.sectionTitle?.class),
                          style: mergeStyle(
                            styles.sectionTitle,
                            ui?.sectionTitle?.style,
                          ),
                        },
                        labels.valueSection,
                      ),
                      (selectedField.type === "text" ||
                        selectedField.type === "custom") &&
                      renderers?.renderValueInput
                        ? renderers.renderValueInput({
                            field: selectedField,
                            value: getFilterTextInputValue(
                              selectedField,
                              draft.values,
                            ),
                            setValue: updateTextValue,
                            props: {
                              "aria-label": `${selectedField.label} ${labels.valueSection}`,
                              ...(ui?.valueInput ?? {}),
                              value: getFilterTextInputValue(
                                selectedField,
                                draft.values,
                              ),
                              onInput: (event: Event) =>
                                updateTextValue(
                                  (event.target as HTMLInputElement).value,
                                ),
                              class: mergeClassName(ui?.valueInput?.class),
                              style: mergeStyle(
                                styles.input,
                                ui?.valueInput?.style,
                              ),
                            },
                          })
                        : null,
                      (selectedField.type === "text" ||
                        selectedField.type === "custom") &&
                      !renderers?.renderValueInput
                        ? renderNode(Input as string | Component, {
                            "aria-label": `${selectedField.label} ${labels.valueSection}`,
                            ...(ui?.valueInput ?? {}),
                            value: getFilterTextInputValue(
                              selectedField,
                              draft.values,
                            ),
                            onInput: (event: Event) =>
                              updateTextValue(
                                (event.target as HTMLInputElement).value,
                              ),
                            class: mergeClassName(ui?.valueInput?.class),
                            style: mergeStyle(
                              styles.input,
                              ui?.valueInput?.style,
                            ),
                          })
                        : null,
                      selectedField.type === "select" ||
                      selectedField.type === "multiselect"
                        ? renderNode("div", { style: styles.selectionWrap }, [
                            ...(selectedField.options ?? []).map((option) => {
                              const item: VueValueOptionContext = {
                                field: selectedField,
                                option,
                                  selected: draft.values.some((value) =>
                                    areFilterValuesEqual(value, option.value),
                                  ),
                                toggle: () => toggleOption(option.value),
                              };
                              const optionProps = resolveSlotProps(
                                ui?.valueOption,
                                item,
                              );
                              const textProps = resolveSlotProps(
                                ui?.valueOptionText,
                                item,
                              );
                              const mergedOptionProps: DOMSlotProps = {
                                type: "button",
                                "aria-pressed": item.selected,
                                ...optionProps,
                                onClick: item.toggle,
                                class: mergeClassName(optionProps?.class),
                                style: mergeStyle(
                                  mergeStyle(
                                    styles.selectionItem,
                                    item.selected
                                      ? styles.selectionItemActive
                                      : undefined,
                                  ) as CSSProperties,
                                  optionProps?.style,
                                ),
                              };
                              const mergedTextProps: DOMSlotProps = {
                                ...textProps,
                                class: mergeClassName(textProps?.class),
                                style: mergeStyle(
                                  styles.selectionItemText,
                                  textProps?.style,
                                ),
                              };

                              if (renderers?.renderValueOption) {
                                return renderers.renderValueOption({
                                  item,
                                  props: mergedOptionProps,
                                  textProps: mergedTextProps,
                                });
                              }

                              return renderNode(
                                OptionButton as string | Component,
                                { key: option.label, ...mergedOptionProps },
                                renderNode(
                                    OptionText as string | Component,
                                    mergedTextProps,
                                    option.label,
                                  ),
                              );
                            }),
                            (selectedField.options ?? []).length === 0
                              ? renderNode(
                                  EmptyState as string | Component,
                                  {
                                    ...(ui?.emptyState ?? {}),
                                    class: mergeClassName(
                                      ui?.emptyState?.class,
                                    ),
                                    style: mergeStyle(
                                      styles.mutedText,
                                      ui?.emptyState?.style,
                                    ),
                                  },
                                  labels.noOptions,
                                )
                              : null,
                          ])
                        : null,
                    ],
                  )
                : null,
              validationError
                ? renderNode(
                    EmptyState as string | Component,
                    {
                      role: "alert",
                      "aria-live": "assertive",
                      ...(ui?.emptyState ?? {}),
                      class: mergeClassName(ui?.emptyState?.class),
                      style: mergeStyle(
                        { color: "#b91c1c", fontSize: "13px" },
                        ui?.emptyState?.style,
                      ),
                    },
                    validationError,
                  )
                : null,
              renderNode(Footer as string | Component, footerProps, [
                renderNode(
                  AddButton as string | Component,
                  {
                    type: "button",
                    ...(ui?.cancelButton ?? {}),
                    onClick: discardDraft,
                    class: mergeClassName(ui?.cancelButton?.class),
                    style: mergeStyle(styles.button, ui?.cancelButton?.style),
                  },
                  renderNode(
                      AddButtonText as string | Component,
                      {
                        ...(ui?.cancelButtonText ?? {}),
                        class: mergeClassName(ui?.cancelButtonText?.class),
                        style: mergeStyle(
                          styles.buttonText,
                          ui?.cancelButtonText?.style,
                        ),
                      },
                      labels.cancel,
                    ),
                ),
                renderNode(
                  AddButton as string | Component,
                  {
                    type: "button",
                    ...(ui?.applyButton ?? {}),
                    onClick: commitDraft,
                    class: mergeClassName(ui?.applyButton?.class),
                    style: mergeStyle(styles.button, ui?.applyButton?.style),
                  },
                  renderNode(
                      AddButtonText as string | Component,
                      {
                        ...(ui?.applyButtonText ?? {}),
                        class: mergeClassName(ui?.applyButtonText?.class),
                        style: mergeStyle(
                          styles.buttonText,
                          ui?.applyButtonText?.style,
                        ),
                      },
                      labels.apply,
                    ),
                ),
              ]),
            ])
          : null,
      ]);
    };
  },
});

export default VueFilters;
