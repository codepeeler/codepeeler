"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolPanel from "@/components/tools/ToolPanel";
import { PanelToolbar, PanelBody } from "@/components/tools/PanelParts";
import { NumberField, TextField, CheckboxOption } from "@/components/tools/FormFields";
import { PrimaryButton } from "@/components/tools/Buttons";
import CopyButton from "@/components/tools/CopyButton";

const DICEWARE_WORDS = [
  "apple","river","stone","cloud","tiger","maple","ocean","spark","brave","gentle","amber","ember","hazel","willow","meadow",
  "canyon","desert","forest","glacier","harbor","island","jungle","kettle","lantern","marble","nectar","orchid","pebble","quartz","ribbon",
  "sapphire","thunder","umbrella","velvet","walnut","xenon","yonder","zephyr","anchor","breeze","cactus","dawn","echo","falcon","garden",
  "horizon","ivory","jasper","kernel","lagoon","mint","nutmeg","opal","pepper","quill","raven","summit","timber","urchin","violet",
  "wander","yarrow","zenith","autumn","blossom","cedar","dune","ember2","fable","glow","haven","ink","jubilee","knoll","lumen",
  "mirage","nook","onyx","pine","quiver","ridge","shard","tundra","utopia","vapor","wisp","yield","zeal","alder","brook",
  "coral","dusk","fern","grove","hollow","ivy","juniper","kindle","lark","moss","nimbus","oak","prairie","quartzite","reef",
  "spruce","thicket","under","vine","whisper","yew","zodiac","basil","clover","drift","elm","frost","gale","heron","iris",
  "jade","kiwi","lilac","myrtle","nectarine","olive","plum","quince","rowan","sage","tulip","umber","vista","wheat","yucca",
  "cinder","dapple","flint","granite","haze","indigo","jetty","knot","lattice","mesa","nova","onward","pixel","quaint","rustle",
  "silver","tangle","upland","verve","woven","yolk","zigzag","acorn","birch","copper","daisy","evergreen","fjord","gully","hush",
];

function generatePassphrase(wordCount: number, separator: string, capitalize: boolean, includeNumber: boolean): string {
  const n = Math.max(2, Math.min(Math.round(wordCount), 10));
  const arr = new Uint32Array(n + (includeNumber ? 1 : 0));
  crypto.getRandomValues(arr);
  const words: string[] = [];
  for (let i = 0; i < n; i++) {
    let w = DICEWARE_WORDS[arr[i] % DICEWARE_WORDS.length];
    if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
    words.push(w);
  }
  if (includeNumber) words.push(String(arr[n] % 100));
  return words.join(separator || "-");
}

export default function PassphraseGeneratorPage() {
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(false);
  const [includeNumber, setIncludeNumber] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  const regenerate = () => setPassphrase(generatePassphrase(wordCount, separator, capitalize, includeNumber));

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordCount, separator, capitalize, includeNumber]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="gen"
        badge="pass"
        title="Passphrase Generator"
        desc="Diceware-style memorable multi-word passphrases — easier to remember and type than random character strings."
      />

      <ToolPanel>
        <PanelToolbar>
          <div className="flex flex-wrap items-center gap-4">
            <NumberField label="Words" min={2} max={10} value={wordCount} onChange={setWordCount} />
            <TextField label="Separator" value={separator} onChange={setSeparator} width="w-16" />
            <CheckboxOption label="Capitalize" checked={capitalize} onChange={setCapitalize} />
            <CheckboxOption label="Include a number" checked={includeNumber} onChange={setIncludeNumber} />
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={passphrase} />
            <PrimaryButton onClick={regenerate}>
              <RefreshCw size={13} /> Generate
            </PrimaryButton>
          </div>
        </PanelToolbar>

        <PanelBody>
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4 text-center font-[family-name:var(--font-mono)] text-[18px] text-[var(--text)]">
            {passphrase}
          </div>
        </PanelBody>
      </ToolPanel>
    </div>
  );
}
