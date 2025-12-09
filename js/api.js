/**
 * api.js - Módulo de comunicação com a API REST
 * 
 * Este módulo centraliza todas as chamadas HTTP para o backend.
 * Usa fetch API nativo do navegador.
 */

// URL base da API (ajuste conforme necessário)
const API_BASE_URL = 'http://localhost:5000';
const API_PREFIX = '/api/v1';

/**
 * Função auxiliar para fazer requisições HTTP
 * @param {string} endpoint - Endpoint da API
 * @param {object} options - Opções do fetch (method, headers, body, etc.)
 * @returns {Promise} Promise com a resposta JSON
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        // Se for 204 No Content, retorna objeto vazio
        if (response.status === 204) {
            return {};
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição para ${endpoint}:`, error);
        throw error;
    }
}

/**
 * GET /vinis/ - Lista todos os vinis
 * @returns {Promise<Array>} Array com todos os vinis
 */
export async function getVinis() {
    return fetchAPI('/vinis/');
}

/**
 * GET /vinis/{id} - Busca um vinil específico por ID
 * @param {number} id - ID do vinil
 * @returns {Promise<Object>} Dados do vinil
 */
export async function getVinilById(id) {
    return fetchAPI(`/vinis/${id}`);
}

/**
 * GET /vinis/search?artista={nome} - Busca vinis por nome do artista
 * @param {string} artista - Nome do artista (ou parte dele)
 * @returns {Promise<Array>} Array com vinis encontrados
 */
export async function buscarPorArtista(artista) {
    // Encode do parâmetro para segurança
    const encodedArtista = encodeURIComponent(artista);
    return fetchAPI(`/vinis/search?artista=${encodedArtista}`);
}

/**
 * GET /vinis/search?album={nome} - Busca vinis por nome do álbum
 * @param {string} album - Nome do álbum (ou parte dele)
 * @returns {Promise<Array>} Array com vinis encontrados
 */
export async function buscarPorAlbum(album) {
    const encodedAlbum = encodeURIComponent(album);
    return fetchAPI(`/vinis/search?album=${encodedAlbum}`);
}

/**
 * Busca vinis por artista OU álbum (busca combinada)
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>} Array com vinis encontrados
 */
export async function buscarVinis(termo) {
    try {
        // Busca por artista e álbum em paralelo
        const [resultadosArtista, resultadosAlbum] = await Promise.all([
            buscarPorArtista(termo).catch(() => []),
            buscarPorAlbum(termo).catch(() => [])
        ]);

        // Combina os resultados e remove duplicatas
        const todosResultados = [...resultadosArtista, ...resultadosAlbum];
        const vinisUnicos = Array.from(
            new Map(todosResultados.map(v => [v.id, v])).values()
        );

        return vinisUnicos;
    } catch (error) {
        console.error('Erro na busca:', error);
        return [];
    }
}

/**
 * GET /stats/ - Busca estatísticas da coleção
 * @returns {Promise<Object>} Objeto com estatísticas
 */
export async function getStatsCores() {
    return fetchAPI('/stats/');
}

/**
 * POST /vinis/ - Adiciona um novo vinil à coleção
 * @param {Object} vinilData - Dados do vinil
 * @param {string} vinilData.artista - Nome do artista
 * @param {string} vinilData.album - Nome do álbum
 * @param {string} vinilData.cor_prensagem - Cor da prensagem
 * @param {number} vinilData.ano - Ano de lançamento
 * @param {string} vinilData.midia - Tipo de mídia (LP, Compacto, EP)
 * @param {string} [vinilData.selo] - Gravadora/Selo (opcional)
 * @returns {Promise<Object>} Vinil criado com ID
 */
export async function adicionarVinil(vinilData) {
    return fetchAPI('/vinis/', {
        method: 'POST',
        body: JSON.stringify(vinilData)
    });
}

/**
 * PUT /vinis/{id} - Atualiza um vinil existente
 * @param {number} id - ID do vinil
 * @param {Object} vinilData - Dados atualizados do vinil
 * @returns {Promise<Object>} Vinil atualizado
 */
export async function atualizarVinil(id, vinilData) {
    return fetchAPI(`/vinis/${id}`, {
        method: 'PUT',
        body: JSON.stringify(vinilData)
    });
}

/**
 * DELETE /vinis/{id} - Remove um vinil da coleção
 * @param {number} id - ID do vinil
 * @returns {Promise<void>}
 */
export async function deletarVinil(id) {
    return fetchAPI(`/vinis/${id}`, {
        method: 'DELETE'
    });
}

/**
 * POST /vinis/compare - Compara duas prensagens de vinil
 * @param {number} idA - ID do primeiro vinil
 * @param {number} idB - ID do segundo vinil
 * @returns {Promise<Object>} Resultado da comparação
 */
export async function compararPrensagens(idA, idB) {
    // Como o backend não tem este endpoint ainda, vamos buscar os dois vinis
    // e fazer a comparação no frontend
    const vinilA = await getVinilById(idA);
    const vinilB = await getVinilById(idB);
    
    return {
        vinil_a: vinilA,
        vinil_b: vinilB,
        diferencas: {
            artista: vinilA.artista !== vinilB.artista,
            album: vinilA.album !== vinilB.album,
            cor_prensagem: vinilA.cor_prensagem !== vinilB.cor_prensagem,
            ano: vinilA.ano !== vinilB.ano,
            selo: vinilA.selo !== vinilB.selo,
            midia: vinilA.midia !== vinilB.midia
        }
    };
}

/**
 * Função auxiliar para verificar se a API está acessível
 * @returns {Promise<boolean>} true se a API estiver respondendo
 */
export async function checkAPIHealth() {
    try {
        await fetch(API_BASE_URL);
        return true;
    } catch (error) {
        console.error('API não está acessível:', error);
        return false;
    }
}
