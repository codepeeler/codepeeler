"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LANGUAGES, CATEGORIES, type Snippet, type SnippetLanguage } from "@/lib/data/snippets";

export type SnippetFormValues = {
  title: string;
  desc: string;
  language: SnippetLanguage;
  category: string;
  code: string;
  tags: string[];
};

const BLANK: SnippetFormValues = {
  title: "",
  desc: "",
  language: "JavaScript",
  category: "Utilities",
  code: "",
  tags: [],
};

/**
 * Used for both creating a new snippet and editing an existing one —
 * `editing` is null for create, or the Snippet being edited (title/desc/
 * code/etc. pre-filled from it). onSubmit does the actual API call
 * (createSnippet or updateSnippet in the parent) and returns whether it
 * succeeded; the modal only closes itself on success so a failed save
 * doesn't lose what the person typed.
 */
export default function SnippetEditorModal({
  editing,
  onClose,
  onSubmit,
}: {
  editing: Snippet | null;
  onClose: () => void;
  onSubmit: (values: SnippetFormValues) => Promise<boolean>;
}) {
  const [values, setValues] = useState<SnippetFormValues>(BLANK);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setValues({
        title: editing.title,
        desc: editing.desc,
        language: editing.language,
        category: editing.category,
        code: editing.code,
        tags: editing.tags,
      });
      setTagsInput(editing.tags.join(", "));
    } else {
      setValues(BLANK);
      setTagsInput("");
    }
  }, [editing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSave = values.title.trim().length > 0 && values.code.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const ok = await onSubmit({ ...values, title: values.title.trim(), tags });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[640px] flex-col rounded-[16px] border border-[var(--border)] bg-[var(--bg-elev)] shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-5 py-4">
          <span className="text-[15px] font-bold">{editing ? "Edit Snippet" : "Create Snippet"}</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-dim)]">Title</label>
            <input
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              placeholder="e.g. Debounce a function"
              className="h-9 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-dim)]">Description</label>
            <textarea
              value={values.desc}
              onChange={(e) => setValues((v) => ({ ...v, desc: e.target.value }))}
              placeholder="What does this snippet do?"
              rows={2}
              className="w-full resize-none rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[12px] font-semibold text-[var(--text-dim)]">Language</label>
              <select
                value={values.language}
                onChange={(e) => setValues((v) => ({ ...v, language: e.target.value as SnippetLanguage }))}
                className="h-9 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-2.5 text-[13px] outline-none focus:border-[var(--primary)]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[12px] font-semibold text-[var(--text-dim)]">Category</label>
              <select
                value={values.category}
                onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
                className="h-9 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-2.5 text-[13px] outline-none focus:border-[var(--primary)]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-dim)]">
              Tags <span className="font-normal text-[var(--text-faint)]">(comma separated)</span>
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. async, hooks, performance"
              className="h-9 w-full rounded-[9px] border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-dim)]">Code</label>
            <textarea
              value={values.code}
              onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
              placeholder="Paste or write your snippet here..."
              rows={10}
              className="w-full resize-y rounded-[9px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.6] outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border-soft)] px-5 py-3.5">
          <button
            onClick={onClose}
            className="rounded-[9px] px-4 py-2 text-[13px] font-semibold text-[var(--text-dim)] hover:bg-[var(--card-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-[9px] bg-[var(--primary)] px-4 py-2 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Publish Snippet"}
          </button>
        </div>
      </div>
    </div>
  );
}
