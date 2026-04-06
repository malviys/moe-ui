/**
 * Minimal E2E test harness for @moe-ui/filters ReactFilters component.
 *
 * The app renders the ReactFilters component and exposes the applied filters
 * as a JSON string in a data-testid="output" element so Playwright tests
 * can assert on the filter state without needing to inspect React internals.
 */
import React, { useState } from "react";
import ReactFilters from "../../src/react/filters";
import type { Filter, FilterFieldDefinition } from "../../src/core/types";

// ---------------------------------------------------------------------------
// Shared field definitions for all E2E tests
// ---------------------------------------------------------------------------

type Product = { name: string; category: string; tags: string[] };

const fields: FilterFieldDefinition<Product, string>[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    accessor: (r) => r.name,
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "electronics", label: "Electronics" },
      { value: "clothing", label: "Clothing" },
      { value: "books", label: "Books" },
    ],
    accessor: "category",
  },
  {
    key: "tags",
    label: "Tags",
    type: "multiselect",
    options: [
      { value: "sale", label: "Sale" },
      { value: "new", label: "New" },
      { value: "featured", label: "Featured" },
    ],
    accessor: (r) => r.tags,
  },
];

let _idCounter = 0;
const createId = () => `filter-${++_idCounter}`;

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [appliedFilters, setAppliedFilters] = useState<Filter<string>[]>([]);

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>Filter Test Harness</h1>

      <ReactFilters
        fields={fields}
        createId={createId}
        onFiltersChange={setAppliedFilters}
      />

      {/* Machine-readable output for Playwright assertions */}
      <pre
        data-testid="output"
        style={{
          marginTop: "24px",
          padding: "12px",
          background: "#f4f4f5",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      >
        {JSON.stringify(appliedFilters, null, 2)}
      </pre>
    </div>
  );
}
