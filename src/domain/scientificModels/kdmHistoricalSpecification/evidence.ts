import type { ReconstructionEvidenceSource } from './contracts';

export const KDM_HISTORICAL_EVIDENCE = [
  {
    id: 'levine_2013_primary',
    title: 'Modeling the rate of senescence: can estimated biological age predict mortality more accurately than chronological age?',
    authority: 'primary_publication',
    year: 2013,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3660119/',
    doi: '10.1093/gerona/gls233',
    scope: 'Primary cohort, panel, sex-stratification, missingness, method description, and mortality validation.',
  },
  {
    id: 'klemera_doubal_2006_primary',
    title: 'A new approach to the concept and computation of biological age',
    authority: 'original_method_publication',
    year: 2006,
    url: 'https://pubmed.ncbi.nlm.nih.gov/16318865/',
    doi: '10.1016/j.mad.2005.10.004',
    scope: 'Original KDM construct and statistical assumptions; not a Levine NHANES III calibration artifact.',
  },
  {
    id: 'nhanes_iii_data_files',
    title: 'NHANES III (1988–1994) Data Files',
    authority: 'official_nhanes_documentation',
    year: 2026,
    url: 'https://wwwn.cdc.gov/nchs/nhanes/nhanes3/datafiles.aspx',
    doi: null,
    scope: 'Official public file inventory, release boundaries, and surplus-sera datasets.',
  },
  {
    id: 'nhanes_iii_laboratory_codebook',
    title: 'NHANES III Laboratory Data File Documentation',
    authority: 'official_nhanes_documentation',
    year: 1997,
    url: 'https://wwwn.cdc.gov/nchs/data/nhanes3/1a/lab-acc.pdf',
    doi: null,
    scope: 'Laboratory variables, units, archive ranges, flags, method notes, and creatinine/cholesterol guidance.',
  },
  {
    id: 'nhanes_iii_examination_codebook',
    title: 'NHANES III Examination Data File Documentation',
    authority: 'official_nhanes_documentation',
    year: 1997,
    url: 'https://wwwn.cdc.gov/nchs/data/nhanes3/1a/exam-acc.pdf',
    doi: null,
    scope: 'Demographic, blood-pressure, spirometry, quality, and equipment variables.',
  },
  {
    id: 'nhanes_iii_laboratory_manual',
    title: 'Laboratory Procedures Used for NHANES III',
    authority: 'official_procedure_manual',
    year: 1996,
    url: 'https://wwwn.cdc.gov/nchs/data/nhanes3/manuals/labman.pdf',
    doi: null,
    scope: 'Historical specimens, assays, instruments, calibration, quality control, and limitations.',
  },
  {
    id: 'nhanes_iii_spirometry_manual',
    title: 'NHANES III Spirometry Procedure Manual',
    authority: 'official_procedure_manual',
    year: 1988,
    url: 'https://wwwn.cdc.gov/nchs/data/nhanes3/manuals/spiro.pdf',
    doi: null,
    scope: 'Spirometry acquisition, equipment, screening, acceptability, and quality control.',
  },
  {
    id: 'nhanes_iii_blood_pressure_manual',
    title: 'NHANES III Pulse and Blood Pressure Procedures Manual',
    authority: 'official_procedure_manual',
    year: 1988,
    url: 'https://wwwn.cdc.gov/nchs/data/nhanes3/manuals/pressure.pdf',
    doi: null,
    scope: 'Historical blood-pressure acquisition and measurement context.',
  },
  {
    id: 'nhanes_iii_cmv_status',
    title: 'NHANES III Cytomegalovirus IgG and IgM Antibodies—Serum',
    authority: 'official_nhanes_documentation',
    year: 2005,
    url: 'https://wwwn.cdc.gov/nchs/data/nhanes3/19a/CMV.htm',
    doi: null,
    scope: 'Public categorical CMV status for participants age six and older; no continuous IgG optical density.',
  },
  {
    id: 'nhanes_iii_cmv_optical_density',
    title: 'NHANES III Surplus Sera Optical Density to Cytomegalovirus',
    authority: 'official_nhanes_documentation',
    year: 2006,
    url: 'https://wwwn.cdc.gov/nchs/data/nhanes3/21a/spscmvod.pdf',
    doi: null,
    scope: 'Public continuous CMV optical-density variables restricted to women ages 12–49.',
  },
  {
    id: 'kwon_belsky_bioage_2021',
    title: 'A toolkit for quantification of biological age from blood chemistry and organ function test data: BioAge',
    authority: 'peer_reviewed_replication',
    year: 2021,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8602613/',
    doi: '10.1007/s11357-021-00480-5',
    scope: 'Later peer-reviewed reconstruction framework and Levine Original panel confirmation; not evidence of undisclosed 2013 preprocessing.',
  },
] as const satisfies readonly ReconstructionEvidenceSource[];

export type KdmHistoricalEvidenceId = typeof KDM_HISTORICAL_EVIDENCE[number]['id'];

export function getKdmHistoricalEvidence(id: string): ReconstructionEvidenceSource | undefined {
  return KDM_HISTORICAL_EVIDENCE.find(source => source.id === id);
}
