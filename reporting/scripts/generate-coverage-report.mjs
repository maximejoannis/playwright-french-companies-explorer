import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import console from 'node:console';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sourcePath = path.join(
  root,
  'reporting',
  'coverage',
  'coverage-data.json',
);
const outputDirectory = path.join(root, 'coverage-report');
const outputPath = path.join(outputDirectory, 'index.html');
const summaryPath = path.join(outputDirectory, 'summary.json');
const data = JSON.parse(readFileSync(sourcePath, 'utf8'));

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const rate = (covered, total) =>
  total === 0 ? 0 : Math.round((covered / total) * 1000) / 10;

const formatRate = (value) =>
  `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value)} %`;

const sum = (items, field) =>
  items.reduce((total, item) => total + item[field], 0);

const assertEqual = (actual, expected, label) => {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
};

assertEqual(
  sum(data.userStories, 'total'),
  data.scope.referenceCases,
  'Total des cas par user story',
);
assertEqual(
  sum(data.userStories, 'covered'),
  data.scope.coveredCases,
  'Total des cas couverts par user story',
);
assertEqual(
  sum(data.priorities, 'total'),
  data.scope.referenceCases,
  'Total des cas par priorité',
);
assertEqual(
  sum(data.priorities, 'covered'),
  data.scope.coveredCases,
  'Total des cas couverts par priorité',
);
assertEqual(
  data.uncoveredCases.length,
  data.scope.uncoveredCases,
  'Liste des cas non couverts',
);

const userStoryRows = data.userStories
  .map((story) => {
    const storyRate = rate(story.covered, story.total);
    const status =
      storyRate === 100 ? 'covered' : storyRate === 0 ? 'gap' : 'partial';

    return `<tr>
      <td><strong>${escapeHtml(story.id)}</strong><span>${escapeHtml(story.name)}</span></td>
      <td>${story.total}</td>
      <td>${story.covered}</td>
      <td>${escapeHtml(story.uncovered)}</td>
      <td><span class="status status--${status}">${formatRate(storyRate)}</span></td>
    </tr>`;
  })
  .join('');

const priorityCards = data.priorities
  .map((priority) => {
    const priorityRate = rate(priority.covered, priority.total);

    return `<article class="priority-card">
      <div><span>${escapeHtml(priority.id)}</span><strong>${escapeHtml(priority.name)}</strong></div>
      <b>${formatRate(priorityRate)}</b>
      <div class="progress" aria-label="Couverture ${escapeHtml(priority.id)} : ${formatRate(priorityRate)}">
        <i style="width:${priorityRate}%"></i>
      </div>
      <small>${priority.covered} cas couverts sur ${priority.total}</small>
    </article>`;
  })
  .join('');

const gapRows = data.uncoveredCases
  .map(
    (item) => `<tr>
      <td><strong>${escapeHtml(item.id)}</strong></td>
      <td>${escapeHtml(item.trace)}</td>
      <td><span class="priority">${escapeHtml(item.priority)}</span></td>
      <td>${escapeHtml(item.reason)}</td>
    </tr>`,
  )
  .join('');

const mappingRows = data.behavioralMappings
  .map(
    (item) => `<tr>
      <td>${escapeHtml(item.technicalTest)}</td>
      <td>${escapeHtml(item.referenceCase)}</td>
      <td>${escapeHtml(item.evidence)}</td>
    </tr>`,
  )
  .join('');

const extensionRows = data.extensions
  .map(
    (item) => `<tr>
      <td>${escapeHtml(item.technicalTest)}</td>
      <td>${escapeHtml(item.proposedTrace)}</td>
      <td>${escapeHtml(item.description)}</td>
    </tr>`,
  )
  .join('');

const generatedAt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
}).format(new Date());

const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Rapport de couverture fonctionnelle automatisée US, critères d’acceptation et cas de test">
  <title>Couverture fonctionnelle — ${escapeHtml(data.project)}</title>
  <style>
    :root{color-scheme:dark;--bg:#07111f;--surface:#0f1d31;--surface-2:#142641;--line:#29405f;--text:#eef5ff;--muted:#a9bad1;--blue:#4b8cff;--cyan:#38d9c5;--green:#42d77d;--amber:#ffbd59;--red:#ff6b7d}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 10% 0,#16376a 0,transparent 33rem),var(--bg);color:var(--text)}a{color:#8ab4ff}.container{width:min(1180px,calc(100% - 32px));margin:auto}header{padding:28px 0;border-bottom:1px solid var(--line);background:#07111fdd;backdrop-filter:blur(16px);position:sticky;top:0;z-index:2}.brand{display:flex;align-items:center;justify-content:space-between;gap:16px}.brand strong{font-size:1.05rem}.brand span{color:var(--muted);font-size:.9rem}.back{padding:10px 14px;border:1px solid var(--line);border-radius:12px;text-decoration:none}main{padding:56px 0 80px}.eyebrow{margin:0 0 12px;color:var(--cyan);font-weight:800;text-transform:uppercase;letter-spacing:.14em;font-size:.75rem}h1{font-size:clamp(2rem,5vw,4.4rem);line-height:1.02;max-width:900px;margin:0 0 18px}.lead{max-width:800px;color:var(--muted);font-size:1.1rem;line-height:1.7}.hero{display:grid;grid-template-columns:1.5fr .8fr;gap:28px;align-items:center}.score{aspect-ratio:1;border-radius:50%;display:grid;place-content:center;text-align:center;background:conic-gradient(var(--green) 0 77.8%,#263d5d 77.8%);position:relative;max-width:270px;margin:auto}.score:before{content:"";position:absolute;inset:16px;border-radius:50%;background:var(--surface)}.score strong,.score span{position:relative}.score strong{font-size:3.3rem}.score span{color:var(--muted)}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:38px 0}.metric,.panel,.priority-card{background:linear-gradient(145deg,var(--surface),#0b1728);border:1px solid var(--line);border-radius:20px}.metric{padding:20px}.metric strong{display:block;font-size:1.8rem}.metric span{color:var(--muted)}.section{margin-top:54px}.section h2{font-size:1.65rem;margin-bottom:8px}.section>p{color:var(--muted);line-height:1.6}.priorities{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:22px}.priority-card{padding:20px}.priority-card div:first-child{display:flex;flex-direction:column}.priority-card div span,.priority-card small{color:var(--muted)}.priority-card b{display:block;font-size:1.7rem;margin:14px 0}.progress{height:8px;border-radius:99px;background:#263d5d;overflow:hidden;margin-bottom:10px}.progress i{display:block;height:100%;background:linear-gradient(90deg,var(--blue),var(--cyan));border-radius:inherit}.panel{padding:10px;overflow:auto;margin-top:22px}table{width:100%;border-collapse:collapse;min-width:760px}th,td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--line)}th{color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em}td span{display:block;color:var(--muted);font-size:.85rem;margin-top:4px}.status,.priority{display:inline-block!important;width:max-content;padding:6px 9px;border-radius:99px;font-weight:800;font-size:.8rem!important}.status--covered{background:#123f2b;color:#7aefa7}.status--partial{background:#493817;color:#ffd47f}.status--gap{background:#4a2029;color:#ff9aaa}.priority{background:#17345d;color:#8ab4ff}.notice{border-left:4px solid var(--amber);background:#372d19;padding:18px 20px;border-radius:4px 16px 16px 4px;color:#ffe3a8;line-height:1.6}.footer{margin-top:55px;padding-top:22px;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem}@media(max-width:850px){.hero{grid-template-columns:1fr}.metrics,.priorities{grid-template-columns:repeat(2,1fr)}header{position:static}}@media(max-width:520px){.metrics,.priorities{grid-template-columns:1fr}.brand{align-items:flex-start;flex-direction:column}}
  </style>
</head>
<body>
  <header><div class="container brand"><div><strong>${escapeHtml(data.project)}</strong><br><span>Rapport de couverture fonctionnelle automatisée</span></div><a class="back" href="../">← Portail QA</a></div></header>
  <main class="container">
    <section class="hero">
      <div><p class="eyebrow">Traçabilité US → CA → CT</p><h1>Mesurer ce qui est réellement couvert.</h1><p class="lead">Le taux compare les cas de test du référentiel aux comportements substantiellement vérifiés par Playwright. Il ne représente ni le taux de réussite de la campagne ni une couverture de code.</p></div>
      <div class="score" aria-label="Couverture globale ${formatRate(data.scope.coverageRate)}"><strong>${formatRate(data.scope.coverageRate)}</strong><span>35 cas sur 45</span></div>
    </section>
    <section class="metrics" aria-label="Indicateurs"><article class="metric"><strong>${data.scope.referenceCases}</strong><span>cas de référence</span></article><article class="metric"><strong>${data.scope.coveredCases}</strong><span>cas couverts</span></article><article class="metric"><strong>${data.scope.uncoveredCases}</strong><span>écarts restants</span></article><article class="metric"><strong>${data.scope.technicalAutomatedCases}</strong><span>tests techniques</span></article></section>
    <section class="section"><p class="eyebrow">Analyse des risques</p><h2>Couverture par priorité</h2><p>Le périmètre critique P0 est entièrement automatisé. Les prochains investissements doivent cibler les cinq écarts P1.</p><div class="priorities">${priorityCards}</div></section>
    <section class="section"><p class="eyebrow">Matrice fonctionnelle</p><h2>Couverture par user story</h2><div class="panel"><table><thead><tr><th>User story</th><th>Cas</th><th>Couverts</th><th>Non couverts</th><th>Taux</th></tr></thead><tbody>${userStoryRows}</tbody></table></div></section>
    <section class="section"><p class="eyebrow">Backlog de couverture</p><h2>Cas restant à automatiser</h2><div class="panel"><table><thead><tr><th>Cas</th><th>Trace</th><th>Priorité</th><th>Écart</th></tr></thead><tbody>${gapRows}</tbody></table></div></section>
    <section class="section"><p class="eyebrow">Réconciliation</p><h2>Correspondances comportementales</h2><p class="notice">Les identifiants techniques CT-033 à CT-039 entrent en collision avec le référentiel documentaire. La couverture est donc déterminée par le comportement et les assertions, conformément à la méthode du rapport.</p><div class="panel"><table><thead><tr><th>Test technique</th><th>Cas couvert</th><th>Preuve</th></tr></thead><tbody>${mappingRows}</tbody></table></div></section>
    <section class="section"><p class="eyebrow">Évolution proposée</p><h2>Régression visuelle hors référentiel</h2><div class="panel"><table><thead><tr><th>Test</th><th>Trace proposée</th><th>Extension</th></tr></thead><tbody>${extensionRows}</tbody></table></div></section>
    <footer class="footer">Généré le ${escapeHtml(generatedAt)} depuis <code>reporting/coverage/coverage-data.json</code>. Référentiel : 15 user stories, 45 cas de test.</footer>
  </main>
</body>
</html>`;

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, html, 'utf8');
writeFileSync(
  summaryPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      referenceCases: data.scope.referenceCases,
      coveredCases: data.scope.coveredCases,
      uncoveredCases: data.scope.uncoveredCases,
      coverageRate: data.scope.coverageRate,
      status: 'generated',
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(`Coverage report generated: ${path.relative(root, outputPath)}`);
