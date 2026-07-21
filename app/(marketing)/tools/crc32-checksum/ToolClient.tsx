"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

let CRC32_TABLE: Uint32Array | null = null;
function getCrc32Table(): Uint32Array {
  if (CRC32_TABLE) return CRC32_TABLE;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  CRC32_TABLE = table;
  return table;
}

function crc32Checksum(input: string): string {
  if (!input) throw new Error("Enter text to checksum");
  const table = getCrc32Table();
  const bytes = new TextEncoder().encode(input);
  let crc = 0xffffffff;
  for (const b of bytes) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  crc = (crc ^ 0xffffffff) >>> 0;
  return crc.toString(16).padStart(8, "0");
}

export default function Crc32ChecksumPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="sec"
        badge="CRC"
        title="CRC32 Checksum"
        desc="Compute the CRC-32 (IEEE 802.3) checksum of any text — useful for quick integrity checks."
      />
      <ToolLab
        inputLabel="Text"
        outputLabel="CRC32 (hex)"
        placeholder="Type or paste text..."
        live
        emptyHint="Enter text above — the checksum updates automatically."
        onRun={(input) => crc32Checksum(input)}
      />
    </div>
  );
}
