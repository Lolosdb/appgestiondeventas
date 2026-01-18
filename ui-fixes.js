/**
 * UI FIXES - v8 SCROLL FIX
 * Soluciona el scroll del modal y habilita el scroll en las vistas principales (Dash, Pedidos, Clientes).
 */

(function (window) {
    'use strict';

    console.log('⚡ UI Fixes v8 - Habilitando scroll en vistas principales...');

    // 1. Inyectamos estilos ULTRA-AGRESIVOS para el scroll
    const style = document.createElement('style');
    style.innerHTML = `
        /* Bloqueo selectivo del fondo */
        body.modal-open { 
            overflow: hidden !important; 
            touch-action: none !important;
        }

        /* HABILITAR SCROLL EN VISTAS PRINCIPALES */
        /* Asegurar que el body tenga scroll cuando sea necesario */
        body {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            position: relative !important;
        }

        /* Contenedor principal de la aplicación */
        #root {
            min-height: 100vh !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
        }

        /* Contenedores principales de las vistas que necesitan scroll */
        #root > div:not([class*="fixed"]):not([style*="fixed"]),
        #root > div > div:not([class*="fixed"]):not([style*="fixed"]) {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
        }

        /* Áreas de contenido blanco que necesitan scroll */
        div.bg-white:not([class*="fixed"]):not([style*="fixed"]):not([style*="absolute"]),
        div[class*="bg-slate-50"]:not([class*="fixed"]):not([style*="fixed"]):not([style*="absolute"]) {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
        }

        /* Forzar scroll en cualquier tarjeta blanca o gris claro (slate-50) dentro de fixed */
        div[style*="fixed"] div.bg-white, 
        div.fixed div.bg-white,
        div.fixed div[class*="bg-slate-50"],
        .modal-card,
        [class*="modal"] [class*="card"] {
            max-height: 90vh !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 0px !important; /* El padding lo maneja el footer */
            display: flex !important; /* Importante para que el footer no flote mal */
            flex-direction: column !important;
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

    // 2. Función para habilitar scroll en contenedores principales
    function habilitarScrollVistas() {
        // Buscar contenedores principales que necesitan scroll
        const root = document.getElementById('root');
        if (!root) return;

        // Buscar todos los contenedores que podrían necesitar scroll
        const contenedores = root.querySelectorAll('div');
        
        contenedores.forEach(cont => {
            const style = window.getComputedStyle(cont);
            const tieneBgBlanco = cont.classList.contains('bg-white') || 
                                 cont.classList.contains('bg-slate-50') ||
                                 style.backgroundColor.includes('255') ||
                                 style.backgroundColor.includes('rgb(255');
            
            const esFixed = style.position === 'fixed' || style.position === 'absolute';
            const tieneOverflowHidden = style.overflow === 'hidden' || style.overflowY === 'hidden';
            
            // Si es un contenedor de contenido principal (no fixed/absolute) y tiene overflow hidden
            if (tieneBgBlanco && !esFixed && tieneOverflowHidden) {
                cont.style.overflowY = 'auto';
                cont.style.overflowX = 'hidden';
                cont.style.webkitOverflowScrolling = 'touch';
            }
        });

        // Asegurar que el body tenga scroll habilitado
        if (document.body.style.overflowY === 'hidden') {
            document.body.style.overflowY = 'auto';
        }
    }

    // 3. Detección simplificada de modales
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

        // Habilitar scroll en vistas principales
        habilitarScrollVistas();
        
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

    // 4. Observer con throttling para no saturar
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
