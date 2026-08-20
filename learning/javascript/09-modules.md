# Modules (ES Modules, CommonJS)

## 1. What is it?
In JavaScript, a module is a discrete file or block of code that encapsulates related functionality, exposing only what is explicitly exported and keeping internal details private. Historically, JavaScript had no native module system. CommonJS (CJS) was created as a standard for Node.js to load modules synchronously using `require()` and `module.exports`. ES Modules (ESM) is the official ECMAScript standard for JavaScript modules, using `import` and `export` statements, designed to be statically analyzable and natively supported in both browsers and Node.js.

## 2. Why does it exist?
Without modules, all JavaScript scripts loaded into a browser shared a single global namespace. This led to variable collisions, implicit dependencies, and unmaintainable "spaghetti" code where script inclusion order dictated success or failure. Modules exist to provide encapsulation, dependency management, reusability, and namespace isolation. CommonJS solved this for server-side JavaScript (Node.js), and ESM standardized it across the entire JavaScript ecosystem, enabling advanced tooling optimizations like tree-shaking.

## 3. How does it work?
**CommonJS (CJS):**
- **Dynamic & Synchronous:** Modules are loaded synchronously at runtime. `require()` is a function that reads a file, wraps it in a function closure (providing `exports`, `require`, `module`, `__filename`, `__dirname`), and executes it.
- **Value Copy:** When you `require()` a module, CJS returns a shallow copy of the exported object at that moment. Subsequent changes to primitive exported values inside the module are not reflected in the importing file.
- **Cache:** Loaded modules are cached in `require.cache`.

**ES Modules (ESM):**
- **Static & Asynchronous/Synchronous:** Imports and exports are static declarations, meaning they must be at the top level of a file. The engine parses the module graph before any code is executed.
- **Live Bindings:** ESM exports live read-only views (bindings) of the exported values. If a value changes in the exporting module, the change is immediately visible to the importing module.
- **Resolution:** The engine goes through three phases: Construction (finding and downloading files), Instantiation (allocating memory for exports/imports and linking them), and Evaluation (running the code to fill the memory).

## 4. Real-world analogy
Think of a large restaurant. 
Without modules, everyone (cooks, waiters, managers) shares one giant workbench and yells instructions at each other (global scope). 
CommonJS is like having separate prep stations, but when a waiter needs a dish, they have to walk over, wait for it to be made synchronously, and take a snapshot of the dish (value copy).
ES Modules is like a modern computerized kitchen system. Before the restaurant opens, the system maps out exactly which station supplies what to whom (static analysis). When a chef updates the menu board, all waitstaff screens instantly reflect the change (live bindings).

## 5. Real-world example
In a Node.js backend application, modules are used to separate routing, database logic, and utility functions. For example, a `users.controller.js` file handles HTTP requests, but it imports database queries from a `users.repository.js` file. In modern front-end applications (React/Vue), components are individual ESM files imported into a root application file, allowing bundlers like Webpack or Vite to optimize and chunk the final payload.

## 6. Production example
In a modern production monorepo, a package might need to support both older Node.js versions (CJS) and modern tools/browsers (ESM). This is handled via `package.json`:

```json
{
  "name": "my-utils",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```
This configuration uses "Conditional Exports" to tell Node.js and bundlers which file to serve based on how the package is imported (via `import` or `require`).

## 7. Minimal implementation

**CommonJS:**
```javascript
// math.cjs
let count = 0;
function add(a, b) {
  count++;
  return a + b;
}
module.exports = { add, getCount: () => count };

// app.cjs
const math = require('./math.cjs');
console.log(math.add(2, 3)); // 5
```

**ES Modules:**
```javascript
// math.mjs
export let count = 0;
export function add(a, b) {
  count++;
  return a + b;
}

// app.mjs
import { add, count } from './math.mjs';
console.log(add(2, 3)); // 5
console.log(count); // 1 (Live binding reflects the update)
```

## 8. Production implementation
A robust module setup using ESM, dynamic imports, and re-exporting (barrel files) for cleaner public APIs.

```typescript
// src/services/database.ts
export class Database {
  connect() { console.log("Connected"); }
}

// src/services/auth.ts
export class AuthService {
  login() { console.log("Logged in"); }
}

// src/services/index.ts (Barrel file)
export * from './database.js';
export * from './auth.js';
export { default as Logger } from './logger.js';

// src/app.ts
import { Database, AuthService } from './services/index.js';

async function bootstrap() {
  const db = new Database();
  db.connect();

  // Dynamic import for code splitting or conditional loading
  if (process.env.DEBUG) {
    const { DebugTool } = await import('./tools/debug.js');
    new DebugTool().attach();
  }
}
bootstrap();
```
*Note: In TypeScript with ESM `NodeNext` resolution, imports require the `.js` extension even if the file is `.ts`.*

## 9. Failure scenarios
- **Circular Dependencies:** Module A requires B, and B requires A. In CJS, this can result in an incomplete (partially constructed) object being returned. In ESM, it's handled better due to static linking and live bindings, but accessing a variable before it's initialized throws a `ReferenceError` (TDZ).
- **`require` in ESM:** Attempting to use `require()` natively in an ESM file (where `"type": "module"` is set) throws a `ReferenceError: require is not defined`.
- **Missing Extensions:** In pure Node.js ESM, missing file extensions (e.g., `import './utils'`) will throw an `ERR_UNSUPPORTED_DIR_IMPORT` or `ERR_MODULE_NOT_FOUND`.

## 10. Debugging
- **Determining Module Type:** Check `package.json` for `"type": "module"`. Look at file extensions (`.mjs` is strictly ESM, `.cjs` is strictly CJS).
- **Debugging CJS Cache:** If a module isn't updating as expected, inspect `require.cache`. Sometimes test runners or hot-reloading scripts delete keys from `require.cache` to force a reload.
- **Debugging ESM Variables:** Remember that `__dirname`, `__filename`, `require`, and `module` do not exist in ESM. To get the directory name in ESM:
  ```javascript
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  ```

## 11. Performance
- **Tree Shaking:** Because ESM structure is static, bundlers (Webpack, Rollup, ESBuild) can statically analyze the code and "tree shake" (remove) unused exports, drastically reducing bundle size for the browser. CJS's dynamic nature makes safe tree-shaking extremely difficult.
- **Asynchronous Parsing:** ESM allows parsing and fetching of modules asynchronously and in parallel before execution begins. CJS blocks the main thread to read from the disk and execute modules one by one.

## 12. Security
- **Monkey Patching (CJS):** Because CJS `require.cache` is globally accessible, a malicious or poorly written package can modify the cache, intercepting calls to built-in modules like `fs` or `http` (Prototype Pollution / Execution Hooking).
- **ESM Immutability:** ESM exports are immutable bindings. You cannot reassign an imported function or variable from outside the module, providing a stronger guarantee against runtime tampering.

## 13. Alternatives
- **AMD (Asynchronous Module Definition):** Used historically in browsers (via RequireJS) to load modules asynchronously.
- **UMD (Universal Module Definition):** A pattern used to output code that works in CJS, AMD, or as a global variable. Often used for CDN scripts.
- **SystemJS:** A dynamic module loader that allows using ESM syntax in older browsers.
- **IIFE (Immediately Invoked Function Expression):** The historical way to simulate privacy and modularity before CJS/ESM.

## 14. Trade-offs
| Feature | CommonJS (CJS) | ES Modules (ESM) |
| :--- | :--- | :--- |
| **Syntax** | `require()` / `module.exports` | `import` / `export` |
| **Analysis** | Dynamic (Runtime) | Static (Compile/Parse time) |
| **Bindings** | Value Copy | Live Bindings |
| **Loading** | Synchronous | Asynchronous (graph construction) |
| **Tree Shaking**| Difficult / Unsafe | Native and Highly Effective |
| **Usage** | Legacy Node.js, older scripts | Modern Node.js, Browsers, Deno |

## 15. Senior-level thinking
Senior engineers don't just write `import`; they architect module boundaries. They think about:
- **Dual Package Hazard:** When an application accidentally loads both the CJS and ESM versions of the same library, leading to duplicate singletons or instance-checking failures (e.g., `a instanceof SomeClass` fails).
- **Module Resolution Algorithms:** Understanding how Node.js resolves bare specifiers (e.g., `import 'lodash'`) vs relative specifiers, and how `exports` in `package.json` encapsulates internal files to prevent deep imports (e.g., `import x from 'pkg/internal/utils.js'`).
- **Code Splitting:** Designing boundaries so that bundlers can split code into asynchronous chunks using `import()`, optimizing the Critical Rendering Path.

## 16. Interview questions
- **Beginner:** What is the difference between `require` and `import`?
- **Intermediate:** Explain how CommonJS and ES Modules handle circular dependencies differently.
- **Senior:** What is the "Dual Package Hazard" in Node.js, and how would you configure a library's `package.json` to safely support both CJS and ESM?

## 17. Follow-up questions
- *Beginner Follow-up:* Can you use `import` inside a traditional CommonJS file? (No, unless using dynamic `import()`).
- *Intermediate Follow-up:* In ESM, if I export a primitive let variable and change it later, what does the importing module see? (The updated value, due to live bindings).
- *Senior Follow-up:* How does tree-shaking actually work under the hood in a tool like Rollup, and why does side-effectful code break it?

## 18. Strong answer
*For the Senior Question (Dual Package Hazard):*
"The Dual Package Hazard occurs when a library provides both CJS and ESM builds, and a consumer application inadvertently loads both versions into memory. This can happen if an app imports the ESM version, but a dependency of the app `require`s the CJS version. This causes bugs with singleton states (e.g., a shared cache will exist twice) and `instanceof` checks. 
To solve this, as a library author, I would use the `exports` field in `package.json` with conditional exports. More importantly, I would implement the 'Isolate State' pattern: moving any stateful logic into a separate internal CJS file that is required by both the ESM wrapper and the CJS entry point, ensuring only one instance of the state exists regardless of how the package is consumed."

## 19. Common mistakes
- **Mixing imports/exports:** Trying to use `module.exports` in a file marked as `"type": "module"`, or using top-level `import` in a `.cjs` file.
- **Omitting extensions in ESM:** Writing `import { utils } from './utils'` in Node.js ESM. Node.js requires explicit file extensions (`./utils.js`).
- **Default vs. Named Exports:** Overusing `export default`. Named exports are heavily preferred in large codebases because they enforce consistent naming across files and make refactoring/tree-shaking significantly easier.

## 20. Practical exercise
**Task:** Convert a mini-project from CJS to ESM.
1. Create a folder with two files: `math.js` and `app.js`.
2. Write CJS code where `math.js` exports an object with `add` and `subtract`, and `app.js` requires it and runs it.
3. Add a `package.json` and set `"type": "module"`.
4. Refactor both files to use ESM syntax.
5. Create a circular dependency (app imports math, math imports app) in both versions and observe how Node.js reports the error differently.

## 21. System-design connection
In large-scale system design, modularity extends beyond a single file into the architectural level. 
- **Micro-frontends:** Concepts from ESM directly inspire Module Federation in Webpack, where different applications can dynamically load and share ESM chunks at runtime across different domains.
- **Edge Computing & Serverless:** Cloudflare Workers and Deno heavily leverage ESM. Because ESM is statically analyzable, edge platforms can optimize startup times and aggressively cache dependencies at the edge.
- **CDNs:** Browsers natively supporting ESM allows for systems like Skypack or unpkg to serve raw modules over HTTP via `<script type="module" src="https://cdn...">`, bypassing the need for a build step in simpler distributed applications.
