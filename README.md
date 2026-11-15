# VisionCheck

Aplicação web de auto-observação visual educativa, com exercícios guiados por olho e relatório detalhado da sessão.

## Funcionalidades atuais
- Calibração manual opcional com cartão bancário de 85,6 × 53,98 mm, usando o lado curto como referência para caber melhor em ecrãs móveis.
- Lista de verificação para distância de observação de 40 cm e brilho do ecrã.
- Pré-visualização opcional da câmara frontal para ajudar o utilizador a centrar o rosto e alinhar os olhos; não executa reconhecimento facial nem mede distância.
- O relatório regista quais as condições de preparação confirmadas pelo utilizador.
- Reconhecimento do optótipo E vetorial numa grelha geométrica 5 × 5, com oclusão alternada de cada olho, seis tamanhos em passos logarítmicos de 0,2 e cinco tentativas por tamanho em ordem aleatória.
- Registo separado de respostas corretas, incorretas e símbolos não identificados.
- Indicador descritivo de consistência por dimensão (4/5 ou 5/5), sem conversão em acuidade clínica. A escala de estímulo é inspirada em progressões logMAR, mas não constitui uma escala clínica logMAR.
- Observação subjetiva de padrões de linhas em quatro orientações, por olho.
- Questionário de sintomas visuais ao longe, ao perto e desconforto ocular.
- Relatório por olho com respostas, padrões observados, sintomas referidos, contexto de calibração e limitações.
- Impressão do relatório através do navegador.
- Os dados da sessão permanecem no estado local da página e não são enviados para um servidor.

## Limitações importantes
Esta versão não executa uma refração clínica, não mede acuidade visual normalizada, não identifica nem diagnostica miopia ou astigmatismo e não calcula valores de esfera (SPH), cilindro (CYL), eixo (AXIS) ou receita de óculos. Os exercícios e sintomas são apenas sinais educativos que podem ajudar o utilizador a decidir se deve procurar uma avaliação profissional.

As repetições reduzem a influência de uma resposta isolada ou do acaso, mas não transformam o exercício num teste clínico validado. A medição de graduação exige um protocolo refrativo validado e comparação com equipamento e avaliação profissional. A pré-visualização da câmara é apenas um espelho local de posicionamento. Não deteta automaticamente o rosto, não mede distância ou inclinação e não guarda nem envia imagens. A medição automática da distância e os cálculos refrativos não estão implementados nesta versão.

## Requisitos
- Node.js 22+
- npm

## Desenvolvimento
```bash
npm install
npm run dev
```

## Verificações
```bash
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

## GitHub Pages
O Vite está configurado com `base: '/visioncheck/'`, assumindo publicação em https://gui816.github.io/visioncheck/. GitHub Pages deve usar GitHub Actions.

## Segurança e âmbito
Protótipo educativo, não é um dispositivo médico e não substitui avaliação por optometrista ou oftalmologista. Perda súbita de visão, dor ocular intensa, flashes novos ou uma sombra tipo cortina exigem assistência médica urgente.
