import { assert as _assert, AssertionError } from "../deps.ts";

declare global {
  function assert_true(actual: boolean, description?: string): void;
  function assert_false(actual: boolean, description?: string): void;
  function assert_equals(
    actual: any,
    expected: any,
    description?: string,
  ): void;
  function assert_not_equals(
    actual: any,
    expected: any,
    description?: string,
  ): void;
  function assert_object_equals(
    actual: object,
    expected: object,
    description?: string,
  ): void;
  function assert_array_equals(
    actual: any[],
    expected: any[],
    description?: string,
  ): void;
  function assert_array_approx_equals(
    actual: number[],
    expected: number[],
    epsilon: number,
    description?: string,
  ): void;
  function assert_approx_equals(
    actual: number,
    expected: number,
    epsilon: number,
    description?: string,
  ): void;
  function assert_less_than(
    actual: number,
    expected: number,
    description?: string,
  ): void;
  function assert_greater_than(
    actual: number,
    expected: number,
    description?: string,
  ): void;
  function assert_between_exclusive(
    actual: number,
    lower: number,
    upper: number,
    description?: string,
  ): void;
  function assert_less_than_equal(
    actual: number,
    expected: number,
    description?: string,
  ): void;
  function assert_greater_than_equal(
    actual: number,
    expected: number,
    description?: string,
  ): void;
  function assert_between_inclusive(
    actual: number,
    lower: number,
    upper: number,
    description?: string,
  ): void;
  function assert_regexp_match(
    actual: any,
    expected: RegExp,
    description?: string,
  ): void;
  function assert_class_string(
    object: any,
    class_string: string,
    description?: string,
  ): void;
  function assert_own_property(
    object: object,
    property_name: string,
    description?: string,
  ): void;
  function assert_not_own_property(
    object: object,
    property_name: string,
    description?: string,
  ): void;
  function assert_readonly(
    object: { [x: string]: any },
    property_name: string,
    description?: string,
  ): void;
  function assert_throws(code: any, func: Function, description?: string): void;
  function assert_any(
    assert_func: Function,
    actual: any,
    expected_array: any[],
  ): void;
  function assert(expected_true: boolean, error?: string): void;
}

function assert_true(actual: boolean, description?: string): void {
  assert(actual === true, `expected true got ${actual}`);
}
expose(assert_true, "assert_true");

function assert_false(actual: boolean, description?: string) {
  assert(actual === false, `expected false got ${actual}`);
}
expose(assert_false, "assert_false");

function same_value<T>(x: any, y: any): boolean {
  if (y !== y) {
    //NaN case
    return x !== x;
  }
  if (x === 0 && y === 0) {
    //Distinguish +0 and -0
    return 1 / x === 1 / y;
  }
  return x === y;
}

function assert_equals(actual: any, expected: any, description?: string): void {
  let actualString: string;
  let expectedString: string;
  try {
    actualString = String(actual);
  } catch (e) {
    actualString = "[Cannot display]";
  }

  try {
    expectedString = String(expected);
  } catch (e) {
    expectedString = "[Cannot display]";
  }

  if (typeof actual != typeof expected) {
    assert(
      false,
      `expected (${typeof expected}) ${actualString} but got (${typeof actual}) ${expectedString}`,
    );
    return;
  }
  assert(
    same_value(actual, expected),
    `expected ${actualString} but got ${expectedString}`,
  );
}
expose(assert_equals, "assert_equals");

function assert_not_equals(
  actual: any,
  expected: any,
  description?: string,
): void {
  /*
   * Test if two primitives are unequal or two objects
   * are different objects
   */
  assert(!same_value(actual, expected), `got disallowed value ${actual}`);
}
expose(assert_not_equals, "assert_not_equals");

function assert_in_array(
  actual: any,
  expected: any[],
  description?: string,
): void {
  assert(
    expected.indexOf(actual) != -1,
    `value ${actual} not in array ${expected}`,
  );
}
expose(assert_in_array, "assert_in_array");

function assert_object_equals(
  actual: object,
  expected: object,
  description?: string,
): void {
  assert(
    typeof actual === "object" && actual !== null,
    `value is ${actual}, expected object`,
  );
  //This needs to be improved a great deal
  function check_equal(actual: any, expected: any, stack: any[]) {
    stack.push(actual);

    for (let p in actual) {
      assert(expected.hasOwnProperty(p), `unexpected property ${p}`);

      if (typeof actual[p] === "object" && actual[p] !== null) {
        if (stack.indexOf(actual[p]) === -1) {
          check_equal(actual[p], expected[p], stack);
        }
      } else {
        assert(
          same_value(actual[p], expected[p]),
          `property ${p} expected ${expected} got ${actual}`,
        );
      }
    }

    for (let p in expected) {
      assert(actual.hasOwnProperty(p), `expected property ${p} missing`);
    }
    stack.pop();
  }
  check_equal(actual, expected, []);
}
expose(assert_object_equals, "assert_object_equals");

function assert_array_equals(
  actual: any[],
  expected: any[],
  description?: string,
): void {
  assert(
    typeof actual === "object" && actual !== null && "length" in actual,
    `value is ${actual}, expected array`,
  );
  assert(
    actual.length === expected.length,
    `lengths differ, expected ${expected} got ${actual}`,
  );

  for (let i = 0; i < actual.length; i++) {
    assert(
      actual.hasOwnProperty(i) === expected.hasOwnProperty(i),
      `property ${i}, property expected to be ${expected} but was ${actual}`,
    );
    assert(
      same_value(expected[i], actual[i]),
      `property ${i}, expected ${expected} but got ${actual}`,
    );
  }
}
expose(assert_array_equals, "assert_array_equals");

function assert_array_approx_equals(
  actual: number[],
  expected: number[],
  epsilon: number,
  description?: string,
): void {
  /*
   * Test if two primitive arrays are equal within +/- epsilon
   */
  assert(
    actual.length === expected.length,
    `lengths differ, expected ${expected} got ${actual}`,
  );

  for (let i = 0; i < actual.length; i++) {
    assert(
      actual.hasOwnProperty(i) === expected.hasOwnProperty(i),
      `property ${i}, property expected to be ${expected} but was ${actual}`,
    );
    assert(
      typeof actual[i] === "number",
      `property ${i}, expected a number but got a ${typeof actual}`,
    );
    assert(
      Math.abs(actual[i] - expected[i]) <= epsilon,
      `property ${i}, expected ${expected} +/- ${epsilon}, expected ${expected} but got ${actual}`,
    );
  }
}
expose(assert_array_approx_equals, "assert_array_approx_equals");

function assert_approx_equals(
  actual: number,
  expected: number,
  epsilon: number,
  description?: string,
): void {
  /*
   * Test if two primitive numbers are equal within +/- epsilon
   */
  assert(
    typeof actual === "number",
    `expected a number but got a ${typeof actual}`,
  );

  assert(
    Math.abs(actual - expected) <= epsilon,
    `expected ${expected} +/- ${epsilon} but got ${actual}`,
  );
}
expose(assert_approx_equals, "assert_approx_equals");

function assert_less_than(
  actual: number,
  expected: number,
  description?: string,
): void {
  /*
   * Test if a primitive number is less than another
   */
  assert(
    typeof actual === "number",
    `expected a number but got a ${typeof actual}`,
  );

  assert(
    actual < expected,
    `expected a number less than ${expected} but got ${actual}`,
  );
}
expose(assert_less_than, "assert_less_than");

function assert_greater_than(
  actual: number,
  expected: number,
  description?: string,
): void {
  /*
   * Test if a primitive number is greater than another
   */
  assert(
    typeof actual === "number",
    `expected a number but got a ${typeof actual}`,
  );

  assert(
    actual > expected,
    `expected a number greater than ${expected} but got ${actual}`,
  );
}
expose(assert_greater_than, "assert_greater_than");

function assert_between_exclusive(
  actual: number,
  lower: number,
  upper: number,
  description?: string,
): void {
  /*
   * Test if a primitive number is between two others
   */
  assert(
    typeof actual === "number",
    `expected a number but got a ${typeof actual}`,
  );

  assert(
    actual > lower && actual < upper,
    `expected a number greater than ${lower}  and less than ${upper} but got ${actual}`,
  );
}
expose(assert_between_exclusive, "assert_between_exclusive");

function assert_less_than_equal(
  actual: number,
  expected: number,
  description?: string,
): void {
  /*
   * Test if a primitive number is less than or equal to another
   */
  assert(
    typeof actual === "number",
    `expected a number but got a ${typeof actual}`,
  );

  assert(
    actual <= expected,
    `expected a number less than or equal to ${expected} but got ${actual}`,
  );
}
expose(assert_less_than_equal, "assert_less_than_equal");

function assert_greater_than_equal(
  actual: number,
  expected: number,
  description?: string,
): void {
  /*
   * Test if a primitive number is greater than or equal to another
   */
  assert(
    typeof actual === "number",
    `expected a number but got a ${typeof actual}`,
  );

  assert(
    actual >= expected,
    `expected a number greater than or equal to ${expected} but got ${actual}`,
  );
}
expose(assert_greater_than_equal, "assert_greater_than_equal");

function assert_between_inclusive(
  actual: number,
  lower: number,
  upper: number,
  description?: string,
): void {
  /*
   * Test if a primitive number is between to two others or equal to either of them
   */
  assert(
    typeof actual === "number",
    `expected a number but got a ${typeof actual}`,
  );

  assert(
    actual >= lower && actual <= upper,
    `expected a number greater than or equal to ${lower} and less than or equal to ${upper} but got ${actual}`,
  );
}
expose(assert_between_inclusive, "assert_between_inclusive");

function assert_regexp_match(
  actual: any,
  expected: RegExp,
  description?: string,
): void {
  /*
   * Test if a string (actual) matches a regexp (expected)
   */
  assert(expected.test(actual), `expected ${expected} but got ${actual}`);
}
expose(assert_regexp_match, "assert_regexp_match");

function assert_class_string(
  object: any,
  class_string: string,
  description?: string,
): void {
  assert_equals(
    {}.toString.call(object),
    `[object ${class_string}]`,
    description,
  );
}
expose(assert_class_string, "assert_class_string");

function assert_own_property(
  object: object,
  property_name: string,
  description?: string,
): void {
  assert(
    object.hasOwnProperty(property_name),
    `expected property ${property_name} missing`,
  );
}
expose(assert_own_property, "assert_own_property");

function assert_not_own_property(
  object: object,
  property_name: string,
  description?: string,
): void {
  assert(
    !object.hasOwnProperty(property_name),
    `unexpected property ${property_name} is found on object`,
  );
}
expose(assert_not_own_property, "assert_not_own_property");

function _assert_inherits(name: string) {
  return function (
    object: object,
    property_name: string,
    description?: string,
  ): void {
    assert(
      typeof object === "object" || typeof object === "function",
      "provided value is not an object",
    );

    assert(
      "hasOwnProperty" in object,
      "provided value is an object but has no hasOwnProperty method",
    );

    assert(
      !object.hasOwnProperty(property_name),
      `property ${property_name} found on object expected in prototype chain`,
    );

    assert(
      property_name in object,
      `property ${property_name} not found in prototype chain `,
    );
  };
}
expose(_assert_inherits("assert_inherits"), "assert_inherits");
expose(_assert_inherits("assert_idl_attribute"), "assert_idl_attribute");

function assert_readonly(
  object: { [x: string]: any },
  property_name: string,
  description?: string,
): void {
  const initial_value = object[property_name];
  try {
    //Note that this can have side effects in the case where
    //the property has PutForwards
    object[property_name] = initial_value + "a"; //XXX use some other value here?
    assert(
      same_value(object[property_name], initial_value),
      `changing property ${property_name} succeeded`,
    );
  } finally {
    object[property_name] = initial_value;
  }
}
expose(assert_readonly, "assert_readonly");

/**
 * Assert an Exception with the expected code is thrown.
 *
 * @param {object|number|string} code The expected exception code.
 * @param {Function} func Function which should throw.
 * @param {string} description Error description for the case that the error is not thrown.
 */
function assert_throws(
  this: any,
  code: any,
  func: Function,
  description?: string,
): void {
  try {
    func.call(this);
    assert(false, `${func.name} did not throw`);
  } catch (e) {
    if (e instanceof AssertionError) {
      throw e;
    }

    assert(
      typeof e === "object",
      `${func.name} threw ${e} with type ${typeof e}, not an object`,
    );

    assert(e !== null, `${func.name} threw null, not an object`);

    if (code === null) {
      throw new AssertionError(
        "Test bug: need to pass exception to assert_throws()",
      );
    }
    if (typeof code === "object") {
      assert(
        "name" in e && e.name == code.name,
        `${func} threw ${e} (${e.name}) expected ${code} (${code.name})`,
      );
      return;
    }

    const code_name_map: Record<string, string> = {
      INDEX_SIZE_ERR: "IndexSizeError",
      HIERARCHY_REQUEST_ERR: "HierarchyRequestError",
      WRONG_DOCUMENT_ERR: "WrongDocumentError",
      INVALID_CHARACTER_ERR: "InvalidCharacterError",
      NO_MODIFICATION_ALLOWED_ERR: "NoModificationAllowedError",
      NOT_FOUND_ERR: "NotFoundError",
      NOT_SUPPORTED_ERR: "NotSupportedError",
      INUSE_ATTRIBUTE_ERR: "InUseAttributeError",
      INVALID_STATE_ERR: "InvalidStateError",
      SYNTAX_ERR: "SyntaxError",
      INVALID_MODIFICATION_ERR: "InvalidModificationError",
      NAMESPACE_ERR: "NamespaceError",
      INVALID_ACCESS_ERR: "InvalidAccessError",
      TYPE_MISMATCH_ERR: "TypeMismatchError",
      SECURITY_ERR: "SecurityError",
      NETWORK_ERR: "NetworkError",
      ABORT_ERR: "AbortError",
      URL_MISMATCH_ERR: "URLMismatchError",
      QUOTA_EXCEEDED_ERR: "QuotaExceededError",
      TIMEOUT_ERR: "TimeoutError",
      INVALID_NODE_TYPE_ERR: "InvalidNodeTypeError",
      DATA_CLONE_ERR: "DataCloneError",
    };

    const name = code in code_name_map ? code_name_map[code] : code;

    const name_code_map: Record<string, number> = {
      IndexSizeError: 1,
      HierarchyRequestError: 3,
      WrongDocumentError: 4,
      InvalidCharacterError: 5,
      NoModificationAllowedError: 7,
      NotFoundError: 8,
      NotSupportedError: 9,
      InUseAttributeError: 10,
      InvalidStateError: 11,
      SyntaxError: 12,
      InvalidModificationError: 13,
      NamespaceError: 14,
      InvalidAccessError: 15,
      TypeMismatchError: 17,
      SecurityError: 18,
      NetworkError: 19,
      AbortError: 20,
      URLMismatchError: 21,
      QuotaExceededError: 22,
      TimeoutError: 23,
      InvalidNodeTypeError: 24,
      DataCloneError: 25,

      EncodingError: 0,
      NotReadableError: 0,
      UnknownError: 0,
      ConstraintError: 0,
      DataError: 0,
      TransactionInactiveError: 0,
      ReadOnlyError: 0,
      VersionError: 0,
      OperationError: 0,
      NotAllowedError: 0,
    };

    if (!(name in name_code_map)) {
      throw new AssertionError(
        `Test bug: unrecognized DOMException code "${code}" passed to assert_throws()`,
      );
    }

    const required_props: Record<string, any> = {
      code: name_code_map[name],
      name: undefined,
    };

    if (
      required_props.code === 0 ||
      ("name" in e &&
        e.name !== e.name.toUpperCase() &&
        e.name !== "DOMException")
    ) {
      // New style exception: also test the name property.
      required_props.name = name;
    }

    //We'd like to test that e instanceof the appropriate interface,
    //but we can't, because we don't know what window it was created
    //in.  It might be an instanceof the appropriate interface on some
    //unknown other window.  TODO: Work around this somehow?

    for (let prop in required_props) {
      assert(
        prop in e && e[prop] == required_props[prop],
        `${func} threw ${e} that is not a DOMException ${code}: property ${prop} is equal to ${
          e[prop]
        }, expected ${required_props[prop]}`,
      );
    }
  }
}
expose(assert_throws, "assert_throws");

function assert_unreached() {
  assert(false, "Reached unreachable code");
}

expose(assert_unreached, "assert_unreached");

function assert_any(
  assert_func: Function,
  actual: any,
  expected_array: any[],
): void {
  const args = [].slice.call(arguments, 3);
  const errors: string[] = [];
  let passed = false;
  Array.prototype.forEach.call(expected_array, function (this: any, expected) {
    try {
      assert_func.apply(this, [actual, expected].concat(args));
      passed = true;
    } catch (e) {
      errors.push(e.message);
    }
  });
  if (!passed) {
    throw new AssertionError(errors.join("\n\n"));
  }
}
expose(assert_any, "assert_any");

/*
 * Utility functions
 */
function assert(expected_true: boolean, error?: string): void {
  _assert(expected_true, error);
}

function expose<T>(object: T, name: string): void {
  (window as any)[name] = object;
}
