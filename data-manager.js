/**
 * DATA MANAGER (Gestor de Datos) - v2
 * Maneja la persistencia de datos (localStorage), importación/exportación de Excel,
 * y lógica del formulario de edición.
 */

(function (window) {
    'use strict';

    console.log('💾 Data Manager cargado - v2 (Normalización Integrada)');

    // AUTO-REPARACIÓN INMEDIATA (Para evitar crasheos de la app)
    repararBaseDatos(true);

    // EXPORTAR FUNCIONES GLOBALES
    window.cargarExcel = cargarExcel;
    window.repararBaseDatos = repararBaseDatos;
    window.borrarDatos = borrarDatos;
    window.guardarEdicion = guardarEdicion;
    window.capturarGPSPropio = capturarGPSPropio;
    window.abrirEditor = abrirEditor;
    window.cerrarEditor = cerrarEditor;

    // Asegurar que 'clients' y 'orders' estén disponibles globalmente para el Dash
    window.clients = JSON.parse(localStorage.getItem('clients') || '[]');
    window.orders = JSON.parse(localStorage.getItem('orders') || '[]');

    let clienteEnEdicion = null;

    // --- IMPORTACIÓN DE EXCEL CON NORMALIZACIÓN (Solución "Ficha Blanca") ---
    function cargarExcel(input) {
        const file = input.files[0];
        if (!file) return;

        const nombresPermitidos = [
            'Clientes.xls', 'Clientes.xlsx',
            'Clientes_CON_COORDENADAS.xls', 'Clientes_CON_COORDENADAS.xlsx'
        ];

        if (!nombresPermitidos.includes(file.name)) {
            alert(`⚠️ Archivo no permitido: "${file.name}"\n\nUsa: Clientes o Clientes_CON_COORDENADAS (.xls/.xlsx)`);
            input.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const bstr = e.target.result;
                const wb = XLSX.read(new Uint8Array(bstr), { type: 'array' });
                const sheetData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });

                const nuevos = [];
                const safe = (val) => (val === undefined || val === null) ? "" : String(val).trim();
                const cleanCoord = (val) => {
                    if (!val) return 0;
                    return parseFloat(String(val).replace(',', '.')) || 0;
                };

                for (let i = 1; i < sheetData.length; i++) {
                    const row = sheetData[i];
                    if (!row || row.length === 0) continue;

                    const nombreReal = safe(row[1]);
                    if (!nombreReal && !safe(row[0])) continue;

                    const obj = {
                        id: safe(row[0]) || String(Math.floor(Math.random() * 1000000)),
                        name: nombreReal || "Sin Nombre",
                        cif: safe(row[2]),
                        email: safe(row[3]),
                        address: safe(row[4]),
                        contact: safe(row[5]),
                        city: safe(row[6]),
                        province: safe(row[7]),
                        phone: safe(row[10]),
                        lat: cleanCoord(row[21]),
                        lon: cleanCoord(row[22]),
                        // ESPEJOS (Evitan la pantalla en negro)
                        nombre: nombreReal,
                        tienda: nombreReal,
                        cliente: nombreReal,
                        correo: safe(row[3]),
                        direccion: safe(row[4]),
                        contacto: safe(row[5]),
                        poblacion: safe(row[6]),
                        provincia: safe(row[7]),
                        telefono: safe(row[10]),
                        movil: safe(row[10]),
                        notes: ""
                    };
                    nuevos.push(obj);
                }

                if (nuevos.length > 0) {
                    localStorage.setItem('clients', JSON.stringify(nuevos));
                    alert(`✅ ¡IMPORTACIÓN EXITOSA Y LIMPIA!\n\nSe han procesado ${nuevos.length} clientes.\nLos datos están listos, ya no necesitas el botón Reparar.`);
                    location.reload();
                } else {
                    alert("⚠️ No se encontraron clientes válidos.");
                }
            } catch (error) {
                alert("❌ Error al procesar el Excel.");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // Mantenemos estas funciones por si se necesitan internamente
    function repararBaseDatos(silencioso = false) {
        try {
            const data = localStorage.getItem('clients');
            if (!data) return;

            let rawClients = JSON.parse(data);
            if (!Array.isArray(rawClients)) return;

            let huboCambios = false;
            const safe = (val) => (val === undefined || val === null) ? "" : String(val).trim();

            // 1. FILTRADO Y LIMPIEZA INICIAL
            let clients = rawClients.filter(c => c && typeof c === 'object');
            if (clients.length !== rawClients.length) huboCambios = true;

            // 2. NORMALIZACIÓN DE CADA CLIENTE
            clients = clients.map(c => {
                const nombreReal = safe(c.name || c.nombre || c.tienda || c.cliente);

                // Si no tiene nombre ni ID, es un dato basura
                if (!nombreReal && !c.id) return null;

                const camposEspejo = ['nombre', 'tienda', 'cliente', 'poblacion', 'provincia', 'direccion', 'telefono', 'movil', 'contacto', 'correo'];
                const faltaCampo = camposEspejo.some(f => c[f] === undefined || c[f] === null || c[f] === "");

                if (faltaCampo || !c.name || !c.id) {
                    huboCambios = true;
                    const idSeguro = c.id || String(Math.floor(Math.random() * 1000000));
                    const n = nombreReal || "Cliente sin nombre";

                    return {
                        ...c,
                        id: idSeguro,
                        name: n,
                        nombre: n,
                        tienda: n,
                        cliente: n,
                        city: safe(c.city || c.poblacion || c.localidad),
                        poblacion: safe(c.city || c.poblacion || c.localidad),
                        province: safe(c.province || c.provincia),
                        provincia: safe(c.province || c.provincia),
                        address: safe(c.address || c.direccion),
                        direccion: safe(c.address || c.direccion),
                        phone: safe(c.phone || c.telefono || c.movil),
                        telefono: safe(c.phone || c.telefono || c.movil),
                        movil: safe(c.phone || c.telefono || c.movil),
                        contact: safe(c.contact || c.contacto),
                        contacto: safe(c.contact || c.contacto),
                        email: safe(c.email || c.correo || c.mail),
                        correo: safe(c.email || c.correo || c.mail),
                    };
                }
                return c;
            }).filter(c => c !== null); // Eliminar basura detectada en el map

            if (huboCambios || clients.length > 0) {
                const json = JSON.stringify(clients);
                localStorage.setItem('clients', json);
                localStorage.setItem('clientes', json); // Multi-idioma
                localStorage.setItem('data_clientes', json); // Posible clave de la app

                // Sincronizar con la variable global que la app busca para renderizar
                window.clients = clients;

                console.log(`✅ Datos normalizados en múltiples llaves: ${clients.length} clientes.`);
                if (huboCambios && !silencioso) location.reload();
            }
        } catch (e) {
            console.error('❌ Error crítico en auto-reparación:', e);
        }
    }
    function borrarDatos() {
        if (confirm("¿Borrar todos los clientes?")) {
            localStorage.setItem('clients', '[]');
            location.reload();
        }
    }

    function abrirEditor() {
        clienteEnEdicion = window.clienteEnEdicionGlobal || null;
        if (!clienteEnEdicion) return;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
        setVal('edit-id', clienteEnEdicion.id);
        setVal('edit-name', clienteEnEdicion.name);
        setVal('edit-address', clienteEnEdicion.address);
        setVal('edit-phone', clienteEnEdicion.phone);
        setVal('edit-email', clienteEnEdicion.email);
        setVal('edit-notes', clienteEnEdicion.notes);
        setVal('edit-lat', clienteEnEdicion.lat || 0);
        setVal('edit-lon', clienteEnEdicion.lon || 0);
        const m = document.getElementById('modal-editor');
        if (m) m.style.display = 'block';
    }

    function cerrarEditor() { const m = document.getElementById('modal-editor'); if (m) m.style.display = 'none'; }

    function guardarEdicion() {
        const id = document.getElementById('edit-id').value;
        const clientes = JSON.parse(localStorage.getItem('clients') || '[]');
        const idx = clientes.findIndex(c => String(c.id) === String(id));
        if (idx === -1) return;
        const c = clientes[idx];
        c.name = document.getElementById('edit-name').value;
        c.address = document.getElementById('edit-address').value;
        c.phone = document.getElementById('edit-phone').value;
        c.email = document.getElementById('edit-email').value;
        c.notes = document.getElementById('edit-notes').value;
        c.lat = parseFloat(document.getElementById('edit-lat').value) || 0;
        c.lon = parseFloat(document.getElementById('edit-lon').value) || 0;
        c.nombre = c.name; c.direccion = c.address; c.telefono = c.phone; c.correo = c.email;
        clientes[idx] = c;
        localStorage.setItem('clients', JSON.stringify(clientes));
        cerrarEditor();
        location.reload();
    }

    function capturarGPSPropio() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            document.getElementById('edit-lat').value = pos.coords.latitude;
            document.getElementById('edit-lon').value = pos.coords.longitude;
            alert("📍 Ubicación capturada.");
        }, null, { enableHighAccuracy: true });
    }

})(window);
