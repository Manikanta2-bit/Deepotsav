import React, { useMemo, useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles as SparkleIcon, Flame, Send, Menu, X, ArrowDown, Sun, Heart } from 'lucide-react';
import * as THREE from 'three';

function Diya3D({ position = [0, 0, 0], scale = 1, lit = true, onClick }) {
  const flame = useRef();
  const glow = useRef();
  const profile = useMemo(() => [
    new THREE.Vector2(0.02, 0), new THREE.Vector2(0.22, 0.02),
    new THREE.Vector2(0.38, 0.10), new THREE.Vector2(0.47, 0.19),
    new THREE.Vector2(0.39, 0.24), new THREE.Vector2(0.18, 0.22),
    new THREE.Vector2(0.02, 0.20)
  ], []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flame.current) {
      flame.current.scale.y = 0.88 + Math.sin(t * 8 + position[0]) * 0.12;
      flame.current.rotation.z = Math.sin(t * 5 + position[2]) * 0.08;
    }
    if (glow.current) glow.current.intensity = lit ? 2.2 + Math.sin(t * 4) * 0.35 : 0;
  });
  return (
    <group position={position} scale={scale} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 48]} />
        <meshStandardMaterial color="#bd6428" roughness={0.34} metalness={0.42} />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.012, 40]} />
        <meshStandardMaterial color="#f5a33c" roughness={0.24} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.12, 12]} />
        <meshStandardMaterial color="#f5dfb0" />
      </mesh>
      {lit && <mesh ref={flame} position={[0, 0.39, 0]}>
        <sphereGeometry args={[0.085, 20, 20]} />
        <meshBasicMaterial color="#ffb12e" />
      </mesh>}
      <pointLight ref={glow} position={[0, 0.52, 0]} color="#ff9c36" intensity={lit ? 2.2 : 0} distance={3.5} />
      {lit && <mesh position={[0, 0.40, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ffdc83" transparent opacity={0.22} />
      </mesh>}
    </group>
  );
}

function Scene({ litDiyas, toggleDiya }) {
  return (
    <>
      <ambientLight intensity={0.48} />
      <directionalLight position={[4, 7, 5]} intensity={1.2} color="#ffd69a" />
      <Stars radius={65} depth={35} count={1800} factor={3} saturation={0.35} fade speed={0.5} />
      <Sparkles count={100} scale={[18, 9, 12]} size={2.4} speed={0.25} opacity={0.7} color="#ffc66e" />
      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.35}>
        <group position={[0, -1.55, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
            <circleGeometry args={[8, 96]} />
            <meshStandardMaterial color="#11172c" roughness={0.72} metalness={0.15} />
          </mesh>
          {[-3.4, -1.8, 0, 1.8, 3.4].map((x, i) => (
            <Diya3D key={i} position={[x, -0.02 + (i % 2) * 0.1, 1.3 + (i % 2) * 0.25]}
              scale={i === 2 ? 1.45 : 0.82} lit={litDiyas[i]} onClick={() => toggleDiya(i)} />
          ))}
        </group>
      </Float>
      <Environment preset="night" />
    </>
  );
}

function Fireworks({ burst }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; };
    resize();
    window.addEventListener('resize', resize);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life > 0);
      particles.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.025; p.vx *= 0.992; p.life -= 1;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  useEffect(() => {
    if (!burst) return;
    const canvas = canvasRef.current;
    const x = burst.x * devicePixelRatio, y = burst.y * devicePixelRatio;
    const colors = ['#ffd166', '#ff8b4a', '#f7a8ff', '#9bdcff', '#fff1c2'];
    for (let i = 0; i < 95; i++) {
      const a = Math.random() * Math.PI * 2, speed = 1.2 + Math.random() * 4.5;
      particles.current.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        life: 48 + Math.random() * 28, maxLife: 76, size: 1 + Math.random() * 2.2,
        color: colors[Math.floor(Math.random() * colors.length)] });
    }
  }, [burst]);
  return <canvas ref={canvasRef} className="fireworks-canvas" />;
}

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.8 } } };

export default function App() {
  const [litDiyas, setLitDiyas] = useState([true, false, true, false, true]);
  const [burst, setBurst] = useState(null);
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [musicOn, setMusicOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [soundCtx, setSoundCtx] = useState(null);

  const toggleDiya = (i) => {
    setLitDiyas(old => old.map((v, idx) => idx === i ? !v : v));
    setToast(litDiyas[i] ? 'A little light rests. Tap again to relight.' : 'You added a little more light ✨');
    window.setTimeout(() => setToast(''), 2200);
  };
  const launchFirework = (e) => {
    if (e.target.closest('button, a, input, textarea')) return;
    setBurst({ x: e.clientX, y: e.clientY, id: Date.now() });
  };
  const makeWish = (e) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    setWish(`May your home glow with happiness, your heart shine with hope, and every new beginning bring you joy. Happy Diwali, ${clean}!`);
  };
  const shareWish = async () => {
    const message = wish || 'Wishing you a bright, beautiful and joyful Diwali! 🪔';
    if (navigator.share) {
      try { await navigator.share({ title: 'Happy Diwali from Deepotsav', text: message }); } catch {}
    } else {
      await navigator.clipboard?.writeText(message);
      setToast('Greeting copied — share it with your loved ones!');
      window.setTimeout(() => setToast(''), 2500);
    }
  };
  const toggleMusic = () => {
    if (!musicOn) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = soundCtx || new Ctx();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = 174.61;
        gain.gain.value = 0.018;
        oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start();
        setSoundCtx(ctx);
      } catch {}
    } else if (soundCtx) { soundCtx.close(); setSoundCtx(null); }
    setMusicOn(v => !v);
  };

  return (
    <main onClick={launchFirework}>
      <Fireworks burst={burst} />
      <nav className="nav shell">
        <a className="brand" href="#home"><span className="brand-mark">✺</span> DEEPOTSAV<span className="brand-dot">.</span></a>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#celebrate" onClick={() => setMenuOpen(false)}>Celebrate</a>
          <a href="#rituals" onClick={() => setMenuOpen(false)}>Light a diya</a>
          <a href="#wishes" onClick={() => setMenuOpen(false)}>Send wishes</a>
        </div>
        <div className="nav-actions">
          <button className="icon-button" onClick={toggleMusic} aria-label="Toggle ambient sound">{musicOn ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
        </div>
      </nav>

      <section className="hero shell" id="home">
        <div className="hero-copy">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="eyebrow"><span/> THE FESTIVAL OF LIGHTS <span/></motion.div>
          <motion.h1 initial="hidden" animate="show" variants={fadeUp} transition={{ delay: .12 }}>
            Let your world<br/><em>glow brighter.</em>
          </motion.h1>
          <motion.p initial="hidden" animate="show" variants={fadeUp} transition={{ delay: .24 }}>
            A celebration of light over darkness, hope over fear, and togetherness above all.
          </motion.p>
          <motion.div className="hero-buttons" initial="hidden" animate="show" variants={fadeUp} transition={{ delay: .36 }}>
            <a className="button button-gold" href="#celebrate">Enter the celebration <SparkleIcon size={16}/></a>
            <a className="text-link" href="#wishes">Share the joy <ArrowDown size={15}/></a>
          </motion.div>
          <div className="hero-note"><span className="note-line"/> A little light can change everything.</div>
        </div>
        <div className="scene-wrap" aria-label="Interactive 3D Diwali scene">
          <Canvas camera={{ position: [0, 2.2, 9.5], fov: 42 }} dpr={[1, 1.7]}>
            <Suspense fallback={null}><Scene litDiyas={litDiyas} toggleDiya={toggleDiya}/></Suspense>
          </Canvas>
          <div className="scene-label"><span className="pulse-dot"/> INTERACTIVE 3D EXPERIENCE</div>
          <div className="scene-hint">Tap a diya to light it</div>
        </div>
        <div className="hero-bottom"><span>01 / A FESTIVAL OF LIGHT</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="intro section-pad" id="celebrate">
        <div className="shell intro-grid">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div className="eyebrow">MORE THAN A CELEBRATION</div>
            <h2>Light is a feeling<br/>we <em>share.</em></h2>
          </motion.div>
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            Across homes and hearts, Diwali brings people together. We light a diya not just to brighten a room, but to welcome fresh beginnings, kindness and possibility.
          </motion.p>
        </div>
        <div className="ornament shell"><span/><span/><span/><span/><span/><span/><span/></div>
      </section>

      <section className="rituals section-pad" id="rituals">
        <div className="shell">
          <div className="section-heading">
            <div><div className="eyebrow">A MOMENT OF LIGHT</div><h2>Light a little <em>joy.</em></h2></div>
            <p>Every diya carries a wish. Tap the lamps below and add your light to the celebration.</p>
          </div>
          <div className="diya-row">
            {litDiyas.map((lit, i) => <button className={`diya-card ${lit ? 'is-lit' : ''}`} key={i} onClick={() => toggleDiya(i)}>
              <span className="diya-emoji">{lit ? '🪔' : '◉'}</span>
              <span>{lit ? 'A light is glowing' : 'Light this diya'}</span>
            </button>)}
          </div>
          <div className="ritual-footer"><span><Flame size={16}/> {litDiyas.filter(Boolean).length} of 5 diyas glowing</span><button className="subtle-button" onClick={() => setLitDiyas([true,true,true,true,true])}>Light all diyas <Sun size={15}/></button></div>
        </div>
      </section>

      <section className="gallery section-pad" id="moments">
        <div className="shell">
          <div className="section-heading">
            <div><div className="eyebrow">THE BEAUTY OF TOGETHERNESS</div><h2>Little moments,<br/><em>lasting memories.</em></h2></div>
            <p>From the first diya at dusk to the last sparkle in the sky, every moment becomes a memory.</p>
          </div>
          <div className="gallery-grid">
            <article className="gallery-tile gallery-one"><span className="gallery-symbol">✺</span><div><small>01 / THE GLOW</small><h3>Light up<br/>the night.</h3></div></article>
            <article className="gallery-tile gallery-two"><span className="gallery-symbol">✧</span><div><small>02 / THE JOY</small><h3>Celebrate<br/>together.</h3></div></article>
            <article className="gallery-tile gallery-three"><span className="gallery-symbol">❋</span><div><small>03 / THE LOVE</small><h3>Share a little<br/>kindness.</h3></div></article>
          </div>
        </div>
      </section>

      <section className="wishes section-pad" id="wishes">
        <div className="shell wishes-grid">
          <div className="wish-copy">
            <div className="eyebrow">PASS THE LIGHT FORWARD</div>
            <h2>A wish made<br/>just <em>for you.</em></h2>
            <p>Make this Diwali a little more personal. Create a greeting and send a little happiness to someone you love.</p>
            <form className="wish-form" onSubmit={makeWish}>
              <label htmlFor="name">YOUR NAME</label>
              <div className="input-row"><input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name..." maxLength={35}/><button type="submit" aria-label="Generate greeting"><SparkleIcon size={18}/></button></div>
            </form>
          </div>
          <div className="wish-card">
            <div className="wish-card-top"><span>✺ DEEPOTSAV</span><span>20—26</span></div>
            <div className="wish-art">🪔</div>
            <div className="wish-card-content">
              <div className="eyebrow">A FESTIVE WISH</div>
              <h3>Shubh<br/><em>Deepavali</em></h3>
              <AnimatePresence mode="wait">
                <motion.p key={wish || 'default'} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
                  {wish || 'May your days be bright, your heart be light, and your home be filled with endless joy.'}
                </motion.p>
              </AnimatePresence>
              <button className="button button-gold share-button" onClick={shareWish}>Share this wish <Send size={15}/></button>
            </div>
            <div className="wish-card-bottom"><span>WITH LIGHT & LOVE</span><Heart size={14}/><span>HAPPY DIWALI</span></div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-inner">
          <div><a className="brand" href="#home"><span className="brand-mark">✺</span> DEEPOTSAV<span className="brand-dot">.</span></a><p>May your life always find its light.</p></div>
          <div className="footer-right"><span>MADE WITH ✦ FOR THE FESTIVAL OF LIGHTS</span><a href="#home">BACK TO TOP ↑</a></div>
        </div>
      </footer>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:15}}>{toast}</motion.div>}</AnimatePresence>
    </main>
  );
}
