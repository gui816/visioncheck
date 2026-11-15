import { useState } from 'react'
import { Activity, ArrowRight, CheckCircle2, Eye, ShieldCheck } from 'lucide-react'

type Screen = 'home' | 'intro'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setScreen('home')} aria-label="VisionCheck início">
          <span className="brand-mark"><Eye size={21} /></span>
          <span>vision<span className="brand-accent">check</span></span>
        </a>
        <span className="beta-label">PRÉ-VERSÃO</span>
      </header>
      {screen === 'home' ? (
        <section className="hero">
          <div className="eyebrow"><Activity size={15} /> RASTREIO VISUAL PRELIMINAR</div>
          <h1>Cuide da sua visão.<br /><span>Comece por conhecê-la.</span></h1>
          <p className="hero-copy">Uma experiência guiada para explorar a sua acuidade visual e identificar sinais que podem justificar uma avaliação profissional.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setScreen('intro')}>Começar avaliação <ArrowRight size={18} /></button>
            <span className="duration">Experiência demonstrativa · cerca de 5–8 min</span>
          </div>
          <div className="feature-grid">
            <article className="feature-card"><span className="feature-icon"><Eye /></span><h2>Um olho de cada vez</h2><p>Experiência organizada para avaliar cada olho separadamente.</p></article>
            <article className="feature-card"><span className="feature-icon"><Activity /></span><h2>Testes guiados</h2><p>Instruções claras e progressivas, adaptadas ao ecrã.</p></article>
            <article className="feature-card"><span className="feature-icon"><ShieldCheck /></span><h2>Privacidade em primeiro lugar</h2><p>O protótipo não recolhe nem envia dados pessoais.</p></article>
          </div>
          <aside className="notice"><ShieldCheck size={19} /><p><strong>Importante:</strong> o VisionCheck é um protótipo de rastreio educativo. Não diagnostica doenças, não mede a graduação e não substitui uma consulta de optometria ou oftalmologia.</p></aside>
        </section>
      ) : (
        <section className="intro-panel">
          <button className="back-link" onClick={() => setScreen('home')}>← Voltar</button>
          <div className="eyebrow">ANTES DE COMEÇAR</div>
          <h1>Vamos preparar a avaliação.</h1>
          <p>Esta primeira versão é apenas uma demonstração de navegação. Ainda não executa testes clínicos nem produz resultados de visão.</p>
          <ul className="check-list">
            <li><CheckCircle2 /> Escolha um local bem iluminado.</li>
            <li><CheckCircle2 /> Utilize o ecrã sem reflexos e mantenha uma postura confortável.</li>
            <li><CheckCircle2 /> Se usa óculos ou lentes, siga as instruções de cada teste quando estiverem disponíveis.</li>
          </ul>
          <div className="notice"><ShieldCheck size={19} /><p>Se tiver perda súbita de visão, dor ocular intensa, flashes ou uma sombra semelhante a uma cortina, não faça este teste: procure assistência médica urgente.</p></div>
          <button className="primary-button" disabled>Testes em desenvolvimento <ArrowRight size={18} /></button>
        </section>
      )}
      <footer>VisionCheck · Protótipo inicial · Informação não clínica</footer>
    </main>
  )
}
