import { expect, type Locator, type Page } from '@playwright/test';

export class FavoritesPage {
  readonly page: Page;
  readonly title: Locator;
  readonly grid: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByRole('heading', {
      name: 'Mes favoris',
      level: 2,
    });

    this.grid = page.locator('#favoritesGrid');

    this.emptyState = this.grid.getByText('Aucun favori pour le moment.', {
      exact: true,
    });
  }

  async open(): Promise<void> {
    await this.page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Favoris',
        exact: true,
      })
      .click();

    await expect(this.title).toBeVisible();
  }

  favoriteCard(siren: string): Locator {
    return this.grid.locator('article.company').filter({
      hasText: `SIREN ${siren}`,
    });
  }

  async removeFavorite(siren: string): Promise<void> {
    await this.favoriteCard(siren).locator('button.fav').click();
  }
}
