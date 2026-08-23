export type CompanyStatus = 'A' | 'C';

export type MockCompany = {
  siren: string;
  nom_complet: string;
  etat_administratif: CompanyStatus;
  date_creation: string;
  siege: {
    siret: string;
    etat_administratif: CompanyStatus;
    code_postal: string;
    libelle_commune: string;
  };
};

function createCompany(index: number, status: CompanyStatus): MockCompany {
  const siren = String(100_000_000 + index);
  const establishmentNumber = String(index).padStart(5, '0');

  return {
    siren,
    nom_complet: `ENTREPRISE ${String(index).padStart(2, '0')}`,
    etat_administratif: status,
    date_creation: '2020-01-01',
    siege: {
      siret: `${siren}${establishmentNumber}`,
      etat_administratif: status,
      code_postal: '75001',
      libelle_commune: 'PARIS',
    },
  };
}

export const mixedCompanies: MockCompany[] = Array.from(
  { length: 30 },
  (_, index) => {
    const companyNumber = index + 1;

    return createCompany(companyNumber, companyNumber <= 5 ? 'A' : 'C');
  },
);
