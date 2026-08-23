import { test, expect } from '../../fixtures/test.fixture';
import { sortCompanies } from '../../test-data/api-responses/sort-companies';

const API_PATTERN = 'https://recherche-entreprises.api.gouv.fr/search?**';

test.beforeEach(async ({ page, searchPage }) => {
  await page.route(API_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: sortCompanies,
        total_results: sortCompanies.length,
        page: 1,
        per_page: 20,
      }),
    });
  });

  await searchPage.goto();
  await searchPage.searchFor('Entreprise');

  /*
   * Précondition commune : le jeu de données doit être
   * entièrement affiché avant de commencer un tri.
   */
  await expect(searchPage.resultCount).toHaveText(
    `${sortCompanies.length} résultat(s)`,
  );

  await expect(searchPage.companyCards).toHaveCount(sortCompanies.length);

  await expect(searchPage.searchState).toBeHidden();
});

test(
  'CT-010 — trier les résultats par nom, date et statut',
  {
    tag: ['@functional', '@mocked', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US04' },
      { type: 'acceptance-criteria', description: 'US04-CA01' },
      { type: 'feature', description: 'F05' },
    ],
  },
  async ({ searchPage }) => {
    await test.step('Nom A vers Z', async () => {
      await searchPage.sortBy('name-asc');

      await expect
        .poll(() => searchPage.displayedCompanyNames())
        .toEqual(['ALPHA', 'BETA', 'DUPONT', 'DUPONT', 'ZETA']);
    });

    await test.step('Nom Z vers A', async () => {
      await searchPage.sortBy('name-desc');

      await expect
        .poll(() => searchPage.displayedCompanyNames())
        .toEqual(['ZETA', 'DUPONT', 'DUPONT', 'BETA', 'ALPHA']);
    });

    await test.step('Création récente', async () => {
      await searchPage.sortBy('creation-newest');

      const names = await searchPage.displayedCompanyNames();

      const companiesWithKnownDates = names.filter((name) =>
        ['ALPHA', 'BETA', 'ZETA'].includes(name),
      );

      expect(companiesWithKnownDates).toEqual(['ALPHA', 'BETA', 'ZETA']);
    });

    await test.step('Création ancienne', async () => {
      await searchPage.sortBy('creation-oldest');

      const names = await searchPage.displayedCompanyNames();

      const companiesWithKnownDates = names.filter((name) =>
        ['ALPHA', 'BETA', 'ZETA'].includes(name),
      );

      expect(companiesWithKnownDates).toEqual(['ZETA', 'BETA', 'ALPHA']);
    });

    await test.step('Statut', async () => {
      await searchPage.sortBy('status');

      const cardContents = await searchPage.companyCards.allTextContents();

      const statuses = cardContents.map((content) =>
        content.includes('En activité') ? 'A' : 'C',
      );

      expect(statuses).toEqual(['A', 'A', 'A', 'C', 'C']);
    });
  },
);

test(
  'CT-011 — conserver les homonymes et valeurs absentes',
  {
    tag: ['@functional', '@mocked', '@p1', '@negative'],
    annotation: [
      { type: 'user-story', description: 'US04' },
      { type: 'acceptance-criteria', description: 'US04-CA02' },
      { type: 'feature', description: 'F05' },
    ],
  },
  async ({ searchPage }) => {
    await searchPage.sortBy('name-asc');

    await expect(searchPage.companyCards).toHaveCount(sortCompanies.length);

    const firstSort = await searchPage.displayedSirens();

    expect(firstSort).toHaveLength(sortCompanies.length);

    await searchPage.sortBy('name-desc');
    await searchPage.sortBy('name-asc');

    await expect(searchPage.companyCards).toHaveCount(sortCompanies.length);

    const secondSort = await searchPage.displayedSirens();

    expect(secondSort).toEqual(firstSort);

    /*
     * Les deux entreprises homonymes doivent être conservées.
     */
    expect(secondSort).toContain('100000004');
    expect(secondSort).toContain('100000005');

    await searchPage.sortBy('creation-newest');

    await expect(searchPage.companyCards).toHaveCount(sortCompanies.length);

    await searchPage.sortBy('creation-oldest');

    await expect(searchPage.companyCards).toHaveCount(sortCompanies.length);
  },
);

test(
  'CT-012 — conserver le total et les identifiants après chaque tri',
  {
    tag: ['@functional', '@mocked', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US04' },
      { type: 'acceptance-criteria', description: 'US04-CA03' },
      { type: 'feature', description: 'F04 / F05' },
    ],
  },
  async ({ searchPage }) => {
    const expectedSirens = sortCompanies.map((company) => company.siren).sort();

    const sortModes = [
      'name-asc',
      'name-desc',
      'creation-newest',
      'creation-oldest',
      'status',
    ] as const;

    for (const sortMode of sortModes) {
      await test.step(sortMode, async () => {
        await searchPage.sortBy(sortMode);

        await expect(searchPage.resultCount).toHaveText(
          `${sortCompanies.length} résultat(s)`,
        );

        await expect(searchPage.companyCards).toHaveCount(sortCompanies.length);

        const displayedSirens = await searchPage.displayedSirens();

        expect(displayedSirens.sort()).toEqual(expectedSirens);
      });
    }
  },
);
