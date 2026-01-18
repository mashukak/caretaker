const JOBS_KEY = "caretaker_jobs";

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

export function getJobs() {
  return readJSON(JOBS_KEY, []);
}

export function saveJobs(jobs) {
  writeJSON(JOBS_KEY, jobs);
}

export function createJob(job) {
  const jobs = getJobs();

  const newJob = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "open",
    isDemo: false,
    ...job,
  };

  jobs.push(newJob);
  saveJobs(jobs);
  return newJob;
}
