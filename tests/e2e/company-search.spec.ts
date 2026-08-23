import { test, expect } from '../../fixtures/test.fixture';
import { companies } from '../../test-data/companies';

test.beforeEach(async ({ searchPage }) => {
  await searchPage.goto();
});

test(
  'CT-001 — rechercher une entreprise par nom',
  {
    tag: ['@functional', '@e2e', '@p0', '@smoke'],
    annotation: [
      { type: 'user-story', description: 'US01' },
      { type: 'acceptance-criteria', description: 'US01-CA01' },
      { type: 'feature', description: 'F02 / F04' },
    ],
  },
  async ({ page, searchPage }) => {
    await searchPage.searchFor('La Poste');

    const firstCompanyCard = page
      .locator('[data-testid^="company-card-"]')
      .first();

    await expect(firstCompanyCard).toBeVisible();

    await expect(
      firstCompanyCard.getByRole('heading', {
        level: 3,
      }),
    ).not.toHaveText('');

    await expect(firstCompanyCard).toContainText(/SIREN\s+\d{9}/);

    await expect(searchPage.resultCount).toHaveText(/^[1-9]\d* résultat\(s\)$/);

    await expect(searchPage.searchState).toBeHidden();
  },
);

test(
  'CT-004 [UI] — rechercher une entreprise par SIREN',
  {
    tag: ['@functional', '@e2e', '@p0', '@smoke'],
    annotation: [
      { type: 'user-story', description: 'US02' },
      { type: 'acceptance-criteria', description: 'US02-CA01' },
      { type: 'feature', description: 'F02' },
    ],
  },
  async ({ searchPage }) => {
    await searchPage.searchFor(companies.laPoste.siren);

    const card = searchPage.companyCard(companies.laPoste.siren);

    await expect(card).toBeVisible();
    await expect(card).toContainText(companies.laPoste.name);
    await expect(card).toContainText(`SIREN ${companies.laPoste.siren}`);

    await expect(searchPage.resultCount).toHaveText('1 résultat(s)');

    await expect(searchPage.searchState).toBeHidden();
  },
);

test(
  'CT-013 — naviguer vers la page suivante puis revenir',
  {
    tag: ['@functional', '@e2e', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US05' },
      { type: 'acceptance-criteria', description: 'US05-CA01' },
      { type: 'feature', description: 'F06' },
    ],
  },
  async ({ searchPage }) => {
    await searchPage.searchFor('Entreprise');
    await searchPage.selectPageSize(10);

    /*
     * La sélection d’une nouvelle taille déclenche une nouvelle
     * requête. On attend les résultats plutôt que l’ancien
     * indicateur de pagination.
     */
    await expect(searchPage.companyCards).toHaveCount(10);
    await expect(searchPage.searchState).toBeHidden();

    await expect(searchPage.pageLabel).toHaveText(/Page 1 \/ \d+/);

    const firstPageSirens = await searchPage.displayedSirens();

    expect(firstPageSirens).toHaveLength(10);

    await searchPage.goToNextPage();

    await expect(searchPage.pageLabel).toHaveText(/Page 2 \/ \d+/);

    await expect(searchPage.companyCards).toHaveCount(10);
    await expect(searchPage.searchState).toBeHidden();

    const secondPageSirens = await searchPage.displayedSirens();

    expect(secondPageSirens).toHaveLength(10);
    expect(secondPageSirens).not.toEqual(firstPageSirens);

    await searchPage.goToPreviousPage();

    await expect(searchPage.pageLabel).toHaveText(/Page 1 \/ \d+/);

    await expect(searchPage.companyCards).toHaveCount(10);
    await expect(searchPage.searchState).toBeHidden();

    await expect
      .poll(() => searchPage.displayedSirens())
      .toEqual(firstPageSirens);
  },
);

test(
  'CT-016 — ouvrir la fiche correspondant au SIREN sélectionné',
  {
    tag: ['@functional', '@e2e', '@p0'],
    annotation: [
      { type: 'user-story', description: 'US06' },
      { type: 'acceptance-criteria', description: 'US06-CA01' },
      { type: 'feature', description: 'F07' },
    ],
  },
  async ({ page, searchPage }) => {
    await searchPage.searchFor(companies.laPoste.siren);
    await searchPage.openCompanyDetails(companies.laPoste.siren);

    const detail = page.locator('#detailRoot');

    await expect(
      detail.getByRole('heading', {
        name: companies.laPoste.name,
        level: 1,
      }),
    ).toBeVisible();

    await expect(
      detail.getByText(`SIREN ${companies.laPoste.siren}`, {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      detail.locator('dd').filter({
        hasText: new RegExp(`^${companies.laPoste.siren}$`),
      }),
    ).toHaveText(companies.laPoste.siren);
  },
);

test(
  'CT-018 — restaurer les résultats après consultation d’une fiche',
  {
    tag: ['@functional', '@e2e', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US06' },
      { type: 'acceptance-criteria', description: 'US06-CA03' },
      { type: 'feature', description: 'F07' },
    ],
  },
  async ({ searchPage, companyDetailsPage }) => {
    await searchPage.searchFor('Entreprise');
    await searchPage.selectPageSize(10);

    await expect(searchPage.companyCards).toHaveCount(10);
    await expect(searchPage.searchState).toBeHidden();

    await searchPage.sortBy('name-asc');
    await searchPage.goToNextPage();

    await expect(searchPage.pageLabel).toHaveText(/Page 2 \/ \d+/);

    await expect(searchPage.companyCards).toHaveCount(10);

    const pageTwoSirens = await searchPage.displayedSirens();

    const selectedSiren = pageTwoSirens[0];

    expect(selectedSiren).toBeDefined();

    await searchPage.openCompanyDetails(selectedSiren);

    await expect(companyDetailsPage.title).toBeVisible();

    await companyDetailsPage.goBackToResults();

    await expect(searchPage.searchInput).toHaveValue('Entreprise');

    await expect(searchPage.resultsPerPageFilter).toHaveValue('10');
    await expect(searchPage.sortSelect).toHaveValue('name-asc');

    await expect(searchPage.pageLabel).toHaveText(/Page 2 \/ \d+/);

    await expect
      .poll(() => searchPage.displayedSirens())
      .toEqual(pageTwoSirens);
  },
);
