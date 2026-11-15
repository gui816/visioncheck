import { useMemo, useState } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff,
  RotateCcw, ShieldCheck, Smartphone, Sun, Target
} from 'lucide-react'

type Screen = 'home' | 'intro' | 'calibration' | 'acuity' | 'astigmatism' | 'results'
type EyeSide = 'right' | 'left'
type Direction = 'right' | 'down' | 'left' | 'up'
type Answer = { eye: EyeSide; level: number; correct: boolean }
type AstigAnswer = { eye: EyeSide; perception: 'same' | 'different' | 'unsure' }

const eyeNames: Record<EyeSide, string> = { right: 'Olho direito', left: 'Olho esquerdo' }
const directions: Direction[] = ['right', 'down', 'left', 'up']
const directionLabels: Record<Direction, string> = { right: 'Direita', down: 'Baixo', left: 'Esquerda', up: 'Cima' }
const levels = [1, 0.8, 0.6, 0.4, 0.2, 0]
const arrowSymbols: Record<Direction, string> = { right: '→', down: '↓', left: '←', up: '↑' }

function makeQuestions(): { direction: Direction; level: number }[] {
  return levels.map((level) => ({
    level,
    direction: directions[Math.floor(Math.random() * directions.length)],
  }))
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [cardWidth, setCardWidth] = useState(320)
  const [calibrated, setCalibrated] = useState(true)
  const [eyeIndex, setEyeIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState(makeQuestions)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [astigAnswers, setAstigAnswers] = useState<AstigAnswer[]>([])
  const [notice, setNotice] = useState('')
  const eyes: EyeSide[] = ['right', 'left']
  const currentEye = eyes[eyeIndex]
  const currentQuestion = questions[questionIndex]
  const pixelsPerMillimetre = cardWidth / 85.6

  const summary = useMemo(() => eyes.map((eye) => {
    const eyeAnswers = answers.filter((answer) => answer.eye === eye)
    return { eye, correct: eyeAnswers.filter((answer) => answer.correct).length, total: eyeAnswers.length }
  }), [answers])

  function startOver() {
    setScreen('home')
    setEyeIndex(0)
    setQuestionIndex(0)
    setAnswers([])
    setAstigAnswers([])
    setQuestions(makeQuestions())
    setNotice('')
  }

  function beginAcuity() {
    setEyeIndex(0)
    setQuestionIndex(0)
    setAnswers([])
    setAstigAnswers([])
    setQuestions(makeQuestions())
    setScreen('acuity')
  }

  function answerAcuity(direction: Direction) {
    if (!currentQuestion) return
    const nextAnswers = [...answers, {
      eye: currentEye,
      level: currentQuestion.level,
      correct: direction === currentQuestion.direction,
    }]
    setAnswers(nextAnswers)
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1)
      return
    }
    if (eyeIndex === 0) {
      setEyeIndex(1)
      setQuestionIndex(0)
      setNotice('Agora vamos observar o outro olho. Tape o olho direito sem pressionar.')
    } else {
      setEyeIndex(0)
      setScreen('astigmatism')
      setNotice('')
    }
  }

  function answerAstigmatism(perception: AstigAnswer['perception']) {
    const next = [...astigAnswers, { eye: currentEye, perception }]
    setAstigAnswers(next)
    if (eyeIndex === 0) {
      setEyeIndex(1)
      setNotice('Repita a observação com o olho esquerdo, mantendo o direito tapado.')
    } else {
      setNotice('')
      setScreen('results')
    }
  }

  const progress = screen === 'acuity'
    ? ((eyeIndex * questions.length + questionIndex) / (questions.length * 2)) * 100
    : screen === 'astigmatism' ? 50 + eyeIndex * 25 : 0

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={startOver} aria-label="VisionCheck início">
          <span className="brand-mark"><Eye size={21} /></span>
          <span>vision<span className="brand-accent">check</span></span>
        </button>
        <span className="beta-label">RASTREIO EDUCATIVO</span>
      </header>

      {screen === 'home' && (
        <section className="hero">
          <div className="eyebrow"><Activity size={15} /> RASTREIO VISUAL PRELIMINAR</div>
          <h1>Cuide da sua visão.<br /><span>Comece por conhecê-la.</span></h1>
          <p className="hero-copy">Uma experiência guiada para explorar alguns aspetos da sua visão e identificar sinais que podem justificar uma avaliação profissional.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setScreen('intro')}>Começar avaliação <ArrowRight size={18} /></button>
            <span className="duration">Experiência guiada · cerca de 5–8 min</span>
          </div>
          <div className="feature-grid">
            <article className="feature-card"><span className="feature-icon"><Eye /></span><h2>Um olho de cada vez</h2><p>Instruções para observar cada olho separadamente, sem o pressionar.</p></article>
            <article className="feature-card"><span className="feature-icon"><Target /></span><h2>Exercícios visuais</h2><p>Reconhecimento de orientações e observação de padrões de linhas.</p></article>
            <article className="feature-card"><span className="feature-icon"><ShieldCheck /></span><h2>Privacidade</h2><p>As respostas ficam apenas nesta sessão e não são enviadas para um servidor.</p></article>
          </div>
          <aside className="notice"><ShieldCheck size={19} /><p><strong>Importante:</strong> o VisionCheck é uma ferramenta educativa de auto-observação, não um dispositivo médico. Não diagnostica miopia, astigmatismo ou outras doenças, não calcula graduação e não substitui uma consulta de optometria ou oftalmologia.</p></aside>
        </section>
      )}

      {screen === 'intro' && (
        <section className="flow-panel">
          <button className="back-link" onClick={() => setScreen('home')}><ArrowLeft size={15} /> Voltar</button>
          <div className="eyebrow">ANTES DE COMEÇAR</div>
          <h1>Vamos preparar a avaliação.</h1>
          <p className="panel-copy">Reserve alguns minutos num local confortável. A experiência não deve provocar desconforto; pode parar em qualquer momento.</p>
          <ul className="check-list">
            <li><CheckCircle2 /> Escolha um local bem iluminado, sem reflexos no ecrã.</li>
            <li><CheckCircle2 /> Limpe o ecrã e mantenha o dispositivo à altura dos olhos.</li>
            <li><CheckCircle2 /> Prepare um cartão bancário ou cartão de dimensão padrão para calibrar o ecrã.</li>
            <li><CheckCircle2 /> Se utiliza óculos habitualmente, faça o teste com a correção que usa no dia a dia.</li>
          </ul>
          <div className="notice"><ShieldCheck size={19} /><p>Se tiver perda súbita de visão, dor ocular intensa, flashes novos ou uma sombra semelhante a uma cortina, não faça o teste: procure assistência médica urgente.</p></div>
          <button className="primary-button" onClick={() => setScreen('calibration')}>Preparar dispositivo <ArrowRight size={18} /></button>
        </section>
      )}

      {screen === 'calibration' && (
        <section className="flow-panel">
          <button className="back-link" onClick={() => setScreen('intro')}><ArrowLeft size={15} /> Voltar</button>
          <div className="eyebrow"><Smartphone size={15} /> PASSO 1 · CALIBRAÇÃO</div>
          <h1>Ajuste a escala do ecrã.</h1>
          <p className="panel-copy">Coloque um cartão bancário real sobre o retângulo. Ajuste o controlo até a largura do retângulo coincidir com a largura do cartão (85,6 mm).</p>
          <div className="calibration-stage">
            <div className="calibration-card" style={{ width: `${cardWidth}px` }}>
              <span>VISA</span><small>85,6 mm · referência</small>
            </div>
            <span className="scale-caption">Ajuste a largura até corresponder ao seu cartão</span>
          </div>
          <label className="range-label" htmlFor="scale">Largura no ecrã <strong>{cardWidth} px</strong></label>
          <input id="scale" className="range-input" type="range" min="220" max="440" value={cardWidth} onChange={(event) => setCardWidth(Number(event.target.value))} />
          <div className="calibration-actions">
            <button className={calibrated ? 'choice-button selected' : 'choice-button'} onClick={() => setCalibrated(true)}><CheckCircle2 size={17} /> Calibrei com um cartão</button>
            <button className={!calibrated ? 'choice-button selected' : 'choice-button'} onClick={() => setCalibrated(false)}>Continuar sem cartão</button>
          </div>
          {!calibrated && <p className="inline-warning">Sem calibração física, o tamanho dos símbolos é apenas aproximado e os resultados não devem ser comparados.</p>}
          <div className="distance-note"><Sun size={18} /><span>Durante os exercícios, mantenha o ecrã a aproximadamente 40 cm dos olhos. Não aproxime o dispositivo para tentar ler melhor.</span></div>
          <button className="primary-button" onClick={beginAcuity}>Iniciar exercícios <ArrowRight size={18} /></button>
        </section>
      )}

      {screen === 'acuity' && currentQuestion && (
        <section className="test-panel">
          <div className="test-topline">
            <span className="eyebrow">PASSO 2 · RECONHECIMENTO DE SÍMBOLOS</span>
            <span className="test-counter">{eyeIndex + 1}/2 · {questionIndex + 1}/{questions.length}</span>
          </div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <h1>{eyeNames[currentEye]}</h1>
          <p className="panel-copy">Tape o outro olho com a mão ou um cartão, sem pressionar. Indique para que lado apontam os traços do símbolo.</p>
          <div className="eye-reminder"><EyeOff size={17} /> {currentEye === 'right' ? 'Mantenha o olho esquerdo tapado.' : 'Mantenha o olho direito tapado.'}</div>
          {notice && <p className="session-note">{notice}</p>}
          <div className="optotype-stage" aria-label="Símbolo E em orientação aleatória">
            <span className="optotype" style={{ fontSize: `${(2.91 * Math.pow(10, currentQuestion.level) * pixelsPerMillimetre)}px`, transform: `rotate(${directions.indexOf(currentQuestion.direction) * 90}deg)` }}>E</span>
          </div>
          <p className="question-prompt">Para que lado apontam os traços?</p>
          <div className="direction-grid">
            {directions.map((direction) => (
              <button key={direction} className="direction-button" onClick={() => answerAcuity(direction)} aria-label={directionLabels[direction]}>
                <span>{arrowSymbols[direction]}</span><small>{directionLabels[direction]}</small>
              </button>
            ))}
          </div>
          <p className="muted-hint">Se não conseguir distinguir, escolha a direção que lhe parece mais provável. Não force a vista.</p>
          <button className="text-button" onClick={() => { setAnswers([...answers, { eye: currentEye, level: currentQuestion.level, correct: false }]); if (questionIndex < questions.length - 1) setQuestionIndex(questionIndex + 1); else if (eyeIndex === 0) { setEyeIndex(1); setQuestionIndex(0); setNotice('Agora tape o olho direito e observe com o esquerdo.'); } else { setEyeIndex(0); setScreen('astigmatism'); setNotice(''); } }}>Não consigo ver o símbolo</button>
        </section>
      )}

      {screen === 'astigmatism' && (
        <section className="test-panel">
          <div className="test-topline"><span className="eyebrow">PASSO 3 · OBSERVAÇÃO DE PADRÕES</span><span className="test-counter">{eyeIndex + 1}/2</span></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <h1>Observe as linhas.</h1>
          <p className="panel-copy">Com {eyeNames[currentEye].toLowerCase()} aberto e o outro tapado, observe o padrão ao centro. Não force a vista nem tente adivinhar.</p>
          {notice && <p className="session-note">{notice}</p>}
          <div className="fan-stage" aria-label="Padrão radial de linhas pretas">
            <div className="fan-disc" />
          </div>
          <p className="question-prompt">As linhas parecem ter todas a mesma nitidez e intensidade?</p>
          <div className="stacked-choices">
            <button className="choice-button" onClick={() => answerAstigmatism('same')}>Sim, parecem semelhantes</button>
            <button className="choice-button" onClick={() => answerAstigmatism('different')}>Não, algumas parecem mais escuras ou nítidas</button>
            <button className="choice-button" onClick={() => answerAstigmatism('unsure')}>Não consigo distinguir</button>
          </div>
          <p className="muted-hint">Este exercício é subjetivo e não confirma nem exclui astigmatismo.</p>
        </section>
      )}

      {screen === 'results' && (
        <section className="flow-panel results-panel">
          <div className="eyebrow"><CheckCircle2 size={15} /> EXERCÍCIOS CONCLUÍDOS</div>
          <h1>A sua sessão está concluída.</h1>
          <p className="panel-copy">Este resumo descreve apenas as respostas dadas nesta sessão. Não representa uma medição clínica da visão.</p>
          <div className="result-grid">
            {summary.map((item) => (
              <article className="result-card" key={item.eye}>
                <span className="result-label">{eyeNames[item.eye]}</span>
                <strong>{item.correct} <small>/ {item.total}</small></strong>
                <span className="result-description">respostas coincidentes com a orientação apresentada</span>
              </article>
            ))}
          </div>
          <h2 className="section-heading">Observação dos padrões</h2>
          <div className="result-observations">
            {astigAnswers.map((item) => (
              <div key={item.eye}><strong>{eyeNames[item.eye]}</strong><span>{item.perception === 'same' ? 'As linhas pareceram semelhantes' : item.perception === 'different' ? 'Notou diferenças entre algumas linhas' : 'Não conseguiu distinguir'}</span></div>
            ))}
          </div>
          <div className="notice"><ShieldCheck size={19} /><p><strong>O que fazer com este resultado?</strong> Se notou diferenças entre os olhos, dificuldade persistente, visão desfocada ou alterações recentes, marque uma avaliação com um optometrista ou oftalmologista. Mesmo sem dificuldades, estes exercícios não substituem rastreios profissionais regulares.</p></div>
          <div className="result-actions">
            <button className="primary-button" onClick={startOver}><RotateCcw size={17} /> Repetir sessão</button>
            <button className="secondary-button" onClick={() => window.print()}>Imprimir resumo</button>
          </div>
          <p className="privacy-note"><Check size={14} /> As respostas não foram guardadas nem enviadas. Ao sair ou atualizar a página, esta sessão perde-se.</p>
        </section>
      )}

      <footer>VisionCheck · Ferramenta educativa de auto-observação · Não é um dispositivo médico</footer>
    </main>
  )
}

export default App
