/**
 * Built-in Scientific & Production HTML Samples
 * Rich real-world templates for immediate testing, crushing, and parametric manipulation.
 */

export interface SampleTemplate {
  id: string;
  title: string;
  category: 'science' | 'genomics' | 'chemistry' | 'modern-web';
  badge: string;
  description: string;
  html: string;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'biotech-molecular',
    title: 'AlphaFold & PDB Molecular Visualizer (TP53)',
    category: 'science',
    badge: 'AlphaFold / PDB / UniProt',
    description: 'Structural biology dashboard with pLDDT 4-band confidence scale, UniProt P04637 annotations, and 3Dmol.js import map.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AlphaFold Structure Explorer - TP53 (P04637)</title>
  <script type="importmap">
  {
    "imports": {
      "3dmol": "https://esm.sh/3dmol@2.5.3",
      "smiles-drawer": "https://esm.sh/smiles-drawer@2.1.7",
      "lucide": "https://esm.sh/lucide@0.475.0"
    }
  }
  </script>
  <style>
    :root {
      --bg-canvas: #f8fafc;
      --card-bg: #ffffff;
      --border-color: #e2e8f0;
      --primary-accent: #0b57d0;
      --plddt-vh: #0053d6;
      --plddt-conf: #65cbf3;
      --plddt-low: #ffdb13;
      --plddt-vlow: #ff7d45;
    }
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-canvas);
      color: #1e293b;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card-bg);
      padding: 18px 24px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      margin-bottom: 20px;
    }
    .protein-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
    .badge-provenance {
      background: #eff6ff;
      color: var(--primary-accent);
      border: 1px solid #bfdbfe;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .grid-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
    }
    .viewer-box {
      height: 380px;
      background: #0f172a;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      position: relative;
    }
    .confidence-legend {
      display: flex;
      gap: 12px;
      margin-top: 14px;
      padding: 10px;
      background: #f1f5f9;
      border-radius: 8px;
      font-size: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }
    .mono {
      font-family: monospace;
      font-size: 13px;
    }
    .btn {
      background: var(--primary-accent);
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="protein-title">Cellular Tumor Antigen p53 (TP53)</div>
      <div class="mono" style="color: #64748b; margin-top: 4px;">UniProt: P04637 | Organism: Homo sapiens (Human) | Length: 393 aa</div>
    </div>
    <div>
      <span class="badge-provenance">[Predicted by AlphaFold DB v6]</span>
    </div>
  </div>

  <div class="grid-layout">
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px;">3D Interactive Conformation</h3>
        <button id="btn-spin" class="btn">Toggle Rotation</button>
      </div>
      <div id="mol-viewer" class="viewer-box">
        <div style="font-size: 40px; margin-bottom: 8px;">🧬</div>
        <div style="color: #e2e8f0; font-weight: 600;">AlphaFold AF-P04637-F1 mmCIF Model</div>
        <div class="mono" style="font-size: 12px; margin-top: 4px;">Resolution: Full Atomic Continuum (0.1 Å grid)</div>
      </div>
      <div class="confidence-legend">
        <span style="font-weight: 600; color: #475569;">pLDDT Confidence:</span>
        <div class="legend-item"><div class="dot" style="background: var(--plddt-vh);"></div> Very High (&gt;90)</div>
        <div class="legend-item"><div class="dot" style="background: var(--plddt-conf);"></div> Confident (70-90)</div>
        <div class="legend-item"><div class="dot" style="background: var(--plddt-low);"></div> Low (50-70)</div>
        <div class="legend-item"><div class="dot" style="background: var(--plddt-vlow);"></div> Very Low (&lt;50)</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0; font-size: 16px;">Functional Domains</h3>
      <ul style="padding-left: 20px; line-height: 1.8; font-size: 14px; margin-bottom: 20px;">
        <li><strong>TAD 1 (1-40)</strong>: Transactivation Domain</li>
        <li><strong>DBD (102-292)</strong>: DNA-Binding Core Domain</li>
        <li><strong>TET (325-356)</strong>: Tetramerization Domain</li>
        <li><strong>CTD (363-393)</strong>: C-Terminal Regulatory</li>
      </ul>
      <div style="border-top: 1px solid var(--border-color); padding-top: 14px;">
        <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px;">Conserved Sequence Motif</div>
        <div class="mono" style="background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; word-break: break-all;">
          MEEPQSDPSV EPPLSQETFS DLWKLLPENN VLSPLPSQAM DDLMLSPDDI EQWFTEDPGP
        </div>
      </div>
    </div>
  </div>

  <script>
    let isSpinning = false;
    const spinBtn = document.getElementById('btn-spin');
    const viewer = document.getElementById('mol-viewer');

    if (spinBtn && viewer) {
      spinBtn.addEventListener('click', function() {
        isSpinning = !isSpinning;
        spinBtn.textContent = isSpinning ? 'Pause Rotation' : 'Toggle Rotation';
        viewer.style.borderColor = isSpinning ? '#38bdf8' : '#e2e8f0';
      });
    }
  </script>
</body>
</html>`
  },
  {
    id: 'chemical-drug-discovery',
    title: 'Pharmacology & Drug Discovery Scout (Imatinib)',
    category: 'chemistry',
    badge: 'PubChem / ChEMBL / FDA',
    description: 'Small molecule target affinity report with Lipinski Rule of 5 metrics, SMILES notation, and bioactivity table.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pharmacology Scout - Imatinib (Gleevec)</title>
  <script type="importmap">
  {
    "imports": {
      "pubchem-api": "https://cdn.jsdelivr.net/npm/pubchem-api@1.0.0/index.js",
      "chembl-client": "https://cdn.jsdelivr.net/npm/chembl-client@0.2.1/index.js",
      "smiles-drawer": "https://cdn.jsdelivr.net/npm/smiles-drawer@2.1.7/dist/smiles-drawer.min.js"
    }
  }
  </script>
  <style>
    :root {
      --bg-body: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --color-brand: #0284c7;
      --border-subtle: #cbd5e1;
    }
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: var(--bg-body);
      color: var(--text-main);
      padding: 24px;
      margin: 0;
    }
    .header-card {
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .chem-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .chem-card {
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 20px;
    }
    .table-spec {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .table-spec th, .table-spec td {
      border-bottom: 1px solid #f1f5f9;
      padding: 10px 8px;
      text-align: left;
    }
    .pill-pass {
      background: #ecfdf5;
      color: #059669;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header-card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin: 0; font-size: 22px;">Imatinib Mesylate (STI-571)</h1>
        <div style="color: #64748b; font-size: 13px; margin-top: 4px;">PubChem CID: 5291 | ChEMBL ID: CHEMBL941 | FDA Approved: 2001</div>
      </div>
      <div style="text-align: right;">
        <span class="pill-pass">Lipinski Rule of 5: Passed (0 violations)</span>
      </div>
    </div>
  </div>

  <div class="chem-grid">
    <div class="chem-card">
      <h3 style="margin-top: 0; font-size: 16px;">Physicochemical Properties</h3>
      <table class="table-spec">
        <tr><td>Molecular Weight (MW)</td><td><strong>493.6 g/mol</strong> (&lt; 500 Da)</td></tr>
        <tr><td>Calculated LogP (AlogP)</td><td><strong>3.5</strong> (&lt; 5)</td></tr>
        <tr><td>H-Bond Donors (HBD)</td><td><strong>2</strong> (&le; 5)</td></tr>
        <tr><td>H-Bond Acceptors (HBA)</td><td><strong>7</strong> (&le; 10)</td></tr>
        <tr><td>Rotatable Bonds</td><td><strong>7</strong> (&le; 10)</td></tr>
        <tr><td>Topological Polar Surface Area</td><td><strong>86.3 Å²</strong> (&le; 140 Å²)</td></tr>
      </table>
    </div>

    <div class="chem-card">
      <h3 style="margin-top: 0; font-size: 16px;">Target Binding Bioactivities (ChEMBL)</h3>
      <table class="table-spec">
        <thead>
          <tr style="color: #64748b;">
            <th>Target</th>
            <th>Mechanism</th>
            <th>Affinity IC50</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>BCR-ABL1 Kinase</td><td>Competitive Inhibitor</td><td><strong>38 nM</strong></td></tr>
          <tr><td>KIT Proto-oncogene</td><td>Allosteric Inhibitor</td><td><strong>410 nM</strong></td></tr>
          <tr><td>PDGFR-beta</td><td>ATP Pocket Binding</td><td><strong>580 nM</strong></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="header-card" style="margin-top: 20px;">
    <h3 style="margin-top: 0; font-size: 15px;">Canonical Isomeric SMILES</h3>
    <code style="font-family: monospace; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; display: block; font-size: 12px; word-break: break-all;">
      Cc1ccc(cc1Nc2nccc(n2)c3cccnc3)NC(=O)c4ccc(cc4)CN5CCN(CC5)C
    </code>
  </div>
</body>
</html>`
  },
  {
    id: 'modern-web-app',
    title: 'Modern Web Application (Import Maps & Interactive UI)',
    category: 'modern-web',
    badge: 'ES Modules / CDN / Deduplication',
    description: 'Multi-package web app with redundant CDN prefixes, modular event listeners, and interactive UI widgets.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmniStore Pro - Cloud Inventory</title>
  <script type="importmap">
  {
    "imports": {
      "preact": "https://esm.sh/preact@10.25.4",
      "preact/hooks": "https://esm.sh/preact@10.25.4/hooks",
      "canvas-confetti": "https://esm.sh/canvas-confetti@1.9.4",
      "lucide": "https://esm.sh/lucide@0.475.0",
      "lodash-es": "https://esm.sh/lodash-es@4.17.21"
    }
  }
  </script>
  <style>
    body {
      margin: 0;
      background: #0f172a;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 32px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .panel {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #38bdf8;
      margin: 0 0 8px 0;
    }
    .btn-primary {
      background: #38bdf8;
      color: #0f172a;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s;
    }
    .btn-primary:active {
      transform: scale(0.97);
    }
    .counter-display {
      font-size: 48px;
      font-weight: 800;
      margin: 16px 0;
      color: #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="panel">
      <h1 class="title">OmniStore Live Node</h1>
      <p style="color: #94a3b8; margin: 0 0 16px 0;">Demonstration of nested import maps, repetitive CDN endpoints, and event harnesses.</p>
      
      <div style="text-align: center; padding: 20px 0;">
        <div style="color: #94a3b8; font-size: 14px;">Active Event Counter</div>
        <div id="counter-val" class="counter-display">0</div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="btn-inc" class="btn-primary">Increment (+1)</button>
          <button id="btn-reset" class="btn-primary" style="background: #475569; color: #fff;">Reset</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    let count = 0;
    const countDisplay = document.getElementById('counter-val');
    const incBtn = document.getElementById('btn-inc');
    const resetBtn = document.getElementById('btn-reset');

    if (incBtn && countDisplay) {
      incBtn.addEventListener('click', () => {
        count++;
        countDisplay.textContent = count;
      });
    }

    if (resetBtn && countDisplay) {
      resetBtn.addEventListener('click', () => {
        count = 0;
        countDisplay.textContent = count;
      });
    }
  </script>
</body>
</html>`
  }
];
