import { expect, type Locator, type Page } from '@playwright/test';

export class ComparisonPage {
  readonly page: Page;
  readonly root: Locator;
  readonly title: Locator;
  readonly panels: Locator;
  readonly table: Locator;
  readonly rows: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#compareRoot');

    this.title = page.getByRole('heading', {
      name: 'Comparer jusqu’à trois entreprises',
      level: 2,
    });

    this.panels = this.root.locator('.compare-panel').filter({
      has: page.getByRole('button', {
        name: 'Retirer',
        exact: true,
      }),
    });

    this.table = this.root.locator('.compare-table');
    this.rows = this.table.locator('tbody tr');
    this.toast = page.locator('#toast');
  }

  async open(): Promise<void> {
    await this.page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Comparer',
        exact: true,
      })
      .click();

    await expect(this.title).toBeVisible();
  }

  panel(siren: string): Locator {
    return this.panels.filter({
      hasText: `SIREN ${siren}`,
    });
  }

  async displayedSirens(): Promise<string[]> {
    const contents = await this.panels.allTextContents();

    return contents
      .map((content) => content.match(/SIREN\s+(\d{9})/)?.[1])
      .filter((siren): siren is string => Boolean(siren));
  }
}
