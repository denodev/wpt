import { runTests } from "./lib/runner.ts";
import build from "./build.ts";
import ignore from "./ignore.json";

console.log(`use deno version: ${Deno.version.deno}`);

const decoder = new TextDecoder("utf-8");

async function main() {
  switch (Deno.args[1]) {
    case "serve":
      const p = Deno.run({
        args: [
          "deno",
          "run",
          "--allow-net",
          "--allow-read",
          "https://deno.land/std/http/file_server.ts"
        ],
        stdout: "inherit"
      });
      await p.status();
      break;
    case "run":
      const specs = Deno.readDirSync("./spec").sort((x, y) =>
        x.name > y.name ? 1 : -1
      );

      for (const spec of specs) {
        if (!spec.isDirectory() || ignore.includes(spec.name)) {
          continue;
        }

        const specPath = `./spec/${spec.name}`;
        console.log(specPath);
        const files = Deno.readDirSync(specPath).filter(
          x => x.name.substr(-7) === ".any.js"
        );

        for (const file of files) {
          const filePath = `./spec/${spec.name}/${file.name}`;
          const content = Deno.readFileSync(filePath);
          const code: string = decoder.decode(content);
          setup(`${spec.name}›${file.name}›`);
          eval(code);
        }
      }

      runTests(true);
      break;
    case "test":
      if (!Deno.args[2]) {
        console.log("Please input a file name. Usage: wpt test <filename>");
        Deno.exit(1);
      }

      const content = Deno.readFileSync(Deno.args[2]);
      const code: string = decoder.decode(content);
      setup();
      eval(code);
      runTests(false);
      break;
    case "build":
      build();
      break;
    default:
      console.log(Deno.args);
  }
}

main();
