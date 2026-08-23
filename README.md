# French Companies Explorer — Playwright QA

[![QA CI and Reports](https://github.com/maximejoannis/playwright-french-companies-explorer/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/maximejoannis/playwright-french-companies-explorer/actions/workflows/playwright.yml)
[![QA Portal](https://img.shields.io/badge/QA_Portal-online-22c55e?logo=githubpages&logoColor=white)](https://maximejoannis.github.io/playwright-french-companies-explorer/)
[![Tests](https://img.shields.io/badge/tests-110_passed-22c55e?logo=playwright&logoColor=white)](https://maximejoannis.github.io/playwright-french-companies-explorer/allure/)
[![Functional Coverage](https://img.shields.io/badge/functional_coverage-77.8%25-f59e0b)](https://maximejoannis.github.io/playwright-french-companies-explorer/coverage/)
[![P0 Coverage](https://img.shields.io/badge/P0_coverage-100%25-22c55e)](https://maximejoannis.github.io/playwright-french-companies-explorer/coverage/)

[![Playwright](https://img.shields.io/badge/Playwright-1.62-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Allure](https://img.shields.io/badge/Allure_Report-enabled-f97316)](https://maximejoannis.github.io/playwright-french-companies-explorer/allure/)
[![ESLint](https://img.shields.io/badge/ESLint-passing-4B32C3?logo=eslint&logoColor=white)](https://maximejoannis.github.io/playwright-french-companies-explorer/quality/)
[![Prettier](https://img.shields.io/badge/Prettier-passing-F7B93E?logo=prettier&logoColor=black)](https://maximejoannis.github.io/playwright-french-companies-explorer/quality/)
[![Browsers](https://img.shields.io/badge/browsers-Chromium%20%7C%20Firefox%20%7C%20WebKit-2563eb)](https://maximejoannis.github.io/playwright-french-companies-explorer/functional/)
[![Traceability](https://img.shields.io/badge/traceability-ISTQB-7c3aed)](./docs/07-matrice-tracabilite.md)

Projet d’automatisation des tests de l’application
[French Companies Explorer](https://maximejoannis.github.io/french-companies-explorer-qa/),
réalisé avec Playwright et TypeScript.

L’objectif est de démontrer une démarche QA complète : stratégie de test,
automatisation multi-navigateurs, isolation des données, accessibilité,
régression visuelle, traçabilité ISTQB et intégration continue.

## Portail QA

Le portail centralise les preuves d’exécution et les indicateurs qualité :

### [Ouvrir le portail QA](https://maximejoannis.github.io/playwright-french-companies-explorer/)

Il donne accès aux rapports suivants :

- rapport consolidé Allure ;
- rapport Playwright fonctionnel, API et accessibilité ;
- rapport Playwright de régression visuelle ;
- rapport de qualité ESLint, Prettier et TypeScript ;
- rapport de couverture fonctionnelle automatisée `US → CA → CT`.

## Périmètre automatisé

| Domaine             | Objectif                                                              |
| ------------------- | --------------------------------------------------------------------- |
| API                 | Vérifier les recherches directes et les contrats HTTP                 |
| E2E                 | Valider les principaux parcours utilisateur sur l’application publiée |
| Tests mockés        | Couvrir les erreurs, cas limites et données déterministes             |
| Accessibilité       | Contrôler Axe, le clavier et la sémantique ARIA                       |
| Régression visuelle | Détecter les modifications involontaires de présentation              |
| Qualité du code     | Vérifier le formatage, le lint et le typage TypeScript                |

État actuel de la suite :

- **39 cas de test logiques**, identifiés de `CT-001` à `CT-039` ;
- **110 exécutions automatisées** ;
- **3 moteurs de navigateur** : Chromium, Firefox et WebKit ;
- tests visuels exécutés sur Chromium sous Linux dans la CI.

## Architecture

```text
.
├── .github/
│   └── workflows/
│       └── playwright.yml
├── docs/
│   └── sprint-review/
├── fixtures/
│   └── test.fixture.ts
├── pages/
├── reporting/
│   ├── qa-portal/
│   └── scripts/
├── test-data/
│   └── api-responses/
├── tests/
│   ├── accessibility/
│   ├── api/
│   ├── e2e/
│   ├── mocked/
│   └── visual/
├── eslint.config.mjs
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

### Principes appliqués

- Page Object Model pour centraliser les interactions avec l’interface ;
- fixtures Playwright personnalisées pour injecter les pages métier ;
- locators orientés utilisateur et attributs `data-testid` lorsque nécessaire ;
- assertions auto-réessayées avec `expect` ;
- interception réseau avec `page.route()` pour les scénarios déterministes ;
- séparation entre tests réels, tests mockés, accessibilité et visuel ;
- exécution parallèle maîtrisée avec deux workers par défaut ;
- traces et captures collectées en cas d’échec ;
- références visuelles spécifiques à l’environnement d’exécution.

## Traçabilité ISTQB

Chaque test utilise un identifiant stable `CT-XXX`. Les métadonnées Allure
centralisées dans la fixture permettent d’associer les exécutions aux éléments
suivants :

- User Story ;
- fonctionnalité ;
- exigence ;
- critère d’acceptation ;
- priorité ;
- type de test ;
- éventuelle anomalie associée.

Documents du projet :

- [Sprint Review](./docs/sprint-review/01-sprint-review.md)
- [Registre des anomalies](./docs/sprint-review/02-registre-anomalies.md)
- [Leçons apprises](./docs/sprint-review/03-lecons-apprises.md)
- [Matrice de traçabilité](./docs/sprint-review/04-matrice-tracabilite.md)
- [Rapport final de couverture automatisée](./docs/08-rapport-final-couverture-automatisation.md)

## Installation locale

### Prérequis

- Node.js 24 ;
- npm ;
- Git.

```bash
git clone https://github.com/maximejoannis/playwright-french-companies-explorer.git
cd playwright-french-companies-explorer
npm ci
npx playwright install --with-deps
```

## Exécution des tests

Suite complète :

```bash
npm test
```

Tests E2E :

```bash
npm run test:e2e
```

Tests API :

```bash
npm run test:api
```

Smoke tests :

```bash
npm run test:smoke
```

Mode interactif :

```bash
npm run test:ui
```

Mode debug :

```bash
npm run test:debug
```

Exécution avec deux workers depuis PowerShell :

```powershell
$env:PW_WORKERS = "2"
npm test
```

## Vérifications de qualité

```bash
npm run format:check
npm run lint
npm run typecheck
```

Génération du rapport de qualité :

```bash
npm run quality:report
```

## Rapports Allure

Après l’exécution des tests :

```bash
npm run allure:generate
npm run allure:open
```

## Régression visuelle

Exécution des tests visuels :

```bash
npx playwright test tests/visual --project=chromium --workers=1
```

Mise à jour volontaire des références :

```bash
npx playwright test tests/visual --project=chromium --update-snapshots --workers=1
```

Une modification de référence visuelle doit être examinée avant son commit.
Les baselines utilisées par GitHub Actions sont générées sous Linux.

## Intégration continue

Le workflow GitHub Actions est déclenché sur :

- chaque push sur `main` ;
- chaque pull request vers `main` ;
- un lancement manuel avec `workflow_dispatch`.

Le pipeline :

1. installe les dépendances ;
2. vérifie la qualité du code ;
3. exécute les tests fonctionnels ;
4. exécute les tests visuels ;
5. génère les rapports Playwright et Allure ;
6. construit le portail QA ;
7. publie GitHub Pages ;
8. applique la quality gate finale.

Les rapports restent également disponibles comme artefacts GitHub Actions.

## Anomalies mises en évidence

Le projet d’automatisation a notamment permis d’identifier et de documenter :

- un risque d’injection de formule lors de l’export CSV (`BUG-CSV-001`) ;
- un contrôle dépourvu de nom accessible explicite (`BUG-A11Y-001`) ;
- un compteur de résultats non annoncé aux technologies d’assistance
  (`BUG-A11Y-002`).

Les tests ont été conservés sans assouplir leurs assertions après correction
des anomalies applicatives.

## Améliorations prévues

- automatisation progressive des dix cas fonctionnels encore non couverts ;
- rebaselining des identifiants CT-033 à CT-039 ;
- mesure des exigences et critères d’acceptation non couverts ;
- suivi historique des tendances d’exécution ;
- enrichissement progressif des scénarios selon l’analyse de risques.

## Auteur

**Maxime Joannis — QA technico-fonctionnel et automaticien Playwright**

Projet personnel réalisé dans une démarche de portfolio, d’apprentissage
continu et d’application des bonnes pratiques de test logiciel.
