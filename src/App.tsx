import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff,
  RotateCcw, ShieldCheck, Smartphone, Sun, Target, Printer, Info
} from 'lucide-react'

type Screen = 'home' | 'intro' | 'calibration' | 'acuity' | 'astigmatism' | 'symptoms' | 'results'
type EyeSide = 'right' | 'left'
type Direction = 'right' | 'down' | 'left' | 'up'
type Answer = { eye: EyeSide; level: number; correct: boolean; skipped: boolean }
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
const repetitionsPerLevel = 5
const arrowSymbols: Record<Direction, string> = { right: '→', down: '↓', left: '←', up: '↑' }
const patternAngles = [0, 45, 90, 135]
const initialSymptoms: Symptoms = {
  distanceRight: 'clear', distanceLeft: 'clear',
  nearRight: 'clear', nearLeft: 'clear', strain: 'never',
}

function makeQuestions(): { direction: Direction; level: number }[] {
  const questions = levels.flatMap((level) => Array.from({ length: repetitionsPerLevel }, () => ({
    level,
    direction: directions[Math.floor(Math.random() * directions.length)],
  })))
  for (let index = questions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[questions[index], questions[swapIndex]] = [questions[swapIndex], questions[index]]
  }
  return questions
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [cardWidth, setCardWidth] = useState(320)
  const [calibrated, setCalibrated] = useState(false)
  const [distanceConfirmed, setDistanceConfirmed] = useState(false)
  const [brightnessConfirmed, setBrightnessConfirmed] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraUsed, setCameraUsed] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [positionConfirmed, setPositionConfirmed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
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
  const pixelsPerMillimetre = cardWidth / 53.98

  const summary = useMemo(() => eyes.map((eye) => {
    const eyeAnswers = answers.filter((answer) => answer.eye === eye)
    return {
      eye,
      correct: eyeAnswers.filter((answer) => answer.correct).length,
      total: eyeAnswers.length,
      levelBreakdown: levels.map((level) => {
        const levelAnswers = eyeAnswers.filter((answer) => answer.level === level)
        return {
          level,
          total: levelAnswers.length,
          correct: levelAnswers.filter((answer) => answer.correct).length,
          skipped: levelAnswers.filter((answer) => answer.skipped).length,
        }
      }),
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

  useEffect(() => {
    if (cameraEnabled && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current
    }
  }, [cameraEnabled])

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  async function enableCamera() {
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Este navegador não disponibiliza acesso à câmara. Pode continuar sem esta ajuda.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      cameraStreamRef.current = stream
      setCameraUsed(true)
      setCameraEnabled(true)
      setPositionConfirmed(false)
    } catch {
      setCameraError('Não foi possível aceder à câmara. Verifique a permissão do navegador ou continue sem esta ajuda.')
    }
  }

  function disableCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
    cameraStreamRef.current = null
    setCameraEnabled(false)
  }

  function startOver() {
    disableCamera()
    setDistanceConfirmed(false)
    setBrightnessConfirmed(false)
    setCameraUsed(false)
    setPositionConfirmed(false)
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
    disableCamera()
    setEyeIndex(0)
    setQuestionIndex(0)
    setPatternIndex(0)
    setAnswers([])
    setPatternAnswers([])
    setQuestions(makeQuestions())
    setSymptoms(initialSymptoms)
    setScreen('acuity')
  }

  function finishAcuity() {
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
      skipped: false,
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
      finishAcuity()
    }
  }

  function skipAcuity() {
    if (!currentQuestion) return
    const nextAnswers = [...answers, { eye: currentEye, level: currentQuestion.level, correct: false, skipped: true }]
    setAnswers(nextAnswers)
    if (questionIndex < questions.length - 1) setQuestionIndex(questionIndex + 1)
    else if (eyeIndex === 0) {
      setEyeIndex(1); setQuestionIndex(0)
      setNotice('Agora tape o olho direito e observe com o esquerdo.')
    } else finishAcuity()
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

  function updateSymptom<K extends keyof Symptoms>(key: K, value: Symptoms[K]) {
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
            <span className="duration">Experiência guiada · cerca de 10–12 min</span>
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
            <li><CheckCircle2 /> Prepare um cartão bancário ou cartão de dimensão padrão para calibrar o ecrã e, se possível, uma régua ou fita métrica para confirmar a distância de observação.</li>
            <li><CheckCircle2 /> Se utiliza óculos habitualmente, faça o teste com a correção que usa no dia a dia.</li>
          </ul>
          <div className="notice"><ShieldCheck size={19} /><p>Se tiver perda súbita de visão, dor ocular intensa, flashes novos ou uma sombra semelhante a uma cortina, não faça o teste: procure assistência médica urgente.</p></div>
          <button className="primary-button" onClick={() => setScreen('calibration')}>Preparar dispositivo <ArrowRight size={18} /></button>
        </section>
      )}

      {screen === 'calibration' && (
        <section className="flow-panel">
          <button className="back-link" onClick={() => { disableCamera(); setScreen('intro') }}><ArrowLeft size={15} /> Voltar</button>
          <div className="eyebrow"><Smartphone size={15} /> PASSO 1 · CALIBRAÇÃO</div>
          <h1>Ajuste a escala do ecrã.</h1>
          <p className="panel-copy">Coloque um cartão bancário real na vertical sobre o retângulo. Ajuste o controlo até a largura do retângulo coincidir com o lado curto do cartão (53,98 mm).</p>
          <div className="calibration-stage">
            <div className="calibration-card" style={{ width: `${cardWidth}px` }}>
              <span>CARTÃO</span><small>53,98 mm · lado curto</small>
            </div>
            <span className="scale-caption">Ajuste a largura até corresponder ao seu cartão</span>
          </div>
          <label className="range-label" htmlFor="scale">Lado curto no ecrã <strong>{cardWidth} px</strong></label>
          <input id="scale" className="range-input" type="range" min="160" max="360" value={cardWidth} onChange={(event) => { setCardWidth(Number(event.target.value)); setCalibrated(false) }} />
          <div className="calibration-actions">
            <button className={calibrated ? 'choice-button selected' : 'choice-button'} onClick={() => setCalibrated(true)}><CheckCircle2 size={17} /> Calibrei com um cartão</button>
            <button className={!calibrated ? 'choice-button selected' : 'choice-button'} onClick={() => setCalibrated(false)}>Continuar sem cartão</button>
          </div>
          {!calibrated && <p className="inline-warning">Sem calibração física, o tamanho dos símbolos é apenas aproximado e os resultados não devem ser comparados.</p>}
          <div className="setup-checks">
            <h2>Confirme as condições de utilização</h2>
            <button className={distanceConfirmed ? 'choice-button selected' : 'choice-button'} onClick={() => setDistanceConfirmed((value) => !value)}>
              <CheckCircle2 size={17} /> {distanceConfirmed ? 'Distância de 40 cm confirmada' : 'Medi 40 cm com uma régua ou fita métrica'}
            </button>
            <button className={brightnessConfirmed ? 'choice-button selected' : 'choice-button'} onClick={() => setBrightnessConfirmed((value) => !value)}>
              <Sun size={17} /> {brightnessConfirmed ? 'Brilho máximo confirmado' : 'Ajustei o brilho do ecrã para o máximo'}
            </button>
          </div>
          <div className="camera-assist">
            <div className="camera-assist-heading"><Eye size={18} /><div><strong>Ajuda opcional de posicionamento</strong><span>Use a câmara frontal como espelho para centrar o rosto e manter os olhos à altura do ecrã.</span></div></div>
            {!cameraEnabled ? (
              <button className="choice-button" onClick={enableCamera}><Smartphone size={17} /> Ativar pré-visualização da câmara</button>
            ) : (
              <div className="camera-preview-wrap">
                <video ref={videoRef} className="camera-preview" autoPlay playsInline muted aria-label="Pré-visualização local da câmara frontal" />
                <div className="camera-guide" aria-hidden="true"><span /></div>
                <button className={positionConfirmed ? 'choice-button selected' : 'choice-button'} onClick={() => setPositionConfirmed((value) => !value)}>
                  <CheckCircle2 size={17} /> {positionConfirmed ? 'Posição confirmada' : 'O rosto está centrado e os olhos à altura do ecrã'}
                </button>
                <button className="text-button" onClick={disableCamera}>Desligar câmara</button>
              </div>
            )}
            {cameraError && <p className="inline-warning" role="status">{cameraError}</p>}
            <p className="camera-privacy">A imagem é apresentada apenas neste dispositivo. Não é gravada nem enviada. A pré-visualização não deteta o rosto nem mede a distância.</p>
          </div>
          <div className="distance-note"><Sun size={18} /><span>Meça aproximadamente 40 cm entre os olhos e o ecrã. Mantenha o dispositivo à altura dos olhos, evite reflexos e não altere o zoom do navegador. Esta experiência não mede a visão ao longe nem calcula graduação.</span></div>
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
          <p className="panel-copy">Tape o outro olho com a mão ou um cartão, sem pressionar. Indique para que lado apontam os traços do E. O símbolo é desenhado numa grelha vetorial de 5 × 5, mantendo a proporção geométrica enquanto varia de tamanho.</p>
          <div className="eye-reminder"><EyeOff size={17} /> {currentEye === 'right' ? 'Mantenha o olho esquerdo tapado.' : 'Mantenha o olho direito tapado.'}</div>
          {notice && <p className="session-note">{notice}</p>}
          <div className="optotype-stage" aria-label="Símbolo E em orientação aleatória">
            <svg className="optotype tumbling-e" viewBox="0 0 5 5" role="img" aria-label="Símbolo E em orientação aleatória"
              style={{ width: `${(2.91 * Math.pow(10, currentQuestion.level) * pixelsPerMillimetre)}px`, height: `${(2.91 * Math.pow(10, currentQuestion.level) * pixelsPerMillimetre)}px`, transform: `rotate(${directions.indexOf(currentQuestion.direction) * 90}deg)` }}>
              <rect x="0" y="0" width="1" height="5" />
              <rect x="0" y="0" width="5" height="1" />
              <rect x="0" y="2" width="4" height="1" />
              <rect x="0" y="4" width="5" height="1" />
            </svg>
          </div>
          <p className="question-prompt">Para que lado apontam os traços?</p>
          <div className="direction-grid">
            {directions.map((direction) => (
              <button key={direction} className="direction-button" onClick={() => answerAcuity(direction)} aria-label={directionLabels[direction]}>
                <span>{arrowSymbols[direction]}</span><small>{directionLabels[direction]}</small>
              </button>
            ))}
          </div>
          <p className="muted-hint">Cada dimensão da escala é apresentada cinco vezes, em ordem aleatória. O tamanho progride em passos de 0,2 numa escala logarítmica de estímulo (logMAR-like), mas este exercício não é um teste normalizado nem produz uma medida clínica de acuidade visual.</p>
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
            <h2>Visão ao perto — olho direito</h2>
            <div className="symptom-options">
              <button className={symptoms.nearRight === 'clear' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('nearRight', 'clear')}>Nítida</button>
              <button className={symptoms.nearRight === 'sometimes' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('nearRight', 'sometimes')}>Por vezes desfocada</button>
              <button className={symptoms.nearRight === 'blurred' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('nearRight', 'blurred')}>Frequentemente desfocada</button>
            </div>
          </div>
          <div className="symptom-block">
            <h2>Visão ao perto — olho esquerdo</h2>
            <div className="symptom-options">
              <button className={symptoms.nearLeft === 'clear' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('nearLeft', 'clear')}>Nítida</button>
              <button className={symptoms.nearLeft === 'sometimes' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('nearLeft', 'sometimes')}>Por vezes desfocada</button>
              <button className={symptoms.nearLeft === 'blurred' ? 'choice-button selected' : 'choice-button'} onClick={() => updateSymptom('nearLeft', 'blurred')}>Frequentemente desfocada</button>
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
            <span>Calibração do ecrã: {calibrated ? 'ajustada manualmente com cartão de 85,6 mm' : 'não realizada'}</span>
            <span>Distância de observação: {distanceConfirmed ? '40 cm confirmados pelo utilizador com régua ou fita métrica' : 'não confirmada por medição'}</span>
            <span>Brilho do ecrã: {brightnessConfirmed ? 'ajustado para o máximo pelo utilizador' : 'não confirmado'}</span>
            <span>Ajuda de posicionamento por câmara: {cameraUsed ? (positionConfirmed ? 'pré-visualização utilizada; posição confirmada visualmente pelo utilizador' : 'pré-visualização utilizada sem confirmação de posição') : 'não utilizada'}</span>
          </div>
          <h2 className="section-heading">1. Reconhecimento de símbolos</h2>
          <div className="result-grid">
            {summary.map((item) => (
              <article className="result-card" key={item.eye}>
                <span className="result-label">{eyeNames[item.eye]}</span>
                <strong>{item.correct} <small>{item.correct === 1 ? 'acerto' : 'acertos'}</small></strong>
                <span className="result-description">em {item.total} símbolos apresentados, distribuídos por 6 dimensões com 5 tentativas cada. Acertos por dimensão:</span>
                <div className="level-breakdown">
                  {item.levelBreakdown.map((level) => (
                    <span key={level.level}><b>{Math.round(level.level * 100)}%</b><i className={level.correct >= 4 ? 'level-mark correct' : 'level-mark'} />{level.correct}/{level.total} corretos{level.skipped ? ` · ${level.skipped} sem resposta` : ''}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="report-explainer">Cada dimensão é apresentada com cinco tentativas para reduzir o efeito do acaso. Um resultado de 4/5 ou 5/5 é assinalado apenas como desempenho consistente neste exercício. Estes valores não são uma escala Snellen/logMAR, não medem acuidade visual clínica e não permitem estimar miopia ou graduação.</p>

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
