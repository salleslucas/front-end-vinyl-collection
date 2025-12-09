/**
 * main.js - Arquivo principal da aplicação
 * 
 * Este módulo inicializa a aplicação, configura event listeners
 * e orquestra a comunicação entre os demais módulos.
 */

import * as api from './api.js';
import * as ui from './ui.js';
import { initPageAnimations } from './animations.js';

// Estado da aplicação
const appState = {
    currentVinis: [],
    isSearching: false,
    currentSection: 'listagem'
};

/**
 * Inicializa a aplicação
 */
async function init() {
    console.log('🎵 Inicializando Biblioteca de Vinis...');

    // Anima elementos iniciais
    initPageAnimations();

    // Configura event listeners
    setupEventListeners();

    // Carrega os vinis iniciais
    await loadVinis();

    console.log('✅ Aplicação inicializada com sucesso!');
}

/**
 * Carrega todos os vinis da API
 */
async function loadVinis() {
    try {
        ui.showLoading();
        const vinis = await api.getVinis();
        appState.currentVinis = vinis;
        ui.renderVinisGrid(vinis);
    } catch (error) {
        console.error('Erro ao carregar vinis:', error);
        ui.showError('Não foi possível carregar os vinis. Verifique se a API está rodando.');
        document.getElementById('loading').style.display = 'none';
    }
}

/**
 * Busca vinis por artista ou álbum
 * @param {string} termo - Termo de busca
 */
async function buscarVinis(termo) {
    // Se o termo for muito curto, volta para a listagem completa
    if (termo.length < 2) {
        await loadVinis();
        appState.isSearching = false;
        return;
    }

    try {
        ui.showLoading();
        appState.isSearching = true;
        const vinis = await api.buscarVinis(termo);
        appState.currentVinis = vinis;
        ui.renderVinisGrid(vinis);
    } catch (error) {
        console.error('Erro ao buscar vinis:', error);
        ui.showError('Erro ao realizar a busca.');
        document.getElementById('loading').style.display = 'none';
    }
}

/**
 * Carrega as estatísticas
 */
async function loadStats() {
    try {
        ui.showStatsLoading();
        const stats = await api.getStatsCores();
        ui.renderStats(stats);
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        ui.showError('Não foi possível carregar as estatísticas.');
    }
}

/**
 * Realiza a comparação de prensagens
 */
async function compararPrensagens() {
    const idA = parseInt(document.getElementById('vinil-id-a').value);
    const idB = parseInt(document.getElementById('vinil-id-b').value);

    // Validações
    if (!idA || !idB) {
        ui.showError('Por favor, preencha ambos os IDs.');
        return;
    }

    if (idA === idB) {
        ui.showError('Os IDs devem ser diferentes.');
        return;
    }

    try {
        const resultado = await api.compararPrensagens(idA, idB);
        ui.showComparacaoResultado(resultado);
    } catch (error) {
        console.error('Erro ao comparar prensagens:', error);
        ui.showError(`Erro ao comparar: ${error.message}`);
    }
}

/**
 * Processa o submit do formulário de adicionar/editar vinil
 */
async function handleFormSubmit() {
    const form = document.getElementById('form-vinil');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Verifica se é edição ou criação
    const editId = form.dataset.editId;
    const isEdit = !!editId;

    try {
        // Desabilita o botão durante o envio
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> Salvando...';

        // Coleta os dados do formulário
        const vinilData = {
            artista: document.getElementById('form-artista').value.trim(),
            album: document.getElementById('form-album').value.trim(),
            cor_prensagem: document.getElementById('form-cor').value,
            ano: parseInt(document.getElementById('form-ano').value),
            midia: document.getElementById('form-midia').value,
            selo: document.getElementById('form-selo').value.trim() || null
        };

        // Adiciona imagem se houver
        const imageData = getImageData();
        if (imageData) {
            vinilData.capa = imageData;
        }

        // Validações adicionais
        if (!vinilData.artista || !vinilData.album || !vinilData.cor_prensagem || !vinilData.ano || !vinilData.midia) {
            ui.showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (vinilData.ano < 1900 || vinilData.ano > 2025) {
            ui.showError('Ano deve estar entre 1900 e 2025.');
            return;
        }

        console.log(`📤 ${isEdit ? 'Atualizando' : 'Enviando'} vinil para a API:`, vinilData);

        // Envia para a API (POST ou PUT)
        let resultado;
        if (isEdit) {
            resultado = await api.atualizarVinil(editId, vinilData);
            console.log('✅ Vinil atualizado com sucesso:', resultado);
        } else {
            resultado = await api.adicionarVinil(vinilData);
            console.log('✅ Vinil adicionado com sucesso:', resultado);
        }

        // Fecha o modal
        ui.hideModal('modal-form');

        // Mostra mensagem de sucesso
        const mensagem = isEdit 
            ? `Vinil "${resultado.album}" atualizado com sucesso!`
            : `Vinil "${resultado.album}" adicionado com sucesso!`;
        ui.showSuccess(mensagem);

        // Recarrega a listagem
        await loadVinis();

        // Limpa o formulário e preview
        form.reset();
        delete form.dataset.editId;
        clearImagePreview();

    } catch (error) {
        console.error('❌ Erro ao adicionar vinil:', error);
        ui.showError(`Erro ao adicionar vinil: ${error.message}`);
    } finally {
        // Reabilita o botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/**
 * Deleta um vinil da coleção
 * @param {number} id - ID do vinil a ser deletado
 */
async function handleDeleteVinil(id) {
    try {
        // Solicita confirmação
        const confirmacao = confirm('Tem certeza que deseja deletar este vinil da sua coleção? Esta ação não pode ser desfeita.');
        
        if (!confirmacao) {
            return;
        }

        console.log(`🗑️ Deletando vinil ID: ${id}`);

        // Chama a API de deleção
        await api.deletarVinil(id);

        console.log('✅ Vinil deletado com sucesso');

        // Fecha o modal de detalhes
        ui.hideModal('modal-detalhes');

        // Mostra mensagem de sucesso
        ui.showSuccess('Vinil deletado com sucesso da sua coleção!');

        // Recarrega a listagem
        await loadVinis();

    } catch (error) {
        console.error('❌ Erro ao deletar vinil:', error);
        ui.showError(`Erro ao deletar vinil: ${error.message}`);
    }
}

/**
 * Abre o modal de formulário em modo de edição
 * @param {number} id - ID do vinil a ser editado
 */
async function handleEditVinil(id) {
    try {
        console.log(`✏️ Editando vinil ID: ${id}`);

        // Busca os dados do vinil
        const vinil = await api.getVinilById(id);

        // Fecha o modal de detalhes
        ui.hideModal('modal-detalhes');

        // Abre o modal de formulário
        const modal = document.getElementById('modal-form');
        const title = document.getElementById('modal-form-title');
        const form = document.getElementById('form-vinil');

        // Muda o título
        title.textContent = '✏️ Editar Vinil';

        // Preenche os campos do formulário
        document.getElementById('form-artista').value = vinil.artista;
        document.getElementById('form-album').value = vinil.album;
        document.getElementById('form-cor').value = vinil.cor_prensagem;
        document.getElementById('form-ano').value = vinil.ano;
        document.getElementById('form-selo').value = vinil.selo || '';
        document.getElementById('form-midia').value = vinil.midia;

        // Armazena o ID no formulário para saber que é edição
        form.dataset.editId = id;

        // Se houver imagem, mostra o preview
        if (vinil.capa) {
            const preview = document.getElementById('preview-img');
            const btnRemove = document.getElementById('btn-remove-image');
            const placeholder = document.querySelector('.preview-placeholder');

            let imgUrl = vinil.capa;
            if (vinil.capa.startsWith('/uploads')) {
                imgUrl = `http://localhost:5000${vinil.capa}`;
            }

            preview.src = imgUrl;
            preview.style.display = 'block';
            btnRemove.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }

        // Abre o modal
        modal.classList.add('active');

    } catch (error) {
        console.error('❌ Erro ao carregar vinil para edição:', error);
        ui.showError(`Erro ao carregar vinil: ${error.message}`);
    }
}

/**
 * Configura o sistema de upload de imagem
 */
function setupImageUpload() {
    const fileInput = document.getElementById('form-capa');
    const btnSelect = document.getElementById('btn-select-image');
    const btnRemove = document.getElementById('btn-remove-image');
    const preview = document.getElementById('preview-img');

    // Botão selecionar abre o file input
    btnSelect?.addEventListener('click', () => {
        fileInput?.click();
    });

    // Quando arquivo é selecionado
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Valida tamanho (máx 5MB)
            if (file.size > 5 * 1024 * 1024) {
                ui.showError('Imagem muito grande! Máximo 5MB.');
                fileInput.value = '';
                return;
            }

            // Valida tipo
            if (!file.type.startsWith('image/')) {
                ui.showError('Formato inválido! Use JPG, PNG, GIF ou WEBP.');
                fileInput.value = '';
                return;
            }

            // Mostra preview
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.src = event.target.result;
                preview.style.display = 'block';
                btnRemove.style.display = 'block';
                document.querySelector('.preview-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Botão remover
    btnRemove?.addEventListener('click', () => {
        clearImagePreview();
    });
}

/**
 * Limpa o preview de imagem
 */
function clearImagePreview() {
    const fileInput = document.getElementById('form-capa');
    const preview = document.getElementById('preview-img');
    const btnRemove = document.getElementById('btn-remove-image');

    if (fileInput) fileInput.value = '';
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (btnRemove) btnRemove.style.display = 'none';
    
    const placeholder = document.querySelector('.preview-placeholder');
    if (placeholder) placeholder.style.display = 'block';
}

/**
 * Obtém os dados da imagem em base64
 * @returns {string|null} String base64 da imagem ou null
 */
function getImageData() {
    const preview = document.getElementById('preview-img');
    if (preview && preview.src && preview.style.display !== 'none') {
        return preview.src; // Retorna o data URL (base64)
    }
    return null;
}

/**
 * Configura todos os event listeners da aplicação
 */
function setupEventListeners() {
    // Botão adicionar vinil
    document.getElementById('btn-adicionar')?.addEventListener('click', () => {
        const modal = document.getElementById('modal-form');
        const title = document.getElementById('modal-form-title');
        const form = document.getElementById('form-vinil');
        
        if (modal) {
            // Reseta o título para modo de criação
            title.textContent = '➕ Adicionar Novo Vinil';
            
            // Limpa o formulário e preview de imagem
            form?.reset();
            clearImagePreview();
            
            // Remove o ID de edição se existir
            delete form.dataset.editId;
            
            modal.classList.add('active');
        }
    });

    // Upload de imagem
    setupImageUpload();

    // Formulário de adicionar vinil
    document.getElementById('form-vinil')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleFormSubmit();
    });

    // Botão cancelar formulário
    document.getElementById('btn-cancel-form')?.addEventListener('click', () => {
        ui.hideModal('modal-form');
    });

    // Modal formulário - fechar
    document.getElementById('modal-form-close-btn')?.addEventListener('click', () => {
        ui.hideModal('modal-form');
    });

    // Modal formulário - overlay
    document.querySelector('#modal-form .modal-overlay')?.addEventListener('click', () => {
        ui.hideModal('modal-form');
    });

    // Botão de estatísticas
    document.getElementById('btn-stats')?.addEventListener('click', () => {
        loadStats();
        const modal = document.getElementById('modal-stats');
        if (modal) {
            modal.classList.add('active');
            animateModal('#modal-stats .modal-content');
        }
    });

    // Busca de vinis
    const searchInput = document.getElementById('search-input');
    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const termo = e.target.value.trim();

            // Debounce de 500ms
            searchTimeout = setTimeout(() => {
                if (termo.length >= 2) {
                    buscarVinis(termo);
                } else {
                    loadVinis();
                }
            }, 500);
        });
    }

    // Filtro de cor
    const filterCor = document.getElementById('filter-cor');
    if (filterCor) {
        // Popula as opções de cores disponíveis
        populateColorFilter();
        
        filterCor.addEventListener('change', () => {
            applyFilters();
        });
    }

    // Filtro de mídia
    const filterMidia = document.getElementById('filter-midia');
    if (filterMidia) {
        filterMidia.addEventListener('change', () => {
            applyFilters();
        });
    }

    // Modal stats - fechar
    document.getElementById('modal-stats-close-btn')?.addEventListener('click', () => {
        ui.hideModal('modal-stats');
    });

    // Modal stats - overlay
    document.querySelector('#modal-stats .modal-overlay')?.addEventListener('click', () => {
        ui.hideModal('modal-stats');
    });

    // Modal de detalhes - fechar
    document.getElementById('modal-detalhes-close-btn')?.addEventListener('click', () => {
        ui.hideModal('modal-detalhes');
    });

    // Modal de detalhes - overlay
    document.querySelector('#modal-detalhes .modal-overlay')?.addEventListener('click', () => {
        ui.hideModal('modal-detalhes');
    });

    // Event delegation para botão deletar (criado dinamicamente)
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.btn-delete-vinil')) {
            const btn = e.target.closest('.btn-delete-vinil');
            const vinilId = parseInt(btn.dataset.vinilId);
            if (vinilId) {
                await handleDeleteVinil(vinilId);
            }
        }
        
        // Event delegation para botão editar (criado dinamicamente)
        if (e.target.closest('.btn-edit-vinil')) {
            const btn = e.target.closest('.btn-edit-vinil');
            const vinilId = parseInt(btn.dataset.vinilId);
            if (vinilId) {
                await handleEditVinil(vinilId);
            }
        }
    });

    // Tecla ESC para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ui.hideModal('modal-detalhes');
            ui.hideModal('modal-stats');
            ui.hideModal('modal-form');
        }
    });
}

/**
 * Popula o select de filtro de cores
 */
async function populateColorFilter() {
    try {
        const stats = await api.getStatsCores();
        const select = document.getElementById('filter-cor');
        
        if (stats.por_cor && select) {
            stats.por_cor.forEach(item => {
                const option = document.createElement('option');
                option.value = item.cor_prensagem;
                option.textContent = `${item.cor_prensagem} (${item.quantidade})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar cores:', error);
    }
}

/**
 * Aplica filtros combinados
 */
async function applyFilters() {
    const cor = document.getElementById('filter-cor')?.value;
    const midia = document.getElementById('filter-midia')?.value;
    
    try {
        ui.showLoading();
        let vinis = appState.currentVinis;
        
        // Se não temos vinis carregados, carrega todos
        if (!vinis || vinis.length === 0) {
            vinis = await api.getVinis();
            appState.currentVinis = vinis;
        }
        
        // Aplica filtros
        let filtered = vinis;
        
        if (cor) {
            filtered = filtered.filter(v => v.cor_prensagem === cor);
        }
        
        if (midia) {
            filtered = filtered.filter(v => v.midia === midia);
        }
        
        ui.renderVinisGrid(filtered);
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        ui.showError('Erro ao aplicar filtros.');
    }
}

/**
 * Tratamento de erros globais
 */
window.addEventListener('error', (event) => {
    console.error('Erro global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejection não tratada:', event.reason);
});

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exporta funções úteis para debugging no console
window.VinilApp = {
    loadVinis,
    loadStats,
    buscarVinis,
    compararPrensagens,
    api,
    ui,
    state: appState
};
