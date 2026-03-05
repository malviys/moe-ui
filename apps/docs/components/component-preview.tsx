"use client";

type ComponentPreviewProps = {
  children: React.ReactNode;
};

export const ComponentPreview = ({ children }: ComponentPreviewProps) => {
  return (
    <div className="min-h-96 flex items-center justify-center">{children}</div>
  );
};
