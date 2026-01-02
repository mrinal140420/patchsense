export default function Docs() {
  return (
    <div className="container docs">
      <header className="docs-header">
        <h2>PatchSense Documentation</h2>
        <p className="hint">
          How PatchSense converts vulnerability data into actionable
          patching decisions.
        </p>
      </header>

      <section>
        <h3>Problem Statement</h3>
        <p>
          CVSS scores measure technical severity, not operational risk.
          In real environments, vulnerabilities are exploited based on
          exposure, asset value, and attacker behavior — not scores alone.
        </p>
        <p>
          PatchSense bridges this gap by ranking vulnerabilities using
          AI-driven likelihood combined with asset context.
        </p>
      </section>

      <section>
        <h3>Core Scoring Components</h3>
        <ul>
          <li>
            <strong>AI Risk Score</strong> — Predicted likelihood of
            exploitation based on historical patterns.
          </li>
          <li>
            <strong>Asset Exposure</strong> — Whether the asset is
            internet-facing or internally scoped.
          </li>
          <li>
            <strong>Asset Criticality</strong> — Business impact if the
            asset is compromised.
          </li>
        </ul>
      </section>

      <section>
        <h3>Final Risk Calculation</h3>
        <p>
          PatchSense computes a final operational risk score using the
          following formula:
        </p>

        <pre className="formula">
Final Risk Score =
  AI Risk Score × Exposure Weight × Criticality Weight
        </pre>

        <p className="note">
          This ensures that high-impact, exposed assets are prioritized
          even when CVSS scores appear moderate.
        </p>
      </section>

      <section>
        <h3>Patch Planning Logic</h3>
        <p>
          Vulnerabilities are sorted by final risk score and grouped into
          weekly patch plans based on the organization’s patching capacity.
        </p>
        <p>
          This allows teams to reduce overall risk progressively without
          overwhelming operations.
        </p>
      </section>

      <section>
        <h3>Intended Use</h3>
        <ul>
          <li>Security Operations & Vulnerability Management teams</li>
          <li>Patch prioritization and planning</li>
          <li>Risk-based remediation reporting</li>
        </ul>
      </section>
    </div>
  );
}
