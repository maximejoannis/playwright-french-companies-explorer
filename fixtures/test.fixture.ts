import { test as base } from '@playwright/test';
import * as allure from 'allure-js-commons';

import { ComparisonPage } from '../pages/comparison.page';
import { CompanyDetailsPage } from '../pages/company-details.page';
import { FavoritesPage } from '../pages/favorites.page';
import { HistoryPage } from '../pages/history.page';
import { SearchPage } from '../pages/search.page';

type AppFixtures = {
  searchPage: SearchPage;
  companyDetailsPage: CompanyDetailsPage;
  favoritesPage: FavoritesPage;
  comparisonPage: ComparisonPage;
  historyPage: HistoryPage;

  /**
   * Fixture automatique chargée avant chaque test.
   * Elle transforme les informations Playwright existantes
   * en métadonnées Allure sans modifier les scénarios.
   */
  allureMetadata: void;
};

const TEST_TYPE_TAGS = [
  '@api',
  '@e2e',
  '@mocked',
  '@accessibility',
  '@visual',
  '@functional',
  '@smoke',
  '@regression',
  '@negative',
  '@keyboard',
  '@semantics',
  '@aria-live',
] as const;

export const test = base.extend<AppFixtures>({
  allureMetadata: [
    async ({ browserName }, use, testInfo) => {
      const testCaseId = testInfo.title.match(/\bCT-\d{3}\b/i)?.[0];

      if (testCaseId) {
        await allure.label('testCaseId', testCaseId.toUpperCase());
      }

      await allure.label('playwrightProject', testInfo.project.name);

      /*
       * Le projet API n’utilise pas réellement de navigateur.
       * On évite donc de lui ajouter un label trompeur.
       */
      if (testInfo.project.name !== 'api') {
        await allure.label('browserName', browserName);
      }

      const priorityTag = testInfo.tags.find((tag) => /^@p[0-3]$/i.test(tag));

      if (priorityTag) {
        await allure.label('priority', priorityTag.slice(1).toUpperCase());
      }

      for (const tag of TEST_TYPE_TAGS) {
        if (testInfo.tags.includes(tag)) {
          await allure.label('testType', tag.slice(1));
        }
      }

      for (const annotation of testInfo.annotations) {
        const description = annotation.description?.trim();

        if (!description) {
          continue;
        }

        switch (annotation.type) {
          case 'user-story':
            await allure.story(description);
            break;

          case 'feature':
            await allure.feature(description);
            break;

          case 'requirement':
            await allure.label('requirement', description);
            break;

          case 'acceptance-criteria':
          case 'acceptance-criterion':
            await allure.label('acceptanceCriteria', description);
            break;

          case 'traceability':
            await allure.label('traceability', description);
            break;

          case 'defect':
            await allure.label('defect', description);
            break;

          default:
            await allure.label(`annotation.${annotation.type}`, description);
            break;
        }
      }

      await use();
    },
    {
      auto: true,
    },
  ],

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
