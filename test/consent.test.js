import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";

const source = fs.readFileSync(path.resolve(import.meta.dirname, "../src/assets/js/consent.js"), "utf8");

function harness({ choice, measurementId = "G-MYEYDB0G8G", defineGtag = true } = {}) {
  const timeline = [];
  const storage = new Map();
  if (choice) storage.set("fiscalhour-analytics-consent", choice);
  const banner = {
    id: "consent-banner",
    hidden: true,
    contains() {
      return false;
    },
  };
  const buttons = {};
  for (const id of ["consent-accept", "consent-decline", "consent-withdraw", "consent-allow"]) {
    buttons[id] = { id, parentNode: banner };
  }
  const listeners = {};
  const document = {
    getElementById(id) {
      if (id === "consent-banner") return banner;
      if (id === "main") return { focus() {} };
      return null;
    },
    querySelector(selector) {
      if (selector === "script[data-ga-measurement-id]") {
        return { getAttribute: () => measurementId };
      }
      return null;
    },
    createElement() {
      return { async: false, src: "" };
    },
    head: {
      appendChild(node) {
        timeline.push(["script", node.src]);
      },
    },
    addEventListener(type, fn) {
      listeners[type] = fn;
    },
    activeElement: null,
  };
  const sandbox = {
    document,
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value)),
    },
  };
  sandbox.window = { dataLayer: [], document };
  if (defineGtag) {
    sandbox.window.gtag = function () {
      timeline.push(["gtag", Array.from(arguments)]);
    };
  }
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return {
    banner,
    storage,
    timeline,
    dataLayer: sandbox.window.dataLayer,
    click(id) {
      listeners.click({ target: buttons[id] });
    },
  };
}

function gtagCalls(timeline) {
  return timeline.filter((entry) => entry[0] === "gtag").map((entry) => entry[1]);
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("a visitor with no choice sees the banner and does not load Google Analytics", () => {
  const page = harness();
  assert.equal(page.banner.hidden, false);
  assert.deepEqual(gtagCalls(page.timeline), []);
  assert.equal(page.timeline.some((entry) => entry[0] === "script"), false);
});

test("decline stores the choice and loads nothing", () => {
  const page = harness();
  page.click("consent-decline");
  assert.equal(page.storage.get("fiscalhour-analytics-consent"), "declined");
  assert.equal(page.banner.hidden, true);
  assert.deepEqual(gtagCalls(page.timeline), []);
  assert.equal(page.timeline.some((entry) => entry[0] === "script"), false);
});

test("accept grants analytics storage and only then loads gtag.js", () => {
  const page = harness();
  page.click("consent-accept");
  assert.equal(page.storage.get("fiscalhour-analytics-consent"), "accepted");
  assert.equal(page.banner.hidden, true);
  const updateAt = page.timeline.findIndex(
    (entry) => entry[0] === "gtag" && entry[1][0] === "consent" && entry[1][1] === "update",
  );
  const scriptAt = page.timeline.findIndex((entry) => entry[0] === "script");
  const configAt = page.timeline.findIndex((entry) => entry[0] === "gtag" && entry[1][0] === "config");
  assert.ok(updateAt !== -1 && scriptAt !== -1 && configAt !== -1);
  assert.ok(updateAt < scriptAt);
  assert.ok(scriptAt < configAt);
  assert.deepEqual(plain(page.timeline[updateAt][1][2]), { analytics_storage: "granted" });
  assert.equal(page.timeline[scriptAt][1], "https://www.googletagmanager.com/gtag/js?id=G-MYEYDB0G8G");
  assert.equal(page.timeline[configAt][1][1], "G-MYEYDB0G8G");
  assert.equal(page.timeline.filter((entry) => entry[0] === "script").length, 1);
});

test("a remembered accept loads the tag without the banner", () => {
  const page = harness({ choice: "accepted" });
  assert.equal(page.banner.hidden, true);
  assert.equal(
    page.timeline.some((entry) => entry[0] === "script" && entry[1].includes("googletagmanager.com/gtag/js")),
    true,
  );
});

test("a remembered decline keeps the tag unloaded", () => {
  const page = harness({ choice: "declined" });
  assert.equal(page.banner.hidden, true);
  assert.equal(page.timeline.some((entry) => entry[0] === "script"), false);
  assert.equal(gtagCalls(page.timeline).some((call) => call[0] === "config"), false);
});

test("withdraw denies analytics storage again and does not load the tag", () => {
  const page = harness();
  page.click("consent-withdraw");
  assert.equal(page.storage.get("fiscalhour-analytics-consent"), "declined");
  assert.equal(page.timeline.some((entry) => entry[0] === "script"), false);
  const updates = gtagCalls(page.timeline).filter((call) => call[0] === "consent" && call[1] === "update");
  assert.equal(updates.length, 1);
  assert.deepEqual(plain(updates[0][2]), {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
});

test("allowing analytics from the privacy control loads the tag once", () => {
  const page = harness({ choice: "declined" });
  page.click("consent-allow");
  assert.equal(page.storage.get("fiscalhour-analytics-consent"), "accepted");
  assert.equal(page.timeline.filter((entry) => entry[0] === "script").length, 1);
  page.click("consent-allow");
  assert.equal(page.timeline.filter((entry) => entry[0] === "script").length, 1);
});

test("an invalid measurement id never loads the tag", () => {
  const page = harness({ measurementId: "UA-1" });
  page.click("consent-accept");
  assert.equal(page.timeline.some((entry) => entry[0] === "script"), false);
  assert.equal(gtagCalls(page.timeline).some((call) => call[0] === "config"), false);
});

test("the consent stub sets denied defaults before config when gtag is missing", () => {
  const page = harness({ choice: "accepted", defineGtag: false });
  const calls = page.dataLayer.map((args) => plain(Array.from(args)));
  assert.deepEqual(calls[0], [
    "consent",
    "default",
    {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    },
  ]);
  const config = calls.find((call) => call[0] === "config");
  assert.ok(config);
  assert.ok(calls.indexOf(calls[0]) < calls.indexOf(config));
  assert.equal(
    page.timeline.some((entry) => entry[0] === "script" && entry[1].includes("id=G-MYEYDB0G8G")),
    true,
  );
});
