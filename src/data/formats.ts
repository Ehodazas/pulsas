// Training formats. Edit copy, durations and images here — everything else reads from this file.

export type FormatId = 'functional' | 'strength' | 'hiit' | 'mobility';

export interface TrainingFormat {
  id: FormatId;
  name: string; // display name (brand keeps format names in English, like most studios)
  ltName: string;
  lead: string;
  forWho: string;
  inSession: string;
  /** 1–5, used for the intensity meter */
  intensity: number;
  intensityLabel: string;
  duration: number; // minutes
  image: { base: string; widths: number[]; alt: string };
}

export const formats: TrainingFormat[] = [
  {
    id: 'functional',
    name: 'Functional',
    ltName: 'Funkcinė jėga',
    lead: 'Jėga, kuri praverčia ir už salės durų.',
    forWho:
      'Tiems, kas nori kasdien jaustis stipresni: kelti, nešti, pasisukti ir pašokti be įtampos nugaroje.',
    inSession: 'Girios, medicininiai kamuoliai, savo svoris. Darbas stotelėmis ir poromis.',
    intensity: 3,
    intensityLabel: 'Vidutinis',
    duration: 55,
    image: { base: 'fmt-functional', widths: [560, 900], alt: 'Trys sportininkai treniruojasi su medicininiais kamuoliais tamsioje salėje' },
  },
  {
    id: 'strength',
    name: 'Strength',
    ltName: 'Jėgos treniruotė',
    lead: 'Štanga, technika ir aiški progresija.',
    forWho:
      'Pradedantiesiems, kurie nori išmokti taisyklingai kelti, ir pažengusiems, kurie nori matyti progresą savaitė po savaitės.',
    inSession: 'Pritūpimai, traukos, spaudimai. Mažesnė grupė — daugiau trenerio dėmesio.',
    intensity: 3,
    intensityLabel: 'Vidutinis–aukštas',
    duration: 60,
    image: { base: 'fmt-strength', widths: [480, 740], alt: 'Svorių diskai ir jėgos treniruočių stovai studijoje' },
  },
  {
    id: 'hiit',
    name: 'HIIT',
    ltName: 'Intervalinė treniruotė',
    lead: 'Daugiau darbo per mažiau laiko.',
    forWho:
      'Turintiems bazinį fizinį pasirengimą ir norintiems ištvermės, tempo ir gero prakaito po darbo.',
    inSession: 'Trumpi intensyvūs intervalai ir poilsis. Kiekvienas pratimas turi lengvesnį variantą.',
    intensity: 5,
    intensityLabel: 'Aukštas',
    duration: 45,
    image: { base: 'fmt-hiit', widths: [480, 720], alt: 'Sportininkas atlieka mostą su gira intervalinės treniruotės metu' },
  },
  {
    id: 'mobility',
    name: 'Mobility',
    ltName: 'Mobilumas ir atsistatymas',
    lead: 'Lėtesnis tempas. Gilesnis judesys.',
    forWho:
      'Visiems — po sunkios savaitės, ilgų valandų prie stalo ar kaip atsvara jėgos treniruotėms.',
    inSession: 'Sąnarių mobilumas, kontroliuojamas tempimas, kvėpavimas. Kilimėliai ir volai — vietoje.',
    intensity: 1,
    intensityLabel: 'Žemas',
    duration: 50,
    image: { base: 'fmt-mobility', widths: [476], alt: 'Sportininkė atlieka atsispaudimą ant salės grindų' },
  },
];

export const formatById = (id: FormatId): TrainingFormat => {
  const f = formats.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown format: ${id}`);
  return f;
};
