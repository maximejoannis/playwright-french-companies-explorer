import { test, expect } from '../../fixtures/test.fixture';
import { companies } from '../../test-data/companies';

const successfulResponse = {
  total_results: 1,
  page: 1,
  per_page: 20,
  results: [
    {
      siren: companies.laPoste.siren,
      nom_complet: companies.laPoste.name,
      etat_administratif: 'A',
      date_creation: '1991-01-01',
      activite_principale: '53.10Z',
      libelle_activite_principale: 'Activités de poste',
      categorie_entreprise: 'GE',
      nature_juridique: '5510',
      tranche_effectif_salarie: '53',
      siege: {
        siret: '35600000000048',
        etat_administratif: 'A',
        code_postal: '75015',
        libelle_commune: 'PARIS',
        adresse:
          'DIRECTION GENERALE DE LA POSTE 9 RUE DU COLONEL PIERRE AVIA 75015 PARIS',
      },
      matching_etablissements: [],
    },
  ],
};

test(
  'CT-003 — récupérer une recherche après une erreur API',
  {
    tag: ['@functional', '@mocked', '@p0'],
    annotation: [
      { type: 'user-story', description: 'US01 / US14' },
      {
        type: 'acceptance-criteria',
        description: 'US01-CA03 / US14-CA03',
      },
      { type: 'feature', description: 'F16' },
    ],
  },
  async ({ page, searchPage }) => {
    let requestCount = 0;

    await page.route(
      'https://recherche-entreprises.api.gouv.fr/search?**',
      async (route) => {
        requestCount += 1;

        if (requestCount === 1) {
          await route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({
              message: 'Service temporarily unavailable',
            }),
          });

          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successfulResponse),
        });
      },
    );

    await searchPage.goto();

    // Première tentative : l’API retourne HTTP 503.
    await searchPage.searchFor('La Poste');

    await expect(searchPage.resultCount).toHaveText('Erreur API');

    await expect(searchPage.searchState).toContainText(
      "Impossible de joindre l'API. Réessaie dans quelques instants.",
    );

    // Deuxième tentative : l’API retourne HTTP 200.
    await searchPage.searchFor('La Poste');

    const companyCard = searchPage.companyCard(companies.laPoste.siren);

    await expect(companyCard).toBeVisible();
    await expect(companyCard).toContainText(companies.laPoste.name);
    await expect(searchPage.resultCount).toHaveText('1 résultat(s)');
    await expect(searchPage.searchState).toBeHidden();

    // Vérification de la récupération sans doublon.
    await expect(companyCard).toHaveCount(1);
    expect(requestCount).toBe(2);
  },
);
