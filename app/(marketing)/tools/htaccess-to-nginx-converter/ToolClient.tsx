"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

function htaccessToNginx(input: string): string {
  if (!input.trim()) throw new Error("Paste .htaccess content");
  const lines = input.split("\n");
  const out: string[] = [];
  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const parts = line.split(/\s+/);
    const directive = parts[0];

    if (directive === "RewriteEngine") return;
    if (directive === "DirectoryIndex") out.push(`index ${parts.slice(1).join(" ")};`);
    else if (directive === "ErrorDocument") out.push(`error_page ${parts[1]} ${parts.slice(2).join(" ")};`);
    else if (directive === "Redirect" || directive === "Redirect301") out.push(`rewrite ^${parts[1]}$ ${parts[2]} permanent;`);
    else if (directive === "RedirectMatch") out.push(`rewrite ${parts[1]} ${parts[2]} permanent;`);
    else if (directive === "RewriteRule") {
      const [, pattern, target, flags] = parts;
      const isRedirect = flags && /R(=\d+)?/.test(flags);
      out.push(`rewrite ${pattern} ${target}${isRedirect ? " permanent" : ""};`);
    } else if (directive === "RewriteCond") out.push(`# condition (verify manually): ${line}`);
    else if (directive === "Deny" || directive === "Require") out.push(`# access control (verify manually): ${line}`);
    else if (directive === "Options" && /-Indexes/.test(line)) out.push(`autoindex off;`);
    else if (directive === "AddType") out.push(`# add to nginx mime.types or: types { ${parts[1]} ${parts.slice(2).join(" ")}; }`);
    else if (directive === "<IfModule" || directive === "</IfModule>") return;
    else out.push(`# unrecognized (manual conversion needed): ${line}`);
  });
  return out.length ? out.join("\n") : "# No recognizable directives found";
}

export default function HtaccessToNginxConverterPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="ngx"
        title=".htaccess → Nginx Converter"
        desc="Paste .htaccess content to get an Nginx config draft — covers the most common Apache directives, flags anything that needs a manual look."
      />
      <ToolLab
        inputLabel=".htaccess"
        outputLabel="Nginx config"
        placeholder={`RewriteEngine On\nRewriteRule ^old-page$ /new-page [R=301,L]\nErrorDocument 404 /404.html`}
        live
        emptyHint="Paste .htaccess content above — the Nginx config updates automatically."
        onRun={(input) => htaccessToNginx(input)}
      />
    </div>
  );
}
