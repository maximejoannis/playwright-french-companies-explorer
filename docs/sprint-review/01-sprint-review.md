# Sprint Review — Automatisation Playwright

## 1. Objectif du projet

Mettre en place une architecture d’automatisation Playwright maintenable pour
**French Companies Explorer**, avec une couverture fonctionnelle, API, mockée,
accessibilité et visuelle, tout en conservant une traçabilité inspirée des
principes ISTQB.

## 2. Résultat de la Sprint Review

Le périmètre prévu est couvert par **39 cas de test logiques (CT-001 à CT-039)**.
La non-régression locale finale est verte avec :

- tests API ;
- tests fonctionnels de bout en bout ;
- tests déterministes avec réponses API mockées ;
- tests d’accessibilité automatisés et ciblés ;
- tests de régression visuelle sur Chromium ;
- exécution UI multi-navigateurs sur Chromium, Firefox et WebKit ;
- contrôle TypeScript ;
- contrôle ESLint sans avertissement ;
- contrôle Prettier ;
- préparation d’un pipeline GitHub Actions.

Le nombre d’exécutions Playwright est supérieur à 39, car un même cas UI peut
être exécuté sur plusieurs moteurs de navigateur.

## 3. Fonctionnalités couvertes

| Domaine                               | Cas de test     | Résultat |
| ------------------------------------- | --------------- | -------- |
| Recherche et validation               | CT-001 à CT-006 | PASS     |
| Filtres, pagination et tri            | CT-007 à CT-015 | PASS     |
| Navigation et fiche entreprise        | CT-016 à CT-020 | PASS     |
| Favoris                               | CT-021 à CT-023 | PASS     |
| Comparaison                           | CT-024 à CT-026 | PASS     |
| Historique et recherches sauvegardées | CT-027 à CT-029 | PASS     |
| Exports JSON et CSV                   | CT-030 à CT-032 | PASS     |
| Accessibilité                         | CT-033 à CT-036 | PASS     |
| Régression visuelle                   | CT-037 à CT-039 | PASS     |

## 4. Incrément produit et qualité obtenu

### Architecture

- séparation des tests par nature : `api`, `e2e`, `mocked`, `accessibility`,
  `visual` ;
- Page Objects centralisant les interactions et locators ;
- fixtures Playwright pour injecter les Page Objects ;
- données de test isolées dans `test-data` ;
- mocks réseau installés avant la navigation ;
- configuration distincte du projet API et des projets UI ;
- tests visuels exécutés uniquement sur Chromium.

### Observabilité

- rapport HTML Playwright ;
- captures en cas d’échec ;
- traces au premier retry en CI ;
- pièces jointes JSON pour les diagnostics Axe et ARIA ;
- baselines visuelles versionnées ;
- rapports rouges et verts conservables pour les anomalies.

### Qualité statique

- `npm run format:check` ;
- `npm run lint` avec zéro avertissement attendu ;
- `npm run typecheck` ;
- `npm test` pour la non-régression.

## 5. Démonstrations importantes de la Sprint Review

### Export CSV sécurisé

CT-032 a échoué avant correction et a mis en évidence la possibilité qu’une
cellule exportée soit interprétée comme une formule par un tableur. Le test est
resté inchangé, le produit a neutralisé les préfixes dangereux, puis le retest
et la non-régression sont devenus verts.

### Accessibilité au-delà d’Axe

CT-033 était vert avec Axe, mais CT-035 a détecté que le champ principal
utilisait son placeholder comme nom accessible. Un libellé explicite a été
ajouté. CT-036 a ensuite détecté que la mise à jour du compteur de résultats
n’était pas annoncée aux lecteurs d’écran ; une région `status` a été ajoutée.

### Robustesse du test clavier

CT-034 passait isolément mais a échoué en non-régression, car le point de départ
du focus dépendait de la navigation précédente et du navigateur. Le scénario a
été stabilisé en initialisant un point de départ connu, tout en atteignant le
champ cible uniquement avec `Tab`. Le test passe ensuite sur les trois moteurs.

### Régression visuelle

Les baselines CT-037 à CT-039 ont été créées après inspection humaine. Leur
mise à jour reste une action volontaire et n’est jamais automatique en CI.

## 6. Décisions prises

| Décision                               | Justification                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `page.goto('./')`                      | Respecter le sous-chemin GitHub Pages et éviter l’ouverture du portfolio racine. |
| Deux workers par défaut                | Réduire la pression sur l’API publique et les résultats aléatoires.              |
| Mocks pour les cas déterministes       | Tester les branches rares et supprimer la dépendance aux données externes.       |
| `data-testid` pour certains composants | Découpler l’identification technique du contrat métier ou accessible.            |
| Assertions web-first                   | Bénéficier de l’attente automatique de Playwright.                               |
| Visuel sur Chromium seulement          | Maîtriser le coût et la variabilité des baselines.                               |
| TypeScript 6 temporairement            | Rester dans la plage supportée par `typescript-eslint`.                          |

## 7. Risques et limites résiduels

- l’API publique reste une dépendance externe pour certains tests E2E ;
- Axe ne couvre qu’une partie des critères WCAG ;
- les tests visuels sont sensibles au système d’exploitation, aux polices et au
  moteur de rendu ;
- la conformité complète avec un lecteur d’écran réel n’est pas démontrée ;
- la CI doit encore être validée après création et premier push du dépôt GitHub ;
- la matrice doit rester synchronisée avec les annotations présentes dans les
  fichiers de test.

## 8. Critères de sortie

- [x] CT-001 à CT-039 implémentés ;
- [x] non-régression locale verte ;
- [x] trois navigateurs couverts pour l’UI fonctionnelle ;
- [x] baselines visuelles validées sur Chromium ;
- [x] ESLint, Prettier et TypeScript verts ;
- [x] anomalies critiques retestées ;
- [ ] dépôt GitHub créé ;
- [ ] premier pipeline GitHub Actions vert ;
- [ ] README portfolio final publié.

## 9. Conclusion

L’incrément est **acceptable pour publication dans un portfolio**, sous réserve
de valider le premier pipeline distant. La valeur principale ne réside pas
uniquement dans le nombre de tests : le projet démontre une démarche complète
de test, de diagnostic, de correction, de retest et de non-régression.
