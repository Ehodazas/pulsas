// Form delivery adapter.
// • VITE_FORM_ENDPOINT set  → POST JSON to that endpoint (Formspree-compatible).
// • not set                 → honest demo mode: nothing is sent, a prefilled mailto link is offered.

import { studio } from '../data/studio';

export const FORM_ENDPOINT: string = (import.meta.env.VITE_FORM_ENDPOINT ?? '').trim();
export const isDemoMode = (): boolean => FORM_ENDPOINT === '';

export interface InquiryPayload {
  type: 'treniruotė' | 'laukiančiųjų sąrašas' | 'narystė' | 'klausimas';
  subject: string;
  details: string;
  name: string;
  email: string;
  phone?: string;
  comment?: string;
}

export type SubmitResult =
  | { status: 'sent' }
  | { status: 'demo'; mailto: string }
  | { status: 'error'; message: string; mailto: string };

export const buildMailto = (p: InquiryPayload): string => {
  const body = [
    `Užklausa: ${p.type}`,
    p.details,
    '',
    `Vardas: ${p.name}`,
    `El. paštas: ${p.email}`,
    p.phone ? `Telefonas: ${p.phone}` : '',
    p.comment ? `\nKomentaras:\n${p.comment}` : '',
  ]
    .filter((l) => l !== '')
    .join('\n');
  return `mailto:${studio.email}?subject=${encodeURIComponent(p.subject)}&body=${encodeURIComponent(body)}`;
};

export async function submitInquiry(p: InquiryPayload): Promise<SubmitResult> {
  const mailto = buildMailto(p);
  if (isDemoMode()) return { status: 'demo', mailto };

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...p, _subject: p.subject, _replyto: p.email }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { status: 'sent' };
  } catch {
    return {
      status: 'error',
      message: 'Nepavyko išsiųsti užklausos. Patikrinkite ryšį ir bandykite dar kartą arba parašykite el. paštu.',
      mailto,
    };
  }
}
