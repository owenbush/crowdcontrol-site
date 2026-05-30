/* crowd-viz.jsx — the living crowd field behind the hero knob.
   Softly glowing dots (one per voice) drift on a squashed radial field,
   avoiding the central knob region. Drift amplitude + glow are driven by a
   simulated vocal input level so the whole field breathes. Larger/brighter
   dots read as "closer"; small faint ones recede (parallax). */

function hexToRgb(h) {
  const m = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
}

function CrowdViz({ voices, width = 600, height = 260, accent = '#6C63FF' }) {
  const canvasRef = React.useRef(null);
  const st = React.useRef({
    dots: [], level: 0.4, levelTarget: 0.5, t: 0, last: 0, raf: 0, target: voices,
  });
  const [rgb] = React.useState(() => hexToRgb(accent));

  React.useEffect(() => { st.current.target = voices; }, [voices]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const cx = width / 2, cy = height / 2;
    const makeDot = (alpha0 = 0) => {
      let x, y, tries = 0;
      do {
        const ang = Math.random() * Math.PI * 2;
        const rad = (0.16 + Math.pow(Math.random(), 0.8) * 0.92) * (width * 0.5);
        x = cx + Math.cos(ang) * rad;
        y = cy + Math.sin(ang) * rad * 0.62;
        tries++;
      } while ((Math.hypot((x - cx) / 118, (y - cy) / 84) < 1) && tries < 10);
      x = Math.max(14, Math.min(width - 14, x));
      y = Math.max(12, Math.min(height - 12, y));
      const depth = Math.random();
      return {
        x, y, depth,
        size: 2.2 + depth * depth * 7.5,
        baseOpacity: 0.4 + depth * 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.85,
        driftX: 5 + Math.random() * 14,
        driftY: 3 + Math.random() * 9,
        alpha: alpha0,
        targetAlpha: 1,
      };
    };

    // Seed the starting crowd at full alpha so it's visible on the first
    // painted frame (no reliance on a long fade-in ramp).
    st.current.dots = [];
    for (let i = 0; i < st.current.target; i++) st.current.dots.push(makeDot(1));

    const frame = (now) => {
      const s = st.current;
      if (!s.last) s.last = now;
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      s.t += dt;

      // simulated vocal input level — drifts, with occasional new targets
      if (Math.random() < 0.025) s.levelTarget = 0.28 + Math.random() * 0.7;
      s.level += (s.levelTarget - s.level) * 0.05;
      const level = s.level;

      // grow pool to target voice count (new arrivals fade in from 0)
      while (s.dots.length < s.target) s.dots.push(makeDot(0));
      for (let i = 0; i < s.dots.length; i++) {
        s.dots[i].targetAlpha = i < s.target ? 1 : 0;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      const amp = 0.45 + level;
      const glowK = 0.7 + level * 0.5;

      for (const d of s.dots) {
        d.alpha += (d.targetAlpha - d.alpha) * 0.1;
        if (d.alpha < 0.012) continue;
        const dx = Math.sin(s.t * d.speed + d.phase) * d.driftX * amp * (0.35 + d.depth * 0.5);
        const dy = Math.cos(s.t * d.speed * 0.8 + d.phase * 1.3) * d.driftY * amp * (0.35 + d.depth * 0.5);
        const a = d.baseOpacity * d.alpha * (0.65 + level * 0.35);
        ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
        ctx.shadowBlur = d.size * 2.4 * glowK;
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
        ctx.beginPath();
        ctx.arc(d.x + dx, d.y + dy, d.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
      s.raf = requestAnimationFrame(frame);
    };

    // Paint one frame synchronously so a static crowd is visible immediately,
    // even before rAF starts (and even if the tab is backgrounded, which
    // pauses rAF entirely). rAF then takes over the animation when visible.
    frame(performance.now());
    return () => cancelAnimationFrame(st.current.raf);
  }, [width, height, rgb]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block', filter: 'blur(0.3px)' }}
    />
  );
}

Object.assign(window, { CrowdViz });
