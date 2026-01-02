import { useState, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import data from "./data/dashboard_ready.json";

// Components
import Header from "./components/Header";
import PatchPlannerControls from "./components/PatchPlannerControls";
import RankedTable from "./components/RankedTable";
import DetailPanel from "./components/DetailPanel";
import CvssVsAiPlot from "./components/CvssVsAiPlot";
import PatchSchedule from "./components/PatchSchedule";
import DecisionStrip from "./components/DecisionStrip";
import CveUpload from "./components/CveUpload";
import Footer from "./components/Footer";
import Docs from "./components/Docs";

export default function App() {
  const [patchLimit, setPatchLimit] = useState(20);
  const [cvssBand, setCvssBand] = useState("ALL");
  const [weeks, setWeeks] = useState(4);
  const [selected, setSelected] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [uploadedCves, setUploadedCves] = useState(null);

  /* ---------------- DATA PIPELINE ---------------- */

  const scopedData = useMemo(() => {
    // 1. Filter by Upload (if active)
    let base = uploadedCves
      ? data.filter((v) => uploadedCves.includes(v.cve_id))
      : data;

    // 2. Filter by CVSS Band
    base = base.filter((v) => {
      if (cvssBand === "9") return v.cvss >= 9;
      if (cvssBand === "7") return v.cvss >= 7 && v.cvss < 9;
      return true;
    });

    // 3. Asset-aware risk weighting & final calculation
    return base
      .map((v) => {
        const exposureWeight = v.asset_exposure === "internet" ? 1.4 : 1.0;

        const criticalityWeight =
          v.asset_criticality === "high"
            ? 1.3
            : v.asset_criticality === "medium"
            ? 1.1
            : 1.0;

        const finalScore =
          v.ai_risk_score * exposureWeight * criticalityWeight;

        return {
          ...v,
          final_risk_score: finalScore,
          risk_explanation: {
            ai_risk_score: v.ai_risk_score,
            exposure: v.asset_exposure,
            exposure_weight: exposureWeight,
            criticality: v.asset_criticality,
            criticality_weight: criticalityWeight,
            final_risk_score: finalScore,
          },
        };
      })
      .sort((a, b) => b.final_risk_score - a.final_risk_score);
  }, [uploadedCves, cvssBand]);

  // The "Top X" to patch today
  const today = scopedData.slice(0, patchLimit);

  /* ---------------- TRUST METRICS ---------------- */

  const uploadedCount = uploadedCves?.length || 0;
  const matchedCount = uploadedCves ? scopedData.length : 0;
  const unmatchedCount = uploadedCount - matchedCount;

  /* ---------------- SIMULATION ---------------- */

  function simulatePatching(sorted, limit, weeks) {
    // Clone array to avoid mutating state directly
    const remaining = [...sorted];
    return Array.from({ length: weeks }, (_, i) => ({
      week: i + 1,
      vulnerabilities: remaining.splice(0, limit),
    }));
  }

  function runSimulation() {
    setSchedule(simulatePatching(scopedData, patchLimit, weeks));
  }

  /* ---------------- EXPORT ---------------- */

  function exportWeeklyPlans(schedule) {
    if (!schedule || schedule.length === 0) return;

    schedule.forEach((week) => {
      if (!week.vulnerabilities.length) return;

      const rows = week.vulnerabilities;
      // Safety check for empty rows
      if (rows.length === 0) return;
      
      const header = Object.keys(rows[0]).join(",");
      const csv = rows.map((r) => {
         // Handle potential objects/arrays in data (like risk_explanation)
         return Object.values(r).map(val => 
            typeof val === 'object' ? JSON.stringify(val).replace(/,/g, ';') : val
         ).join(",");
      });

      const blob = new Blob([header + "\n" + csv.join("\n")], {
        type: "text/csv",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `week_${week.week}_patch_plan.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <div className="container">
              {/* Decision anchor */}
              <div className="decision-strip">
                {/* Fixed: Use 'today' variable derived above */}
                <DecisionStrip today={today} schedule={schedule} />
              </div>

              {/* Upload CVEs */}
              <div className="upload-box">
                <CveUpload onUpload={setUploadedCves} />

                {uploadedCves && (
                  <div className="hint">
                    {uploadedCount} CVEs uploaded → {matchedCount} matched
                    {unmatchedCount > 0 &&
                      ` → ${unmatchedCount} not in dataset`}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="controls">
                <PatchPlannerControls
                  patchLimit={patchLimit}
                  setPatchLimit={setPatchLimit}
                  cvssBand={cvssBand}
                  setCvssBand={setCvssBand}
                  weeks={weeks}
                  setWeeks={setWeeks}
                  onSimulate={runSimulation}
                />
              </div>

              {/* Export */}
              {schedule.length > 0 && (
                <button
                  onClick={() => exportWeeklyPlans(schedule)}
                  style={{
                    marginTop: "16px",
                    padding: "10px 14px",
                    background: "#22c55e",
                    border: "none",
                    color: "#0f172a",
                    fontWeight: "600",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                >
                  Export Weekly Patch Plan (CSV)
                </button>
              )}

              {/* Patch Today */}
              <section className="today-section">
                <h3>Patch Today</h3>
                <RankedTable
                  data={today}
                  onSelect={setSelected}
                  patchLimit={patchLimit}
                />
              </section>

              {/* Detail Panel + Overlay */}
              {selected && (
                <>
                  <div
                    className="overlay"
                    onClick={() => setSelected(null)}
                  />
                  <DetailPanel
                    vuln={selected}
                    onClose={() => setSelected(null)}
                  />
                </>
              )}

              {/* Patch Schedule */}
              {schedule.length > 0 && (
                <PatchSchedule schedule={schedule} />
              )}

              {/* Insight */}
              {/* Fixed: Use 'scopedData' for the plot */}
              <div className="chart-panel">
                 <CvssVsAiPlot data={scopedData} />
              </div>
            </div>
          }
        />

        <Route path="/docs" element={<Docs />} />
      </Routes>

      <Footer />
    </>
  );
}