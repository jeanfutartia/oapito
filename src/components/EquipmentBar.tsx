export const EquipmentBar = () => {
  const items = [
    ['🔔', 'Apito FIFA'],
    ['🟨🟥', 'Cartões'],
    ['💨', 'Spray'],
    ['⌚', 'Smartwatch'],
    ['🎧', 'Rádio VAR'],
    ['🚩', 'Bandeirolas eletrônicas']
  ];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl font-mono text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-black text-amber-400 uppercase text-[11px] tracking-wider">🎽 Equipamento oficial</span>
        <span className="text-[10px] text-emerald-400 font-bold">Fornecido pela federação</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map(([icon, name]) => (
          <span key={name} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300">
            {icon} {name} <span className="text-emerald-400">✓</span>
          </span>
        ))}
      </div>
    </div>
  );
};
