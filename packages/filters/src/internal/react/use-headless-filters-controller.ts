import { useEffect, useRef, useState } from "react";

import { createHeadlessFiltersController } from "../../core/controller";
import type {
  Filter,
  FilterFieldDefinition,
  FilterOperatorDefinition,
  HeadlessFiltersController,
  HeadlessFiltersState,
} from "../../core/types";
import { getFilterSignature } from "../adapter-utils";

export interface UseHeadlessFiltersControllerOptions<
  TRecord = unknown,
  TValue = unknown,
> {
  fields: FilterFieldDefinition<TRecord, TValue>[];
  filters?: Filter<TValue>[];
  defaultFilters?: Filter<TValue>[];
  allowMultiple?: boolean;
  operatorRegistry?: Record<string, FilterOperatorDefinition<TValue>>;
  createId?: () => string;
  onChange?: (filters: Filter<TValue>[]) => void;
}

export function useHeadlessFiltersController<TRecord = unknown, TValue = unknown>(
  options: UseHeadlessFiltersControllerOptions<TRecord, TValue>,
): {
  controller: HeadlessFiltersController<TRecord, TValue>;
  controllerState: HeadlessFiltersState<TValue>;
} {
  const {
    fields,
    filters,
    defaultFilters,
    allowMultiple,
    operatorRegistry,
    createId,
    onChange,
  } = options;

  const isControlled = filters !== undefined;
  const latestOnChange = useRef(onChange);
  const syncingExternalFilters = useRef(false);

  latestOnChange.current = onChange;

  const [controller, setController] = useState(() =>
    createHeadlessFiltersController<TRecord, TValue>({
      fields,
      filters: filters ?? defaultFilters ?? [],
      allowMultiple,
      operatorRegistry,
      createId,
    }),
  );
  const [controllerState, setControllerState] = useState(() =>
    controller.getState(),
  );

  const externalFiltersSignature = getFilterSignature(filters ?? []);

  useEffect(() => {
    const nextController = createHeadlessFiltersController<TRecord, TValue>({
      fields,
      filters: isControlled ? (filters ?? []) : controller.getState().filters,
      allowMultiple,
      operatorRegistry,
      createId,
    });
    setController(nextController);
    setControllerState(nextController.getState());
  }, [
    allowMultiple,
    createId,
    externalFiltersSignature,
    fields,
    isControlled,
    operatorRegistry,
  ]);

  useEffect(() => {
    return controller.subscribe((nextState: HeadlessFiltersState<TValue>) => {
      setControllerState(nextState);

      if (syncingExternalFilters.current) {
        return;
      }

      latestOnChange.current?.(nextState.filters);
    });
  }, [controller]);

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    const currentSignature = getFilterSignature(controller.getState().filters);
    if (currentSignature === externalFiltersSignature) {
      return;
    }

    syncingExternalFilters.current = true;
    controller.setFilters(filters ?? []);
    syncingExternalFilters.current = false;
  }, [controller, externalFiltersSignature, filters, isControlled]);

  return {
    controller,
    controllerState,
  };
}
