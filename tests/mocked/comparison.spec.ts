import { expect, test } from '../../fixtures/test.fixture';
import { partialCompany } from '../../test-data/api-responses/detail-companies';
import { sortCompanies } from '../../test-data/api-responses/sort-companies';

const API_PATTERN = 'https://recherche-entreprises.api.gouv.fr/search?**';

test(
  'CT-025 — ignorer un doublon et refuser une quatrième entreprise',
  {
    tag: ['@functional', '@mocked', '@p1', '@negative'],
    annotation: [
      {
        type: 'user-story',
        description: 'US09',
      },
      {
        type: 'acceptance-criteria',
        description: 'US09-CA02',
      },
      {
        type: 'feature',
        description: 'F10',
      },
    ],
  },
  async ({ page, searchPage, comparisonPage }) => {
    const companies = sortCompanies.slice(0, 4);

    await page.route(API_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: companies,
          total_results: companies.length,
          page: 1,
          per_page: 20,
        }),
      });
    });

    await searchPage.goto();
    await searchPage.searchFor('Entreprise');

    await expect(searchPage.companyCards).toHaveCount(4);

    const [first, second, third, fourth] = companies.map(
      (company) => company.siren,
    );

    await searchPage.compareButton(first).click();

    /*
     * Deuxième tentative sur le même SIREN.
     */
    await searchPage.compareButton(first).click();

    await expect(comparisonPage.toast).toHaveText('Déjà dans la comparaison.');

    await expect(comparisonPage.panels).toHaveCount(1);

    await searchPage.openFromNavigation();

    await searchPage.compareButton(second).click();
    await searchPage.compareButton(third).click();

    /*
     * La quatrième entreprise doit être refusée.
     */
    await searchPage.compareButton(fourth).click();

    await expect(comparisonPage.toast).toHaveText(
      'La comparaison est limitée à trois entreprises.',
    );

    await expect(comparisonPage.panels).toHaveCount(3);

    expect((await comparisonPage.displayedSirens()).sort()).toEqual(
      [first, second, third].sort(),
    );

    await expect(comparisonPage.panel(fourth)).toHaveCount(0);
  },
);

test(
  'CT-026 — aligner une comparaison avec des données absentes',
  {
    tag: ['@functional', '@mocked', '@p1', '@negative'],
    annotation: [
      {
        type: 'user-story',
        description: 'US09',
      },
      {
        type: 'acceptance-criteria',
        description: 'US09-CA03',
      },
      {
        type: 'feature',
        description: 'F10',
      },
    ],
  },
  async ({ page, searchPage, comparisonPage }) => {
    const companies = [partialCompany, sortCompanies[0], sortCompanies[1]];

    await page.route(API_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: companies,
          total_results: companies.length,
          page: 1,
          per_page: 20,
        }),
      });
    });

    await searchPage.goto();
    await searchPage.searchFor('Entreprise');

    await expect(searchPage.companyCards).toHaveCount(3);

    for (const company of companies) {
      await searchPage.compareButton(company.siren).click();
    }

    await comparisonPage.open();

    await expect(comparisonPage.panels).toHaveCount(3);
    await expect(comparisonPage.table).toBeVisible();

    /*
     * L’assertion auto-attendue stabilise la collection avant all().
     */
    await expect(comparisonPage.rows).toHaveCount(8);

    const rows = await comparisonPage.rows.all();

    for (const row of rows) {
      /*
       * Un libellé de critère et trois valeurs alignées.
       */
      await expect(row.locator('th')).toHaveCount(1);
      await expect(row.locator('td')).toHaveCount(3);
    }

    await expect(comparisonPage.table).not.toContainText('undefined');

    await expect(comparisonPage.table).not.toContainText('null');

    await expect(comparisonPage.table).toContainText(
      /Non renseigné|Non renseignée|—/,
    );
  },
);
