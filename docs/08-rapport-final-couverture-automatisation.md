# Rapport final de couverture des tests automatisés

**Projet :** French Companies Explorer — Playwright QA  
**Date d’analyse :** 23 août 2026  
**Périmètre :** couverture du référentiel fonctionnel par les tests Playwright versionnés sur `main`

## Référentiel et méthode

Les documents suivants constituent le référentiel fonctionnel :

- `02-user-stories-criteres-acceptation.md` ;
- `06-cas-de-test.md` ;
- `07-matrice-tracabilite.md`.

Les cas `CT-nnn` définis dans `06-cas-de-test.md` sont l’unité de mesure. Un cas est déclaré automatisé uniquement lorsqu’au moins un test Playwright reproduit ses préconditions essentielles, exécute l’action et vérifie substantiellement le résultat attendu.

La correspondance repose sur le comportement et les assertions, pas uniquement sur l’égalité des identifiants. Les statuts `passed`, `failed`, `skipped` ou `flaky` ne participent pas au calcul : ce rapport mesure la présence d’une couverture automatisée, distincte du taux de réussite de la dernière campagne.

## 1. Taux global de couverture automatisée

| Cas inclus | Cas couverts | Cas non couverts |       Taux |
| ---------: | -----------: | ---------------: | ---------: |
|         45 |           35 |               10 | **77,8 %** |

```text
35 ÷ 45 × 100 = 77,8 %
```

La suite contient par ailleurs 39 cas techniques automatisés et produit 110 exécutions multi-projets. Ces nombres ne sont pas directement le numérateur du taux fonctionnel : plusieurs implémentations peuvent couvrir le même cas de référence, tandis que des tests visuels peuvent étendre un référentiel sans encore y être intégrés.

## 2. Couverture par user story

| User story                                          | Périmètre | Couverts | Non couverts |       Taux |
| --------------------------------------------------- | --------: | -------: | -----------: | ---------: |
| US01 — Rechercher par nom ou mot-clé                |         3 |        3 |            0 |  **100 %** |
| US02 — Rechercher par identifiant                   |         3 |        3 |            0 |  **100 %** |
| US03 — Filtrer les résultats                        |         3 |        3 |            0 |  **100 %** |
| US04 — Trier les résultats                          |         3 |        3 |            0 |  **100 %** |
| US05 — Paginer les résultats                        |         3 |        3 |            0 |  **100 %** |
| US06 — Consulter une fiche entreprise               |         3 |        3 |            0 |  **100 %** |
| US07 — Consulter les établissements                 |         2 |        2 |            0 |  **100 %** |
| US08 — Gérer les favoris                            |         3 |        3 |            0 |  **100 %** |
| US09 — Comparer des entreprises                     |         3 |        3 |            0 |  **100 %** |
| US10 — Historique et recherches sauvegardées        |         3 |        3 |            0 |  **100 %** |
| US11 — Exporter les résultats                       |         3 |        3 |            0 |  **100 %** |
| US12 — Copier le SIREN et ouvrir l’annuaire         |         3 |        0 |            3 |    **0 %** |
| US13 — Changer de thème                             |         3 |        0 |            3 |    **0 %** |
| US14 — Comprendre les états système                 |         3 |        0 |            3 |    **0 %** |
| US15 — Utiliser l’application de manière accessible |         4 |        3 |            1 |   **75 %** |
| **Total**                                           |    **45** |   **35** |       **10** | **77,8 %** |

## 3. Couverture par priorité

| Priorité            | Cas inclus | Cas couverts | Cas non couverts |       Taux |
| ------------------- | ---------: | -----------: | ---------------: | ---------: |
| P0 — Critique       |          4 |            4 |                0 |  **100 %** |
| P1 — Important      |         31 |           26 |                5 | **83,9 %** |
| P2 — Complémentaire |          8 |            5 |                3 | **62,5 %** |
| P3 — Confort        |          2 |            0 |                2 |    **0 %** |
| **Total**           |     **45** |       **35** |           **10** | **77,8 %** |

La couverture P0 atteint 100 %. Le reliquat concerne principalement les actions navigateur, le thème, les états système et le responsive.

## 4. Correspondances comportementales

Les tests techniques CT-033 à CT-036 utilisent des identifiants déjà attribués à d’autres cas dans le référentiel. Ils sont donc rattachés par comportement :

| Test technique   | Cas de référence couvert       | Preuve principale                                              |
| ---------------- | ------------------------------ | -------------------------------------------------------------- |
| CT-033           | CT-045 — Audit axe-core        | Absence de violation critique ou sérieuse sur la recherche     |
| CT-034           | CT-042 — Parcours clavier      | Recherche réalisable uniquement au clavier avec focus maîtrisé |
| CT-035 et CT-036 | CT-043 — Sémantique accessible | Noms accessibles et annonce dynamique du compteur de résultats |

Cette règle évite de déclarer à tort CT-033 à CT-036 couverts uniquement parce que les numéros coïncident.

## 5. Extensions hors référentiel

Les trois tests visuels sont automatisés, mais ne correspondent pas aux définitions CT-037 à CT-039 du référentiel actuel.

| Test technique | Rattachement proposé | Extension                              |
| -------------- | -------------------- | -------------------------------------- |
| CT-037         | US16-CA01            | Apparence de la page de recherche vide |
| CT-038         | US16-CA02            | Apparence des résultats de recherche   |
| CT-039         | US16-CA03            | Apparence de la fiche entreprise       |

Il est recommandé de créer **US16 — Préserver la présentation de l’interface**, puis de rebaseliner les identifiants afin de supprimer les collisions documentaires.

## 6. Cas non couverts

| Cas    | Trace     | Priorité | Couverture attendue                                 |
| ------ | --------- | -------- | --------------------------------------------------- |
| CT-033 | US12-CA01 | P2       | Copier exactement le SIREN                          |
| CT-034 | US12-CA02 | P2       | Vérifier la cible de l’annuaire officiel            |
| CT-035 | US12-CA03 | P2       | Gérer le refus du presse-papiers                    |
| CT-036 | US13-CA01 | P3       | Vérifier le thème dans toutes les vues              |
| CT-037 | US13-CA02 | P3       | Vérifier la persistance du thème                    |
| CT-038 | US13-CA03 | P1       | Contrôler contraste et focus dans les deux thèmes   |
| CT-039 | US14-CA01 | P1       | Vérifier l’état de chargement avec réponse retardée |
| CT-040 | US14-CA02 | P1       | Distinguer fonctionnellement liste vide et erreur   |
| CT-041 | US14-CA03 | P1       | Couvrir 429, 500, 503, timeout et offline           |
| CT-044 | US15-CA03 | P1       | Vérifier viewport 320 px et zoom 200 %              |

## 7. Recommandations

1. Rebaseliner la matrice pour garantir l’unicité de chaque identifiant CT.
2. Intégrer les trois scénarios visuels dans une nouvelle user story US16.
3. Automatiser d’abord CT-038 à CT-041 et CT-044, car ils sont classés P1.
4. Automatiser ensuite CT-033 à CT-035, puis les deux cas de thème P3.
5. Générer ce rapport dans la CI à partir d’une source de données versionnée et soumise à revue.
6. Ne pas confondre couverture fonctionnelle, taux de réussite et couverture du code.

## 8. Conclusion

La couverture fonctionnelle automatisée est de **77,8 %**, avec une couverture complète du périmètre critique P0. Le principal enjeu n’est pas seulement l’ajout de tests : la priorité immédiate est la remise en cohérence des identifiants entre exigences, cas de référence et implémentations Playwright.

Ce rapport constitue une photographie de la couverture sur la branche `main`. Toute modification des exigences, de la matrice ou de la suite doit entraîner sa régénération et sa revue.
