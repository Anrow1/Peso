import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/useAuth';
import TopBar from '@/components/TopBar';
import SubNav from '@/components/SubNav';
import Toast from '@/components/Toast';

export const metadata: Metadata = {
  title: 'PESO Connect — Public Employment Service Office',
  description: 'Find verified job openings from registered employers in your area. No fees, no middlemen — reviewed by your local Public Employment Service Office.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TopBar />
          <SubNav />
          <main className="wrap">{children}</main>
          <Toast />
        </AuthProvider>
      </body>
    </html>
  );
}
