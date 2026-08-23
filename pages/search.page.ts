import {
  expect,
  type Download,
  type Locator,
  type Page,
} from '@playwright/test';

type SortMode =
  | 'relevance'
  | 'name-asc'
  | 'name-desc'
  | 'creation-newest'
  | 'creation-oldest'
  | 'status';

type CompanyStatus = 'A' | 'C' | '';

type PageSize = 10 | 20 | 25;

export class SearchPage {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly resultCount: Locator;
  readonly searchState: Locator;

  readonly statusFilter: Locator;
  readonly resultsPerPageFilter: Locator;
  readonly sortSelect: Locator;

  readonly companyCards: Locator;

  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly pageLabel: Locator;
  readonly pagination: Locator;
  readonly saveSearchButton: Locator;
  readonly exportJsonButton: Locator;
  readonly exportCsvButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchInput = page.getByTestId('query-input');

    this.searchButton = page.getByRole('button', {
      name: 'Rechercher',
      exact: true,
    });

    this.exportJsonButton = page.getByRole('button', {
      name: 'Exporter JSON',
      exact: true,
    });

    this.exportCsvButton = page.getByRole('button', {
      name: 'Exporter CSV',
      exact: true,
    });

    this.resultCount = page.locator('#resultCount');
    this.searchState = page.locator('#searchState');

    this.statusFilter = page.getByRole('combobox', {
      name: 'État',
      exact: true,
    });

    this.resultsPerPageFilter = page.getByRole('combobox', {
      name: 'Résultats / page',
      exact: true,
    });

    this.sortSelect = page.getByRole('combobox', {
      name: 'Trier par',
      exact: true,
    });

    this.companyCards = page.locator('[data-testid^="company-card-"]');

    this.nextPageButton = page.getByRole('button', {
      name: 'Suivant',
    });

    this.previousPageButton = page.getByRole('button', {
      name: 'Précédent',
    });

    this.pageLabel = page.locator('#pageLabel');
    this.pagination = page.locator('#pagination');

    this.saveSearchButton = page.getByRole('button', {
      name: 'Sauvegarder la recherche',
      exact: true,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('./');

    await expect(this.page).toHaveURL(/\/french-companies-explorer-qa\/$/);

    const searchNavigationButton = this.page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Recherche',
        exact: true,
      });

    const searchHeading = this.page.getByRole('heading', {
      name: 'Trouver une entreprise',
      level: 2,
    });

    /*
     * Le bouton de navigation est présent dans toutes les vues.
     * On attend que app.js lui ait associé son gestionnaire.
     */
    await this.page.waitForFunction(() => {
      const button = document.querySelector<HTMLElement>(
        'nav [data-route="search"]',
      );

      return typeof button?.onclick === 'function';
    });

    await expect(async () => {
      await searchNavigationButton.click();

      await expect(searchHeading).toBeVisible({
        timeout: 2_000,
      });
    }).toPass({
      timeout: 15_000,
    });

    const advancedFilters = this.page.getByText('Filtres avancés', {
      exact: true,
    });

    await advancedFilters.click();

    await expect(this.statusFilter).toBeVisible();
    await expect(this.resultsPerPageFilter).toBeVisible();
  }

  favoriteButton(siren: string): Locator {
    return this.companyCard(siren).locator('button.fav');
  }

  compareButton(siren: string): Locator {
    return this.companyCard(siren).getByRole('button', {
      name: 'Comparer',
      exact: true,
    });
  }

  async openFromNavigation(): Promise<void> {
    await this.page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Recherche',
        exact: true,
      })
      .click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Trouver une entreprise',
        level: 2,
      }),
    ).toBeVisible();
  }

  async searchFor(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async saveCurrentSearch(name: string): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept(name);
    });

    await this.saveSearchButton.click();
  }

  async filterByStatus(status: CompanyStatus): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.searchButton.click();
  }

  async selectPageSize(size: PageSize): Promise<void> {
    await this.resultsPerPageFilter.selectOption(String(size));

    await this.searchButton.click();
  }

  async sortBy(mode: SortMode): Promise<void> {
    await this.sortSelect.selectOption(mode);
  }

  companyCard(siren: string): Locator {
    return this.page.getByTestId(`company-card-${siren}`);
  }

  async openCompanyDetails(siren: string): Promise<void> {
    await this.companyCard(siren)
      .getByRole('button', {
        name: 'Voir la fiche',
        exact: true,
      })
      .click();
  }

  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
  }

  async goToPreviousPage(): Promise<void> {
    await this.previousPageButton.click();
  }

  async displayedCompanyNames(): Promise<string[]> {
    return this.companyCards
      .getByRole('heading', {
        level: 3,
      })
      .allTextContents();
  }

  async displayedSirens(): Promise<string[]> {
    const cardContents = await this.companyCards.allTextContents();

    return cardContents
      .map((content) => {
        return content.match(/SIREN\s+(\d{9})/)?.[1];
      })
      .filter((siren): siren is string => Boolean(siren));
  }

  async exportJson(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');

    await this.exportJsonButton.click();

    return downloadPromise;
  }

  async exportCsv(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');

    await this.exportCsvButton.click();

    return downloadPromise;
  }
}
