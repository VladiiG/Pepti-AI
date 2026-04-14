import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── Questions (23 total) ─────────────────────────────────────────────────────
const GOAL_OPTS = [
  "Muscle & Performance","Fat Loss","Injury Recovery","Longevity & Anti-Aging",
  "Cognitive Performance","Sleep Optimization","Sexual Health","Immune Support",
  "Gut Healing","Skin & Aesthetics",
];

const QUESTIONS = [
  { q: "Select your goals", sub: "CHOOSE 2 TO 3 IN ORDER OF PRIORITY",
    type: "priority", opts: GOAL_OPTS },
  { q: "What is your body composition goal?",
    type: "single",  opts: ["Lose Fat","Build Muscle","Recomposition","Maintain"] },
  { q: "Which symptoms do you currently experience?",
    type: "multi",   opts: ["Joint / tendon pain","Gut issues","Poor sleep","Brain fog","Low energy","Low libido","Slow healing","Frequent illness","Skin / hair changes","Anxiety / stress","None"] },
  { q: "How severely do these symptoms affect your daily life?",
    type: "scale5" },
  { q: "How would you describe your energy throughout the day?",
    type: "single",  opts: ["Consistent and strong","Morning good / afternoon crash","Low all day","Unpredictable","Caffeine dependent"] },
  { q: "How would you rate your sleep quality?",
    type: "slider",  min: 1, max: 10, labelLow: "Terrible", labelHigh: "Perfect" },
  { q: "How often do you train or exercise?",
    type: "single",  opts: ["Never / rarely","1-2× per week","3-4× per week","5-6× per week","Daily or twice daily"] },
  { q: "How would you describe your diet?",
    type: "single",  opts: ["Very clean and tracked","Mostly healthy","Average","Poor / high processed","Actively restricting"] },
  { q: "How would you rate your stress levels?",
    type: "single",  opts: ["Low","Moderate","High but functional","Chronic","Burnout"] },
  { q: "Have you noticed any of the following in the last 12 months?",
    type: "multi",   opts: ["Unexplained weight gain","Hair thinning","Skin texture changes","Muscle loss despite training","Mood changes","Decreased libido","Night sweats","None"] },
  { q: "How is your blood sugar regulation?",
    type: "single",  opts: ["Very stable","Occasional crashes","Frequent spikes / crashes","Diagnosed insulin resistance","I don't know"] },
  { q: "What is your age range?",
    type: "single",  opts: ["18-24","25-34","35-44","45-54","55+"] },
  { q: "What is your biological sex?",
    type: "single",  opts: ["Male","Female","Prefer not to say"] },
  { q: "What is your approximate body weight?",
    type: "single",  opts: ["Under 140 lbs","140-180 lbs","180-220 lbs","220+ lbs"] },
  { q: "Have you ever been diagnosed with or treated for cancer?",
    type: "single",  opts: ["Never","In remission 5+ years","In remission under 5 years","Active","Unsure"] },
  { q: "Do you have any of the following conditions?",
    type: "multi",   hasOther: true,
    opts: ["Type 1/2 Diabetes","Thyroid disorder","Autoimmune condition","Cardiovascular disease","Kidney / liver disease","Epilepsy","None","Other"] },
  { q: "Are you currently taking any of the following?",
    type: "multi",   opts: ["Prescription medications","HRT","TRT","Birth control","Insulin / blood sugar medication","Blood thinners","None"] },
  { q: "Do you have any known allergies?",
    type: "single",  opts: ["No known allergies","Medication allergies","Previous peptide reaction","Latex / needle allergy"] },
  { q: "Pregnancy status?",
    type: "single",  opts: ["Not Pregnant","Currently pregnant","Breastfeeding","Planning within 6 months"] },
  { q: "What is your peptide experience level?",
    type: "single",  opts: ["Complete beginner","Done some research","Used before","Experienced with multiple protocols"] },
  { q: "How do you feel about self-injection?",
    type: "single",  opts: ["Hard no","Open but nervous","Comfortable","Experienced"] },
  { q: "What is your preferred administration method?",
    type: "single",  opts: ["Injectable","Oral / capsule","Nasal spray","No preference"] },
  { q: "What is your monthly budget for your protocol?",
    type: "single",  opts: ["Under $100","$100-200","$200-350","$350-500","$500+"] },
];

const N_Q = QUESTIONS.length; // 23
const INTRO_TEXT = "YOUR PROTOCOL IS BEING CALIBRATED";
const TURNS = 3.2, RAD = 2.2, HGHT = 20;
const SCALE5_LABELS = ["Barely noticeable", "", "Moderate impact", "", "Severely impacts life"];

function buildNodePositions() {
  return Array.from({ length: N_Q }, (_, i) => {
    const t = i / (N_Q - 1);
    const a = t * Math.PI * 2 * TURNS;
    return new THREE.Vector3(RAD * Math.cos(a), t * HGHT - HGHT / 2, RAD * Math.sin(a));
  });
}

const F  = "'Inter','Helvetica Neue',sans-serif";
const FH = "'Montserrat',sans-serif";

// ─── Component ────────────────────────────────────────────────────────────────
export default function PeptiQuiz({ onComplete }) {
  const mountRef = useRef(null);

  // Three.js refs
  const nodeMeshesRef  = useRef([]);
  const helixGroupRef  = useRef(null);
  const camPosRef      = useRef(new THREE.Vector3(0, 1, 28));
  const camPosTgtRef   = useRef(new THREE.Vector3(0, 1, 28));
  const camLookRef     = useRef(new THREE.Vector3(0, 0, 0));
  const camLookTgtRef  = useRef(new THREE.Vector3(0, 0, 0));
  const tRef           = useRef(0);
  const litRef         = useRef(0);
  const completingRef  = useRef(false);
  const nodePositions  = useRef(buildNodePositions());
  const answersRef     = useRef({});
  const pendingRef     = useRef(false);
  const activeQRef     = useRef(QUESTIONS[0]);

  // UI state
  const [phase, setPhase]               = useState("intro");
  const [introText, setIntroText]       = useState("");
  const [introVisible, setIntroVisible] = useState(true);
  const [currentQ, setCurrentQ]         = useState(0);
  const [typedText, setTypedText]       = useState("");
  const [showCards, setShowCards]       = useState(false);
  const [multiSel, setMultiSel]         = useState([]);
  const [prioritySel, setPrioritySel]   = useState([]);
  const [sliderVal, setSliderVal]       = useState(5);
  const [otherCondition, setOtherCondition] = useState("");
  const [answers, setAnswers]           = useState({});
  const [completeText, setCompleteText] = useState("");

  // ── Three.js setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040c1a);

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 130);
    camera.position.copy(camPosRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // All helix geometry in a group so it can rotate during completion
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);
    helixGroupRef.current = helixGroup;

    const np = nodePositions.current;

    // Strands
    const strandMat = new THREE.MeshBasicMaterial({ color: 0x2a5cb8, transparent: true, opacity: 0.75 });
    [0, Math.PI].forEach(ph => {
      const pts = Array.from({ length: 80 }, (_, i) => {
        const t = i / 79, a = t * Math.PI * 2 * TURNS + ph;
        return new THREE.Vector3(RAD * Math.cos(a), t * HGHT - HGHT / 2, RAD * Math.sin(a));
      });
      helixGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 260, 0.036, 7, false),
        strandMat,
      ));
    });

    // Rungs
    const rungMat = new THREE.LineBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.38 });
    np.forEach((pos, i) => {
      if (i % 3 !== 0) return;
      const t = i / (N_Q - 1), a2 = t * Math.PI * 2 * TURNS + Math.PI;
      const opp = new THREE.Vector3(RAD * Math.cos(a2), pos.y, RAD * Math.sin(a2));
      helixGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([pos, opp]), rungMat));
    });

    // 23 nodes
    nodeMeshesRef.current = np.map(pos => {
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.44, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0x020810, transparent: true, opacity: 0.55, depthWrite: false }),
      );
      halo.position.copy(pos);
      helixGroup.add(halo);

      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x60A5FA, transparent: true, opacity: 0.08,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8), glowMat);
      glow.position.copy(pos);
      helixGroup.add(glow);

      const mainMat = new THREE.MeshBasicMaterial({ color: 0x1a3a8f });
      const main = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), mainMat);
      main.position.copy(pos);
      helixGroup.add(main);

      return { mainMat, glowMat };
    });

    // Particles (stay in scene, don't rotate)
    const pCount = 180;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i*3]=(Math.random()-.5)*28; pPos[i*3+1]=(Math.random()-.5)*28; pPos[i*3+2]=(Math.random()-.5)*16;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x60A5FA, size: 0.02, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      tRef.current += 0.005;
      const t = tRef.current;

      camPosRef.current.lerp(camPosTgtRef.current, 0.036);
      camLookRef.current.lerp(camLookTgtRef.current, 0.036);
      camera.position.copy(camPosRef.current);
      camera.lookAt(camLookRef.current);

      // Pulse active node
      const ai = litRef.current;
      if (ai < N_Q) {
        const { glowMat } = nodeMeshesRef.current[ai];
        if (glowMat.opacity > 0.04) {
          glowMat.opacity = 0.32 + 0.18 * Math.sin(t * 2.6);
        }
      }

      // Completion: slow helix rotation + wave glow across all nodes
      if (completingRef.current) {
        helixGroup.rotation.y += 0.004;
        nodeMeshesRef.current.forEach(({ glowMat }, i) => {
          if (i < litRef.current) {
            glowMat.opacity = 0.22 + 0.16 * Math.sin(t * 1.5 - i * 0.24);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nW = el.clientWidth, nH = el.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // ── Intro ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i >= INTRO_TEXT.length) { clearInterval(iv); return; }
      setIntroText(INTRO_TEXT.slice(0, ++i));
    }, 55);
    const go = setTimeout(() => {
      setIntroVisible(false);
      setTimeout(() => travelRef.current(0), 700);
    }, INTRO_TEXT.length * 55 + 1600);
    return () => { clearInterval(iv); clearTimeout(go); };
  }, []);

  // ── Typing effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "question") return;
    setTypedText("");
    setShowCards(false);

    const qData = activeQRef.current;
    const prevAns = answersRef.current[currentQ];

    // Restore state for each type when navigating back
    if (qData?.type === "multi" && Array.isArray(prevAns))       setMultiSel([...prevAns]);
    else if (qData?.type === "priority" && Array.isArray(prevAns)) setPrioritySel([...prevAns]);
    else if (qData?.type === "slider" && typeof prevAns === "number") setSliderVal(prevAns);
    else { setMultiSel([]); setPrioritySel([]); setSliderVal(5); setOtherCondition(""); }

    const text = qData?.q ?? "";
    if (!text) return;
    const words = text.trim().split(" ");
    let idx = 0;
    const iv = setInterval(() => {
      if (idx >= words.length) {
        clearInterval(iv);
        setTimeout(() => setShowCards(true), 260);
        return;
      }
      const word = words[idx]; idx += 1;
      setTypedText(prev => prev + (idx > 1 ? " " : "") + word);
    }, 110);
    return () => clearInterval(iv);
  }, [phase, currentQ]);

  // ── Travel to node ──────────────────────────────────────────────────────────
  const travelRef = useRef(null);
  travelRef.current = (qIdx) => {
    pendingRef.current = false;
    setPhase("traveling");
    setShowCards(false);

    const pos = nodePositions.current[qIdx];
    camPosTgtRef.current.set(0, pos.y + 1.2, 10.5);
    camLookTgtRef.current.set(pos.x * 0.5, pos.y, pos.z * 0.5);

    nodeMeshesRef.current[qIdx].mainMat.color.setHex(0x60A5FA);
    nodeMeshesRef.current[qIdx].glowMat.opacity = 0.22;
    litRef.current = qIdx;

    activeQRef.current = QUESTIONS[qIdx];
    setTimeout(() => { setCurrentQ(qIdx); setPhase("question"); }, 1500);
  };

  // ── Back navigation ─────────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentQ === 0 || pendingRef.current) return;
    const prevQ = currentQ - 1;

    nodeMeshesRef.current[currentQ].mainMat.color.setHex(0x1a3a8f);
    nodeMeshesRef.current[currentQ].glowMat.opacity = 0.08;
    nodeMeshesRef.current[prevQ].mainMat.color.setHex(0x60A5FA);
    nodeMeshesRef.current[prevQ].glowMat.opacity = 0.35;
    litRef.current = prevQ;

    const newAnswers = { ...answersRef.current };
    delete newAnswers[currentQ];
    answersRef.current = newAnswers;
    setAnswers(newAnswers);

    const pos = nodePositions.current[prevQ];
    camPosTgtRef.current.set(0, pos.y + 1.2, 10.5);
    camLookTgtRef.current.set(pos.x * 0.5, pos.y, pos.z * 0.5);

    setPhase("traveling");
    setShowCards(false);

    activeQRef.current = QUESTIONS[prevQ];
    setTimeout(() => { setCurrentQ(prevQ); setPhase("question"); }, 1300);
  };

  // ── Answer ──────────────────────────────────────────────────────────────────
  const handleAnswer = (answer) => {
    if (pendingRef.current) return;
    pendingRef.current = true;

    const newAnswers = { ...answersRef.current, [currentQ]: answer };
    answersRef.current = newAnswers;
    setAnswers(newAnswers);

    nodeMeshesRef.current[currentQ].mainMat.color.setHex(0x3B82F6);
    nodeMeshesRef.current[currentQ].glowMat.opacity = 0.32;
    litRef.current = currentQ + 1;

    setTimeout(() => {
      if (currentQ >= N_Q - 1) {
        startCompletion(newAnswers);
      } else {
        travelRef.current(currentQ + 1);
      }
    }, 800);
  };

  const handleMultiConfirm = () => {
    if (multiSel.length === 0 || pendingRef.current) return;
    const qData = activeQRef.current;
    const answer = (qData?.hasOther && multiSel.includes("Other"))
      ? { selections: [...multiSel], other: otherCondition.trim() }
      : [...multiSel];
    handleAnswer(answer);
  };

  const handlePriorityConfirm = () => {
    if (prioritySel.length < 2 || pendingRef.current) return;
    handleAnswer([...prioritySel]);
  };

  const toggleMulti = (opt) => {
    if (opt === "None") { setMultiSel(["None"]); return; }
    setMultiSel(prev => {
      const f = prev.filter(x => x !== "None");
      return f.includes(opt) ? f.filter(x => x !== opt) : [...f, opt];
    });
  };

  const togglePriority = (opt) => {
    setPrioritySel(prev => {
      if (prev.includes(opt)) return prev.filter(o => o !== opt);
      if (prev.length >= 3) return prev;
      return [...prev, opt];
    });
  };

  // ── Completion ──────────────────────────────────────────────────────────────
  const startCompletion = (finalAnswers) => {
    setPhase("complete");
    completingRef.current = true;

    camPosTgtRef.current.set(0, 2, 28);
    camLookTgtRef.current.set(0, 0, 0);

    nodeMeshesRef.current.forEach(({ mainMat, glowMat }, i) => {
      setTimeout(() => {
        mainMat.color.setHex(0x60A5FA);
        glowMat.opacity = 0.32;
      }, i * 90);
    });

    setTimeout(() => {
      const txt = "ANALYZING YOUR BIOLOGY...";
      let i = 0;
      const iv = setInterval(() => {
        if (i >= txt.length) { clearInterval(iv); return; }
        setCompleteText(txt.slice(0, ++i));
      }, 55);
    }, N_Q * 90 + 800);

    setTimeout(() => { if (onComplete) onComplete(finalAnswers); }, N_Q * 90 + 4500);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const qData    = QUESTIONS[currentQ];
  const opts     = qData?.opts ?? [];
  const isMulti    = qData?.type === "multi";
  const isPriority = qData?.type === "priority";
  const isScale5   = qData?.type === "scale5";
  const isSlider   = qData?.type === "slider";
  const isSingle   = qData?.type === "single";
  const twoCol     = (isMulti || isSingle) && opts.length >= 6;
  const litCount   = Object.keys(answers).length;
  const sliderPct  = `${((sliderVal - 1) / 9 * 100).toFixed(1)}%`;

  const PILL = (selected) => ({
    display: "inline-block",
    width: twoCol || isPriority ? "100%" : "auto",
    minWidth: (!twoCol && !isPriority) ? 180 : undefined,
    boxSizing: "border-box", position: "relative", overflow: "visible",
    background: selected ? "rgba(37,99,235,0.12)" : "rgba(4,12,26,0.55)",
    border: `1px solid ${selected ? "rgba(96,165,250,0.85)" : "rgba(96,165,250,0.2)"}`,
    boxShadow: selected ? "0 0 22px rgba(96,165,250,0.28), 0 0 6px rgba(96,165,250,0.12) inset" : "none",
    color: selected ? "#DBEAFE" : "rgba(147,197,253,0.62)",
    padding: "14px 24px", fontSize: 10, letterSpacing: "0.18em",
    textTransform: "uppercase", fontFamily: F, fontWeight: 400,
    borderRadius: 50, cursor: "pointer", textAlign: "center", lineHeight: 1.4,
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    transition: "border-color 0.35s ease, box-shadow 0.35s ease, color 0.35s ease, background 0.35s ease",
  });

  const NEXT_BTN = (visible) => ({
    width: "100%", background: "transparent", borderRadius: 0,
    border: "1px solid rgba(96,165,250,0.4)",
    color: "#93C5FD", padding: "14px 0",
    fontSize: 10, letterSpacing: "0.3em", fontFamily: F, fontWeight: 400,
    cursor: visible ? "pointer" : "default",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 0.38s ease, transform 0.38s ease",
    pointerEvents: visible ? "all" : "none",
  });

  const inQuestion = phase === "question" || phase === "answering" || phase === "traveling";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#040c1a", overflow: "hidden" }}>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@300;400&display=swap');
        @keyframes blink      { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes pillIn     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotBounce  { 0%,80%,100%{opacity:0.25;transform:translateY(0)} 40%{opacity:1;transform:translateY(-5px)} }
        @keyframes qPulse {
          0%   {box-shadow:0 0 0 0   rgba(96,165,250,0);  border-color:rgba(96,165,250,0.4);}
          45%  {box-shadow:0 0 0 8px rgba(96,165,250,0.14);border-color:rgba(96,165,250,0.9);}
          100% {box-shadow:0 0 0 0   rgba(96,165,250,0);  border-color:rgba(96,165,250,0.4);}
        }
        .q-pulse { animation: qPulse 2.6s ease-in-out infinite; }
        .quiz-scroll::-webkit-scrollbar { display: none; }
        .pill-btn:hover { border-color: rgba(96,165,250,0.55) !important; color: rgba(147,197,253,0.9) !important; }
        .back-btn:hover { opacity: 1 !important; }
        .quiz-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px; border-radius: 2px; outline: none;
          background: linear-gradient(to right, #3B82F6 var(--val, 44%), rgba(26,58,143,0.45) var(--val, 44%));
          margin: 18px 0 10px;
        }
        .quiz-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 26px; height: 26px; border-radius: 50%;
          background: #DBEAFE; cursor: pointer;
          box-shadow: 0 0 20px rgba(96,165,250,0.9), 0 0 6px rgba(96,165,250,0.4);
          border: 2px solid rgba(96,165,250,0.65);
        }
        .quiz-slider::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: #DBEAFE; cursor: pointer; border: 2px solid rgba(96,165,250,0.65);
          box-shadow: 0 0 20px rgba(96,165,250,0.9);
        }
        .other-input { outline: none !important; }
        .other-input:focus { border-color: rgba(96,165,250,0.75) !important; }
      `}</style>

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 25%, rgba(4,12,26,0.55) 100%)",
      }} />

      {/* ── INTRO ── */}
      {phase === "intro" && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: introVisible ? 1 : 0, transition: "opacity 0.7s ease", pointerEvents: "none",
        }}>
          <p style={{ fontSize: 10, letterSpacing: "0.36em", color: "#60A5FA", fontFamily: F, fontWeight: 400, margin: 0, textShadow: "0 0 28px rgba(96,165,250,0.7)" }}>
            {introText}
            {introText.length < INTRO_TEXT.length && <span style={{ animation: "blink 0.7s infinite" }}>_</span>}
          </p>
        </div>
      )}

      {/* ── QUESTION FLOW ── */}
      {inQuestion && (
        <>
          {/* Back button */}
          {currentQ > 0 && phase !== "traveling" && (
            <button className="back-btn" onClick={handleBack} style={{
              position: "absolute", top: 20, left: 18, zIndex: 10,
              background: "none", border: "none", color: "rgba(147,197,253,0.38)",
              fontSize: 9, letterSpacing: "0.22em", fontFamily: F, fontWeight: 400,
              cursor: "pointer", padding: "8px 4px", opacity: 0.7,
              display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.2s ease",
            }}>
              ← BACK
            </button>
          )}

          {/* Top: counter + progress + question */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            background: "linear-gradient(180deg, rgba(4,12,26,0.82) 0%, transparent 100%)",
            padding: "52px 22px 64px",
            display: "flex", flexDirection: "column", alignItems: "center",
            pointerEvents: "none",
          }}>
            <p style={{ fontSize: 9, letterSpacing: "0.34em", color: "rgba(96,165,250,0.4)", fontFamily: F, margin: "0 0 12px" }}>
              {String(currentQ + 1).padStart(2, "0")} / {N_Q}
            </p>
            <div style={{ display: "flex", gap: 3, marginBottom: 26, flexWrap: "wrap", justifyContent: "center", maxWidth: 320 }}>
              {Array.from({ length: N_Q }, (_, i) => (
                <div key={i} style={{
                  width: i === currentQ ? 14 : 4, height: 4, borderRadius: 2,
                  background: i < litCount ? "#3B82F6" : i === currentQ ? "#60A5FA" : "rgba(96,165,250,0.13)",
                  transition: "all 0.4s ease",
                  boxShadow: i === currentQ ? "0 0 7px rgba(96,165,250,0.65)" : "none",
                }} />
              ))}
            </div>
            <h2 style={{
              color: "#FFFFFF", fontSize: 28, fontWeight: 800,
              letterSpacing: "0.05em", textAlign: "center", textTransform: "uppercase",
              fontFamily: FH, margin: 0, lineHeight: 1.3, maxWidth: 360,
              textShadow: "0 0 44px rgba(37,99,235,0.7), 0 2px 14px rgba(0,0,0,0.95)",
              minHeight: 72,
            }}>
              {typedText}
              {phase === "question" && !showCards && <span style={{ fontWeight: 300, animation: "blink 0.75s infinite" }}>|</span>}
            </h2>
            {qData?.sub && showCards && (
              <p style={{ color: "rgba(96,165,250,0.5)", fontSize: 9, letterSpacing: "0.22em", fontFamily: F, margin: "12px 0 0", textAlign: "center" }}>
                {qData.sub}
              </p>
            )}
          </div>

          {/* Cards panel */}
          {showCards && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
              <div style={{ background: "linear-gradient(0deg, rgba(4,12,26,0.98) 60%, rgba(4,12,26,0) 100%)", padding: "48px 18px 32px" }}>

                {/* ── PRIORITY: 2-col grid with rank dot system ── */}
                {isPriority && (
                  <>
                    <div className="quiz-scroll" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, maxHeight: "46vh", overflowY: "auto", scrollbarWidth: "none" }}>
                      {opts.map((opt, i) => {
                        // rank: 1 = first tapped (highest priority), 2 = second, 3 = third, 0 = not selected
                        const selIdx = prioritySel.indexOf(opt);
                        const rank = selIdx === -1 ? 0 : selIdx + 1;
                        const sel  = rank > 0;

                        // Border & glow: brightest for rank 1, dims with rank
                        const borderColor = rank === 1
                          ? "rgba(96,165,250,0.95)"
                          : rank === 2
                          ? "rgba(130,110,255,0.70)"
                          : rank === 3
                          ? "rgba(96,165,250,0.42)"
                          : "rgba(96,165,250,0.2)";

                        const shadow = rank === 1
                          ? "0 0 26px rgba(96,165,250,0.42), 0 0 8px rgba(96,165,250,0.18) inset"
                          : rank === 2
                          ? "0 0 18px rgba(130,110,255,0.30)"
                          : rank === 3
                          ? "0 0 10px rgba(96,165,250,0.18)"
                          : "none";

                        const dotColor = rank === 2 ? "#B09FFF" : "#60A5FA";
                        const dotShadow = rank === 2
                          ? "0 0 7px rgba(130,110,255,0.95), 0 0 14px rgba(130,110,255,0.55)"
                          : "0 0 7px rgba(96,165,250,0.95), 0 0 14px rgba(96,165,250,0.55)";
                        const D = { width: 6, height: 6, borderRadius: "50%", background: dotColor, boxShadow: dotShadow, display: "block", flexShrink: 0 };

                        return (
                          <button key={opt} className="pill-btn" onClick={() => togglePriority(opt)}
                            style={{
                              ...PILL(sel),
                              border: `1px solid ${borderColor}`,
                              boxShadow: shadow,
                              overflow: "hidden",
                              animation: `pillIn 0.32s ease both`,
                              animationDelay: `${i * 60}ms`,
                            }}>

                            {/* Rank 1 (first tapped): 1 dot */}
                            {rank === 1 && (
                              <span style={{ position: "absolute", top: 9, right: 11, pointerEvents: "none" }}>
                                <span style={{ ...D }} />
                              </span>
                            )}
                            {/* Rank 2 (second tapped): 2 dots side by side */}
                            {rank === 2 && (
                              <span style={{ position: "absolute", top: 9, right: 9, display: "flex", gap: 4, pointerEvents: "none" }}>
                                <span style={{ ...D }} />
                                <span style={{ ...D }} />
                              </span>
                            )}
                            {/* Rank 3 (third tapped): 3 dots in triangle */}
                            {rank === 3 && (
                              <span style={{ position: "absolute", top: 7, right: 9, width: 18, height: 15, pointerEvents: "none" }}>
                                <span style={{ ...D, position: "absolute", top: 0, left: 0 }} />
                                <span style={{ ...D, position: "absolute", top: 0, right: 0 }} />
                                <span style={{ ...D, position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }} />
                              </span>
                            )}

                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button className={prioritySel.length >= 2 ? "q-pulse" : ""} onClick={handlePriorityConfirm}
                        style={NEXT_BTN(prioritySel.length >= 2)}>
                        NEXT →
                      </button>
                    </div>
                  </>
                )}

                {/* ── SCALE 5: numbered circles ── */}
                {isScale5 && (
                  <div style={{ animation: "pillIn 0.4s ease both" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
                      {[1,2,3,4,5].map((n, i) => {
                        const sel = answers[currentQ] === n;
                        return (
                          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                            <button onClick={() => handleAnswer(n)} style={{
                              width: "100%", aspectRatio: "1", maxWidth: 62,
                              borderRadius: "50%",
                              background: sel ? "rgba(37,99,235,0.2)" : "rgba(4,12,26,0.6)",
                              border: `1.5px solid ${sel ? "rgba(96,165,250,0.9)" : "rgba(96,165,250,0.22)"}`,
                              boxShadow: sel ? "0 0 26px rgba(96,165,250,0.45)" : "none",
                              color: sel ? "#DBEAFE" : "rgba(147,197,253,0.6)",
                              fontSize: 20, fontWeight: 700, fontFamily: F,
                              cursor: "pointer", transition: "all 0.28s ease",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {n}
                            </button>
                            <span style={{
                              fontSize: 8, letterSpacing: "0.1em", color: "rgba(147,197,253,0.45)",
                              fontFamily: F, textAlign: "center", lineHeight: 1.3,
                              minHeight: 22, maxWidth: 62,
                            }}>
                              {SCALE5_LABELS[i]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── SLIDER ── */}
                {isSlider && (
                  <div style={{ animation: "pillIn 0.4s ease both", padding: "0 4px" }}>
                    <div style={{ textAlign: "center", fontSize: 56, fontWeight: 800, color: "#60A5FA", fontFamily: FH, lineHeight: 1, marginBottom: 8, textShadow: "0 0 32px rgba(96,165,250,0.6)" }}>
                      {sliderVal}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 0 }}>
                      <span style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(147,197,253,0.45)", fontFamily: F }}>TERRIBLE</span>
                      <span style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(147,197,253,0.45)", fontFamily: F }}>PERFECT</span>
                    </div>
                    <input
                      type="range" className="quiz-slider"
                      min="1" max="10" step="1" value={sliderVal}
                      onChange={e => setSliderVal(Number(e.target.value))}
                      style={{ '--val': sliderPct }}
                    />
                    <button className="q-pulse" onClick={() => handleAnswer(sliderVal)} style={{ ...NEXT_BTN(true), marginTop: 10 }}>
                      NEXT →
                    </button>
                  </div>
                )}

                {/* ── SINGLE / MULTI: pill grid ── */}
                {(isSingle || isMulti) && (
                  <>
                    <div className="quiz-scroll" style={{
                      display: twoCol ? "grid" : "flex",
                      gridTemplateColumns: twoCol ? "1fr 1fr" : undefined,
                      flexDirection: twoCol ? undefined : "column",
                      alignItems: twoCol ? undefined : "center",
                      gap: 9, maxHeight: "44vh", overflowY: "auto", scrollbarWidth: "none",
                    }}>
                      {opts.map((opt, i) => {
                        const sel = isMulti ? multiSel.includes(opt) : answers[currentQ] === opt;
                        return (
                          <button key={opt} className="pill-btn"
                            onClick={() => isMulti ? toggleMulti(opt) : handleAnswer(opt)}
                            style={{ ...PILL(sel), animation: `pillIn 0.32s ease both`, animationDelay: `${i * 80}ms` }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* "Other" text input for medical conditions */}
                    {isMulti && qData?.hasOther && multiSel.includes("Other") && (
                      <input
                        className="other-input"
                        type="text"
                        value={otherCondition}
                        onChange={e => setOtherCondition(e.target.value)}
                        placeholder="Please specify your condition"
                        style={{
                          width: "100%", boxSizing: "border-box", marginTop: 10,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(96,165,250,0.3)",
                          color: "#E2E8F0", padding: "12px 16px",
                          fontSize: 11, fontFamily: F, fontWeight: 300,
                          letterSpacing: "0.06em", outline: "none", borderRadius: 0,
                          transition: "border-color 0.3s ease",
                        }}
                      />
                    )}

                    {isMulti && (
                      <div style={{ marginTop: 10 }}>
                        <button className={multiSel.length > 0 ? "q-pulse" : ""} onClick={handleMultiConfirm}
                          style={NEXT_BTN(multiSel.length > 0)}>
                          NEXT →
                        </button>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          )}
        </>
      )}

      {/* ── COMPLETION ── */}
      {phase === "complete" && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <p style={{ fontSize: 10, letterSpacing: "0.34em", color: "#60A5FA", fontFamily: F, fontWeight: 400, margin: 0, textShadow: "0 0 28px rgba(96,165,250,0.7)" }}>
            {completeText}
          </p>
          {completeText.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#3B82F6", animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
