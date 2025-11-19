/**
 * animations.js - Módulo de animações com GSAP
 * 
 * Este módulo centraliza todas as animações da interface
 * usando a biblioteca GSAP (carregada via CDN).
 */

/**
 * Anima os cards da grid de vinis com efeito stagger
 * Faz os cards aparecerem em sequência
 */
export function animateCards() {
    const cards = document.querySelectorAll('.vinil-card');
    
    gsap.from(cards, {
        duration: 0.6,
        opacity: 0,
        y: 50,
        scale: 0.9,
        stagger: 0.08, // Delay entre cada card
        ease: 'power3.out',
        clearProps: 'all' // Limpa as propriedades após a animação
    });
}

/**
 * Anima a abertura de um modal
 * @param {string} selector - Seletor CSS do modal content
 */
export function animateModal(selector) {
    const modalContent = document.querySelector(selector);
    
    if (!modalContent) return;

    // Anima o overlay
    gsap.fromTo(
        `${selector.split(' ')[0]} .modal-overlay`,
        { opacity: 0 },
        { 
            duration: 0.3,
            opacity: 1,
            ease: 'power2.out'
        }
    );

    // Anima o conteúdo do modal
    gsap.fromTo(
        modalContent,
        { 
            scale: 0.8,
            opacity: 0,
            y: -50
        },
        { 
            duration: 0.4,
            scale: 1,
            opacity: 1,
            y: 0,
            ease: 'back.out(1.5)'
        }
    );
}

/**
 * Anima o fechamento de um modal
 * @param {string} selector - Seletor CSS do modal
 * @param {Function} callback - Função a ser chamada após a animação
 */
export function animateModalClose(selector, callback) {
    const modal = document.querySelector(selector);
    const modalContent = document.querySelector(`${selector} .modal-content`);
    
    if (!modalContent) return;

    // Anima o conteúdo
    gsap.to(modalContent, {
        duration: 0.3,
        scale: 0.8,
        opacity: 0,
        y: -30,
        ease: 'power2.in',
        onComplete: callback
    });

    // Anima o overlay
    gsap.to(`${selector} .modal-overlay`, {
        duration: 0.3,
        opacity: 0,
        ease: 'power2.in'
    });
}

/**
 * Anima seções quando aparecem
 * @param {string} selector - Seletor CSS das seções
 */
export function animateSections(selector) {
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) return;

    gsap.from(elements, {
        duration: 0.6,
        opacity: 0,
        y: 30,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
    });
}

/**
 * Anima o header ao carregar a página
 */
export function animateHeader() {
    const timeline = gsap.timeline();

    timeline
        .from('.header-title', {
            duration: 0.8,
            opacity: 0,
            y: -50,
            ease: 'power3.out'
        })
        .from('.header-subtitle', {
            duration: 0.6,
            opacity: 0,
            y: -30,
            ease: 'power2.out'
        }, '-=0.4');
}

/**
 * Anima a navegação ao carregar a página
 */
export function animateNav() {
    gsap.from('.nav-btn', {
        duration: 0.5,
        opacity: 0,
        y: -20,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.5
    });
}

/**
 * Anima a seção de busca
 */
export function animateSearchSection() {
    gsap.from('.search-section', {
        duration: 0.6,
        opacity: 0,
        y: -30,
        ease: 'power2.out',
        delay: 0.8
    });
}

/**
 * Anima o hover de um card (chamado programaticamente se necessário)
 * @param {HTMLElement} card - Elemento do card
 */
export function animateCardHover(card) {
    gsap.to(card, {
        duration: 0.3,
        y: -10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        ease: 'power2.out'
    });
}

/**
 * Anima a saída do hover de um card
 * @param {HTMLElement} card - Elemento do card
 */
export function animateCardHoverOut(card) {
    gsap.to(card, {
        duration: 0.3,
        y: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ease: 'power2.out'
    });
}

/**
 * Animação de loading - pulso nos elementos
 * @param {string} selector - Seletor CSS do elemento
 */
export function animateLoadingPulse(selector) {
    gsap.to(selector, {
        duration: 1,
        opacity: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
    });
}

/**
 * Para todas as animações de um elemento
 * @param {string} selector - Seletor CSS
 */
export function killAnimations(selector) {
    gsap.killTweensOf(selector);
}

/**
 * Inicializa as animações iniciais da página
 */
export function initPageAnimations() {
    animateHeader();
    animateNav();
    animateSearchSection();
}
