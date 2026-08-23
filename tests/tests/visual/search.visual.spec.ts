import { expect, test } from '../../fixtures/test.fixture';
import { exportCompanies } from '../../test-data/api-responses/export-companies';

const SEARCH_API_PATTERN =
  'https://recherche-entreprises.api.gouv.fr/search?**';

test.use({
  colorScheme: 'light',
  viewport: {
    width: 1440,
    height: 900,
  },
});

test.describe('Régression visuelle — recherche', () => {
  test(
    'CT-037 — apparence de la page de recherche vide',
    {
      tag: ['@visual', '@regression', '@p2'],
      annotation: [
        {
          type: 'requirement',
          description: 'US-VISUAL — préserver la présentation de l’interface',
        },
        {
          type: 'acceptance-criterion',
          description:
            'CA-037 — la page de recherche vide reste visuellement conforme',
        },
        {
          type: 'traceability',
          description: 'CT-037 → US-VISUAL → CA-037',
        },
      ],
    },
    async ({ page, searchPage }) => {
      await searchPage.goto();

      const searchView = page.locator('#searchView');

      await test.step('Attendre un état visuel stable', async () => {
        await expect(searchView).toBeVisible();

        await expect(searchPage.searchInput).toBeVisible();
        await expect(searchPage.searchButton).toBeVisible();

        await expect(searchPage.resultCount).toHaveText('0 résultat');

        await page.evaluate(async () => {
          await document.fonts.ready;
        });
      });

      await test.step('Comparer la page avec son référentiel visuel', async () => {
        await expect(searchView).toHaveScreenshot('search-empty.png', {
          animations: 'disabled',
          caret: 'hide',
          scale: 'css',
          maxDiffPixelRatio: 0.01,
        });
      });
    },
  );

  test(
    'CT-038 — apparence des résultats de recherche',
    {
      tag: ['@visual', '@mocked', '@regression', '@p2'],
      annotation: [
        {
          type: 'requirement',
          description: 'US-VISUAL — préserver la présentation de l’interface',
        },
        {
          type: 'acceptance-criterion',
          description:
            'CA-038 — les résultats restent visuellement conformes avec des données déterministes',
        },
        {
          type: 'traceability',
          description: 'CT-038 → US-VISUAL → CA-038',
        },
      ],
    },
    async ({ page, searchPage }) => {
      await page.route(SEARCH_API_PATTERN, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [exportCompanies[0]],
            total_results: 1,
            page: 1,
            per_page: 20,
            total_pages: 1,
          }),
        });
      });

      await searchPage.goto();

      const searchView = page.locator('#searchView');

      await test.step('Effectuer une recherche avec une réponse déterministe', async () => {
        await searchPage.searchInput.fill('Société Été');
        await searchPage.searchButton.click();

        await expect(searchPage.companyCards).toHaveCount(1);

        await expect(
          page.getByRole('heading', {
            name: 'SOCIÉTÉ ÉTÉ, FRANCE',
          }),
        ).toBeVisible();

        await expect(searchPage.resultCount).toContainText('1 résultat');
      });

      await test.step('Attendre la stabilité de l’affichage', async () => {
        await page.evaluate(async () => {
          await document.fonts.ready;
        });

        await expect(searchView).toBeVisible();
      });

      await test.step('Comparer les résultats avec leur référentiel visuel', async () => {
        await expect(searchView).toHaveScreenshot('search-results.png', {
          animations: 'disabled',
          caret: 'hide',
          scale: 'css',
          maxDiffPixelRatio: 0.01,
        });
      });
    },
  );

  test(
    'CT-039 — apparence de la fiche entreprise',
    {
      tag: ['@visual', '@mocked', '@regression', '@p2'],
      annotation: [
        {
          type: 'requirement',
          description: 'US-VISUAL — préserver la présentation de l’interface',
        },
        {
          type: 'acceptance-criterion',
          description:
            'CA-039 — la fiche entreprise reste visuellement conforme',
        },
        {
          type: 'traceability',
          description: 'CT-039 → US-VISUAL → CA-039',
        },
      ],
    },
    async ({ page, searchPage }) => {
      await page.route(SEARCH_API_PATTERN, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [exportCompanies[0]],
            total_results: 1,
            page: 1,
            per_page: 20,
            total_pages: 1,
          }),
        });
      });

      await searchPage.goto();

      await test.step('Rechercher et ouvrir la fiche entreprise', async () => {
        await searchPage.searchInput.fill('Société Été');
        await searchPage.searchButton.click();

        const companyCard = searchPage.companyCards.filter({
          hasText: '300000001',
        });

        await expect(companyCard).toHaveCount(1);

        await companyCard
          .getByRole('button', {
            name: /voir la fiche/i,
          })
          .click();
      });

      const detailView = page.locator('#detailView');

      await test.step('Attendre la stabilité de la fiche', async () => {
        await expect(detailView).toBeVisible();

        await expect(
          detailView.getByRole('heading', {
            name: 'SOCIÉTÉ ÉTÉ, FRANCE',
          }),
        ).toBeVisible();

        await expect(detailView).toContainText('300000001');
        await expect(detailView).toContainText('PARIS');

        await page.evaluate(async () => {
          await document.fonts.ready;
        });
      });

      await test.step('Comparer la fiche avec son référentiel visuel', async () => {
        await expect(detailView).toHaveScreenshot('company-details.png', {
          animations: 'disabled',
          caret: 'hide',
          scale: 'css',
          maxDiffPixelRatio: 0.01,
        });
      });
    },
  );
});
