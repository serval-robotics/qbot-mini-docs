// Photograph a page, optionally scrolled, and read geometry out of it.
//
// Chromium's --screenshot flag captures whatever is painted at load and cannot
// scroll, so faults at the foot of a page are invisible to it. This drives the
// same browser over the DevTools protocol instead, which can scroll, wait for
// fonts, and measure elements. Node 22+ has a WebSocket built in, so this needs
// nothing installed.
//
//   node scripts/shoot.mjs --url URL --out FILE [--scroll bottom|N] [--size WxH]
//   node scripts/shoot.mjs --url URL --measure '.md-sidebar,.md-footer'
//
// --measure prints each selector's bounding box after the scroll, which is how
// an overlap gets confirmed rather than guessed at.

import { spawn } from "node:child_process";
import { writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
}

function findBrowser() {
  if (process.env.BROWSER) return process.env.BROWSER;
  const root = join(process.env.HOME, ".cache/ms-playwright");
  const dirs = readdirSync(root)
    .filter((d) => d.startsWith("chromium"))
    .sort();
  for (const d of dirs.reverse()) {
    for (const rel of [
      "chrome-linux/chrome",
      "chrome-headless-shell-linux64/chrome-headless-shell",
    ]) {
      const p = join(root, d, rel);
      try {
        if (statSync(p).isFile()) return p;
      } catch {}
    }
  }
  throw new Error("no chromium found; set BROWSER");
}

const [width, height] = (args.size || "1440x1000").split("x").map(Number);

const browser = spawn(findBrowser(), [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--remote-debugging-port=0",
  `--window-size=${width},${height}`,
  "about:blank",
]);

const endpoint = await new Promise((resolve, reject) => {
  let buf = "";
  const timer = setTimeout(() => reject(new Error("browser did not start")), 20000);
  browser.stderr.on("data", (chunk) => {
    buf += chunk;
    const m = buf.match(/ws:\/\/[^\s]+/);
    if (m) {
      clearTimeout(timer);
      resolve(m[0]);
    }
  });
});

const ws = new WebSocket(endpoint);
await new Promise((r) => ws.addEventListener("open", r));

let nextId = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id !== undefined && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  } else if (msg.method) {
    events.push(msg);
  }
});

function send(method, params = {}, sessionId) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (m, p) => send(m, p, sessionId);

await call("Page.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: false,
});

// Material picks its palette from prefers-color-scheme, so emulating the
// preference photographs the dark site without building a second copy of it.
if (args.scheme === "dark") {
  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "dark" }],
  });
}

await call("Page.navigate", { url: args.url });
await new Promise((r) => setTimeout(r, 3000));

// Webfonts land after load and change every height on the page, so nothing is
// measured until they have settled.
await call("Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true });

if (args.scroll) {
  const to = args.scroll === "bottom" ? "document.body.scrollHeight" : args.scroll;
  await call("Runtime.evaluate", {
    expression: `window.scrollTo({top: ${to}, behavior: 'instant'})`,
  });
  // Material recomputes the sidebar on scroll; give it a few frames to react.
  await new Promise((r) => setTimeout(r, 1200));
}

if (args.measure) {
  const expression = `JSON.stringify(${JSON.stringify(
    args.measure.split(",")
  )}.map(s => {
    const el = document.querySelector(s);
    if (!el) return {selector: s, missing: true};
    const r = el.getBoundingClientRect();
    return {selector: s, top: Math.round(r.top), bottom: Math.round(r.bottom),
            left: Math.round(r.left), height: Math.round(r.height)};
  }))`;
  const { result } = await call("Runtime.evaluate", { expression, returnByValue: true });
  console.log(result.value);
}

if (args.eval) {
  const { result } = await call("Runtime.evaluate", {
    expression: args.eval,
    returnByValue: true,
  });
  console.log(JSON.stringify(result.value));
}

if (args.out) {
  const { data } = await call("Page.captureScreenshot", { format: "png" });
  writeFileSync(args.out, Buffer.from(data, "base64"));
  console.log(args.out);
}

ws.close();
browser.kill();
