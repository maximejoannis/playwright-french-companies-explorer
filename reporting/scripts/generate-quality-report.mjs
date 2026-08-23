import { spawnSync } from 'node:child_process';
import console from 'node:console';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const PROJECT_ROOT = process.cwd();
const OUTPUT_DIRECTORY = path.join(PROJECT_ROOT, 'quality-report');
const HTML_REPORT_PATH = path.join(OUTPUT_DIRECTORY, 'index.html');
const JSON_REPORT_PATH = path.join(OUTPUT_DIRECTORY, 'summary.json');

const CHECKS = [
  {
    id: 'prettier',
    name: 'Prettier',
    description: 'Vérification du formatage des fichiers versionnés.',
    script: 'format:check',
  },
  {
    id: 'eslint',
    name: 'ESLint',
    description: 'Analyse statique TypeScript et bonnes pratiques Playwright.',
    script: 'lint',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Vérification du typage sans génération de fichiers.',
    script: 'typecheck',
  },
];

function run(command, args) {
  return spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      NO_COLOR: '1',
    },
    shell: false,
    windowsHide: true,
  });
}

function executeCheck(check) {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const startedAt = Date.now();
  const result = run(npmCommand, ['run', check.script]);
  const durationMs = Date.now() - startedAt;
  const exitCode = result.status ?? 1;
  const output = [result.stdout, result.stderr]
    .filter(Boolean)
    .join('\n')
    .trim();

  return {
    ...check,
    command: `npm run ${check.script}`,
    status: exitCode === 0 ? 'passed' : 'failed',
    exitCode,
    durationMs,
    output:
      output ||
      (result.error?.message ?? 'Aucune sortie produite par la commande.'),
  };
}

function readGitValue(args, fallback) {
  const result = run('git', args);

  if (result.status !== 0) {
    return fallback;
  }

  return result.stdout.trim() || fallback;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDuration(durationMs) {
  if (durationMs < 1_000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1_000).toFixed(2)} s`;
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'medium',
    timeZone: 'Europe/Paris',
  }).format(new Date(isoDate));
}

function createCheckCard(check) {
  const passed = check.status === 'passed';
  const statusLabel = passed ? 'Conforme' : 'Non conforme';
  const statusIcon = passed ? '✓' : '×';

  return `
    <article class="check-card check-card--${check.status}">
      <div class="check-card__header">
        <div>
          <p class="check-card__category">Contrôle qualité</p>
          <h2>${escapeHtml(check.name)}</h2>
        </div>

        <span class="status status--${check.status}">
          <span aria-hidden="true">${statusIcon}</span>
          ${statusLabel}
        </span>
      </div>

      <p class="check-card__description">
        ${escapeHtml(check.description)}
      </p>

      <dl class="check-card__metrics">
        <div>
          <dt>Commande</dt>
          <dd><code>${escapeHtml(check.command)}</code></dd>
        </div>
        <div>
          <dt>Durée</dt>
          <dd>${escapeHtml(formatDuration(check.durationMs))}</dd>
        </div>
        <div>
          <dt>Code de sortie</dt>
          <dd>${check.exitCode}</dd>
        </div>
      </dl>

      <details class="check-card__details" ${passed ? '' : 'open'}>
        <summary>Afficher la sortie détaillée</summary>
        <pre><code>${escapeHtml(check.output)}</code></pre>
      </details>
    </article>
  `;
}

function createHtmlReport(summary) {
  const passed = summary.overallStatus === 'passed';
  const statusLabel = passed ? 'Quality gate validé' : 'Quality gate en échec';
  const statusDescription = passed
    ? 'Tous les contrôles statiques sont conformes.'
    : 'Au moins un contrôle doit être corrigé avant publication.';

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Rapport qualité — French Companies Explorer</title>

    <style>
      :root {
        color-scheme: light;
        --background: #f5f7fc;
        --surface: #ffffff;
        --surface-muted: #f8faff;
        --text: #172033;
        --text-muted: #647089;
        --border: #dbe3f1;
        --primary: #245af5;
        --primary-soft: #edf3ff;
        --success: #08783e;
        --success-soft: #e7f8ef;
        --danger: #ba2537;
        --danger-soft: #ffeaed;
        --shadow: 0 18px 55px rgb(35 61 112 / 10%);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          color-scheme: dark;
          --background: #0d121d;
          --surface: #151d2b;
          --surface-muted: #111927;
          --text: #eef3ff;
          --text-muted: #aab5cb;
          --border: #2b3850;
          --primary: #7ca3ff;
          --primary-soft: #1b2b4f;
          --success: #61d795;
          --success-soft: #153b2a;
          --danger: #ff8f9c;
          --danger-soft: #4a2028;
          --shadow: 0 18px 55px rgb(0 0 0 / 28%);
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        color: var(--text);
        background:
          radial-gradient(circle at 10% 0%, rgb(36 90 245 / 12%), transparent 32rem),
          var(--background);
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
      }

      a {
        color: inherit;
      }

      a:focus-visible,
      summary:focus-visible {
        outline: 3px solid var(--primary);
        outline-offset: 4px;
        border-radius: 6px;
      }

      .container {
        width: min(1180px, calc(100% - 32px));
        margin-inline: auto;
      }

      .topbar {
        border-bottom: 1px solid var(--border);
        background: color-mix(in srgb, var(--surface) 88%, transparent);
        backdrop-filter: blur(16px);
      }

      .topbar__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 72px;
        gap: 24px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 800;
      }

      .brand__icon {
        display: grid;
        width: 38px;
        height: 38px;
        place-items: center;
        border-radius: 12px;
        color: #ffffff;
        background: linear-gradient(135deg, #245af5, #6547ef);
        box-shadow: 0 10px 24px rgb(36 90 245 / 28%);
      }

      .topbar__link {
        color: var(--primary);
        font-weight: 750;
        text-decoration: none;
      }

      main {
        padding-block: 56px 72px;
      }

      .eyebrow {
        margin: 0 0 12px;
        color: var(--primary);
        font-size: 0.78rem;
        font-weight: 850;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: end;
        gap: 32px;
        margin-bottom: 36px;
      }

      h1 {
        max-width: 780px;
        margin: 0;
        font-size: clamp(2.25rem, 5vw, 4.25rem);
        line-height: 1.04;
        letter-spacing: -0.045em;
      }

      .hero__description {
        max-width: 720px;
        margin: 20px 0 0;
        color: var(--text-muted);
        font-size: 1.08rem;
        line-height: 1.75;
      }

      .score {
        display: grid;
        min-width: 190px;
        padding: 24px;
        place-items: center;
        border: 1px solid var(--border);
        border-radius: 22px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .score strong {
        font-size: 2.5rem;
        letter-spacing: -0.05em;
      }

      .score span {
        margin-top: 4px;
        color: var(--text-muted);
      }

      .verdict {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 28px;
        padding: 22px 24px;
        border: 1px solid
          ${passed ? 'var(--success)' : 'var(--danger)'};
        border-radius: 18px;
        background:
          ${passed ? 'var(--success-soft)' : 'var(--danger-soft)'};
      }

      .verdict strong {
        display: block;
        margin-bottom: 4px;
        font-size: 1.08rem;
      }

      .verdict p {
        margin: 0;
        color: var(--text-muted);
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        padding: 8px 12px;
        border-radius: 999px;
        font-size: 0.82rem;
        font-weight: 850;
        white-space: nowrap;
      }

      .status--passed {
        color: var(--success);
        background: var(--success-soft);
      }

      .status--failed {
        color: var(--danger);
        background: var(--danger-soft);
      }

      .checks {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
      }

      .check-card {
        min-width: 0;
        padding: 24px;
        border: 1px solid var(--border);
        border-top: 4px solid
          ${passed ? 'var(--success)' : 'var(--border)'};
        border-radius: 18px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }

      .check-card--failed {
        border-top-color: var(--danger);
      }

      .check-card__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .check-card__category {
        margin: 0 0 7px;
        color: var(--text-muted);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .check-card h2 {
        margin: 0;
        font-size: 1.35rem;
      }

      .check-card__description {
        min-height: 52px;
        margin-block: 18px;
        color: var(--text-muted);
        line-height: 1.6;
      }

      .check-card__metrics {
        display: grid;
        gap: 12px;
        margin: 0;
        padding: 16px;
        border-radius: 14px;
        background: var(--surface-muted);
      }

      .check-card__metrics div {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
      }

      dt {
        color: var(--text-muted);
        font-size: 0.82rem;
      }

      dd {
        margin: 0;
        font-weight: 750;
        text-align: right;
      }

      code {
        font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
      }

      .check-card__details {
        margin-top: 18px;
      }

      summary {
        color: var(--primary);
        font-weight: 750;
        cursor: pointer;
      }

      pre {
        max-height: 340px;
        margin: 14px 0 0;
        padding: 16px;
        overflow: auto;
        border: 1px solid var(--border);
        border-radius: 12px;
        color: var(--text);
        background: var(--surface-muted);
        font-size: 0.78rem;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .metadata {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1px;
        margin-top: 28px;
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: 18px;
        background: var(--border);
      }

      .metadata div {
        min-width: 0;
        padding: 18px;
        background: var(--surface);
      }

      .metadata dt {
        margin-bottom: 8px;
      }

      .metadata dd {
        overflow: hidden;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      footer {
        margin-top: 36px;
        color: var(--text-muted);
        font-size: 0.9rem;
        text-align: center;
      }

      @media (max-width: 920px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .score {
          width: fit-content;
        }

        .checks {
          grid-template-columns: 1fr;
        }

        .check-card__description {
          min-height: auto;
        }

        .metadata {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 560px) {
        .topbar__content,
        .verdict {
          align-items: flex-start;
          flex-direction: column;
        }

        main {
          padding-top: 36px;
        }

        .metadata {
          grid-template-columns: 1fr;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          scroll-behavior: auto !important;
          transition: none !important;
        }
      }
    </style>
  </head>

  <body>
    <header class="topbar">
      <div class="container topbar__content">
        <div class="brand">
          <span class="brand__icon" aria-hidden="true">Q</span>
          <span>French Companies Explorer · QA</span>
        </div>

        <a class="topbar__link" href="../index.html">
          Retour au portail QA
        </a>
      </div>
    </header>

    <main class="container">
      <section class="hero" aria-labelledby="report-title">
        <div>
          <p class="eyebrow">Qualité statique</p>
          <h1 id="report-title">Rapport qualité du code</h1>
          <p class="hero__description">
            Synthèse automatisée du formatage, de l’analyse statique et du
            typage du projet Playwright TypeScript.
          </p>
        </div>

        <div class="score" aria-label="${summary.passedChecks} contrôles conformes sur ${summary.totalChecks}">
          <strong>${summary.passedChecks}/${summary.totalChecks}</strong>
          <span>contrôles conformes</span>
        </div>
      </section>

      <section class="verdict" aria-label="Verdict global">
        <div>
          <strong>${statusLabel}</strong>
          <p>${statusDescription}</p>
        </div>

        <span class="status status--${summary.overallStatus}">
          ${passed ? 'PASS' : 'FAIL'}
        </span>
      </section>

      <section class="checks" aria-label="Contrôles de qualité">
        ${summary.checks.map(createCheckCard).join('\n')}
      </section>

      <dl class="metadata" aria-label="Informations de génération">
        <div>
          <dt>Généré le</dt>
          <dd title="${escapeHtml(summary.generatedAt)}">
            ${escapeHtml(formatDate(summary.generatedAt))}
          </dd>
        </div>
        <div>
          <dt>Branche</dt>
          <dd title="${escapeHtml(summary.environment.branch)}">
            ${escapeHtml(summary.environment.branch)}
          </dd>
        </div>
        <div>
          <dt>Commit</dt>
          <dd title="${escapeHtml(summary.environment.commit)}">
            ${escapeHtml(summary.environment.commit)}
          </dd>
        </div>
        <div>
          <dt>Environnement</dt>
          <dd title="${escapeHtml(`${summary.environment.platform} · ${summary.environment.nodeVersion}`)}">
            ${escapeHtml(summary.environment.platform)} ·
            ${escapeHtml(summary.environment.nodeVersion)}
          </dd>
        </div>
      </dl>

      <footer>
        Rapport généré automatiquement — aucun résultat n’a été modifié
        manuellement.
      </footer>
    </main>
  </body>
</html>
`;
}

rmSync(OUTPUT_DIRECTORY, {
  recursive: true,
  force: true,
});

mkdirSync(OUTPUT_DIRECTORY, {
  recursive: true,
});

const generatedAt = new Date().toISOString();
const checks = CHECKS.map(executeCheck);
const passedChecks = checks.filter((check) => check.status === 'passed').length;
const failedChecks = checks.length - passedChecks;
const overallStatus = failedChecks === 0 ? 'passed' : 'failed';

const summary = {
  schemaVersion: 1,
  generatedAt,
  overallStatus,
  totalChecks: checks.length,
  passedChecks,
  failedChecks,
  environment: {
    branch:
      process.env.GITHUB_HEAD_REF ||
      process.env.GITHUB_REF_NAME ||
      readGitValue(['branch', '--show-current'], 'local'),
    commit:
      process.env.GITHUB_SHA?.slice(0, 8) ||
      readGitValue(['rev-parse', '--short', 'HEAD'], 'non versionné'),
    platform: `${os.platform()} ${os.release()}`,
    osVersion: os.version(),
    nodeVersion: process.version,
    ci: Boolean(process.env.CI),
  },
  checks,
};

writeFileSync(
  JSON_REPORT_PATH,
  `${JSON.stringify(summary, null, 2)}\n`,
  'utf8',
);

writeFileSync(HTML_REPORT_PATH, createHtmlReport(summary), 'utf8');

console.log(`Rapport HTML : ${HTML_REPORT_PATH}`);
console.log(`Résumé JSON  : ${JSON_REPORT_PATH}`);
console.log(
  `Quality gate : ${overallStatus === 'passed' ? 'PASS' : 'FAIL'} ` +
    `(${passedChecks}/${checks.length})`,
);

if (overallStatus === 'failed') {
  process.exitCode = 1;
}
