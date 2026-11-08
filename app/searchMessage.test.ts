import assert from "node:assert/strict";
import { test } from "node:test";
import { SEARCH_TRIGGER, splitNames } from "../lib/line/handler.ts";
import { SEARCH_TEXT, searchMessage } from "./searchMessage.ts";

test("the page's text starts with the bot's trigger", () => {
  assert.equal(SEARCH_TEXT, SEARCH_TRIGGER);
});

test("names are comma separated, and the bot's splitter reads them back", () => {
  const text = searchMessage([{ th: "ไข่" }, { th: "หมู" }, { th: "กระเทียม" }]);
  assert.equal(text, "หาเมนูจาก ไข่, หมู, กระเทียม");
  assert.deepEqual(splitNames(text.slice(SEARCH_TRIGGER.length)), ["ไข่", "หมู", "กระเทียม"]);
});

test("at most 20 names, like the bot", () => {
  const many = Array.from({ length: 25 }, (_, n) => ({ th: `ก${n}` }));
  assert.equal(searchMessage(many).split(", ").length, 20);
});
