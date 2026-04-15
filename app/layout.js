import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'HelloNeighbour — UW-Madison',
  description: 'Voice-based anonymous neighbor connection app for UW-Madison dorm students',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen text-white">
        <div className="bg-mesh">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
        </div>
        <div className="noise-overlay" />
        <div className="relative z-10 min-h-screen">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </body>
    </html>
  );
}
