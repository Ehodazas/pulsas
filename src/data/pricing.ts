// DEMO membership prices. Edit amounts and inclusions here — the pricing section and
// registration dialog both read from this file.

export interface Plan {
  id: string;
  name: string;
  price: number; // EUR
  unit: string;
  summary: string;
  includes: string[];
  cta: string;
}

export const pricingNote = 'Kainos pavyzdinės, skirtos demonstracijai.';

export const plans: Plan[] = [
  {
    id: 'single',
    name: 'Vienkartinė treniruotė',
    price: 15,
    unit: 'už treniruotę',
    summary: 'Ateik, išbandyk, nuspręsk vėliau.',
    includes: ['Bet kuri grupinė treniruotė', 'Trumpas pokalbis su treneriu prieš pradžią', 'Be įsipareigojimų'],
    cta: 'Teirautis',
  },
  {
    id: 'pack-8',
    name: '8 treniruočių paketas',
    price: 96,
    unit: 'galioja 6 savaites',
    summary: 'Ritmas dviem treniruotėms per savaitę.',
    includes: ['8 treniruotės bet kuriuo formatu', '12 € už treniruotę', 'Galima pristabdyti ligos atveju*'],
    cta: 'Teirautis',
  },
  {
    id: 'unlimited',
    name: 'Neribota narystė',
    price: 79,
    unit: 'per mėnesį',
    summary: 'Treniruokis tiek, kiek leidžia savaitė.',
    includes: ['Visi formatai be apribojimų', 'Registracija iki 14 dienų į priekį*', 'Pradinė technikos konsultacija'],
    cta: 'Teirautis',
  },
];
