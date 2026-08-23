import type { MockCompany } from './companies';

export const sortCompanies: MockCompany[] = [
  {
    siren: '100000003',
    nom_complet: 'ZETA',
    etat_administratif: 'C',
    date_creation: '2020-01-01',
    siege: {
      siret: '10000000300003',
      etat_administratif: 'C',
      code_postal: '75003',
      libelle_commune: 'PARIS',
    },
  },
  {
    siren: '100000001',
    nom_complet: 'ALPHA',
    etat_administratif: 'A',
    date_creation: '2023-01-01',
    siege: {
      siret: '10000000100001',
      etat_administratif: 'A',
      code_postal: '75001',
      libelle_commune: 'PARIS',
    },
  },
  {
    siren: '100000002',
    nom_complet: 'BETA',
    etat_administratif: 'A',
    date_creation: '2021-01-01',
    siege: {
      siret: '10000000200002',
      etat_administratif: 'A',
      code_postal: '75002',
      libelle_commune: 'PARIS',
    },
  },
  {
    siren: '100000004',
    nom_complet: 'DUPONT',
    etat_administratif: 'A',
    date_creation: null as unknown as string,
    siege: {
      siret: '10000000400004',
      etat_administratif: 'A',
      code_postal: '69001',
      libelle_commune: 'LYON',
    },
  },
  {
    siren: '100000005',
    nom_complet: 'DUPONT',
    etat_administratif: 'C',
    date_creation: null as unknown as string,
    siege: {
      siret: '10000000500005',
      etat_administratif: 'C',
      code_postal: '33000',
      libelle_commune: 'BORDEAUX',
    },
  },
];
