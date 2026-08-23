import { expect, type Locator, type Page } from '@playwright/test';

export class HistoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly historyList: Locator;
  readonly savedSearchesList: Locator;
  readonly clearHistoryButton: Locator;
  readonly emptyHistoryState: Locator;
  readonly emptySavedSearchesState: Locator;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole('heading', {
      name: 'Historique de recherche',
      level: 2,
    });

    this.historyList = page.locator('#historyList');
    this.savedSearchesList = page.locator('#savedSearchesList');

    this.clearHistoryButton = page.getByRole('button', {
      name: 'Effacer',
      exact: true,
    });

    this.emptyHistoryState = this.historyList.getByText(
      'Aucune recherche enregistrée.',
      { exact: true },
    );

    this.emptySavedSearchesState = this.savedSearchesList.getByText(
      'Aucune recherche sauvegardée.',
      { exact: true },
    );
  }

  async open(): Promise<void> {
    await this.page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Historique',
        exact: true,
      })
      .click();

    await expect(this.title).toBeVisible();
  }

  historyEntry(query: string): Locator {
    return this.historyList.locator('article').filter({
      hasText: query,
    });
  }

  savedSearchEntry(name: string): Locator {
    return this.savedSearchesList.locator('article').filter({
      has: this.page.getByText(name, {
        exact: true,
      }),
    });
  }

  async relaunchHistory(query: string): Promise<void> {
    await this.historyEntry(query)
      .getByRole('button', {
        name: 'Relancer',
        exact: true,
      })
      .click();
  }

  async launchSavedSearch(name: string): Promise<void> {
    await this.savedSearchEntry(name)
      .getByRole('button', {
        name: 'Lancer',
        exact: true,
      })
      .click();
  }

  async clearHistory(): Promise<void> {
    await this.clearHistoryButton.click();
  }
}
