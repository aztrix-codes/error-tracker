import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="app-body">
        <main className="app-main">
          {children}
        </main>
      </body>
    </html>
  );
}