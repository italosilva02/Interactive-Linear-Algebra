# LinearViz Engine

**Visualizador interativo de Álgebra Linear** — desenvolvido como projeto de portfólio para explorar conceitos geométricos de vetores, retas, pontos e superfícies no plano ℝ² e no espaço ℝ³.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Como Usar](#como-usar)
- [Modos de Visualização](#modos-de-visualização)
- [Card de Métricas](#card-de-métricas)
- [Calculadora](#calculadora)
- [Guia de Estudos](#guia-de-estudos)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Conceitos Matemáticos](#conceitos-matemáticos)

---

## Visão Geral

O LinearViz Engine é uma aplicação web **single-page** sem build tools — basta abrir o `index.html` em qualquer navegador moderno. Ele combina visualização gráfica interativa (via Plotly.js) com cálculos simbólicos em tempo real (via Math.js), apresentando resultados num painel de métricas flutuante arrastável.

---

## Funcionalidades

| Recurso | Descrição |
|---|---|
| **4 modos de visualização** | Retas 2D, Pontos 3D, Retas 3D, Superfície 3D |
| **Tema claro/escuro** | Alternância instantânea com variáveis CSS |
| **Card de métricas flutuante** | Arrastável, minimizável, com fórmulas passo a passo |
| **Escalar λ** | Aplica fator multiplicador e mostra vetores escalados |
| **Copiar para calculadora** | Botão "↗ copiar" envia o vetor diretamente para os campos da calculadora |
| **Setas de direção (3D)** | Cones Plotly indicam a direção de cada reta no espaço |
| **Linhas de projeção (3D pontos)** | Linhas coloridas ligam cada ponto aos eixos X, Y, Z |
| **Superfície 3D** | Renderiza Z = f(x,y) como superfície colorida, wireframe ou ambos |
| **Card de superfície** | Explica como Z é calculado com exemplos numéricos |
| **Exportar relatório** | Gera arquivo `.txt` com os resultados da calculadora |

---

## Como Usar

### Instalação

Nenhuma instalação necessária. Abra o arquivo `index.html` diretamente no navegador.

> **Atenção:** as bibliotecas são carregadas via CDN. É necessária conexão com internet na primeira abertura.

### Estrutura de arquivos

```
linearviz/
├── index.html      # Estrutura HTML da aplicação
├── style.css       # Estilos e temas (variáveis CSS)
├── app.js          # Lógica completa da aplicação
└── README.md       # Documentação
```

---

## Modos de Visualização

### Retas no Plano (2D)

Cada **reta** é definida por dois pontos: **P₁ (x₁, y₁)** e **P₂ (x₂, y₂)**.

- O vetor diretor é calculado como `v = P₂ − P₁`
- Uma seta (Plotly `annotation`) aponta de P₁ para P₂
- O módulo `|v|` é exibido no meio da reta
- Se um escalar λ estiver presente, um vetor fantasma escalonado aparece tracejado

### Pontos no Espaço (3D)

Cada **ponto** é definido por coordenadas **(x, y, z)**.

- Halos de glow em camadas de opacidade decrescente
- Linhas de projeção coloridas permanentes: 🔴 eixo X · 🟢 eixo Y · 🔵 eixo Z
- Linhas tracejadas entre todos os pares de pontos com a distância exibida

### Retas no Espaço (3D)

Cada **reta** é definida por dois pontos 3D.

- Linha principal com glow em camadas
- Extensão fantasma 45% além dos extremos
- **Cone Plotly** posicionado a 65% do comprimento, apontando na direção do vetor diretor (seta 3D real)
- Label com o módulo no ponto médio

### Superfície 3D — Z = f(x,y)

O usuário digita qualquer função matemática que o Math.js suporte:

```
sin(sqrt(x^2 + y^2))
sin(x) * cos(y)
x^2 - y^2
abs(x) + abs(y)
exp(-(x^2+y^2)/4)
```

**Controles:**
- **Tipo:** Superfície colorida / Wireframe (malha) / Ambos sobrepostos
- **Range X/Y:** domínio da avaliação
- **Resolução:** quantidade de pontos no grid (20–80)

---

## Card de Métricas

O **card de métricas** flutua sobre o canvas. É possível:
- **Arrastar** pelo cabeçalho
- **Minimizar** com o botão `−`

### Conteúdo por modo

**2D — por reta:**
- Origem P₁ e destino P₂
- Vetor diretor `v = P₂ − P₁`
- Módulo `|v| = √(vx²+vy²)`
- Ângulo `θ = atan2(vy, vx)`
- Fórmula completa passo a passo
- Seção de escalonamento λ (quando ativo)

**2D — relação entre 2 retas:**
- Distância Euclidiana L₂ entre as origens
- Distância Manhattan L₁
- Produto escalar `u·v`
- Ângulo entre as retas `cos⁻¹(u·v / |u||v|)`

**3D — por ponto:**
- Coordenadas (x, y, z)
- Distância à origem `|OP| = √(x²+y²+z²)` com desenvolvimento completo
- Seção de escalonamento λ

**3D — análise da nuvem:**
- Centróide
- Distâncias L₂ e L₁ entre P1 e P2
- Covariância(X,Y) e Covariância(X,Z)

**3D linhas — por reta:**
- P₁, P₂
- Vetor diretor com desenvolvimento
- Módulo com raiz quadrada desenvolvida
- Equação paramétrica `r(t) = P₁ + t·v`

**Superfície:**
- Fórmula da função
- 4 exemplos de cálculo com valores reais
- Z mínimo, Z máximo, amplitude ΔZ, resolução do grid

---

## Calculadora

A aba **Calculadora** oferece operações independentes do visualizador:

### Vetores

Insira as coordenadas separadas por vírgula, ex: `3, 4, 0`

| Operação | Resultado |
|---|---|
| `u + v` | Soma componente a componente |
| `u − v` | Subtração componente a componente |
| `u · v` | Produto escalar (dot product) |
| `dist` | L₂ (Euclidiana) e L₁ (Manhattan) |

### Matrizes

Insira em formato JSON, ex: `[[1,2],[3,4]]`

| Operação | Resultado |
|---|---|
| `Aᵀ` | Transposta |
| `\|A\|` | Determinante (somente quadradas) |
| `Forma + Info` | Dimensões, tipo e total de elementos |

### Exportar

O botão **↓ Exportar Relatório .txt** gera um arquivo de texto com todos os resultados da sessão.

---

## Guia de Estudos

A aba **Guia** contém cartões de referência sobre:

- **Espaços ℝⁿ** — representação de pontos em 2D e 3D
- **Vetores e Módulo** — definição e fórmula `|v| = √Σvᵢ²`
- **Distâncias** — L₂ Euclidiana e L₁ Manhattan com fórmulas
- **Produto Escalar** — `u·v = Σuᵢvᵢ = |u||v|cosθ`
- **Determinante** — significado geométrico e fórmula 2×2
- **Covariância** — `Cov(X,Y) = Σ(xᵢ−x̄)(yᵢ−ȳ) / (n−1)`
- **Superfícies Z = f(x,y)** — interpretação geométrica

---

## Arquitetura do Projeto

### `index.html`

Estrutura semântica em duas colunas:
- `<aside class="sidebar">` — painel lateral com navegação e controles
- `<main class="canvas">` — área do gráfico + card flutuante + stats bar

Três abas (painéis): `panel-viz`, `panel-calc`, `panel-study`

### `style.css`

Baseado em **CSS Custom Properties (variáveis)** para suporte completo a temas:

```css
[data-theme="dark"] { --text: #f0f0ff; --accent: #8b7bff; ... }
[data-theme="light"] { --text: #0e0e28; --accent: #5644e0; ... }
```

Os componentes reusam as mesmas classes independentemente do tema.

### `app.js`

Organizado em seções:

```
PALETTE & config
toggleTheme / TH()         ← tema e cores do Plotly
switchTab                  ← navegação entre abas
onModeChange               ← troca de modo geométrico
createInputRow             ← geração dinâmica de inputs
copyVector                 ← integração visualizador ↔ calculadora
renderPlot                 ← renderização principal (Plotly)
  ├── 3d_surface
  ├── 2d_lines
  ├── 3d_points
  └── 3d_lines (com cones)
buildMetricsCard           ← geração do HTML das métricas
buildSurfaceCard           ← card explicativo da superfície
draw                       ← wrapper Plotly.newPlot / react
calcVector / calcMatrix    ← calculadora
exportResults              ← exportação .txt
initDraggable              ← drag do card de métricas
```

#### Padrão de renderização

A função `renderPlot()` é chamada:
- Na inicialização (com delay de 80ms)
- A cada input (debounce de 160ms)
- Na troca de modo ou tema

Usa `Plotly.react()` para updates incrementais (evita re-render completo).

#### Cones de direção (3D lines)

Para cada reta, um trace do tipo `cone` é adicionado:

```javascript
data.push({
  type: 'cone',
  x: [ax], y: [ay], z: [az],       // posição (65% do comprimento)
  u: [normX], v: [normY], w: [normZ], // direção normalizada
  sizemode: 'absolute', sizeref: 0.8,
  anchor: 'tail',
  colorscale: [[0, color], [1, color]],
});
```

---

## Tecnologias Utilizadas

| Biblioteca | Versão | Uso |
|---|---|---|
| [Plotly.js](https://plotly.com/javascript/) | 2.27.0 | Renderização 2D/3D interativa |
| [Math.js](https://mathjs.org/) | 11.8.0 | Cálculos matemáticos e parsing de funções |
| [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) | — | Fonte principal (sans-serif) |
| [Space Mono](https://fonts.google.com/specimen/Space+Mono) | — | Fonte monospace (valores numéricos) |

Sem frameworks, sem build tools, sem dependências de runtime além das listadas acima.

---

## Conceitos Matemáticos

### Vetor Diretor

Dado P₁ = (x₁, y₁) e P₂ = (x₂, y₂):
```
v = P₂ − P₁ = (x₂−x₁, y₂−y₁)
```

### Módulo

```
|v| = √(v₁² + v₂² + ... + vₙ²)
```

### Produto Escalar

```
u · v = u₁v₁ + u₂v₂ + ... + uₙvₙ = |u||v|cosθ
```

### Distância Euclidiana (L₂)

```
d(P,Q) = √Σ(pᵢ − qᵢ)²
```

### Distância Manhattan (L₁)

```
d(P,Q) = Σ|pᵢ − qᵢ|
```

### Equação Paramétrica de uma Reta (3D)

```
r(t) = P₁ + t · v,    t ∈ ℝ
```

Onde `v = P₂ − P₁` é o vetor diretor.

### Covariância

```
Cov(X,Y) = Σ(xᵢ − x̄)(yᵢ − ȳ) / (n − 1)
```

---
