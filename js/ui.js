/**
 * ui.js - Módulo de manipulação da interface do usuário
 * 
 * Este módulo é responsável por criar e atualizar elementos HTML,
 * manipular DOM e gerenciar interações do usuário.
 */

import { animateCards, animateModal, animateSections } from './animations.js';

/**
 * Renderiza a grid de vinis na página
 * @param {Array} vinis - Array com os dados dos vinis
 */
export function renderVinisGrid(vinis) {
    const grid = document.getElementById('vinis-grid');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');

    // Esconde loading
    loading.style.display = 'none';

    // Limpa a grid
    grid.innerHTML = '';

    // Se não houver resultados
    if (!vinis || vinis.length === 0) {
        noResults.style.display = 'flex';
        return;
    }

    noResults.style.display = 'none';

    // Cria os cards
    vinis.forEach(vinil => {
        const card = createVinilCard(vinil);
        grid.appendChild(card);
    });

    // Anima os cards
    animateCards();
    
    // Atualiza stats mini
    updateMiniStats(vinis);
}

/**
 * Cria um card HTML para um vinil no novo estilo
 * @param {Object} vinil - Dados do vinil
 * @returns {HTMLElement} Elemento do card
 */
function createVinilCard(vinil) {
    const card = document.createElement('div');
    card.className = 'vinil-card';
    card.dataset.vinilId = vinil.id;

    // Mapa de cores para os backgrounds
    const corMap = {
        'Preto': '#1a1a1a',
        'Colorido': 'linear-gradient(135deg, #e91e63, #9c27b0)',
        'Transparente': '#2196f3',
        'Roxo': '#9c27b0'
    };
    
    const bgStyle = corMap[vinil.cor_prensagem] || '#333333';
    const isGradient = bgStyle.includes('gradient');
    
    // Usa a imagem da capa se existir, senão cria SVG
    let imgUrl;
    if (vinil.capa) {
        // Se for URL relativa, adiciona o base URL da API
        if (vinil.capa.startsWith('/uploads')) {
            imgUrl = `http://localhost:5000${vinil.capa}`;
        } else {
            imgUrl = vinil.capa;
        }
    } else {
        // Cria uma imagem SVG inline ao invés de usar placeholder externo
        imgUrl = `data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E${isGradient ? `%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e91e63'/%3E%3Cstop offset='100%25' style='stop-color:%239c27b0'/%3E%3C/linearGradient%3E` : ''}%3C/defs%3E%3Crect width='400' height='400' fill='${isGradient ? 'url(%23grad)' : bgStyle}'/%3E%3Ccircle cx='200' cy='200' r='150' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/%3E%3Ccircle cx='200' cy='200' r='100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/%3E%3Ccircle cx='200' cy='200' r='20' fill='rgba(255,255,255,0.2)'/%3E%3Ctext x='200' y='220' font-family='Arial' font-size='16' fill='rgba(255,255,255,0.6)' text-anchor='middle'%3E${encodeURIComponent(vinil.album.substring(0, 15))}%3C/text%3E%3C/svg%3E`;
    }

    // Badge da cor
    const corClass = vinil.cor_prensagem.toLowerCase().replace(' ', '-');
    
    // Badge do tipo de mídia
    const midiaText = vinil.midia === 'LP' ? 'LP' : vinil.midia;

    card.innerHTML = `
        <div class="vinil-card-image-wrapper">
            <img src="${imgUrl}" alt="${vinil.album}" class="vinil-card-image">
            <div class="vinil-card-badges">
                <span class="badge badge-${corClass}">${escapeHTML(vinil.cor_prensagem)}</span>
                ${vinil.midia === 'LP' ? '<span class="badge badge-lp">LP</span>' : ''}
            </div>
        </div>
        <div class="vinil-card-content">
            <h3 class="vinil-card-title">${escapeHTML(vinil.album)}</h3>
            <p class="vinil-card-artist">${escapeHTML(vinil.artista)}</p>
            <div class="vinil-card-details">
                <div class="vinil-detail-item">📅 ${vinil.ano}</div>
                <div class="vinil-detail-item">💿 ${escapeHTML(vinil.selo || 'N/A')}</div>
            </div>
        </div>
    `;

    // Adiciona evento de clique para abrir modal de detalhes
    card.addEventListener('click', () => {
        showVinilDetailsModal(vinil.id);
    });

    return card;
}

/**
 * Mostra o modal com detalhes completos de um vinil
 * @param {number} id - ID do vinil
 */
export async function showVinilDetailsModal(id) {
    const modal = document.getElementById('modal-detalhes');
    const content = document.getElementById('detalhes-content');

    try {
        // Importa a função da API dinamicamente para evitar dependência circular
        const { getVinilById } = await import('./api.js');
        const vinil = await getVinilById(id);

        content.innerHTML = createVinilDetailsHTML(vinil);
        modal.classList.add('active');
        animateModal('#modal-detalhes .modal-content');
    } catch (error) {
        content.innerHTML = `<p style="color: red;">Erro ao carregar detalhes: ${error.message}</p>`;
        modal.classList.add('active');
    }
}

/**
 * Cria o HTML para os detalhes de um vinil (modal)
 * @param {Object} vinil - Dados do vinil
 * @returns {string} HTML string
 */
function createVinilDetailsHTML(vinil) {
    const corMap = {
        'Preto': '#1a1a1a',
        'Colorido': 'linear-gradient(135deg, #e91e63, #9c27b0)',
        'Transparente': '#2196f3',
        'Roxo': '#9c27b0'
    };
    
    const bgStyle = corMap[vinil.cor_prensagem] || '#333333';
    const isGradient = bgStyle.includes('gradient');
    
    // SVG inline para modal (maior)
    const svgPlaceholder = `data:image/svg+xml,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E${isGradient ? `%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e91e63'/%3E%3Cstop offset='100%25' style='stop-color:%239c27b0'/%3E%3C/linearGradient%3E` : ''}%3C/defs%3E%3Crect width='600' height='600' fill='${isGradient ? 'url(%23grad)' : bgStyle}'/%3E%3Ccircle cx='300' cy='300' r='220' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='3'/%3E%3Ccircle cx='300' cy='300' r='150' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/%3E%3Ccircle cx='300' cy='300' r='30' fill='rgba(255,255,255,0.2)'/%3E%3Ctext x='300' y='320' font-family='Arial' font-size='20' fill='rgba(255,255,255,0.7)' text-anchor='middle'%3E${encodeURIComponent(vinil.album.substring(0, 20))}%3C/text%3E%3C/svg%3E`;

    // Determina raridade baseada na cor
    const raridadeMap = {
        'Preto': 1,
        'Transparente': 2,
        'Roxo': 3,
        'Colorido': 4
    };
    const nivelRaridade = raridadeMap[vinil.cor_prensagem] || 1;
    const estrelas = '⭐'.repeat(Math.min(nivelRaridade, 5));

    return `
        <div class="detalhes-vinil">
            <div class="detalhes-vinil-header">
                <h2 class="detalhes-vinil-title">${escapeHTML(vinil.album)}</h2>
            </div>
            <div class="detalhes-vinil-content">
                <div class="detalhes-vinil-image-wrapper">
                    <img src="${svgPlaceholder}" alt="${vinil.album}" class="detalhes-vinil-image">
                </div>
                <div class="detalhes-vinil-info">
                    <div class="detalhes-vinil-artist-section">
                        <h3 class="detalhes-vinil-artist">${escapeHTML(vinil.artista)}</h3>
                        <p class="detalhes-vinil-subtitle">${escapeHTML(vinil.album)} (${vinil.ano})</p>
                    </div>
                    
                    <div class="detalhes-vinil-meta-grid">
                        <div class="detalhes-meta-item">
                            <span class="detalhes-meta-icon">💿</span>
                            <div class="detalhes-meta-text">
                                <span class="detalhes-meta-label">Cor</span>
                                <span class="detalhes-meta-value">${escapeHTML(vinil.cor_prensagem || 'N/A')}</span>
                            </div>
                        </div>
                        
                        <div class="detalhes-meta-item">
                            <span class="detalhes-meta-icon">📅</span>
                            <div class="detalhes-meta-text">
                                <span class="detalhes-meta-label">Ano</span>
                                <span class="detalhes-meta-value">${vinil.ano}</span>
                            </div>
                        </div>
                        
                        <div class="detalhes-meta-item">
                            <span class="detalhes-meta-icon">🏢</span>
                            <div class="detalhes-meta-text">
                                <span class="detalhes-meta-label">Selo</span>
                                <span class="detalhes-meta-value">${escapeHTML(vinil.selo || 'N/A')}</span>
                            </div>
                        </div>
                        
                        <div class="detalhes-meta-item">
                            <span class="detalhes-meta-icon">💽</span>
                            <div class="detalhes-meta-text">
                                <span class="detalhes-meta-label">Mídia</span>
                                <span class="detalhes-meta-value">${escapeHTML(vinil.midia || 'LP')}</span>
                            </div>
                        </div>
                        
                        <div class="detalhes-meta-item">
                            <span class="detalhes-meta-icon">🎀</span>
                            <div class="detalhes-meta-text">
                                <span class="detalhes-meta-label">Raridade</span>
                                <span class="detalhes-meta-value">${estrelas}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn-rare-item">
                        <span>⭐</span> Item Raro na Coleção
                    </button>
                </div>
            </div>
            
            <div class="detalhes-vinil-tracklist">
                <h4 class="tracklist-title">🎵 Tracklist</h4>
                <div class="tracklist-grid">
                    <div class="tracklist-item"><span class="track-number">01</span> Speak to Me</div>
                    <div class="tracklist-item"><span class="track-number">02</span> Breathe</div>
                    <div class="tracklist-item"><span class="track-number">03</span> On the Run</div>
                    <div class="tracklist-item"><span class="track-number">04</span> Time</div>
                    <div class="tracklist-item"><span class="track-number">05</span> The Great Gig in the Sky</div>
                    <div class="tracklist-item"><span class="track-number">06</span> Money</div>
                    <div class="tracklist-item"><span class="track-number">07</span> Us and Them</div>
                    <div class="tracklist-item"><span class="track-number">08</span> Any Colour You Like</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Atualiza os cards de estatísticas mini no topo
 * @param {Array} vinis - Array com todos os vinis
 */
function updateMiniStats(vinis) {
    if (!vinis || vinis.length === 0) return;
    
    // Total
    document.getElementById('total-vinis').textContent = vinis.length;
    
    // Raridades (vinis coloridos ou transparentes)
    const raridades = vinis.filter(v => 
        v.cor_prensagem && (v.cor_prensagem.includes('Colorido') || v.cor_prensagem.includes('Transparente'))
    ).length;
    document.getElementById('total-raridades').textContent = raridades;
    
    // Artistas únicos
    const artistas = new Set(vinis.map(v => v.artista)).size;
    document.getElementById('total-artistas').textContent = artistas;
    
    // Ano mais antigo
    const anos = vinis.map(v => v.ano).filter(Boolean);
    const maisAntigo = anos.length > 0 ? Math.min(...anos) : '----';
    document.getElementById('ano-mais-antigo').textContent = maisAntigo;
}

/**
 * Formata data ISO para exibição
 * @param {string} isoDate - Data em formato ISO
 * @returns {string} Data formatada
 */
function formatDate(isoDate) {
    if (!isoDate) return 'N/A';
    try {
        const date = new Date(isoDate);
        return date.toLocaleDateString('pt-BR');
    } catch {
        return 'N/A';
    }
}

/**
 * Renderiza as estatísticas na página
 * @param {Object} stats - Dados das estatísticas
 */
export function renderStats(stats) {
    const container = document.getElementById('stats-container');

    // HTML para exibir as estatísticas
    let html = '<div class="stats-grid">';

    // Total de vinis
    if (stats.total_vinis !== undefined) {
        html += `
            <div class="stat-card">
                <h4>Total de Vinis</h4>
                <div class="stat-value">${stats.total_vinis}</div>
            </div>
        `;
    }

    // Se houver dados de cores (por_cor do backend)
    if (stats.por_cor && Array.isArray(stats.por_cor)) {
        stats.por_cor.forEach(item => {
            html += `
                <div class="stat-card">
                    <h4>${escapeHTML(item.cor_prensagem)}</h4>
                    <div class="stat-value">${item.quantidade}</div>
                </div>
            `;
        });
    }

    html += '</div>';

    // Adiciona seções adicionais se disponíveis
    if (stats.por_artista && Array.isArray(stats.por_artista) && stats.por_artista.length > 0) {
        html += '<h3 style="margin-top: 2rem; margin-bottom: 1rem;">Por Artista</h3>';
        html += '<div class="stats-grid">';
        stats.por_artista.slice(0, 6).forEach(item => {
            html += `
                <div class="stat-card">
                    <h4>${escapeHTML(item.artista)}</h4>
                    <div class="stat-value">${item.quantidade}</div>
                </div>
            `;
        });
        html += '</div>';
    }

    // Adiciona também a visualização raw
    html += `
        <div class="stats-raw">
            <h3>Dados completos:</h3>
            <pre>${JSON.stringify(stats, null, 2)}</pre>
        </div>
    `;

    container.innerHTML = html;

    // Anima as seções
    animateSections('.stat-card');
}

/**
 * Mostra o modal de comparação
 */
export function showComparacaoModal() {
    const modal = document.getElementById('modal-comparar');
    modal.classList.add('active');
    animateModal('#modal-comparar .modal-content');

    // Limpa os campos
    document.getElementById('vinil-id-a').value = '';
    document.getElementById('vinil-id-b').value = '';
    document.getElementById('comparacao-resultado').style.display = 'none';
}

/**
 * Esconde um modal
 * @param {string} modalId - ID do modal
 */
export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

/**
 * Exibe o resultado da comparação
 * @param {Object} resultado - Resultado da comparação
 */
export function showComparacaoResultado(resultado) {
    const resultadoDiv = document.getElementById('comparacao-resultado');
    const output = document.getElementById('comparacao-output');

    output.textContent = JSON.stringify(resultado, null, 2);
    resultadoDiv.style.display = 'block';

    // Anima o resultado
    gsap.from(resultadoDiv, {
        duration: 0.5,
        opacity: 0,
        y: 20,
        ease: 'power2.out'
    });
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem de erro
 */
export function showError(message) {
    showNotification(message, 'error');
}

/**
 * Mostra mensagem de sucesso
 * @param {string} message - Mensagem de sucesso
 */
export function showSuccess(message) {
    showNotification(message, 'success');
}

/**
 * Mostra notificação temporária
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo da notificação ('success' ou 'error')
 */
function showNotification(message, type = 'info') {
    // Remove notificação anterior se existir
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }

    // Cria elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
        <span class="notification-message">${escapeHTML(message)}</span>
    `;

    // Adiciona ao body
    document.body.appendChild(notification);

    // Anima entrada
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove após 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/**
 * Alterna entre seções (listagem, stats)
 * @param {string} sectionName - Nome da seção ('listagem' ou 'stats')
 */
export function switchSection(sectionName) {
    // Esconde todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active dos botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostra a seção desejada
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }

    // Marca o botão correspondente como ativo
    const btn = document.querySelector(`[data-section="${sectionName}"]`);
    if (btn) {
        btn.classList.add('active');
    }

    // Anima a seção
    animateSections(`#${sectionName}-section`);
}

/**
 * Função auxiliar para escapar HTML e prevenir XSS
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto escapado
 */
function escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Mostra loading na grid
 */
export function showLoading() {
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const grid = document.getElementById('vinis-grid');

    loading.style.display = 'block';
    noResults.style.display = 'none';
    grid.innerHTML = '';
}

/**
 * Mostra loading nas estatísticas
 */
export function showStatsLoading() {
    const container = document.getElementById('stats-container');
    container.innerHTML = '<div class="stats-loading">Carregando estatísticas...</div>';
}
