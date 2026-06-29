// Default per-user report config. Single source for schema default + API fallbacks.
const DEFAULT_REPORT_CONFIG = {
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

module.exports = { DEFAULT_REPORT_CONFIG };
