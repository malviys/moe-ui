"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@moe-ui/registry/components/ui/accordion";

export const AccordionSingleTypePreview = () => {
  return (
    <Accordion type="single" collapsible className="w-full max-w-sm">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is moe ui?</AccordionTrigger>
        <AccordionContent>
          Moe UI is a React Native component library built with modern UI
          patterns and cross-platform primitives.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Does it support web?</AccordionTrigger>
        <AccordionContent>
          Yes. Components are designed to work on native platforms and web.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it customizable?</AccordionTrigger>
        <AccordionContent>
          Yes. You can customize styles, behavior, and composition patterns.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
