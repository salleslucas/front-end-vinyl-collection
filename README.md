# 🎵 Frontend - Biblioteca de Vinis

Frontend completo em **Vanilla JavaScript** (sem frameworks) para consumir a API REST de gerenciamento de vinis.

## 📋 Características

- ✅ **100% Vanilla JS** - Sem React, Vue, Angular ou qualquer framework
- ✅ **ES Modules** - Código modular e organizado
- ✅ **GSAP via CDN** - Animações profissionais 
- ✅ **Sem bundlers** - Roda diretamente no navegador
- ✅ **Responsivo** - Funciona em desktop, tablet e mobile
- ✅ **Código limpo** - Bem comentado e fácil de entender

## 📁 Estrutura de Arquivos

```
front-end/
├── index.html           # Página principal
├── css/
│   └── styles.css      # Estilos da aplicação
└── js/
    ├── api.js          # Comunicação com a API REST
    ├── ui.js           # Manipulação da interface
    ├── animations.js   # Animações GSAP
    └── main.js         # Arquivo principal (orquestrador)
```

## 🚀 Como Usar

### 1. Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Backend da API REST rodando (padrão: `http://localhost:5000`)

### 2. Configuração

Edite o arquivo `js/api.js` e ajuste a URL da API se necessário:

```javascript
const API_BASE_URL = 'http://localhost:5000';
```

### 3. Executar

Você tem várias opções:

#### Opção A: Abrir diretamente no navegador
- Abra o arquivo `index.html` no navegador

#### Opção B: Usar um servidor HTTP local

**Python:**
```bash
# Python 3
python -m http.server 8000

# Acesse: http://localhost:8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000

# Acesse: http://localhost:8000
```

**VS Code:**
- Instale a extensão "Live Server"
- Clique com botão direito em `index.html` → "Open with Live Server"

## 🎯 Funcionalidades

### 1. Listagem de Vinis
- Exibe todos os vinis em cards
- Mostra: capa, artista, álbum, cor, ano, selo
- Cards animados com efeito stagger (GSAP)
- Clique no card para ver detalhes completos

### 2. Busca por Artista
- Campo de busca no topo da página
- Busca automática com debounce (500ms)
- Busca mínima: 2 caracteres
- Botão "Limpar" para voltar à listagem completa

### 3. Comparação de Prensagens
- Modal dedicado para comparação
- Insira dois IDs de vinis
- Resultado formatado em JSON
- Validação de campos

### 4. Estatísticas
- Visualização de estatísticas por cor
- Cards organizados em grid
- Dados completos em JSON formatado

## 🎨 Animações GSAP

Todas as animações são feitas com GSAP (carregado via CDN):

- **Cards:** Aparecem com stagger e fade-in
- **Modais:** Abrem com scale e bounce
- **Seções:** Fade-in suave ao trocar
- **Header:** Animação inicial ao carregar

## 📡 Endpoints da API Consumidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/vinis` | Lista todos os vinis |
| GET | `/vinis/{id}` | Busca vinil por ID |
| GET | `/buscar?artista={nome}` | Busca por artista |
| GET | `/stats/cores` | Estatísticas de cores |
| POST | `/comparar_prensagens` | Compara duas prensagens |

## 🔧 Estrutura dos Módulos

### `api.js`
Responsável por toda comunicação com o backend:
- `getVinis()` - Lista vinis
- `getVinilById(id)` - Busca por ID
- `buscarPorArtista(artista)` - Busca por nome
- `getStatsCores()` - Estatísticas
- `compararPrensagens(idA, idB)` - Comparação

### `ui.js`
Manipulação da interface do usuário:
- `renderVinisGrid(vinis)` - Renderiza cards
- `renderStats(stats)` - Renderiza estatísticas
- `showComparacaoModal()` - Abre modal
- `switchSection(section)` - Troca seções

### `animations.js`
Animações com GSAP:
- `animateCards()` - Anima entrada de cards
- `animateModal(selector)` - Anima abertura de modal
- `animateSections(selector)` - Anima seções
- `initPageAnimations()` - Animações iniciais

### `main.js`
Orquestrador da aplicação:
- Inicialização
- Event listeners
- Gerenciamento de estado
- Coordenação entre módulos

## 🎨 Personalização

### Alterar Cores

Edite as variáveis CSS em `css/styles.css`:

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    /* ... */
}
```

### Ajustar Animações

Edite `js/animations.js` e altere os parâmetros do GSAP:

```javascript
gsap.from(cards, {
    duration: 0.6,    // Duração
    stagger: 0.08,    // Delay entre cards
    ease: 'power3.out' // Tipo de easing
});
```

## 🐛 Debug

O console do navegador expõe o objeto `VinilApp` para debugging:

```javascript
// No console do navegador:
VinilApp.loadVinis()           // Recarrega vinis
VinilApp.loadStats()           // Recarrega stats
VinilApp.buscarVinis('termo')  // Busca manual
VinilApp.state                 // Estado da aplicação
```

## ⚠️ Troubleshooting

### Erro de CORS
Se você receber erro de CORS, certifique-se de que:
1. O backend está rodando
2. O backend tem CORS habilitado
3. A URL da API está correta em `api.js`

### Imagens não carregam
As imagens possuem fallback automático. Se não carregar:
1. Verifique a URL da capa no banco de dados
2. Confira se a URL é válida e acessível

### Animações não funcionam
Verifique se:
1. O GSAP foi carregado (veja o console)
2. A CDN do GSAP está acessível
3. Não há erros de JavaScript bloqueando

## 📱 Responsividade

O layout é totalmente responsivo:
- **Desktop:** Grid de 3-4 colunas
- **Tablet:** Grid de 2 colunas
- **Mobile:** Grid de 1 coluna

## 🔒 Segurança

- **XSS Protection:** Todas as entradas são escapadas
- **Input Validation:** Validação de campos de formulário
- **Safe HTML:** Uso de `textContent` para prevenir injeção

## 📄 Licença

Projeto desenvolvido para o MVP da Sprint 1 - PUC Rio por Lucas de Almeida Salles


