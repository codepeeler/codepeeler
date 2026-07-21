"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const TAILWIND_ORDER: string[] = [
  "container", "columns-", "break-after-", "break-before-", "break-inside-", "box-decoration-", "box-",
  "float-", "clear-", "isolate", "isolation-", "object-", "overflow-", "overscroll-",
  "static", "fixed", "absolute", "relative", "sticky",
  "inset-", "top-", "right-", "bottom-", "left-", "start-", "end-",
  "visible", "invisible", "collapse", "z-",
  "flex-", "flex", "basis-", "grow", "shrink", "order-",
  "grid-", "col-", "row-", "auto-cols-", "auto-rows-", "gap-",
  "justify-", "content-", "items-", "self-", "place-",
  "space-x-", "space-y-", "m-", "mx-", "my-", "mt-", "mr-", "mb-", "ml-", "ms-", "me-",
  "p-", "px-", "py-", "pt-", "pr-", "pb-", "pl-", "ps-", "pe-",
  "w-", "min-w-", "max-w-", "h-", "min-h-", "max-h-", "size-",
  "font-", "text-", "leading-", "tracking-", "antialiased", "italic", "not-italic",
  "underline", "overline", "line-through", "no-underline", "uppercase", "lowercase", "capitalize", "normal-case",
  "truncate", "whitespace-", "break-", "indent-", "align-", "list-",
  "bg-",
  "rounded", "border", "divide-", "outline", "ring",
  "shadow", "opacity-", "mix-blend-", "bg-blend-",
  "blur", "brightness-", "contrast-", "drop-shadow", "grayscale", "hue-rotate-", "invert", "saturate-", "sepia",
  "backdrop-",
  "transition", "duration-", "ease-", "delay-", "animate-",
  "scale-", "rotate-", "translate-", "skew-", "transform", "origin-",
  "cursor-", "select-", "resize", "scroll-", "touch-", "pointer-events-", "will-change-",
  "fill-", "stroke-",
  "sr-only", "not-sr-only",
];

function tailwindClassRank(baseClass: string): number {
  for (let i = 0; i < TAILWIND_ORDER.length; i++) {
    const prefix = TAILWIND_ORDER[i];
    if (baseClass === prefix || baseClass.startsWith(prefix)) return i;
  }
  return TAILWIND_ORDER.length;
}

function sortTailwindClasses(input: string): string {
  if (!input.trim()) throw new Error("Paste a class list");
  const classes = input.trim().split(/\s+/);
  const decorated = classes.map((cls, idx) => {
    const lastColon = cls.lastIndexOf(":");
    const base = lastColon >= 0 ? cls.slice(lastColon + 1) : cls;
    const variant = lastColon >= 0 ? cls.slice(0, lastColon) : "";
    const cleanBase = base.startsWith("!") ? base.slice(1) : base;
    return { cls, idx, variant, rank: tailwindClassRank(cleanBase) };
  });
  decorated.sort((a, b) => {
    if (a.variant !== b.variant) {
      if (!a.variant) return -1;
      if (!b.variant) return 1;
      return a.variant.localeCompare(b.variant);
    }
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.idx - b.idx;
  });
  return decorated.map((d) => d.cls).join(" ");
}

export default function TailwindClassSorterPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="tw"
        title="Tailwind CSS Class Sorter"
        desc="Paste a list of Tailwind classes and get them sorted into the recommended layout → spacing → typography → visual order."
      />
      <ToolLab
        inputLabel="Classes"
        outputLabel="Sorted classes"
        placeholder="text-white p-4 flex bg-blue-500 rounded hover:bg-blue-600 items-center"
        live
        emptyHint="Paste a class list above — the sorted result updates automatically."
        onRun={(input) => sortTailwindClasses(input)}
      />
    </div>
  );
}
