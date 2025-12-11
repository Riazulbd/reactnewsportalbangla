import { Playfair_Display, Inter, UnifrakturMaguntia } from 'next/font/google';

export const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
});

export const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const chomsky = UnifrakturMaguntia({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-chomsky',
    display: 'swap',
});
