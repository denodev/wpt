import { runTests } from "./lib/runner.ts";
import build from "./build.ts";
import ignore from "./ignore.json";

console.log(`use deno version: ${Deno.version.deno}`);

const decoder = new TextDecoder("utf-8");

async function main() {
  switch (Deno.args[0]) {
    case "serve":
      const p = Deno.run({
        cmd: [
          "deno",
          "run",
          "--allow-net",
          "--allow-read",
          "https://deno.land/std/http/file_server.ts",
        ],
        stdout: "inherit",
      });
      await p.status();
      break;
    case "run":
      const specs = [];

      for await (const dirEntry of Deno.readdir("./spec")) {
        specs.push(dirEntry);
      }

      const specsSorted = specs.sort((x, y) => x.name! > y.name! ? 1 : -1);

      for (const spec of specsSorted) {
        if (!spec.isDirectory || ignore.includes(spec.name!)) {
          console.log(spec.name);
          continue;
        }

        const specPath = `./spec/${spec.name}`;
        const files: Deno.DirEntry[] = [];

        for await (const dirEntry of Deno.readdir(specPath)) {
          if (dirEntry.name!.substr(-7) === ".any.js") {
            files.push(dirEntry);
          }
        }

        for (const file of files) {
          const filePath = `./spec/${spec.name}/${file.name}`;
          const content = await Deno.readFile(filePath);
          const code: string = decoder.decode(content);
          setup(`${spec.name}›${file.name}›`);
          eval(code);
        }
      }

      runTests(true);
      break;
    case "test":
      if (!Deno.args[1]) {
        console.log("Please input a file name. Usage: wpt test <filename>");
        Deno.exit(1);
      }

      const content = await Deno.readFile(Deno.args[1]);
      const code: string = decoder.decode(content);
      setup();
      eval(code);
      runTests(false);
      break;
    case "build":
      await build();
      break;
    default:
      console.log(Deno.args);
  }
}

main();
