import { Archivo, Geist, Inter, Instrument_Serif, Manrope } from 'next/font/google';

/** Each family is only downloaded by browsers on pages that actually use it. */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  axes: ['opsz'],
  display: 'swap',
});

const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', axes: ['wdth'], display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap', preload: false });
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap', preload: false });
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
  preload: false,
});

export const fontVariables = [inter, archivo, manrope, geist, instrument].map((font) => font.variable).join(' ');
