'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('proyectos'); // 'proyectos' o 'educacion'
  
  // Listas
  const [proyectos, setProyectos] = useState([]);
  const [educacion, setEducacion] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Form Proyectos
  const [proyId, setProyId] = useState(null);
  const [tituloProy, setTituloProy] = useState('');
  const [categoriaProy, setCategoriaProy] = useState('Ciberseguridad');
  const [descProy, setDescProy] = useState('');
  const [imgProy, setImgProy] = useState('');
  const [techProy, setTechProy] = useState('');
  const [githubProy, setGithubProy] = useState('');

  // Form Educación/Cursos
  const [eduId, setEduId] = useState(null);
  const [institucion, setInstitucion] = useState('');
  const [tituloEdu, setTituloEdu] = useState('');
  const [tipoEdu, setTipoEdu] = useState('Curso');
  const [descEdu, setDescEdu] = useState('');

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else {
        setSession(session);
        cargarDatos();
      }
    });
  }, [router]);

  const cargarDatos = async () => {
    const { data: pData } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
    if (pData) setProyectos(pData);

    const { data: eData } = await supabase.from('experiencia_educacion').select('*').order('created_at', { ascending: false });
    if (eData) setEducacion(eData);
  };

  // --- MÉTODOS DE PROYECTOS ---
  const guardarProyecto = async (e) => {
    e.preventDefault();
    setMensaje('');
    const slug = tituloProy.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const techArray = techProy.split(',').map((t) => t.trim());

    if (proyId) {
      // Editar
      const { error } = await supabase.from('proyectos').update({
        titulo: tituloProy, slug, categoria: categoriaProy, descripcion: descProy, imagen_url: imgProy, tecnologias: techArray, github_url: githubProy
      }).eq('id', proyId);
      if (!error) setMensaje('✅ Proyecto actualizado');
    } else {
      // Crear
      const { error } = await supabase.from('proyectos').insert([{
        usuario_id: session.user.id, titulo: tituloProy, slug, categoria: categoriaProy, descripcion: descProy, imagen_url: imgProy, tecnologias: techArray, github_url: githubProy
      }]);
      if (!error) setMensaje('🚀 Proyecto creado');
    }
    limpiarProy();
    cargarDatos();
  };

  const eliminarProyecto = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este proyecto?')) {
      await supabase.from('proyectos').delete().eq('id', id);
      cargarDatos();
    }
  };

  const cargarProyectoEdicion = (p) => {
    setProyId(p.id);
    setTituloProy(p.titulo);
    setCategoriaProy(p.categoria);
    setDescProy(p.descripcion);
    setImgProy(p.imagen_url || '');
    setTechProy(p.tecnologias ? p.tecnologias.join(', ') : '');
    setGithubProy(p.github_url || '');
  };

  const limpiarProy = () => {
    setProyId(null); setTituloProy(''); setDescProy(''); setImgProy(''); setTechProy(''); setGithubProy('');
  };

  // --- MÉTODOS DE EDUCACIÓN / CURSOS ---
  const guardarEducacion = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (eduId) {
      // Editar
      const { error } = await supabase.from('experiencia_educacion').update({
        institucion, titulo_obtener: tituloEdu, tipo: tipoEdu, descripcion: descEdu
      }).eq('id', eduId);
      if (!error) setMensaje('✅ Curso/Educación actualizado');
    } else {
      // Crear
      const { error } = await supabase.from('experiencia_educacion').insert([{
        usuario_id: session.user.id, institucion, titulo_obtener: tituloEdu, tipo: tipoEdu, descripcion: descEdu
      }]);
      if (!error) setMensaje('🚀 Curso/Educación registrado');
    }
    limpiarEdu();
    cargarDatos();
  };

  const eliminarEducacion = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este registro de educación?')) {
      await supabase.from('experiencia_educacion').delete().eq('id', id);
      cargarDatos();
    }
  };

  const cargarEduEdicion = (eItem) => {
    setEduId(eItem.id);
    setInstitucion(eItem.institucion);
    setTituloEdu(eItem.titulo_obtener);
    setTipoEdu(eItem.tipo);
    setDescEdu(eItem.descripcion);
  };

  const limpiarEdu = () => {
    setEduId(null); setInstitucion(''); setTituloEdu(''); setDescEdu('');
  };

  if (!session) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Admin */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>Panel de Administración</h1>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>

        {/* Botones de Navegación Pestañas */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button 
            onClick={() => { setTab('proyectos'); setMensaje(''); }} 
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: tab === 'proyectos' ? '#0284c7' : '#111827', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
          >
            💻 Gestionar Proyectos ({proyectos.length})
          </button>
          <button 
            onClick={() => { setTab('educacion'); setMensaje(''); }} 
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: tab === 'educacion' ? '#0284c7' : '#111827', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🎓 Gestionar Cursos & Educacion ({educacion.length})
          </button>
        </div>

        {mensaje && <p style={{ background: '#064e3b', color: '#6ee7b7', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{mensaje}</p>}

        {/* PESTAÑA PROYECTOS */}
        {tab === 'proyectos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Formulario */}
            <form onSubmit={guardarProyecto} style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3>{proyId ? '✏️ Editar Proyecto' : '➕ Agregar Proyecto'}</h3>
              
              <input type="text" placeholder="Título" value={tituloProy} onChange={(e) => setTituloProy(e.target.value)} required style={inputStyle} />
              <input type="text" placeholder="Categoría" value={categoriaProy} onChange={(e) => setCategoriaProy(e.target.value)} required style={inputStyle} />
              <input type="url" placeholder="URL de la Imagen" value={imgProy} onChange={(e) => setImgProy(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Tecnologías (Python, React)" value={techProy} onChange={(e) => setTechProy(e.target.value)} style={inputStyle} />
              <textarea placeholder="Descripción" rows="3" value={descProy} onChange={(e) => setDescProy(e.target.value)} required style={inputStyle}></textarea>
              <input type="url" placeholder="Link GitHub" value={githubProy} onChange={(e) => setGithubProy(e.target.value)} style={inputStyle} />

              <button type="submit" style={btnStyle}>{proyId ? 'Actualizar' : 'Guardar'}</button>
              {proyId && <button type="button" onClick={limpiarProy} style={btnCancelStyle}>Cancelar Edición</button>}
            </form>

            {/* Lista Existente */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3>Lista de Proyectos</h3>
              {proyectos.map((p) => (
                <div key={p.id} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{p.titulo}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{p.categoria}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => cargarProyectoEdicion(p)} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => eliminarProyecto(p.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA EDUCACIÓN */}
        {tab === 'educacion' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Formulario */}
            <form onSubmit={guardarEducacion} style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3>{eduId ? '✏️ Editar Curso' : '➕ Agregar Curso/Educación'}</h3>
              
              <input type="text" placeholder="Institución (ej. Santander X, BUAP)" value={institucion} onChange={(e) => setInstitucion(e.target.value)} required style={inputStyle} />
              <input type="text" placeholder="Título obtenido o Nombre del Curso" value={tituloEdu} onChange={(e) => setTituloEdu(e.target.value)} required style={inputStyle} />
              <select value={tipoEdu} onChange={(e) => setTipoEdu(e.target.value)} style={inputStyle}>
                <option value="Curso">Curso</option>
                <option value="Certificacion">Certificación</option>
                <option value="Educacion">Educación Académica</option>
              </select>
              <textarea placeholder="Descripción del aprendizaje" rows="3" value={descEdu} onChange={(e) => setDescEdu(e.target.value)} required style={inputStyle}></textarea>

              <button type="submit" style={btnStyle}>{eduId ? 'Actualizar' : 'Guardar'}</button>
              {eduId && <button type="button" onClick={limpiarEdu} style={btnCancelStyle}>Cancelar Edición</button>}
            </form>

            {/* Lista Existente */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3>Lista de Cursos y Educación</h3>
              {educacion.map((item) => (
                <div key={item.id} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{item.titulo_obtener}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{item.institucion} ({item.tipo})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => cargarEduEdicion(item)} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => eliminarEducacion(item.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' };
const btnStyle = { background: '#0284c7', color: '#fff', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' };
const btnCancelStyle = { background: '#4b5563', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' };