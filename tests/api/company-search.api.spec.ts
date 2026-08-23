import { test, expect } from '@playwright/test';
import { companies } from '../../test-data/companies';

const API_URL = 'https://recherche-entreprises.api.gouv.fr/search';

type Establishment = {
  siret?: string;
};

type CompanyResult = {
  siren?: string;
  nom_complet?: string;
  siege?: Establishment;
  matching_etablissements?: Establishment[];
  etablissements?: Establishment[];
};

type SearchResponse = {
  total_results?: number;
  results?: CompanyResult[];
};

test(
  'CT-004 [API] — rechercher une entreprise par SIREN',
  {
    tag: ['@functional', '@api', '@p0', '@smoke'],
    annotation: [
      { type: 'user-story', description: 'US02' },
      { type: 'acceptance-criteria', description: 'US02-CA01' },
      { type: 'feature', description: 'F02' },
    ],
  },
  async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        q: companies.laPoste.siren,
        page: '1',
        per_page: '1',
      },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as SearchResponse;

    expect(body.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          siren: companies.laPoste.siren,
        }),
      ]),
    );
  },
);

test(
  'CT-005 — rechercher une entreprise par SIRET',
  {
    tag: ['@functional', '@api', '@p1'],
    annotation: [
      { type: 'user-story', description: 'US02' },
      { type: 'acceptance-criteria', description: 'US02-CA02' },
      { type: 'feature', description: 'F02' },
    ],
  },
  async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        q: companies.laPoste.siret,
        page: '1',
        per_page: '10',
      },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as SearchResponse;

    expect(body.results).toBeDefined();
    expect(body.results?.length).toBeGreaterThan(0);

    const company = body.results?.find(
      (result) => result.siren === companies.laPoste.siren,
    );

    expect(company).toBeDefined();

    const returnedSirets = [
      company?.siege?.siret,
      ...(company?.matching_etablissements ?? []).map(
        (establishment) => establishment.siret,
      ),
      ...(company?.etablissements ?? []).map(
        (establishment) => establishment.siret,
      ),
    ].filter((siret): siret is string => Boolean(siret));

    expect(returnedSirets).toContain(companies.laPoste.siret);
  },
);
