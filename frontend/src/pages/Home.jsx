import { Link } from 'react-router-dom';
import '../styles/tailwind.css';

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
function Navbar() {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between" style={{ height: '64px' }}>

        <a href="#inicio" className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" style={{ width: 38, height: 38, borderRadius: 8 }} />
          <div style={{ lineHeight: 1.2 }}>
            <span style={{ display: 'block', fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500 }}>
              Clínica de Rehabilitación
            </span>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#728156' }}>
              Barreras
            </span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {[['#inicio','Inicio'],['#nosotros','Nosotros'],['#servicios','Servicios']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, textDecoration: 'none' }}
               onMouseOver={e => e.target.style.color='#728156'} onMouseOut={e => e.target.style.color='#6b7280'}>
              {label}
            </a>
          ))}
        </div>

        <Link to="/login" style={{
          background: '#728156', color: '#fff', fontSize: 13, fontWeight: 700,
          padding: '8px 18px', borderRadius: 8, textDecoration: 'none',
          textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          Acceso Admin
        </Link>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section
      id="inicio"
      style={{
        position: 'relative',
        minHeight: '90vh',
        backgroundImage: "url('/hero-rehab.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Overlay — gradiente lateral: más oscuro izquierda (texto), más claro derecha (imagen visible) */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(42,48,32,0.82) 40%, rgba(42,48,32,0.30) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <span style={{
          display: 'inline-block', marginBottom: 18, fontSize: 11, fontWeight: 600,
          color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.18em'
        }}>
          Clínica de Rehabilitación Motriz
        </span>

        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 20px' }}>
          Rompiendo<br />
          <span style={{ color: '#B6C99C' }}>Barreras</span><br />
          juntos.
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, maxWidth: 440, marginBottom: 32 }}>
          Atendemos personas con discapacidad motriz ofreciendo terapia física,
          programas de movilidad y apoyo integral para mejorar su independencia.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <a href="#servicios" style={{
            padding: '12px 28px', background: '#728156', color: '#fff', fontWeight: 700,
            fontSize: 13, borderRadius: 8, textDecoration: 'none', textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Ver servicios
          </a>
          <a href="#nosotros" style={{
            padding: '12px 28px', border: '2px solid rgba(255,255,255,0.45)', color: '#fff',
            fontWeight: 700, fontSize: 13, borderRadius: 8, textDecoration: 'none',
            textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            Quiénes somos
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ABOUT
═══════════════════════════════════════════════════════════ */
function About() {
  return (
    <section id="nosotros" style={{ background: '#fff', padding: '80px 0' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Imagen */}
          <img
            src="/equipo.jpg"
            alt="Equipo de la clínica"
            style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', display: 'block' }}
          />

          {/* Texto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#728156', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              Quiénes somos
            </p>

            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2, margin: 0 }}>
              Comprometidos con la movilidad{' '}
              <span style={{ color: '#728156' }}>y la inclusión.</span>
            </h2>

            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, margin: 0 }}>
              Nuestra misión es apoyar a personas con discapacidad motriz mediante programas
              clínicos y comunitarios que fomenten la autonomía y la calidad de vida.
            </p>

            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, margin: 0 }}>
              Contamos con un equipo multidisciplinario altamente especializado en fisioterapia,
              hidroterapia y asesoría de ayudas técnicas.
            </p>

            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', listStyle: 'none', padding: 0, margin: 0 }}>
              {['Atención personalizada', 'Equipo especializado', 'Enfoque integral', 'Inclusión activa'].map(v => (
                <li key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#728156', flexShrink: 0 }} />
                  {v}
                </li>
              ))}
            </ul>

            <div>
              <a href="#servicios" style={{
                display: 'inline-block', padding: '11px 24px', background: '#728156', color: '#fff',
                fontWeight: 700, fontSize: 13, borderRadius: 8, textDecoration: 'none',
                textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                Ver servicios →
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SERVICES
═══════════════════════════════════════════════════════════ */
const SERVICES = [
  { img: '/foto_pw2.jpg',        title: 'Fisioterapia',    desc: 'Planes terapéuticos personalizados para recuperar movilidad y fuerza muscular.' },
  { img: '/hidroterapia-2.jpg',  title: 'Hidroterapia',    desc: 'Terapia acuática para reducir el dolor, mejorar coordinación y fortalecer músculos.' },
  { img: '/ayudas-tecnicas.jpg', title: 'Ayudas Técnicas', desc: 'Asesoría y adaptación de dispositivos de apoyo para aumentar la autonomía del paciente.' },
];

function ServiceCard({ img, title, desc }) {
  return (
    <article style={{
      background: '#fff', borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0',
      transition: 'transform 0.25s, box-shadow 0.25s'
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(114,129,86,0.15)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      <div style={{ height: 200, overflow: 'hidden' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '20px 22px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 900, color: '#1a1a1a', margin: '0 0 8px' }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, margin: '0 0 16px' }}>{desc}</p>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#728156' }}>Saber más →</span>
      </div>
    </article>
  );
}

function Services() {
  return (
    <section id="servicios" style={{ background: '#E8F4DC', padding: '80px 0' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#728156', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 12 }}>
            Programas clínicos
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#1a1a1a', margin: 0 }}>
            Terapia y soporte <span style={{ color: '#728156' }}>personalizado</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(s => <ServiceCard key={s.title} {...s} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CTA
═══════════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section style={{
      position: 'relative', padding: '96px 0',
      backgroundImage: "url('/fondo.jpg')", backgroundSize: 'cover', backgroundPosition: 'center'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(42,48,32,0.80)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 16 }}>
          Panel administrativo
        </p>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
          Acceso al{' '}<span style={{ color: '#B6C99C' }}>Sistema</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
          Gestiona pacientes, medicamentos, videos y suscripciones desde el panel administrativo.
        </p>
        <Link to="/login" style={{
          display: 'inline-block', padding: '14px 36px', background: '#728156', color: '#fff',
          fontWeight: 800, fontSize: 14, borderRadius: 10, textDecoration: 'none',
          textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 6px 20px rgba(114,129,86,0.4)'
        }}>
          Ingresar ahora →
        </Link>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ background: '#2a3020', color: '#fff', padding: '40px 0' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40, borderRadius: 8, opacity: 0.85 }} />
          <div>
            <p style={{ fontWeight: 900, color: '#B6C99C', fontSize: 14, margin: 0 }}>Discapacidad sin Barreras</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', margin: '2px 0 0' }}>UTEQ · LITIID007 · Equipo 07</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {[['#inicio','Inicio'],['#nosotros','Nosotros'],['#servicios','Servicios']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
               onMouseOver={e => e.target.style.color='#B6C99C'} onMouseOut={e => e.target.style.color='rgba(255,255,255,0.5)'}>
              {label}
            </a>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          © {new Date().getFullYear()} Clínica de Rehabilitación Motriz
        </p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <CTA />
      <Footer />
    </div>
  );
}
