import { test, expect } from '../../fixtures/test.fixture';

test.describe('Validation des données de recherche', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.goto();
  });

  test(
    'CT-002 — ne pas appeler l’API pour une recherche vide',
    {
      tag: ['@functional', '@mocked', '@p1', '@negative'],
      annotation: [
        { type: 'user-story', description: 'US01' },
        { type: 'acceptance-criteria', description: 'US01-CA02' },
        { type: 'feature', description: 'F02' },
      ],
    },
    async ({ page, searchPage }) => {
      let apiRequestCount = 0;

      await page.route(
        'https://recherche-entreprises.api.gouv.fr/search?**',
        async (route) => {
          apiRequestCount += 1;
          await route.fulfill({
            status: 500,
            body: 'Unexpected API request',
          });
        },
      );

      const invalidValues = ['', '   '];

      for (const value of invalidValues) {
        await test.step(
          value === '' ? 'chaîne vide' : 'espaces uniquement',
          async () => {
            await searchPage.searchFor(value);

            await expect(searchPage.searchState).toHaveText(
              'Entre un terme de recherche.',
            );
          },
        );
      }

      expect(apiRequestCount).toBe(0);
    },
  );

  test(
    'CT-006 [UI] — refuser les identifiants numériques mal formés',
    {
      tag: ['@functional', '@mocked', '@p1', '@negative'],
      annotation: [
        { type: 'user-story', description: 'US02' },
        { type: 'acceptance-criteria', description: 'US02-CA03' },
        { type: 'feature', description: 'F02' },
      ],
    },
    async ({ page, searchPage }) => {
      let apiRequestCount = 0;

      await page.route(
        'https://recherche-entreprises.api.gouv.fr/search?**',
        async (route) => {
          apiRequestCount += 1;
          await route.fulfill({
            status: 500,
            body: 'Unexpected API request',
          });
        },
      );

      const invalidIdentifiers = [
        '12345678',
        '1234567890',
        '1234567890123',
        '123456789012345',
      ];

      for (const identifier of invalidIdentifiers) {
        await test.step(`${identifier.length} chiffres`, async () => {
          await searchPage.searchFor(identifier);

          await expect(searchPage.searchState).toHaveText(
            'Identifiant invalide : un SIREN contient 9 chiffres et un SIRET 14 chiffres',
          );
        });
      }

      expect(apiRequestCount).toBe(0);
    },
  );
});
