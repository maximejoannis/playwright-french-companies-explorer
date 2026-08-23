import { test, expect } from '../../fixtures/test.fixture';
import { mixedCompanies } from '../../test-data/api-responses/companies';

const API_PATTERN = 'https://recherche-entreprises.api.gouv.fr/search?**';

function paginationParameters(requestUrl: string): {
  page: number;
  pageSize: number;
} {
  const url = new URL(requestUrl);

  return {
    page: Number(url.searchParams.get('page') ?? '1'),
    pageSize: Number(url.searchParams.get('per_page') ?? '20'),
  };
}

test(
  'CT-014 — désactiver la pagination à ses bornes',
  {
    tag: ['@functional', '@mocked', '@p1', '@boundary'],
    annotation: [
      { type: 'user-story', description: 'US05' },
      { type: 'acceptance-criteria', description: 'US05-CA02' },
      { type: 'feature', description: 'F06' },
    ],
  },
  async ({ page, searchPage }) => {
    const companies = mixedCompanies.slice(0, 15);

    await page.route(API_PATTERN, async (route) => {
      const { page: requestedPage, pageSize } = paginationParameters(
        route.request().url(),
      );

      const startIndex = (requestedPage - 1) * pageSize;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: companies.slice(startIndex, startIndex + pageSize),
          total_results: companies.length,
          page: requestedPage,
          per_page: pageSize,
        }),
      });
    });

    await searchPage.goto();
    await searchPage.searchFor('Entreprise');
    await searchPage.selectPageSize(10);

    await test.step('Première page', async () => {
      await expect(searchPage.pageLabel).toHaveText('Page 1 / 2');

      await expect(searchPage.previousPageButton).toBeDisabled();

      await expect(searchPage.nextPageButton).toBeEnabled();

      await expect(searchPage.companyCards).toHaveCount(10);
    });

    await searchPage.goToNextPage();

    await test.step('Dernière page', async () => {
      await expect(searchPage.pageLabel).toHaveText('Page 2 / 2');

      await expect(searchPage.previousPageButton).toBeEnabled();

      await expect(searchPage.nextPageButton).toBeDisabled();

      await expect(searchPage.companyCards).toHaveCount(5);
    });
  },
);

test(
  'CT-015 — récupérer la première page après une erreur sur la suivante',
  {
    tag: ['@functional', '@mocked', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US05' },
      { type: 'acceptance-criteria', description: 'US05-CA03' },
      { type: 'feature', description: 'F06 / F16' },
    ],
  },
  async ({ page, searchPage }) => {
    const companies = mixedCompanies.slice(0, 15);

    let firstPageRequestCount = 0;
    let secondPageRequestCount = 0;

    await page.route(API_PATTERN, async (route) => {
      const { page: requestedPage, pageSize } = paginationParameters(
        route.request().url(),
      );

      if (requestedPage === 2) {
        secondPageRequestCount += 1;

        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Internal server error',
          }),
        });

        return;
      }

      firstPageRequestCount += 1;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: companies.slice(0, pageSize),
          total_results: companies.length,
          page: 1,
          per_page: pageSize,
        }),
      });
    });

    await searchPage.goto();
    await searchPage.searchFor('Entreprise');
    await searchPage.selectPageSize(10);

    await expect(searchPage.pageLabel).toHaveText('Page 1 / 2');

    const expectedFirstPageSirens = await searchPage.displayedSirens();

    expect(expectedFirstPageSirens).toHaveLength(10);

    await searchPage.goToNextPage();

    await expect(searchPage.resultCount).toHaveText('Erreur API');

    await expect(searchPage.searchState).toContainText(
      "Impossible de joindre l'API. Réessaie dans quelques instants.",
    );

    // La grille est vidée avant le chargement de la page suivante.
    await expect(searchPage.companyCards).toHaveCount(0);

    // Une nouvelle recherche repart explicitement de la page 1.
    await searchPage.searchFor('Entreprise');

    await expect(searchPage.resultCount).toHaveText('15 résultat(s)');

    await expect(searchPage.pageLabel).toHaveText('Page 1 / 2');

    await expect
      .poll(() => searchPage.displayedSirens())
      .toEqual(expectedFirstPageSirens);

    expect(firstPageRequestCount).toBeGreaterThanOrEqual(2);
    expect(secondPageRequestCount).toBe(1);
  },
);
