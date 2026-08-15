const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory task store (fine for a demo app; swap for a real DB in production)
let tasks = [
  { id: 1, title: "Set up EKS cluster", done: true },
  { id: 2, title: "Wire up GitHub Actions", done: false },
];
let nextId = 3;

const GIT_SHA = process.env.GIT_SHA || "local-dev";
const DEPLOYED_AT = process.env.DEPLOYED_AT || new Date().toISOString();

app.get("/", (req, res) => {
  res.render("index", { tasks, gitSha: GIT_SHA, deployedAt: DEPLOYED_AT });
});

app.post("/tasks", (req, res) => {
  const title = (req.body.title || "").trim();
  if (title) tasks.push({ id: nextId++, title, done: false });
  res.redirect("/");
});

app.post("/tasks/:id/toggle", (req, res) => {
  const t = tasks.find((t) => t.id === Number(req.params.id));
  if (t) t.done = !t.done;
  res.redirect("/");
});

app.post("/tasks/:id/delete", (req, res) => {
  tasks = tasks.filter((t) => t.id !== Number(req.params.id));
  res.redirect("/");
});

// JSON API (useful for smoke tests in the pipeline)
app.get("/api/tasks", (req, res) => res.json(tasks));

// Kubernetes probes
app.get("/healthz", (req, res) => res.status(200).send("ok"));
app.get("/readyz", (req, res) => res.status(200).send("ready"));

// Shows exactly which build is live — refresh after each deploy to confirm it worked
app.get("/version", (req, res) =>
  res.json({ gitSha: GIT_SHA, deployedAt: DEPLOYED_AT })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TaskFlow listening on :${PORT}`));