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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} font-sans bg-white text-gray-900 antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '12px' },
            success: { iconTheme: { primary: '#3BB143', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
