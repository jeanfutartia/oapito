export const ProBadge = ({ label = 'PRO' }: { label?: string }) => (
  <span
    title="Esta função poderá fazer parte de um plano pago no futuro. Por enquanto é grátis para todos."
    className="inline-flex items-center gap-1 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-600 text-black align-middle whitespace-nowrap"
  >
    ⭐ {label} <span className="font-semibold opacity-80">• grátis agora</span>
  </span>
);
