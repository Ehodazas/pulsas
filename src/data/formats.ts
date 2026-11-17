// Training formats. Edit copy, durations and images here — everything else reads from this file.

export type FormatId = 'functional' | 'strength' | 'hiit' | 'mobility';

/**
 * ILLUSTRATIVE session rhythm for the "Ritmo skalė". It describes how a class is structured
 * (work blocks vs. calmer parts), not a measured heart rate. Each beat is [height 0–1, gap after it].
 * A gap of 0 means the next beat follows immediately; larger gaps read as rest / transitions.
 */
export interface Rhythm {
  beats: [height: number, gap: number][];
  tempo: string;
  structure: string;
  beginners: string;
}

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
  rhythm: Rhythm;
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
    inSession:
      '10 min. apšilimas, 35 min. darbo stotelėmis (hanteliai, girios, savo svoris), 10 min. tempimas. Kiekvienas pratimas turi lengvesnį variantą.',
    intensity: 3,
    intensityLabel: 'Vidutinis',
    duration: 55,
    rhythm: {
      beats: [[0.3, 1], [0.35, 1], [0.6, 0], [0.62, 1.4], [0.6, 0], [0.66, 1.4], [0.62, 0], [0.64, 1.4], [0.6, 0], [0.66, 1.4], [0.3, 1], [0.22, 0]],
      tempo: 'Tolygus, vidutinis',
      structure: 'Stotelės ratu, trumpi perėjimai',
      beginners: 'Tinka — su lengvesniais variantais',
    },
    image: { base: 'fmt-functional', widths: [560, 960], alt: 'Grupė atlieka įtūpstus su hanteliais ant kilimėlių plytų sienų salėje' },
  },
  {
    id: 'strength',
    name: 'Strength',
    ltName: 'Jėgos treniruotė',
    lead: 'Štanga, technika ir aiški progresija.',
    forWho:
      'Pradedantiesiems, kurie nori išmokti taisyklingai kelti, ir pažengusiems, kurie nori matyti progresą savaitė po savaitės.',
    inSession:
      'Apšilimas ir technikos dalis, tada 3–4 pagrindinio pratimo serijos su poilsiu tarp jų. Pritūpimai, traukos, spaudimai — iki 10 žmonių grupėje.',
    intensity: 3,
    intensityLabel: 'Vidutinis–aukštas',
    duration: 60,
    rhythm: {
      beats: [[0.3, 1], [0.34, 1.6], [0.72, 0], [0.78, 0], [0.74, 2.6], [0.76, 0], [0.82, 0], [0.78, 2.6], [0.8, 0], [0.86, 0], [0.82, 2.2], [0.24, 0]],
      tempo: 'Kontroliuotas, be skubėjimo',
      structure: 'Darbo serijos ir ilgesnis poilsis',
      beginners: 'Tinka — technika mokoma nuo nulio',
    },
    image: { base: 'fmt-strength', widths: [560, 960], alt: 'Sportininkė su štanga ant pečių prieš pritūpimą, vaizdas iš nugaros' },
  },
  {
    id: 'hiit',
    name: 'HIIT',
    ltName: 'Intervalinė treniruotė',
    lead: 'Daugiau darbo per mažiau laiko.',
    forWho:
      'Turintiems bazinį fizinį pasirengimą ir norintiems ištvermės, tempo ir gero prakaito po darbo.',
    inSession:
      'Trumpi intensyvūs darbo intervalai ir trumpas poilsis — šokdynė, irklavimo treniruoklis, girios. Kiekvienas pats renkasi tempą.',
    intensity: 5,
    intensityLabel: 'Aukštas',
    duration: 45,
    rhythm: {
      beats: [[0.36, 0.8], [0.5, 0.6], [0.9, 0], [0.96, 0.5], [0.92, 0], [1, 0.5], [0.94, 0], [0.98, 0.5], [0.96, 0], [1, 0.5], [0.92, 0], [0.98, 0.9], [0.3, 0]],
      tempo: 'Greitas, su trumpais atokvėpiais',
      structure: 'Trumpi intervalai, trumpas poilsis',
      beginners: 'Geriau po kelių kitų treniruočių',
    },
    image: { base: 'fmt-hiit', widths: [560, 960], alt: 'Sportininkė šokinėja per šokdynę šviesioje salėje prie didelių langų' },
  },
  {
    id: 'mobility',
    name: 'Mobility',
    ltName: 'Mobilumas ir atsistatymas',
    lead: 'Lėtesnis tempas. Gilesnis judesys.',
    forWho:
      'Visiems — po sunkios savaitės, ilgų valandų prie stalo ar kaip atsvara jėgos treniruotėms.',
    inSession:
      'Sąnarių mobilumas, kontroliuojamas tempimas ir kvėpavimas. Treneris padeda pajusti padėtis rankomis, jei nori. Kilimėliai ir volai — vietoje.',
    intensity: 1,
    intensityLabel: 'Žemas',
    duration: 50,
    rhythm: {
      beats: [[0.22, 1.8], [0.26, 1.8], [0.24, 1.8], [0.28, 1.8], [0.24, 1.8], [0.26, 1.8], [0.2, 0]],
      tempo: 'Lėtas, ramus',
      structure: 'Nepertraukiamas, be šuolių',
      beginners: 'Tinka nuo pirmos dienos',
    },
    image: { base: 'fmt-mobility', widths: [560, 960], alt: 'Treneris padeda gulinčiam sportininkui ištempti koją ant kilimėlio' },
  },
];

export const formatById = (id: FormatId): TrainingFormat => {
  const f = formats.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown format: ${id}`);
  return f;
};
