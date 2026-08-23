export const partialCompany = {
  siren: '200000001',
  nom_complet: 'ENTREPRISE PARTIELLE',
  etat_administratif: 'A',
  activite_principale: null,
  libelle_activite_principale: null,
  date_creation: null,
  categorie_entreprise: null,
  nature_juridique: null,
  tranche_effectif_salarie: null,
  siege: {
    siret: '20000000100001',
    etat_administratif: 'A',
    code_postal: '75001',
    libelle_commune: 'PARIS',
    adresse: '1 RUE DU TEST 75001 PARIS',
  },
  matching_etablissements: [],
};

export const companyWithMixedEstablishments = {
  siren: '200000002',
  nom_complet: 'ENTREPRISE MULTI ÉTABLISSEMENTS',
  etat_administratif: 'A',
  activite_principale: '62.01Z',
  libelle_activite_principale: 'Programmation informatique',
  date_creation: '2020-01-01',
  categorie_entreprise: 'PME',
  nature_juridique: '5710',
  tranche_effectif_salarie: '11',
  siege: {
    siret: '20000000200001',
    etat_administratif: 'A',
    code_postal: '75001',
    libelle_commune: 'PARIS',
    adresse: '1 RUE ACTIVE 75001 PARIS',
  },
  matching_etablissements: [
    {
      siret: '20000000200001',
      etat_administratif: 'A',
      adresse: '1 RUE ACTIVE 75001 PARIS',
      libelle_commune: 'PARIS',
    },
    {
      siret: '20000000200002',
      etat_administratif: 'C',
      adresse: '2 RUE FERMÉE 69001 LYON',
      libelle_commune: 'LYON',
    },
    {
      siret: '20000000200003',
      etat_administratif: 'A',
      adresse: '3 RUE ACTIVE 33000 BORDEAUX',
      libelle_commune: 'BORDEAUX',
    },
  ],
};

export const companyWithActiveEstablishmentsOnly = {
  ...companyWithMixedEstablishments,
  siren: '200000003',
  nom_complet: 'ENTREPRISE SANS ÉTABLISSEMENT FERMÉ',
  siege: {
    ...companyWithMixedEstablishments.siege,
    siret: '20000000300001',
  },
  matching_etablissements: [
    {
      siret: '20000000300001',
      etat_administratif: 'A',
      adresse: '1 RUE ACTIVE 75001 PARIS',
      libelle_commune: 'PARIS',
    },
  ],
};
