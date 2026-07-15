import { Wrench, FilePlus2, Eye, Code2, FolderPlus, FolderCog, Workflow, Play, type LucideIcon } from "lucide-react";
import type { ActivityType } from "@/lib/activity";

export const ACTIVITY_META: Record<ActivityType, { icon: LucideIcon; label: (name: string | null) => string }> = {
  tool_use: { icon: Wrench, label: (n) => `Used ${n ?? "a tool"}` },
  snippet_create: { icon: FilePlus2, label: (n) => `Created snippet "${n ?? "Untitled"}"` },
  snippet_view: { icon: Eye, label: (n) => `Viewed snippet "${n ?? "Untitled"}"` },
  snippet_use: { icon: Code2, label: (n) => `Copied snippet "${n ?? "Untitled"}"` },
  collection_create: { icon: FolderPlus, label: (n) => `Created collection "${n ?? "Untitled"}"` },
  collection_update: { icon: FolderCog, label: (n) => `Updated collection "${n ?? "Untitled"}"` },
  workflow_create: { icon: Workflow, label: (n) => `Created workflow "${n ?? "Untitled"}"` },
  workflow_run: { icon: Play, label: (n) => `Ran workflow "${n ?? "Untitled"}"` },
};
