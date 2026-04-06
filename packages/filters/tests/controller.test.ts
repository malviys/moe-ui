import { describe, expect, test } from "bun:test";

import {
  createFilter,
  createHeadlessFiltersController,
  deserializeFilters,
  filterRecords,
} from "../src/core";
import type { FilterFieldDefinition } from "../src/core";

type TaskRecord = {
  title: string;
  status: "todo" | "in_progress" | "done";
  tags: string[];
  createdAt: Date;
};

const fields: FilterFieldDefinition<TaskRecord, string | Date>[] = [
  {
    key: "meta",
    label: "Meta",
    type: "group",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "todo", label: "Todo" },
          { value: "in_progress", label: "In Progress" },
          { value: "done", label: "Done" },
        ],
      },
      {
        key: "tags",
        label: "Tags",
        type: "multiselect",
        options: [
          { value: "ios", label: "iOS" },
          { value: "web", label: "Web" },
          { value: "urgent", label: "Urgent" },
        ],
        accessor: (record) => record.tags,
        maxSelections: 2,
      },
    ],
  },
  {
    key: "title",
    label: "Title",
    type: "text",
    accessor: (record) => record.title,
    pattern: "^[A-Za-z\\s]+$",
  },
  {
    key: "createdAt",
    label: "Created",
    type: "custom",
    accessor: (record) => record.createdAt,
    parseValue: (value) => new Date(String(value)),
    serializeValue: (value) =>
      value instanceof Date ? value.toISOString() : String(value),
  },
];

describe("createHeadlessFiltersController", () => {
  test("commits drafts, validates them, and emits normalized filters", () => {
    const changes: string[] = [];
    const controller = createHeadlessFiltersController<TaskRecord, string>({
      fields: fields as FilterFieldDefinition<TaskRecord, string>[],
      createId: () => "generated-filter",
      onChange: (change) => {
        changes.push(change.type);
      },
    });

    controller.beginDraft("title");
    controller.updateDraft({ operator: "contains", values: ["Release 123"] });

    const invalidDraft = controller.validateDraft();
    expect(invalidDraft?.valid).toBe(false);
    expect(invalidDraft?.issues[0]?.reason).toContain("does not match");

    const invalidCommit = controller.commitDraft();
    expect(invalidCommit.ok).toBe(false);

    controller.updateDraft({ values: ["Release Notes"] });
    const validCommit = controller.commitDraft();

    expect(validCommit.ok).toBe(true);
    expect(controller.getState().filters).toEqual([
      {
        id: "generated-filter",
        field: "title",
        operator: "contains",
        values: ["Release Notes"],
      },
    ]);
    expect(changes).toEqual(["commit-draft"]);
  });

  test("replaces same-field filters when multiple values are not allowed", () => {
    const controller = createHeadlessFiltersController<TaskRecord, string>({
      fields: fields as FilterFieldDefinition<TaskRecord, string>[],
      allowMultiple: false,
      createId: () => "generated-filter",
    });

    const first = controller.addFilter({
      id: "first",
      field: "status",
      operator: "is",
      values: ["todo"],
    });
    const second = controller.addFilter({
      id: "second",
      field: "status",
      operator: "is",
      values: ["done"],
    });

    expect(first.field).toBe("status");
    expect(second.values).toEqual(["done"]);
    expect(controller.getState().filters).toEqual([
      {
        id: "second",
        field: "status",
        operator: "is",
        values: ["done"],
      },
    ]);
  });

  test("serializes and deserializes field values through field adapters", () => {
    const controller = createHeadlessFiltersController<TaskRecord, string | Date>({
      fields,
      filters: [
        createFilter("createdAt", "is", [new Date("2026-04-01T00:00:00.000Z")]),
      ],
    });

    const serialized = controller.serialize();
    const restored = deserializeFilters(serialized, fields);

    expect(restored).toHaveLength(1);
    expect(restored[0]?.field).toBe("createdAt");
    expect(restored[0]?.values[0]).toBeInstanceOf(Date);
    expect((restored[0]?.values[0] as Date).toISOString()).toBe(
      "2026-04-01T00:00:00.000Z",
    );
  });

  test("filters records using the default operator registry", () => {
    const records: TaskRecord[] = [
      {
        title: "Release Notes",
        status: "done",
        tags: ["web", "urgent"],
        createdAt: new Date("2026-04-01T00:00:00.000Z"),
      },
      {
        title: "Ship Mobile",
        status: "todo",
        tags: ["ios"],
        createdAt: new Date("2026-04-02T00:00:00.000Z"),
      },
    ];

    const results = filterRecords(
      records,
      [
        createFilter("status", "is", ["done"]),
        createFilter("tags", "has_all_of", ["web", "urgent"]),
      ],
      fields as FilterFieldDefinition<TaskRecord, string>[],
    );

    expect(results).toEqual([records[0]!]);
  });
});
