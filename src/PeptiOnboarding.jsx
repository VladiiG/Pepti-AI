import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import PeptiQuiz from "./PeptiQuiz";

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

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" opacity="0.85"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" opacity="0.85"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" opacity="0.85"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" opacity="0.85"/>
    </svg>
  );
}

// ─── Apple Icon ───────────────────────────────────────────────────────────────
function AppleIcon() {
  return (
    <svg width="15" height="16" viewBox="0 0 14 17" fill="none">
      <path d="M13.148 13.168c-.28.644-.612 1.237-.997 1.783-.525.748-0.954 1.266-1.282 1.554-.512.471-1.06.712-1.648.726-.422 0-.93-.12-1.52-.362-.593-.243-1.138-.363-1.638-.363-.525 0-1.086.12-1.685.363-.6.242-1.084.369-1.454.382-.564.024-1.126-.224-1.687-.745-.357-.311-.804-.847-1.341-1.607-.575-.81-1.047-1.749-1.417-2.818C.16 11.083 0 10.048 0 9.045c0-1.152.249-2.144.748-2.974.392-.667.913-1.193 1.565-1.58.652-.386 1.356-.583 2.115-.597.415 0 .96.128 1.638.38.676.254 1.11.382 1.299.382.143 0 .626-.15 1.444-.449.774-.278 1.427-.393 1.963-.347 1.451.117 2.542.69 3.268 1.721-1.297.786-1.939 1.887-1.926 3.298.012 1.1.411 2.016 1.193 2.742.355.337.751.597 1.192.782-.096.277-.196.543-.303.795zM10.15.34c0 .862-.315 1.667-.942 2.412-.757.884-1.674 1.394-2.667 1.314a2.675 2.675 0 0 1-.02-.327c0-.827.36-1.712 1-2.44C7.848.97 8.31.665 8.894.42c.582-.242 1.133-.376 1.65-.4.013.108.018.214.018.32H10.15z" fill="#E2E8F0" opacity="0.75"/>
    </svg>
  );
}

// ─── Card Selector ────────────────────────────────────────────────────────────
function CardSelector({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 9, letterSpacing: "0.22em", color: "rgba(147,197,253,0.6)",
        fontFamily: "'Inter', sans-serif", fontWeight: 400, marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {options.map(opt => {
          const sel = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                background: sel ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${sel ? "rgba(96,165,250,0.65)" : "rgba(96,165,250,0.13)"}`,
                boxShadow: sel ? "0 0 20px rgba(96,165,250,0.18), inset 0 0 8px rgba(96,165,250,0.05)" : "none",
                color: sel ? "#93C5FD" : "rgba(147,197,253,0.4)",
                padding: "14px 8px 12px",
                cursor: "pointer",
                borderRadius: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "all 0.22s ease",
                fontFamily: "'Inter', sans-serif",
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", opacity: sel ? 1 : 0.5, transition: "opacity 0.22s ease" }}>
                {opt.icon}
              </span>
              <span style={{ fontSize: 8, letterSpacing: "0.2em", fontWeight: 400 }}>
                {opt.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Phone Input ──────────────────────────────────────────────────────────────
function PhoneInput({ phoneCode, onCodeChange, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const CODES = [
    "+1", "+44", "+61", "+33", "+49", "+34", "+39", "+81", "+86", "+91", "+55", "+52",
  ];
  const borderColor = focused ? "rgba(96,165,250,0.85)" : "rgba(96,165,250,0.28)";
  const shadow = focused ? "0 0 18px rgba(96,165,250,0.14), inset 0 0 10px rgba(96,165,250,0.04)" : "none";
  const shared = {
    background: "transparent",
    color: "#E2E8F0",
    fontSize: 12,
    letterSpacing: "0.06em",
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    fontWeight: 300,
    outline: "none",
    border: "none",
    transition: "border-color 0.3s ease",
  };
  return (
    <div style={{ marginBottom: 18, width: "100%" }}>
      <div style={{
        fontSize: 9, letterSpacing: "0.22em", color: "rgba(147,197,253,0.6)",
        fontFamily: "'Inter', sans-serif", fontWeight: 400, marginBottom: 7,
      }}>
        PHONE NUMBER
      </div>
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}>
        <select
          value={phoneCode}
          onChange={e => onCodeChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...shared,
            borderRight: "1px solid rgba(96,165,250,0.18)",
            padding: "13px 6px 13px 14px",
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
            flexShrink: 0,
            width: 66,
          }}
        >
          {CODES.map(c => (
            <option key={c} value={c} style={{ background: "#040c1a", color: "#E2E8F0" }}>{c}</option>
          ))}
        </select>
        <input
          type="tel"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="(555) 000-0000"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...shared, padding: "13px 16px", flex: 1, boxSizing: "border-box" }}
        />
      </div>
    </div>
  );
}

// ─── Social Button ────────────────────────────────────────────────────────────
function SocialBtn({ icon, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: hov ? "rgba(96,165,250,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? "rgba(96,165,250,0.45)" : "rgba(96,165,250,0.18)"}`,
        boxShadow: hov ? "0 0 14px rgba(96,165,250,0.1)" : "none",
        color: "rgba(147,197,253,0.75)",
        padding: "11px 16px",
        fontSize: 10,
        letterSpacing: "0.2em",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        fontWeight: 400,
        borderRadius: 0,
        cursor: "pointer",
        transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        boxSizing: "border-box",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, textAlign: "center", paddingRight: 28 }}>{label}</span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PeptiOnboarding() {
  const mountRef = useRef(null);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "", password: "",
    firstName: "", lastName: "", phone: "", phoneCode: "+1",
    role: "", goal: "",
  });
  const [ageDeclined, setAgeDeclined] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState(null);

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

  // progressive-reveal helper — slides content in when show turns truthy
  const slide = (show, delay = 0) => ({
    overflow: "hidden",
    maxHeight: show ? "500px" : "0px",
    opacity: show ? 1 : 0,
    transition: `max-height 0.52s ease ${delay}s, opacity 0.35s ease ${show ? delay + 0.1 : 0}s`,
    pointerEvents: show ? "all" : "none",
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
    1: (() => {
      const ready = formData.email.trim().length > 0 && formData.password.length >= 6;
      return (
        <div style={PANEL}>
          <div style={fi(0)}><StepDots current={1} /></div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, ...fi(0.05) }}>
            <HexLogo size={26} />
          </div>
          <h2 style={{ ...HEADING, ...fi(0.1) }}>CREATE ACCOUNT</h2>
          <p style={{ ...SUB, ...fi(0.15) }}>BEGIN YOUR PROTOCOL JOURNEY</p>

          {/* ── Social sign-in ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, ...fi(0.2) }}>
            <SocialBtn icon={<GoogleIcon />} label="CONTINUE WITH GOOGLE" />
            <SocialBtn icon={<AppleIcon />} label="CONTINUE WITH APPLE" />
          </div>

          {/* ── OR divider ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", ...fi(0.28) }}>
            <div style={{ flex: 1, height: 1, background: "rgba(96,165,250,0.12)" }} />
            <span style={{
              fontSize: 9, letterSpacing: "0.28em",
              color: "rgba(147,197,253,0.38)", fontFamily: "'Inter', sans-serif", fontWeight: 400,
            }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(96,165,250,0.12)" }} />
          </div>

          {/* ── Email / password ── */}
          <div style={fi(0.34)}>
            <GlassInput label="Email Address" type="email" value={formData.email}
              onChange={set("email")} placeholder="you@domain.com" />
          </div>
          <div style={fi(0.4)}>
            <GlassInput label="Password" type="password" value={formData.password}
              onChange={set("password")} placeholder="Min. 6 characters" />
          </div>
          <div style={fi(0.46)}>
            <button
              className={ready ? "pepti-enter" : ""}
              onClick={() => { if (ready) goTo(2); }}
              style={{
                ...BTN,
                marginTop: 0,
                opacity: ready ? 1 : 0.28,
                borderColor: ready ? "rgba(96,165,250,0.4)" : "rgba(96,165,250,0.12)",
                color: ready ? "#93C5FD" : "rgba(147,197,253,0.28)",
                cursor: ready ? "pointer" : "default",
                transition: "opacity 0.45s ease, border-color 0.45s ease, color 0.45s ease",
              }}
            >
              CONTINUE
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 18, ...fi(0.52) }}>
            <span style={{ fontSize: 10, color: "rgba(147,197,253,0.38)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}>
              Already have an account?{" "}
              <span style={{ color: "#60A5FA", cursor: "pointer" }}>Sign in</span>
            </span>
          </div>
        </div>
      );
    })(),

    // Step 2 — Create Profile
    2: (() => {
      const n1 = formData.firstName.trim();
      const n2 = formData.lastName.trim();
      const ph = formData.phone.trim();
      const phoneDigits = ph.replace(/\D/g, "").length;
      const allFilled = n1 && n2 && phoneDigits >= 9 && formData.goal && formData.role;
      return (
        <div className="pepti-scroll" style={{
          ...PANEL,
          maxHeight: "88vh", overflowY: "auto", overflowX: "hidden",
          scrollbarWidth: "none",
        }}>
          <div style={fi(0)}>
            <BackBtn onClick={() => goTo(1)} />
            <StepDots current={2} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, ...fi(0.05) }}>
            <HexLogo size={26} />
          </div>
          <h2 style={{ ...HEADING, ...fi(0.1) }}>YOUR PROFILE</h2>
          <p style={{ ...SUB, marginBottom: 10, ...fi(0.15) }}>YOUR PROTOCOL STARTS WITH KNOWING YOU</p>

          {/* Dynamic greeting */}
          <div style={{
            textAlign: "center", minHeight: 22, marginBottom: 16,
            fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 300,
            letterSpacing: "0.1em", color: "#60A5FA",
            opacity: n1 ? 1 : 0,
            transform: n1 ? "translateY(0)" : "translateY(5px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            textShadow: "0 0 18px rgba(96,165,250,0.45)",
          }}>
            {n1 ? `Nice to meet you, ${formData.firstName} ✦` : "\u00A0"}
          </div>

          {/* Name fields — always visible */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px", ...fi(0.2) }}>
            <GlassInput label="First Name" value={formData.firstName}
              onChange={set("firstName")} placeholder="John" />
            <GlassInput label="Last Name" value={formData.lastName}
              onChange={set("lastName")} placeholder="Doe" />
          </div>

          {/* Phone — reveals after both names */}
          <div style={slide(n1 && n2)}>
            <PhoneInput
              phoneCode={formData.phoneCode}
              onCodeChange={set("phoneCode")}
              value={formData.phone}
              onChange={set("phone")}
            />
          </div>

          {/* Goal cards — reveals after phone has 9+ digits */}
          <div style={slide(phoneDigits >= 9)}>
            <CardSelector
              label="PRIMARY GOAL"
              value={formData.goal}
              onChange={set("goal")}
              options={[
                {
                  value: "performance", label: "Performance",
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="2,14 6,9 10,11 14,5 18,8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="8" r="1.5" fill="currentColor"/></svg>,
                },
                {
                  value: "recovery", label: "Recovery",
                  icon: <svg width="20" height="19" viewBox="0 0 20 19" fill="none"><path d="M10 17C10 17 2 12 2 6.5A4.5 4.5 0 0 1 10 4.5A4.5 4.5 0 0 1 18 6.5C18 12 10 17 10 17Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                },
                {
                  value: "longevity", label: "Longevity",
                  icon: <svg width="24" height="14" viewBox="0 0 24 14" fill="none"><path d="M1 7C3 1 8 1 12 7C16 13 21 13 23 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
                },
                {
                  value: "weightloss", label: "Weight Loss",
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="10" y1="3" x2="10" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><polyline points="5,10 10,15 15,10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                },
              ]}
            />
          </div>

          {/* Role cards — reveals after goal selected */}
          <div style={slide(!!formData.goal)}>
            <CardSelector
              label="I AM A"
              value={formData.role}
              onChange={set("role")}
              options={[
                {
                  value: "student", label: "Student",
                  icon: <svg width="22" height="18" viewBox="0 0 22 18" fill="none"><polygon points="11,2 21,7 11,12 1,7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M17 10V14C17 14 14.5 16 11 16C7.5 16 5 14 5 14V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="21" y1="7" x2="21" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
                },
                {
                  value: "athlete", label: "Athlete",
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M10 6L10 13M7 9L13 9M7 13L5 18M13 13L15 18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
                },
                {
                  value: "corporate", label: "Corporate",
                  icon: <svg width="18" height="20" viewBox="0 0 18 20" fill="none"><rect x="1" y="5" width="16" height="15" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5V3C5 2 13 2 13 3V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="4" y="9" width="3" height="3" stroke="currentColor" strokeWidth="1"/><rect x="11" y="9" width="3" height="3" stroke="currentColor" strokeWidth="1"/><rect x="4" y="14" width="3" height="3" stroke="currentColor" strokeWidth="1"/><rect x="11" y="14" width="3" height="3" stroke="currentColor" strokeWidth="1"/></svg>,
                },
                {
                  value: "other", label: "Other",
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="10" r="1" fill="currentColor"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="13" cy="10" r="1" fill="currentColor"/></svg>,
                },
              ]}
            />
          </div>

          {/* Continue — locked until all filled */}
          <div style={{ marginTop: 6, ...fi(0.3) }}>
            <button
              className={allFilled ? "pepti-enter" : ""}
              onClick={() => { if (allFilled) goTo(3); }}
              style={{
                ...BTN,
                marginTop: 0,
                opacity: allFilled ? 1 : 0.28,
                borderColor: allFilled ? "rgba(96,165,250,0.4)" : "rgba(96,165,250,0.12)",
                color: allFilled ? "#93C5FD" : "rgba(147,197,253,0.28)",
                cursor: allFilled ? "pointer" : "default",
                transition: "opacity 0.45s ease, border-color 0.45s ease, color 0.45s ease",
              }}
            >
              CONTINUE
            </button>
          </div>
        </div>
      );
    })(),

    // Step 3 — Age Verification
    3: (() => {
      if (ageDeclined) {
        return (
          <div style={{ ...PANEL, maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 22, ...fi(0) }}>
              <HexLogo size={26} />
            </div>
            <h2 style={{ ...HEADING, ...fi(0.1) }}>THANK YOU</h2>
            <p style={{
              color: "rgba(147,197,253,0.55)",
              fontSize: 12, lineHeight: 1.9,
              textAlign: "center", margin: "18px 0 0",
              fontFamily: "'Inter', sans-serif", fontWeight: 300,
              letterSpacing: "0.04em",
              ...fi(0.2),
            }}>
              Thank you for your honesty. Pepti AI protocol recommendations are only available for adults 21 and older.
            </p>
          </div>
        );
      }
      return (
        <div style={{ ...PANEL, maxWidth: 400 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22, ...fi(0) }}>
            <HexLogo size={26} />
          </div>
          <h2 style={{ ...HEADING, ...fi(0.1) }}>ONE QUICK THING</h2>
          <p style={{
            color: "rgba(147,197,253,0.55)",
            fontSize: 12, lineHeight: 1.9,
            textAlign: "center", margin: "14px 0 32px",
            fontFamily: "'Inter', sans-serif", fontWeight: 300,
            letterSpacing: "0.04em",
            ...fi(0.2),
          }}>
            To access your peptide protocol, we need to confirm your age.
            Pepti AI is only available to adults 21 and older.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...fi(0.3) }}>
            <button
              className="pepti-enter"
              onClick={() => goTo(4)}
              style={{
                ...BTN,
                marginTop: 0,
                width: "100%",
                background: "rgba(37,99,235,0.18)",
                borderColor: "rgba(96,165,250,0.55)",
                color: "#DBEAFE",
                fontWeight: 600,
              }}
            >
              I AM 21 OR OLDER
            </button>
            <button
              onClick={() => setAgeDeclined(true)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(226,232,240,0.6)",
                fontSize: 10,
                letterSpacing: "0.22em",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              I AM UNDER 21
            </button>
          </div>
        </div>
      );
    })(),

    // Step 4 — Medical Disclaimer
    4: (
      <div style={{ ...PANEL, width: 420 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, ...fi(0.05) }}>
          <HexLogo size={26} />
        </div>
        <h2 style={{ ...HEADING, fontSize: 17, ...fi(0.1) }}>BEFORE YOUR ASSESSMENT</h2>
        <p style={{
          color: "rgba(147,197,253,0.55)",
          fontSize: 12, lineHeight: 1.9,
          textAlign: "center", margin: "18px 0 30px",
          fontFamily: "'Inter', sans-serif", fontWeight: 300,
          letterSpacing: "0.04em",
          ...fi(0.2),
        }}>
          Pepti AI provides educational information only. Nothing on this platform constitutes medical advice, diagnosis, or treatment. All protocol recommendations are for informational purposes only and must be reviewed with a licensed healthcare provider before use. By proceeding you acknowledge and accept these terms.
        </p>
        <div style={fi(0.32)}>
          <button className="pepti-enter" onClick={() => goTo(5)} style={{ ...BTN, marginTop: 0, letterSpacing: "0.22em", fontSize: 9 }}>
            I ACCEPT — BEGIN ASSESSMENT
          </button>
        </div>
      </div>
    ),

    // Step 5 — Quiz Intro
    5: (
      <div style={{ ...PANEL, width: 420 }}>
        <div style={fi(0)}>
          <BackBtn onClick={() => goTo(4)} />
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
          <button className="pepti-enter" onClick={() => setQuizStarted(true)} style={{ ...BTN, marginTop: 0 }}>
            BEGIN QUIZ →
          </button>
        </div>
      </div>
    ),
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (quizStarted) {
    return <PeptiQuiz onComplete={(answers) => setQuizAnswers(answers)} />;
  }

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
        .pepti-scroll::-webkit-scrollbar { display: none; }
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
