const USERS_KEY = "caretaker_users";
const SESSION_KEY = "caretaker_session_user";

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

// ---- Users "DB" ----
export function getUsers() {
  return readJSON(USERS_KEY, []);
}

export function saveUsers(users) {
  writeJSON(USERS_KEY, users);
}

export function findUserByEmail(email) {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser({ fullName, age, email, description }) {
  const users = getUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Ein Konto mit dieser E-Mail existiert bereits.");

  const newUser = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    age: Number(age),
    email: email.trim(),
    description: description?.trim() || "",
    rating: 0,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// ---- Session ----
export function getSessionUser() {
  return readJSON(SESSION_KEY, null);
}

export function setSessionUser(user) {
  writeJSON(SESSION_KEY, user);
}

export function clearSessionUser() {
  localStorage.removeItem(SESSION_KEY);
}
