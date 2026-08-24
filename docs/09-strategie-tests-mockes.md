# Stratégie des tests fonctionnels avec API simulée

| Métadonnée       | Valeur                                        |
| ---------------- | --------------------------------------------- |
| Projet           | French Companies Explorer — Playwright QA     |
| Type de document | Décision de stratégie de test                 |
| Framework        | Playwright et TypeScript                      |
| Périmètre        | Tests du dossier `tests/mocked/`              |
| Référentiel      | Bonnes pratiques Playwright et approche ISTQB |
| Statut           | Appliqué                                      |

## 1. Objectif

Ce document décrit le rôle des tests utilisant des réponses HTTP simulées dans le projet French Companies Explorer.

Il précise :

- ce qui est réellement testé ;
- ce qui est simulé ;
- pourquoi ces tests sont considérés comme fonctionnels ;
- leur complémentarité avec les tests API et E2E ;
- leurs limites ;
- les bonnes pratiques retenues.

L’objectif est d’éviter toute confusion entre la simulation d’une dépendance HTTP et la validation des règles métier internes d’un backend.

## 2. Définition

Les tests présents dans le dossier suivant sont appelés tests mockés :

```text
tests/mocked/
```

Ils exécutent l’application réelle dans un navigateur Playwright, mais interceptent certaines requêtes HTTP afin de fournir des réponses contrôlées.

```ts
await page.route(API_PATTERN, async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockedResponse),
  });
});
```

Le flux testé est le suivant :

```text
Test Playwright
      ↓
Application réelle dans le navigateur
      ↓
Requête HTTP initiée par le frontend
      ↓
Interception Playwright
      ↓
Réponse HTTP déterministe
      ↓
Traitement réel par l’application
      ↓
Vérifications fonctionnelles de l’interface
```

## 3. Nature des tests

Les tests mockés du projet sont des **tests fonctionnels de l’interface avec dépendance HTTP simulée**.

Ils vérifient notamment les comportements suivants :

- lancer une recherche ;
- filtrer et trier les résultats ;
- modifier la taille de page ;
- parcourir la pagination ;
- consulter une fiche détaillée ;
- filtrer les établissements ;
- gérer les favoris ;
- comparer des entreprises ;
- sauvegarder une recherche ;
- exporter des résultats ;
- comprendre et récupérer un état d’erreur.

Ils sont donc classés avec les tags :

```ts
tag: ['@functional', '@mocked'];
```

Le tag `@functional` indique la nature de la vérification. Le tag `@mocked` indique que la dépendance HTTP utilisée pendant le scénario est simulée.

## 4. Éléments réels et simulés

| Élément                                | État pendant le test    |
| -------------------------------------- | ----------------------- |
| Navigateur Playwright                  | Réel                    |
| Application frontend                   | Réelle                  |
| DOM et interface                       | Réels                   |
| Logique JavaScript du frontend         | Réelle                  |
| Navigation et interactions utilisateur | Réelles                 |
| Page Object Model                      | Réel                    |
| Local Storage                          | Réel                    |
| Requête initiée par l’application      | Réelle puis interceptée |
| API publique distante                  | Simulée                 |
| Réponse HTTP                           | Contrôlée par le test   |
| Données retournées                     | Déterministes           |

Le test ne remplace donc pas l’ensemble de l’application. Il remplace uniquement la réponse d’une dépendance externe afin d’isoler le comportement du frontend.

## 5. Ce qui n’est pas mocké

Les tests ne mockent pas les règles métier internes de l’API publique.

Le projet ne possède pas le code source du backend et n’exécute pas ses composants internes. Il ne peut donc pas vérifier directement :

- les algorithmes du serveur ;
- les accès à la base de données ;
- les traitements métier internes ;
- les contrôles de sécurité internes ;
- les mécanismes de cache ;
- les performances du serveur.

Les tests simulent uniquement les résultats observables du contrat HTTP : code de statut, en-têtes, contenu JSON, délai, erreur ou absence de réponse.

## 6. Nuance terminologique

Le terme « mock API » est fréquemment utilisé dans les projets Playwright.

Au sens strict, une réponse définie avec `route.fulfill()` se rapproche souvent d’un **stub HTTP**, car le test fournit une réponse prédéfinie.

La simulation se rapproche d’un mock lorsque le test vérifie aussi :

- le nombre d’appels ;
- l’URL et les paramètres utilisés ;
- l’ordre des interactions ;
- les tentatives successives ;
- l’absence d’appel non attendu.

Le terme générique « tests mockés » est conservé pour rester cohérent avec la terminologie Playwright et l’organisation du projet.

## 7. Exemples issus du projet

### 7.1 Récupération après une erreur API

CT-003 simule deux réponses successives : une erreur HTTP `503`, puis une réponse HTTP `200`.

Le test vérifie que :

- l’erreur est visible ;
- le message est compréhensible ;
- l’utilisateur peut relancer la recherche ;
- les résultats apparaissent après récupération ;
- aucune carte n’est dupliquée.

Ce test valide le comportement fonctionnel du frontend face à une erreur, mais pas la manière dont l’API produit réellement une erreur `503`.

### 7.2 Filtrage et pagination

CT-007 à CT-009 utilisent un jeu de données maîtrisé pour contrôler :

- le statut administratif demandé ;
- les tailles de page `10`, `20` et `25` ;
- le nombre de pages ;
- le retour sur une page valide après filtrage ;
- la cohérence des compteurs et cartes affichées.

La logique du test sert à générer une réponse déterministe. Elle ne constitue pas un test de l’algorithme réel du backend.

### 7.3 Données partielles

Les tests de fiche entreprise simulent des champs absents afin de vérifier que l’interface affiche un libellé neutre et jamais une valeur technique telle que `undefined` ou `null`.

### 7.4 Exports

Les tests d’export utilisent des accents, virgules, guillemets, retours à la ligne et valeurs commençant par `=`, `+`, `-` ou `@`. Ils vérifient l’encodage, l’échappement CSV et la neutralisation des formules sans dépendre des données de l’API publique.

## 8. Pourquoi utiliser une API simulée ?

### Déterminisme et reproductibilité

Les mêmes données et préconditions sont utilisées à chaque exécution, localement comme dans la CI.

### Cas rares et négatifs

Le test peut provoquer volontairement :

- une erreur `429`, `500` ou `503` ;
- un timeout ;
- une réponse vide ;
- des données partielles ;
- une page suivante en erreur ;
- des valeurs inhabituelles ou dangereuses.

### Rapidité et isolation

Les réponses sont servies localement par Playwright. L’analyse d’un échec peut se concentrer sur le frontend sans le confondre immédiatement avec une indisponibilité externe.

## 9. Limites

Un test mocké ne prouve pas :

- que l’API publique est disponible ;
- que l’URL réelle est toujours valide ;
- que les paramètres sont acceptés par le backend ;
- que le schéma réel n’a pas évolué ;
- que le serveur applique correctement ses règles métier ;
- que les performances sont acceptables ;
- que l’intégration complète fonctionne sur le réseau.

Une suite composée uniquement de tests mockés pourrait rester verte alors que l’intégration réelle est cassée. Ils ne remplacent donc ni les tests API ni les tests E2E.

## 10. Stratégie complémentaire du projet

| Catégorie              | Objectif                                                         |
| ---------------------- | ---------------------------------------------------------------- |
| `tests/api/`           | Vérifier directement le comportement observable de l’API réelle  |
| `tests/e2e/`           | Vérifier les parcours critiques avec le frontend et l’API réelle |
| `tests/mocked/`        | Vérifier le frontend avec des réponses déterministes             |
| `tests/accessibility/` | Vérifier Axe, le clavier et la sémantique accessible             |
| `tests/visual/`        | Détecter les régressions de présentation                         |

```text
Tests API ciblés
        +
Parcours E2E critiques
        +
Scénarios fonctionnels mockés
        +
Accessibilité et visuel
        =
Couverture complémentaire et maîtrisée
```

## 11. Positionnement ISTQB

La présence d’une dépendance simulée ne détermine pas à elle seule la nature fonctionnelle ou non fonctionnelle d’un test.

Le test est fonctionnel lorsqu’il vérifie une fonction ou un comportement attendu à partir d’une exigence, d’une User Story, d’un critère d’acceptation ou d’une règle observable par l’utilisateur.

Dans ce projet, les tests mockés sont reliés à la traçabilité :

```text
User Story → Critère d’acceptation → Cas de test → Test Playwright
```

L’utilisation d’un double de test constitue une technique d’isolation. Elle ne transforme pas le scénario en test unitaire du backend.

## 12. Bonnes pratiques retenues

1. Intercepter uniquement l’URL nécessaire au scénario.
2. Centraliser les réponses dans `test-data/api-responses/` lorsque cela est pertinent.
3. Maintenir des payloads réalistes et conformes au contrat observable.
4. Vérifier les résultats visibles pour l’utilisateur.
5. Contrôler les paramètres et le nombre d’appels lorsque le besoin l’exige.
6. Garder le stub aussi simple que possible.
7. Ne pas recréer tout le backend dans les tests.
8. Maintenir des tests API et des parcours E2E réels.
9. Réviser les données simulées lorsque le contrat réel évolue.
10. Conserver les tags `@functional` et `@mocked` pour rendre le périmètre explicite.

## 13. Risques et mesures de maîtrise

| Risque                                   | Mesure de maîtrise                       |
| ---------------------------------------- | ---------------------------------------- |
| Payload simulé différent du contrat réel | Conserver des tests API réels            |
| Test vert malgré une intégration cassée  | Maintenir des parcours E2E réels         |
| Stub trop complexe                       | Limiter la logique au besoin du scénario |
| Données obsolètes                        | Réviser les fixtures avec le contrat     |
| Confusion sur le périmètre               | Utiliser `@functional` et `@mocked`      |
| Fausse validation du backend             | Documenter explicitement les limites     |
| Interception trop large                  | Cibler précisément l’URL de l’API        |

## 14. Règle de décision

Utiliser une réponse simulée lorsque le scénario nécessite :

- un état difficile à provoquer ;
- des données précises ;
- une erreur contrôlée ;
- un cas limite ;
- une exécution indépendante du réseau ;
- une vérification ciblée du frontend.

Utiliser l’API réelle lorsque le scénario doit vérifier :

- le contrat réellement exposé ;
- les paramètres acceptés ;
- la disponibilité du service ;
- la cohérence des données réelles ;
- l’intégration complète ;
- un parcours critique représentatif.

## 15. Conclusion

Les tests du dossier `tests/mocked/` sont des tests fonctionnels de l’interface exécutés dans un navigateur réel.

Ils ne mockent pas les règles métier internes de l’API. Ils simulent les résultats observables de son contrat HTTP afin d’isoler le frontend et de vérifier de manière déterministe les comportements nominaux, négatifs et aux limites.

Cette pratique est pertinente lorsqu’elle est complétée par des tests API réels, des parcours E2E réels, une maintenance des données simulées, une traçabilité explicite et une compréhension claire de ses limites.

La stratégie adoptée dans French Companies Explorer respecte ce principe de complémentarité.
