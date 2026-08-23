# Cas de test — French Companies Explorer

## 1. Règles communes

- **Précondition commune UI** : application accessible, nouveau contexte navigateur, stockage nettoyé sauf indication contraire.
- **Précondition commune API** : URL de base configurée, aucun secret en dur, débit respectueux du service public.
- Les données externes évoluant, les résultats attendus reposent sur des invariants.
- Chaque cas comporte une variante passante, négative/frontière ou d'erreur.

## 2. Cas détaillés P0/P1

### CT-001 — Recherche par nom — passant

| Champ             | Valeur                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| Trace             | US01-CA01, F02/F04                                                         |
| Priorité / niveau | P0 / E2E réel                                                              |
| Donnée            | `La Poste`                                                                 |
| Étapes            | Ouvrir Recherche; saisir la donnée; cliquer Rechercher                     |
| Attendu           | Total et cartes visibles; chaque carte possède nom et SIREN; aucune erreur |

### CT-002 — Recherche vide — négatif

| Champ             | Valeur                                               |
| ----------------- | ---------------------------------------------------- |
| Trace             | US01-CA02, F02                                       |
| Priorité / niveau | P1 / UI mockée                                       |
| Données           | chaîne vide puis trois espaces                       |
| Étapes            | Saisir chaque valeur; lancer la recherche            |
| Attendu           | Aucun appel inutile; consigne de saisie; aucun crash |

### CT-003 — Recherche en erreur — erreur

| Champ             | Valeur                                                   |
| ----------------- | -------------------------------------------------------- |
| Trace             | US01-CA03, US14-CA03, F16                                |
| Priorité / niveau | P0 / UI mockée                                           |
| Donnée            | 503 puis 200                                             |
| Étapes            | Mock 503; rechercher; mock 200; Réessayer                |
| Attendu           | Message d'indisponibilité puis récupération sans doublon |

### CT-004 — Recherche par SIREN — passant

| Champ             | Valeur                                                     |
| ----------------- | ---------------------------------------------------------- |
| Trace             | US02-CA01, F02                                             |
| Priorité / niveau | P0 / API + E2E                                             |
| Donnée            | `356000000`                                                |
| Étapes            | Appeler l'API puis effectuer la recherche UI               |
| Attendu           | HTTP 200 JSON; entité de SIREN exact; fiche correspondante |

### CT-005 — Recherche par SIRET — passant

| Champ             | Valeur                                                |
| ----------------- | ----------------------------------------------------- |
| Trace             | US02-CA02, F02                                        |
| Priorité / niveau | P1 / API                                              |
| Donnée            | `35600000000048`                                      |
| Étapes            | Appeler la recherche avec le SIRET                    |
| Attendu           | Entreprise rattachée au SIRET, contrat minimal valide |

### CT-006 — Identifiant mal formé — négatif

| Champ             | Valeur                                                                   |
| ----------------- | ------------------------------------------------------------------------ |
| Trace             | US02-CA03, F02                                                           |
| Priorité / niveau | P1 / composant UI                                                        |
| Données           | 8, 10, 13 et 15 chiffres; caractères de contrôle                         |
| Étapes            | Soumettre chaque classe invalide                                         |
| Attendu           | Message d’identifiant invalide; aucun appel API; aucune exception client |

### CT-007 — Filtre de statut — passant

| Champ             | Valeur                                           |
| ----------------- | ------------------------------------------------ |
| Trace             | US03-CA01, F03                                   |
| Priorité / niveau | P1 / API + UI mockée                             |
| Donnée            | Jeu mixte actif/cessé                            |
| Étapes            | Sélectionner En activité puis Cessée             |
| Attendu           | Toutes les cartes correspondent au statut choisi |

### CT-008 — Taille de page — frontière

| Champ             | Valeur                                                |
| ----------------- | ----------------------------------------------------- |
| Trace             | US03-CA02, F03/F06                                    |
| Priorité / niveau | P1 / API + UI mockée                                  |
| Données           | 10, 20 et 25                                          |
| Étapes            | Sélectionner chaque taille sur un jeu de 30 résultats |
| Attendu           | Nombre respecté, sauf dernière page; total inchangé   |

### CT-009 — Filtre depuis une page élevée — frontière

| Champ             | Valeur                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| Trace             | US03-CA03, F03/F06                                                                |
| Priorité / niveau | P1 / UI mockée                                                                    |
| Étapes            | Aller sur la dernière page disponible; appliquer un filtre ne donnant qu'une page |
| Attendu           | Retour à une page valide, résultats du nouveau filtre                             |

### CT-010 — Tri nominal et dates — passant

| Champ             | Valeur                                       |
| ----------------- | -------------------------------------------- |
| Trace             | US04-CA01, F05                               |
| Priorité / niveau | P1 / composant                               |
| Donnée            | Jeu déterministe                             |
| Étapes            | Appliquer A-Z, Z-A, récent, ancien et statut |
| Attendu           | Ordre exact selon chaque option              |

### CT-011 — Tri avec valeurs absentes — négatif

| Champ             | Valeur                                        |
| ----------------- | --------------------------------------------- |
| Trace             | US04-CA02, F05                                |
| Priorité / niveau | P1 / composant                                |
| Donnée            | Homonymes et dates nulles                     |
| Étapes            | Trier plusieurs fois                          |
| Attendu           | Ordre stable et documenté; aucune disparition |

### CT-012 — Invariance du tri — passant

| Champ             | Valeur                                        |
| ----------------- | --------------------------------------------- |
| Trace             | US04-CA03, F04/F05                            |
| Priorité / niveau | P1 / composant                                |
| Étapes            | Capturer IDs/total; trier; comparer           |
| Attendu           | Même total et même ensemble d'IDs sur la page |

### CT-013 — Pagination aller-retour — passant

| Champ             | Valeur                                          |
| ----------------- | ----------------------------------------------- |
| Trace             | US05-CA01, F06                                  |
| Priorité / niveau | P1 / E2E                                        |
| Étapes            | Page 1 → Suivant → Précédent                    |
| Attendu           | Indicateurs 1/2/1 cohérents; résultats attendus |

### CT-014 — Bornes de pagination — frontière

| Champ             | Valeur                                       |
| ----------------- | -------------------------------------------- |
| Trace             | US05-CA02, F06                               |
| Priorité / niveau | P1 / UI mockée                               |
| Étapes            | Observer première puis dernière page         |
| Attendu           | Précédent puis Suivant désactivés aux bornes |

### CT-015 — Erreur page suivante — erreur

| Champ             | Valeur                                                     |
| ----------------- | ---------------------------------------------------------- |
| Trace             | US05-CA03, F06/F16                                         |
| Priorité / niveau | P1 / UI mockée                                             |
| Donnée            | Page 1 = 200, page 2 = 500                                 |
| Étapes            | Charger page 1; cliquer Suivant; Réessayer                 |
| Attendu           | Erreur claire; page 1 récupérable; pas de mélange de pages |

### CT-016 — Fiche correspondant à la carte — passant

| Champ             | Valeur                                                     |
| ----------------- | ---------------------------------------------------------- |
| Trace             | US06-CA01, F07                                             |
| Priorité / niveau | P0 / E2E                                                   |
| Donnée            | SIREN `356000000`                                          |
| Étapes            | Ouvrir la fiche depuis la carte                            |
| Attendu           | Nom et SIREN correspondent; identifiants et siège visibles |

### CT-017 — Fiche à données partielles — négatif

| Champ             | Valeur                                                  |
| ----------------- | ------------------------------------------------------- |
| Trace             | US06-CA02, F07                                          |
| Priorité / niveau | P1 / UI mockée                                          |
| Donnée            | Activité, effectif et date absents                      |
| Étapes            | Ouvrir la fiche mockée                                  |
| Attendu           | Libellés neutres; aucun `undefined`, `null` ou décalage |

### CT-018 — Retour aux résultats — passant

| Champ             | Valeur                                                     |
| ----------------- | ---------------------------------------------------------- |
| Trace             | US06-CA03, F07                                             |
| Priorité / niveau | P1 / E2E                                                   |
| Étapes            | Rechercher; trier; page 2; ouvrir fiche; Retour            |
| Attendu           | Requête, filtre, tri et page restaurés selon spécification |

### CT-019 — Filtrer les établissements — passant

| Champ             | Valeur                                               |
| ----------------- | ---------------------------------------------------- |
| Trace             | US07-CA01/02, F08                                    |
| Priorité / niveau | P1 / UI mockée                                       |
| Étapes            | Sélectionner Tous, Actifs puis Fermés                |
| Attendu           | SIRET, adresse, statut disponibles et filtres exacts |

### CT-020 — Aucun établissement — négatif

| Champ             | Valeur                                         |
| ----------------- | ---------------------------------------------- |
| Trace             | US07-CA03, F08                                 |
| Priorité / niveau | P1 / UI mockée                                 |
| Étapes            | Filtrer sur un statut sans établissement       |
| Attendu           | État vide explicite, fiche toujours utilisable |

### CT-021 — Favori persistant — passant

| Champ             | Valeur                                               |
| ----------------- | ---------------------------------------------------- |
| Trace             | US08-CA01/02, F09                                    |
| Priorité / niveau | P1 / E2E                                             |
| Étapes            | Ajouter; recharger; ouvrir Favoris; retirer          |
| Attendu           | Une occurrence; persistance; retrait reflété partout |

### CT-022 — Favori idempotent — négatif

| Champ             | Valeur                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Trace             | US08-CA01, F09                                                         |
| Priorité / niveau | P1 / composant                                                         |
| Étapes            | Ajouter; recharger deux fois; ouvrir Favoris après chaque rechargement |
| Attendu           | Une seule occurrence en mémoire et dans la vue Favoris                 |

### CT-023 — Stockage des favoris corrompu — erreur

| Champ             | Valeur                                                   |
| ----------------- | -------------------------------------------------------- |
| Trace             | US08-CA03, F09/F16                                       |
| Priorité / niveau | P1 / composant                                           |
| Étapes            | Injecter JSON invalide ou simuler quota; démarrer        |
| Attendu           | Reprise sûre; message non bloquant; recherche disponible |

### CT-024 — Comparer trois entreprises — passant

| Champ             | Valeur                                                |
| ----------------- | ----------------------------------------------------- |
| Trace             | US09-CA01, F10                                        |
| Priorité / niveau | P1 / E2E                                              |
| Étapes            | Ajouter trois sociétés distinctes                     |
| Attendu           | Trois colonnes, attributs alignés et libellés communs |

### CT-025 — Doublon et quatrième comparaison — négatif

| Champ             | Valeur                                               |
| ----------------- | ---------------------------------------------------- |
| Trace             | US09-CA02, F10                                       |
| Priorité / niveau | P1 / UI mockée                                       |
| Étapes            | Ajouter un doublon puis une quatrième société        |
| Attendu           | Doublon ignoré; quatrième refusée; sélection intacte |

### CT-026 — Comparaison avec données absentes — erreur

| Champ             | Valeur                                        |
| ----------------- | --------------------------------------------- |
| Trace             | US09-CA03, F10                                |
| Priorité / niveau | P1 / UI mockée                                |
| Étapes            | Comparer des payloads hétérogènes             |
| Attendu           | Valeurs neutres et colonnes toujours alignées |

## 3. Cas de régression P2/P3

| ID     | Trace     | Type          | Action principale                            | Résultat attendu                      |
| ------ | --------- | ------------- | -------------------------------------------- | ------------------------------------- |
| CT-027 | US10-CA01 | Passant       | Relancer `La Poste` depuis l'historique      | Requête et résultats restaurés        |
| CT-028 | US10-CA02 | Négatif       | Sauvegarder deux fois même requête/filtres   | Pas de doublon incohérent             |
| CT-029 | US10-CA03 | Erreur        | Effacer historique avec sauvegarde existante | Seul l'historique disparaît           |
| CT-030 | US11-CA01 | Passant       | Exporter JSON et CSV puis parser             | Fichiers valides et données attendues |
| CT-031 | US11-CA02 | Frontière     | Accents, virgules, guillemets, retours ligne | UTF-8 et échappement corrects         |
| CT-032 | US11-CA03 | Sécurité      | Exporter valeurs préfixées `=,+,-,@`         | Formules neutralisées                 |
| CT-033 | US12-CA01 | Passant       | Copier `356000000`                           | Presse-papiers exact, 9 chiffres      |
| CT-034 | US12-CA02 | Passant       | Ouvrir l'annuaire                            | URL cible le SIREN courant            |
| CT-035 | US12-CA03 | Erreur        | Refuser permission clipboard                 | Message non bloquant                  |
| CT-036 | US13-CA01 | Passant       | Basculer thème et changer de vue             | Thème cohérent partout                |
| CT-037 | US13-CA02 | Frontière     | Recharger après choix du thème               | Persistance conforme à l'exigence     |
| CT-038 | US13-CA03 | Accessibilité | Contrôler contraste/focus deux thèmes        | Cible WCAG 2.2 AA respectée           |
| CT-039 | US14-CA01 | Passant       | Retarder la réponse                          | Chargement visible puis supprimé      |
| CT-040 | US14-CA02 | Négatif       | Retourner 200 avec liste vide                | État vide distinct d'une erreur       |
| CT-041 | US14-CA03 | Erreur        | 429, 500, 503, timeout, offline puis retry   | Message adapté et récupération        |
| CT-042 | US15-CA01 | Accessibilité | Parcours complet clavier                     | Focus visible, ordre logique          |
| CT-043 | US15-CA02 | Accessibilité | Inspecter nom, rôle et état                  | Contrôles correctement annoncés       |
| CT-044 | US15-CA03 | Responsive    | 320 px et zoom 200 %                         | Aucune perte essentielle              |
| CT-045 | F17       | Automatisé    | Audit axe-core des vues                      | Aucune violation critique             |

## 4. Contrôles API transverses

Pour CT-001, CT-004 à CT-012 et CT-039 à CT-041, vérifier également :

1. code HTTP exact ;
2. `Content-Type` JSON ;
3. temps de réponse enregistré ;
4. schéma minimal ;
5. SIREN/SIRET et dates valides ;
6. cohérence `page`, `per_page`, total et nombre retourné ;
7. absence de secret dans requêtes, réponses et logs ;
8. comportement maîtrisé pour 400, 404, 429, 5xx et payload invalide.
