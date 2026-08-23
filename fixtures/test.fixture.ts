import { test as base } from '@playwright/test';
import { SearchPage } from '../pages/search.page';
import { CompanyDetailsPage } from '../pages/company-details.page';
import { FavoritesPage } from '../pages/favorites.page';
import { ComparisonPage } from '../pages/comparison.page';
import { HistoryPage } from '../pages/history.page';

type AppFixtures = {
  searchPage: SearchPage;
  companyDetailsPage: CompanyDetailsPage;
  favoritesPage: FavoritesPage;
  comparisonPage: ComparisonPage;
  historyPage: HistoryPage;
};

export const test = base.extend<AppFixtures>({
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },

  companyDetailsPage: async ({ page }, use) => {
    await use(new CompanyDetailsPage(page));
  },

  favoritesPage: async ({ page }, use) => {
    await use(new FavoritesPage(page));
  },

  comparisonPage: async ({ page }, use) => {
    await use(new ComparisonPage(page));
  },

  historyPage: async ({ page }, use) => {
    await use(new HistoryPage(page));
  },
});

export { expect } from '@playwright/test';
