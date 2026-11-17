// ILLUSTRATIVE coach profiles. Names, roles and photos are placeholders for a demo studio.
// No real credentials or certifications are claimed — replace with real people before launch.

import type { FormatId } from './formats';

export type CoachId = 'ieva' | 'lukas' | 'dovydas';

export interface Coach {
  id: CoachId;
  name: string;
  role: string;
  focus: string[];
  quote: string;
  bio: string;
  formats: FormatId[];
  image: { base: string; widths: number[]; alt: string };
}

export const coaches: Coach[] = [
  {
    id: 'ieva',
    name: 'Ieva K.',
    role: 'Funkcinio judesio trenerė',
    focus: ['Pirmi žingsniai', 'Judesio kokybė', 'Mobilumas'],
    quote: 'Pirmiausia — kaip judi. Tik tada — kiek keli.',
    bio: 'Veda funkcines ir mobilumo treniruotes. Ypač mėgsta dirbti su tais, kurie į salę grįžta po ilgos pertraukos.',
    formats: ['functional', 'mobility'],
    image: { base: 'coach-ieva', widths: [480, 800], alt: 'Trenerė Ieva šypsosi, viena ranka laikydama laipiojimo virvę' },
  },
  {
    id: 'lukas',
    name: 'Lukas R.',
    role: 'Jėgos treniruočių treneris',
    focus: ['Štangos technika', 'Progresijos planas', 'Mažos grupės'],
    quote: 'Stiprybė auga iš nuobodžių, gerai atliktų pakartojimų.',
    bio: 'Atsakingas už jėgos programą: kiekvienas ciklas trunka kelias savaites, kad progresas būtų matomas ir saugus.',
    formats: ['strength', 'functional'],
    image: { base: 'coach-lukas', widths: [480, 800], alt: 'Treneris Lukas baltais marškinėliais be rankovių, portretas tamsiame fone' },
  },
  {
    id: 'dovydas',
    name: 'Dovydas P.',
    role: 'Kondicijos ir HIIT treneris',
    focus: ['Intervalai', 'Ištvermė', 'Tempas grupėje'],
    quote: 'Sunku gali būti smagu, kai žinai, kodėl tai darai.',
    bio: 'Kuria intervalų treniruotes, kuriose kiekvienas randa savo tempą — nuo lengvesnio varianto iki maksimumo.',
    formats: ['hiit', 'functional'],
    image: { base: 'coach-dovydas', widths: [480, 800], alt: 'Treneris Dovydas juodais marškinėliais prie betoninės sienos' },
  },
];

export const coachById = (id: CoachId): Coach => {
  const c = coaches.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown coach: ${id}`);
  return c;
};
