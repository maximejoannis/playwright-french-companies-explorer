import { expect, test } from '../../fixtures/test.fixture';

test(
  'CT-024 — comparer trois entreprises',
  {
    tag: ['@functional', '@e2e', '@p1'],
    annotation: [
      {
        type: 'user-story',
        description: 'US09',
      },
      {
        type: 'acceptance-criteria',
        description: 'US09-CA01',
      },
      {
        type: 'feature',
        description: 'F10',
      },
    ],
  },
  async ({ searchPage, comparisonPage }) => {
    await searchPage.goto();
    await searchPage.searchFor('Entreprise');

    await expect(searchPage.companyCards.first()).toBeVisible();

    const displayedSirens = await searchPage.displayedSirens();

    const selectedSirens = displayedSirens.slice(0, 3);

    expect(selectedSirens).toHaveLength(3);

    for (const siren of selectedSirens) {
      await searchPage.compareButton(siren).click();
    }

    await comparisonPage.open();

    await expect(comparisonPage.panels).toHaveCount(3);
    await expect(comparisonPage.table).toBeVisible();

    expect((await comparisonPage.displayedSirens()).sort()).toEqual(
      [...selectedSirens].sort(),
    );

    /*
     * Une colonne Critère et trois colonnes Entreprise.
     */
    await expect(comparisonPage.table.locator('thead th')).toHaveCount(4);

    /*
     * On attend les lignes avant de les récupérer avec all().
     */
    await expect(comparisonPage.rows).toHaveCount(8);

    const rows = await comparisonPage.rows.all();

    for (const row of rows) {
      await expect(row.locator('th, td')).toHaveCount(4);
    }
  },
);
