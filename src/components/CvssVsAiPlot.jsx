import { useState, useRef } from "react";

export default function CvssVsAiPlot({ data }) {
  // Internal SVG coordinate system (aspect ratio 2:1)
  const width = 800;
  const height = 400;
  const padding = 60;

  const maxCvss = 10;
  const maxRisk = 1;

  const [hovered, setHovered] = useState(null);
  
  // Ref to calculate tooltip position relative to the responsive container
  const containerRef = useRef(null);

  // Helper to determine color based on AI Risk Score (Green/Blue -> Red)
  const getColor = (risk) => {
    if (risk > 0.8) return "#ef4444"; // Red (High)
    if (risk > 0.5) return "#f59e0b"; // Orange (Medium)
    return "#3b82f6"; // Blue (Low)
  };
const plotData = data.filter(
  v =>
    typeof v.cvss === "number" &&
    !Number.isNaN(v.cvss) &&
    typeof v.ai_risk_score === "number" &&
    !Number.isNaN(v.ai_risk_score)
);

  return (
    <div 
      style={{ 
        width: "100%", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div 
        ref={containerRef}
        style={{ 
          width: "100%", 
          maxWidth: "800px", // Limits max width on large screens
          position: "relative",
          background: "linear-gradient(to bottom, #111827, #0f172a)", 
          borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          border: "1px solid #1e293b",
          padding: "20px"
        }}
      >
        <h3 style={{ 
          color: "#f8fafc", 
          margin: "0 0 20px 0", 
          textAlign: "center", 
          fontFamily: "system-ui, sans-serif" 
        }}>
          CVSS vs. AI Risk Score
        </h3>

        {/* Tooltip - positioned based on the hovered data point */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              left: `${(hovered.x / width) * 100}%`,
              top: `${(hovered.y / height) * 100}%`,
              transform: "translate(-50%, -120%)", // Centers tooltip above the dot
              background: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(4px)",
              border: "1px solid #334155",
              padding: "10px 12px",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "0.85rem",
              pointerEvents: "none",
              zIndex: 20,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
              minWidth: "140px"
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "4px", color: "#fff" }}>
              {hovered.data.cve_id}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>CVSS:</span> 
              <span>{hovered.data.cvss}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>AI Risk:</span> 
              <span style={{ color: getColor(hovered.data.ai_risk_score), fontWeight: 600 }}>
                {typeof hovered.data.ai_risk_score === "number"
  ? hovered.data.ai_risk_score.toFixed(2)
  : "—"}
              </span>
            </div>
          </div>
        )}

        {/* Responsive SVG Container */}
        <div style={{ width: "100%", height: "auto", position: 'relative' }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: "100%", height: "auto", overflow: "visible" }}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Grid Lines - Y Axis */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = height - padding - (tick / maxRisk) * (height - 2 * padding);
              return (
                <g key={`grid-y-${tick}`}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {tick.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Grid Lines - X Axis */}
            {[0, 2, 4, 6, 8, 10].map((tick) => {
              const x = padding + (tick / maxCvss) * (width - 2 * padding);
              return (
                <g key={`grid-x-${tick}`}>
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <text
                    x={x}
                    y={height - padding + 20}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Axes Lines */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#94a3b8"
              strokeWidth="2"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Data points */}
            {plotData.map((v, i) => {
              const x = padding + (v.cvss / maxCvss) * (width - 2 * padding);
              const safeRisk = Math.min(Math.max(v.ai_risk_score, 0), maxRisk);

const y =
  height -
  padding -
  (safeRisk / maxRisk) * (height - 2 * padding);
              const isHovered = hovered?.data === v;
              const color = getColor(v.ai_risk_score);

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 4}
                  fill={color}
                  stroke={isHovered ? "#fff" : "none"}
                  strokeWidth={2}
                  opacity={isHovered ? 1 : 0.7}
                  style={{ 
                    transition: "all 0.2s ease", 
                    cursor: "pointer" 
                  }}
                  onMouseEnter={() =>
  setHovered(
    typeof x === "number" && typeof y === "number"
      ? { x, y, data: v }
      : null
  )
}
                />
              );
            })}

            {/* Axis Labels */}
            <text
              x={width / 2}
              y={height - 10}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="14"
              fontWeight="600"
            >
              CVSS Severity Score
            </text>

            <text
              x={-height / 2}
              y={20}
              transform="rotate(-90)"
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="14"
              fontWeight="600"
            >
              AI Risk Probability
            </text>
          </svg>
        </div>

        <p style={{ 
          color: "#94a3b8", 
          fontSize: "0.85rem", 
          marginTop: "10px", 
          textAlign: "center",
          fontStyle: "italic" 
        }}>
          Prioritization Matrix: High CVSS scores (X-axis) do not always correlate with high AI exploitation risk (Y-axis).
        </p>
      </div>
    </div>
  );
}