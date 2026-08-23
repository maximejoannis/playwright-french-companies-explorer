import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../../fixtures/test.fixture';

/**
 * Recherche un élément dans l’ordre naturel de tabulation.
 * Aucun focus programmatique n’est utilisé afin de reproduire
 * la navigation réelle d’un utilisateur au clavier.
 */
async function reachElementWithTab(
  page: Page,
  target: Locator,
  maximumTabPresses = 20,
): Promise<void> {
  for (let index = 0; index < maximumTabPresses; index += 1) {
    await page.keyboard.press('Tab');

    const targetIsFocused = await target.evaluate(
      (element) => element === document.activeElement,
    );

    if (targetIsFocused) {
      return;
    }
  }

  throw new Error(
    `Élément inaccessible après ${maximumTabPresses} pressions sur Tab`,
  );
}

test.describe('Accessibilité — recherche', () => {
  test(
    'CT-033 — aucune violation d’accessibilité critique ou sérieuse sur la page de recherche',
    {
      tag: ['@accessibility', '@functional', '@p1'],
      annotation: [
        {
          type: 'requirement',
          description: 'US-ACCESSIBILITY — rendre la recherche accessible',
        },
        {
          type: 'acceptance-criterion',
          description:
            'CA-033 — aucune violation WCAG critique ou sérieuse détectable automatiquement',
        },
        {
          type: 'traceability',
          description: 'CT-033 → US-ACCESSIBILITY → CA-033',
        },
      ],
    },
    async ({ page, searchPage }) => {
      await searchPage.goto();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      await test.info().attach('axe-search-page-results.json', {
        body: JSON.stringify(accessibilityScanResults, null, 2),
        contentType: 'application/json',
      });

      const blockingViolations = accessibilityScanResults.violations.filter(
        (violation) =>
          violation.impact === 'critical' || violation.impact === 'serious',
      );

      const diagnostic = blockingViolations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        elements: violation.nodes.map((node) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
        })),
      }));

      expect(
        blockingViolations,
        `Violations Axe bloquantes :\n${JSON.stringify(diagnostic, null, 2)}`,
      ).toEqual([]);
    },
  );

  test(
    'CT-034 — effectuer une recherche uniquement au clavier',
    {
      tag: ['@accessibility', '@functional', '@keyboard', '@p1'],
      annotation: [
        {
          type: 'requirement',
          description: 'US-ACCESSIBILITY — rendre la recherche accessible',
        },
        {
          type: 'acceptance-criterion',
          description:
            'CA-034 — le formulaire de recherche est utilisable sans souris',
        },
        {
          type: 'traceability',
          description: 'CT-034 → US-ACCESSIBILITY → CA-034',
        },
      ],
    },
    async ({ page, searchPage }) => {
      await searchPage.goto();

      await test.step('Atteindre le champ de recherche avec la touche Tab', async () => {
        const keyboardStart = page.getByRole('banner').getByRole('button', {
          name: /French Companies Explorer/i,
        });

        await keyboardStart.focus();
        await expect(keyboardStart).toBeFocused();

        await reachElementWithTab(page, searchPage.searchInput);

        await expect(searchPage.searchInput).toBeFocused();

        const focusIsVisible = await searchPage.searchInput.evaluate(
          (element) => element.matches(':focus-visible'),
        );

        expect(
          focusIsVisible,
          'Le champ doit présenter un focus visible lors de la navigation au clavier',
        ).toBe(true);
      });

      await test.step('Saisir la recherche et la lancer avec Entrée', async () => {
        await page.keyboard.type('La Poste');
        await expect(searchPage.searchInput).toHaveValue('La Poste');

        await page.keyboard.press('Enter');
      });

      await test.step('Vérifier que les résultats sont accessibles', async () => {
        await expect(searchPage.resultCount).toBeVisible({
          timeout: 15_000,
        });

        await expect(searchPage.companyCards.first()).toBeVisible({
          timeout: 15_000,
        });

        await expect(
          page.getByText('LA POSTE', { exact: true }).first(),
        ).toBeVisible();
      });
    },
  );

  test(
    'CT-035 — les contrôles de recherche possèdent un nom accessible pertinent',
    {
      tag: ['@accessibility', '@functional', '@semantics', '@p1'],
      annotation: [
        {
          type: 'requirement',
          description: 'US-ACCESSIBILITY — rendre la recherche accessible',
        },
        {
          type: 'acceptance-criterion',
          description:
            'CA-035 — chaque contrôle du formulaire possède un nom accessible pertinent',
        },
        {
          type: 'traceability',
          description: 'CT-035 → US-ACCESSIBILITY → CA-035',
        },
      ],
    },
    async ({ page, searchPage }) => {
      await searchPage.goto();

      const postalCodeInput = page.getByRole('textbox', {
        name: /code postal/i,
      });

      const cityInput = page.getByRole('textbox', {
        name: /commune/i,
      });

      const statusSelect = page.getByRole('combobox', {
        name: /état/i,
      });

      const pageSizeSelect = page.getByRole('combobox', {
        name: /résultats\s*\/\s*page/i,
      });

      await test.step('Vérifier les noms accessibles des contrôles principaux', async () => {
        await expect(searchPage.searchInput).toBeVisible();
        await expect(searchPage.searchInput).toHaveAccessibleName(
          /entreprise|recherche/i,
        );

        await expect(searchPage.searchButton).toBeVisible();
        await expect(searchPage.searchButton).toHaveAccessibleName(
          /^rechercher$/i,
        );
      });

      await test.step('Vérifier les noms accessibles des filtres avancés', async () => {
        await expect(postalCodeInput).toBeVisible();
        await expect(postalCodeInput).toHaveAccessibleName(/^code postal$/i);

        await expect(cityInput).toBeVisible();
        await expect(cityInput).toHaveAccessibleName(/^commune$/i);

        await expect(statusSelect).toBeVisible();
        await expect(statusSelect).toHaveAccessibleName(/^état$/i);

        await expect(pageSizeSelect).toBeVisible();
        await expect(pageSizeSelect).toHaveAccessibleName(
          /résultats\s*\/\s*page/i,
        );
      });

      await test.step('Vérifier que les contrôles sont activables', async () => {
        await expect(searchPage.searchInput).toBeEnabled();
        await expect(searchPage.searchButton).toBeEnabled();
        await expect(postalCodeInput).toBeEnabled();
        await expect(cityInput).toBeEnabled();
        await expect(statusSelect).toBeEnabled();
        await expect(pageSizeSelect).toBeEnabled();
      });
    },
  );

  test(
    'CT-036 — la mise à jour du nombre de résultats est annoncée',
    {
      tag: ['@accessibility', '@functional', '@aria-live', '@p1'],
      annotation: [
        {
          type: 'requirement',
          description: 'US-ACCESSIBILITY — rendre la recherche accessible',
        },
        {
          type: 'acceptance-criterion',
          description:
            'CA-036 — le nombre de résultats mis à jour est annoncé aux technologies d’assistance',
        },
        {
          type: 'traceability',
          description: 'CT-036 → US-ACCESSIBILITY → CA-036',
        },
      ],
    },
    async ({ page, searchPage }) => {
      await searchPage.goto();

      const resultsAnnouncement = page.locator('#resultCount');

      await test.step('Vérifier que la zone d’annonce existe avant la recherche', async () => {
        await expect(resultsAnnouncement).toBeAttached();
        await expect(resultsAnnouncement).toContainText(/résultat/i);
      });

      await test.step('Effectuer une recherche qui met à jour le compteur', async () => {
        await searchPage.searchInput.fill('La Poste');
        await searchPage.searchButton.click();

        await expect(searchPage.companyCards.first()).toBeVisible({
          timeout: 15_000,
        });

        await expect(resultsAnnouncement).toHaveText(/^[1-9]\d*\s+résultat/i);
      });

      await test.step('Vérifier que le compteur constitue une région dynamique', async () => {
        const accessibilitySemantics = await resultsAnnouncement.evaluate(
          (element) => ({
            role: element.getAttribute('role'),
            ariaLive: element.getAttribute('aria-live'),
            ariaAtomic: element.getAttribute('aria-atomic'),
            text: element.textContent?.trim(),
          }),
        );

        await test.info().attach('results-announcement-semantics.json', {
          body: JSON.stringify(accessibilitySemantics, null, 2),
          contentType: 'application/json',
        });

        const hasStatusRole = accessibilitySemantics.role === 'status';

        const hasExplicitLiveRegion = ['polite', 'assertive'].includes(
          accessibilitySemantics.ariaLive ?? '',
        );

        expect(
          hasStatusRole || hasExplicitLiveRegion,
          `Le compteur doit avoir role="status" ou aria-live="polite". ` +
            `Valeurs reçues : ${JSON.stringify(accessibilitySemantics)}`,
        ).toBe(true);
      });
    },
  );
});
