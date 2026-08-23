# Scénarios Gherkin — French Companies Explorer

Les scénarios utilisent des données contrôlées ou des mocks lorsque l'état externe serait instable. Les tags indiquent la priorité et le niveau recommandé.

```gherkin
Feature: Recherche d'entreprises

  @P0 @e2e @US01-CA01
  Scenario: Rechercher une entreprise par nom
    Given je suis sur l'écran de recherche
    When je recherche "La Poste"
    Then un total de résultats est affiché
    And chaque carte visible présente au minimum un nom et un SIREN

  @P1 @ui-mock @US01-CA02
  Scenario Outline: Refuser une recherche vide
    Given je suis sur l'écran de recherche
    When je lance une recherche avec <saisie>
    Then aucun appel de recherche n'est envoyé
    And une consigne de saisie est affichée
    Examples:
      | saisie |
      | ""     |
      | "   "  |

  @P0 @ui-mock @US01-CA03 @US14-CA03
  Scenario: Récupérer après une erreur serveur
    Given la première requête de recherche retourne 503
    And la requête suivante retourne une liste valide
    When je recherche "Renault"
    Then un message d'indisponibilité est affiché
    When je sélectionne "Réessayer"
    Then les résultats sont affichés sans doublon

  @P0 @api @US02-CA01
  Scenario: Rechercher par SIREN valide
    When l'API est appelée avec le SIREN "356000000"
    Then la réponse HTTP vaut 200
    And le type de contenu est JSON
    And au moins une entreprise possède le SIREN "356000000"

  @P1 @api @US02-CA03
  Scenario Outline: Contrôler un identifiant invalide
    When une recherche est lancée avec <identifiant>
    Then la saisie est rejetée ou aucun résultat explicite est retourné
    Examples:
      | identifiant       |
      | "12345678"       |
      | "1234567890"     |
      | "1234567890123"  |
      | "123456789012345"|
```

```gherkin
Feature: Filtres, tri et pagination

  @P1 @api @US03-CA01
  Scenario: Filtrer les entreprises en activité
    Given un jeu contenant des entreprises actives et cessées
    When le filtre "En activité" est appliqué
    Then toutes les entreprises retournées sont actives

  @P1 @ui-mock @US03-CA02
  Scenario Outline: Modifier la taille de page
    Given au moins 30 résultats sont disponibles
    When je sélectionne la taille <taille>
    Then au plus <taille> cartes sont affichées
    Examples:
      | taille |
      | 10     |
      | 20     |
      | 25     |

  @P1 @ui-mock @US03-CA03
  Scenario: Revenir à une page valide après changement de filtre
    Given je suis sur la page 4 des résultats
    When j'applique un filtre ne comportant qu'une page
    Then la page 1 est affichée

  @P1 @component @US04-CA01
  Scenario Outline: Trier les entreprises
    Given un jeu déterministe avec noms, statuts et dates de création
    When le tri <tri> est appliqué
    Then les cartes suivent <ordre>
    Examples:
      | tri                | ordre                    |
      | Nom A vers Z       | nom croissant            |
      | Nom Z vers A       | nom décroissant          |
      | Création récente   | date décroissante        |
      | Création ancienne  | date croissante          |

  @P1 @e2e @US05-CA01
  Scenario: Naviguer entre deux pages
    Given une recherche contient plus de 20 résultats
    When je passe de la page 1 à la page 2
    Then l'indicateur affiche la page 2
    And les résultats correspondent à la seconde page
    When je reviens à la page précédente
    Then l'indicateur affiche la page 1
```

```gherkin
Feature: Fiche et établissements

  @P0 @e2e @US06-CA01
  Scenario: Ouvrir la fiche correspondant à une carte
    Given la carte de SIREN "356000000" est visible
    When j'ouvre sa fiche
    Then le titre est "LA POSTE"
    And le SIREN affiché est "356000000"

  @P1 @ui-mock @US06-CA02
  Scenario: Afficher une fiche avec des données facultatives absentes
    Given l'API retourne une entreprise sans activité ni effectif
    When j'ouvre la fiche
    Then des libellés neutres remplacent les valeurs absentes
    And aucun texte "undefined" ou "null" n'est visible

  @P1 @ui-mock @US07-CA01
  Scenario: Filtrer les établissements actifs
    Given la fiche contient des établissements actifs et fermés
    When je sélectionne "Actifs"
    Then seuls les établissements actifs sont affichés

  @P1 @ui-mock @US07-CA03
  Scenario: Aucun établissement fermé
    Given la fiche ne contient aucun établissement fermé
    When je sélectionne "Fermés"
    Then un état vide explicite est affiché
```

```gherkin
Feature: Favoris et comparaison

  @P1 @e2e @US08-CA01 @US08-CA02
  Scenario: Ajouter puis conserver un favori
    Given une entreprise est affichée dans les résultats
    When je l'ajoute aux favoris
    And je recharge l'application
    And j'ouvre la vue "Favoris"
    Then l'entreprise est présente une seule fois

  @P1 @component @US08-CA03
  Scenario: Reprendre après corruption du stockage local
    Given le stockage des favoris contient un JSON invalide
    When l'application démarre
    Then la collection est réinitialisée de manière sûre
    And la recherche reste utilisable

  @P1 @e2e @US09-CA01
  Scenario: Comparer trois entreprises
    Given trois entreprises distinctes sont disponibles
    When je les ajoute à la comparaison
    Then trois colonnes sont affichées
    And les mêmes attributs sont alignés sur chaque ligne

  @P1 @ui-mock @US09-CA02
  Scenario: Refuser une quatrième entreprise
    Given trois entreprises sont déjà comparées
    When j'ajoute une quatrième entreprise
    Then l'ajout est refusé avec une explication
    And les trois entreprises initiales sont conservées
```

```gherkin
Feature: Historique, sauvegarde et exports

  @P2 @e2e @US10-CA01
  Scenario: Relancer une recherche depuis l'historique
    Given j'ai recherché "La Poste"
    When j'ouvre l'historique
    And je relance cette recherche
    Then la requête "La Poste" et ses résultats sont restaurés

  @P2 @component @US10-CA03
  Scenario: Effacer uniquement l'historique
    Given un historique et une recherche sauvegardée existent
    When j'efface l'historique
    Then l'historique est vide
    And la recherche sauvegardée est conservée

  @P2 @e2e @US11-CA01
  Scenario Outline: Exporter les résultats
    Given une recherche réussie est affichée
    When j'exporte au format <format>
    Then un fichier du format <format> est produit
    And son contenu représente les résultats visibles
    Examples:
      | format |
      | JSON   |
      | CSV    |

  @P1 @component @US11-CA03
  Scenario Outline: Neutraliser une formule CSV
    Given une valeur exportée commence par <préfixe>
    When le CSV est généré
    Then la valeur ne peut pas être interprétée comme une formule
    Examples:
      | préfixe |
      | =       |
      | +       |
      | -       |
      | @       |
```

```gherkin
Feature: Actions, thème et accessibilité

  @P2 @e2e @US12-CA01
  Scenario: Copier le SIREN
    Given la fiche du SIREN "356000000" est ouverte
    When je sélectionne "Copier le SIREN"
    Then le presse-papiers contient exactement "356000000"

  @P2 @ui-mock @US12-CA03
  Scenario: Permission presse-papiers refusée
    Given le navigateur refuse l'accès au presse-papiers
    When je sélectionne "Copier le SIREN"
    Then un message non bloquant est affiché

  @P3 @e2e @US13-CA01
  Scenario: Changer de thème
    When je change le thème
    Then toutes les vues utilisent le nouveau thème
    And le contenu reste lisible

  @P1 @a11y @US15-CA01 @US15-CA02
  Scenario: Parcourir l'application au clavier
    Given je n'utilise pas de souris
    When je parcours les contrôles avec Tab et Maj+Tab
    Then chaque action essentielle reçoit un focus visible
    And chaque contrôle annonce un nom et un état accessibles

  @P1 @responsive @US15-CA03
  Scenario: Utiliser l'application à 320 pixels et zoom 200 pour cent
    Given la largeur de fenêtre est 320 pixels
    And le zoom est 200 pour cent
    When je réalise une recherche et ouvre une fiche
    Then aucune information ou action essentielle n'est perdue
```
