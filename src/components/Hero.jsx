import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useMemo } from "react";

const SLOGANS = [
  "Hilfe, wenn du sie brauchst. Arbeit, wenn du willst.",
  "Wir verbinden Hilfe mit Menschen, die helfen.",
  "Hilfe in deiner Nähe. Einfach und zuverlässig.",
  "Lokale Hilfe. Echte Menschen. Echte Unterstützung.",
  "Geld verdienen, indem du anderen hilfst.",
  "Flexible Arbeit mit echtem Sinn.",
  "Weil Fürsorge gemeinsam besser ist.",
  "Kleine Hilfe. Große Wirkung.",
];

function FloatingCard({ text, className, style, delay = 0 }) {
  return (
    <motion.div
      className={`hero-card ${className || ""}`}
      style={style}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.03 }}
    >
      {text}
    </motion.div>
  );
}

export default function Hero({ onBegin }) {
  // Parallax (реагує на рух мишки)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });

  const p1x = useTransform(sx, (v) => v * 0.6);
  const p1y = useTransform(sy, (v) => v * 0.6);

  const p2x = useTransform(sx, (v) => v * -0.35);
  const p2y = useTransform(sy, (v) => v * -0.35);

  const p3x = useTransform(sx, (v) => v * 0.25);
  const p3y = useTransform(sy, (v) => v * -0.25);

  const cards = useMemo(() => {
    // беремо 6-7 слоганів для “плаваючих” карток
    return [
      { text: SLOGANS[0], cls: "c1", x: p1x, y: p1y, d: 0.05 },
      { text: SLOGANS[1], cls: "c2", x: p2x, y: p2y, d: 0.12 },
      { text: SLOGANS[2], cls: "c3", x: p3x, y: p3y, d: 0.18 },
      { text: SLOGANS[4], cls: "c4", x: p2x, y: p1y, d: 0.24 },
      { text: SLOGANS[6], cls: "c5", x: p1x, y: p2y, d: 0.30 },
      { text: SLOGANS[7], cls: "c6", x: p3x, y: p1y, d: 0.36 },
    ];
  }, [p1x, p1y, p2x, p2y, p3x, p3y]);

  return (
    <section
      className="hero"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
        const y = (e.clientY - r.top) / r.height - 0.5;
        mx.set(x * 30);
        my.set(y * 30);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <div className="hero-inner">
        <div className="hero-left">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Caretaker
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            Hilfe in deiner Nähe – schnell, einfach und vertrauenswürdig.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="hero-actions"
          >
            <button className="btn-primary" onClick={onBegin}>
              Begin now
            </button>
            <button className="btn-secondary" onClick={() => window.scrollTo({ top: 900, behavior: "smooth" })}>
              Mehr erfahren
            </button>
          </motion.div>
        </div>

        <div className="hero-right">
          <div className="hero-glow" />
          <div className="hero-cards">
            {cards.map((c, idx) => (
              <FloatingCard
                key={idx}
                text={c.text}
                className={c.cls}
                delay={c.d}
                style={{ x: c.x, y: c.y }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
