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
  'CT-022 — ne pas dupliquer un favori après plusieurs rechargements',
  {
    tag: ['@functional', '@mocked', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US08' },
      { type: 'acceptance-criteria', description: 'US08-CA01' },
      { type: 'feature', description: 'F09' },
    ],
  },
  async ({ page, searchPage, favoritesPage }) => {
    await searchPage.goto();
    await searchPage.searchFor('Entreprise partielle');

    await expect(searchPage.companyCard(partialCompany.siren)).toBeVisible();

    await searchPage.favoriteButton(partialCompany.siren).click();

    await page.reload();
    await favoritesPage.open();

    await expect(favoritesPage.favoriteCard(partialCompany.siren)).toHaveCount(
      1,
    );

    await page.reload();
    await favoritesPage.open();

    await expect(favoritesPage.favoriteCard(partialCompany.siren)).toHaveCount(
      1,
    );

    const storedSirens = await page.evaluate(() => {
      const favorites = JSON.parse(
        localStorage.getItem('fce_favorites') ?? '[]',
      ) as Array<{ siren: string }>;

      return favorites.map((favorite) => favorite.siren);
    });

    expect(storedSirens).toEqual([partialCompany.siren]);
  },
);

test(
  'CT-023 — reprendre après corruption du stockage des favoris',
  {
    tag: ['@functional', '@mocked', '@p1', '@negative'],
    annotation: [
      { type: 'user-story', description: 'US08' },
      { type: 'acceptance-criteria', description: 'US08-CA03' },
      { type: 'feature', description: 'F09 / F16' },
    ],
  },
  async ({ page, searchPage, favoritesPage }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fce_favorites', '{json-invalide');
    });

    await searchPage.goto();

    await expect(searchPage.searchInput).toBeVisible();

    await favoritesPage.open();
    await expect(favoritesPage.emptyState).toBeVisible();

    await page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Recherche',
        exact: true,
      })
      .click();

    await searchPage.searchFor('Entreprise partielle');

    await expect(searchPage.companyCard(partialCompany.siren)).toBeVisible();

    await expect(searchPage.searchState).toBeHidden();
  },
);
