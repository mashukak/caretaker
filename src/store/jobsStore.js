const JOBS_KEY = "caretaker_jobs";
const JOBS_EVENT = "caretaker_jobs_changed";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function emitJobsChanged() {
  window.dispatchEvent(new Event(JOBS_EVENT));
}

export function subscribeJobs(cb) {
  const handler = () => cb(getJobs());
  window.addEventListener(JOBS_EVENT, handler);
  window.addEventListener("storage", handler); // якщо відкрито у 2 вкладках
  return () => {
    window.removeEventListener(JOBS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getJobs() {
  return readJSON(JOBS_KEY, []);
}

export function saveJobs(jobs) {
  writeJSON(JOBS_KEY, jobs);
  emitJobsChanged();
}

export function getJobById(id) {
  return getJobs().find((j) => j.id === id) || null;
}

export function createJob(job) {
  const jobs = getJobs();

  const newJob = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "open", // open | booked | done
    isDemo: false,
    bookedById: null,
    bookedByName: null,
    booking: null,
    ...job,
  };

  jobs.push(newJob);
  saveJobs(jobs);
  return newJob;
}

export function bookJob(jobId, { bookedById, bookedByName, booking }) {
  const jobs = getJobs();
  const idx = jobs.findIndex((j) => j.id === jobId);
  if (idx === -1) throw new Error("Job nicht gefunden.");

  const job = jobs[idx];
  if (job.status !== "open") throw new Error("Dieser Job ist nicht verfügbar.");

  jobs[idx] = {
    ...job,
    status: "booked",
    bookedById,
    bookedByName,
    booking, // {date, from, to}
  };

  saveJobs(jobs);
  return jobs[idx];
}

export function getBookedJobsForUser(userId) {
  return getJobs().filter((j) => j.status === "booked" && j.bookedById === userId);
}
