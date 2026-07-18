"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) throw new Error(`"${ip}" is not a valid IPv4 address`);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function subnetCalc(input: string): string {
  const trimmed = input.trim();
  const m = trimmed.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!m) throw new Error("Enter a CIDR like 192.168.1.0/24");
  const prefix = Number(m[2]);
  if (prefix < 0 || prefix > 32) throw new Error("Prefix must be between 0 and 32");
  const ipInt = ipToInt(m[1]);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = ipInt & mask;
  const broadcast = network | (~mask >>> 0);
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2);
  return [
    `Network Address:   ${intToIp(network)}`,
    `Broadcast Address: ${intToIp(broadcast)}`,
    `Subnet Mask:       ${intToIp(mask)}`,
    `Prefix:            /${prefix}`,
    `Total Addresses:   ${totalHosts}`,
    `Usable Hosts:      ${usableHosts}`,
    `First Usable:      ${prefix >= 31 ? intToIp(network) : intToIp(network + 1)}`,
    `Last Usable:       ${prefix >= 31 ? intToIp(broadcast) : intToIp(broadcast - 1)}`,
  ].join("\n");
}

export default function IpSubnetCalculatorPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="IP"
        title="IP Subnet / CIDR Calculator"
        desc="Enter an IPv4 CIDR block to get its network address, broadcast address, subnet mask, and usable host range."
      />
      <ToolLab
        inputLabel="CIDR"
        outputLabel="Subnet details"
        placeholder="192.168.1.0/24"
        live
        emptyHint="Enter a CIDR above — the subnet details update automatically."
        onRun={(input) => subnetCalc(input)}
      />
    </div>
  );
}
