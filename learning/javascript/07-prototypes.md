# Prototypes & Prototype Chain

## 1. What is it?
In JavaScript, a prototype is an internal linkage mechanism between objects that enables property and method inheritance. Every object in JavaScript has a hidden internal property, `[[Prototype]]` (historically accessible via the non-standard `__proto__` getter/setter, and standardly accessible via `Object.getPrototypeOf()`), which holds a reference to another object or `null`. When a property or method is accessed on an object, if the object does not possess it, JavaScript delegates the lookup to the object's prototype. This linkage cascades upwards, forming the "prototype chain," until it reaches an object whose prototype is `null` (typically `Object.prototype`).

## 2. Why does it exist?
The prototype chain exists to provide a memory-efficient and dynamic mechanism for code reuse and object-oriented programming (OOP) in a prototypal language. Without prototypes, every object instance would need its own copy of all shared methods, leading to massive memory bloat. Instead, thousands of instances can carry state (data properties) locally while delegating behavior (functions) to a single shared prototype object. It solves the same problem that classes solve in classical OOP (Java/C++) but through object-to-object delegation rather than static blueprint instantiation.

## 3. How does it work?
When you attempt to access a property `prop` on an object `obj` (`obj.prop`):
1. The JS engine checks if `prop` exists directly on `obj` (an "own property").
2. If yes, it returns the value.
3. If no, the engine checks `Object.getPrototypeOf(obj)`.
4. It recursively checks this parent object for `prop`.
5. This traversal continues up the prototype chain until the engine finds `prop` or reaches an object with a `[[Prototype]]` of `null`.
6. If the end of the chain is reached without finding `prop`, it returns `undefined`.

When you use the `new` keyword with a constructor function:
```javascript
function Foo() {}
const bar = new Foo();
```
The runtime performs four steps:
1. Creates a brand new empty object.
2. Links this object's `[[Prototype]]` to `Foo.prototype`.
3. Binds `this` to the new object and executes `Foo`.
4. Returns the new object (unless `Foo` explicitly returns another object).

## 4. Real-world analogy
Think of the prototype chain like a company's internal tech support escalation process. 
- You (the instance object) have a problem. You check if you know the answer yourself (Own Property).
- If you don't know it, you ask your direct Manager (Prototype).
- If your Manager doesn't know, they ask the Department Head (Prototype of Prototype).
- If the Department Head doesn't know, they ask the CEO (Object.prototype).
- If the CEO doesn't know, the CEO says "nobody knows" (`null`), and the answer is `undefined`.

## 5. Real-world example
The DOM API heavily relies on prototype chains. When you create a `div` element via `document.createElement('div')`, it's an `HTMLDivElement`.
It inherits methods like `addEventListener` through a deep chain:
`HTMLDivElement.prototype` -> `HTMLElement.prototype` -> `Element.prototype` -> `Node.prototype` -> `EventTarget.prototype` -> `Object.prototype` -> `null`.
You don't attach `addEventListener` to every single `div`; they all delegate up the chain to `EventTarget.prototype`.

## 6. Production example
In a Node.js web server (like Express), the `req` (Request) and `res` (Response) objects use prototypes to inherit built-in HTTP methods while allowing middleware to augment the base prototype or specific instances. Node's `EventEmitter` is often mixed in or inherited via prototypes, allowing streams, requests, and sockets to share the `.on()` and `.emit()` methods efficiently across millions of concurrent connections.

## 7. Minimal implementation
```javascript
// The parent object (Prototype)
const animalMethods = {
  eat() {
    console.log(`${this.name} is eating.`);
  }
};

// The child object creation using Object.create for explicit delegation
function createAnimal(name) {
  // Creates a new object with `animalMethods` as its [[Prototype]]
  const animal = Object.create(animalMethods);
  animal.name = name; // Own property
  return animal;
}

const dog = createAnimal("Rex");
dog.eat(); // "Rex is eating."
// Engine checks `dog` for `eat` -> doesn't find it.
// Engine checks `dog.[[Prototype]]` (animalMethods) -> finds it.
```

## 8. Production implementation
```javascript
/**
 * Classical-style inheritance using prototypes (Pre-ES6 class syntax under the hood)
 */
function DatabaseConnection(host, port) {
  // Instance-specific state
  this.host = host;
  this.port = port;
  this.isConnected = false;
}

// Shared behavior attached to the prototype
DatabaseConnection.prototype.connect = function() {
  if (!this.isConnected) {
    console.log(`Connecting to ${this.host}:${this.port}...`);
    this.isConnected = true;
  }
};

DatabaseConnection.prototype.query = function(sql) {
  if (!this.isConnected) throw new Error("Not connected");
  console.log(`Executing: ${sql}`);
};

// Sub-type inheritance
function PostgresConnection(host, port, schema) {
  // Super call equivalent
  DatabaseConnection.call(this, host, port);
  this.schema = schema;
}

// Link prototypes
PostgresConnection.prototype = Object.create(DatabaseConnection.prototype);
PostgresConnection.prototype.constructor = PostgresConnection; // Restore constructor reference

// Extend behavior
PostgresConnection.prototype.query = function(sql) {
  console.log(`[PG ${this.schema}]`);
  // Super.query equivalent
  DatabaseConnection.prototype.query.call(this, sql);
};

const pg = new PostgresConnection('localhost', 5432, 'public');
pg.connect();
pg.query('SELECT * FROM users;');
```

## 9. Failure scenarios
1. **Prototype Pollution**: If an attacker can modify a global prototype (like `Object.prototype`), they can inject properties into almost all objects in the application, leading to logic bugs, privilege escalation, or RCE (Remote Code Execution).
2. **Infinite Loops in Custom Chains**: Manually setting prototypes circularly (`A.prototype = B; B.prototype = A`) will crash the engine on property lookup.
3. **Accidental Shadowing**: Adding a property to an instance with the same name as a prototype method shadows it, breaking expected behavior.
4. **Performance Degradation**: Extremely long prototype chains can degrade performance because the engine must traverse the entire chain for missing properties (resulting in `undefined`).

## 10. Debugging
To diagnose prototype issues:
- Use `Object.getPrototypeOf(obj)` to inspect the direct prototype.
- Use `obj.hasOwnProperty('prop')` or `Object.hasOwn(obj, 'prop')` to distinguish between instance properties and inherited ones.
- In Chrome DevTools/Node inspect, look at the `[[Prototype]]` (formerly `__proto__`) dropdown on printed objects.
- If properties are magically appearing on objects, check for Prototype Pollution by examining `Object.prototype`.

## 11. Performance
- **Property Lookup**: Accessing properties deep in the prototype chain takes longer than shallow lookups. Accessing non-existent properties is the worst case, as the engine traverses the entire chain before giving up.
- **Hidden Classes (V8 Shapes)**: Dynamically altering the prototype (`Object.setPrototypeOf`) is incredibly slow. Modern engines optimize object property access by creating C++-like structs (Hidden Classes/Shapes) in the background. Mutating a prototype invalidates these optimizations across *all* objects linked to that prototype, causing massive de-optimizations.
- Always establish prototypes at object creation time (e.g., via `Object.create()` or `new`) and avoid mutating them later.

## 12. Security
**Prototype Pollution** is the most critical vulnerability here. 
If your code blindly merges objects (e.g., `lodash.merge` vulnerabilities or custom deep merge functions):
```javascript
function merge(target, source) {
  for (let key in source) {
    if (typeof source[key] === 'object') merge(target[key], source[key]);
    else target[key] = source[key];
  }
}
// Malicious payload: {"__proto__": {"isAdmin": true}}
```
This payload modifies `Object.prototype.isAdmin = true`. Now, `if (user.isAdmin)` passes for *all* objects that don't explicitly define `isAdmin`.
Mitigation: Use `Object.create(null)` for map-like objects, or validate against `__proto__`, `constructor`, and `prototype` keys during merges.

## 13. Alternatives
1. **ES6 Classes**: Syntactic sugar over prototypes. It provides a cleaner, more classical OOP syntax (`class`, `extends`, `super`), though it still uses prototypes under the hood.
2. **Factory Functions / Closures**: Returning objects with methods defined inside the closure. This gives true private state but at the cost of memory (functions are duplicated per instance).
3. **Composition (Mixins)**: Using `Object.assign()` to copy properties from multiple sources into a target object, rather than linking them via prototypes.

## 14. Trade-offs
| Approach | Pros | Cons |
|---|---|---|
| **Prototypes / ES6 Classes** | High memory efficiency, great for massive numbers of instances. Fast setup. | Difficult to achieve true private state (until ES2022 private fields `#`). |
| **Closures (Factory)** | True encapsulation/privacy. No `this` binding context issues. | High memory footprint. Every instance gets a new copy of every method function. |
| **Composition** | Avoids fragile base class problem. Highly flexible. | Object footprint is larger than prototypes since methods are copied directly. |

## 15. Senior-level thinking
Seniors understand that while `class` syntax is standard, the prototypal nature of JavaScript is still leaking through. They avoid deep inheritance hierarchies, favoring composition over inheritance. They are acutely aware of how `this` context behaves dynamically depending on invocation, not definition, which is tightly coupled to how prototype methods are executed. Furthermore, they understand V8 engine heuristics: changing a prototype dynamically destroys Inline Caches (ICs), significantly degrading the performance of property access.

## 16. Interview questions
- **Beginner**: What is the difference between `__proto__` and `prototype`?
- **Intermediate**: Explain how `Object.create()` differs from the `new` keyword.
- **Senior**: How does V8 optimize prototype property lookups, and why is `Object.setPrototypeOf()` considered a performance anti-pattern?

## 17. Follow-up questions
- *Follow-up to Beginner*: How would you create an object that does *not* inherit from `Object.prototype`?
- *Follow-up to Intermediate*: Can you polyfill `Object.create` using `new` for older browsers?
- *Follow-up to Senior*: If we have prototype pollution on `Object.prototype`, how does it bypass JSON serialization? (Trick question: `JSON.stringify` ignores non-enumerable properties and inherited properties by default).

## 18. Strong answer
*For the Senior Question*:
"V8 optimizes property access using Hidden Classes (Shapes) and Inline Caches (ICs). When you access `obj.prop`, V8 caches the memory offset of `prop` based on the object's Shape. If `prop` is on the prototype, V8 chains these Shapes and validates the prototype chain hasn't changed via ValidityCells.
Using `Object.setPrototypeOf()` or mutating `__proto__` invalidates the Shape of the target object. Worse, if you mutate an object that acts as a prototype for many other objects, you invalidate the ValidityCells for *all* those objects, throwing away all cached ICs across the application. The engine drops back to slow dictionary-mode lookups. Thus, prototypes should only be set at instantiation (e.g., via `Object.create`) and treated as immutable thereafter."

## 19. Common mistakes
1. **Misunderstanding `this` in Prototypes**: Extracting a method from a prototype and passing it as a callback (e.g., `setTimeout(myInst.method, 1000)`), causing `this` to point to `window` or `undefined` instead of the instance.
2. **Putting state on the Prototype**: 
   ```javascript
   function Component() {}
   Component.prototype.tags = []; // BAD! Shared across all instances!
   ```
   If instance A does `A.tags.push('new')`, instance B sees it too. Data structures should be initialized in the constructor.
3. **Using `__proto__`**: Using the deprecated `__proto__` accessor instead of `Object.getPrototypeOf()` and `Object.setPrototypeOf()`.

## 20. Practical exercise
**Task**: Build a simple Event Emitter without using the `class` keyword.
1. Create a constructor `EventEmitter`.
2. Ensure instances have an own property for storing events.
3. Attach `on`, `emit`, and `off` methods to the prototype so they are shared.
4. Create a child constructor `NetworkRequest` that inherits from `EventEmitter`.

*Solution outline:*
```javascript
function EventEmitter() {
  this.events = {};
}
EventEmitter.prototype.on = function(name, fn) { /*...*/ };
EventEmitter.prototype.emit = function(name, data) { /*...*/ };

function NetworkRequest(url) {
  EventEmitter.call(this); // Super call
  this.url = url;
}
NetworkRequest.prototype = Object.create(EventEmitter.prototype);
NetworkRequest.prototype.constructor = NetworkRequest;
```

## 21. System-design connection
While prototypes are a language-level feature, the concept of **delegation** and **fallback hierarchies** is heavily used in system design:
- **Configuration Management**: A local service config falls back to environment variables, which fall back to a global config tree (similar to prototype chain traversal).
- **DNS Resolution**: Local cache -> OS cache -> Router -> ISP DNS -> Root Servers.
- **Cache Hierarchies**: L1 -> L2 -> L3 -> Main Memory.
Understanding how prototypes traverse a fallback chain efficiently translates to designing resilient, hierarchical systems where you want to minimize redundancy and memory/storage overhead while allowing local overrides.
