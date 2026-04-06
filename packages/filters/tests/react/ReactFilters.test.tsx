import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ReactFilters from "../../src/react/filters";
import type { ReactFiltersProps } from "../../src/react/filters";
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

function renderFilters(props: Partial<ReactFiltersProps<Task, string>> = {}) {
  idCounter = 0;
  return render(
    <ReactFilters
      fields={fields}
      createId={createId}
      {...props}
    />,
  );
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("ReactFilters – rendering", () => {
  it("renders the Add filter button by default", () => {
    renderFilters();
    expect(screen.getByText("Add filter")).toBeInTheDocument();
  });

  it("does not show the composer panel initially", () => {
    renderFilters();
    expect(screen.queryByText("Field")).not.toBeInTheDocument();
  });

  it("renders existing filters as chips when defaultFilters supplied", () => {
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
    });
    // chip summary: "Status is Todo"
    expect(screen.getByText(/Status/)).toBeInTheDocument();
  });

  it("renders a custom Add filter label", () => {
    renderFilters({ labels: { addFilter: "New rule" } });
    expect(screen.getByText("New rule")).toBeInTheDocument();
  });

  it("hides the search input when showSearchInput is false", async () => {
    renderFilters({ showSearchInput: false });
    fireEvent.click(screen.getByText("Add filter"));
    expect(screen.queryByPlaceholderText("Search fields...")).not.toBeInTheDocument();
  });
});

describe("ReactFilters – accessibility", () => {
  it("exposes the add button state and composer dialog semantics", async () => {
    const user = userEvent.setup();
    renderFilters();

    const addButton = screen.getByRole("button", { name: "Add filter" });
    expect(addButton.getAttribute("aria-haspopup")).toBe("dialog");
    expect(addButton.getAttribute("aria-expanded")).toBe("false");

    await user.click(addButton);

    expect(addButton.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByRole("dialog", { name: "Filter composer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Search fields" }),
    ).toBeInTheDocument();
  });

  it("exposes selected state for field and operator buttons", async () => {
    const user = userEvent.setup();
    renderFilters();

    await user.click(screen.getByRole("button", { name: "Add filter" }));
    const titleField = screen.getByRole("button", { name: "Title" });
    expect(titleField.getAttribute("aria-pressed")).toBe("true");

    const containsOperator = screen.getByRole("button", { name: "contains" });
    expect(containsOperator.getAttribute("aria-pressed")).toBe("true");
  });

  it("exposes remove buttons with descriptive labels", () => {
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
    });

    expect(
      screen.getByRole("button", { name: "Remove Status is Todo" }),
    ).toBeInTheDocument();
  });

  it("renders validation failures as an alert", async () => {
    const user = userEvent.setup();
    renderFilters();

    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("expects a single value");
  });
});

// ---------------------------------------------------------------------------
// Opening / closing the composer
// ---------------------------------------------------------------------------

describe("ReactFilters – composer open/close", () => {
  it("opens the composer on Add filter click", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));
    expect(screen.getByText("Field")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("shows Apply and Cancel buttons in the composer", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));
    expect(screen.getByText("Apply")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("closes the composer when Cancel is clicked", () => {
    renderFilters();
    fireEvent.click(screen.getByText("Add filter"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Field")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Adding a text filter
// ---------------------------------------------------------------------------

describe("ReactFilters – adding a text filter", () => {
  it("adds a text filter via the composer", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderFilters({ onFiltersChange });

    await user.click(screen.getByText("Add filter"));
    await user.click(screen.getByText("Title")); // select field
    // The value input appears under the "Value" section heading.
    // It is the last textbox in the DOM (search input is first).
    const allInputs = screen.getAllByRole("textbox");
    const input = allInputs[allInputs.length - 1]!;
    await user.type(input, "My task");
    await user.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1] as [Filter<string>[]];
    const [filters] = lastCall;
    expect(filters).toHaveLength(1);
    expect(filters[0]!.field).toBe("title");
    expect(filters[0]!.values).toEqual(["My task"]); // stored as typed; matching is case-insensitive
  });
});

// ---------------------------------------------------------------------------
// Adding a select filter
// ---------------------------------------------------------------------------

describe("ReactFilters – adding a select filter", () => {
  it("adds a select filter by clicking a value option", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderFilters({ onFiltersChange });

    await user.click(screen.getByText("Add filter"));
    await user.click(screen.getByText("Status"));
    await user.click(screen.getByText("Todo"));
    await user.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1] as [Filter<string>[]];
    const [filters] = lastCall;
    expect(filters[0]!.field).toBe("status");
    expect(filters[0]!.values).toEqual(["todo"]);
  });
});

// ---------------------------------------------------------------------------
// Adding a multiselect filter
// ---------------------------------------------------------------------------

describe("ReactFilters – adding a multiselect filter", () => {
  it("adds a multiselect filter with multiple values", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderFilters({ onFiltersChange });

    await user.click(screen.getByText("Add filter"));
    await user.click(screen.getByText("Tags"));
    await user.click(screen.getByText("Urgent"));
    await user.click(screen.getByText("Bug"));
    await user.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1] as [Filter<string>[]];
    const [filters] = lastCall;
    expect(filters[0]!.field).toBe("tags");
    expect(filters[0]!.values).toContain("urgent");
    expect(filters[0]!.values).toContain("bug");
  });

  it("toggles values off on second click", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderFilters({ onFiltersChange });

    await user.click(screen.getByText("Add filter"));
    await user.click(screen.getByText("Tags"));
    await user.click(screen.getByText("Urgent")); // select
    await user.click(screen.getByText("Urgent")); // deselect
    await user.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1] as [Filter<string>[]];
    const [filters] = lastCall;
    expect(filters[0]!.values).not.toContain("urgent");
  });
});

// ---------------------------------------------------------------------------
// Removing filters
// ---------------------------------------------------------------------------

describe("ReactFilters – removing filters", () => {
  it("removes a filter chip when × is clicked", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
      onFiltersChange,
    });

    const removeButton = screen.getByText("×");
    await user.click(removeButton);

    expect(onFiltersChange).toHaveBeenCalledWith([]);
  });
});

// ---------------------------------------------------------------------------
// Editing an existing filter
// ---------------------------------------------------------------------------

describe("ReactFilters – editing a filter", () => {
  it("opens the composer pre-filled when a chip is clicked", async () => {
    const user = userEvent.setup();
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
    });

    // Click the chip (not the × button) to edit
    const chip = screen.getAllByRole("button").find(
      (b) => b.textContent?.includes("Status") && b.textContent?.includes("Todo"),
    )!;
    await user.click(chip);

    // Composer should open with "Status" field selected
    expect(screen.getByText("Field")).toBeInTheDocument();
    expect(screen.getByText("Operator")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Controlled mode
// ---------------------------------------------------------------------------

describe("ReactFilters – controlled mode", () => {
  it("reflects externally controlled filters", () => {
    const controlled: Filter<string>[] = [
      { id: "c1", field: "title", operator: "contains", values: ["hello"] },
    ];
    renderFilters({ filters: controlled });
    // chip shows the summary text
    expect(screen.getByText(/Title/)).toBeInTheDocument();
  });

  it("calls onFiltersChange when controlled and a chip is removed", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    function Wrapper() {
      const [filters, setFilters] = useState<Filter<string>[]>([
        { id: "c1", field: "status", operator: "is", values: ["todo"] },
      ]);
      return (
        <ReactFilters
          fields={fields}
          filters={filters}
          onFiltersChange={(next) => { setFilters(next); onFiltersChange(next); }}
          createId={createId}
        />
      );
    }

    render(<Wrapper />);
    await user.click(screen.getByText("×"));
    expect(onFiltersChange).toHaveBeenCalledWith([]);
  });
});

// ---------------------------------------------------------------------------
// Operator section
// ---------------------------------------------------------------------------

describe("ReactFilters – operator selection", () => {
  it("shows operator options after selecting a field", async () => {
    const user = userEvent.setup();
    renderFilters();

    await user.click(screen.getByText("Add filter"));
    await user.click(screen.getByText("Title"));

    // text field operators should be visible
    expect(screen.getByText("contains")).toBeInTheDocument();
    expect(screen.getByText("is")).toBeInTheDocument();
  });

  it("changes the operator when another is clicked", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderFilters({ onFiltersChange });

    await user.click(screen.getByText("Add filter"));
    await user.click(screen.getByText("Title"));
    await user.click(screen.getByText("starts with"));

    // Value input is the last textbox (search input is first)
    const allInputs = screen.getAllByRole("textbox");
    const input = allInputs[allInputs.length - 1]!;
    await user.type(input, "Hello");
    await user.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1] as [Filter<string>[]];
    const [filters] = lastCall;
    expect(filters[0]!.operator).toBe("starts_with");
  });
});

// ---------------------------------------------------------------------------
// Field search
// ---------------------------------------------------------------------------

describe("ReactFilters – field search", () => {
  it("filters the field list as the user types in the search input", async () => {
    const user = userEvent.setup();
    renderFilters();

    await user.click(screen.getByText("Add filter"));

    const searchInput = screen.getByPlaceholderText("Search fields...");
    await user.type(searchInput, "tag");

    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Status")).not.toBeInTheDocument();
  });

  it("shows 'No matching fields' when search yields no results", async () => {
    const user = userEvent.setup();
    renderFilters();

    await user.click(screen.getByText("Add filter"));
    const searchInput = screen.getByPlaceholderText("Search fields...");
    await user.type(searchInput, "zzznomatch");

    expect(screen.getByText("No matching fields.")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Custom labels
// ---------------------------------------------------------------------------

describe("ReactFilters – custom labels", () => {
  it("applies all custom label overrides", async () => {
    const user = userEvent.setup();
    renderFilters({
      labels: {
        addFilter: "Add rule",
        apply: "Save",
        cancel: "Dismiss",
        fieldSection: "Pick a field",
      },
    });

    expect(screen.getByText("Add rule")).toBeInTheDocument();
    await user.click(screen.getByText("Add rule"));
    expect(screen.getByText("Pick a field")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Custom renderer
// ---------------------------------------------------------------------------

describe("ReactFilters – custom renderers", () => {
  it("uses renderAddButton renderer when provided", () => {
    renderFilters({
      renderers: {
        renderAddButton: ({ label }) => (
          <button data-testid="custom-add">{label} (custom)</button>
        ),
      },
    });
    expect(screen.getByTestId("custom-add")).toBeInTheDocument();
    expect(screen.getByTestId("custom-add").textContent).toContain("(custom)");
  });

  it("uses renderFilterChip renderer when provided", () => {
    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
      renderers: {
        renderFilterChip: ({ item }) => (
          <div data-testid="custom-chip">{item.summary}</div>
        ),
      },
    });
    expect(screen.getByTestId("custom-chip")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// allowMultiple: false
// ---------------------------------------------------------------------------

describe("ReactFilters – allowMultiple: false", () => {
  it("replaces the existing filter for the same field", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    renderFilters({
      defaultFilters: [
        { id: "f1", field: "status", operator: "is", values: ["todo"] },
      ],
      allowMultiple: false,
      onFiltersChange,
    });

    // Add a second status filter
    await user.click(screen.getByText("Add filter"));
    await user.click(screen.getByText("Status"));
    await user.click(screen.getByText("Done"));
    await user.click(screen.getByText("Apply"));

    expect(onFiltersChange).toHaveBeenCalled();
    const lastCall = onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1] as [Filter<string>[]];
    const [filters] = lastCall;
    expect(filters).toHaveLength(1);
    expect(filters[0]!.values).toEqual(["done"]);
  });
});
