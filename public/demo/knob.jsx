/* knob.jsx — arc-style rotary knob for CROWD.
   270° sweep, dark track + illuminated value arc, white radial pointer,
   beveled center dot, optional radial glow. Vertical-drag to change.
   States: idle / hover / active (auto, or forced via `state` prop). */

const _clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

function Knob({
  size = 160,
  value = 0.5,
  onChange,
  lineWidth,
  accent = '#6C63FF',
  accentHi = '#8B83FF',
  track = '#2D2D44',
  centerColor = '#3D3D55',
  glow = false,             // faint radial halo behind (hero)
  interactive = true,
  state: forced = null,      // 'idle' | 'hover' | 'active'
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const drag = React.useRef(null);
  const vState = forced ?? (active ? 'active' : hover ? 'hover' : 'idle');

  const lw = lineWidth ?? Math.max(3, size * 0.05);
  const cx = size / 2, cy = size / 2;
  const pad = lw / 2 + (glow ? size * 0.05 : size * 0.03);
  const r = size / 2 - pad;
  const START = 225, SWEEP = 270;

  const polar = (deg, rad = r) => {
    const a = (deg * Math.PI) / 180;
    return [cx + rad * Math.sin(a), cy - rad * Math.cos(a)];
  };
  const arc = (a0, a1, rad = r) => {
    const [x0, y0] = polar(a0, rad), [x1, y1] = polar(a1, rad);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${rad} ${rad} 0 ${large} 1 ${x1} ${y1}`;
  };

  const v = _clamp(value);
  const valAngle = START + SWEEP * v;
  const [pIn, pInY] = polar(valAngle, r * 0.36);
  const [pOut, pOutY] = polar(valAngle, r * 0.66);
  const rc = size * 0.155;             // center dot radius

  const valStroke = vState === 'idle' ? accent : accentHi;
  const glowPx = (vState === 'active' ? 0.10 : vState === 'hover' ? 0.06 : 0.03) * size;
  const haloOpacity = vState === 'active' ? 0.20 : vState === 'hover' ? 0.14 : 0.09;

  // vertical-drag → value. ~210px = full sweep. Listeners on window so the
  // drag survives the pointer leaving the knob; the design-canvas only pans
  // on background pointerdowns, so these never collide.
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
      drag.current = null;
      setActive(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      style={{ position: 'relative', width: size, height: size, touchAction: 'none',
               cursor: interactive ? (active ? 'grabbing' : 'ns-resize') : 'default' }}
      onPointerDown={onDown}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
    >
      {glow && (
        <div style={{
          position: 'absolute', inset: -size * 0.22, borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}${Math.round(haloOpacity*255).toString(16).padStart(2,'0')} 0%, transparent 62%)`,
          pointerEvents: 'none', transition: 'opacity .25s',
        }} />
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', position: 'relative', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`cdot-${size}-${Math.round(value*1000)}`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#50506e" />
            <stop offset="55%" stopColor={centerColor} />
            <stop offset="100%" stopColor="#262638" />
          </radialGradient>
        </defs>

        {/* dark track */}
        <path d={arc(START, START + SWEEP)} fill="none" stroke={track}
              strokeWidth={lw} strokeLinecap="round" />

        {/* illuminated value arc */}
        {v > 0.001 && (
          <path d={arc(START, valAngle)} fill="none" stroke={valStroke}
                strokeWidth={lw} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 ${glowPx}px ${accent})`, transition: 'stroke .15s' }} />
        )}

        {/* center dot + bevel + drop shadow */}
        <circle cx={cx} cy={cy + size * 0.012} r={rc} fill="rgba(0,0,0,0.45)" />
        <circle cx={cx} cy={cy} r={rc} fill={`url(#cdot-${size}-${Math.round(value*1000)})`}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* white radial pointer */}
        <line x1={pIn} y1={pInY} x2={pOut} y2={pOutY}
              stroke="#ffffff" strokeWidth={Math.max(1.5, size * 0.014)} strokeLinecap="round"
              style={{ opacity: vState === 'idle' ? 0.88 : 1 }} />
      </svg>
    </div>
  );
}

Object.assign(window, { Knob, _clamp });
