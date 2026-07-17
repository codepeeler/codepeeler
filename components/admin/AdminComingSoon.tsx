"use client";

import { Construction } from "lucide-react";

export default function AdminComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#24262E] py-24 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6D5DF61A]">
        <Construction size={20} className="text-[#6D5DF6]" />
      </div>
      <h2 className="text-[15px] font-semibold text-[#F4F4F6]">{label}</h2>
      <p className="mt-1.5 max-w-[360px] text-[13px] text-[#9A9CA6]">
        This section is on the roadmap but not built yet. It&apos;s already wired into the nav so nothing has to move once it ships.
      </p>
    </div>
  );
}
