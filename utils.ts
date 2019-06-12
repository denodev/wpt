import { TemplateTtesters } from "./template.ts";

// tries to traverse an object to a given path
// example: get(myObj, 'foo', 'bar')
export function get(obj: object, path: string, more?: string): any {
  if (more && obj[path]) {
    return obj[path][more];
  }

  return obj[path];
}

// sets a nested value at a given path that is delimited by '›'
// example: set({}, 'foo›bar›baz', 123)
// output: { foo: { bar: { baz: 123}}}
export function set<T>(target: object, path: string, value: T) {
  var parts = path.split("›");
  if (parts.length === 2) parts.splice(1, 0, "");

  var obj = target;
  var last = parts.pop();

  parts.forEach(function(prop) {
    if (!obj[prop]) obj[prop] = {};
    obj = obj[prop];
  });

  obj[last] = value;
}

const replacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;"
};

export function objectifiedTesters(): [TemplateTtesters, number] {
  const decoder = new TextDecoder("utf-8");
  const content = Deno.readFileSync("./testers.json");
  const _testers = JSON.parse(decoder.decode(content));
  const testers = {};
  let count: number = 0;
  Object.keys(_testers).forEach(path => {
    set(testers, path, { path: path, code: _testers[path] });
    count++;
  });
  return [testers, count];
}

export function escape(str: string): string {
  return str.replace(/[&<>"'\/]/g, x => replacements[x]);
}
