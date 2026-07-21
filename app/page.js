'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [perfil, setPerfil] = useState(null);
  const [educacion, setEducacion] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Perfil
      const { data: perfilData } = await supabase.from('perfiles').select('*').single();
      if (perfilData) setPerfil(perfilData);

      // 2. Educación
      const { data: eduData } = await supabase.from('experiencia_educacion').select('*').order('created_at', { ascending: false });
      if (eduData) setEducacion(eduData);

      // 3. Proyectos
      const { data: proyData } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
      if (proyData) setProyectos(proyData);

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Fira Code', color: '#22d3ee', fontSize: '0.95rem' }}>⚡ Inicializando entorno seguro...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Hero Principal */}
      <header className="hero">
        <div className="badge">
          🛡️ Software Protection & Development
        </div>
        <h1 className="hero-title">
          {perfil?.nombre_completo || 'Antuan David García Lima'}
        </h1>
        <p className="hero-subtitle">
          Protección de Software y Desarrollo Web
        </p>
        <p className="hero-bio">
          {perfil?.extracto || 'Orientado al sector tecnológico con interés en el desarrollo de software, ciberseguridad y análisis de sistemas.'}
        </p>

        {/* Links de Redes Sociales (Instagram + LinkedIn) */}
        <div className="contact-bar">
          <a href="https://www.instagram.com/1adgl2/" target="_blank" rel="noreferrer" className="contact-btn">
            📸 Instagram Profile
          </a>
          {perfil?.linkedin_url && (
            <a href={`https://${perfil.linkedin_url}`} target="_blank" rel="noreferrer" className="contact-btn">
              🔗 LinkedIn Profile
            </a>
          )}
        </div>
      </header>

      {/* Métricas / Highlights */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">Ciberseguridad</div>
          <div className="stat-label">Enfoque Principal</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Santander X</div>
          <div className="stat-label">Certificación Oficial</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">BUAP</div>
          <div className="stat-label">Última Formación Académica</div>
        </div>
      </div>

      {/* Aptitudes Clave */}
      <section>
        <div className="section-header">
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <h2 className="section-title">Aptitudes & Competencias</h2>
        </div>
        <div className="skills-wrapper">
          <span className="skill-badge">🛡️ Principios de Ciberseguridad</span>
          <span className="skill-badge">🔒 Protección de Propiedad Intelectual</span>
          <span className="skill-badge">💡 Pensamiento Crítico & Análisis</span>
          <span className="skill-badge">⚙️ Desarrollo de Software Seguro</span>
          <span className="skill-badge">👥 Trabajo en Equipo & Mentoría</span>
          <span className="skill-badge">📊 Consultoría Tecnológica</span>
        </div>
      </section>

      {/* Educación y Certificaciones */}
      <section>
        <div className="section-header">
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <h2 className="section-title">Educación & Certificaciones</h2>
        </div>
        <div className="cards-grid">
          {educacion.map((item) => (
            <div key={item.id} className="card">
              <div>
                <div className="card-header">
                  <h3 className="card-title">{item.titulo_obtener}</h3>
                  <span className="card-tag">{item.tipo}</span>
                </div>
                <p className="card-institution">{item.institucion}</p>
                <p className="card-desc">{item.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proyectos */}
      <section>
        <div className="section-header">
          <span style={{ fontSize: '1.5rem' }}>💻</span>
          <h2 className="section-title">Proyectos & Investigación</h2>
        </div>

        {proyectos.length === 0 ? (
          <div className="empty-box">
            <p>📂 Los repositorios y documentación de proyectos se están actualizando continuamente.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {proyectos.map((proyecto) => (
              <div key={proyecto.id} className="card">
                <div>
                  {/* Si el proyecto incluye una URL de imagen, la muestra aquí */}
                  {proyecto.imagen_url && (
                    <div className="card-image-wrapper">
                      <img 
                        src={proyecto.imagen_url} 
                        alt={proyecto.titulo} 
                        className="card-image"
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                    </div>
                  )}

                  <div className="card-header">
                    <h3 className="card-title">{proyecto.titulo}</h3>
                    <span className="card-tag">{proyecto.categoria}</span>
                  </div>
                  <p className="card-desc">{proyecto.descripcion}</p>
                </div>
                <div className="card-footer">
                  <div className="tech-tags">
                    {proyecto.tecnologias?.map((tech, idx) => (
                      <span key={idx} className="tech-pill">{tech}</span>
                    ))}
                  </div>
                  {proyecto.github_url && (
                    <a 
                      href={proyecto.github_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: '#22d3ee', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Ver Proyecto →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}