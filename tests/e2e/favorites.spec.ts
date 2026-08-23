import { test, expect } from '../../fixtures/test.fixture';
import { companies } from '../../test-data/companies';

test.beforeEach(async ({ searchPage }) => {
  await searchPage.goto();
});

test(
  'CT-021 — conserver puis retirer un favori',
  {
    tag: ['@functional', '@e2e', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US08' },
      {
        type: 'acceptance-criteria',
        description: 'US08-CA01 / US08-CA02',
      },
      { type: 'feature', description: 'F09' },
    ],
  },
  async ({ page, searchPage, favoritesPage }) => {
    await searchPage.searchFor(companies.laPoste.siren);

    const companyCard = searchPage.companyCard(companies.laPoste.siren);

    await expect(companyCard).toBeVisible();

    await searchPage.favoriteButton(companies.laPoste.siren).click();

    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const favorites = JSON.parse(
            localStorage.getItem('fce_favorites') ?? '[]',
          );

          return favorites.length;
        });
      })
      .toBe(1);

    await page.reload();

    await favoritesPage.open();

    await expect(
      favoritesPage.favoriteCard(companies.laPoste.siren),
    ).toHaveCount(1);

    await favoritesPage.removeFavorite(companies.laPoste.siren);

    await expect(favoritesPage.emptyState).toBeVisible();

    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const favorites = JSON.parse(
            localStorage.getItem('fce_favorites') ?? '[]',
          );

          return favorites.length;
        });
      })
      .toBe(0);
  },
);
