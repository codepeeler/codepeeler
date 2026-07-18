"use client";

import ToolHeader from "@/components/tools/ToolHeader";
import ToolLab from "@/components/tools/ToolLab";

const HTTP_STATUS: Record<string, string> = {
  "100": "Continue", "101": "Switching Protocols",
  "200": "OK", "201": "Created", "202": "Accepted", "204": "No Content",
  "301": "Moved Permanently", "302": "Found", "304": "Not Modified", "307": "Temporary Redirect", "308": "Permanent Redirect",
  "400": "Bad Request", "401": "Unauthorized", "403": "Forbidden", "404": "Not Found", "405": "Method Not Allowed",
  "408": "Request Timeout", "409": "Conflict", "410": "Gone", "418": "I'm a teapot", "422": "Unprocessable Entity", "429": "Too Many Requests",
  "500": "Internal Server Error", "501": "Not Implemented", "502": "Bad Gateway", "503": "Service Unavailable", "504": "Gateway Timeout",
};

const HTTP_STATUS_DESC: Record<string, string> = {
  "200": "The request succeeded.",
  "201": "The request succeeded and a new resource was created.",
  "204": "The request succeeded but there is no content to return.",
  "301": "The resource has permanently moved to a new URL.",
  "302": "The resource temporarily resides at a different URL.",
  "304": "The resource hasn't changed since the last request.",
  "400": "The server couldn't understand the request due to invalid syntax.",
  "401": "Authentication is required and has failed or not been provided.",
  "403": "The server understood the request but refuses to authorize it.",
  "404": "The requested resource couldn't be found.",
  "405": "The HTTP method isn't allowed for this resource.",
  "409": "The request conflicts with the current state of the resource.",
  "429": "Too many requests have been sent in a given time.",
  "500": "The server encountered an unexpected condition.",
  "502": "The server received an invalid response from an upstream server.",
  "503": "The server is currently unable to handle the request.",
  "504": "The server didn't receive a timely response from an upstream server.",
};

function httpStatusLookup(input: string): string {
  const code = input.trim().match(/\d{3}/)?.[0];
  if (!code) throw new Error("Enter an HTTP status code, e.g. 404");
  const label = HTTP_STATUS[code];
  if (!label) throw new Error(`Unknown status code "${code}"`);
  const category =
    code[0] === "1" ? "Informational" : code[0] === "2" ? "Success" : code[0] === "3" ? "Redirection" : code[0] === "4" ? "Client Error" : "Server Error";
  const desc = HTTP_STATUS_DESC[code];
  return [`${code} ${label}`, `Category: ${category}`, desc ? `\n${desc}` : ""].filter(Boolean).join("\n");
}

export default function HttpStatusLookupPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <ToolHeader
        cat="web"
        badge="4xx"
        title="HTTP Status Code Lookup"
        desc="Enter an HTTP status code to see its meaning, category, and a short description."
      />
      <ToolLab
        inputLabel="Status code"
        outputLabel="Meaning"
        placeholder="404"
        live
        emptyHint="Enter a status code above — the meaning updates automatically."
        onRun={(input) => httpStatusLookup(input)}
      />
    </div>
  );
}
