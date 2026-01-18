import { getJobs, saveJobs } from "./jobsStore";

// Helene-Lange-Gymnasium, Ritterstraße 12, Rendsburg :contentReference[oaicite:1]{index=1}
// Координати з Wikidata: 54°17'54"N, 9°39'36"E ≈ (54.298333, 9.66) :contentReference[oaicite:2]{index=2}
const CENTER = { lat: 54.298333, lng: 9.66 };

const DEMO_OWNER = { id: "demo-owner-rendsburg", name: "Caretaker Demo" };

const BASE = {
  address: "Helene-Lange-Gymnasium, Ritterstraße 12, 24768 Rendsburg",
  date: new Date().toISOString().slice(0, 10),
  timeFrom: "13:00",
  timeTo: "18:00",
  currency: "EUR",
};

const DEMO_DEFS = [
  // 🐕 DOGS
  { title: "Hund ausführen (30 Min)", category: "animals", pricePerHour: 12 },
  { title: "Hundesitting nach der Schule", category: "animals", pricePerHour: 14 },
  { title: "Mit Hund spielen (1 Std)", category: "animals", pricePerHour: 11 },

  // 👵 SENIORS
  { title: "Seniorin begleiten (Spaziergang)", category: "elderly", pricePerHour: 15 },
  { title: "Einkaufen für Rentner", category: "elderly", pricePerHour: 13 },
  { title: "Gesellschaft leisten (1–2 Std)", category: "elderly", pricePerHour: 14 },

  // 👶 KIDS
  { title: "Babysitting (2 Std)", category: "kids", pricePerHour: 16 },
  { title: "Kinder abholen & nach Hause bringen", category: "kids", pricePerHour: 15 },
  { title: "Hausaufgabenhilfe (1 Std)", category: "kids", pricePerHour: 14 },
  { title: "Spielen/Betreuung am Nachmittag", category: "kids", pricePerHour: 13 },
];

function jitterCoord(base, meters) {
  // дуже простий “зсув” для демо (не геодезія, але ок)
  const dLat = (Math.random() - 0.5) * (meters / 111000);
  const dLng = (Math.random() - 0.5) * (meters / 70000);
  return { lat: base.lat + dLat, lng: base.lng + dLng };
}

export function seedDemoJobsAlways10() {
  const jobs = getJobs();

  const userJobs = jobs.filter((j) => !j.isDemo);
  const existingDemo = jobs.filter((j) => j.isDemo);

  // Мапа існуючих демо по demoIndex
  const byIndex = new Map();
  existingDemo.forEach((j) => {
    if (typeof j.demoIndex === "number") byIndex.set(j.demoIndex, j);
  });

  const demoJobs = DEMO_DEFS.map((def, i) => {
    // якщо демо job з таким індексом вже існує — НЕ чіпаємо статус/booking
    const existing = byIndex.get(i);
    if (existing) return existing;

    const pos = jitterCoord(CENTER, 600); // ~600м довкола школи

    return {
      id: `demo-${i}`,
      demoIndex: i,
      isDemo: true,
      status: "open",
      createdAt: new Date().toISOString(),

      ownerId: DEMO_OWNER.id,
      ownerName: DEMO_OWNER.name,

      title: def.title,
      description: "Demo-Anzeige für Präsentation (Schulprojekt).",
      category: def.category,

      ...BASE,
      pricePerHour: def.pricePerHour,

      // для Google Map
      lat: pos.lat,
      lng: pos.lng,
    };
  });

  // лишаємо тільки демо, що входять у 0..9 (рівно 10)
  saveJobs([...userJobs, ...demoJobs]);
}
