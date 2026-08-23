import { test, expect } from '../../fixtures/test.fixture';
import {
  partialCompany,
  companyWithMixedEstablishments,
  companyWithActiveEstablishmentsOnly,
} from '../../test-data/api-responses/detail-companies';

const API_PATTERN = 'https://recherche-entreprises.api.gouv.fr/search?**';

test.beforeEach(async ({ page, searchPage }) => {
  await page.route(API_PATTERN, async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('q');

    const company =
      query === 'Établissements'
        ? companyWithMixedEstablishments
        : query === 'Actifs uniquement'
          ? companyWithActiveEstablishmentsOnly
          : partialCompany;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [company],
        total_results: 1,
        page: 1,
        per_page: 20,
      }),
    });
  });

  await searchPage.goto();
});

test(
  'CT-017 — afficher une fiche avec des données partielles',
  {
    tag: ['@functional', '@mocked', '@p1', '@negative'],
    annotation: [
      { type: 'user-story', description: 'US06' },
      { type: 'acceptance-criteria', description: 'US06-CA02' },
      { type: 'feature', description: 'F07' },
    ],
  },
  async ({ searchPage, companyDetailsPage }) => {
    await searchPage.searchFor('Données partielles');

    const card = searchPage.companyCard(partialCompany.siren);

    await expect(card).toBeVisible();

    await searchPage.openCompanyDetails(partialCompany.siren);

    await expect(companyDetailsPage.title).toHaveText(
      partialCompany.nom_complet,
    );

    await expect(companyDetailsPage.root).toContainText(
      'Activité non renseignée',
    );

    await expect(companyDetailsPage.root).toContainText('Non renseigné');

    await expect(companyDetailsPage.root).not.toContainText('undefined');

    await expect(companyDetailsPage.root).not.toContainText('null');

    await expect(
      companyDetailsPage.root.getByText(partialCompany.siren, { exact: true }),
    ).toBeVisible();
  },
);

test(
  'CT-019 — filtrer les établissements par statut',
  {
    tag: ['@functional', '@mocked', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US07' },
      {
        type: 'acceptance-criteria',
        description: 'US07-CA01 / US07-CA02',
      },
      { type: 'feature', description: 'F08' },
    ],
  },
  async ({ searchPage, companyDetailsPage }) => {
    await searchPage.searchFor('Établissements');

    await searchPage.openCompanyDetails(companyWithMixedEstablishments.siren);

    await test.step('Tous les établissements', async () => {
      await companyDetailsPage.showAllEstablishments();

      await expect(
        companyDetailsPage.establishmentList.locator('.establishment'),
      ).toHaveCount(3);

      await expect(companyDetailsPage.establishmentList).toContainText(
        '20000000200001',
      );

      await expect(companyDetailsPage.establishmentList).toContainText(
        '20000000200002',
      );

      await expect(companyDetailsPage.establishmentList).toContainText(
        '20000000200003',
      );
    });

    await test.step('Établissements actifs', async () => {
      await companyDetailsPage.showActiveEstablishments();

      const establishments =
        companyDetailsPage.establishmentList.locator('.establishment');

      await expect(establishments).toHaveCount(2);

      const contents = await establishments.allTextContents();

      expect(contents.every((content) => content.includes('En activité'))).toBe(
        true,
      );
    });

    await test.step('Établissements fermés', async () => {
      await companyDetailsPage.showClosedEstablishments();

      const establishments =
        companyDetailsPage.establishmentList.locator('.establishment');

      await expect(establishments).toHaveCount(1);
      await expect(establishments).toContainText('20000000200002');
      await expect(establishments).toContainText('Fermé');
    });
  },
);

test(
  'CT-020 — afficher un état vide sans désactiver la fiche',
  {
    tag: ['@functional', '@mocked', '@p1', '@negative'],
    annotation: [
      { type: 'user-story', description: 'US07' },
      { type: 'acceptance-criteria', description: 'US07-CA03' },
      { type: 'feature', description: 'F08' },
    ],
  },
  async ({ searchPage, companyDetailsPage }) => {
    await searchPage.searchFor('Actifs uniquement');

    await searchPage.openCompanyDetails(
      companyWithActiveEstablishmentsOnly.siren,
    );

    await companyDetailsPage.showClosedEstablishments();

    await expect(companyDetailsPage.establishmentList).toHaveText(
      'Aucun établissement pour ce filtre.',
    );

    await expect(companyDetailsPage.title).toBeVisible();
    await expect(companyDetailsPage.backButton).toBeEnabled();
    await expect(companyDetailsPage.activeEstablishmentsButton).toBeEnabled();
  },
);
