// Structured tasks <-> report text. Pure, deterministic, no AI.

export const DEFAULT_REPORT_CONFIG = {
  marker: "###",
  bullet: "*",
  standup: {
    greeting:
      "Selamat pagi, Pak. Berikut task list yang akan saya kerjakan hari ini.",
    bullet: "Task ini akan saya kerjakan hari ini",
  },
  wrapup: {
    greeting: "Selamat malam, Pak. Berikut wrap up yang saya kerjakan hari ini.",
    sublabel: "Sesudah:",
    defaultStatus: "done_pr",
    statuses: [
      {
        id: "done_pr",
        label: "Selesai & PR",
        bullet: "Task ini sudah saya kerjakan hari ini dan sudah di PR",
      },
      { id: "done", label: "Selesai", bullet: "Task ini sudah saya kerjakan hari ini" },
      { id: "progress", label: "Dikerjakan", bullet: "Task ini sedang saya kerjakan" },
    ],
  },
};

// Matches "HRSS-11", "[HRISFE-540]", with the rest as the title.
const CODE_RE = /^\s*\[?([A-Z][A-Z0-9]*-\d+)\]?[\s:.\-]+(.+)$/;

export function makeTask(overrides = {}) {
  return { code: "", title: "", status: "", notes: [], ...overrides };
}

// Parse pasted/legacy text (one task per line) into structured tasks.
export function textToTasks(text) {
  return (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(CODE_RE);
      return m
        ? makeTask({ code: m[1], title: m[2].trim() })
        : makeTask({ title: line });
    });
}

// Plain-text rendering stored as `rincian_tugas` so History/Home/Excel keep working.
export function tasksToText(tasks) {
  return (tasks || [])
    .filter((t) => t.code || t.title)
    .map((t) => (t.code ? `[${t.code}] ${t.title}` : t.title))
    .join("\n");
}

function taskHeader(t, marker) {
  return t.code ? `${marker} [${t.code}] ${t.title}` : `${marker} ${t.title}`;
}

export function renderStandup(tasks, cfg = DEFAULT_REPORT_CONFIG) {
  const marker = cfg.marker || "###";
  const bullet = cfg.bullet || "*";
  const lines = [cfg.standup.greeting];
  for (const t of tasks) {
    if (!t.code && !t.title) continue;
    lines.push(taskHeader(t, marker));
    if (cfg.standup.bullet) lines.push(`${bullet} ${cfg.standup.bullet}`);
  }
  return lines.join("\n");
}

export function renderWrapup(tasks, cfg = DEFAULT_REPORT_CONFIG) {
  const marker = cfg.marker || "###";
  const bullet = cfg.bullet || "*";
  const statuses = cfg.wrapup.statuses || [];
  const lines = [cfg.wrapup.greeting];
  for (const t of tasks) {
    if (!t.code && !t.title) continue;
    lines.push(taskHeader(t, marker));
    if (cfg.wrapup.sublabel) lines.push(cfg.wrapup.sublabel);
    const st = statuses.find((s) => s.id === t.status) || statuses[0];
    if (st?.bullet) lines.push(`${bullet} ${st.bullet}`);
    for (const note of t.notes || []) {
      if (note.trim()) lines.push(`${bullet} ${note.trim()}`);
    }
  }
  return lines.join("\n");
}
