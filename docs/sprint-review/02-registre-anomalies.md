# Registre des anomalies et incidents

## 1. Défauts produit confirmés

| Identifiant           | Détection | Description                                                                                                                | Sévérité proposée | Correction                                                                                    | Statut |
| --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- | ------ |
| BUG-CSV-001           | CT-032    | Les cellules CSV commençant par `=`, `+`, `-` ou `@` pouvaient être interprétées comme des formules.                       | Haute             | Neutralisation des valeurs avant échappement CSV.                                             | CLOSED |
| BUG-A11Y-001          | CT-035    | Le champ de recherche utilisait son placeholder comme nom accessible et ne disposait pas d’un libellé explicite pertinent. | Moyenne           | Ajout de `aria-label="Recherche d’entreprise"` puis découplage du locator avec `data-testid`. | CLOSED |
| BUG-A11Y-002          | CT-036    | Le compteur changeait visuellement sans région dynamique accessible.                                                       | Moyenne           | Ajout de `role="status"`, `aria-live="polite"` et `aria-atomic="true"`.                       | CLOSED |
| BUG-COMPARE-001*      | CT-025    | Une quatrième entreprise pouvait remplacer un élément au lieu d’être refusée ; les doublons devaient être ignorés.         | Moyenne           | Limitation explicite à trois et conservation de la sélection existante.                       | CLOSED |
| BUG-SAVED-SEARCH-001* | CT-028    | Une mise à jour de recherche sauvegardée pouvait créer un doublon.                                                         | Moyenne           | Déduplication/mise à jour de l’entrée existante.                                              | CLOSED |

\* Identifiants proposés pour homogénéiser le registre si aucun identifiant
officiel n’avait été créé au moment de la détection.

## 2. Incidents de test et d’environnement

| Identifiant proposé | Symptôme                                                                 | Cause racine                                                     | Action corrective                                                                  | Classification       |
| ------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------- |
| INC-NAV-001         | Les captures montraient le portfolio au lieu de l’application.           | Navigation vers `/`, racine du domaine GitHub Pages.             | Utilisation de `page.goto('./')` et vérification de l’URL du sous-chemin.          | Configuration        |
| INC-NAV-002         | Navigation parfois déclenchée avant que l’application soit prête.        | Gestionnaire JavaScript non encore attaché au bouton permanent.  | Attente explicite du gestionnaire puis assertion web-first avec `toPass()`.        | Synchronisation      |
| INC-FLAKY-001       | Résultats variables, par exemple 36/2 puis 37/1.                         | Pression concurrente sur l’API publique et dépendance réseau.    | Deux workers par défaut, mocks pour les cas déterministes et assertions web-first. | Instabilité externe  |
| INC-LOCATOR-001     | CT-035 ne trouvait plus le champ après correction de son nom accessible. | Locator couplé à l’ancien placeholder.                           | Locator technique par `data-testid`, assertion accessible séparée.                 | Maintenance du test  |
| INC-FOCUS-001       | CT-034 passait isolément mais échouait dans la suite complète.           | Point de départ du focus non déterministe.                       | Point de départ connu, puis parcours réel avec `Tab`.                              | Défaut du test       |
| INC-VISUAL-001      | CT-037 échouait avant la comparaison d’image.                            | Regex ancrée ne tolérant pas les retours à la ligne du HTML.     | Utilisation de `toHaveText('0 résultat')`, qui normalise les espaces.              | Défaut du test       |
| INC-LINT-001        | Faux positif `prefer-locator` sur `pageSizeFilter`.                      | Nom commençant par `page` interprété comme un objet `Page`.      | Renommage en `resultsPerPageFilter` et mise à jour des consommateurs.              | Qualité statique     |
| INC-DEPS-001        | `npm ERESOLVE` pendant l’installation ESLint.                            | TypeScript 7 hors de la plage supportée par `typescript-eslint`. | Retour temporaire à TypeScript 6.0.x ; aucun `--force`.                            | Compatibilité outils |

## 3. Ajustements de spécification ou de stratégie

Ces éléments ne sont pas nécessairement des défauts produit.

| Sujet                    | Constat                                                                           | Décision                                                                |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| CT-006                   | L’API publique traite certaines valeurs numériques comme une recherche textuelle. | Contrôle repositionné au niveau UI, où se situe la validation attendue. |
| CT-022                   | Le comportement du favori est un toggle.                                          | Test reformulé autour de l’absence de doublon après rechargement.       |
| Données réelles          | Les totaux et entreprises de l’API évoluent.                                      | Assertions métier stables et mocks pour les valeurs exactes.            |
| Visuel multi-navigateurs | Une baseline par navigateur et plateforme augmente fortement la maintenance.      | Baseline visuelle Chromium uniquement ; fonctions UI sur trois moteurs. |

## 4. Processus de clôture appliqué

Pour les défauts produit importants :

1. exécuter le test et conserver la preuve rouge ;
2. qualifier la cause sans assouplir l’oracle ;
3. corriger l’application dans un changement séparé ;
4. relancer le même test sans changer son intention ;
5. exécuter la non-régression ;
6. conserver les rapports avant/après ;
7. mettre à jour le registre et la traçabilité.

## 5. Recommandations de suivi

- rattacher chaque anomalie à une issue GitHub lors de la publication ;
- ajouter le lien du rapport ou de la trace comme preuve ;
- distinguer dans les labels GitHub : `product-bug`, `test-bug`, `flaky`,
  `accessibility`, `security`, `visual` ;
- ne clôturer une anomalie qu’après retest et non-régression verts.
