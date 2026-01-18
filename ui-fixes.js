/**
 * UI FIXES - v8 MARTILLO JS (SOLUCIÓN DEFINITIVA)
 * Fuerza bruta para el scroll del modal, ignorando Tailwind.
 */

(function (window) {
    'use strict';

    console.log('⚡ UI Fixes v8 - Aplicando Martillo JS...');

    // 1. Estilos de respaldo (por si acaso el JS tarda)
    const style = document.createElement('style');
    style.innerHTML = `
        body.modal-open { overflow: hidden !important; touch-action: none !important; }
        /* Forzamos visibilidad del botón flotante */
        #btn-edit-float {
            position: fixed; bottom: 80px; right: 20px;
            width: 56px; height: 56px; border-radius: 50%;
            background: #2563eb; color: white;
            display: none; align-items: center; justify-content: center;
            font-size: 24px; z-index: 10000; cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);

    // 2. FUNCIÓN PRINCIPAL: FUERZA BRUTA A LOS ESTILOS
    function forzarScrollModal() {
        // Buscamos cualquier contenedor fijo que parezca un modal
        const posiblesModales = document.querySelectorAll('div[class*="fixed"], div[style*="fixed"]');

        posiblesModales.forEach(modal => {
            // Descartamos si no es visible
            if (window.getComputedStyle(modal).display === 'none') return;
            if (modal.id === 'btn-edit-float') return; // Ignorar nuestro botón

            // Buscamos la TARJETA del contenido (blanca o gris clara)
            // Esta es la clave: el modal tiene un fondo oscuro, y dentro hay una tarjeta clara.
            const tarjeta = modal.querySelector('div[class*="bg-white"], div[class*="bg-slate-50"]');

            if (tarjeta) {
                // ¡LA ENCONTRAMOS! APLICAR MARTILLO

                // 1. Restringir altura de la tarjeta para que quepa en pantalla
                tarjeta.style.setProperty('max-height', '85vh', 'important');
                tarjeta.style.setProperty('height', 'auto', 'important');
                tarjeta.style.setProperty('display', 'flex', 'important');
                tarjeta.style.setProperty('flex-direction', 'column', 'important');
                tarjeta.style.setProperty('overflow', 'hidden', 'important'); // El scroll va DENTRO

                // 2. Buscar el contenedor SCROLLABLE dentro de la tarjeta
                // Normalmente es el que tiene más texto o inputs
                const scrollable = Array.from(tarjeta.children).find(child => {
                    const h = window.getComputedStyle(child).height;
                    return child.querySelectorAll('input, select, p').length > 0;
                });

                if (scrollable) {
                    scrollable.style.setProperty('overflow-y', 'auto', 'important');
                    scrollable.style.setProperty('flex', '1', 'important'); // Ocupar espacio disponible
                    scrollable.style.setProperty('max-height', 'none', 'important'); // Quitar límites internos
                }

                // 3. Bloquear scroll del body
                document.body.classList.add('modal-open');

                // Marcamos como procesado para debug
                if (!tarjeta.dataset.fixed) {
                    console.log('🔨 Martillo JS aplicado a modal:', tarjeta);
                    tarjeta.dataset.fixed = "true";
                }
            }
        });

        // Si no detectamos modal activo, liberamos body
        const hayModal = document.querySelector('.modal-open');
        if (!posiblesModales.length && hayModal) {
            document.body.classList.remove('modal-open');
        }

        gestionarMapa();
        detectarCliente();
    }

    // --- UTILIDADES ---
    function gestionarMapa() {
        const visor = document.getElementById('visor-mapa-myl');
        if (visor) {
            const esMapa = window.location.href.includes('/map');
            visor.style.display = esMapa ? 'block' : 'none';
        }
    }

    function detectarCliente() {
        const btn = document.getElementById('btn-edit-float');
        if (!btn) return;

        // Lógica simple: si hay un H1/H2 con nombre de cliente conocido, mostramos botón
        const titulos = Array.from(document.querySelectorAll('h1, h2, h3'));
        const clientes = JSON.parse(localStorage.getItem('clients') || '[]');
        const posibleNombre = titulos.find(t => {
            const txt = t.textContent.trim();
            return txt.length > 4 && clientes.some(c => c.name === txt);
        });

        if (posibleNombre && !document.querySelector('.modal-open')) {
            const cliente = clientes.find(c => c.name === posibleNombre.textContent.trim());
            btn.style.display = 'flex';
            btn.onclick = () => window.abrirEditor && window.abrirEditor(cliente);
        } else {
            btn.style.display = 'none';
        }
    }

    // 3. OBSERVER: Ejecutar constantemente pero eficiente
    let tick;
    const observer = new MutationObserver(() => {
        if (tick) return;
        tick = requestAnimationFrame(() => {
            forzarScrollModal();
            tick = null;
        });
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Botón flotante
    if (!document.getElementById('btn-edit-float')) {
        const b = document.createElement('div');
        b.id = 'btn-edit-float';
        b.innerHTML = '✏️';
        document.body.appendChild(b);
    }

    // Ejecución inicial
    forzarScrollModal();

})(window);
