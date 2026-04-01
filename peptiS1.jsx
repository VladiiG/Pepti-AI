import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ─── Hex Logo (unchanged) ─────────────────────────────────────────────────────
function HexLogo({ size = 40 }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const pts = [
    [cx, cy - s * 0.38],
    [cx + s * 0.33, cy - s * 0.19],
    [cx + s * 0.33, cy + s * 0.19],
    [cx, cy + s * 0.38],
    [cx - s * 0.33, cy + s * 0.19],
    [cx - s * 0.33, cy - s * 0.19],
  ];
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      {pts.map((p, i) => {
        const next = pts[(i + 1) % pts.length];
        return <line key={`l${i}`} x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]} stroke="#60A5FA" strokeWidth={s * 0.04} opacity="0.9" />;
      })}
      <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[3][0]} y2={pts[3][1]} stroke="#93C5FD" strokeWidth={s * 0.025} opacity="0.35" />
      <line x1={pts[1][0]} y1={pts[1][1]} x2={pts[4][0]} y2={pts[4][1]} stroke="#93C5FD" strokeWidth={s * 0.025} opacity="0.35" />
      <line x1={pts[2][0]} y1={pts[2][1]} x2={pts[5][0]} y2={pts[5][1]} stroke="#93C5FD" strokeWidth={s * 0.025} opacity="0.35" />
      {pts.map((p, i) => <circle key={`c${i}`} cx={p[0]} cy={p[1]} r={s * 0.07} fill="#60A5FA" />)}
      <circle cx={cx} cy={cy} r={s * 0.09} fill="#3B82F6" />
    </svg>
  );
}

// ─── Glass Input ──────────────────────────────────────────────────────────────
function GlassInput({ label, type = "text", value, onChange, placeholder, options }) {
  const [focused, setFocused] = useState(false);

  const base = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused ? "rgba(96,165,250,0.85)" : "rgba(96,165,250,0.28)"}`,
    boxShadow: focused ? "0 0 18px rgba(96,165,250,0.14), inset 0 0 10px rgba(96,165,250,0.04)" : "none",
    color: "#E2E8F0",
    padding: "13px 16px",
    fontSize: 12,
    letterSpacing: "0.06em",
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    fontWeight: 300,
    outline: "none",
    borderRadius: 0,
    boxSizing: "border-box",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    width: "100%",
  };

  return (
    <div style={{ marginBottom: 18, width: "100%" }}>
      <div style={{
        fontSize: 9,
        letterSpacing: "0.22em",
        color: "rgba(147,197,253,0.6)",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        marginBottom: 7,
        textTransform: "uppercase",
      }}>
        {label}
      </div>
      {options ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...base, appearance: "none", cursor: "pointer" }}
        >
          <option value="" disabled style={{ background: "#040c1a" }}>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ background: "#040c1a", color: "#E2E8F0" }}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={base}
        />
      )}
    </div>
  );
}

// ─── Step Progress Dots ───────────────────────────────────────────────────────
function StepDots({ current, total = 3 }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current - 1 ? 22 : 6,
          height: 6,
          borderRadius: 3,
          background: i === current - 1 ? "#60A5FA" : "rgba(96,165,250,0.22)",
          transition: "all 0.45s ease",
          boxShadow: i === current - 1 ? "0 0 10px rgba(96,165,250,0.5)" : "none",
        }} />
      ))}
    </div>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────
function BackBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none",
        border: "none",
        color: hov ? "rgba(147,197,253,0.85)" : "rgba(147,197,253,0.38)",
        fontSize: 9,
        letterSpacing: "0.22em",
        fontFamily: "'Inter', sans-serif",
        cursor: "pointer",
        marginBottom: 20,
        padding: 0,
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "color 0.25s ease",
      }}
    >
      ← BACK
    </button>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const PANEL = {
  background: "rgba(4,12,26,0.75)",
  border: "1px solid rgba(96,165,250,0.16)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  padding: "40px 44px 44px",
  width: 400,
  boxSizing: "border-box",
  pointerEvents: "all",
};

const BTN = {
  width: "100%",
  background: "transparent",
  border: "1px solid rgba(96,165,250,0.4)",
  color: "#93C5FD",
  padding: "13px 0",
  fontSize: 10,
  letterSpacing: "0.3em",
  textIndent: "0.3em",
  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
  fontWeight: 400,
  borderRadius: 0,
  cursor: "pointer",
  marginTop: 6,
};

const HEADING = {
  color: "#FFFFFF",
  fontSize: 19,
  fontWeight: 800,
  letterSpacing: "0.24em",
  textIndent: "0.24em",
  margin: "0 0 6px 0",
  textAlign: "center",
  fontFamily: "'Montserrat', sans-serif",
  textShadow: "0 0 28px rgba(37,99,235,0.45)",
};

const SUB = {
  color: "rgba(147,197,253,0.5)",
  fontSize: 9,
  letterSpacing: "0.2em",
  textIndent: "0.2em",
  textAlign: "center",
  marginBottom: 28,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 400,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PeptiOnboarding() {
  const mountRef = useRef(null);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "", password: "",
    firstName: "", lastName: "",
    role: "", goal: "",
  });

  // ── Three.js — mounted once, persists across all steps ──────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040c1a);
    scene.fog = new THREE.FogExp2(0x040c1a, 0.055);

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
    camera.position.set(0, 0.5, 11.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    const N = 28, TURNS = 2.6, RAD = 2.05, HGHT = 10.2;
    const makeStrand = (phase) => {
      const pts = [];
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const angle = t * Math.PI * 2 * TURNS + phase;
        pts.push(new THREE.Vector3(RAD * Math.cos(angle), t * HGHT - HGHT / 2, RAD * Math.sin(angle)));
      }
      return pts;
    };

    const s1 = makeStrand(0);
    const s2 = makeStrand(Math.PI);

    const strandMat = new THREE.MeshBasicMaterial({ color: 0x1a3a8f, transparent: true, opacity: 0.45 });
    [s1, s2].forEach(strand => {
      const curve = new THREE.CatmullRomCurve3(strand, false, "catmullrom", 0.15);
      helixGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 180, 0.042, 7, false), strandMat));
    });

    const nodeColorsA = [0x3B82F6, 0x60A5FA, 0x818CF8, 0x3B82F6, 0x60A5FA, 0x818CF8];
    const nodeSizes   = [0.14, 0.17, 0.13, 0.16, 0.13, 0.16];
    [s1, s2].forEach((strand, si) => {
      strand.forEach((pos, i) => {
        const idx = (i + si * 3) % nodeColorsA.length;
        const r = nodeSizes[idx], col = nodeColorsA[idx];
        const halo = new THREE.Mesh(new THREE.SphereGeometry(r * 3.2, 12, 10),
          new THREE.MeshBasicMaterial({ color: 0x0a1a3a, transparent: true, opacity: 0.38, blending: THREE.NormalBlending, depthWrite: false }));
        halo.position.copy(pos); helixGroup.add(halo);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(r * 1.9, 12, 10),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false }));
        glow.position.copy(pos); helixGroup.add(glow);
        const node = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), new THREE.MeshBasicMaterial({ color: col }));
        node.position.copy(pos); helixGroup.add(node);
        const spec = new THREE.Mesh(new THREE.SphereGeometry(r * 0.38, 8, 6),
          new THREE.MeshBasicMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.38 }));
        spec.position.set(pos.x - r * 0.28, pos.y + r * 0.28, pos.z + r * 0.18);
        helixGroup.add(spec);
      });
    });

    const rungMat = new THREE.LineBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.22 });
    for (let i = 0; i < N; i += 3) {
      helixGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([s1[i], s2[i]]), rungMat));
      const mid = new THREE.Vector3().addVectors(s1[i], s2[i]).multiplyScalar(0.5);
      const mn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.5 }));
      mn.position.copy(mid); helixGroup.add(mn);
    }

    const pCount = 180, pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x60A5FA, size: 0.022, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    setTimeout(() => setVisible(true), 300);

    let animId, t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.005;
      helixGroup.rotation.y = t * 0.25;
      helixGroup.position.y = Math.sin(t * 0.32) * 0.15;
      camera.position.x = Math.sin(t * 0.07) * 0.3;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const nW = container.clientWidth, nH = container.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // ── Step navigation with cross-fade ────────────────────────────────────────
  const goTo = useCallback((next) => {
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 380);
  }, []);

  const set = (key) => (val) => setFormData(f => ({ ...f, [key]: val }));

  // fade-in helper — delay offset in seconds
  const fi = (d = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.85s ease ${d}s, transform 0.85s ease ${d}s`,
  });

  // ── Screens ─────────────────────────────────────────────────────────────────
  const screens = {

    // Step 0 — Landing (original)
    0: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ marginBottom: 22, ...fi(0) }}><HexLogo size={40} /></div>
        <h1 style={{
          color: "#FFFFFF", fontSize: 52, fontWeight: 800,
          letterSpacing: "0.32em", textIndent: "0.32em",
          margin: 0, fontFamily: "'Montserrat', 'Helvetica Neue', sans-serif",
          textShadow: "0 0 40px rgba(37,99,235,0.45), 0 2px 8px rgba(0,0,0,0.95)",
          ...fi(0.3),
        }}>PEPTI AI</h1>
        <p className="pepti-sub" style={{
          color: "#93C5FD", fontSize: 11, letterSpacing: "0.28em",
          textIndent: "0.28em", marginTop: 14, marginBottom: 0,
          fontWeight: 400, fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
          ...fi(0.6),
        }}>PEPTIDE CONSULTING</p>
        <div style={{ marginTop: 42, pointerEvents: "all", ...fi(0.9) }}>
          <button
            className="pepti-enter"
            onClick={() => goTo(1)}
            style={{
              background: "transparent",
              border: "1px solid rgba(96,165,250,0.4)",
              color: "#93C5FD",
              padding: "14px 52px",
              fontSize: 11, letterSpacing: "0.28em", textIndent: "0.28em",
              fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
              fontWeight: 400, borderRadius: 0, cursor: "pointer",
              transition: "background 0.3s ease, color 0.3s ease",
            }}
          >BUILD YOUR PROTOCOL</button>
        </div>
      </div>
    ),

    // Step 1 — Sign Up
    1: (
      <div style={PANEL}>
        <div style={fi(0)}><StepDots current={1} /></div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, ...fi(0.05) }}>
          <HexLogo size={26} />
        </div>
        <h2 style={{ ...HEADING, ...fi(0.1) }}>CREATE ACCOUNT</h2>
        <p style={{ ...SUB, ...fi(0.15) }}>BEGIN YOUR PROTOCOL JOURNEY</p>

        <div style={fi(0.2)}>
          <GlassInput label="Email Address" type="email" value={formData.email}
            onChange={set("email")} placeholder="you@domain.com" />
        </div>
        <div style={fi(0.26)}>
          <GlassInput label="Password" type="password" value={formData.password}
            onChange={set("password")} placeholder="••••••••••••" />
        </div>
        <div style={fi(0.32)}>
          <button className="pepti-enter" style={BTN} onClick={() => goTo(2)}>
            CONTINUE
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 18, ...fi(0.38) }}>
          <span style={{ fontSize: 10, color: "rgba(147,197,253,0.38)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}>
            Already have an account?{" "}
            <span style={{ color: "#60A5FA", cursor: "pointer" }}>Sign in</span>
          </span>
        </div>
      </div>
    ),

    // Step 2 — Create Profile
    2: (
      <div style={PANEL}>
        <div style={fi(0)}>
          <BackBtn onClick={() => goTo(1)} />
          <StepDots current={2} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, ...fi(0.05) }}>
          <HexLogo size={26} />
        </div>
        <h2 style={{ ...HEADING, ...fi(0.1) }}>YOUR PROFILE</h2>
        <p style={{ ...SUB, ...fi(0.15) }}>TELL US ABOUT YOURSELF</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px", ...fi(0.2) }}>
          <GlassInput label="First Name" value={formData.firstName}
            onChange={set("firstName")} placeholder="John" />
          <GlassInput label="Last Name" value={formData.lastName}
            onChange={set("lastName")} placeholder="Doe" />
        </div>
        <div style={fi(0.26)}>
          <GlassInput label="I am a" value={formData.role} onChange={set("role")}
            placeholder="Select your role"
            options={[
              { value: "athlete",    label: "Athlete / Performance" },
              { value: "clinician",  label: "Clinician / Medical" },
              { value: "researcher", label: "Researcher / Scientist" },
              { value: "biohacker",  label: "Biohacker / Enthusiast" },
              { value: "wellness",   label: "Wellness Professional" },
            ]}
          />
        </div>
        <div style={fi(0.32)}>
          <GlassInput label="Primary Goal" value={formData.goal} onChange={set("goal")}
            placeholder="Select your primary goal"
            options={[
              { value: "performance", label: "Performance & Recovery" },
              { value: "longevity",   label: "Longevity & Anti-aging" },
              { value: "cognitive",   label: "Cognitive Enhancement" },
              { value: "healing",     label: "Healing & Repair" },
              { value: "hormones",    label: "Hormonal Optimization" },
            ]}
          />
        </div>
        <div style={fi(0.38)}>
          <button className="pepti-enter" style={BTN} onClick={() => goTo(3)}>
            CONTINUE
          </button>
        </div>
      </div>
    ),

    // Step 3 — Quiz Intro
    3: (
      <div style={{ ...PANEL, width: 420 }}>
        <div style={fi(0)}>
          <BackBtn onClick={() => goTo(2)} />
          <StepDots current={3} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, ...fi(0.05) }}>
          <HexLogo size={26} />
        </div>

        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, ...fi(0.1) }}>
          <div style={{
            border: "1px solid rgba(96,165,250,0.32)",
            color: "#60A5FA",
            fontSize: 8,
            letterSpacing: "0.32em",
            fontFamily: "'Inter', sans-serif",
            padding: "5px 16px",
            background: "rgba(59,130,246,0.07)",
          }}>
            PEPTIDE PROTOCOL QUIZ
          </div>
        </div>

        <h2 style={{
          color: "#FFFFFF", fontSize: 21, fontWeight: 800,
          letterSpacing: "0.18em", textIndent: "0.18em",
          margin: "0 0 14px 0", textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
          textShadow: "0 0 32px rgba(37,99,235,0.55)",
          lineHeight: 1.45,
          ...fi(0.15),
        }}>
          FIND YOUR OPTIMAL<br />PROTOCOL
        </h2>

        <p style={{
          color: "rgba(147,197,253,0.6)",
          fontSize: 12, lineHeight: 1.85,
          textAlign: "center",
          margin: "0 0 26px 0",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          letterSpacing: "0.03em",
          ...fi(0.2),
        }}>
          Answer 8 science-backed questions and our AI will map your biology to a precision peptide stack — calibrated to your goals and physiology.
        </p>

        {/* Feature list */}
        {[
          ["◈", "8 targeted questions  ·  ~3 minutes"],
          ["◈", "AI-matched peptide sequences"],
          ["◈", "Downloadable protocol report"],
        ].map(([icon, text], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11, ...fi(0.27 + i * 0.07) }}>
            <span style={{ color: "#3B82F6", fontSize: 9, flexShrink: 0, opacity: 0.85 }}>{icon}</span>
            <span style={{ color: "rgba(147,197,253,0.65)", fontSize: 11, letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>{text}</span>
          </div>
        ))}

        <div style={{ height: 1, background: "rgba(96,165,250,0.1)", margin: "20px 0 22px", ...fi(0.48) }} />

        <div style={fi(0.52)}>
          <button className="pepti-enter" style={{ ...BTN, marginTop: 0 }}>
            BEGIN QUIZ →
          </button>
        </div>
      </div>
    ),
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#040c1a" }}>
      {/* Three.js canvas — never unmounts */}
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@300;400&display=swap');

        @keyframes btnPulse {
          0%   { box-shadow: 0 0 0 0px rgba(96,165,250,0.0);  border-color: rgba(96,165,250,0.4); }
          45%  { box-shadow: 0 0 0 10px rgba(96,165,250,0.10); border-color: rgba(96,165,250,0.85); }
          75%  { box-shadow: 0 0 0 18px rgba(96,165,250,0.03); border-color: rgba(96,165,250,0.52); }
          100% { box-shadow: 0 0 0 0px rgba(96,165,250,0.0);  border-color: rgba(96,165,250,0.4); }
        }
        @keyframes subtitleGlow {
          0%,100% { text-shadow: 0 0 10px rgba(147,197,253,0.55), 0 0 24px rgba(96,165,250,0.22); }
          50%     { text-shadow: 0 0 18px rgba(147,197,253,0.9),  0 0 38px rgba(96,165,250,0.4); }
        }
        .pepti-enter { animation: btnPulse 2.8s ease-in-out infinite; }
        .pepti-enter:hover {
          animation: none !important;
          background: rgba(37,99,235,0.15) !important;
          border-color: rgba(147,197,253,0.95) !important;
          color: #DBEAFE !important;
        }
        .pepti-sub { animation: subtitleGlow 3.4s ease-in-out infinite; }
        input::placeholder  { color: rgba(147,197,253,0.22); }
        input:focus, select:focus { outline: none; }
      `}</style>

      {/* UI overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
        padding: 20,
      }}>
        {screens[step]}
      </div>
    </div>
  );
}
