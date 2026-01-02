export default function PatchPlannerControls({
  patchLimit,
  setPatchLimit,
  cvssBand,
  setCvssBand,
  weeks,
  setWeeks,
  onSimulate
}) {
  return (
    <div className="controls">
      {/* Patch capacity */}
      <label>
        Patch Capacity (per week): {patchLimit}
        <input
          type="range"
          min="5"
          max="50"
          value={patchLimit}
          onChange={e => setPatchLimit(Number(e.target.value))}
        />
      </label>

      {/* CVSS band filter */}
      <label>
        CVSS Band:
        <select
          value={cvssBand}
          onChange={e => setCvssBand(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="9">9–10 (Critical)</option>
          <option value="7">7–8.9 (High)</option>
        </select>
      </label>

      {/* Weeks selector */}
      <label>
        Simulate Weeks:
        <select
          value={weeks}
          onChange={e => setWeeks(Number(e.target.value))}
        >
          <option value={1}>1 week</option>
          <option value={2}>2 weeks</option>
          <option value={4}>4 weeks</option>
          <option value={8}>8 weeks</option>
        </select>
      </label>

      {/* Run simulation */}
      <button
        onClick={onSimulate}
        style={{
          padding: "8px 12px",
          background: "#3b82f6",
          border: "none",
          color: "#e5e7eb",
          cursor: "pointer",
          borderRadius: "4px"
        }}
      >
        Run Patch Simulation
      </button>
    </div>
  );
}
