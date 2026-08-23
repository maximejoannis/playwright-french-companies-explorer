# Rétrospective — Leçons apprises

## 1. Ce qui a bien fonctionné

### Progression par petits lots

Les cas ont été ajoutés par domaines fonctionnels. Chaque lot a été exécuté
seul avant la non-régression, ce qui a facilité l’identification de la cause des
échecs.

### Cycle rouge/vert documenté

Les défauts CSV et accessibilité ont été reproduits par un test rouge, corrigés
côté produit puis validés par le même oracle. Cette approche donne une preuve
plus forte qu’un test écrit après la correction.

### Combinaison E2E et mocks

Les tests E2E prouvent l’intégration avec le système réel ; les mocks rendent
les erreurs, limites, données manquantes et exports reproductibles. Les deux
niveaux sont complémentaires.

### Page Objects et fixtures

La centralisation des interactions a permis de corriger une navigation ou un
locator à un seul endroit. Les fixtures ont gardé les tests lisibles et orientés
métier.

## 2. Leçons techniques majeures

### 2.1 Un locator stable n’est pas une assertion métier

Le champ de recherche était localisé par son placeholder. Lorsque son nom
accessible a été corrigé, le locator a cassé. La meilleure séparation est :

```ts
const searchInput = page.getByTestId('query-input');

await expect(searchInput).toHaveAccessibleName(/recherche|entreprise/i);
```

Le premier élément identifie le composant ; le second contrôle son contrat
utilisateur.

### 2.2 Les assertions web-first réduisent le flaky

Préférer :

```ts
await expect(rows).toHaveCount(8);
```

à :

```ts
expect(await rows.count()).toBe(8);
```

La première forme réessaie automatiquement jusqu’au timeout.

### 2.3 `.all()` doit être précédé d’une attente

`locator.all()` renvoie immédiatement la collection courante. Il faut d’abord
stabiliser le DOM :

```ts
await expect(comparisonPage.rows).toHaveCount(8);
const rows = await comparisonPage.rows.all();
```

### 2.4 Un test clavier doit maîtriser son état initial

Le focus laissé par la navigation varie selon le contexte et le moteur. Le
scénario doit démarrer depuis un point connu, puis vérifier le parcours réel au
clavier jusqu’à la cible.

### 2.5 Axe ne démontre pas une conformité WCAG complète

Un scan Axe vert n’a pas empêché la découverte :

- d’un nom accessible basé sur un placeholder ;
- d’un compteur dynamique non annoncé.

Il faut combiner audit automatique, tests clavier, assertions sur les noms
accessibles et contrôles manuels avec technologies d’assistance.

### 2.6 Les tests visuels demandent un environnement maîtrisé

Une baseline dépend du navigateur, de la plateforme, du viewport, des polices,
du thème et des animations. Les choix retenus sont :

- Chromium uniquement ;
- viewport et thème fixes ;
- animations désactivées ;
- attente du chargement des polices ;
- mocks réseau ;
- un worker ;
- validation humaine avant mise à jour.

### 2.7 La concurrence est une variable de test

Un test vert seul peut devenir instable avec plusieurs workers si l’API publique
est sollicitée simultanément. Le nombre de workers fait partie de la stratégie,
pas seulement de la performance.

### 2.8 Ne jamais forcer une incompatibilité de dépendances

`--force` ou `--legacy-peer-deps` aurait masqué le conflit TypeScript 7 /
`typescript-eslint`. Une version officiellement compatible fournit une chaîne
de build reproductible et défendable.

## 3. Leçons de processus QA

### Le testeur peut corriger un produit personnel sous conditions

Dans un projet personnel, le même auteur peut tester et corriger si les rôles
restent visibles :

1. exigence ou risque identifié ;
2. test rouge conservé ;
3. anomalie enregistrée ;
4. correction applicative séparée ;
5. retest inchangé ;
6. non-régression ;
7. commits distincts lorsque possible.

Cette discipline évite de modifier le test uniquement pour obtenir du vert.

### Tous les rouges ne sont pas des bugs produit

La qualification doit distinguer :

- défaut produit ;
- défaut du test ;
- environnement ou réseau ;
- divergence de spécification ;
- baseline absente ;
- incompatibilité d’outillage.

### La traçabilité doit rester utile

Un identifiant dans le titre ne suffit pas. La chaîne attendue est :

```text
Besoin → critère d’acceptation → cas de test → résultat → anomalie → retest
```

## 4. Ce qui pourrait être amélioré

- définir les identifiants d’anomalie avant l’implémentation des corrections ;
- conserver systématiquement les rapports rouges et verts avec une convention
  de nommage ;
- documenter plus tôt les frontières entre E2E réel et test mocké ;
- mettre en place ESLint, Prettier et la CI dès le début du projet ;
- fixer plus tôt le navigateur et la plateforme des baselines visuelles ;
- ajouter une revue manuelle avec lecteur d’écran à la Definition of Done ;
- éviter les changements de noms publics dans un Page Object sans rechercher
  tous leurs consommateurs.

## 5. Formulation courte pour une Sprint Review

> Nous avons appris qu’une automatisation fiable ne consiste pas à obtenir du
> vert à tout prix. Elle consiste à maîtriser l’état initial, les données,
> et l’environnement ; à distinguer défaut produit et défaut de test ;
> puis à conserver la preuve du cycle détection, correction, retest et
> non-régression.

## Mesurer la couverture à partir du référentiel

Le nombre de tests automatisés ne constitue pas à lui seul un taux de couverture fonctionnelle.

La suite contient 39 cas techniques, mais elle couvre 35 des 45 cas du référentiel. Plusieurs tests peuvent couvrir le même besoin, tandis que certains tests techniques peuvent étendre le périmètre sans correspondre à une exigence formalisée.

### Leçon à retenir

La couverture doit être calculée dans le sens :

`Exigence → Critère d’acceptation → Cas de référence → Preuve automatisée`

et non simplement à partir du nombre de fichiers ou de tests Playwright.

## Garantir l’unicité des identifiants

Un identifiant CT doit désigner un seul cas de test pendant toute sa durée de vie. Sa réutilisation pour un autre comportement compromet les rapports et la lecture de la traçabilité.

### Leçon à retenir

Avant d’ajouter un scénario automatisé :

1. vérifier l’identifiant dans la matrice ;
2. conserver son objectif fonctionnel ;
3. créer un nouvel identifiant lorsque le comportement est nouveau ;
4. mettre à jour simultanément exigences, cas, matrice et métadonnées Allure.

## Aligner les références visuelles avec la CI

Les snapshots créés sous Windows ne sont pas interchangeables avec ceux utilisés sous Linux par GitHub Actions.

### Leçon à retenir

Les baselines visuelles doivent être générées et validées dans le même environnement que celui qui exécute la quality gate.
