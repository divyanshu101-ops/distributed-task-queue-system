# Node.js: From Architecture to Advanced Concepts

A connected study guide — each section builds on the one before it, the way the concepts actually build on each other inside Node itself.

---

## Part 1 — Foundations

### 1. Runtime vs Language

JavaScript is just a specification (ECMAScript) — syntax, variables, functions. By itself, it can't read a file or open a socket. A **runtime** wraps the language with real-world capabilities. Browsers wrap it with the DOM and `fetch`. Node wraps it with `fs`, `http`, and direct OS access. Node.js = V8 (understands the language) + a layer of C++/C glue (gives it powers).

### 2. Call Stack

V8 runs code using a single call stack — last in, first out. Every function call pushes a frame; returning pops it. Only **one thing executes at a time**. This is why a long synchronous loop freezes everything else in your app — there's only one stack, and it's occupied.

### 3. Sync vs Async

- **Sync**: runs directly on the call stack, blocking line by line until done.
- **Async**: the actual work is handed off elsewhere; the stack moves on immediately; a callback/promise picks up the result later.

```js
console.log("1");
setTimeout(() => console.log("2 (async, later)"), 0);
console.log("3");
// Output: 1, 3, 2
```

---

## Part 2 — The Event Loop

### 4. Event Loop

The mechanism that lets a single thread handle thousands of pending operations. It repeatedly asks: *is the call stack empty?* If yes, it checks queues (timers, I/O callbacks, microtasks) and pushes the next ready item onto the stack. This is the literal code-level engine behind "never wait."

### 5. Callbacks

The original async pattern — pass a function to run later.

```js
fs.readFile("file.txt", (err, data) => {
  if (err) return console.error(err);
  console.log(data.toString());
});
```

Problem: nesting several of these creates "callback hell" — a pyramid drifting rightward across the screen.

### 6. Promises

An object representing the eventual result of an async operation. States: `pending` → `fulfilled` or `rejected`.

```js
fetchUser(id)
  .then(user => fetchOrders(user.id))
  .then(orders => console.log(orders))
  .catch(err => console.error(err));
```

Flattens nested callbacks into a readable chain with centralized error handling.

### 7. Async/Await

Syntactic sugar over promises — async code that reads like sync code. `await` pauses *that function only*, not the thread or event loop.

```js
async function getOrders(id) {
  try {
    const user = await fetchUser(id);
    const orders = await fetchOrders(user.id);
    return orders;
  } catch (err) {
    console.error(err);
  }
}
```

### 8. Microtask Queue

Promise callbacks (`.then`, code after `await`) go into a special **microtask queue** — higher priority than timers, fully drained before the event loop moves to its next phase.

```js
console.log("1");
setTimeout(() => console.log("2 (macrotask)"), 0);
Promise.resolve().then(() => console.log("3 (microtask)"));
console.log("4");
// Output: 1, 4, 3, 2
```

Promises always cut in line ahead of `setTimeout`.

---

## Part 3 — Under the Hood

### 9. Libuv

The event loop and non-blocking I/O have to be implemented somewhere outside pure JS, because the OS — not V8 — actually reads files and manages sockets. **Libuv** is the C library that runs the event loop, talks to the OS's native async APIs (epoll/kqueue/IOCP), and reports back to V8. V8 only ever understood JavaScript; libuv is what gave Node its non-blocking nature.

### 10. Thread Pool

Some operations can't be made non-blocking at the OS level (certain `fs` calls, DNS lookups, crypto, zlib). Libuv keeps a small background **thread pool** (4 threads by default) purely to absorb this blocking work, so the main JS thread never freezes.

### 11. Event Loop Phases

The loop moves through distinct phases each cycle:

| Phase | What runs |
|---|---|
| timers | `setTimeout` / `setInterval` callbacks that are due |
| pending callbacks | certain system-level callbacks |
| poll | new I/O events and their callbacks |
| check | `setImmediate` callbacks |
| close callbacks | e.g. socket `close` events |

The microtask queue drains again after *every* callback, not just once per cycle.

### 12. Concurrency vs Parallelism

- **Concurrency**: handling many things over overlapping time, by interleaving — one thread, juggling thousands of pending operations.
- **Parallelism**: actually doing multiple things at the same literal instant — needs multiple cores/threads.

Node's core JS execution is concurrent, not parallel. That's a deliberate design choice for I/O-heavy work — true parallelism only enters via Part 5 below.

---

## Part 4 — Code Organization & Core APIs

### 13. Modules

Self-contained files that export/import functionality. Node supports CommonJS and ES Modules.

```js
// CommonJS
const fs = require("fs");
module.exports = myFunction;

// ES Modules
import fs from "fs";
export default myFunction;
```

### 14. Built-in Modules

Node ships a standard library out of the box: `fs` (filesystem), `path`, `os`, `http`, `crypto`, and more — no install needed. This is where the language actually gains hands and feet.

### 15. EventEmitter

A recurring core pattern: an object that emits named events; listeners subscribe and react. Streams, the HTTP server, and `process` are all built on this.

```js
const EventEmitter = require("events");
const emitter = new EventEmitter();

emitter.on("greet", name => console.log(`Hello, ${name}!`));
emitter.emit("greet", "World");
```

### 16. Buffers

A way to represent raw binary data — file bytes, network packets — before any text encoding is applied. JS strings aren't well-suited to raw binary; Buffers are.

```js
const buf = Buffer.from("Hello");
console.log(buf); // <Buffer 48 65 6c 6c 6f>
```

### 17. Streams

Handle data in chunks instead of loading it all into memory at once — built on EventEmitter (`data`, `end`, `error` events). Types: readable, writable, duplex, transform.

```js
const fs = require("fs");
const readStream = fs.createReadStream("bigfile.txt");

readStream.on("data", chunk => console.log("Got chunk:", chunk.length));
readStream.on("end", () => console.log("Done"));
```

This is why Node can serve a multi-gigabyte file without loading the whole thing into RAM.

### 18. HTTP Module

Lets Node act as an HTTP client or server. Requests/responses are themselves streams; the underlying socket I/O is non-blocking via libuv.

```js
const http = require("http");

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node!");
}).listen(3000);
```

Nearly every earlier concept — event loop, buffers, streams, EventEmitter — converges here.

### 19. Environment Variables

`process.env` injects configuration (port, DB URL, secrets) into a running process without hardcoding it, so the same code behaves differently across dev/staging/production.

```js
const PORT = process.env.PORT || 3000;
```

### 20. Error Handling

- Sync errors → `try/catch`
- Callback-style → error-first convention: `callback(err, data)`
- Promises/async-await → `.catch()` or `try/catch`
- Last resort → `process.on('uncaughtException', ...)`, `process.on('unhandledRejection', ...)`

```js
process.on("unhandledRejection", err => {
  console.error("Unhandled:", err);
});
```

---

## Part 5 — Scaling Beyond One Thread

### 21. Worker Threads

Everything above is concurrent, not parallel — a problem for genuinely CPU-heavy work (it would freeze the single main thread). `worker_threads` spins up real separate threads, each with its own V8 instance and event loop, communicating via message passing.

```js
const { Worker } = require("worker_threads");
const worker = new Worker("./heavy-task.js");
worker.on("message", result => console.log(result));
```

### 22. Child Processes

Spawns a fully independent OS process — even non-Node programs (a Python script, a shell command). Communicates via stdio or an IPC channel. Heavier and more isolated than worker threads.

```js
const { exec } = require("child_process");
exec("ls -la", (err, stdout) => console.log(stdout));
```

### 23. Clustering

A single Node process uses one CPU core. The `cluster` module spawns multiple Node processes sharing the same server port, distributing requests across them — turning the single-threaded model into a horizontally-scaled, multi-core server.

```js
const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
  os.cpus().forEach(() => cluster.fork());
} else {
  require("./server.js"); // each worker runs the actual app
}
```

### 24. Memory Management

V8 manages memory via garbage collection — the heap is split into generations (young, frequently collected; old, longer-lived), and unreachable objects get freed automatically. Leaks usually come from things unintentionally kept alive: a forgotten `setInterval`, an EventEmitter listener never removed, a closure holding a large object, or an ever-growing cache. This matters most for long-running servers, where a tiny leak compounds over days into a crash.

---

## Quick Reference

| # | Concept | One-line definition |
|---|---|---|
| 1 | Runtime vs Language | JS is the spec; the runtime gives it real-world powers |
| 2 | Call Stack | Single-threaded, LIFO execution of sync code |
| 3 | Sync vs Async | Blocking line-by-line vs handed-off, resumed-later work |
| 4 | Event Loop | Cycles between "run ready work" and "check what's ready" |
| 5 | Callbacks | Pass a function to run once an async op completes |
| 6 | Promises | Object representing eventual success/failure of an async op |
| 7 | Async/Await | Sync-looking syntax sitting on top of promises |
| 8 | Microtask Queue | High-priority queue for promise callbacks, drained first |
| 9 | Libuv | C library implementing the event loop & async I/O |
| 10 | Thread Pool | Libuv's background threads for unavoidable blocking ops |
| 11 | Event Loop Phases | timers → pending → poll → check → close |
| 12 | Concurrency vs Parallelism | Interleaving on one thread vs truly simultaneous execution |
| 13 | Modules | Reusable files via CommonJS or ES Modules |
| 14 | Built-in Modules | Node's standard library (`fs`, `path`, `http`, etc.) |
| 15 | EventEmitter | Emit/listen pattern underlying streams, http, process |
| 16 | Buffers | Raw binary data handling |
| 17 | Streams | Chunked data processing built on EventEmitter |
| 18 | HTTP Module | Built-in HTTP client/server, built on streams & sockets |
| 19 | Environment Variables | `process.env` for runtime configuration |
| 20 | Error Handling | try/catch, error-first callbacks, `.catch()`, process events |
| 21 | Worker Threads | Real parallel threads within one process |
| 22 | Child Processes | Spawns independent OS processes |
| 23 | Clustering | Multiple Node processes sharing one port across CPU cores |
| 24 | Memory Management | V8's automatic garbage collection & common leak sources |

---

### How this maps to a distributed task queue

The event loop and libuv handle many concurrent RabbitMQ/PostgreSQL/Redis calls without blocking. EventEmitter and streams likely sit underneath your queue message consumption. Clustering or worker threads are the path to scaling across CPU cores if needed. Careful error handling and memory awareness are what keep a long-running queue worker stable over weeks of uptime rather than days.
