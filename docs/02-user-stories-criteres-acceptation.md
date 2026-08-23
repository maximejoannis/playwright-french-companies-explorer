# User stories et critères d'acceptation

## US01 — Rechercher par nom ou mot-clé

**En tant que** visiteur, **je veux** rechercher une entreprise par nom ou mot-clé **afin de** trouver les entités correspondantes.

- **US01-CA01** — Une saisie valide lance la recherche et affiche le total et les cartes.
- **US01-CA02** — Une saisie vide ou blanche ne déclenche pas d'appel inutile et guide l'utilisateur.
- **US01-CA03** — Une erreur du service affiche un état actionnable sans résultat trompeur.

## US02 — Rechercher par identifiant

**En tant que** visiteur, **je veux** rechercher par SIREN ou SIRET **afin de** retrouver une entité précise.

- **US02-CA01** — Un SIREN à 9 chiffres retourne l'entreprise correspondante si elle existe.
- **US02-CA02** — Un SIRET à 14 chiffres est accepté et rattaché à son entreprise.
- **US02-CA03** — Un format invalide ou inconnu produit un message clair.

## US03 — Filtrer les résultats

**En tant que** visiteur, **je veux** filtrer par statut et taille de page **afin de** réduire la liste.

- **US03-CA01** — Le filtre de statut ne présente que les entités conformes.
- **US03-CA02** — La taille 10, 20 ou 25 est respectée, sauf sur la dernière page.
- **US03-CA03** — Un changement de filtre remet la pagination dans un état valide.

## US04 — Trier les résultats

**En tant que** visiteur, **je veux** trier les résultats **afin de** faciliter leur analyse.

- **US04-CA01** — Chaque option produit l'ordre attendu.
- **US04-CA02** — Les valeurs absentes et homonymes sont traités de manière stable.
- **US04-CA03** — Le tri ne modifie ni le total ni l'ensemble des entités de la page.

## US05 — Paginer les résultats

**En tant que** visiteur, **je veux** parcourir les pages **afin de** consulter l'ensemble des résultats.

- **US05-CA01** — Suivant et Précédent changent la page sans doublon indu.
- **US05-CA02** — Précédent est désactivé en première page et Suivant en dernière page.
- **US05-CA03** — Une erreur de chargement d'une page conserve un état récupérable.

## US06 — Consulter une fiche entreprise

**En tant que** visiteur, **je veux** consulter une fiche détaillée **afin de** vérifier l'identité de l'entreprise.

- **US06-CA01** — La fiche affichée correspond au SIREN sélectionné.
- **US06-CA02** — Les champs absents sont remplacés par un libellé neutre.
- **US06-CA03** — Le retour restaure la recherche et son état logique.

## US07 — Consulter les établissements

**En tant que** visiteur, **je veux** filtrer les établissements **afin de** distinguer les actifs des fermés.

- **US07-CA01** — Tous, Actifs et Fermés appliquent le statut demandé.
- **US07-CA02** — Chaque établissement affiche SIRET, adresse et statut disponibles.
- **US07-CA03** — Une liste vide est explicitement signalée.

## US08 — Gérer les favoris

**En tant que** visiteur, **je veux** conserver des favoris localement **afin de** retrouver rapidement des entreprises.

- **US08-CA01** — Ajouter ou retirer est idempotent et reflété dans toutes les vues.
- **US08-CA02** — Les favoris persistent après rechargement.
- **US08-CA03** — Un stockage corrompu ou indisponible n'empêche pas la recherche principale.

## US09 — Comparer des entreprises

**En tant que** visiteur, **je veux** comparer jusqu'à trois entreprises **afin de** confronter leurs attributs.

- **US09-CA01** — Deux ou trois entreprises sont alignées sur les mêmes attributs.
- **US09-CA02** — Un doublon n'est pas ajouté et une quatrième entreprise est refusée clairement.
- **US09-CA03** — Une donnée absente ne décale pas les colonnes.

## US10 — Utiliser l'historique et les recherches sauvegardées

**En tant que** visiteur, **je veux** relancer ou sauvegarder une recherche **afin de** la réutiliser.

- **US10-CA01** — Une recherche réussie apparaît dans l'historique et peut être relancée.
- **US10-CA02** — La sauvegarde conserve requête et filtres sans doublon incohérent.
- **US10-CA03** — Effacer supprime uniquement la collection ciblée.

## US11 — Exporter les résultats

**En tant qu'** analyste, **je veux** exporter en JSON ou CSV **afin de** réutiliser les résultats.

- **US11-CA01** — Le fichier contient les résultats et colonnes attendus.
- **US11-CA02** — UTF-8, accents, guillemets et séparateurs sont correctement gérés.
- **US11-CA03** — Les cellules commençant par `=`, `+`, `-` ou `@` sont neutralisées en CSV.

## US12 — Copier le SIREN et ouvrir l'annuaire

**En tant que** visiteur, **je veux** copier le SIREN et consulter l'annuaire officiel **afin de** poursuivre ma vérification.

- **US12-CA01** — Le presse-papiers reçoit exactement le SIREN à 9 chiffres.
- **US12-CA02** — Le lien cible le SIREN courant.
- **US12-CA03** — Un refus d'accès au presse-papiers produit un message non bloquant.

## US13 — Changer de thème

**En tant que** visiteur, **je veux** choisir un thème lisible **afin d'** adapter l'affichage.

- **US13-CA01** — Le thème bascule et reste cohérent entre les vues.
- **US13-CA02** — Le choix persiste après rechargement si cette persistance est spécifiée.
- **US13-CA03** — Contraste et focus restent conformes dans les deux thèmes.

## US14 — Comprendre les états système

**En tant que** visiteur, **je veux** distinguer chargement, vide et erreur **afin de** comprendre la situation.

- **US14-CA01** — Un indicateur apparaît pendant la requête sans faux résultat.
- **US14-CA02** — L'absence de résultat est distincte d'une erreur technique.
- **US14-CA03** — Une action Réessayer permet la récupération après une erreur transitoire.

## US15 — Utiliser l'application au clavier et sur mobile

**En tant qu'** utilisateur clavier ou mobile, **je veux** accomplir les parcours essentiels **afin d'** accéder au service sans obstacle.

- **US15-CA01** — Toutes les actions essentielles sont utilisables au clavier avec focus visible.
- **US15-CA02** — Les contrôles possèdent un nom et un état accessibles.
- **US15-CA03** — À 320 px et au zoom 200 %, aucune action essentielle n'est perdue.
