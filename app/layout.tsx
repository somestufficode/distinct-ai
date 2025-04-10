import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ChatProvider } from './context/ChatContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Distinction - Construction Management',
  description: 'Construction project management and scheduling application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
