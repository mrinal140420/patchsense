export default function DecisionStrip({ today, schedule }) {
  if (!today || today.length === 0) return null;

  const avgRisk =
    today.reduce((s, v) => s + v.ai_risk_score, 0) / today.length;

  let totalPlanned = 0;
  let initialRisk = 0;
  let finalRisk = 0;

  if (schedule && schedule.length > 0) {
    const all = schedule.flatMap(w => w.vulnerabilities);
    totalPlanned = all.length;
    initialRisk = all.reduce((s, v) => s + v.ai_risk_score, 0);
    finalRisk = initialRisk * 0.58; // heuristic for “risk reduced”
  }

  return (
    <div className="decision-strip">
      <div>
        <strong>Patch Today</strong>
        <div className="metric">{today.length} vulnerabilities</div>
      </div>

      <div>
        <strong>Avg Risk</strong>
        <div className="metric">{avgRisk.toFixed(2)}</div>
      </div>

      <div>
        <strong>Planned (Weeks)</strong>
        <div className="metric">{totalPlanned}</div>
      </div>

      <div>
        <strong>Risk Reduction</strong>
        <div className="metric">
          ↓ {(initialRisk - finalRisk).toFixed(1)}
        </div>
      </div>
    </div>
  );
}
