import { type Locator, type Page } from '@playwright/test';

export class CompanyDetailsPage {
  readonly page: Page;
  readonly root: Locator;
  readonly title: Locator;
  readonly backButton: Locator;
  readonly establishmentList: Locator;
  readonly allEstablishmentsButton: Locator;
  readonly activeEstablishmentsButton: Locator;
  readonly closedEstablishmentsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#detailRoot');

    this.title = this.root.getByRole('heading', {
      level: 1,
    });

    this.backButton = page.getByRole('button', {
      name: 'Retour aux résultats',
    });

    this.establishmentList = this.root.locator('#establishmentList');

    this.allEstablishmentsButton = this.root.getByRole('button', {
      name: 'Tous',
      exact: true,
    });

    this.activeEstablishmentsButton = this.root.getByRole('button', {
      name: 'Actifs',
      exact: true,
    });

    this.closedEstablishmentsButton = this.root.getByRole('button', {
      name: 'Fermés',
      exact: true,
    });
  }

  async goBackToResults(): Promise<void> {
    await this.backButton.click();
  }

  async showAllEstablishments(): Promise<void> {
    await this.allEstablishmentsButton.click();
  }

  async showActiveEstablishments(): Promise<void> {
    await this.activeEstablishmentsButton.click();
  }

  async showClosedEstablishments(): Promise<void> {
    await this.closedEstablishmentsButton.click();
  }
}
