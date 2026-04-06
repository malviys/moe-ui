import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick, ref } from "vue";

import VueFilters from "../../src/vue/filters";
import { useVueHeadlessFiltersController } from "../../src/internal/vue/use-headless-filters-controller";
import type { Filter, FilterFieldDefinition } from "../../src/core/types";

type Task = { title: string; status: string; tags: string[] };

const fields: FilterFieldDefinition<Task, string>[] = [
  {
    key: "title",
    label: "Title",
    type: "text",
    accessor: (record) => record.title,
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "todo", label: "Todo" },
      { value: "done", label: "Done" },
    ],
    accessor: "status",
  },
  {
    key: "tags",
    label: "Tags",
    type: "multiselect",
    options: [
      { value: "urgent", label: "Urgent" },
      { value: "bug", label: "Bug" },
    ],
    accessor: (record) => record.tags,
  },
];

let idCounter = 0;
const createId = () => `id-${++idCounter}`;

function mountFilters(props: Record<string, unknown> = {}) {
  idCounter = 0;
  return mount(VueFilters as any, {
    props: { fields, createId, ...props },
  });
}

describe("VueFilters – rendering", () => {
  it("renders the Add filter button and hides the composer initially", () => {
    const wrapper = mountFilters();

    expect(wrapper.text()).toContain("Add filter");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("opens the composer and renders field options", async () => {
    const wrapper = mountFilters();

    await wrapper.get("button").trigger("click");
    await nextTick();

    expect(wrapper.get('[role="dialog"]').attributes("aria-label")).toBe(
      "Filter composer",
    );
    expect(wrapper.text()).toContain("Field");
    expect(wrapper.text()).toContain("Title");
    expect(wrapper.text()).toContain("Status");
    expect(wrapper.text()).toContain("Tags");
  });
});

describe("VueFilters – filter flows", () => {
  it("adds a text filter and emits update:modelValue", async () => {
    const wrapper = mountFilters();

    await wrapper.get('button[aria-label="Add filter"]').trigger("click");
    await nextTick();

    const titleButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Title");
    expect(titleButton).toBeTruthy();
    await titleButton!.trigger("click");
    await nextTick();

    const inputs = wrapper.findAll('input[type="text"], input:not([type])');
    const valueInput = inputs[inputs.length - 1]!;
    await valueInput.setValue("My task");
    await nextTick();

    const applyButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Apply");
    expect(applyButton).toBeTruthy();
    await applyButton!.trigger("click");
    await nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    const payload = emitted![emitted!.length - 1]![0] as Filter<string>[];
    expect(payload).toHaveLength(1);
    expect(payload[0]!.field).toBe("title");
    expect(payload[0]!.values).toEqual(["My task"]);
  });

  it("adds a select filter", async () => {
    const wrapper = mountFilters();

    await wrapper.get('button[aria-label="Add filter"]').trigger("click");
    await nextTick();

    const statusButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Status");
    await statusButton!.trigger("click");
    await nextTick();

    const todoButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Todo");
    await todoButton!.trigger("click");
    await nextTick();

    const applyButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Apply");
    await applyButton!.trigger("click");
    await nextTick();

    const payload = wrapper.emitted("update:modelValue")!.at(-1)![0] as Filter<
      string
    >[];
    expect(payload[0]!.field).toBe("status");
    expect(payload[0]!.values).toEqual(["todo"]);
  });

  it("removes a filter via the remove button", async () => {
    const wrapper = mountFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
    });

    const removeButton = wrapper.get(
      'button[aria-label="Remove Status is Todo"]',
    );
    await removeButton.trigger("click");
    await nextTick();

    const payload = wrapper.emitted("update:modelValue")!.at(-1)![0] as Filter<
      string
    >[];
    expect(payload).toEqual([]);
  });

  it("reacts to external modelValue updates", async () => {
    const wrapper = mountFilters({
      modelValue: [] as Filter<string>[],
    });

    await wrapper.setProps({
      modelValue: [
        { id: "f1", field: "status", operator: "is", values: ["done"] },
      ],
    });
    await nextTick();

    expect(wrapper.text()).toContain("Status");
    expect(wrapper.text()).toContain("Done");
  });
});

describe("VueFilters – accessibility", () => {
  it("exposes add-button expanded state and composer semantics", async () => {
    const wrapper = mountFilters();
    const addButton = wrapper.get('button[aria-label="Add filter"]');

    expect(addButton.attributes("aria-haspopup")).toBe("dialog");
    expect(addButton.attributes("aria-expanded")).toBe("false");

    await addButton.trigger("click");
    await nextTick();

    expect(addButton.attributes("aria-expanded")).toBe("true");
    expect(wrapper.get('[role="dialog"]').attributes("aria-label")).toBe(
      "Filter composer",
    );
    expect(wrapper.find('input[aria-label="Search fields"]').exists()).toBe(true);
  });

  it("marks selected field and operator buttons with aria-pressed", async () => {
    const wrapper = mountFilters();

    await wrapper.get('button[aria-label="Add filter"]').trigger("click");
    await nextTick();

    const titleButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Title");
    expect(titleButton!.attributes("aria-pressed")).toBe("true");

    const containsButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "contains");
    expect(containsButton!.attributes("aria-pressed")).toBe("true");
  });

  it("renders validation failures as alerts", async () => {
    const wrapper = mountFilters();

    await wrapper.get('button[aria-label="Add filter"]').trigger("click");
    await nextTick();

    const applyButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Apply");
    await applyButton!.trigger("click");
    await nextTick();

    const alert = wrapper.get('[role="alert"]');
    expect(alert.text()).toContain("expects a single value");
  });
});

describe("useVueHeadlessFiltersController", () => {
  it("initialises with empty filters", () => {
    let capturedState: any;
    const TestComp = {
      setup() {
        const result = useVueHeadlessFiltersController(() => ({
          fields: fields as any,
          createId,
        }));
        capturedState = result.controllerState;
        return () => h("div");
      },
    };

    mount(TestComp as any);

    expect(capturedState.value.filters).toEqual([]);
    expect(capturedState.value.draft).toBeNull();
  });

  it("keeps controlled filters in sync", async () => {
    const controlled = ref<Filter<string>[]>([]);
    let capturedState: any;

    const TestComp = {
      setup() {
        const result = useVueHeadlessFiltersController(() => ({
          fields: fields as any,
          createId,
          modelValue: controlled.value,
        }));
        capturedState = result.controllerState;
        return () => h("div");
      },
    };

    mount(TestComp as any);
    controlled.value = [
      { id: "sync-1", field: "status", operator: "is", values: ["todo"] },
    ];
    await nextTick();
    await nextTick();

    expect(capturedState.value.filters).toHaveLength(1);
    expect(capturedState.value.filters[0]!.field).toBe("status");
  });

  it("invokes onChange when filters change", async () => {
    const onChange = vi.fn();
    let capturedController: any;

    const TestComp = {
      setup() {
        const result = useVueHeadlessFiltersController(() => ({
          fields: fields as any,
          createId,
          onChange,
        }));
        capturedController = result.controller;
        return () => h("div");
      },
    };

    mount(TestComp as any);
    capturedController.value.addFilter({
      id: "cb-1",
      field: "status",
      operator: "is",
      values: ["todo"],
    });
    await nextTick();

    expect(onChange).toHaveBeenCalled();
    const payload = onChange.mock.calls.at(-1)![0] as Filter<string>[];
    expect(payload[0]!.field).toBe("status");
  });
});
