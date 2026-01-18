/**
 * UI FIXES - v7 ESTABILIDAD TOTAL
 * Soluciona el scroll del modal y asegura la visibilidad de la app.
 */

(function (window) {
    'use strict';

    console.log('⚡ UI Fixes v7 - Estabilizando App...');

    // 1. Inyectamos estilos ULTRA-AGRESIVOS para el scroll
    const style = document.createElement('style');
    style.innerHTML = `
        /* Bloqueo selectivo del fondo */
        body.modal-open { 
            overflow: hidden !important; 
            touch-action: none !important;
        }

        /* Forzar scroll en cualquier tarjeta blanca dentro de un contenedor fijo (modal) */
        div[style*="fixed"] div.bg-white, 
        div.fixed div.bg-white,
        .modal-card,
        [class*="modal"] [class*="card"] {
            max-height: 80vh !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 60px !important;
            display: block !important;
        }

        /* Asegurar que el botón flotante no moleste */
        #btn-editar-flotante {
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: #2563eb;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // 2. Detección simplificada de modales
    function corregirUI() {
        const titulos = ['editar pedido', 'editar cliente', 'nuevo pedido', 'nuevo cliente', 'detalle pedido'];
        let hayModal = false;

        // Buscamos textos de títulos de modal
        document.querySelectorAll('h1, h2, h3, span, strong, div').forEach(el => {
            const txt = (el.innerText || el.textContent || "").trim().toLowerCase();
            if (titulos.includes(txt)) {
                // Si el elemento es visible, marcamos que hay modal
                if (el.offsetParent !== null || window.getComputedStyle(el).display !== 'none') {
                    hayModal = true;
                }
            }
        });

        if (hayModal) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        gestionarMapa();
        detectarCliente();
    }

    function gestionarMapa() {
        const visor = document.getElementById('visor-mapa-myl');
        if (!visor) return;
        const esMapa = window.location.hash.includes('map') || window.location.href.includes('/map');
        visor.style.display = esMapa ? 'block' : 'none';
    }

    function detectarCliente() {
        const btn = document.getElementById('btn-editar-flotante');
        if (!btn) return;
        const titulos = document.querySelectorAll('h1, h2, h3');
        const clientes = JSON.parse(localStorage.getItem('clients') || '[]');
        let encontrado = null;

        for (let el of titulos) {
            const txt = el.textContent.trim().toUpperCase();
            if (txt.length > 3) {
                const match = clientes.find(c => (c.name || "").toUpperCase() === txt);
                if (match) { encontrado = match; break; }
            }
        }
        btn.style.display = encontrado ? 'flex' : 'none';
        if (encontrado) window.clienteEnEdicionGlobal = encontrado;
    }

    // 3. Observer con throttling para no saturar
    let timeout;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(corregirUI, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Botón flotante inicial
    if (!document.getElementById('btn-editar-flotante')) {
        const b = document.createElement('div');
        b.id = 'btn-editar-flotante';
        b.innerHTML = '✏️';
        b.onclick = () => window.abrirEditor ? window.abrirEditor() : null;
        document.body.appendChild(b);
    }

    // Ejecución inicial
    corregirUI();

})(window);
