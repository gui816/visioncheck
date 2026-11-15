# VisionCheck

Aplicação web de auto-observação visual educativa, com exercícios guiados por olho e relatório detalhado da sessão.

## Funcionalidades atuais
- Calibração manual opcional com cartão de 85,6 mm.
- Reconhecimento de símbolos com oclusão alternada de cada olho.
- Observação subjetiva de padrões de linhas em quatro orientações, por olho.
- Questionário de sintomas visuais ao longe, ao perto e desconforto ocular.
- Relatório por olho com respostas, padrões observados, sintomas referidos, contexto de calibração e limitações.
- Impressão do relatório através do navegador.
- Os dados da sessão permanecem no estado local da página e não são enviados para um servidor.

## Limitações importantes
Esta versão não executa uma refração clínica, não mede acuidade visual normalizada, não identifica nem diagnostica miopia ou astigmatismo e não calcula valores de esfera (SPH), cilindro (CYL), eixo (AXIS) ou receita de óculos. Os exercícios e sintomas são apenas sinais educativos que podem ajudar o utilizador a decidir se deve procurar uma avaliação profissional.

A medição de graduação exige um protocolo refrativo validado e comparação com equipamento e avaliação profissional. A câmara frontal, estimativa de distância e cálculos refrativos não estão implementados nesta versão.

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
