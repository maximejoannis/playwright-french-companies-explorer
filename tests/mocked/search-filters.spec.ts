import { test, expect } from '../../fixtures/test.fixture';
import {
  mixedCompanies,
  type CompanyStatus,
} from '../../test-data/api-responses/companies';

const API_PATTERN = 'https://recherche-entreprises.api.gouv.fr/search?**';

test.beforeEach(async ({ page, searchPage }) => {
  await page.route(API_PATTERN, async (route) => {
    const requestUrl = new URL(route.request().url());

    const requestedPage = Number(requestUrl.searchParams.get('page') ?? '1');

    const requestedPageSize = Number(
      requestUrl.searchParams.get('per_page') ?? '20',
    );

    const requestedStatus = requestUrl.searchParams.get(
      'etat_administratif',
    ) as CompanyStatus | null;

    const filteredCompanies = requestedStatus
      ? mixedCompanies.filter(
          (company) => company.etat_administratif === requestedStatus,
        )
      : mixedCompanies;

    const startIndex = (requestedPage - 1) * requestedPageSize;

    const paginatedCompanies = filteredCompanies.slice(
      startIndex,
      startIndex + requestedPageSize,
    );

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: paginatedCompanies,
        total_results: filteredCompanies.length,
        page: requestedPage,
        per_page: requestedPageSize,
      }),
    });
  });

  await searchPage.goto();
});

test(
  'CT-007 — filtrer les entreprises selon leur statut',
  {
    tag: ['@functional', '@mocked', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US03' },
      { type: 'acceptance-criteria', description: 'US03-CA01' },
      { type: 'feature', description: 'F03' },
    ],
  },
  async ({ searchPage }) => {
    await searchPage.searchFor('Entreprise');

    await searchPage.filterByStatus('A');

    await expect(searchPage.resultCount).toHaveText('5 résultat(s)');
    await expect(searchPage.companyCards).toHaveCount(5);

    const activeCards = await searchPage.companyCards.allTextContents();

    expect(activeCards.every((card) => card.includes('En activité'))).toBe(
      true,
    );

    await searchPage.filterByStatus('C');

    await expect(searchPage.resultCount).toHaveText('25 résultat(s)');

    // La taille de page par défaut est 20.
    await expect(searchPage.companyCards).toHaveCount(20);

    const closedCards = await searchPage.companyCards.allTextContents();

    expect(closedCards.every((card) => card.includes('Cessée'))).toBe(true);
  },
);

test(
  'CT-008 — respecter les tailles de page autorisées',
  {
    tag: ['@functional', '@mocked', '@p1', '@boundary'],
    annotation: [
      { type: 'user-story', description: 'US03' },
      { type: 'acceptance-criteria', description: 'US03-CA02' },
      { type: 'feature', description: 'F03 / F06' },
    ],
  },
  async ({ searchPage }) => {
    await searchPage.searchFor('Entreprise');

    const pageSizes = [10, 20, 25] as const;

    for (const pageSize of pageSizes) {
      await test.step(`${pageSize} résultats par page`, async () => {
        await searchPage.selectPageSize(pageSize);

        await expect(searchPage.resultCount).toHaveText('30 résultat(s)');

        await expect(searchPage.companyCards).toHaveCount(pageSize);

        await expect(searchPage.pageLabel).toHaveText(
          `Page 1 / ${Math.ceil(30 / pageSize)}`,
        );
      });
    }
  },
);

test(
  'CT-009 — revenir à une page valide après filtrage',
  {
    tag: ['@functional', '@mocked', '@p1', '@boundary'],
    annotation: [
      { type: 'user-story', description: 'US03' },
      { type: 'acceptance-criteria', description: 'US03-CA03' },
      { type: 'feature', description: 'F03 / F06' },
    ],
  },
  async ({ searchPage }) => {
    await searchPage.searchFor('Entreprise');
    await searchPage.selectPageSize(10);

    await searchPage.goToNextPage();
    await expect(searchPage.pageLabel).toHaveText('Page 2 / 3');

    await searchPage.goToNextPage();
    await expect(searchPage.pageLabel).toHaveText('Page 3 / 3');

    // Le jeu de 30 résultats ne permet que trois pages.
    // On applique depuis la dernière page un filtre ne donnant
    // plus qu’une seule page.
    await searchPage.filterByStatus('A');

    await expect(searchPage.resultCount).toHaveText('5 résultat(s)');

    await expect(searchPage.companyCards).toHaveCount(5);
    await expect(searchPage.pageLabel).toHaveText('Page 1 / 1');
    await expect(searchPage.pagination).toBeHidden();

    const activeCards = await searchPage.companyCards.allTextContents();

    expect(activeCards.every((card) => card.includes('En activité'))).toBe(
      true,
    );
  },
);
