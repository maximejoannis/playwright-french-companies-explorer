# Stratégie de test — French Companies Explorer

## 1. Vision

La stratégie vise à réduire le risque de production avec le meilleur rapport coût/valeur. Conformément aux bonnes pratiques Playwright fournies, chaque comportement est testé au niveau le plus bas capable de le prouver : logique et contrat via API/composants, rendu et erreurs rares via UI mockée, parcours critiques via E2E réel.

## 2. Risques prioritaires

| Priorité | Risque                                        | Réponse de test                               |
| -------- | --------------------------------------------- | --------------------------------------------- |
| P0       | Recherche indisponible ou résultat trompeur   | Contrat API, smoke E2E, états d'erreur        |
| P0       | SIREN/SIRET, statut ou pagination incohérents | Schémas, invariants, frontières               |
| P1       | Données facultatives cassant le rendu         | Tests composant avec champs absents/null      |
| P1       | Favoris, comparaison ou historique perdus     | Tests de stockage, persistance et corruption  |
| P1       | Erreurs 429/5xx/timeout mal gérées            | Mocking déterministe et récupération          |
| P2       | Export incorrect ou dangereux                 | Parsing JSON/CSV, UTF-8, injection de formule |
| P1       | Parcours inaccessible au clavier/mobile       | WCAG ciblée, responsive, zoom                 |

## 3. Niveaux et répartition indicative

| Niveau               | Part | Objectif                                               | Exécution           |
| -------------------- | ---: | ------------------------------------------------------ | ------------------- |
| Unitaires/composants | 35 % | Parsing, normalisation, tri, filtres, stockage, export | Chaque commit       |
| API/contrat          | 35 % | HTTP, paramètres, schémas, invariants, pagination      | PR et quotidien     |
| UI avec mocks        | 20 % | États déterministes, erreurs rares, données partielles | PR                  |
| E2E avec API réelle  | 10 % | Parcours utilisateur critiques                         | Smoke PR et nightly |

## 4. Stratégie API

- Utiliser `APIRequestContext` sans ouvrir de navigateur.
- Centraliser `baseURL`, headers, timeouts et configuration.
- Vérifier le code HTTP exact, le `Content-Type`, le schéma minimal et les invariants.
- Contrôler SIREN à 9 chiffres, SIRET à 14 chiffres, dates ISO, statut connu et cohérence de pagination.
- Tester paramètres valides, frontières et invalides.
- Couvrir 400, 404, 429, 500, 503, timeout, offline, JSON invalide, champ absent et `null`.
- Éviter les assertions sur des listes figées issues d'une donnée publique évolutive.
- Ne pas inventer de CRUD : l'application observée est principalement en lecture.
- Ne jamais embarquer de secret ou token réel dans le code.

## 5. Stratégie UI et E2E

- Sélecteurs par rôle, label ou identifiant de test stable.
- Un objectif principal par scénario.
- Pas de `waitForTimeout()` comme synchronisation métier.
- Attendre une réponse, une navigation, un état DOM ou une assertion observable.
- Conserver peu d'E2E réels : accueil → recherche → fiche, favori, comparaison et export.
- Isoler chaque test et nettoyer son stockage local.
- Collecter trace, capture et logs uniquement à l'échec.

## 6. Mocking

Utiliser `page.route()` et `route.fulfill()` pour :

- réponse vide ;
- champs facultatifs absents ;
- 400/404/429/500/503 ;
- timeout et offline ;
- JSON invalide ou tronqué ;
- données longues, accents et caractères hostiles ;
- liste de comparaison hétérogène.

Le mocking isole l'interface mais ne remplace pas les tests d'intégration avec l'API réelle.

## 7. Données de test

| Classe     | Exemples                                                    |
| ---------- | ----------------------------------------------------------- |
| Valides    | La Poste, Renault, `356000000`, `35600000000048`            |
| Frontières | 1 caractère, 9/14 chiffres, tailles 10/20/25, dernière page |
| Invalides  | Blanc, 8/10/13/15 chiffres, page 0 ou négative              |
| Partielles | Activité, siège, effectif ou date absents                   |
| Hostiles   | `<script>`, guillemets, très longue chaîne, préfixes CSV    |
| Erreurs    | 429, 5xx, timeout, offline, JSON invalide                   |

## 8. Environnements

- Desktop : Chromium, Firefox et WebKit supportés.
- Mobile : Chromium 360×800 et WebKit 390×844.
- Viewports : 320 à 1440 pixels, zoom 200 %.
- Réseau : normal, lent, offline, timeout et erreurs simulées.
- Stockage : vide, rempli, corrompu, quota indisponible.
- Locale : `fr-FR`, accents, apostrophes et tirets.

## 9. Non-fonctionnel

### Accessibilité

WCAG 2.2 AA ciblée : navigation clavier, focus visible, noms et états accessibles, contraste, zoom 200 %, reflow à 320 px.

### Sécurité

Encodage des contenus, absence de secret dans le client, liens externes sûrs, stockage minimal, logs sans données sensibles et neutralisation des formules CSV.

### Performance

Mesurer le temps de recherche et d'affichage, le poids des ressources et la latence API. Les seuils P75/P95 doivent être contractualisés avant d'être bloquants.

## 10. CI/CD

1. Lint et unitaires.
2. Tests API/contrat.
3. Tests UI mockés.
4. Smoke E2E Chromium.
5. Nightly multi-navigateurs et régression complète.

Les retries sont limités à la CI. Un test flaky est une anomalie à diagnostiquer, pas un succès.

## 11. Critères de sortie

- 100 % des tests P0/P1 exécutés.
- 100 % des P0 réussis.
- Au moins 95 % des P1 réussis.
- Aucun défaut bloquant ou critique ouvert.
- Couverture des critères d'acceptation ≥ 95 %.
- Flakiness < 1 % sur dix exécutions.
- Risques résiduels explicitement acceptés.
