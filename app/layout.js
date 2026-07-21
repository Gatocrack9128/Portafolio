import './globals.css';

export const metadata = {
  title: 'Antuan David García Lima | Portafolio',
  description: 'Especialista en Seguridad de IA, Protección de Software y Desarrollo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}