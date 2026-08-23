"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@moe-ui/registry/components/ui/accordion";

export const AccordionMultipleTypePreview = () => {
  return (
    <Accordion
      type="multiple"
      defaultValue={["item-1"]}
      className="w-full max-w-sm"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>
          This accordion allows multiple sections to stay expanded.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>
          You can open this section without closing the first one.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third section</AccordionTrigger>
        <AccordionContent>
          Use the multiple type when users need to compare content side by side.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
