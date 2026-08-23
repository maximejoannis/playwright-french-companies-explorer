# Cartographie fonctionnelle — French Companies Explorer

| Métadonnée   | Valeur                                                        |
| ------------ | ------------------------------------------------------------- |
| Application  | https://maximejoannis.github.io/french-companies-explorer-qa/ |
| Version      | 1.0                                                           |
| Date d'audit | 22 août 2026                                                  |
| Méthode      | Audit boîte noire non destructif                              |
| Référentiel  | ISTQB, approche fondée sur les risques                        |

## 1. Objectif

Cette cartographie décrit les fonctionnalités observées, les comportements déduits et les exigences de qualité proposées. Elle sert de référentiel aux user stories, scénarios Gherkin, cas de test et à la matrice de traçabilité.

## 2. Conventions

- **OBS** : comportement directement observé.
- **INF** : comportement déduit, à confirmer avec l'équipe.
- **REQ** : exigence de qualité proposée.
- **P0 à P3** : criticité décroissante.

## 3. Carte fonctionnelle

| ID  | Domaine                  | Fonctionnalités                                                | Source  | Criticité |
| --- | ------------------------ | -------------------------------------------------------------- | ------- | --------- |
| F01 | Accueil                  | Hero, navigation, recherches suggérées, appels à l'action      | OBS     | P2        |
| F02 | Recherche                | Recherche par nom, marque, mot-clé, SIREN ou SIRET             | OBS     | P0        |
| F03 | Filtres                  | Statut Tous/En activité/Cessée et taille 10/20/25              | OBS     | P1        |
| F04 | Résultats                | Total, statistiques, cartes, statut, siège, activité, création | OBS     | P0        |
| F05 | Tri                      | Pertinence, nom A-Z/Z-A, création récente/ancienne, statut     | OBS     | P1        |
| F06 | Pagination               | Page courante, total de pages, Précédent, Suivant              | OBS     | P1        |
| F07 | Fiche entreprise         | SIREN, SIRET siège, APE, siège, structure, effectif, création  | OBS     | P0        |
| F08 | Établissements           | Liste, SIRET, adresse, statut, filtres Tous/Actifs/Fermés      | OBS     | P1        |
| F09 | Favoris                  | Ajout, retrait, collection, suppression globale, persistance   | OBS/INF | P1        |
| F10 | Comparaison              | Ajout et comparaison de deux ou trois entreprises              | OBS     | P1        |
| F11 | Historique               | Enregistrement, relance et effacement des recherches           | OBS     | P2        |
| F12 | Recherches sauvegardées  | Sauvegarde et réutilisation d'une recherche                    | OBS     | P2        |
| F13 | Exports                  | Export des résultats aux formats JSON et CSV                   | OBS     | P2        |
| F14 | Actions fiche            | Copie du SIREN et ouverture de l'Annuaire des Entreprises      | OBS     | P2        |
| F15 | Thème                    | Bascule clair/sombre                                           | OBS     | P3        |
| F16 | États système            | Chargement, liste vide, erreur, 429, 5xx, timeout, offline     | REQ     | P0        |
| F17 | Accessibilité/responsive | Clavier, focus, noms accessibles, contraste, reflow            | REQ     | P1        |

## 4. Parcours utilisateurs

### P-01 — Recherche et consultation

1. Ouvrir l'accueil.
2. Accéder à la recherche.
3. Saisir un nom, mot-clé, SIREN ou SIRET.
4. Appliquer éventuellement filtres et tri.
5. Parcourir les pages.
6. Ouvrir une fiche.
7. Consulter les établissements.
8. Revenir aux résultats.

### P-02 — Constitution d'une collection

1. Rechercher une entreprise.
2. Ajouter l'entreprise aux favoris.
3. Ouvrir la vue Favoris.
4. Recharger l'application.
5. Retirer un favori ou supprimer toute la collection.

### P-03 — Comparaison

1. Rechercher plusieurs entreprises.
2. Ajouter deux puis trois entreprises à la comparaison.
3. Comparer les attributs sur des lignes communes.
4. Retirer une entreprise.

### P-04 — Réutilisation et partage des données

1. Relancer une recherche depuis l'historique.
2. Sauvegarder une recherche avec ses filtres.
3. Exporter les résultats en JSON ou CSV.
4. Copier un SIREN ou ouvrir l'annuaire externe.

## 5. Données manipulées

| Objet          | Attributs principaux                                | Contrôles attendus                                        |
| -------------- | --------------------------------------------------- | --------------------------------------------------------- |
| Requête        | texte, SIREN/SIRET, statut, page, taille, tri       | Encodage UTF-8, format, limites, valeurs autorisées       |
| Entreprise     | nom, SIREN, statut, activité, création              | SIREN à 9 chiffres, statut connu, date valide             |
| Siège          | SIRET, adresse, commune, code postal                | SIRET à 14 chiffres, valeurs nulles tolérées              |
| Structure      | catégorie, nature juridique, effectif               | Libellé neutre si donnée absente                          |
| Établissement  | SIRET, adresse, statut                              | Cohérence filtre/statut                                   |
| Stockage local | favoris, comparaison, historique, recherches, thème | JSON valide, absence de doublon, reprise après corruption |
| Export         | liste et métadonnées de recherche                   | UTF-8, échappement, neutralisation des formules CSV       |

## 6. États d'interface

| État                       | Comportement attendu                                              |
| -------------------------- | ----------------------------------------------------------------- |
| Initial                    | Invitation à saisir une recherche, aucun faux résultat            |
| Chargement                 | Indicateur visible, actions incompatibles maîtrisées              |
| Succès                     | Total, statistiques et cartes cohérents                           |
| Vide                       | Message « aucun résultat », distinct d'une erreur                 |
| Donnée partielle           | Valeur neutre, jamais `undefined`, `null` ou décalage de colonnes |
| Erreur client              | Message contextualisé pour saisie ou paramètre invalide           |
| Limitation 429             | Message temporaire, aucun retry agressif                          |
| Erreur 5xx/timeout/offline | Message actionnable et mécanisme Réessayer                        |

## 7. Dépendances et risques

L'application statique dépend d'une API publique de recherche d'entreprises et vraisemblablement du stockage local du navigateur. Les risques majeurs sont : indisponibilité ou évolution du contrat API, données facultatives, pagination incohérente, persistance locale corrompue, exports mal échappés et absence de retour utilisateur lors d'une erreur réseau.

## 8. Limites de l'audit

- Audit ponctuel sans accès au code source backend ni à une spécification OpenAPI.
- Données externes évolutives : les tests doivent cibler les invariants.
- Aucun test de charge agressif ni aucune modification de donnée externe.
- Les chemins exacts d'API et schémas complets restent à confirmer.
