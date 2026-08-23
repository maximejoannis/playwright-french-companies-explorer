# Plan de test — French Companies Explorer

## 1. Identification

| Élément   | Valeur                                        |
| --------- | --------------------------------------------- |
| Référence | PT-FCE-001                                    |
| Version   | 1.0                                           |
| Date      | 22 août 2026                                  |
| Type      | Système, intégration, régression, acceptation |
| Approche  | Fondée sur les risques                        |

## 2. Objectifs

- Vérifier que l'utilisateur peut rechercher et identifier correctement une entreprise.
- Valider filtres, tri, pagination, fiche et établissements.
- Vérifier favoris, comparaison, historique, sauvegarde et exports.
- Contrôler les contrats de l'API et la tolérance aux données partielles.
- Vérifier les états de chargement, vide et erreur.
- Évaluer accessibilité, responsive, sécurité côté client et performance perçue.

## 3. Périmètre inclus

Toutes les fonctionnalités F01 à F17 définies dans `01-cartographie-fonctionnelle.md`, l'intégration à l'API publique, le stockage local, les exports et les principaux navigateurs.

## 4. Hors périmètre

- Exactitude juridique intrinsèque des données publiques.
- Infrastructure et code interne du fournisseur d'API.
- Authentification et autorisation, absentes de l'interface observée.
- Création, modification ou suppression d'entreprises.
- Tests de charge agressifs sur le service public.

## 5. Éléments à tester

| Lot  | Fonctionnalités                  | Priorité |
| ---- | -------------------------------- | -------- |
| LT01 | Recherche, résultats, fiche      | P0       |
| LT02 | Filtres, tri, pagination         | P1       |
| LT03 | Établissements                   | P1       |
| LT04 | Favoris et comparaison           | P1       |
| LT05 | Historique et sauvegarde         | P2       |
| LT06 | JSON, CSV, copie, lien externe   | P2       |
| LT07 | Thème, accessibilité, responsive | P1/P3    |
| LT08 | Contrat API et résilience        | P0       |

## 6. Types de test

- Fonctionnels positifs.
- Négatifs, classes d'équivalence et valeurs limites.
- Contrat et intégration API.
- Gestion des erreurs avec mocks.
- Compatibilité navigateurs et responsive.
- Accessibilité ciblée WCAG 2.2 AA.
- Sécurité côté client et exports.
- Performance et stabilité.
- Régression et smoke.

## 7. Critères d'entrée

- Build déployé et identifiable.
- URL et dépendances accessibles.
- Contrat API ou baseline de schéma disponible.
- User stories et critères approuvés.
- Environnements, navigateurs et mocks prêts.
- Jeux de données connus ou stubs déterministes.

## 8. Critères de suspension et reprise

### Suspension

- Application inaccessible.
- API indisponible durablement sans possibilité de mock.
- Plus de 30 % des P0 bloqués par le même défaut d'environnement.
- Build non identifiable ou données de test inutilisables.

### Reprise

- Correctif ou environnement validé par smoke.
- Données/mocks restaurés.
- Cause du blocage documentée.

## 9. Critères de sortie

- Tous les P0 et P1 exécutés.
- 100 % des P0 et ≥ 95 % des P1 réussis.
- Aucun S1/S2 non accepté.
- Traçabilité US → CA → CT complète.
- Résultats et risques résiduels communiqués.

## 10. Environnements et outils

| Composant      | Préconisation                                        |
| -------------- | ---------------------------------------------------- |
| Automatisation | Playwright Test, TypeScript                          |
| API            | `APIRequestContext`, validation de schéma            |
| UI             | Chromium, Firefox, WebKit                            |
| Mock           | `page.route()` / `route.fulfill()`                   |
| Accessibilité  | axe-core + vérifications manuelles clavier/contraste |
| Rapports       | HTML/JUnit, traces et captures à l'échec             |
| CI             | Pipeline PR, nightly et release                      |

## 11. Rôles

| Rôle          | Responsabilités                                         |
| ------------- | ------------------------------------------------------- |
| PO/BA         | Valider règles, seuils et risques résiduels             |
| QA Lead       | Plan, stratégie, couverture et reporting                |
| QA Automation | Suites API/UI/mock, données et diagnostic               |
| Développeur   | Unitaires, testabilité, corrections et contrat          |
| DevOps        | Environnements, CI, secrets et conservation des preuves |

## 12. Planning indicatif

| Phase                            | Charge indicative | Sortie              |
| -------------------------------- | ----------------: | ------------------- |
| Cadrage et contrat API           |               1 j | Baseline et risques |
| Conception cas et données        |               2 j | Cas revus           |
| Automatisation API/composants    |               3 j | Pack rapide         |
| Automatisation UI/mock/E2E       |               4 j | Suites CI           |
| Non-fonctionnel et multi-browser |               2 j | Rapport ciblé       |
| Stabilisation et bilan           |               2 j | Rapport de test     |

Ces estimations sont à recalibrer selon l'accès au code, la testabilité et le contrat API.

## 13. Risques projet

| Risque                       | Probabilité | Impact | Mitigation                          |
| ---------------------------- | ----------- | ------ | ----------------------------------- |
| API externe instable         | Haute       | Fort   | Mocks + suite contrat séparée       |
| Données dynamiques           | Haute       | Moyen  | Invariants et stubs déterministes   |
| Contrat non documenté        | Moyenne     | Fort   | Baseline JSON/OpenAPI               |
| Suite E2E flaky              | Moyenne     | Fort   | Peu d'E2E, attentes événementielles |
| Stockage navigateur variable | Moyenne     | Moyen  | Tests multi-contextes et corruption |

## 14. Reporting

Le rapport de campagne présente : couverture, réussite par priorité, anomalies ouvertes, flakiness, durée, état de l'API, preuves d'échec et recommandation de mise en production.
