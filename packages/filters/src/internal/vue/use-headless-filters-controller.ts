import { onBeforeUnmount, ref, shallowRef, watch } from "vue";
import type { Ref, ShallowRef } from "vue";

import { createHeadlessFiltersController } from "../../core/controller";
import type {
  Filter,
  FilterFieldDefinition,
  FilterOperatorDefinition,
  HeadlessFiltersController,
  HeadlessFiltersState,
} from "../../core/types";
import { getFilterSignature } from "../adapter-utils";

export interface UseVueHeadlessFiltersControllerOptions<
  TRecord = unknown,
  TValue = unknown,
> {
  fields: FilterFieldDefinition<TRecord, TValue>[];
  filters?: Filter<TValue>[];
  modelValue?: Filter<TValue>[];
  defaultFilters?: Filter<TValue>[];
  allowMultiple?: boolean;
  operatorRegistry?: Record<string, FilterOperatorDefinition<TValue>>;
  createId?: () => string;
  onChange?: (filters: Filter<TValue>[]) => void;
}

export function useVueHeadlessFiltersController<
  TRecord = unknown,
  TValue = unknown,
>(
  getOptions: () => UseVueHeadlessFiltersControllerOptions<TRecord, TValue>,
): {
  controller: ShallowRef<HeadlessFiltersController<TRecord, TValue>>;
  controllerState: Ref<HeadlessFiltersState<TValue>>;
} {
  const initialOptions = getOptions();
  const latestFilters = shallowRef<Filter<TValue>[]>(
    initialOptions.filters ??
      initialOptions.modelValue ??
      initialOptions.defaultFilters ??
      [],
  );
  const controlledFilters = shallowRef<Filter<TValue>[] | undefined>(
    initialOptions.filters ?? initialOptions.modelValue,
  );
  const controller = shallowRef(
    createHeadlessFiltersController<TRecord, TValue>({
      fields: initialOptions.fields,
      filters: latestFilters.value,
      allowMultiple: initialOptions.allowMultiple,
      operatorRegistry: initialOptions.operatorRegistry,
      createId: initialOptions.createId,
    }),
  );
  const controllerState = shallowRef(controller.value.getState());
  const syncingExternalFilters = ref(false);
  let unsubscribe: (() => void) | undefined;

  function bindController(nextController: HeadlessFiltersController<TRecord, TValue>) {
    unsubscribe?.();
    controller.value = nextController;
    controllerState.value = nextController.getState();
    unsubscribe = nextController.subscribe((nextState: HeadlessFiltersState<TValue>) => {
      controllerState.value = nextState;
      latestFilters.value = nextState.filters;

      if (syncingExternalFilters.value) {
        return;
      }

      getOptions().onChange?.(nextState.filters);
    });
  }

  function recreateController(nextFilters: Filter<TValue>[]): void {
    const options = getOptions();
    bindController(
      createHeadlessFiltersController<TRecord, TValue>({
        fields: options.fields,
        filters: nextFilters,
        allowMultiple: options.allowMultiple,
        operatorRegistry: options.operatorRegistry,
        createId: options.createId,
      }),
    );
  }

  bindController(controller.value);

  watch(
    () => {
      const options = getOptions();
      return [options.filters, options.modelValue];
    },
    () => {
      const options = getOptions();
      controlledFilters.value = options.filters ?? options.modelValue;
      if (!controlledFilters.value) {
        return;
      }

      const nextSignature = getFilterSignature(controlledFilters.value);
      const currentSignature = getFilterSignature(controller.value.getState().filters);
      if (nextSignature === currentSignature) {
        return;
      }

      syncingExternalFilters.value = true;
      controller.value.setFilters(controlledFilters.value);
      syncingExternalFilters.value = false;
    },
    { deep: true },
  );

  watch(
    () => {
      const options = getOptions();
      return [
        options.fields,
        options.allowMultiple,
        options.operatorRegistry,
        options.createId,
        options.filters,
        options.modelValue,
      ];
    },
    () => {
      recreateController(controlledFilters.value ?? latestFilters.value);
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    unsubscribe?.();
  });

  return {
    controller,
    controllerState,
  };
}
