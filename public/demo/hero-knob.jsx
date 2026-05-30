/* hero-knob.jsx — the futuristic chrome Voices knob.
   Layers (outside → in):
     · lit tick-ring (futuristic value readout, 270° sweep)
     · polished metal bezel (conic sheen + raised bevel)
     · recessed dark-glass face with a glossy top reflection
     · rotating glowing accent indicator
   Vertical-drag to change. States: idle / hover / active. */

function HeroKnob({
  size = 160,
  value = 0.5,
  onChange,
  accent = '#6C63FF',
  accentHi = '#8B83FF',
  interactive = true,
  state: forced = null,
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const drag = React.useRef(null);
  const vState = forced ?? (active ? 'active' : hover ? 'hover' : 'idle');
  const v = _clamp(value);

  const cx = size / 2, cy = size / 2;
  const START = 225, SWEEP = 270;
  const polar = (deg, rad) => {
    const a = (deg * Math.PI) / 180;
    return [cx + rad * Math.sin(a), cy - rad * Math.cos(a)];
  };

  // tick ring
  const N = 44;
  const rOut = size * 0.475, rIn = size * 0.41;
  const ticks = [];
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const ang = START + SWEEP * f;
    const [x0, y0] = polar(ang, rIn);
    const [x1, y1] = polar(ang, rOut);
    ticks.push({ x0, y0, x1, y1, lit: f <= v + 0.0001 });
  }

  const haloOp = vState === 'active' ? 0.28 : vState === 'hover' ? 0.18 : 0.10;
  const litGlow = vState === 'active' ? 4 : vState === 'hover' ? 3 : 2;
  const indDeg = -135 + 270 * v;
  const bezel = size * 0.72;
  const face = size * 0.54;
  const indGlow = vState === 'active' ? 14 : vState === 'hover' ? 10 : 7;

  const onDown = (e) => {
    if (!interactive) return;
    e.preventDefault(); e.stopPropagation();
    setActive(true);
    drag.current = { y: e.clientY, v };
    const move = (ev) => {
      if (!drag.current) return;
      const dy = drag.current.y - ev.clientY;
      const fine = ev.shiftKey ? 0.25 : 1;
      onChange && onChange(_clamp(drag.current.v + (dy / 210) * fine));
    };
    const up = () => {
      drag.current = null; setActive(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const ring = (px) => ({
    position: 'absolute', left: '50%', top: '50%',
    transform: 'translate(-50%,-50%)', width: px, height: px, borderRadius: '50%',
  });

  return (
    <div
      style={{ position: 'relative', width: size, height: size, touchAction: 'none',
               cursor: interactive ? (active ? 'grabbing' : 'ns-resize') : 'default' }}
      onPointerDown={onDown}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
    >
      {/* accent halo */}
      <div style={{ position: 'absolute', inset: -size * 0.2, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}${Math.round(haloOp*255).toString(16).padStart(2,'0')} 0%, transparent 64%)`,
        pointerEvents: 'none', transition: 'background .25s' }} />

      {/* tick ring */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
           style={{ position: 'absolute', inset: 0, display: 'block', overflow: 'visible' }}>
        {ticks.map((t, i) => (
          <line key={i} x1={t.x0} y1={t.y0} x2={t.x1} y2={t.y1}
            stroke={t.lit ? accentHi : 'rgba(150,150,190,0.18)'}
            strokeWidth={t.lit ? 2.4 : 1.6} strokeLinecap="round"
            style={t.lit ? { filter: `drop-shadow(0 0 ${litGlow}px ${accent})` } : null} />
        ))}
      </svg>

      {/* polished metal bezel */}
      <div style={{ ...ring(bezel),
        background: `conic-gradient(from 142deg,
          #cdccea, #45455f, #a9a7cd, #2c2c42,
          #d8d6f2, #50506c, #9694bd, #303048, #cdccea)`,
        boxShadow: '0 7px 18px rgba(0,0,0,0.55), inset 0 2px 2px rgba(255,255,255,0.55), inset 0 -5px 9px rgba(0,0,0,0.5)' }} />

      {/* recessed dark-glass face */}
      <div style={{ ...ring(face),
        background: 'radial-gradient(circle at 40% 30%, #44446a 0%, #26263e 46%, #141426 100%)',
        boxShadow: `inset 0 3px 9px rgba(0,0,0,0.75), inset 0 -2px 4px rgba(255,255,255,0.05), 0 0 ${indGlow}px ${accent}33`,
        transition: 'box-shadow .25s' }} />

      {/* glossy top reflection on the face */}
      <div style={{ ...ring(face), pointerEvents: 'none',
        background: 'radial-gradient(120% 62% at 50% 6%, rgba(255,255,255,0.22), transparent 56%)' }} />

      {/* rotating glowing indicator */}
      <div style={{ ...ring(face), transform: `translate(-50%,-50%) rotate(${indDeg}deg)`,
        transition: active ? 'none' : 'transform .12s ease-out', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: '50%', top: face * 0.1,
          transform: 'translateX(-50%)', width: Math.max(3, size * 0.022), height: face * 0.3,
          borderRadius: 4, background: accentHi,
          boxShadow: `0 0 ${indGlow}px ${accent}, 0 0 ${indGlow*2}px ${accent}` }} />
      </div>

      {/* tiny center pivot */}
      <div style={{ ...ring(size * 0.07),
        background: 'radial-gradient(circle at 40% 35%, #6a6a8e, #2a2a40)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25)' }} />
    </div>
  );
}

Object.assign(window, { HeroKnob });
