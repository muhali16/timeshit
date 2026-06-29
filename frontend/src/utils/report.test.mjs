// Run: node src/utils/report.test.mjs
import assert from "node:assert";
import {
  textToTasks,
  tasksToText,
  renderStandup,
  renderWrapup,
  DEFAULT_REPORT_CONFIG as cfg,
} from "./report.js";

// parse: code + title, tab or spaces separated
const tasks = textToTasks(
  "HRSS-11\tMenambah endpoint divisions\n[HRISFE-540] Rename kolom\nCatatan bebas tanpa kode",
);
assert.equal(tasks.length, 3);
assert.deepEqual(
  { code: tasks[0].code, title: tasks[0].title },
  { code: "HRSS-11", title: "Menambah endpoint divisions" },
);
assert.equal(tasks[1].code, "HRISFE-540");
assert.equal(tasks[2].code, ""); // no code -> whole line is title

// round-trip text is parseable back
assert.equal(tasksToText(tasks).split("\n").length, 3);

// standup
const su = renderStandup(
  [{ code: "ITS-626", title: "Publikasi artikel", status: "", notes: [] }],
  cfg,
);
assert.equal(su.split("\n")[0], cfg.standup.greeting);
assert.ok(su.includes("### [ITS-626] Publikasi artikel"));
assert.ok(su.includes(`* ${cfg.standup.bullet}`));

// wrapup: status -> bullet + per-task notes
const wu = renderWrapup(
  [
    {
      code: "ITS-626",
      title: "Artikel",
      status: "done",
      notes: ["Dipublish: https://x", ""],
    },
  ],
  cfg,
);
assert.ok(wu.includes("Sesudah:"));
assert.ok(wu.includes("* Task ini sudah saya kerjakan hari ini"));
assert.ok(wu.includes("* Dipublish: https://x"));
assert.ok(!wu.includes("* \n* ")); // empty note skipped

// unknown status falls back to first status, never crashes
assert.ok(renderWrapup([{ code: "X-1", title: "t", status: "bogus" }], cfg));

console.log("report.js OK");
