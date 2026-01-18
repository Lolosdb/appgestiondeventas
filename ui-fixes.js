/**
 * UI FIXES - Correcciones visuales y comportamientos reactivos
 * Reemplaza el bucle infinito setInterval por MutationObserver para mejor rendimiento.
 */

(function (window) {
    'use strict';

    console.log('⚡ UI Fixes cargado (MutationObserver) - v2 AGRESIVA');

    // Estado global de detección
    window.clienteEnEdicionGlobal = null;

    // --- 0. INYECCIÓN DE ESTILOS GLOBALES ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* Bloqueo total del fondo */
        body.modal-open {
            overflow: hidden !important;
            overscroll-behavior: none !important;
            position: fixed !important; /* Fix supremo para iOS */
            width: 100% !important;
            height: 100% !important;
        }

        /* Forzar scroll suave en contenedores */
        .modal-scroll-force {
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important; /* Importante para iOS */
            overscroll-behavior: contain !important;
            max-height: 85vh !important;
            display: block !important;
            pointer-events: auto !important;
        }
    `;
    document.head.appendChild(style);


    // --- 1. CONFIGURACIÓN DEL OBSERVER ---
    const observerConfig = { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] };

    const observer = new MutationObserver((mutations) => {
        let checkScrollHelpers = false;
        let checkMapVisibility = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) checkScrollHelpers = true;
            if (mutation.type === 'attributes') checkMapVisibility = true;
        }

        requestAnimationFrame(() => {
            if (checkScrollHelpers) aplicarCorreccionesUI();
            if (checkMapVisibility) gestionarVisibilidadMapa();

            gestionarBotonReparar();
            detectarClienteEnPantalla();
        });
    });

    // --- 2. FUNCIONES DE CORRECCIÓN ---

    function aplicarCorreccionesUI() {
        // A. SCROLL MODAL EDITAR PEDIDO (DETECCIÓN FLEXIBLE)
        // Buscamos contenedores que parezcan el modal
        const posiblesTitulos = Array.from(document.querySelectorAll('h1, h2, h3, div, span')).filter(el => {
            if (!el.textContent) return false;
            const txt = el.textContent.trim().toLowerCase();
            return txt.includes('editar pedido') || txt.includes('editar cliente');
        });

        // Filtrar solo los que son visibles
        const titulosVisibles = posiblesTitulos.filter(el => el.offsetParent !== null);

        if (titulosVisibles.length > 0) {
            // ACTIVAR BLOQUEO DE FONDO
            if (!document.body.classList.contains('modal-open')) {
                document.body.classList.add('modal-open');
                console.log('🔒 Modal detectado: Scroll de fondo BLOQUEADO');
            }
        } else {
            // DESACTIVAR BLOQUEO si no hay modal (y no está el mapa)
            const visorMap = document.getElementById('visor-mapa-myl');
            const mapaVisible = visorMap && visorMap.style.display !== 'none';

            if (!mapaVisible && document.body.classList.contains('modal-open')) {
                document.body.classList.remove('modal-open');
                // Limpiar styles inline por si acaso quedaron
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('position');
                console.log('🔓 Modal cerrado: Scroll restaurado');
            }
        }

        titulosVisibles.forEach(el => {
            // 1. BUSCAR EL WRAPPER (EL CONTENEDOR OSCURO/FIXED)
            // Buscamos hacia arriba un padre que tenga position fixed o absolute y cubra la pantalla
            let wrapper = el.parentElement;
            let foundWrapper = null;

            while (wrapper && wrapper.tagName !== 'BODY') {
                const s = window.getComputedStyle(wrapper);
                if (s.position === 'fixed' || s.position === 'absolute' || parseInt(s.zIndex) > 100) {
                    // Candidato a wrapper
                    foundWrapper = wrapper;
                }
                // Si encontramos la tarjeta blanca en el camino, la marcamos
                if (s.backgroundColor === 'rgb(255, 255, 255)' || s.backgroundColor === '#ffffff' || s.backgroundColor === 'white') {
                    if (!wrapper.classList.contains('modal-scroll-force')) {
                        wrapper.classList.add('modal-scroll-force'); // Aplicar clase CSS fuerza bruta
                        // Asegurar padding para que el botón de guardar se vea
                        wrapper.style.setProperty('padding-bottom', '100px', 'important');
                    }
                }
                wrapper = wrapper.parentElement;
            }

            // Si encontramos un wrapper padre (el overlay oscuro), aseguramos que ocupe todo
            if (foundWrapper) {
                foundWrapper.style.setProperty('height', '100%', 'important');
                foundWrapper.style.setProperty('overflow-y', 'auto', 'important'); // El overlay debe scrollear
                foundWrapper.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
            }
        });

        // B. OCULTAR ELEMENTOS INNECESARIOS
        document.querySelectorAll('div,p,span').forEach(e => {
            if (e.textContent && e.textContent.includes('Mejorando precisión') && e.style.display !== 'none') {
                e.style.display = 'none';
            }
        });

        // C. Z-INDEX FIX
        document.querySelectorAll('div').forEach(d => {
            if (d.style.position === 'fixed' && d.style.bottom === '0px' && d.style.zIndex !== "9999") {
                const r = d.getBoundingClientRect();
                if (r.bottom >= window.innerHeight) {
                    d.style.zIndex = "9999";
                    d.querySelectorAll('svg, img').forEach(i => i.style.filter = 'brightness(0) invert(1)');
                }
            }
        });
    }

    function gestionarVisibilidadMapa() {
        let mapaActivo = false;
        if (window.location.href.includes('/map')) mapaActivo = true;

        document.querySelectorAll('a, div, span, p').forEach(el => {
            const txt = el.textContent ? el.textContent.trim().toLowerCase() : '';
            if (txt === 'mapa' || txt === 'map') {
                const style = window.getComputedStyle(el);
                if (el.className.includes('active') || style.color === 'rgb(255, 255, 255)' || style.color === 'rgb(37, 99, 235)') {
                    mapaActivo = true;
                }
            }
        });

        const visorMyl = document.getElementById('visor-mapa-myl');
        const visorOld = document.getElementById('visor-mapa');

        if (mapaActivo) {
            if (!document.body.classList.contains('modal-open')) document.body.classList.add('modal-open'); // Bloquear scroll body tb

            if (visorMyl && visorMyl.style.display !== 'block') {
                visorMyl.style.display = 'block';
                if (window.initMap) window.initMap();
            } else if (visorOld && (!visorMyl || visorMyl.style.display === 'none')) {
                visorOld.style.display = 'block';
            }
        } else {
            // Solo desbloquear si no hay modal de edición abierto
            const titulos = Array.from(document.querySelectorAll('h1, h2, h3')).filter(el =>
                el.textContent && (el.textContent.includes('Editar Pedido') || el.textContent.includes('Editar Cliente'))
            );
            if (titulos.length === 0 && document.body.classList.contains('modal-open')) {
                document.body.classList.remove('modal-open');
            }

            if (visorMyl && visorMyl.style.display !== 'none') visorMyl.style.display = 'none';
            if (visorOld && visorOld.style.display !== 'none') visorOld.style.display = 'none';
        }
    }

    function gestionarBotonReparar() {
        const botonesTexto = document.querySelectorAll('div, button, label, span');
        let botonOriginal = null;
        for (const el of botonesTexto) {
            if (el.textContent && el.textContent.trim() === "Seleccionar Archivo" && el.offsetParent !== null) {
                botonOriginal = el;
                break;
            }
        }
        if (botonOriginal) {
            let contenedor = botonOriginal.parentElement;
            let depth = 0;
            while (contenedor && contenedor.tagName !== 'DIV' && !contenedor.className.includes('card') && depth < 3) {
                contenedor = contenedor.parentElement;
                depth++;
            }
            if (!contenedor) contenedor = botonOriginal.parentElement.parentElement;

            if (contenedor && !document.getElementById('btn-reparar-inyectado')) {
                const btn = document.createElement('div');
                btn.id = 'btn-reparar-inyectado';
                btn.innerHTML = '🛠️ REPARAR FICHA BLANCA';
                btn.style.cssText = "width:100%; padding:12px; margin-top:15px; border-radius:8px; cursor:pointer; font-weight:bold; background:#f97316; color:white; text-align:center;";
                btn.onclick = function () {
                    if (window.repararBaseDatos) window.repararBaseDatos();
                    else alert("Módulo Data Manager no cargado");
                };
                contenedor.appendChild(btn);
            }
        }
    }

    function detectarClienteEnPantalla() {
        const btn = document.getElementById('btn-editar-flotante');
        if (!btn) return;
        const visor = document.getElementById('visor-mapa-myl');
        if (visor && visor.style.display === 'block') {
            btn.style.display = 'none';
            return;
        }

        const titulos = document.querySelectorAll('h1, h2, h3, div[class*="title"], span[class*="title"]');
        const clientes = JSON.parse(localStorage.getItem('clients') || '[]');

        let encontrado = null;
        for (let el of titulos) {
            const texto = el.textContent ? el.textContent.trim().toUpperCase() : "";
            if (texto.length > 3) {
                const match = clientes.find(c => (c.name || "").toUpperCase() === texto);
                if (match) { encontrado = match; break; }
            }
        }

        if (encontrado) {
            btn.style.display = 'flex';
            window.clienteEnEdicionGlobal = encontrado;
        } else {
            btn.style.display = 'none';
            window.clienteEnEdicionGlobal = null;
        }
    }

    // --- 3. INICIALIZACIÓN ---
    observer.observe(document.body, observerConfig);

    if (!document.getElementById('btn-editar-flotante')) {
        const btn = document.createElement('div');
        btn.id = 'btn-editar-flotante';
        btn.innerHTML = '✏️';
        btn.onclick = () => { if (window.abrirEditor) window.abrirEditor(); };
        document.body.appendChild(btn);
    }

})(window);
