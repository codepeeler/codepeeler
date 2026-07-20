"use client";

import { useState } from "react";
import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const EMOJI_MAP: Record<string, string> = {
  smile: "😄", grin: "😁", joy: "😂", heart: "❤️", thumbsup: "👍", thumbsdown: "👎",
  fire: "🔥", star: "⭐", tada: "🎉", rocket: "🚀", eyes: "👀", clap: "👏",
  cry: "😢", laughing: "😆", wink: "😉", thinking: "🤔", hundred: "💯", pray: "🙏",
  wave: "👋", ok_hand: "👌", muscle: "💪", sparkles: "✨", warning: "⚠️", checkmark: "✅",
  x: "❌", bulb: "💡", bug: "🐛", rainbow: "🌈", sun: "☀️", moon: "🌙",
  coffee: "☕", pizza: "🍕", beer: "🍺", cake: "🎂", gift: "🎁", zap: "⚡",
  skull: "💀", ghost: "👻", alien: "👽", robot: "🤖", poop: "💩", heart_eyes: "😍",
  sob: "😭", angry: "😠", sunglasses: "😎", scream: "😱", clock: "🕐", calendar: "📅",
  email: "📧", phone: "📱", computer: "💻", lock: "🔒", key: "🔑", flag: "🚩",
};

function shortcodeToEmoji(input: string): string {
  if (!input) throw new Error("Enter text with :shortcode: patterns");
  return input.replace(/:([a-zA-Z0-9_+-]+):/g, (match, code) => EMOJI_MAP[code] ?? match);
}

function emojiToShortcode(input: string): string {
  if (!input) throw new Error("Enter text containing emoji");
  let out = input;
  for (const [code, emoji] of Object.entries(EMOJI_MAP)) out = out.split(emoji).join(`:${code}:`);
  return out;
}

export default function EmojiShortcodeConverterPage() {
  const [mode, setMode] = useState("encode");

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="data"
        badge="😄"
        title="Emoji Shortcode Converter"
        desc="Convert :shortcode: patterns into emoji, or emoji back into :shortcode: text."
      />
      <ToolLab
        inputLabel={mode === "encode" ? "Text with shortcodes" : "Text with emoji"}
        outputLabel={mode === "encode" ? "Emoji" : "Shortcodes"}
        placeholder={mode === "encode" ? "Nice work :tada: :fire:" : "Nice work 🎉 🔥"}
        modes={[
          { value: "encode", label: "Shortcode → Emoji" },
          { value: "decode", label: "Emoji → Shortcode" },
        ]}
        mode={mode}
        onModeChange={setMode}
        live
        recalcKey={mode}
        emptyHint="Enter text above, choose a direction — the result updates automatically."
        onRun={(input) => (mode === "encode" ? shortcodeToEmoji(input) : emojiToShortcode(input))}
      />
    </div>
  );
}
