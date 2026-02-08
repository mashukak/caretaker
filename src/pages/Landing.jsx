import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const SLOGANS = [
  "Hilfe, wenn du sie brauchst. Arbeit, wenn du willst.",
  "Wir verbinden Hilfe mit Menschen, die helfen.",
  "Hilfe in deiner Nähe. Einfach und zuverlässig.",
  "Lokale Hilfe. Echte Menschen. Echte Unterstützung.",
  "Weil Fürsorge gemeinsam besser ist.",
  "Geld verdienen, indem du anderen hilfst.",
  "Flexible Arbeit mit echtem Sinn.",
  "Kleine Hilfe. Große Wirkung.",
];

function FloatingCard({ text, className, style }) {
  return (
    <motion.div
      className={`hero-pro-card ${className}`}
      style={style}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7 }}
      whileHover={{ scale: 1.03 }}
    >
      {text}
    </motion.div>
  );
}

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBegin = () => {
    if (user) navigate("/home");
    else navigate("/auth");
  };

  // parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });

  const p1x = useTransform(sx, (v) => v * 0.7);
  const p1y = useTransform(sy, (v) => v * 0.7);

  const p2x = useTransform(sx, (v) => v * -0.45);
  const p2y = useTransform(sy, (v) => v * -0.45);

  const p3x = useTransform(sx, (v) => v * 0.3);
  const p3y = useTransform(sy, (v) => v * -0.3);

  // floating always
  const floatA = useMemo(
    () => ({
      animate: { y: [0, -10, 0] },
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    }),
    []
  );

  const floatB = useMemo(
    () => ({
      animate: { y: [0, 12, 0] },
      transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
    }),
    []
  );

  const floatC = useMemo(
    () => ({
      animate: { y: [0, -14, 0] },
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
    }),
    []
  );

  const cards = [
    { text: SLOGANS[0], cls: "c1", x: p1x, y: p1y, float: floatA },
    { text: SLOGANS[1], cls: "c2", x: p2x, y: p2y, float: floatB },
    { text: SLOGANS[2], cls: "c3", x: p3x, y: p3y, float: floatC },
    { text: SLOGANS[4], cls: "c4", x: p2x, y: p1y, float: floatA },
    { text: SLOGANS[5], cls: "c5", x: p1x, y: p2y, float: floatB },
    { text: SLOGANS[7], cls: "c6", x: p3x, y: p3y, float: floatC },
  ];

  return (
    <section
      className="hero-pro"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        mx.set(x * 32);
        my.set(y * 32);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <div className="hero-pro-inner">
        <div className="hero-pro-left">
          <motion.div
            className="hero-pro-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Care made local 🦦
          </motion.div>

          <motion.h1
            className="hero-pro-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06 }}
          >
            Caretaker
          </motion.h1>

          <motion.p
            className="hero-pro-subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            Hilfe in deiner Nähe – schnell, einfach und zuverlässig.
            Finde Unterstützung oder verdiene Geld mit Jobs, die wirklich Sinn machen.
          </motion.p>

          <motion.div
            className="hero-pro-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <button className="btn-primary" onClick={handleBegin}>
              Begin now
            </button>

            <button className="btn-secondary" onClick={() => navigate("/jobs")}>
              Jobs ansehen
            </button>
          </motion.div>
        </div>

        <div className="hero-pro-right">
          <div className="hero-pro-glow" />
          <div className="hero-pro-cards">
            {cards.map((c, idx) => (
              <motion.div key={idx} {...c.float} style={{ x: c.x, y: c.y }}>
                <FloatingCard text={c.text} className={c.cls} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Landing;
