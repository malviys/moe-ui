import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";

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

type ClassNameProp = {
  className?: string;
};

type ViewSlotProps = ViewProps & ClassNameProp;
type TextSlotProps = TextProps & ClassNameProp;
type PressableSlotProps = PressableProps & ClassNameProp;
type TextInputSlotProps = TextInputProps & ClassNameProp;
type ScrollViewSlotProps = ScrollViewProps & ClassNameProp;

type SlotFactory<TProps, TContext> = TProps | ((context: TContext) => TProps);

type RNViewComponent = React.ComponentType<ViewSlotProps>;
type RNTextComponent = React.ComponentType<TextSlotProps>;
type RNPressableComponent = React.ComponentType<PressableSlotProps>;
type RNTextInputComponent = React.ComponentType<TextInputSlotProps>;
type RNScrollViewComponent = React.ComponentType<ScrollViewSlotProps>;

const RNView = View as unknown as RNViewComponent;
const RNText = Text as unknown as RNTextComponent;
const RNPressable = Pressable as unknown as RNPressableComponent;
const RNTextInput = TextInput as unknown as RNTextInputComponent;
const RNScrollView = ScrollView as unknown as RNScrollViewComponent;

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filtersRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D4D4D8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: "#18181B",
    fontSize: 14,
  },
  mutedText: {
    color: "#71717A",
  },
  removeText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  button: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D4D4D8",
    backgroundColor: "#F4F4F5",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonText: {
    color: "#18181B",
    fontSize: 14,
    fontWeight: "600",
  },
  composer: {
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "#3F3F46",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D4D4D8",
    backgroundColor: "#FAFAFA",
    color: "#18181B",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectionItem: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D4D4D8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectionItemActive: {
    borderColor: "#18181B",
    backgroundColor: "#18181B",
  },
  selectionItemText: {
    color: "#18181B",
    fontSize: 14,
  },
  selectionItemTextActive: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});

function resolveSlotProps<TProps, TContext>(
  factory: SlotFactory<TProps, TContext> | undefined,
  context: TContext,
): TProps | undefined {
  if (typeof factory === "function") {
    return (factory as (context: TContext) => TProps)(context);
  }

  return factory;
}

function mergeStyle(
  base: StyleProp<any>,
  extra?: StyleProp<any>,
): StyleProp<any> {
  if (!extra) {
    return base;
  }

  return [base, extra];
}

export interface ReactNativeFilterChipContext<TValue = unknown> {
  filter: Filter<TValue>;
  summary: string;
  remove: () => void;
  edit: () => void;
  selected: boolean;
}

export interface ReactNativeFilterOptionContext<
  TRecord = unknown,
  TValue = unknown,
> {
  field: FilterFieldConfig<TRecord, TValue>;
  selected: boolean;
  select: () => void;
}

export interface ReactNativeOperatorOptionContext<
  TRecord = unknown,
  TValue = unknown,
> {
  field: FilterFieldConfig<TRecord, TValue>;
  operator: FilterOperatorDefinition<TValue>;
  selected: boolean;
  select: () => void;
}

export interface ReactNativeValueOptionContext<
  TRecord = unknown,
  TValue = unknown,
> {
  field: FilterFieldConfig<TRecord, TValue>;
  option: { value: TValue; label: string };
  selected: boolean;
  toggle: () => void;
}

export interface ReactNativeDraftContext<TRecord = unknown, TValue = unknown> {
  controller: HeadlessFiltersController<TRecord, TValue>;
  state: HeadlessFiltersState<TValue>;
  field?: FilterFieldConfig<TRecord, TValue>;
  validationReport: FilterValidationReport<TValue> | null;
  validationError: string | null;
  commit: () => void;
  discard: () => void;
}

export interface ReactNativeFiltersLabels {
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

export interface ReactNativeFiltersSlots<TRecord = unknown, TValue = unknown> {
  root?: ViewSlotProps;
  toolbar?: ScrollViewSlotProps;
  composer?: ViewSlotProps;
  searchInput?: TextInputSlotProps;
  footer?: ViewSlotProps;
  emptyState?: TextSlotProps;
  filterChip?: SlotFactory<
    PressableSlotProps,
    ReactNativeFilterChipContext<TValue>
  >;
  filterChipText?: SlotFactory<
    TextSlotProps,
    ReactNativeFilterChipContext<TValue>
  >;
  removeButton?: SlotFactory<
    PressableSlotProps,
    ReactNativeFilterChipContext<TValue>
  >;
  removeButtonText?: SlotFactory<
    TextSlotProps,
    ReactNativeFilterChipContext<TValue>
  >;
  addButton?: PressableSlotProps;
  addButtonText?: TextSlotProps;
  section?: ViewSlotProps;
  sectionTitle?: TextSlotProps;
  fieldOption?: SlotFactory<
    PressableSlotProps,
    ReactNativeFilterOptionContext<TRecord, TValue>
  >;
  fieldOptionText?: SlotFactory<
    TextSlotProps,
    ReactNativeFilterOptionContext<TRecord, TValue>
  >;
  operatorOption?: SlotFactory<
    PressableSlotProps,
    ReactNativeOperatorOptionContext<TRecord, TValue>
  >;
  operatorOptionText?: SlotFactory<
    TextSlotProps,
    ReactNativeOperatorOptionContext<TRecord, TValue>
  >;
  valueInput?: TextInputSlotProps;
  valueOption?: SlotFactory<
    PressableSlotProps,
    ReactNativeValueOptionContext<TRecord, TValue>
  >;
  valueOptionText?: SlotFactory<
    TextSlotProps,
    ReactNativeValueOptionContext<TRecord, TValue>
  >;
  applyButton?: PressableSlotProps;
  applyButtonText?: TextSlotProps;
  cancelButton?: PressableSlotProps;
  cancelButtonText?: TextSlotProps;
}

export interface ReactNativeFiltersRenderers<
  TRecord = unknown,
  TValue = unknown,
> {
  renderAddButton?: (context: {
    isOpen: boolean;
    open: () => void;
    props: PressableSlotProps;
    textProps: TextSlotProps;
    label: string;
  }) => React.ReactNode;
  renderFilterChip?: (context: {
    item: ReactNativeFilterChipContext<TValue>;
    props: PressableSlotProps;
    textProps: TextSlotProps;
    removeProps: PressableSlotProps;
    removeTextProps: TextSlotProps;
  }) => React.ReactNode;
  renderDraft?: (
    context: ReactNativeDraftContext<TRecord, TValue>,
  ) => React.ReactNode;
  renderFieldOption?: (context: {
    item: ReactNativeFilterOptionContext<TRecord, TValue>;
    props: PressableSlotProps;
    textProps: TextSlotProps;
  }) => React.ReactNode;
  renderOperatorOption?: (context: {
    item: ReactNativeOperatorOptionContext<TRecord, TValue>;
    props: PressableSlotProps;
    textProps: TextSlotProps;
  }) => React.ReactNode;
  renderValueInput?: (context: {
    field: FilterFieldConfig<TRecord, TValue>;
    value: string;
    setValue: (value: string) => void;
    props: TextInputSlotProps;
  }) => React.ReactNode;
  renderValueOption?: (context: {
    item: ReactNativeValueOptionContext<TRecord, TValue>;
    props: PressableSlotProps;
    textProps: TextSlotProps;
  }) => React.ReactNode;
}

export interface ReactNativeFiltersProps<TRecord = unknown, TValue = unknown> {
  fields: FilterFieldDefinition<TRecord, TValue>[];
  filters?: Filter<TValue>[];
  defaultFilters?: Filter<TValue>[];
  onFiltersChange?: (filters: Filter<TValue>[]) => void;
  allowMultiple?: boolean;
  operatorRegistry?: Record<string, FilterOperatorDefinition<TValue>>;
  createId?: () => string;
  showSearchInput?: boolean;
  labels?: Partial<ReactNativeFiltersLabels>;
  slots?: ReactNativeFiltersSlots<TRecord, TValue>;
  renderers?: ReactNativeFiltersRenderers<TRecord, TValue>;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const defaultLabels: ReactNativeFiltersLabels = {
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

export function ReactNativeFilters<TRecord = unknown, TValue = unknown>(
  props: ReactNativeFiltersProps<TRecord, TValue>,
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

  const flattenedFields = flattenFilterFields(fields);
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

  const rootProps: ViewSlotProps = {
    ...(slots?.root ?? {}),
    className: slots?.root?.className ?? className,
    style: mergeStyle(mergeStyle(styles.root, style), slots?.root?.style),
  };

  const toolbarProps: ScrollViewSlotProps = {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    ...(slots?.toolbar ?? {}),
    contentContainerStyle: mergeStyle(
      styles.filtersRowContent,
      slots?.toolbar?.contentContainerStyle as StyleProp<ViewStyle>,
    ),
    style: mergeStyle(
      styles.toolbar,
      slots?.toolbar?.style as StyleProp<ViewStyle>,
    ),
  };

  const composerProps: ViewSlotProps = {
    accessibilityLabel: "Filter composer",
    ...(slots?.composer ?? {}),
    style: mergeStyle(styles.composer, slots?.composer?.style),
  };

  const addButtonProps: PressableSlotProps = {
    accessibilityLabel: labels.addFilter,
    accessibilityRole: "button",
    accessibilityState: { expanded: draft !== null },
    ...(slots?.addButton ?? {}),
    style: mergeStyle(
      styles.button,
      slots?.addButton?.style as StyleProp<ViewStyle>,
    ),
  };

  const addButtonTextProps: TextSlotProps = {
    ...(slots?.addButtonText ?? {}),
    style: mergeStyle(
      styles.buttonText,
      slots?.addButtonText?.style as StyleProp<TextStyle>,
    ),
  };

  const searchInputProps: TextInputSlotProps = {
    accessibilityLabel: labels.searchFields,
    placeholder: labels.searchFieldsPlaceholder,
    value: controllerState.query,
    onChangeText: (value) => controller.setQuery(value),
    ...(slots?.searchInput ?? {}),
    style: mergeStyle(
      styles.input,
      slots?.searchInput?.style as StyleProp<TextStyle>,
    ),
  };

  const footerProps: ViewSlotProps = {
    ...(slots?.footer ?? {}),
    style: mergeStyle(styles.footer, slots?.footer?.style),
  };

  return (
    <RNView {...rootProps}>
      <RNScrollView {...toolbarProps}>
        {controllerState.filters.map((filter) => {
          const chipContext: ReactNativeFilterChipContext<TValue> = {
            filter,
            summary: controller.getFilterSummary(filter).text,
            remove: () => controller.removeFilter(filter.id),
            edit: () => draftActions.editFilter(filter),
            selected: selectedFilterId === filter.id,
          };

          const chipProps: PressableSlotProps = {
            accessibilityLabel: `Edit filter ${chipContext.summary}`,
            accessibilityRole: "button",
            accessibilityState: { selected: chipContext.selected },
            ...resolveSlotProps(slots?.filterChip, chipContext),
            onPress: chipContext.edit,
            style: mergeStyle(
              styles.chip,
              resolveSlotProps(slots?.filterChip, chipContext)
                ?.style as StyleProp<ViewStyle>,
            ),
          };
          const chipTextProps: TextSlotProps = {
            ...resolveSlotProps(slots?.filterChipText, chipContext),
            style: mergeStyle(
              mergeStyle(
                styles.chipText,
                chipContext.selected ? undefined : styles.mutedText,
              ),
              resolveSlotProps(slots?.filterChipText, chipContext)
                ?.style as StyleProp<TextStyle>,
            ),
          };
          const removeButtonProps: PressableSlotProps = {
            hitSlop: 6,
            accessibilityLabel: `${labels.remove} ${chipContext.summary}`,
            accessibilityRole: "button",
            ...resolveSlotProps(slots?.removeButton, chipContext),
            onPress: chipContext.remove,
          };
          const removeTextProps: TextSlotProps = {
            ...resolveSlotProps(slots?.removeButtonText, chipContext),
            style: mergeStyle(
              styles.removeText,
              resolveSlotProps(slots?.removeButtonText, chipContext)
                ?.style as StyleProp<TextStyle>,
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
                  removeTextProps: removeTextProps,
                })}
              </React.Fragment>
            );
          }

          return (
            <RNPressable key={filter.id} {...chipProps}>
              <RNText {...chipTextProps}>{chipContext.summary}</RNText>
              <RNPressable {...removeButtonProps}>
                <RNText {...removeTextProps}>×</RNText>
              </RNPressable>
            </RNPressable>
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
            <RNPressable {...addButtonProps} onPress={draftActions.openDraft}>
            <RNText {...addButtonTextProps}>{labels.addFilter}</RNText>
          </RNPressable>
        )}
      </RNScrollView>

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
        <RNView {...composerProps}>
          {showSearchInput && (
            <RNView
              {...(slots?.section ?? {})}
              style={mergeStyle(styles.section, slots?.section?.style)}
            >
              <RNText
                {...(slots?.sectionTitle ?? {})}
                style={mergeStyle(
                  styles.sectionTitle,
                  slots?.sectionTitle?.style as StyleProp<TextStyle>,
                )}
              >
                {labels.searchFields}
              </RNText>
              <RNTextInput {...searchInputProps} />
            </RNView>
          )}

          <RNView
            {...(slots?.section ?? {})}
            style={mergeStyle(styles.section, slots?.section?.style)}
          >
            <RNText
              {...(slots?.sectionTitle ?? {})}
              style={mergeStyle(
                styles.sectionTitle,
                slots?.sectionTitle?.style as StyleProp<TextStyle>,
              )}
            >
              {labels.fieldSection}
            </RNText>

            <RNView style={styles.selectionWrap}>
              {(visibleFields.length > 0 ? visibleFields : flattenedFields).map(
                (field) => {
                  const item: ReactNativeFilterOptionContext<TRecord, TValue> =
                    {
                  field,
                  selected: draft.field === field.key,
                  select: () => draftActions.selectField(field),
                    };
                  const optionProps: PressableSlotProps = {
                    accessibilityLabel: field.label,
                    accessibilityRole: "button",
                    accessibilityState: { selected: item.selected },
                    ...resolveSlotProps(slots?.fieldOption, item),
                    onPress: item.select,
                    style: mergeStyle(
                      mergeStyle(
                        styles.selectionItem,
                        item.selected ? styles.selectionItemActive : undefined,
                      ),
                      resolveSlotProps(slots?.fieldOption, item)
                        ?.style as StyleProp<ViewStyle>,
                    ),
                  };
                  const textProps: TextSlotProps = {
                    ...resolveSlotProps(slots?.fieldOptionText, item),
                    style: mergeStyle(
                      mergeStyle(
                        styles.selectionItemText,
                        item.selected
                          ? styles.selectionItemTextActive
                          : undefined,
                      ),
                      resolveSlotProps(slots?.fieldOptionText, item)
                        ?.style as StyleProp<TextStyle>,
                    ),
                  };

                  if (renderers?.renderFieldOption) {
                    return (
                      <React.Fragment key={field.key}>
                        {renderers.renderFieldOption({
                          item,
                          props: optionProps,
                          textProps,
                        })}
                      </React.Fragment>
                    );
                  }

                  return (
                    <RNPressable key={field.key} {...optionProps}>
                      <RNText {...textProps}>{field.label}</RNText>
                    </RNPressable>
                  );
                },
              )}
            </RNView>

            {visibleFields.length === 0 && (
              <RNText
                {...(slots?.emptyState ?? {})}
                style={mergeStyle(
                  styles.mutedText,
                  slots?.emptyState?.style as StyleProp<TextStyle>,
                )}
              >
                {labels.noFields}
              </RNText>
            )}
          </RNView>

          {selectedField && (
            <RNView
              {...(slots?.section ?? {})}
              style={mergeStyle(styles.section, slots?.section?.style)}
            >
              <RNText
                {...(slots?.sectionTitle ?? {})}
                style={mergeStyle(
                  styles.sectionTitle,
                  slots?.sectionTitle?.style as StyleProp<TextStyle>,
                )}
              >
                {labels.operatorSection}
              </RNText>
              <RNView style={styles.selectionWrap}>
                {selectedOperators.map((operator) => {
                  const item: ReactNativeOperatorOptionContext<
                    TRecord,
                    TValue
                  > = {
                    field: selectedField,
                    operator,
                    selected: draft.operator === operator.key,
                    select: () =>
                      controller.updateDraft({ operator: operator.key }),
                  };
                  const optionProps: PressableSlotProps = {
                    accessibilityLabel: operator.label,
                    accessibilityRole: "button",
                    accessibilityState: { selected: item.selected },
                    ...resolveSlotProps(slots?.operatorOption, item),
                    onPress: item.select,
                    style: mergeStyle(
                      mergeStyle(
                        styles.selectionItem,
                        item.selected ? styles.selectionItemActive : undefined,
                      ),
                      resolveSlotProps(slots?.operatorOption, item)
                        ?.style as StyleProp<ViewStyle>,
                    ),
                  };
                  const textProps: TextSlotProps = {
                    ...resolveSlotProps(slots?.operatorOptionText, item),
                    style: mergeStyle(
                      mergeStyle(
                        styles.selectionItemText,
                        item.selected
                          ? styles.selectionItemTextActive
                          : undefined,
                      ),
                      resolveSlotProps(slots?.operatorOptionText, item)
                        ?.style as StyleProp<TextStyle>,
                    ),
                  };

                  if (renderers?.renderOperatorOption) {
                    return (
                      <React.Fragment key={operator.key}>
                        {renderers.renderOperatorOption({
                          item,
                          props: optionProps,
                          textProps,
                        })}
                      </React.Fragment>
                    );
                  }

                  return (
                    <RNPressable key={operator.key} {...optionProps}>
                      <RNText {...textProps}>{operator.label}</RNText>
                    </RNPressable>
                  );
                })}
              </RNView>
            </RNView>
          )}

          {selectedField && (
            <RNView
              {...(slots?.section ?? {})}
              style={mergeStyle(styles.section, slots?.section?.style)}
            >
              <RNText
                {...(slots?.sectionTitle ?? {})}
                style={mergeStyle(
                  styles.sectionTitle,
                  slots?.sectionTitle?.style as StyleProp<TextStyle>,
                )}
              >
                {labels.valueSection}
              </RNText>

              {(selectedField.type === "text" ||
                selectedField.type === "custom") &&
                (renderers?.renderValueInput ? (
                  renderers.renderValueInput({
                      field: selectedField,
                      value: getFilterTextInputValue(selectedField, draft.values),
                      setValue: draftActions.updateTextValue,
                      props: {
                        accessibilityLabel: `${selectedField.label} ${labels.valueSection}`,
                        ...(slots?.valueInput ?? {}),
                        value: getFilterTextInputValue(selectedField, draft.values),
                        onChangeText: draftActions.updateTextValue,
                      style: mergeStyle(
                        styles.input,
                        slots?.valueInput?.style as StyleProp<TextStyle>,
                      ),
                    },
                  })
                ) : (
                  <RNTextInput
                      accessibilityLabel={`${selectedField.label} ${labels.valueSection}`}
                      {...(slots?.valueInput ?? {})}
                      value={getFilterTextInputValue(selectedField, draft.values)}
                      onChangeText={draftActions.updateTextValue}
                    style={mergeStyle(
                      styles.input,
                      slots?.valueInput?.style as StyleProp<TextStyle>,
                    )}
                  />
                ))}

              {(selectedField.type === "select" ||
                selectedField.type === "multiselect") && (
                <RNView style={styles.selectionWrap}>
                  {(selectedField.options ?? []).map((option) => {
                    const item: ReactNativeValueOptionContext<TRecord, TValue> =
                      {
                        field: selectedField,
                      option,
                      selected: draft.values.some((value) =>
                        areFilterValuesEqual(value, option.value),
                      ),
                      toggle: () => draftActions.toggleOption(option.value),
                    };
                    const optionProps: PressableSlotProps = {
                      accessibilityLabel: option.label,
                      accessibilityRole: "button",
                      accessibilityState: { selected: item.selected },
                      ...resolveSlotProps(slots?.valueOption, item),
                      onPress: item.toggle,
                      style: mergeStyle(
                        mergeStyle(
                          styles.selectionItem,
                          item.selected
                            ? styles.selectionItemActive
                            : undefined,
                        ),
                        resolveSlotProps(slots?.valueOption, item)
                          ?.style as StyleProp<ViewStyle>,
                      ),
                    };
                    const textProps: TextSlotProps = {
                      ...resolveSlotProps(slots?.valueOptionText, item),
                      style: mergeStyle(
                        mergeStyle(
                          styles.selectionItemText,
                          item.selected
                            ? styles.selectionItemTextActive
                            : undefined,
                        ),
                        resolveSlotProps(slots?.valueOptionText, item)
                          ?.style as StyleProp<TextStyle>,
                      ),
                    };

                    if (renderers?.renderValueOption) {
                      return (
                        <React.Fragment key={option.label}>
                          {renderers.renderValueOption({
                            item,
                            props: optionProps,
                            textProps,
                          })}
                        </React.Fragment>
                      );
                    }

                    return (
                      <RNPressable key={option.label} {...optionProps}>
                        <RNText {...textProps}>{option.label}</RNText>
                      </RNPressable>
                    );
                  })}

                  {(selectedField.options ?? []).length === 0 && (
                    <RNText
                      {...(slots?.emptyState ?? {})}
                      style={mergeStyle(
                        styles.mutedText,
                        slots?.emptyState?.style as StyleProp<TextStyle>,
                      )}
                    >
                      {labels.noOptions}
                    </RNText>
                  )}
                </RNView>
              )}
            </RNView>
          )}

          {validationError && (
            <RNText
              accessibilityRole="alert"
              {...(slots?.emptyState ?? {})}
              style={mergeStyle(
                { color: "#b91c1c", fontSize: 13 },
                slots?.emptyState?.style as StyleProp<TextStyle>,
              )}
            >
              {validationError}
            </RNText>
          )}

          <RNView {...footerProps}>
            <RNPressable
              {...(slots?.cancelButton ?? {})}
              onPress={draftActions.discardDraft}
              style={mergeStyle(
                styles.button,
                slots?.cancelButton?.style as StyleProp<ViewStyle>,
              )}
            >
              <RNText
                {...(slots?.cancelButtonText ?? {})}
                style={mergeStyle(
                  styles.buttonText,
                  slots?.cancelButtonText?.style as StyleProp<TextStyle>,
                )}
              >
                {labels.cancel}
              </RNText>
            </RNPressable>
            <RNPressable
              {...(slots?.applyButton ?? {})}
              onPress={() => {
                draftActions.commitDraft();
              }}
              style={mergeStyle(
                styles.button,
                slots?.applyButton?.style as StyleProp<ViewStyle>,
              )}
            >
              <RNText
                {...(slots?.applyButtonText ?? {})}
                style={mergeStyle(
                  styles.buttonText,
                  slots?.applyButtonText?.style as StyleProp<TextStyle>,
                )}
              >
                {labels.apply}
              </RNText>
            </RNPressable>
          </RNView>
        </RNView>
      )}
    </RNView>
  );
}

export default ReactNativeFilters;
