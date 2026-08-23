import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../src/components/ui/button";
import * as buttonExports from "../src/components/ui/button";
import { Checkbox } from "../src/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/components/ui/tabs";
import { Text } from "../src/components/ui/text";
import { cn } from "../src/lib/utils";

describe("component contracts", () => {
  it("preserves component module exports and merges conflicting utilities", () => {
    expect(Object.keys(buttonExports)).toEqual(
      expect.arrayContaining([
        "Button",
        "buttonVariants",
        "buttonTextVariants",
      ]),
    );
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });

  it("forwards disabled semantics from Button", () => {
    render(
      <Button disabled accessibilityLabel="Save">
        <Text>Save</Text>
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("supports uncontrolled and controlled Checkbox state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Checkbox accessibilityLabel="Terms" defaultChecked onCheckedChange={onCheckedChange} />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Terms" });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(false);

    rerender(<Checkbox accessibilityLabel="Terms" checked onCheckedChange={onCheckedChange} />);
    expect(screen.getByRole("checkbox", { name: "Terms" })).toBeChecked();
  });

  it("supports default tab selection and keyboard activation", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="first">
        <TabsList accessibilityLabel="Demo tabs">
          <TabsTrigger value="first"><Text>First</Text></TabsTrigger>
          <TabsTrigger value="second"><Text>Second</Text></TabsTrigger>
        </TabsList>
        <TabsContent value="first"><Text>First panel</Text></TabsContent>
        <TabsContent value="second"><Text>Second panel</Text></TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("First panel")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByText("Second panel")).toBeVisible();
  });

});
