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
  image: { src: string; width: number; height: number; alt: string };
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
    image: { src: 'coach-1-360.webp', width: 360, height: 640, alt: 'Trenerė Ieva su medicininiu kamuoliu' },
  },
  {
    id: 'lukas',
    name: 'Lukas R.',
    role: 'Jėgos treniruočių treneris',
    focus: ['Štangos technika', 'Progresijos planas', 'Mažos grupės'],
    quote: 'Stiprybė auga iš nuobodžių, gerai atliktų pakartojimų.',
    bio: 'Atsakingas už jėgos programą: kiekvienas ciklas trunka kelias savaites, kad progresas būtų matomas ir saugus.',
    formats: ['strength', 'functional'],
    image: { src: 'coach-2-320.webp', width: 320, height: 570, alt: 'Treneris Lukas laiko medicininį kamuolį' },
  },
  {
    id: 'dovydas',
    name: 'Dovydas P.',
    role: 'Kondicijos ir HIIT treneris',
    focus: ['Intervalai', 'Ištvermė', 'Tempas grupėje'],
    quote: 'Sunku gali būti smagu, kai žinai, kodėl tai darai.',
    bio: 'Kuria intervalų treniruotes, kuriose kiekvienas randa savo tempą — nuo lengvesnio varianto iki maksimumo.',
    formats: ['hiit', 'functional'],
    image: { src: 'coach-3-460.webp', width: 460, height: 818, alt: 'Treneris Dovydas atlieka mostą su gira' },
  },
];

export const coachById = (id: CoachId): Coach => {
  const c = coaches.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown coach: ${id}`);
  return c;
};
