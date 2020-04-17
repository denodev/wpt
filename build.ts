import { get, objectifiedTesters, escape } from "./utils.ts";
import { render } from "./template.ts";

const results: Record<string, any> = {};
const headers: Record<string, any> = {};

const KEY = "result";

const [testers, count] = objectifiedTesters();

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

function result(nodeVersion: string, path: string): string {
  let result = get(results, nodeVersion);
  if (result === undefined) return "";

  result = get(result, KEY, path);
  if (result === undefined) {
    return '<div class="No">-</div>';
  }

  const title = result === true
    ? "Test passed"
    : typeof result === "string"
      ? result
      : "Test failed";
  result = result === true
    ? "Yes"
    : typeof result === "string" ? "Error" : "No";
  return `<div class="${result}" title="${escape(title)}">${result}</div>`;
}

function percent(nodeVersion: string): number {
  const data = get(results, nodeVersion, KEY);
  return data ? Math.floor((data._passed / count) * 100) : 0;
}

function compare(x1: string, x2: string): number {
  const y1 = x1.split(".").map((x) => parseInt(x));
  const y2 = x2.split(".").map((x) => parseInt(x));

  for (let i = 0; i < y1.length; i++) {
    if (y1[i] === y2[i]) {
      continue;
    } else if (y1[i] < y2[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  return 0;
}

export default async function build() {
  const files: Deno.DirEntry[] = [];

  for await (const dirEntry of Deno.readdir("./result")) {
    if (dirEntry.isFile && dirEntry.name.substr(-5) === ".json") {
      files.push(dirEntry);
    }
  }

  const versions = files.map((x) => x.name!.replace(/\.json/, ""));

  versions.sort(compare);

  for (const version of versions) {
    const content = await Deno.readFile(`./result/${version}.json`);
    results[version] = JSON.parse(decoder.decode(content));
    headers[version] = {
      version: results[version].version,
    };
  }

  const html = render({ headers, testers, result, percent });
  await Deno.writeFile("./index.html", encoder.encode(html));
}
