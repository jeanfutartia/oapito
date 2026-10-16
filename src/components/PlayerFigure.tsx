interface Props {
  sx: number;
  sy: number;
  h: number;
  color: string;
  number: number;
  label?: string;
  dir?: 1 | -1;
  phase?: number;
  reacts?: 'FALL' | 'SLIDE' | 'ARM';
  reactProgress?: number;
  highlight?: boolean;
  gk?: boolean;
  ghost?: boolean;
}

export const PlayerFigure = ({
  sx,
  sy,
  h,
  color,
  number,
  label,
  dir = 1,
  phase = 0,
  reacts,
  reactProgress = 0,
  highlight = false,
  gk = false,
  ghost = false
}: Props) => {
  const u = h / 110;
  const swing = Math.sin(phase) * 16;
  const rot = reacts === 'FALL' ? -75 * reactProgress : reacts === 'SLIDE' ? -80 * reactProgress : 0;
  const arm = reacts === 'ARM' ? reactProgress : 0;
  const skin = '#e0ac84';
  const shirt = gk ? '#16a34a' : color;

  return (
    <g transform={`translate(${sx} ${sy}) scale(${u})`} opacity={ghost ? 0.45 : 1}>
      <ellipse cx={0} cy={0} rx={24} ry={6} fill="rgba(0,0,0,0.35)" />
      <g transform={`scale(${dir} 1) rotate(${rot} 0 -10)`}>
        <line x1={0} y1={-50} x2={-swing} y2={-3} stroke="#1e293b" strokeWidth={9} strokeLinecap="round" />
        <line x1={-swing} y1={-2} x2={-swing + 10} y2={-2} stroke="#facc15" strokeWidth={6} strokeLinecap="round" />
        <line x1={0} y1={-50} x2={swing} y2={-3} stroke="#0f172a" strokeWidth={9} strokeLinecap="round" />
        <line x1={swing} y1={-2} x2={swing + 10} y2={-2} stroke="#facc15" strokeWidth={6} strokeLinecap="round" />
        <rect x={-11} y={-60} width={22} height={14} rx={4} fill="#f8fafc" />
        <rect x={-12} y={-94} width={24} height={38} rx={7} fill={shirt} stroke="#ffffff" strokeWidth={1.5} />
        <line x1={0} y1={-88} x2={-swing * 0.6 - 4} y2={-60} stroke={skin} strokeWidth={6} strokeLinecap="round" />
        <line
          x1={0}
          y1={-88}
          x2={arm > 0 ? 4 + 34 * arm : swing * 0.6 + 4}
          y2={arm > 0 ? -60 - 28 * arm : -60}
          stroke={arm > 0.4 ? '#ef4444' : skin}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle cx={0} cy={-104} r={10} fill={skin} stroke="#1e293b" strokeWidth={1.5} />
        <path d="M -9 -107 Q 0 -121 9 -107 Z" fill="#334155" />
      </g>
      {rot === 0 && (
        <text x={0} y={-66} textAnchor="middle" fontSize={15} fontWeight={800} fill="#ffffff">
          {number}
        </text>
      )}
      {highlight && (
        <circle
          cx={0}
          cy={-55}
          r={54}
          fill="none"
          stroke="#facc15"
          strokeWidth={3}
          strokeDasharray="8 6"
          className="animate-pulse"
        />
      )}
      {label && (
        <g transform={`translate(0 -126) scale(${1 / u})`}>
          <rect x={-38} y={-15} width={76} height={15} rx={4} fill="rgba(2,6,23,0.9)" stroke="#475569" />
          <text x={0} y={-4} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f8fafc">
            {label} #{number}
          </text>
        </g>
      )}
    </g>
  );
};
