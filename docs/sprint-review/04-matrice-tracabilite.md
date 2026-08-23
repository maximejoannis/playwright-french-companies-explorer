# Matrice de traçabilité synthétique

## 1. Chaîne de traçabilité

```text
Fonctionnalité / risque
  → User Story ou exigence
    → Critère d’acceptation
      → Cas de test CT
        → Résultat
          → Anomalie éventuelle
            → Retest et non-régression
```

Les annotations présentes dans le code de test constituent la source détaillée.
Cette matrice fournit la vue Sprint Review.

## 2. Couverture par domaine

| Fonctionnalité ou risque       | Cas de test     | Type principal              | Anomalie ou incident lié      | Statut final          |
| ------------------------------ | --------------- | --------------------------- | ----------------------------- | --------------------- |
| Recherche par nom              | CT-001          | E2E                         | INC-FLAKY-001                 | PASS                  |
| Recherche vide                 | CT-002          | Fonctionnel                 | —                             | PASS                  |
| Erreur API et récupération     | CT-003          | Mocké                       | —                             | PASS                  |
| Recherche SIREN                | CT-004          | API + UI                    | —                             | PASS                  |
| Recherche SIRET                | CT-005          | API                         | —                             | PASS                  |
| Longueurs numériques invalides | CT-006          | UI                          | Ajustement de stratégie       | PASS                  |
| Filtres de statut              | CT-007          | Fonctionnel                 | —                             | PASS                  |
| Taille de page                 | CT-008          | Fonctionnel                 | INC-LINT-001                  | PASS                  |
| Page valide après filtre       | CT-009          | Fonctionnel                 | —                             | PASS                  |
| Tri                            | CT-010 à CT-012 | Mocké/fonctionnel           | —                             | PASS                  |
| Pagination                     | CT-013 à CT-015 | E2E + mocké                 | INC-FLAKY-001                 | PASS                  |
| Ouverture de fiche             | CT-016          | E2E                         | —                             | PASS                  |
| Données partielles             | CT-017          | Mocké                       | —                             | PASS                  |
| Retour et restauration d’état  | CT-018          | E2E                         | INC-NAV-002                   | PASS                  |
| Établissements                 | CT-019 à CT-020 | Mocké                       | —                             | PASS                  |
| Favoris                        | CT-021 à CT-023 | Fonctionnel + stockage      | Ajustement CT-022             | PASS                  |
| Comparaison                    | CT-024 à CT-026 | E2E + mocké                 | BUG-COMPARE-001               | PASS                  |
| Historique et relance          | CT-027          | Fonctionnel                 | —                             | PASS                  |
| Recherche sauvegardée          | CT-028          | Fonctionnel                 | BUG-SAVED-SEARCH-001          | PASS                  |
| Effacement de l’historique     | CT-029          | Fonctionnel                 | —                             | PASS                  |
| Téléchargements JSON/CSV       | CT-030          | Mocké                       | —                             | PASS                  |
| Caractères spéciaux CSV        | CT-031          | Mocké                       | —                             | PASS                  |
| Injection de formule CSV       | CT-032          | Sécurité/mocké              | BUG-CSV-001                   | PASS après correction |
| Audit Axe                      | CT-033          | Accessibilité               | Limite de couverture Axe      | PASS                  |
| Navigation clavier             | CT-034          | Accessibilité/multi-browser | INC-FOCUS-001                 | PASS                  |
| Noms accessibles               | CT-035          | Accessibilité               | BUG-A11Y-001, INC-LOCATOR-001 | PASS après correction |
| Annonce des résultats          | CT-036          | Accessibilité               | BUG-A11Y-002                  | PASS après correction |
| Recherche vide visuelle        | CT-037          | Visuel Chromium             | INC-VISUAL-001                | PASS                  |
| Résultats visuels              | CT-038          | Visuel mocké                | —                             | PASS                  |
| Fiche entreprise visuelle      | CT-039          | Visuel mocké                | —                             | PASS                  |

## 3. Traçabilité détaillée connue

| Cas    | User Story / exigence | Critère d’acceptation | Feature             | Statut |
| ------ | --------------------- | --------------------- | ------------------- | ------ |
| CT-024 | US09                  | US09-CA01             | F10                 | PASS   |
| CT-025 | US09                  | US09-CA02             | F10                 | PASS   |
| CT-026 | US09                  | US09-CA03             | F10                 | PASS   |
| CT-033 | US-ACCESSIBILITY      | CA-033                | Accessibilité       | PASS   |
| CT-034 | US-ACCESSIBILITY      | CA-034                | Accessibilité       | PASS   |
| CT-035 | US-ACCESSIBILITY      | CA-035                | Accessibilité       | PASS   |
| CT-036 | US-ACCESSIBILITY      | CA-036                | Accessibilité       | PASS   |
| CT-037 | US-VISUAL             | CA-037                | Régression visuelle | PASS   |
| CT-038 | US-VISUAL             | CA-038                | Régression visuelle | PASS   |
| CT-039 | US-VISUAL             | CA-039                | Régression visuelle | PASS   |

Pour CT-001 à CT-023 et CT-027 à CT-032, reprendre les identifiants exacts déjà
présents dans les annotations des fichiers `.spec.ts`. Ne pas inventer ou
renuméroter les US/CA lors de l’intégration dans un outil de gestion de test.

## 4. Couverture par niveau

| Niveau        | Objectif                                    | Dossier               |
| ------------- | ------------------------------------------- | --------------------- |
| API           | Contrat HTTP et recherche directe           | `tests/api`           |
| E2E           | Parcours réel utilisateur                   | `tests/e2e`           |
| Mocké         | Cas rares, erreurs et données déterministes | `tests/mocked`        |
| Accessibilité | Axe, clavier et sémantique ARIA             | `tests/accessibility` |
| Visuel        | Détection de changements de rendu           | `tests/visual`        |

## 5. Preuves attendues

| Preuve                         | Conservation                      |
| ------------------------------ | --------------------------------- |
| Rapport HTML Playwright        | Artefact CI, 30 jours proposés    |
| Trace Playwright               | Premier retry en CI               |
| Capture d’échec                | Générée uniquement en cas d’échec |
| Diagnostic Axe/ARIA            | Pièce jointe au résultat du test  |
| Baseline visuelle              | Versionnée dans Git               |
| Rapport rouge avant correction | Joint à l’issue d’anomalie        |
| Rapport vert après correction  | Joint à la clôture et au retest   |

## 6. Definition of Done qualité

- [x] cas relié à un besoin ou risque ;
- [x] oracle explicite ;
- [x] données déterministes lorsque nécessaire ;
- [x] test ciblé vert ;
- [x] non-régression locale verte ;
- [x] typecheck, lint et formatage verts ;
- [x] anomalie retestée sans affaiblir l’intention du test ;
- [x] pipeline distant vert après création du dépôt ;
- [x] preuve CI liée au README ou à la release.

## Couverture automatisée finale

Le détail de la couverture, des correspondances comportementales et des cas restant à automatiser est disponible dans :

[Rapport final de couverture automatisée](../08-rapport-final-couverture-automatisation.md)

### Synthèse

- couverture globale : **35/45 — 77,8 %** ;
- couverture P0 : **4/4 — 100 %** ;
- couverture P1 : **26/31 — 83,9 %** ;
- dix cas restent à automatiser ;
- trois scénarios visuels doivent être intégrés au référentiel ;
- les collisions CT-033 à CT-039 doivent faire l’objet d’un rebaselining.
