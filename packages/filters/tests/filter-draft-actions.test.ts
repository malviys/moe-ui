import { describe, expect, test } from "bun:test";

import { createHeadlessFiltersController } from "../src/core";
import type { FilterFieldDefinition } from "../src/core";
import {
  areFilterValuesEqual,
  flattenFilterFields,
} from "../src/internal/adapter-utils";
import { createFilterDraftActions } from "../src/internal/filter-draft-actions";

type IssueRecord = {
  title: string;
  status: "todo" | "done";
  assigneeIds: Array<{ id: number; role: string }>;
};

const fields: FilterFieldDefinition<
  IssueRecord,
  string | { id: number; role: string }
>[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "todo", label: "Todo" },
      { value: "done", label: "Done" },
    ],
  },
  {
    key: "title",
    label: "Title",
    type: "text",
  },
  {
    key: "assigneeIds",
    label: "Assignees",
    type: "multiselect",
    options: [
      { value: { id: 1, role: "owner" }, label: "Owner" },
      { value: { id: 2, role: "reviewer" }, label: "Reviewer" },
    ],
    validation: ({ filter }) =>
      filter.values.length === 0 ? "Pick at least one assignee." : true,
  },
];

describe("createFilterDraftActions", () => {
  test("opens the first available field and commits text drafts", () => {
    const controller = createHeadlessFiltersController<
      IssueRecord,
      string | { id: number; role: string }
    >({
      fields,
      createId: () => "draft-filter",
    });
    const actions = createFilterDraftActions({ controller });

    actions.openDraft();
    expect(controller.getState().draft?.field).toBe("status");

    actions.selectField(flattenFilterFields(fields)[1]!);
    actions.updateTextValue("Shipped");
    const committed = actions.commitDraft();

    expect(committed.ok).toBe(true);
    expect(controller.getState().filters).toEqual([
      {
        id: "draft-filter",
        field: "title",
        operator: "contains",
        values: ["Shipped"],
      },
    ]);
  });

  test("toggles complex multiselect values with deep equality", () => {
    const controller = createHeadlessFiltersController<
      IssueRecord,
      string | { id: number; role: string }
    >({
      fields,
      createId: () => "assignee-filter",
    });
    const actions = createFilterDraftActions({ controller });
    const assigneeField = flattenFilterFields(fields)[2]!;
    const owner = assigneeField.options?.[0]?.value as { id: number; role: string };
    const reviewer = assigneeField.options?.[1]?.value as {
      id: number;
      role: string;
    };

    actions.openDraft();
    actions.selectField(assigneeField);
    actions.toggleOption({ id: 1, role: "owner" });
    actions.toggleOption(reviewer);

    expect(controller.getState().draft?.values).toEqual([owner, reviewer]);

    actions.toggleOption({ id: 1, role: "owner" });
    expect(controller.getState().draft?.values).toEqual([reviewer]);
    expect(
      areFilterValuesEqual(
        { id: 1, role: "owner" },
        { id: 1, role: "owner" },
      ),
    ).toBe(true);
  });

  test("surfaces validation failures through the shared snapshot", () => {
    const controller = createHeadlessFiltersController<
      IssueRecord,
      string | { id: number; role: string }
    >({
      fields,
      createId: () => "invalid-filter",
    });
    const actions = createFilterDraftActions({ controller });

    actions.openDraft();
    actions.selectField(flattenFilterFields(fields)[2]!);

    const snapshot = actions.getSnapshot();
    expect(snapshot.validationReport?.valid).toBe(false);
    expect(snapshot.validationError).toBe("Pick at least one assignee.");

    const commit = actions.commitDraft();
    expect(commit.ok).toBe(false);
    if (!commit.ok) {
      expect(commit.reason).toBe("Pick at least one assignee.");
    }
  });
});
