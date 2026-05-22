import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'CrediKart – Grocery Delivery in Minutes',
  description: 'Hyperlocal grocery delivery with buy-now-pay-later CrediPay credit system.',
};

import CommandPalette from '@/components/layout/CommandPalette';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} font-sans bg-[#0B0C10] text-gray-100 antialiased`}>
        {children}
        <CommandPalette />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#15171F', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
            success: { iconTheme: { primary: '#3BB143', secondary: '#15171F' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#15171F' } },
          }}
        />
      </body>
    </html>
  );
}
