# 🖼️ Sistema de Upload de Imagens

## ✅ Implementação Completa

### Backend (Python/Flask)

#### 1. Modelo atualizado (`app/models/vinil.py`)
- ✅ Campo `capa` adicionado (VARCHAR 500)
- ✅ Construtor atualizado para aceitar `capa`
- ✅ Método `to_dict()` retorna campo `capa`

#### 2. API atualizada (`app/api/vinis.py`)
- ✅ Aceita imagens em **base64** ou **URL**
- ✅ Função `save_image()` para salvar arquivos
- ✅ Validação de extensões permitidas: PNG, JPG, JPEG, GIF, WEBP
- ✅ Geração de nomes únicos com UUID
- ✅ Salva em `/uploads/capas/`

#### 3. Configuração do Flask (`app/__init__.py`)
- ✅ Rota `/uploads/capas/<filename>` para servir imagens
- ✅ CORS habilitado para `/uploads/*`

### Frontend (HTML/CSS/JS)

#### 1. Formulário (`index.html`)
- ✅ Input file com preview de imagem
- ✅ Botões "Selecionar Imagem" e "Remover"
- ✅ Validação de tamanho (máx 5MB) e tipo

#### 2. Estilos (`css/styles.css`)
- ✅ Preview quadrado 200x200px
- ✅ Placeholder SVG quando sem imagem
- ✅ Grid responsivo (imagem + controles)
- ✅ Botões estilizados

#### 3. JavaScript (`js/main.js`)
- ✅ `setupImageUpload()` - configura eventos
- ✅ `getImageData()` - retorna base64
- ✅ `clearImagePreview()` - limpa preview
- ✅ Validações de tamanho e formato
- ✅ FileReader para converter para base64

#### 4. Renderização (`js/ui.js`)
- ✅ `createVinilCard()` verifica se vinil tem `capa`
- ✅ Se tiver, usa a imagem real
- ✅ Se não tiver, usa SVG placeholder
- ✅ URLs relativas são convertidas para absolutas

## 📋 Como Usar

### 1. Migrar o Banco de Dados
```bash
cd back-end
python migrate_add_capa.py
```

Isso adiciona a coluna `capa` na tabela `vinis`.

### 2. Criar Diretório de Uploads
```bash
mkdir -p back-end/uploads/capas
```

### 3. Iniciar o Backend
```bash
cd back-end
python run.py
```

### 4. Abrir o Frontend
Abra `front-end/index.html` em um navegador ou use um servidor local.

### 5. Adicionar Vinil com Imagem
1. Clique em "➕ Adicionar Vinil"
2. Clique em "📁 Selecionar Imagem"
3. Escolha uma imagem (JPG, PNG, GIF ou WEBP)
4. Preview aparecerá automaticamente
5. Preencha os outros campos
6. Clique em "✓ Adicionar à Coleção"

## 🔄 Fluxo de Upload

### Frontend → Backend
1. Usuário seleciona imagem
2. FileReader converte para **base64 (Data URL)**
3. Preview é exibido
4. Ao submeter, imagem base64 é enviada no JSON:
```json
{
  "artista": "Pink Floyd",
  "album": "The Dark Side of the Moon",
  "capa": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Backend → Salvamento
1. API detecta string base64
2. Remove prefixo `data:image/...;base64,`
3. Decodifica para bytes
4. Salva em `/uploads/capas/{album}_{uuid}.jpg`
5. Retorna caminho relativo: `/uploads/capas/the_dark_side_of_the_moon_a1b2c3d4.jpg`

### Backend → Frontend
1. API retorna vinil com campo `capa`
2. Frontend verifica se começa com `/uploads`
3. Converte para URL absoluta: `http://localhost:5000/uploads/capas/...`
4. Renderiza imagem no card

## ⚙️ Configurações

### Tamanho Máximo
```javascript
// main.js linha ~203
if (file.size > 5 * 1024 * 1024) {
    ui.showError('Imagem muito grande! Máximo 5MB.');
}
```

### Formatos Aceitos
```python
# vinis.py linha ~18
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
```

### Diretório de Upload
```python
# vinis.py linha ~32
upload_folder = os.path.join(current_app.root_path, '..', 'uploads', 'capas')
```

## 🐛 Troubleshooting

### Imagem não aparece nos cards
- Verifique se o backend está rodando
- Verifique a URL no DevTools Network tab
- Deve ser: `http://localhost:5000/uploads/capas/...`

### Erro ao salvar
- Verifique permissões da pasta `uploads/capas/`
- Verifique se o diretório existe
- Veja os logs do Python no terminal

### Imagem muito grande
- Reduza o tamanho antes do upload
- Ou aumente o limite no código

### CORS error
- CORS já está configurado para `/uploads/*`
- Se persistir, verifique `app/__init__.py`

## 🎯 Próximas Melhorias

- [ ] Compressão automática de imagens
- [ ] Crop/resize antes do upload
- [ ] Múltiplas imagens (galeria)
- [ ] Integração com CDN
- [ ] Busca de capas na API do Discogs
- [ ] Lazy loading das imagens
- [ ] Thumbnails otimizados

## 📝 Exemplo Completo

### Request POST
```http
POST /api/v1/vinis/
Content-Type: application/json

{
  "artista": "Pink Floyd",
  "album": "The Dark Side of the Moon",
  "cor_prensagem": "Preto",
  "ano": 1973,
  "midia": "LP",
  "selo": "Harvest Records",
  "capa": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Response (201 Created)
```json
{
  "id": 8,
  "artista": "Pink Floyd",
  "album": "The Dark Side of the Moon",
  "cor_prensagem": "Preto",
  "ano": 1973,
  "midia": "LP",
  "selo": "Harvest Records",
  "capa": "/uploads/capas/the_dark_side_of_the_moon_a1b2c3d4.jpg",
  "data_cadastro": "2025-11-18T15:30:00"
}
```

### Estrutura de Arquivos
```
back-end/
├── uploads/
│   └── capas/
│       ├── the_dark_side_of_the_moon_a1b2c3d4.jpg
│       ├── abbey_road_e5f6g7h8.jpg
│       └── ...
├── app/
│   ├── __init__.py (rota /uploads/capas/)
│   ├── models/vinil.py (campo capa)
│   └── api/vinis.py (save_image)
└── migrate_add_capa.py
```

✅ **Sistema completo e funcional!**
