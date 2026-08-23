# Matrice de traçabilité

## 1. Fonctionnalités vers user stories

| Fonctionnalité               | User stories           | Couverture            |
| ---------------------------- | ---------------------- | --------------------- |
| F01 Accueil                  | US01, US15             | Gherkin + smoke       |
| F02 Recherche                | US01, US02             | API, composant, E2E   |
| F03 Filtres                  | US03                   | API + UI mockée       |
| F04 Résultats                | US01, US03, US04       | API + composant + E2E |
| F05 Tri                      | US04                   | Composant             |
| F06 Pagination               | US03, US05             | API + E2E             |
| F07 Fiche                    | US06                   | UI mockée + E2E       |
| F08 Établissements           | US07                   | UI mockée             |
| F09 Favoris                  | US08                   | Composant + E2E       |
| F10 Comparaison              | US09                   | UI mockée + E2E       |
| F11 Historique               | US10                   | Composant + E2E       |
| F12 Recherches sauvegardées  | US10                   | Composant             |
| F13 Exports                  | US11                   | Composant + E2E       |
| F14 Actions fiche            | US12                   | UI mockée + E2E       |
| F15 Thème                    | US13                   | E2E + accessibilité   |
| F16 États système            | US01, US05, US08, US14 | API + UI mockée       |
| F17 Accessibilité/responsive | US13, US15             | Manuel + automatisé   |

## 2. Critères vers cas de test

| User story | Critère   | Cas de test    | Type principal     | Priorité |
| ---------- | --------- | -------------- | ------------------ | -------- |
| US01       | CA01      | CT-001         | E2E réel           | P0       |
| US01       | CA02      | CT-002         | UI mockée          | P1       |
| US01       | CA03      | CT-003         | UI mockée          | P0       |
| US02       | CA01      | CT-004         | API + E2E          | P0       |
| US02       | CA02      | CT-005         | API                | P1       |
| US02       | CA03      | CT-006         | Composant UI mocké | P1       |
| US03       | CA01      | CT-007         | API + UI mockée    | P1       |
| US03       | CA02      | CT-008         | API + UI mockée    | P1       |
| US03       | CA03      | CT-009         | UI mockée          | P1       |
| US04       | CA01      | CT-010         | Composant          | P1       |
| US04       | CA02      | CT-011         | Composant          | P1       |
| US04       | CA03      | CT-012         | Composant          | P1       |
| US05       | CA01      | CT-013         | E2E réel           | P1       |
| US05       | CA02      | CT-014         | UI mockée          | P1       |
| US05       | CA03      | CT-015         | UI mockée          | P1       |
| US06       | CA01      | CT-016         | E2E réel           | P0       |
| US06       | CA02      | CT-017         | UI mockée          | P1       |
| US06       | CA03      | CT-018         | E2E réel           | P1       |
| US07       | CA01/CA02 | CT-019         | UI mockée          | P1       |
| US07       | CA03      | CT-020         | UI mockée          | P1       |
| US08       | CA01/CA02 | CT-021, CT-022 | E2E + composant    | P1       |
| US08       | CA03      | CT-023         | Composant          | P1       |
| US09       | CA01      | CT-024         | E2E réel           | P1       |
| US09       | CA02      | CT-025         | UI mockée          | P1       |
| US09       | CA03      | CT-026         | UI mockée          | P1       |
| US10       | CA01      | CT-027         | E2E réel           | P2       |
| US10       | CA02      | CT-028         | Composant          | P2       |
| US10       | CA03      | CT-029         | Composant          | P2       |
| US11       | CA01      | CT-030         | E2E + composant    | P2       |
| US11       | CA02      | CT-031         | Composant          | P2       |
| US11       | CA03      | CT-032         | Sécurité/composant | P1       |
| US12       | CA01      | CT-033         | E2E réel           | P2       |
| US12       | CA02      | CT-034         | E2E réel           | P2       |
| US12       | CA03      | CT-035         | UI mockée          | P2       |
| US13       | CA01      | CT-036         | E2E réel           | P3       |
| US13       | CA02      | CT-037         | Composant/E2E      | P3       |
| US13       | CA03      | CT-038         | Accessibilité      | P1       |
| US14       | CA01      | CT-039         | UI mockée          | P1       |
| US14       | CA02      | CT-040         | UI mockée          | P1       |
| US14       | CA03      | CT-003, CT-041 | UI mockée          | P0       |
| US15       | CA01      | CT-042         | Accessibilité      | P1       |
| US15       | CA02      | CT-043         | Accessibilité      | P1       |
| US15       | CA03      | CT-044, CT-045 | Responsive/a11y    | P1       |

## 3. Couverture des risques

| Risque                                | Fonctionnalités | Cas couvrants                    | Statut de conception |
| ------------------------------------- | --------------- | -------------------------------- | -------------------- |
| R01 Recherche indisponible            | F02/F16         | CT-003, CT-041                   | Couvert              |
| R02 Identifiant erroné                | F02/F07         | CT-004 à CT-006, CT-016          | Couvert              |
| R03 Filtre/tri/pagination incohérents | F03/F05/F06     | CT-007 à CT-015                  | Couvert              |
| R04 Données partielles                | F07/F08/F10     | CT-017, CT-020, CT-026           | Couvert              |
| R05 Persistance locale perdue         | F09/F11/F12     | CT-021 à CT-023, CT-027 à CT-029 | Couvert              |
| R06 Export incorrect/dangereux        | F13             | CT-030 à CT-032                  | Couvert              |
| R07 Actions navigateur refusées       | F14             | CT-033 à CT-035                  | Couvert              |
| R08 Accessibilité/responsive          | F15/F17         | CT-038, CT-042 à CT-045          | Couvert              |

## 4. Synthèse

- 17 domaines fonctionnels.
- 15 user stories.
- 45 critères d'acceptation.
- 45 cas de test structurants.
- Couverture de conception : 100 % des critères.
- Priorité d'automatisation : P0, puis P1 API/composant/UI mockée, puis E2E et P2/P3.
