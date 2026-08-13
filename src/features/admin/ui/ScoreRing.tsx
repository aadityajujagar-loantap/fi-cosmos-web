export function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#08b94e" : score >= 60 ? "#f7b500" : "#ef3b3b";

  return (
    <div
      aria-label={`AI risk score ${score}`}
      className="grid h-12 w-12 place-items-center rounded-full text-[11px] font-bold text-[#07183f]"
      style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #edf1f5 0deg)` }}
    >
      <div className="grid h-9 w-9 place-items-center rounded-full bg-white">{score}</div>
    </div>
  );
}
