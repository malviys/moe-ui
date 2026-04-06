/**
 * ReactNativeFilters component tests.
 *
 * These tests run under Jest with jsdom + a minimal react-native mock.
 * The mock substitutes RN primitives with HTML equivalents so that
 * @testing-library/react can interact with the rendered tree.
 *
 * Approach:
 *   - react-native → <rootDir>/tests/react-native/__mocks__/react-native.js
 *     (View→div, Text→div, TextInput→input, Pressable→button, ScrollView→div)
 *   - @testing-library/react for DOM queries (getByText, getByRole, fireEvent)
 *   - testEnvironment: jsdom so DOM APIs are available
 *
 * Core scenarios covered:
 *   - Render: Add filter button present, no composer initially
 *   - Draft lifecycle: open → select field → enter value → apply → chip appears
 *   - Filter removal via the × Pressable
 *   - Controlled mode via the `filters` prop
 *   - Custom labels
 *   - allowMultiple: false – same-field filter replaced
 *   - Operator selection
 *   - Field search input
 *   - renderAddButton / renderFilterChip custom renderers
 */

import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";

import ReactNativeFilters from "../../src/react-native/filters";
import type { Filter, FilterFieldDefinition } from "../../src/core/types";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

type Task = { title: string; status: string; tags: string[] };

const fields: FilterFieldDefinition<Task, string>[] = [
  {
    key: "title",
    label: "Title",
    type: "text",
    accessor: (r) => r.title,
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
    accessor: (r) => r.tags,
  },
];

let idCounter = 0;
const createId = () => `id-${++idCounter}`;

function renderFilters(props: Partial<React.ComponentProps<typeof ReactNativeFilters>> = {}) {
  idCounter = 0;
  return render(
    <ReactNativeFilters
      fields={fields}
      createId={createId}
      {...(props as any)}
    />,
  );
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – rendering", () => {
  it("renders the Add filter button", () => {
    renderFilters();
    expect(screen.getByText("Add filter")).toBeTruthy();
  });

  it("does not render the composer initially", () => {
    renderFilters();
    expect(screen.queryByText("Field")).toBeNull();
    expect(screen.queryByText("Operator")).toBeNull();
  });

  it("renders filter chips for defaultFilters", () => {
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
    });
    // chip summary: "Status is Todo"
    expect(screen.getByText(/Status/)).toBeTruthy();
  });

  it("applies a custom addFilter label", () => {
    renderFilters({ labels: { addFilter: "New rule" } });
    expect(screen.getByText("New rule")).toBeTruthy();
    expect(screen.queryByText("Add filter")).toBeNull();
  });

  it("hides the search input when showSearchInput is false", () => {
    renderFilters({ showSearchInput: false });
    fireEvent.click(screen.getByText("Add filter"));
    expect(screen.queryByPlaceholderText("Search fields...")).toBeNull();
  });
});

describe("ReactNativeFilters – accessibility", () => {
  it("exposes the add button name and expanded state", () => {
    renderFilters();

    const addButton = screen.getByRole("button", { name: "Add filter" });
    expect(addButton.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(addButton);

    expect(addButton.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("textbox", { name: "Search fields" })).toBeTruthy();
  });

  it("exposes remove buttons with descriptive labels", () => {
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
    });

    expect(
      screen.getByRole("button", { name: "Remove Status is Todo" }),
    ).toBeTruthy();
  });

  it("marks selected options via aria-pressed", () => {
    renderFilters();

    fireEvent.click(screen.getByRole("button", { name: "Add filter" }));
    const titleField = screen.getByRole("button", { name: "Title" });
    expect(titleField.getAttribute("aria-pressed")).toBe("true");
  });

  it("renders validation failures as alerts", () => {
    renderFilters();

    fireEvent.click(screen.getByRole("button", { name: "Add filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("expects a single value");
  });
});

// ---------------------------------------------------------------------------
// Composer open / close
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – composer open/close", () => {
  it("opens the composer on Add filter press", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));
    expect(screen.getByText("Field")).toBeTruthy();
    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Tags")).toBeTruthy();
  });

  it("shows Apply and Cancel after opening", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));
    expect(screen.getByText("Apply")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("closes the composer on Cancel press", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Field")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Adding a text filter
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – adding a text filter", () => {
  it("calls onFiltersChange with the new text filter on Apply", () => {
    const onFiltersChange = jest.fn();
    renderFilters({ onFiltersChange });

    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Title"));

    // TextInput for value entry — find the last text input (search may be first)
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[inputs.length - 1]!, { target: { value: "My task" } });

    fireEvent.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCallArgs = (onFiltersChange as jest.Mock).mock.calls[
      (onFiltersChange as jest.Mock).mock.calls.length - 1
    ] as [Filter<string>[]];
    const filters = lastCallArgs[0];
    expect(filters.length).toBeGreaterThanOrEqual(1);
    expect(filters[0]!.field).toBe("title");
    expect(filters[0]!.values).toContain("My task");
  });
});

// ---------------------------------------------------------------------------
// Adding a select filter
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – adding a select filter", () => {
  it("applies a select filter when an option is pressed", () => {
    const onFiltersChange = jest.fn();
    renderFilters({ onFiltersChange });

    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Status"));
    fireEvent.click(screen.getByText("Todo"));
    fireEvent.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = (onFiltersChange as jest.Mock).mock.calls[
      (onFiltersChange as jest.Mock).mock.calls.length - 1
    ] as [Filter<string>[]];
    const filters = lastCall[0];
    expect(filters[0]!.field).toBe("status");
    expect(filters[0]!.values).toContain("todo");
  });
});

// ---------------------------------------------------------------------------
// Adding a multiselect filter
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – adding a multiselect filter", () => {
  it("applies a multiselect filter with multiple toggled values", () => {
    const onFiltersChange = jest.fn();
    renderFilters({ onFiltersChange });

    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Tags"));
    fireEvent.click(screen.getByText("Urgent"));
    fireEvent.click(screen.getByText("Bug"));
    fireEvent.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = (onFiltersChange as jest.Mock).mock.calls[
      (onFiltersChange as jest.Mock).mock.calls.length - 1
    ] as [Filter<string>[]];
    const filters = lastCall[0];
    expect(filters[0]!.field).toBe("tags");
    expect(filters[0]!.values).toContain("urgent");
    expect(filters[0]!.values).toContain("bug");
  });

  it("deselects a value when pressed again", () => {
    const onFiltersChange = jest.fn();
    renderFilters({ onFiltersChange });

    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Tags"));
    fireEvent.click(screen.getByText("Urgent")); // select
    fireEvent.click(screen.getByText("Urgent")); // deselect
    fireEvent.click(screen.getByText("Apply"));

    const lastCall = (onFiltersChange as jest.Mock).mock.calls[
      (onFiltersChange as jest.Mock).mock.calls.length - 1
    ] as [Filter<string>[]];
    const filters = lastCall[0];
    expect(filters[0]?.values ?? []).not.toContain("urgent");
  });
});

// ---------------------------------------------------------------------------
// Filter removal
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – filter removal", () => {
  it("calls onFiltersChange with empty array when × is pressed", () => {
    const onFiltersChange = jest.fn();
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
      onFiltersChange,
    });

    fireEvent.click(screen.getByText("×"));

    expect(onFiltersChange).toHaveBeenCalledWith([]);
  });
});

// ---------------------------------------------------------------------------
// Controlled mode
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – controlled mode", () => {
  it("renders chips for filters prop", () => {
    renderFilters({
      filters: [{ id: "c1", field: "title", operator: "contains", values: ["hello"] }],
    });
    expect(screen.getByText(/Title/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Operator selection
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – operator selection", () => {
  it("shows operators for the selected field", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Title"));
    expect(screen.getByText("contains")).toBeTruthy();
    expect(screen.getByText("is")).toBeTruthy();
  });

  it("changes operator on press and applies correct operator", () => {
    const onFiltersChange = jest.fn();
    renderFilters({ onFiltersChange });

    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Title"));
    fireEvent.click(screen.getByText("starts with"));

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[inputs.length - 1]!, { target: { value: "Hello" } });
    fireEvent.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = (onFiltersChange as jest.Mock).mock.calls[
      (onFiltersChange as jest.Mock).mock.calls.length - 1
    ] as [Filter<string>[]];
    expect(lastCall[0][0]!.operator).toBe("starts_with");
  });
});

// ---------------------------------------------------------------------------
// Field search
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – field search", () => {
  it("filters fields as the user types in the search box", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));

    const searchInput = screen.getByPlaceholderText("Search fields...");
    fireEvent.change(searchInput, { target: { value: "tag" } });

    expect(screen.getByText("Tags")).toBeTruthy();
    expect(screen.queryByText("Title")).toBeNull();
    expect(screen.queryByText("Status")).toBeNull();
  });

  it("shows 'No matching fields.' when search has no results", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));

    const searchInput = screen.getByPlaceholderText("Search fields...");
    fireEvent.change(searchInput, { target: { value: "zzznomatch" } });

    expect(screen.getByText("No matching fields.")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Custom labels
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – custom labels", () => {
  it("applies label overrides", () => {
    renderFilters({
      labels: {
        addFilter: "New rule",
        apply: "Save",
        cancel: "Dismiss",
        fieldSection: "Select field",
      },
    });

    expect(screen.getByText("New rule")).toBeTruthy();
    fireEvent.click(screen.getByText("New rule"));
    expect(screen.getByText("Select field")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
    expect(screen.getByText("Dismiss")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Custom renderers
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – custom renderers", () => {
  it("uses renderAddButton renderer when provided", () => {
    renderFilters({
      renderers: {
        renderAddButton: ({ label }) => <>{label} (custom)</>,
      },
    });
    expect(screen.getByText("Add filter (custom)")).toBeTruthy();
  });

  it("uses renderFilterChip renderer when provided", () => {
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
      renderers: {
        renderFilterChip: ({ item }) => <>chip:{item.filter.id}</>,
      },
    });
    expect(screen.getByText("chip:f1")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// allowMultiple: false
// ---------------------------------------------------------------------------

describe("ReactNativeFilters – allowMultiple: false", () => {
  it("replaces same-field filter", () => {
    const onFiltersChange = jest.fn();
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
      allowMultiple: false,
      onFiltersChange,
    });

    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Status"));
    fireEvent.click(screen.getByText("Done"));
    fireEvent.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = (onFiltersChange as jest.Mock).mock.calls[
      (onFiltersChange as jest.Mock).mock.calls.length - 1
    ] as [Filter<string>[]];
    const filters = lastCall[0];
    expect(filters).toHaveLength(1);
    expect(filters[0]!.values).toContain("done");
  });
});
