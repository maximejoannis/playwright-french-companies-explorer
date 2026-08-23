import { test, expect } from '../../fixtures/test.fixture';

test(
  'CT-027 — relancer une recherche depuis l’historique',
  {
    tag: ['@functional', '@e2e', '@p2'],
    annotation: [
      { type: 'user-story', description: 'US10' },
      { type: 'acceptance-criteria', description: 'US10-CA01' },
      { type: 'feature', description: 'F11' },
    ],
  },
  async ({ searchPage, historyPage }) => {
    await searchPage.goto();
    await searchPage.searchFor('La Poste');

    await expect(searchPage.companyCards.first()).toBeVisible();
    await expect(searchPage.searchState).toBeHidden();

    const initialSirens = await searchPage.displayedSirens();

    expect(initialSirens.length).toBeGreaterThan(0);

    await historyPage.open();

    await expect(historyPage.historyEntry('La Poste')).toHaveCount(1);

    await historyPage.relaunchHistory('La Poste');

    await expect(searchPage.searchInput).toHaveValue('La Poste');

    await expect(searchPage.companyCards.first()).toBeVisible();
    await expect(searchPage.searchState).toBeHidden();

    await expect
      .poll(() => searchPage.displayedSirens())
      .toEqual(initialSirens);
  },
);
