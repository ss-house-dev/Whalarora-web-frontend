import localFont from 'next/font/local';

export const anuphan = localFont({
  variable: '--font-anuphan',
  display: 'swap',
  src: [
    {
      path: '../../public/fonts/anuphan/Anuphan-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/anuphan/Anuphan-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/anuphan/Anuphan-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/anuphan/Anuphan-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
});

