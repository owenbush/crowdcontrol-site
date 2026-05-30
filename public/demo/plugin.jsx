/* plugin.jsx — interactive CrowdControl plugin demo for the marketing site. */

const PARAMS = [
  { key: 'depth',   label: 'DEPTH',   def: 0.55, fmt: (v) => Math.round(v * 100) + '%' },
  { key: 'timing',  label: 'TIMING',  def: 0.32, fmt: (v) => Math.round(v * 200) + ' ms' },
  { key: 'formant', label: 'FORMANT', def: 0.46, fmt: (v) => Math.round(v * 100) + '%' },
  { key: 'width',   label: 'STEREO',  def: 0.62, fmt: (v) => Math.round(v * 100) + '%' },
  { key: 'chaos',   label: 'CHAOS',   def: 0.40, fmt: (v) => Math.round(v * 100) + '%' },
  { key: 'mix',     label: 'DRY/WET', def: 0.70, fmt: (v) => Math.round(v * 100) + '%' },
];

function ParamKnob({ label, value, onChange, fmt }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
    >
      <div style={{ height: 15, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
                    color: 'var(--accent-hi)', letterSpacing: '0.5px',
                    opacity: hover ? 1 : 0, transition: 'opacity .15s' }}>
        {fmt(value)}
      </div>
      <Knob size={70} lineWidth={4} value={value} onChange={onChange} />
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '1.4px',
                    color: 'var(--text-dim)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function CrowdPlugin({ initialVoices = 16 }) {
  const [voices, setVoices] = React.useState(initialVoices);
  const [params, setParams] = React.useState(
    () => Object.fromEntries(PARAMS.map((p) => [p.key, p.def]))
  );

  const voiceVal = (voices - 1) / 127;
  const setVoiceVal = (v) => setVoices(Math.round(1 + _clamp(v) * 127));
  const setParam = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  return (
    <div className="crowd-plugin">
      {/* Header */}
      <div style={{ height: 60, position: 'relative', display: 'flex',
                    alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 30, lineHeight: 1, letterSpacing: '3px',
                        textShadow: '0 0 18px rgba(108,99,255,0.45)' }}>
            <span style={{ fontWeight: 700 }}>CROWD</span>
            <span style={{ fontWeight: 300, color: 'var(--accent-hi)' }}>CONTROL</span>
          </div>
          <div style={{ height: 2, width: 64, margin: '8px auto 0',
                        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                        boxShadow: '0 0 10px var(--accent)' }} />
        </div>
        <div style={{ position: 'absolute', right: 18, top: 14, fontFamily: 'var(--mono)',
                      fontSize: 11, color: 'var(--text-faint)', letterSpacing: '1px' }}>v1.0</div>
      </div>

      {/* Hero: crowd field + voices knob */}
      <div style={{ height: 260, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <CrowdViz voices={voices} width={600} height={260} />
        </div>
        <div style={{ position: 'absolute', left: '50%', top: '46%', width: 240, height: 240,
                      transform: 'translate(-50%,-50%)', borderRadius: '50%', pointerEvents: 'none',
                      background: 'radial-gradient(circle, rgba(26,26,46,0.78) 30%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <HeroKnob size={160} value={voiceVal} onChange={setVoiceVal} />
          <div style={{ marginTop: 4, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3.5px',
                          color: 'var(--text-dim)' }}>VOICES</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 30, fontWeight: 700,
                          lineHeight: 1.1, fontVariantNumeric: 'tabular-nums',
                          textShadow: '0 0 16px rgba(108,99,255,0.5)' }}>{voices}</div>
          </div>
        </div>
      </div>

      {/* Parameter strip */}
      <div style={{ height: 150, display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '0 30px' }}>
        {PARAMS.map((p) => (
          <ParamKnob key={p.key} label={p.label} value={params[p.key]}
                     fmt={p.fmt} onChange={(v) => setParam(p.key, v)} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ height: 30, display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '0 20px',
                    borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px',
                      color: 'var(--text-faint)' }}>CrowdControl</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px',
                      color: 'var(--text-faint)' }}>VOICE&nbsp;&rarr;&nbsp;CROWD</div>
      </div>
    </div>
  );
}

Object.assign(window, { CrowdPlugin, ParamKnob, PARAMS });
