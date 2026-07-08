import Link from "next/link";
import { CAT_META, getCategoryCount, type CatKey } from "@/lib/data/tools";

export default function Categories() {
  return (
    <section className="w-full px-8 pt-11">
      <h2 className="mb-[18px] font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.01em]">
        Browse by category
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(CAT_META) as [CatKey, (typeof CAT_META)[CatKey]][]).map(
          ([key, cat]) => (
            <Link
              key={key}
              href={`/tools?cat=${key}`}
              style={{ borderLeftColor: cat.color }}
              className="cursor-pointer rounded-[12px] border border-[var(--border)] border-l-[3px] bg-[var(--card)] px-[18px] py-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="mb-[3px] text-[14.5px] font-semibold">{cat.label}</div>
              <div className="text-xs text-[var(--text-faint)]">{getCategoryCount(key)} tools</div>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
