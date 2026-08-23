import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';

import { test, expect } from '../../fixtures/test.fixture';
import { exportCompanies } from '../../test-data/api-responses/export-companies';

const API_PATTERN = 'https://recherche-entreprises.api.gouv.fr/search?**';

type JsonExportRow = {
  siren: string;
  name: string;
  status: string;
  activityLabel: string;
  city: string;
  postalCode: string;
  creation: string;
  siret: string;
};

type CsvExportRow = {
  SIREN: string;
  Nom: string;
  Statut: string;
  Activité: string;
  Ville: string;
  'Code postal': string;
  Création: string;
  'SIRET siège': string;
};

async function readDownload(downloadPath: string | null): Promise<string> {
  expect(downloadPath).not.toBeNull();

  return readFile(downloadPath as string, 'utf8');
}

test.beforeEach(async ({ page, searchPage }) => {
  await page.route(API_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: exportCompanies,
        total_results: exportCompanies.length,
        page: 1,
        per_page: 20,
      }),
    });
  });

  await searchPage.goto();
  await searchPage.searchFor('Export');

  await expect(searchPage.companyCards).toHaveCount(exportCompanies.length);

  await expect(searchPage.searchState).toBeHidden();
});

test(
  'CT-030 — exporter et parser les résultats JSON et CSV',
  {
    tag: ['@functional', '@mocked', '@p2'],
    annotation: [
      { type: 'user-story', description: 'US11' },
      { type: 'acceptance-criteria', description: 'US11-CA01' },
      { type: 'feature', description: 'F13' },
    ],
  },
  async ({ searchPage }) => {
    const jsonDownload = await searchPage.exportJson();

    expect(jsonDownload.suggestedFilename()).toBe('companies-results.json');

    const jsonContent = await readDownload(await jsonDownload.path());

    const jsonRows = JSON.parse(jsonContent) as JsonExportRow[];

    expect(jsonRows).toHaveLength(exportCompanies.length);

    expect(jsonRows[0]).toMatchObject({
      siren: exportCompanies[0].siren,
      name: exportCompanies[0].nom_complet,
      status: 'A',
    });

    const csvDownload = await searchPage.exportCsv();

    expect(csvDownload.suggestedFilename()).toBe('companies-results.csv');

    const csvContent = await readDownload(await csvDownload.path());

    const csvRows = parse(csvContent, {
      bom: true,
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
    }) as CsvExportRow[];

    expect(csvRows).toHaveLength(exportCompanies.length);

    expect(csvRows[0]).toMatchObject({
      SIREN: exportCompanies[0].siren,
      Nom: exportCompanies[0].nom_complet,
      Statut: 'A',
    });
  },
);

test(
  'CT-031 — préserver les caractères spéciaux dans les exports',
  {
    tag: ['@functional', '@mocked', '@p2', '@boundary'],
    annotation: [
      { type: 'user-story', description: 'US11' },
      { type: 'acceptance-criteria', description: 'US11-CA02' },
      { type: 'feature', description: 'F13' },
    ],
  },
  async ({ searchPage }) => {
    const csvDownload = await searchPage.exportCsv();

    const csvContent = await readDownload(await csvDownload.path());

    const csvRows = parse(csvContent, {
      bom: true,
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
    }) as CsvExportRow[];

    expect(csvRows[0].Nom).toBe('SOCIÉTÉ ÉTÉ, FRANCE');

    expect(csvRows[0].Activité).toBe('Conseil, développement et "qualité"');

    expect(csvRows[0].Ville).toBe('PARIS');

    expect(csvContent).toContain('"Conseil, développement et ""qualité"""');
  },
);

test(
  'CT-032 — neutraliser les formules dans l’export CSV',
  {
    tag: ['@functional', '@mocked', '@security', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US11' },
      { type: 'acceptance-criteria', description: 'US11-CA03' },
      { type: 'feature', description: 'F13' },
      {
        type: 'defect',
        description: 'BUG-CSV-001',
      },
    ],
  },
  async ({ searchPage }) => {
    const csvDownload = await searchPage.exportCsv();

    const csvContent = await readDownload(await csvDownload.path());

    const csvRows = parse(csvContent, {
      bom: true,
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
    }) as CsvExportRow[];

    const dangerousRow = csvRows[1];

    expect(dangerousRow.Nom).toBe(`'=HYPERLINK("https://example.test")`);

    expect(dangerousRow.Activité).toBe("'+SUM(A1:A2)");

    expect(dangerousRow.Ville).toBe("'@LYON");

    const exportedCells = Object.values(dangerousRow);

    for (const cell of exportedCells) {
      expect(cell).not.toMatch(/^\s*[=+\-@]/);
    }
  },
);
