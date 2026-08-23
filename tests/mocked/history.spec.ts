import { test, expect } from '../../fixtures/test.fixture';
import { partialCompany } from '../../test-data/api-responses/detail-companies';

const API_PATTERN = 'https://recherche-entreprises.api.gouv.fr/search?**';

test.beforeEach(async ({ page }) => {
  await page.route(API_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [partialCompany],
        total_results: 1,
        page: 1,
        per_page: 20,
      }),
    });
  });
});

test(
  'CT-028 — mettre à jour une recherche sauvegardée sans doublon',
  {
    tag: ['@functional', '@mocked', '@p2', '@negative'],
    annotation: [
      { type: 'user-story', description: 'US10' },
      { type: 'acceptance-criteria', description: 'US10-CA02' },
      { type: 'feature', description: 'F11' },
    ],
  },
  async ({ page, searchPage, historyPage }) => {
    await searchPage.goto();
    await searchPage.searchFor('La Poste');

    await expect(searchPage.companyCards).toHaveCount(1);

    await searchPage.saveCurrentSearch('Recherche Poste');

    await searchPage.saveCurrentSearch('Recherche Poste mise à jour');

    await historyPage.open();

    await expect(historyPage.savedSearchesList.locator('article')).toHaveCount(
      1,
    );

    const savedSearch = historyPage.savedSearchEntry(
      'Recherche Poste mise à jour',
    );

    await expect(savedSearch).toHaveCount(1);
    await expect(savedSearch).toContainText('La Poste');

    await expect(historyPage.savedSearchEntry('Recherche Poste')).toHaveCount(
      0,
    );

    const storedSearches = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('fce_saved') ?? '[]') as Array<{
        name: string;
        query: string;
      }>;
    });

    expect(storedSearches).toHaveLength(1);

    expect(storedSearches[0]).toMatchObject({
      name: 'Recherche Poste mise à jour',
      query: 'La Poste',
    });
  },
);

test(
  'CT-029 — effacer l’historique sans supprimer les recherches sauvegardées',
  {
    tag: ['@functional', '@mocked', '@p2'],
    annotation: [
      { type: 'user-story', description: 'US10' },
      { type: 'acceptance-criteria', description: 'US10-CA03' },
      { type: 'feature', description: 'F11' },
    ],
  },
  async ({ page, searchPage, historyPage }) => {
    await searchPage.goto();
    await searchPage.searchFor('La Poste');

    await expect(searchPage.companyCards).toHaveCount(1);

    await searchPage.saveCurrentSearch('Recherche Poste');

    await historyPage.open();

    await expect(historyPage.historyEntry('La Poste')).toHaveCount(1);

    await expect(historyPage.savedSearchEntry('Recherche Poste')).toHaveCount(
      1,
    );

    await historyPage.clearHistory();

    await expect(historyPage.emptyHistoryState).toBeVisible();

    await expect(historyPage.savedSearchEntry('Recherche Poste')).toHaveCount(
      1,
    );

    const storageState = await page.evaluate(() => {
      const history = JSON.parse(localStorage.getItem('fce_history') ?? '[]');

      const saved = JSON.parse(localStorage.getItem('fce_saved') ?? '[]');

      return {
        historyCount: history.length,
        savedCount: saved.length,
      };
    });

    expect(storageState).toEqual({
      historyCount: 0,
      savedCount: 1,
    });
  },
);
