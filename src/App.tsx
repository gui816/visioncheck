import { useMemo, useState } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff,
  RotateCcw, ShieldCheck, Smartphone, Sun, Target, Printer, Info
} from 'lucide-react'

type Screen = 'home' | 'intro' | 'calibration' | 'acuity' | 'astigmatism' | 'symptoms' | 'results'
type EyeSide = 'right' | 'left'
type Direction = 'right' | 'down' | 'left' | 'up'
type Answer = { eye: EyeSide; level: number; correct: boolean }
type PatternAnswer = { eye: EyeSide; angle: number; perception: 'similar' | 'different' | 'unsure' }
type SymptomChoice = 'clear' | 'sometimes' | 'blurred'
type Symptoms = {
  distanceRight: SymptomChoice
  distanceLeft: SymptomChoice
  nearRight: SymptomChoice
  nearLeft: SymptomChoice
  strain: 'never' | 'sometimes' | 'often'
}

const eyeNames: Record<EyeSide, string> = { right: 'Olho direito', left: 'Olho esquerdo' }
const directions: Direction[] = ['right', 'down', 'left', 'up']
const directionLabels: Record<Direction, string> = { right: 'Direita', down: 'Baixo', left: 'Esquerda', up: 'Cima' }
const levels = [1, 0.8, 0.6, 0.4, 0.2, 0]
const arrowSymbols: Record<Direction, string> = { right: '→', down: '↓', left: '←', up: '↑' }
const patternAngles = [0, 45, 90, 135]
const initialSymptoms: Symptoms = {
  distanceRight: 'clear', distanceLeft: 'clear',
  nearRight: 'clear', nearLeft: 'clear', strain: 'never',
}

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
  const [patternIndex, setPatternIndex] = useState(0)
  const [questions, setQuestions] = useState(makeQuestions)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [patternAnswers, setPatternAnswers] = useState<PatternAnswer[]>([])
  const [symptoms, setSymptoms] = useState<Symptoms>(initialSymptoms)
  const [notice, setNotice] = useState('')
  const eyes: EyeSide[] = ['right', 'left']
  const currentEye = eyes[eyeIndex]
  const currentQuestion = questions[questionIndex]
  const pixelsPerMillimetre = cardWidth / 85.6

  const summary = useMemo(() => eyes.map((eye) => {
    const eyeAnswers = answers.filter((answer) => answer.eye === eye)
    return {
      eye,
      correct: eyeAnswers.filter((answer) => answer.correct).length,
      total: eyeAnswers.length,
      smallestPresented: eyeAnswers.length ? Math.min(...eyeAnswers.map((answer) => answer.level)) : null,
    }
  }), [answers])

  const patternSummary = useMemo(() => eyes.map((eye) => {
    const eyePatterns = patternAnswers.filter((answer) => answer.eye === eye)
    return {
      eye,
      total: eyePatterns.length,
      different: eyePatterns.filter((answer) => answer.perception === 'different').length,
      unsure: eyePatterns.filter((answer) => answer.perception === 'unsure').length,
      angles: eyePatterns.filter((answer) => answer.perception === 'different').map((answer) => answer.angle),
    }
  }), [patternAnswers])

  const symptomLabels: Record<SymptomChoice, string> = {
    clear: 'Sem dificuldade referida',
    sometimes: 'Por vezes desfocada',
    blurred: 'Frequentemente desfocada',
  }

  function startOver() {
    setScreen('home')
    setEyeIndex(0)
    setQuestionIndex(0)
    setPatternIndex(0)
    setAnswers([])
    setPatternAnswers([])
    setQuestions(makeQuestions())
    setSymptoms(initialSymptoms)
    setNotice('')
  }

  function beginAcuity() {
    setEyeIndex(0)
    setQuestionIndex(0)
    setPatternIndex(0)
    setAnswers([])
    setPatternAnswers([])
    setQuestions(makeQuestions())
    setSymptoms(initialSymptoms)
    setScreen('acuity')
  }

  function finishAcuity(nextAnswers: Answer[]) {
    setEyeIndex(0)
    setPatternIndex(0)
    setScreen('astigmatism')
    setNotice('')
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
      finishAcuity(nextAnswers)
    }
  }

  function skipAcuity() {
    if (!currentQuestion) return
    const nextAnswers = [...answers, { eye: currentEye, level: currentQuestion.level, correct: false }]
    setAnswers(nextAnswers)
    if (questionIndex < questions.length - 1) setQuestionIndex(questionIndex + 1)
    else if (eyeIndex === 0) {
      setEyeIndex(1); setQuestionIndex(0)
      setNotice('Agora tape o olho direito e observe com o esquerdo.')
    } else finishAcuity(nextAnswers)
  }

  function answerPattern(perception: PatternAnswer['perception']) {
    const next = [...patternAnswers, { eye: currentEye, angle: patternAngles[patternIndex], perception }]
    setPatternAnswers(next)
    if (patternIndex < patternAngles.length - 1) {
      setPatternIndex(patternIndex + 1)
      return
    }
    if (eyeIndex === 0) {
      setEyeIndex(1)
      setPatternIndex(0)
      setNotice('Repita os quatro padrões com o olho esquerdo. Mantenha o direito tapado.')
    } else {
      setNotice('')
      setScreen('symptoms')
    }
  }

  function updateSymptom(key: keyof Symptoms, value: Symptoms[keyof Symptoms]) {
    setSymptoms((previous) => ({ ...previous, [key]: value }))
  }

  const progress = screen === 'acuity'
    ? ((eyeIndex * questions.length + questionIndex) / (questions.length * 2)) * 48
    : screen === 'astigmatism'
      ? 48 + ((eyeIndex * patternAngles.length + patternIndex) / (patternAngles.length * 2)) * 32
      : screen === 'symptoms' ? 90 : 0

  const farBlur = symptoms.distanceRight !== 'clear' || symptoms.distanceLeft !== 'clear'
  const nearBlur = symptoms.nearRight !== 'clear' || symptoms.nearLeft !== 'clear'
  const hasStrain = symptoms.strain !== 'never'
  const hasPatternDifferences = patternSummary.some((item) => item.different > 0)

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
          <h1>Conheça melhor<br /><span>os sinais da sua visão.</span></h1>
          <p className="hero-copy">Uma experiência guiada, olho a olho, que reúne exercícios de reconhecimento de símbolos, observação de padrões e sintomas visuais para gerar um relatório educativo mais detalhado.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setScreen('intro')}>Começar avaliação <ArrowRight size={18} /></button>
            <span className="duration">Experiência guiada · cerca de 8–10 min</span>
          </div>
          <div className="feature-grid">
            <article className="feature-card"><span className="feature-icon"><Eye /></span><h2>Resultados por olho</h2><p>Respostas e observações separadas para o olho direito e esquerdo.</p></article>
            <article className="feature-card"><span className="feature-icon"><Target /></span><h2>Padrões em 4 eixos</h2><p>Observação subjetiva de linhas horizontais, verticais e oblíquas.</p></article>
            <article className="feature-card"><span className="feature-icon"><Activity /></span><h2>Relatório detalhado</h2><p>Junta respostas, sintomas referidos, calibração e limitações.</p></article>
          </div>
          <aside className="notice"><ShieldCheck size={19} /><p><strong>Importante:</strong> o VisionCheck é uma ferramenta educativa de auto-observação. Não diagnostica miopia ou astigmatismo, não mede graduação (SPH/CYL/AXIS), não determina uma receita de óculos e não substitui uma consulta.</p></aside>
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
              <span>CARTÃO</span><small>85,6 mm · referência</small>
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
          <div className="distance-note"><Sun size={18} /><span>Durante os exercícios, mantenha o ecrã a aproximadamente 40 cm dos olhos. Esta experiência não mede a visão ao longe nem calcula graduação.</span></div>
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
          <p className="muted-hint">Este exercício regista respostas a símbolos num ecrã calibrado. Não equivale a um teste normalizado de acuidade visual.</p>
          <button className="text-button" onClick={skipAcuity}>Não consigo ver o símbolo</button>
        </section>
      )}

      {screen === 'astigmatism' && (
        <section className="test-panel">
          <div className="test-topline"><span className="eyebrow">PASSO 3 · PADRÕES DIRECIONAIS</span><span className="test-counter">{eyeIndex + 1}/2 · {patternIndex + 1}/4</span></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <h1>{eyeNames[currentEye]}</h1>
          <p className="panel-copy">Observe as linhas com {eyeNames[currentEye].toLowerCase()} e o outro olho tapado. Em cada ecrã, as linhas têm uma orientação diferente.</p>
          {notice && <p className="session-note">{notice}</p>}
          <div className="fan-stage" aria-label={`Padrão de linhas a ${patternAngles[patternIndex]} graus`}>
            <div className="parallel-lines" style={{ background: `repeating-linear-gradient(${patternAngles[patternIndex]}deg, #161616 0 2px, transparent 2px 13px)` }} />
          </div>
          <p className="pattern-angle">Padrão {patternIndex + 1} de 4 · orientação {patternAngles[patternIndex]}°</p>
          <p className="question-prompt">As linhas parecem igualmente nítidas?</p>
          <div className="stacked-choices">
            <button className="choice-button" onClick={() => answerPattern('similar')}>Sim, parecem semelhantes</button>
            <button className="choice-button" onClick={() => answerPattern('different')}>Não, algumas parecem mais escuras ou nítidas</button>
            <button className="choice-button" onClick={() => answerPattern('unsure')}>Não consigo distinguir</button>
          </div>
          <p className="muted-hint">A perceção pode variar com o ecrã, iluminação, foco e película. Este exercício não confirma nem exclui astigmatismo.</p>
        </section>
      )}

      {screen === 'symptoms' && (
        <section className="flow-panel">
          <div className="eyebrow"><Activity size={15} /> PASSO 4 · SINTOMAS REFERIDOS</div>
          <h1>Como tem sentido a sua visão?</h1>
          <p className="panel-copy">Responda com base na sua experiência habitual, não apenas no que sentiu durante os exercícios. Estas respostas ajudam a contextualizar o relatório, mas não identificam a causa dos sintomas.</p>
          <div className="symptom-block">
            <h2>Visão ao longe — olho direito</h2>
            <div className="symptom-options">
              <button className={symptoms.distanceRight === 'clear' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('distanceRight', 'clear')}>Nítida</button>
              <button className={symptoms.distanceRight === 'sometimes' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('distanceRight', 'sometimes')}>Por vezes desfocada</button>
              <button className={symptoms.distanceRight === 'blurred' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('distanceRight', 'blurred')}>Frequentemente desfocada</button>
            </div>
          </div>
          <div className="symptom-block">
            <h2>Visão ao longe — olho esquerdo</h2>
            <div className="symptom-options">
              <button className={symptoms.distanceLeft === 'clear' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('distanceLeft', 'clear')}>Nítida</button>
              <button className={symptoms.distanceLeft === 'sometimes' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('distanceLeft', 'sometimes')}>Por vezes desfocada</button>
              <button className={symptoms.distanceLeft === 'blurred' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('distanceLeft', 'blurred')}>Frequentemente desfocada</button>
            </div>
          </div>
          <div className="symptom-block">
            <h2>Visão ao perto — ambos os olhos, individualmente</h2>
            <div className="symptom-options">
              <button className={symptoms.nearRight === 'clear' && symptoms.nearLeft === 'clear' ? 'choice-button selected' : 'choice-button'} onClick={() => { updateSymptom('nearRight', 'clear'); updateSymptom('nearLeft', 'clear') }}>Nítida</button>
              <button className={symptoms.nearRight === 'sometimes' || symptoms.nearLeft === 'sometimes' ? 'choice-button selected' : 'choice-button'} onClick={() => { updateSymptom('nearRight', 'sometimes'); updateSymptom('nearLeft', 'sometimes') }}>Por vezes desfocada</button>
              <button className={symptoms.nearRight === 'blurred' || symptoms.nearLeft === 'blurred' ? 'choice-button selected' : 'choice-button'} onClick={() => { updateSymptom('nearRight', 'blurred'); updateSymptom('nearLeft', 'blurred') }}>Frequentemente desfocada</button>
            </div>
          </div>
          <div className="symptom-block">
            <h2>Cansaço ocular ou dores de cabeça associados a tarefas visuais</h2>
            <div className="symptom-options">
              <button className={symptoms.strain === 'never' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('strain', 'never')}>Nunca</button>
              <button className={symptoms.strain === 'sometimes' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('strain', 'sometimes')}>Às vezes</button>
              <button className={symptoms.strain === 'often' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('strain', 'often')}>Frequentemente</button>
            </div>
          </div>
          <div className="notice"><Info size={19} /><p>Visão desfocada ao longe pode ter várias causas, incluindo miopia ou astigmatismo. Só uma avaliação refrativa pode determinar a graduação.</p></div>
          <button className="primary-button" onClick={() => setScreen('results')}>Ver relatório detalhado <ArrowRight size={18} /></button>
        </section>
      )}

      {screen === 'results' && (
        <section className="flow-panel results-panel">
          <div className="eyebrow"><CheckCircle2 size={15} /> RELATÓRIO DA SESSÃO</div>
          <h1>O seu relatório está pronto.</h1>
          <p className="panel-copy">Resumo das respostas e perceções registadas nesta sessão. Não representa um diagnóstico nem uma medição clínica.</p>
          <div className="report-meta">
            <span>Data: {new Date().toLocaleDateString('pt-PT')}</span>
            <span>Calibração: {calibrated ? 'cartão de 85,6 mm indicado pelo utilizador' : 'não realizada'}</span>
            <span>Distância de observação indicada: aproximadamente 40 cm</span>
          </div>
          <h2 className="section-heading">1. Reconhecimento de símbolos</h2>
          <div className="result-grid">
            {summary.map((item) => (
              <article className="result-card" key={item.eye}>
                <span className="result-label">{eyeNames[item.eye]}</span>
                <strong>{item.correct} <small>{item.correct === 1 ? 'acerto' : 'acertos'}</small></strong>
                <span className="result-description">em {item.total} símbolos apresentados. Menor nível de estímulo apresentado: {item.smallestPresented === null ? '—' : `${Math.round(item.smallestPresented * 100)}%`} do tamanho máximo usado.</span>
              </article>
            ))}
          </div>
          <p className="report-explainer">Estes valores descrevem apenas o desempenho neste exercício específico. Não são uma escala Snellen/logMAR e não permitem estimar miopia ou graduação.</p>

          <h2 className="section-heading">2. Observação de padrões direcionais</h2>
          <div className="result-observations">
            {patternSummary.map((item) => (
              <div key={item.eye}><strong>{eyeNames[item.eye]}</strong><span>{item.different} de 4 orientações com diferenças referidas; {item.unsure} não conclusivas{item.angles.length ? ` · orientações: ${item.angles.join('°, ')}°` : ''}</span></div>
            ))}
          </div>
          <p className="report-explainer">{hasPatternDifferences ? 'Foram referidas diferenças subjetivas entre algumas orientações. Isto pode justificar uma avaliação profissional, mas não confirma astigmatismo.' : 'Não foram assinaladas diferenças entre orientações, ou as respostas foram inconclusivas. Isto não exclui astigmatismo.'}</p>

          <h2 className="section-heading">3. Sintomas visuais referidos</h2>
          <div className="result-observations">
            <div><strong>Visão ao longe · OD</strong><span>{symptomLabels[symptoms.distanceRight]}</span></div>
            <div><strong>Visão ao longe · OE</strong><span>{symptomLabels[symptoms.distanceLeft]}</span></div>
            <div><strong>Visão ao perto · OD</strong><span>{symptomLabels[symptoms.nearRight]}</span></div>
            <div><strong>Visão ao perto · OE</strong><span>{symptomLabels[symptoms.nearLeft]}</span></div>
            <div><strong>Cansaço ocular / dores de cabeça</strong><span>{symptoms.strain === 'never' ? 'Nunca referido' : symptoms.strain === 'sometimes' ? 'Às vezes' : 'Frequentemente'}</span></div>
          </div>
          <h2 className="section-heading">4. Interpretação educativa</h2>
          <div className="interpretation-card">
            {farBlur && <p><strong>Visão ao longe:</strong> referiu episódios de desfocagem. Este sintoma pode estar associado a erros refrativos, incluindo miopia ou astigmatismo, mas também a outras causas.</p>}
            {!farBlur && <p><strong>Visão ao longe:</strong> não referiu desfocagem frequente nas respostas. Isto não exclui um erro refrativo.</p>}
            {nearBlur && <p><strong>Visão ao perto:</strong> referiu episódios de desfocagem. Se persistirem, procure avaliação profissional.</p>}
            {hasPatternDifferences && <p><strong>Padrões:</strong> referiu diferenças de nitidez em algumas orientações. O resultado é subjetivo e não permite identificar ou quantificar astigmatismo.</p>}
            {hasStrain && <p><strong>Conforto visual:</strong> referiu cansaço ocular ou dores de cabeça associados a tarefas visuais.</p>}
            <p><strong>Graduação:</strong> não calculada. O VisionCheck não fornece valores SPH, CYL ou AXIS nesta versão.</p>
          </div>
          <div className="notice"><ShieldCheck size={19} /><p><strong>Próximo passo recomendado:</strong> se tem visão desfocada, diferenças persistentes entre os olhos, dores de cabeça ou alterações recentes, marque uma avaliação com um optometrista ou oftalmologista. Perda súbita de visão, dor intensa, flashes novos ou sombra tipo cortina exigem assistência urgente.</p></div>
          <div className="report-limitations"><strong>Limitações desta sessão</strong><ul><li>Não foi utilizado equipamento refrativo nem um autorrefratómetro.</li><li>A distância de observação e a calibração são indicadas pelo utilizador, não verificadas por sensores.</li><li>O ecrã, iluminação, acomodação, correção ótica e compreensão das instruções influenciam as respostas.</li><li>Não é possível inferir uma receita de óculos ou excluir doenças oculares.</li></ul></div>
          <div className="result-actions">
            <button className="primary-button" onClick={startOver}><RotateCcw size={17} /> Repetir sessão</button>
            <button className="secondary-button" onClick={() => window.print()}><Printer size={17} /> Imprimir relatório</button>
          </div>
          <p className="privacy-note"><Check size={14} /> As respostas não foram guardadas nem enviadas. Ao sair ou atualizar a página, esta sessão perde-se.</p>
        </section>
      )}

      <footer>VisionCheck · Ferramenta educativa de auto-observação · Não é um dispositivo médico</footer>
    </main>
  )
}

export default App
