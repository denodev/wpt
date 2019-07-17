import "./asserts.ts";
import "./polyfill.ts";
import { green, red } from "https://deno.land/std/colors/mod.ts";
import {
  TestDefinition,
  TestFunction
} from "https://deno.land/std/testing/mod.ts";
import { AssertionError, fail } from "https://deno.land/std/testing/asserts.ts";

export const RESULT_PATH = "result";

const tests: TestDefinition[] = [];

export interface TestResult {
  _passed: number;
  _failed: number;
  [key: string]: string | boolean | number | undefined;
}

export type Testers = {
  [key: string]: string;
};

export type Result = {
  version: string;
  v8: string;
  typescript: string;
  result: TestResult;
};

const result: TestResult = {
  _passed: 0,
  _failed: 0
};

const testers: Testers = {};

declare global {
  function test(fn: TestFunction, name?: string): void;
  function promise_test(fn: TestFunction, name?: string): void;
  function async_test(fn: TestFunction, name?: string): void;
  function setup(spec?: string): void;
}

window["setup"] = function(spec: string = ""): void {
  window["test"] = function test(fn: TestFunction, name?: string): void {
    if (!name) {
      name = fn.name;
    }

    name = `${spec}${name}`;

    tests.push({ fn, name });
    addTest(fn, name);
  };
  window["promise_test"] = window["test"];
  window["async_test"] = window["test"];
};

function addTest(fn: TestFunction, name: string): void {
  result[name] = undefined;
  testers[name] = fn.toString();
}

const RED_FAILED = red("FAILED");
const GREEN_OK = green("ok");

function reportJson(): void {
  const { deno, v8, typescript } = Deno.version;
  const json: Result = {
    version: deno,
    v8,
    typescript,
    result
  };
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(json, null, "  "));
  Deno.writeFileSync(`${RESULT_PATH}/${deno}.json`, data);
}

function reportTesters() {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(testers, null, "  "));
  Deno.writeFileSync("./testers.json", data);
}

function printResults(): void {
  // Attempting to match the output of Rust's test runner.
  console.log(
    `\ntest result: ${result._failed ? RED_FAILED : GREEN_OK}. ` +
      `${result._passed} passed; ${result._failed} failed\n`
  );
}

export async function runTestsSerial(tests: TestDefinition[]): Promise<void> {
  for (const { fn, name } of tests) {
    try {
      await fn();
      console.log("...", GREEN_OK);
      console.groupEnd();
      result._passed++;
      result[name] = true;
    } catch (err) {
      console.log("...", RED_FAILED);
      console.groupEnd();
      console.error(err.stack);
      result._failed++;
      if (err instanceof AssertionError) {
        result[name] = false;
      } else {
        result[name] = err.message;
      }
    }
  }
}

/**
 * Runs specified test cases.
 * Parallel execution can be enabled via the boolean option; default: serial.
 */
export async function runTests(saveJson = false): Promise<void> {
  console.log(`running ${tests.length} tests`);
  await runTestsSerial(tests);
  printResults();

  if (saveJson) {
    reportJson();
    reportTesters();
  }

  if (result._failed) {
    // Use setTimeout to avoid the error being ignored due to unhandled
    // promise rejections being swallowed.
    setTimeout(() => {
      console.error(`There were ${result._failed} test failures.`);
      // Deno.exit(1);
    }, 0);
  }
}
