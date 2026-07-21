'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [error, setError] = useState('');
  const router = useRouter();

  // Revisar si el dispositivo está bloqueado al cargar
  useEffect(() => {
    const lockoutTime = localStorage.getItem('login_lockout');
    if (lockoutTime) {
      const tiempoDesbloqueo = parseInt(lockoutTime, 10);
      if (Date.now() < tiempoDesbloqueo) {
        setBloqueadoHasta(tiempoDesbloqueo);
      } else {
        localStorage.removeItem('login_lockout');
        localStorage.removeItem('login_intentos');
      }
    }

    const intentosGuardados = localStorage.getItem('login_intentos');
    if (intentosGuardados) {
      setIntentos(parseInt(intentosGuardados, 10));
    }
  }, []);

  // Contador regresivo cuando está bloqueado
  useEffect(() => {
    let timer;
    if (bloqueadoHasta) {
      timer = setInterval(() => {
        const restante = Math.ceil((bloqueadoHasta - Date.now()) / 1000);
        if (restante <= 0) {
          setBloqueadoHasta(null);
          setIntentos(0);
          localStorage.removeItem('login_lockout');
          localStorage.removeItem('login_intentos');
          clearInterval(timer);
        } else {
          setTiempoRestante(restante);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bloqueadoHasta]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (bloqueadoHasta) return;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const nuevosIntentos = intentos + 1;
      setIntentos(nuevosIntentos);
      localStorage.setItem('login_intentos', nuevosIntentos.toString());

      if (nuevosIntentos >= 3) {
        const tiempoBloqueo = Date.now() + 5 * 60 * 1000; // 5 minutos en milisegundos
        setBloqueadoHasta(tiempoBloqueo);
        localStorage.setItem('login_lockout', tiempoBloqueo.toString());
        setError('🚨 Demasiados intentos fallidos. Dispositivo bloqueado por 5 minutos.');
      } else {
        setError(`Contraseña incorrecta. Intentos restantes: ${3 - nuevosIntentos}`);
      }
    } else {
      localStorage.removeItem('login_intentos');
      localStorage.removeItem('login_lockout');
      router.push('/admin');
    }
  };

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px', background: '#111827', border: '1px solid #1f2937', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Acceso Administrativo</h1>

        {bloqueadoHasta ? (
          <div style={{ background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '16px', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔒 Dispositivo bloqueado temporalmente</p>
            <p>Vuelve a intentarlo en:</p>
            <p style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#f87171', marginTop: '6px' }}>
              {minutos}:{segundos < 10 ? `0${segundos}` : segundos} min
            </p>
          </div>
        ) : (
          <>
            {error && <p style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>{error}</p>}
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Correo</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }} />
            </div>

            <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
              Ingresar
            </button>
          </>
        )}
      </form>
    </div>
  );
}