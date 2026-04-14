import './globals.css';

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
      <body className="bg-cream text-uwdark min-h-screen">
        {children}
      </body>
    </html>
  );
}
