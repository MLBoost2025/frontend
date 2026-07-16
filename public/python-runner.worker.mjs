import { loadPyodide } from "/pyodide/pyodide.mjs";

const runtimePromise = loadPyodide({ indexURL: "/pyodide/" });

const HARNESS = String.raw`
import builtins
import json
import math
import traceback

_source = KATALUME_SOURCE
_tests = json.loads(KATALUME_TESTS)
_safe_modules = {
    "bisect", "collections", "decimal", "fractions", "functools", "heapq",
    "itertools", "json", "math", "random", "re", "statistics", "string"
}
_original_import = builtins.__import__

def _safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    root = name.split(".", 1)[0]
    if level != 0 or root not in _safe_modules:
        raise ImportError(f"Module '{root}' is not available in the practice sandbox")
    return _original_import(name, globals, locals, fromlist, level)

_safe_builtins = dict(vars(builtins))
for _name in (
    "breakpoint", "compile", "eval", "exec", "exit", "help", "input",
    "open", "quit"
):
    _safe_builtins.pop(_name, None)
_safe_builtins["__import__"] = _safe_import

def _jsonable(value):
    if isinstance(value, tuple):
        return [_jsonable(item) for item in value]
    if isinstance(value, list):
        return [_jsonable(item) for item in value]
    if isinstance(value, dict):
        return {str(key): _jsonable(item) for key, item in value.items()}
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("Solutions must return finite numbers")
        return round(value, 8)
    if value is None or isinstance(value, (str, int, bool)):
        return value
    raise TypeError(f"Unsupported return type: {type(value).__name__}")

def _close(actual, expected):
    if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
        return math.isclose(float(actual), float(expected), rel_tol=1e-6, abs_tol=1e-6)
    if isinstance(actual, list) and isinstance(expected, list):
        return len(actual) == len(expected) and all(_close(a, e) for a, e in zip(actual, expected))
    if isinstance(actual, dict) and isinstance(expected, dict):
        return actual.keys() == expected.keys() and all(_close(actual[key], expected[key]) for key in actual)
    return actual == expected

_results = []
for _index, _test in enumerate(_tests):
    _namespace = {"__builtins__": _safe_builtins, "__name__": "katalume_solution"}
    try:
        exec(compile(_source, "solution.py", "exec"), _namespace, _namespace)
        _solve = _namespace.get("solve")
        if not callable(_solve):
            raise TypeError("Define a callable solve(payload) function")
        _actual = _jsonable(_solve(json.loads(_test["input"])))
        _expected = json.loads(_test["expectedOutput"])
        _passed = _close(_actual, _expected)
        _results.append({
            "name": _test["name"],
            "visibility": _test["visibility"],
            "passed": _passed,
            "input": _test.get("input") if _test["visibility"] == "sample" else None,
            "expectedOutput": _test.get("expectedOutput") if _test["visibility"] == "sample" else None,
            "actualOutput": json.dumps(_actual, separators=(",", ":")) if _test["visibility"] == "sample" else None,
            "errorMessage": None if _passed else "Output did not match the expected value.",
        })
    except Exception:
        _results.append({
            "name": _test["name"],
            "visibility": _test["visibility"],
            "passed": False,
            "input": _test.get("input") if _test["visibility"] == "sample" else None,
            "expectedOutput": _test.get("expectedOutput") if _test["visibility"] == "sample" else None,
            "actualOutput": None,
            "errorMessage": traceback.format_exc(limit=4)[-3000:],
        })

json.dumps(_results, separators=(",", ":"))
`;

self.onmessage = async (event) => {
  const { id, source, tests } = event.data;
  const startedAt = performance.now();
  try {
    const pyodide = await runtimePromise;
    // The sandbox needs no network primitives. Removing them narrows the
    // impact even if user code manages to reach the JS bridge.
    for (const key of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts"]) {
      try { Object.defineProperty(self, key, { value: undefined, configurable: false }); } catch {}
    }
    pyodide.globals.set("KATALUME_SOURCE", source);
    pyodide.globals.set("KATALUME_TESTS", JSON.stringify(tests));
    const encoded = await pyodide.runPythonAsync(HARNESS);
    self.postMessage({ id, ok: true, runtimeMs: Math.round(performance.now() - startedAt), results: JSON.parse(encoded) });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      runtimeMs: Math.round(performance.now() - startedAt),
      error: String(error?.message || error).slice(0, 3000),
    });
  }
};
