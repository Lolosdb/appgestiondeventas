// --- HELPER PARA ENCABEZADO COMÚN ---
function getCommonHeaderHtml(title, options = {}) {
    const showBack = options.showBack || false;
    const backFn = options.backFn || 'renderDash()';
    const extraAction = options.extraAction || ''; // Para botones como "Nuevo departamento"
    const showSystemIcons = options.showSystemIcons !== undefined ? options.showSystemIcons : true;

    return `
        <header class="header">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    ${showBack ? `
                        <button class="icon-btn text-white" onclick="${backFn}">
                            <span class="material-icons-round">arrow_back</span>
                        </button>
                    ` : ''}
                    <h1 class="text-xl font-bold">${title}</h1>
                </div>
                <div class="flex items-center gap-3">
                    ${extraAction}
                    ${showSystemIcons ? `
                        <div class="flex gap-2">
                            <button class="icon-btn" onclick="renderVentas()"><span class="material-icons-round">trending_up</span></button>
                            <button class="icon-btn" onclick="renderMedias()"><span class="material-icons-round">history</span></button>
                            <button class="icon-btn" onclick="renderAjustes()"><span class="material-icons-round">settings</span></button>
                            <button class="icon-btn" onclick="openRankingModal()"><span class="material-icons-round">emoji_events</span></button>
                            <button class="icon-btn" onclick="openInfoModal()"><span class="material-icons-round" style="font-size: 24px; opacity: 0.9;">info_outline</span></button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </header>
    `;
}

// --- DASH BOARD ---

async function renderDash() {
    const app = document.getElementById('app');

    // Obtener stats reales ANTES de renderizar
    const stats = await dataManager.getDashStats();

    // Header
    const currentYear = new Date().getFullYear();
    const headerHtml = getCommonHeaderHtml('Dash');

    // Main Content
    let contentHtml = `<main style="padding: 1rem;">`;

    // Title Section
    contentHtml += `
        <div class="flex justify-between items-center dash-header-row">
            <div>
                <h2 class="text-2xl font-bold">Dash</h2>
                <p class="text-gray text-xs uppercase" style="letter-spacing: 1px;">${new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
            </div>
            <div class="flex" style="gap: 40px;"> <!-- Force gap -->
                 <button class="flex items-center justify-center bg-white shadow-md h-14 hover:bg-blue-50 transition-colors gap-2" 
                     style="border: 2px solid #009ee3; border-radius: 50px; padding: 0 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer; background: white;" 
                     title="Departamentos"
                     onclick="renderDepartamentos()">
                    <span class="material-icons-round" style="font-size: 28px; color: #009ee3;">groups</span>
                    <span class="font-bold" style="color: #009ee3; font-size: 16px;">Departamentos</span>
                </button>
                <div class="flex items-center justify-center bg-white shadow-sm border border-gray-100 rounded-full w-14 h-14 hover:bg-gray-50 transition-colors cursor-pointer" 
                     title="Ver Calendario"
                     onclick="try{ document.getElementById('dashDateInput').showPicker(); } catch(e) { document.getElementById('dashDateInput').focus(); }">
                    <span class="material-icons-round text-blue-primary" style="font-size: 32px;">calendar_month</span>
                    <input type="date" id="dashDateInput" 
                           style="width: 0; height: 0; opacity: 0; padding: 0; border: 0; position: absolute;"
                    >
                </div>
            </div>
        </div>
    `;

    // --- GOALS LOGIC ---
    const goals = await dataManager.getDetailedGoals();
    const monthSales = stats.ventasMes.total;
    const targetAmount = stats.ventasMes.objetivo;
    const progressPercent = stats.ventasMes.porcentaje;

    // Determine Label matches logic in getDashStats
    const currentMonthIdx = new Date().getMonth();
    let targetLabel = "Objetivo 3% del Mes";
    if (monthSales >= goals.data4[currentMonthIdx]) targetLabel = "Objetivo 5% del Mes";
    else if (monthSales >= goals.data3[currentMonthIdx]) targetLabel = "Objetivo 4% del Mes";

    // 1. Ventas del Mes Card (Updated with 2 columns)
    contentHtml += `
        <div class="card">
            <div class="sales-card-grid">
                <div>
                    <p class="card-title-sm">Ventas del Mes</p>
                    <h2 class="price-display-lg">${Math.round(monthSales).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €</h2>
                    
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs text-secondary">${targetLabel}</span>
                        <span class="text-xs font-bold text-gray-400">(${Math.round(targetAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €)</span>
                    </div>
                </div>

                <div class="progress-circle-container">
                    <svg class="progress-circle-svg" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#4f46e5" />
                                <stop offset="100%" stop-color="#818cf8" />
                            </linearGradient>
                        </defs>
                        <circle class="progress-circle-bg" cx="50" cy="50" r="40" />
                        <circle class="progress-circle-fill" cx="50" cy="50" r="40" 
                                style="stroke-dasharray: 251.2; stroke-dashoffset: ${251.2 - (251.2 * progressPercent / 100)};" />
                    </svg>
                    <div class="progress-circle-text">${progressPercent}%</div>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                <div class="progress-container" style="flex: 1; margin-right: 15px;">
                    <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                </div>
                <span class="material-icons-round text-blue-primary" style="font-size: 20px; opacity: 0.5;">show_chart</span>
            </div>
        </div>
    `;

    // 2. Tendencia 6 Meses Card
    contentHtml += `
        <div class="card">
            <div class="flex items-center gap-2 mb-4">
                 <span class="material-icons-round text-blue-primary">trending_up</span>
                 <h3 class="font-bold">Tendencia 6 Meses</h3>
            </div>

            <!-- Simple Bar Chart Simulation -->
            <div class="trend-chart-container" style="height: 150px; display: flex; align-items: flex-end; justify-content: space-around; padding-top: 20px;">
                ${(() => {
            const maxVal = Math.max(...stats.tendencia.map(t => t.ventas), 1000);
            return stats.tendencia.map((t, index) => {
                const h = (t.ventas / maxVal) * 100;
                const isLast = index === stats.tendencia.length - 1;
                // Use a nicer blue gradient logic or solid colors
                const bgClass = isLast ? 'bg-blue-600' : 'bg-blue-300';

                return `
                        <div class="trend-bar-group" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 100%;">
                             <!-- Value Label (optional, or tooltip) -->
                             <span class="text-[10px] text-gray-400 mb-1" style="font-size: 0.6rem;">${t.ventas > 0 ? Math.round(t.ventas).toLocaleString('es-ES') : ''}</span>
                             
                             <div class="trend-bar rounded-t-sm transition-all duration-1000" 
                                  style="
                                    width: 16px; 
                                    height: ${h}%; 
                                    background-color: ${isLast ? '#2563eb' : '#93c5fd'};
                                    min-height: 4px;
                                  ">
                             </div>
                             <span class="text-xs text-gray-500 mt-2 font-bold" style="font-size: 0.65rem;">${t.mes}</span>
                        </div>
                        `;
            }).join('');
        })()}
            </div>
        </div>
    `;



    // Modulo 4: Top Clientes

    // Stats Row (Clientes, Pedidos, Media)
    const avgOrderMonth = stats.stats.pedidosMes > 0 ? (stats.ventasMes.total / stats.stats.pedidosMes) : 0;

    contentHtml += `
        <div class="dash-stats-grid-3">
            <div class="card flex flex-col justify-center items-center text-center" style="margin-bottom: 0; padding: 1rem;">
                <div class="stat-icon-box mb-2" style="background-color: #e0e7ff; width: 40px; height: 40px;">
                     <span class="material-icons-round" style="color: #4f46e5; font-size: 20px;">group</span>
                </div>
                <h2 class="text-xl font-bold" style="color: #1e293b;">${stats.stats.clientesActivos}</h2>
                <p class="text-[10px] uppercase font-bold text-slate-400" style="letter-spacing: 0.5px;">Clientes Activos</p>
            </div>
            <div class="card flex flex-col justify-center items-center text-center" style="margin-bottom: 0; padding: 1rem;">
                 <div class="stat-icon-box mb-2" style="background-color: #dcfce7; width: 40px; height: 40px;">
                     <span class="material-icons-round" style="color: #16a34a; font-size: 20px;">shopping_cart</span>
                </div>
                <h2 class="text-xl font-bold" style="color: #1e293b;">${stats.stats.pedidosMes}</h2>
                <p class="text-[10px] uppercase font-bold text-slate-400" style="letter-spacing: 0.5px;">Pedidos Mes</p>
            </div>
            <div class="card flex flex-col justify-center items-center text-center" style="margin-bottom: 0; padding: 1rem;">
                 <div class="stat-icon-box mb-2" style="background-color: #fef3c7; width: 40px; height: 40px;">
                     <span class="material-icons-round" style="color: #d97706; font-size: 20px;">payments</span>
                </div>
                <h2 class="text-xl font-bold" style="color: #1e293b;">${Math.round(avgOrderMonth).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}€</h2>
                <p class="text-[10px] uppercase font-bold text-slate-400" style="letter-spacing: 0.5px;">Media Pedido</p>
            </div>
        </div>
    `;

    // 4. Top Clientes
    contentHtml += `
        <div class="flex items-center gap-2 mb-4 mt-6">
             <span class="material-icons-round text-yellow-500" style="color: #eab308;">emoji_events</span>
             <h3 class="font-bold">Top Clientes</h3>
        </div>
    `;

    contentHtml += `<div class="flex flex-col gap-2">`;
    if (stats.topClientes.length === 0) {
        contentHtml += `<p class="text-sm text-gray">Sin datos aún.</p>`;
    }
    stats.topClientes.forEach(cliente => {
        contentHtml += `
            <div class="card client-item">
                <div class="flex items-center gap-4">
                    <div class="rank-circle">
                        ${cliente.rank.toString().padStart(2, '0')}
                    </div>
                    <div>
                        <p class="font-bold text-sm text-primary">${cliente.name}</p>
                        <p class="text-gray text-xs">${Math.round(cliente.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €</p>
                    </div>
                </div>
                <span class="material-icons-round text-gray arrow-icon-rotated" style="font-size: 16px;">arrow_forward</span>
            </div>
        `;
    });
    contentHtml += `</div>`;

    // 5. Objetivos (Dinamizados desde la DB)
    const annualSalesHistory = await dataManager.getInvoiceHistory();
    const annualRealSales = (annualSalesHistory[new Date().getFullYear()] || Array(12).fill(0)).reduce((a, b) => a + b, 0);

    const goalsList = [
        { pct: '3%', data: goals.data3 },
        { pct: '4%', data: goals.data4 },
        { pct: '5%', data: goals.data5 }
    ].map(g => {
        const meta = g.data.reduce((a, b) => a + b, 0);
        return {
            porcentaje: g.pct,
            meta: meta,
            diferencia: annualRealSales - meta
        };
    });

    contentHtml += `
        <div class="card mt-8" style="background: #f8fafc; border: 1px solid #e2e8f0; box-shadow: none;">
            <div class="flex items-center justify-between mb-6">
                 <div class="flex items-center gap-3">
                    <div class="objective-icon-box" style="background: white; shadow: var(--shadow-sm);">
                        <span class="material-icons-round text-blue-primary">ads_click</span>
                    </div>
                    <h3 class="font-bold text-lg text-slate-800">Objetivos Anuales</h3>
                 </div>
                 <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumen Año</span>
            </div>

            <div class="flex flex-col gap-4">
                ${goalsList.map((obj, i) => {
        const colors = [
            { bg: '#eff6ff', text: '#2563eb', icon: 'star_outline' },
            { bg: '#f5f3ff', text: '#7c3aed', icon: 'auto_awesome' },
            { bg: '#fff7ed', text: '#ea580c', icon: 'rocket_launch' }
        ];
        const cfg = colors[i] || colors[0];
        const diffColor = obj.diferencia < 0 ? '#ef4444' : '#22c55e';
        const diffIcon = obj.diferencia < 0 ? 'trending_down' : 'trending_up';

        return `
                        <div class="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div class="flex items-center gap-4">
                                <div class="flex items-center justify-center w-12 h-12 rounded-xl" style="background: ${cfg.bg};">
                                    <span class="material-icons-round" style="color: ${cfg.text}; font-size: 24px;">${cfg.icon}</span>
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-800" style="font-size: 1.1rem;">Objetivo ${obj.porcentaje}</h4>
                                    <p class="text-xs text-slate-400 font-medium">Meta: ${Math.round(obj.meta).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}€</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="flex items-center justify-end gap-1" style="color: ${diffColor};">
                                    <span class="material-icons-round" style="font-size: 16px;">${diffIcon}</span>
                                    <span class="font-bold text-sm">${Math.round(Math.abs(obj.diferencia)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}€</span>
                                </div>
                                <p class="text-[10px] text-slate-400 font-bold uppercase mt-1">${obj.diferencia < 0 ? 'Faltan' : 'Superado'}</p>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav('dash');

    app.innerHTML = headerHtml + contentHtml;
}

// --- PEDIDOS VIEW ---
async function renderPedidos() {
    const app = document.getElementById('app');

    // Modificar cabecera para incluir botón de importar (Nube)
    const headerHtml = getCommonHeaderHtml('Pedidos');

    let contentHtml = `<main style="height: calc(100vh - 80px); overflow-y: auto; padding: 1rem; padding-bottom: 20px;">`;

    // Unified Table Structure (Corrected)
    // One wrapper for scroll, one inner for width
    contentHtml += `
    <div class="pedidos-table-wrapper" style="width: 100%; margin-bottom: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Inner div handles Horizontal Scroll ONLY if needed, but we want Main to handle Vertical. 
             If we want Horizontal scroll for table content, we need overflow-x here. -->
        <div class="pedidos-table-inner" style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <div style="min-width: 950px;">
            
            <!-- Sticky Header -->
            <div class="pedidos-header-row" style="
                display: grid; 
                grid-template-columns: 60px 2fr 100px 100px 100px 100px 2fr; 
                gap: 10px; 
                padding: 12px 10px; 
                background: #1e293b; 
                color: white; 
                font-weight: bold; 
                font-size: 0.75rem; 
                text-transform: uppercase; 
                position: sticky; 
                top: 0;
                z-index: 10;
            ">
                <span style="text-align: center;">Nº</span>
                <span>Tienda</span>
                <span style="text-align: right;">Importe</span>
                <span style="text-align: right;">Fecha</span>
                <span style="text-align: center;">S/Tampo</span>
                <span style="text-align: center;">F. Todo</span>
                <span>Notas</span>
            </div>

            <!-- Body -->
            <div class="pedidos-list-body">
    `;

    // Real Data from DB
    // Real Data from DB
    const start = performance.now();
    const ordersRaw = await dataManager.getOrders();

    // Sort: Year Descending, then Number Descending (Strict)
    // This handles old "1" and new "2026-1" correctly.
    const orders = ordersRaw.sort((a, b) => {
        const getYear = (o) => {
            // Try to get year from stored field, or parse date
            if (o.year) return o.year;
            const dStr = o.dateISO || o.date;
            if (!dStr) return 0;
            return new Date(dStr).getFullYear() || 0;
        };
        // Handle "2026-6" or "6"
        const getNum = (o) => {
            if (o.displayId) return parseInt(o.displayId);
            // Fallback for old/mixed IDs
            const parts = String(o.id).split('-');
            return parseInt(parts.length > 1 ? parts[1] : parts[0]) || 0;
        };

        const yearA = getYear(a);
        const yearB = getYear(b);

        if (yearA !== yearB) return yearB - yearA; // Newest Year first

        return getNum(b) - getNum(a); // Highest ID first
    });

    console.log(`Orders fetched and sorted in ${performance.now() - start}ms`);

    if (orders.length === 0) {
        contentHtml += `<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
            <p>No hay pedidos registrados.</p>
            <p class="text-sm mt-2">usa el botón de nube ☁️ para importar tu Excel.</p>
        </div>`;
    } else {
        orders.forEach(row => {
            // Field Formatters
            let dateDisplay = row.dateISO || '';
            if (dateDisplay.includes('undefined')) dateDisplay = row.date || '';

            if (dateDisplay.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [y, m, d] = dateDisplay.split('-');
                dateDisplay = `${d}/${m}/${y.substring(2)}`;
            } else if (dateDisplay.match(/^\d{4}-\d{2}-\d{2}T/)) {
                const dateObj = new Date(dateDisplay);
                const d = String(dateObj.getDate()).padStart(2, '0');
                const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                const y = String(dateObj.getFullYear()).substring(2);
                dateDisplay = `${d}/${m}/${y}`;
            }

            let noTampoDisplay = row.noTampo || '-';
            let facturadoTodoDisplay = row.facturadoTodo || '-';

            const formatDateShort = (isoDate) => {
                if (!isoDate || isoDate === '-') return '-';
                if (isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [y, m, d] = isoDate.split('-');
                    return `${d}/${m}/${y.substring(2)}`;
                }
                return isoDate;
            };
            noTampoDisplay = formatDateShort(noTampoDisplay);
            facturadoTodoDisplay = formatDateShort(facturadoTodoDisplay);

            contentHtml += `
                <div class="pedido-row" onclick="openEditOrderModal('${row.id}')" style="
                    display: grid; 
                    grid-template-columns: 60px 2fr 100px 100px 100px 100px 2fr; 
                    gap: 10px; 
                    align-items: center; 
                    padding: 12px 10px; 
                    border-bottom: 1px solid #94a3b8; 
                    font-size: 0.9rem; 
                    background: ${facturadoTodoDisplay !== '-' ? '#bbf7d0' : (noTampoDisplay !== '-' ? '#bfdbfe' : 'white')};
                    cursor: pointer;
                ">
                    <span class="pedido-id font-bold text-primary" style="text-align: center;">${row.displayId || String(row.id).split('-').pop()}</span>
                    <span class="pedido-shop-name truncate font-bold text-dark">${row.shop}</span>
                    <span class="pedido-amount text-right font-mono font-bold">${Math.round(parseFloat(row.amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €</span>
                    <span class="pedido-date text-right text-gray">${dateDisplay}</span>
                    <span class="text-sm text-center text-gray bg-gray-50 rounded px-1">${noTampoDisplay}</span>
                    <span class="text-sm text-center text-gray bg-gray-50 rounded px-1">${facturadoTodoDisplay}</span>
                    <span class="text-xs text-gray truncate" title="${row.comments || ''}">${row.comments || ''}</span>
                </div>
            `;
        });
    }
    contentHtml += `</div></div></div></div>`;

    // Floating Action Button
    contentHtml += `
        <button class="fab-btn" onclick="openNewOrderModal()">
            <span class="material-icons-round">add</span>
        </button>
    `;

    // Modal Container (Hidden by default)
    contentHtml += `
        <div id="newOrderModal" class="modal-overlay">
            <div class="modal-content" style="max-width: 500px; margin: 0 auto;">
                <div class="modal-header">
                    <h2 class="text-xl font-bold">Nuevo Pedido</h2>
                    <button class="icon-btn" onclick="closeNewOrderModal()"><span class="material-icons-round">close</span></button>
                </div>
                <div class="modal-body">
                     <!-- Form -->
                     <div class="input-group mb-4 flex gap-4">
                        <div class="form-group" style="width: 160px;">
                            <label class="form-label">Fecha</label>
                            <div style="position: relative;">
                                <input type="date" id="orderDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                         <div class="form-group">
                            <label class="form-label">Nº</label>
                             <div class="flex gap-2">
                                <input type="text" id="orderId" class="form-input" style="text-align: center; width: 100px;" placeholder="Auto">
                                <button class="btn-secondary" onclick="autoFillOrderId()" style="padding: 0 1rem; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid #cbd5e1; background: linear-gradient(to bottom, #ffffff, #f1f5f9); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.8); font-weight: bold; color: #334155; transform: translateY(-1px);">+1</button>
                            </div>
                        </div>
                     </div>

                     <div class="form-group mb-4">
                        <label class="form-label">Tienda / Cliente</label>
                         <div style="position: relative;">
                            <span class="material-icons-round" style="position: absolute; left: 10px; top: 12px; color: var(--text-secondary);">search</span>
                            <input type="text" id="orderClient" class="form-input" style="padding-left: 2.5rem;" placeholder="Buscar cliente..." list="clientsListDatalist">
                            <datalist id="clientsListDatalist">
                               <!-- Datalist will be populated dynamically or we can inject clients here if available in scope -->
                            </datalist>
                        </div>
                     </div>

                     <div class="form-group mb-4">
                        <label class="form-label">Importe (€)</label>
                        <input type="number" id="orderAmount" class="form-input" placeholder="0" step="0.01">
                     </div>

                     <div class="flex gap-4 mb-4">
                        <div class="form-group w-full">
                            <label class="form-label">Facturado sin Tampo</label>
                            <input type="date" id="orderNoTampo" class="form-input">
                        </div>
                         <div class="form-group w-full">
                            <label class="form-label">Facturado todo</label>
                            <input type="date" id="orderFacturadoTodo" class="form-input">
                        </div>
                     </div>

                     <div class="form-group mb-4">
                        <label class="form-label">Comentarios</label>
                        <textarea id="orderComments" class="form-textarea" rows="3" placeholder="Notas sobre el pedido..."></textarea>
                     </div>

                     <!-- Nuevo Cliente Switch -->
                     <div class="flex justify-end items-center gap-4 mt-2 mb-2 p-2" style="display: flex; justify-content: flex-end; align-items: center; background-color: #f8fafc; border-radius: 8px;">
                        <span class="font-bold text-sm text-primary">¿Cliente Nuevo?</span>
                        <label class="switch">
                            <input type="checkbox" id="isNewClientSwitch">
                            <span class="slider round"></span>
                        </label>
                     </div>

                </div>

                <div class="modal-footer" style="padding: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <!-- Delete Button (Hidden by default) -->
                    <button id="btnDeleteOrder" class="text-red font-bold hover:bg-red-50 px-3 py-2 rounded transition-colors" style="display: none;" onclick="deleteCurrentOrder()">
                        <div class="flex items-center gap-1">
                            <span class="material-icons-round" style="font-size: 18px;">delete</span>
                            Eliminar
                        </div>
                    </button>

                    <!-- Action Buttons Grouped Right -->
                    <div style="display: flex; gap: 10px; margin-left: auto;">
                        <button class="btn-ghost" onclick="closeNewOrderModal()">Cancelar</button>
                        <button class="btn-primary" onclick="saveNewOrder()">
                            <span class="material-icons-round">check</span>
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Populate Datalist needs clients data which is local in renderPedidos scope? 
    // Wait, 'orders' was fetched above. 'dataManager.getOrders()'
    // We didn't fetch clients in renderPedidos previously. 
    // We should probably fetch clients to populate the list or let the user type.
    // For now, let's inject a small script to populate it on open or just leave as text input.
    // Better: Add clients fetch at start of renderPedidos.

    // NOTE: For this replace only, I can't easily change the top of function.
    // I'll leave the datalist empty here and maybe we can populate it via JS when opening modal?
    // Or just accept the user types the name. Using generic text input for now.

    contentHtml += `</main>`;
    contentHtml += renderBottomNav('pedidos');
    app.innerHTML = headerHtml + contentHtml;

    // Post-render: Populate datalist if possible
    // We can run an async IIFE or just call a helper
    dataManager.getClients().then(clients => {
        const dl = document.getElementById('clientsListDatalist');
        if (dl) {
            dl.innerHTML = clients.map(c => `<option value="${c.name}">`).join('');
        }
    });
}

// Helper for navigation
function renderBottomNav(activeTab) {
    return `
        <nav class="bottom-nav">
             <a href="#" onclick="renderDash()" class="nav-item ${activeTab === 'dash' ? 'active' : ''}">
                <span class="material-icons-round">grid_view</span>
                <span>Dash</span>
             </a>
             <a href="#" onclick="renderPedidos()" class="nav-item ${activeTab === 'pedidos' ? 'active' : ''}">
                <span class="material-icons-round">shopping_bag</span>
                <span>Pedidos</span>
             </a>
             <a href="#" onclick="renderTotales()" class="nav-item ${activeTab === 'totales' ? 'active' : ''}">
                <span class="material-icons-round">euro</span>
                <span>Totales</span>
             </a>
             <a href="#" onclick="renderClientes()" class="nav-item ${activeTab === 'clientes' ? 'active' : ''}">
                <span class="material-icons-round">people</span>
                <span>Clientes</span>
             </a>
             <a href="#" onclick="renderAlertas()" class="nav-item ${activeTab === 'alertas' ? 'active' : ''}">
                <span class="material-icons-round">notifications</span>
                <span>Alertas</span>
             </a>
             <a href="#" onclick="renderObjetivos()" class="nav-item ${activeTab === 'objetivos' ? 'active' : ''}">
                <span class="material-icons-round">ads_click</span>
                <span>Objetivos</span>
             </a>
             <a href="#" onclick="renderMapa()" class="nav-item ${activeTab === 'mapa' ? 'active' : ''}">
                <span class="material-icons-round">map</span>
                <span>Mapa</span>
             </a>
             <a href="#" onclick="renderFactura()" class="nav-item ${activeTab === 'factura' ? 'active' : ''}">
                <span class="material-icons-round">receipt_long</span>
                <span>Factura</span>
             </a>
        </nav>
    `;
}

// Modal Logic Helpers
function openNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (!modal) return;

    // Hide Delete Button (Default for new)
    const btnDelete = document.getElementById('btnDeleteOrder');
    if (btnDelete) btnDelete.style.display = 'none';

    // Reset Title
    const title = document.querySelector('#newOrderModal h2');
    if (title) title.textContent = 'Nuevo Pedido';

    // Reset fields
    try {
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('orderId').value = '';
        delete document.getElementById('orderId').dataset.originalId;

        document.getElementById('orderClient').value = '';
        document.getElementById('orderAmount').value = '';
        document.getElementById('orderNoTampo').value = '';
        document.getElementById('orderFacturadoTodo').value = '';
        document.getElementById('orderComments').value = '';
        if (document.getElementById('isNewClientSwitch')) document.getElementById('isNewClientSwitch').checked = false;
    } catch (e) { console.error("Error resetting modal:", e); }

    modal.classList.add('open');

    // --- AUTO FOCUS LOGIC ---
    // 1. When Client is selected (change), focus Amount
    const clientInput = document.getElementById('orderClient');
    const amountInput = document.getElementById('orderAmount');
    const commentsInput = document.getElementById('orderComments');

    if (clientInput && amountInput) {
        // Remove old listener to avoid duplicates if any (using named function or just simple inline if simple enough)
        // Since we are creating anonymous functions, we might accumulate listeners if we are not careful.
        // A better approach is to set onchange property directly which replaces previous one.
        clientInput.onchange = function () {
            if (this.value) {
                amountInput.focus();
            }
        };
    }

    // 2. When Enter in Amount, focus Comments
    if (amountInput && commentsInput) {
        amountInput.onkeydown = function (e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission or other default
                commentsInput.focus();
            }
        };
    }
}

function closeNewOrderModal() {
    document.getElementById('newOrderModal').classList.remove('open');
}

// --- TOTALES VIEW ---
async function renderTotales() {
    const app = document.getElementById('app');

    // Header specific for Totales
    const headerHtml = getCommonHeaderHtml('Totales');

    let contentHtml = `<main style="padding: 1rem; padding-bottom: 100px;">`;

    // Title
    contentHtml += `
        <h2 class="text-2xl font-bold mb-4">Resumen de Ventas</h2>
    `;

    // --- REAL DATA FETCH ---
    const orders = await dataManager.getOrders();
    const clients = await dataManager.getClients();
    const clientMap = new Map(clients.map(c => [c.name, c]));

    // 1. Facturacion Real (From Manual Input in FACTURA view)
    // Sum of amounts entered in the "Factura" view for the current year
    const history = await dataManager.getInvoiceHistory();
    const targetYear = new Date().getFullYear();
    const salesThisYear = history[targetYear] || Array(12).fill(0);
    const facturacionReal = salesThisYear.reduce((a, b) => a + b, 0);

    // 2. Goals Linked to DB
    const goals = await dataManager.getDetailedGoals();
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const goal3 = sum(goals.data3);
    const goal4 = sum(goals.data4);
    const goal5 = sum(goals.data5);

    // Dynamic Target Logic
    let targetAmount = goal3;
    let targetLabel = "Objetivo 3%";
    let activeGoal = 3;

    if (facturacionReal >= goal3) {
        if (facturacionReal >= goal4) {
            targetAmount = goal5;
            targetLabel = "Objetivo 5%";
            activeGoal = 5;
        } else {
            targetAmount = goal4;
            targetLabel = "Objetivo 4%";
            activeGoal = 4;
        }
    }

    const progressPercent = targetAmount > 0
        ? ((facturacionReal / targetAmount) * 100).toFixed(1)
        : 0;

    const amountLeft = Math.max(0, targetAmount - facturacionReal);

    // Helper text for alert/info
    // If goal 5 is passed, amountLeft is 0.
    const isMaxed = facturacionReal >= goal5;
    let infoText = "";
    if (isMaxed) {
        infoText = `¡Objetivo Máximo Superado!`;
    } else {
        infoText = `Faltan ${Math.round(amountLeft).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} € para el ${targetLabel}`;
    }

    contentHtml += `
        <div class="blue-gradient-card">
            <div class="chart-icon-box">
                <span class="material-icons-round" style="color: white; font-size: 28px;">trending_up</span>
            </div>
            
            <p class="text-xs font-bold uppercase" style="opacity: 0.8; margin-bottom: 0.5rem;">Facturación Ventas Real</p>
            <h2 class="total-amount-display">${Math.round(facturacionReal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €</h2>
            
            <p class="objective-info">${infoText}</p>
            <p class="text-xs font-bold" style="opacity: 0.6; margin-bottom: 1rem;">META ${activeGoal}%: ${Math.round(targetAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €</p>
            
            <div class="percent-badge">${progressPercent}%</div>

            <div class="progress-bg-dark">
                <div class="progress-fill-light" style="width: ${Math.min(100, progressPercent)}%;"></div>
            </div>

            <div class="bg-decoration-line">
                <span class="material-icons-round">show_chart</span>
            </div>
        </div>
    `;

    // 3. Communities / Provinces Stats
    // We strictly show these 4 containers
    const PROVINCES_TO_SHOW = ['ASTURIAS', 'CANTABRIA', 'LEÓN', 'GALICIA'];

    // Initialize stats for our target provinces
    const statsByProv = {};
    PROVINCES_TO_SHOW.forEach(p => {
        statsByProv[p] = { name: p, amount: 0, orders: 0 };
    });

    orders.forEach(o => {
        const client = clientMap.get(o.shop);
        if (client && client.province) {
            let prov = client.province.trim().toUpperCase();

            // Normalize & Merge Rules
            if (prov === 'LEON') prov = 'LEÓN';
            if (prov === 'LUGO') prov = 'GALICIA'; // Merge Lugo into Galicia
            if (prov === 'PALENCIA') prov = 'LEÓN'; // Merge Palencia into León

            // Only aggregate if it belongs to our target provinces
            if (statsByProv[prov]) {
                statsByProv[prov].amount += (parseFloat(o.amount) || 0);
                statsByProv[prov].orders += 1;
            }
        }
    });

    contentHtml += `<div class="communities-grid">`;

    PROVINCES_TO_SHOW.forEach(provName => {
        const comm = statsByProv[provName];

        // Colors
        let colorStyle = 'color: #0284c7;'; // Default Blue (Asturias/Galicia)
        if (provName === 'CANTABRIA') colorStyle = 'color: #ef4444;'; // Red
        if (provName === 'LEÓN') colorStyle = 'color: #a855f7;'; // Purple

        contentHtml += `
            <div class="community-card">
                <p class="community-name">${comm.name}</p>
                <h3 class="community-amount" style="${colorStyle}">${Math.round(comm.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €</h3>
                <p class="community-orders">${comm.orders} pedidos</p>
            </div>
        `;
    });
    contentHtml += `</div>`;

    // 4. Clients Stats
    // Logic: "Clientes con Compra" = unique shops in orders THIS YEAR
    // Logic: "Clientes Nuevos" = clients created THIS YEAR
    const currentYear = new Date().getFullYear();

    const ordersThisYear = orders.filter(o => new Date(o.dateISO).getFullYear() === currentYear);
    const uniqueShopsThisYear = new Set(ordersThisYear.map(o => o.shop));
    const clientsWithPurchase = uniqueShopsThisYear.size;

    // "Clientes Nuevos": Count unique clients who have "persistedIsNewClient" flag in any order
    const newClientOrders = orders.filter(o => o.persistedIsNewClient === true);
    const uniqueNewClients = new Set(newClientOrders.map(o => o.shop));
    const newClients = uniqueNewClients.size;

    // --- NUEVAS ESTADÍSTICAS SOLICITADAS ---
    // Total pedidos año actual (SOLO pedidos con importe > 0 para evitar muestras)
    const ordersThisYearValued = ordersThisYear.filter(o => (parseFloat(o.amount) || 0) > 0);
    const totalOrdersThisYearValued = ordersThisYearValued.length;

    // Importe medio por pedido (Facturación Real de la vista Ventas / Total Pedidos con valor > 0)
    const averageOrderAmount = totalOrdersThisYearValued > 0 ? (facturacionReal / totalOrdersThisYearValued) : 0;

    contentHtml += `
        <h3 class="text-lg font-bold mt-6 mb-3">Estadísticas Generales</h3>
        <div class="clients-stats-grid">
            <div class="community-card">
                <p class="community-name">Clientes Nuevos</p>
                <h3 class="client-stat-value text-green">${newClients} clientes</h3>
            </div>
            <div class="community-card">
                <p class="community-name">Clientes con Compra</p>
                <h3 class="client-stat-value text-orange">${clientsWithPurchase} clientes</h3>
            </div>
            <div class="community-card">
                <p class="community-name">Total Pedidos (${currentYear})</p>
                <h3 class="client-stat-value" style="color: var(--primary-dark-blue);">${totalOrdersThisYearValued} pedidos</h3>
            </div>
            <div class="community-card">
                <p class="community-name">Importe Medio Pedido</p>
                <h3 class="client-stat-value" style="color: var(--accent-purple);">${Math.round(averageOrderAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €</h3>
            </div>
        </div>
    `;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav('totales');
    app.innerHTML = headerHtml + contentHtml;
}

// --- CLIENTES VIEW ---
async function renderClientes() {
    const app = document.getElementById('app');

    const headerHtml = getCommonHeaderHtml('Clientes');

    let contentHtml = `<main style="padding: 1rem; padding-bottom: 100px;">`;

    // Import Card
    contentHtml += `
        <div class="import-card">
            <div class="flex justify-between items-center mb-2">
                 <div class="flex items-center gap-2">
                     <span class="material-icons-round text-green" style="color: #16a34a;">description</span>
                     <h3 class="font-bold text-sm">Importar Clientes</h3>
                 </div>
                 <button class="btn-primary" style="padding: 10px 20px; height: auto; font-size: 0.95rem;" onclick="openNewClientModal()">
                    <span class="material-icons-round" style="font-size: 20px;">add</span>
                    Crear nuevo
                </button>
            </div>
            <p class="text-xs text-gray mb-2">Selecciona un archivo o importa desde Drive.</p>
            <input type="file" id="clientImportInput" accept=".xlsx, .xls" style="display: none;" onchange="handleClientImport(this)">
            
            <div class="flex gap-2">
                <button class="import-btn flex-1" onclick="document.getElementById('clientImportInput').click()">
                    <span class="material-icons-round" style="font-size: 18px;">upload_file</span>
                    Seleccionar Archivo
                </button>
                <button class="import-btn flex-1" onclick="handleDriveImport()">
                    <span class="material-icons-round" style="font-size: 18px;">cloud_download</span>
                    Importar Drive
                </button>
            </div>
        </div>
    `;


    // Search
    contentHtml += `
        <div class="search-container">
            <span class="material-icons-round search-icon">search</span>
            <input type="text" id="clientSearchInput" class="search-input" placeholder="Buscar por nombre o población..." onkeyup="filterClients(this.value)">
            <span id="clearSearchBtn" class="material-icons-round clear-icon" style="display: none;" onclick="clearClientSearch()">cancel</span>
        </div>
    `;

    // Load Clients from DB
    let clients = await dataManager.getClients();

    // Sort clients by location (population)
    clients.sort((a, b) => {
        const locA = (a.location || '').toLowerCase();
        const locB = (b.location || '').toLowerCase();
        return locA.localeCompare(locB);
    });

    contentHtml += `<div id="clientsList" class="clients-list">`;
    if (clients.length === 0) {
        contentHtml += `<p class="text-center text-gray p-4">No hay clientes. Importa un Excel.</p>`;
    } else {
        clients.forEach(client => {
            contentHtml += createClientCardHtml(client);
        });
    }
    contentHtml += `</div>`;



    // Client Detail Modal Container
    contentHtml += `
        <div id="clientDetailModal" class="modal-overlay">
            <div class="modal-content" style="height: 90vh;">
                <div id="modal-client-content" class="w-full h-full flex flex-col">
                    <!-- Dynamic Content will be injected here -->
                </div>
            </div>
        </div>
    `;

    // New Client Modal
    contentHtml += `
    <div id="newClientModal" class="modal-overlay">
        <div class="modal-content" style="height: 95vh;">
            <div class="modal-header">
                <h2>Crear Cliente Nuevo</h2>
                <button class="icon-btn" onclick="closeNewClientModal()"><span class="material-icons-round">close</span></button>
            </div>
            <div class="modal-body">
                <form id="newClientForm" onsubmit="event.preventDefault(); saveNewClient();" onkeydown="handleFormNavigation(event)">
                    
                    <div class="input-group mb-2">
                        <div class="flex-1">
                             <label class="form-label">Código *</label>
                             <input type="text" id="ncCode" class="form-input" required inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        </div>
                        <div class="flex-1">
                             <label class="form-label">Tienda (Nombre) *</label>
                             <input type="text" id="ncName" class="form-input" required oninput="this.value = this.value.toUpperCase()">
                        </div>
                    </div>

                    <div class="input-group mb-2">
                         <div class="flex-1">
                             <label class="form-label">NIF</label>
                             <input type="text" id="ncNif" class="form-input" oninput="this.value = this.value.toUpperCase()">
                         </div>
                         <div class="flex-1">
                             <label class="form-label">Teléfono</label>
                             <input type="text" id="ncPhone" class="form-input" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                         </div>
                    </div>

                    <div class="mb-2">
                         <label class="form-label">Email</label>
                         <input type="email" id="ncEmail" class="form-input" oninput="this.value = this.value.toLowerCase()">
                    </div>

                    <div class="mb-2">
                         <label class="form-label">Dirección</label>
                         <input type="text" id="ncAddress" class="form-input" oninput="this.value = this.value.toUpperCase()">
                    </div>

                    <div class="input-group mb-2">
                        <div class="flex-2">
                             <label class="form-label">Población</label>
                             <input type="text" id="ncLocation" class="form-input" oninput="this.value = this.value.toUpperCase()">
                        </div>
                        <div class="flex-2">
                             <label class="form-label">Provincia</label>
                             <input type="text" id="ncProvince" class="form-input" oninput="this.value = this.value.toUpperCase()">
                        </div>
                        <div class="flex-1">
                             <label class="form-label">C.P.</label>
                             <input type="text" id="ncCP" class="form-input" inputmode="numeric" maxlength="5" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        </div>
                    </div>

                    <div class="mb-2">
                         <label class="form-label">Contacto (Persona)</label>
                         <input type="text" id="ncContact" class="form-input" oninput="this.value = this.value.toUpperCase()">
                    </div>

                    <div class="mb-2">
                         <label class="form-label">Horario</label>
                         <input type="text" id="ncSchedule" class="form-input" placeholder="Ej: 9:00-14:00">
                    </div>

                    <div class="mb-4 slider-container p-4 bg-white rounded-lg border border-gray-200">
                        <label class="form-label mb-2">Ubicación (GPS)</label>
                        <div class="flex gap-2 mb-4">
                            <input type="text" id="ncLat" class="form-input" placeholder="Latitud (Ej: 43.1234)">
                            <input type="text" id="ncLng" class="form-input" placeholder="Longitud (Ej: -6.1234)">
                        </div>
                        <div class="flex justify-center w-full">
                            <button type="button" class="btn-primary" style="width: auto; padding-left: 2rem; padding-right: 2rem;" onclick="getCurrentCoordinates()">
                                <span class="material-icons-round">my_location</span>
                                Obtener Coordenadas
                            </button>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn-ghost" onclick="closeNewClientModal()">Cancelar</button>
                        <button type="submit" class="btn-primary">
                            <span class="material-icons-round">save</span>
                            Guardar en Drive
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
    `;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav('clientes');
    app.innerHTML = headerHtml + contentHtml;
}

function createClientCardHtml(client) {
    // Escape code for use in onclick attribute
    const safeCode = String(client.code).replace(/'/g, "\\'").replace(/\n/g, "\\n");
    return `
        <div class="client-card" onclick="openClientDetailModal('${safeCode}')" data-name="${client.name.toLowerCase()}" data-location="${client.location.toLowerCase()}">
            <div class="w-full">
                <div class="mb-2">
                    <span class="client-code-badge">${client.code}</span>
                    <span class="client-card-title">${client.name}</span>
                </div>
                <div class="tag-row">
                    <div class="tag-location">
                        <span class="material-icons-round" style="font-size: 14px;">place</span>
                        ${client.location}
                    </div>
                    <div class="tag-contact">
                            <span class="material-icons-round" style="font-size: 14px;">person</span>
                            ${client.contact}
                    </div>
                </div>
            </div>
            <span class="material-icons-round text-gray" style="font-size: 20px;">menu</span>
        </div>
    `;
}

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw0oAQ1Dq8gKHsy6vutnPh9xylbcFThY1irpehdeQTT9pY7LJAbvNIU0t6ZT0ovD2rMeg/exec';

async function handleClientImport(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
            // Show loading or toast
            const result = await dataManager.importClientsFromExcel(file);
            if (result.success) {
                alert(`Importados ${result.count} clientes correctamente.`);
                renderClientes(); // Reload
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error al importar: ' + error.message);
        }
    }
}

async function handleDriveImport() {
    const filename = 'Clientes_CON_COORDENADAS.xlsx';
    if (!confirm(`¿Descargar e importar "${filename}" desde Google Drive?`)) return;

    // Simple Loading Indication
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons-round animate-spin">sync</span> Cargando...';
    btn.disabled = true;

    try {
        const result = await dataManager.importFromDrive(APPS_SCRIPT_URL, filename);
        if (result.success) {
            alert(`Éxito: Se han importado/actualizado ${result.count} clientes.`);
            renderClientes();
        } else {
            alert('Error en la importación: ' + result.message);
        }
    } catch (err) {
        alert('Error inesperado: ' + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function filterClients(query) {
    const list = document.getElementById('clientsList');
    if (!list) return;
    const cards = list.getElementsByClassName('client-card');
    const q = query.toLowerCase();

    // Show/Hide Clear Button
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

    Array.from(cards).forEach(card => {
        const name = card.getAttribute('data-name');
        const loc = card.getAttribute('data-location');
        if (name.includes(q) || loc.includes(q)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function clearClientSearch() {
    const input = document.getElementById('clientSearchInput');
    if (input) {
        input.value = '';
        filterClients('');
        input.focus();
    }
}


async function openClientDetailModal(clientCode) {
    const modalContent = document.getElementById('modal-client-content');

    // Fetch from DB
    const clientData = await dataManager.getClientByCode(clientCode);

    if (!clientData) {
        alert('Cliente no encontrado');
        return;
    }

    // Fetch Orders
    const allOrders = await dataManager.getOrders();
    // Generate History HTML
    const filteredOrders = allOrders.filter(o => {
        const matchesCode = o.clientCode ? String(o.clientCode) === String(clientCode) : false;
        const matchesName = o.shop ? o.shop.trim().toUpperCase() === clientData.name.trim().toUpperCase() : false;
        return matchesCode || matchesName;
    });

    const clientOrders = filteredOrders.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));

    let historyHtml = '';
    if (clientOrders.length === 0) {
        historyHtml = '<p class="text-sm text-gray text-center my-4">No hay pedidos registrados.</p>';
    } else {
        clientOrders.forEach(order => {
            // Format Date
            let dateStr = order.date;
            if (order.dateISO) {
                try {
                    const d = new Date(order.dateISO);
                    dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                } catch (e) { }
            }

            // Badge logic
            let statusText = 'ALMACÉN';
            let badgeBg = '#f1f5f9'; // Gray
            let badgeColor = '#1e293b'; // Dark Gray/Black

            if (order.facturadoTodo) {
                statusText = 'FACTURADO TODO';
                badgeBg = '#dcfce7'; // Light Green
                badgeColor = '#15803d'; // Green
            } else if (order.noTampo) {
                statusText = 'FACTURADO S/TAMPO';
                badgeBg = '#dbeafe'; // Light Blue
                badgeColor = '#1e40af'; // Blue
            }

            historyHtml += `
            <div class="history-item" style="background-color: #f8fafc; border: none; align-items: flex-start;">
                <div class="flex flex-col">
                    <p class="text-xs text-gray font-bold mb-1" style="color: #94a3b8;">${dateStr}</p>
                    <p class="font-bold text-lg text-primary">${parseFloat(order.amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                </div>
                <div class="flex items-center h-full pt-1">
                    <span class="status-badge" style="background-color: ${badgeBg}; color: ${badgeColor}; border-radius: 6px; padding: 4px 8px; font-size: 0.7rem;">${statusText}</span>
                </div>
            </div>`;
        });
    }

    modalContent.innerHTML = `
        <div class="client-detail-header">
            <div class="flex justify-between items-start">
                 <h2 class="text-xl font-bold overflow-hidden" style="max-width: 70%;">${clientData.name}</h2>
                 <div class="flex gap-2">
                     <button class="icon-btn" onclick="openNewClientModal('${clientData.code}')"><span class="material-icons-round text-white">edit</span></button>
                     <button class="icon-btn" onclick="handleDeleteClient('${clientData.code}')"><span class="material-icons-round text-white">delete</span></button>
                     <button class="icon-btn" onclick="closeClientDetailModal()"><span class="material-icons-round text-white">close</span></button>
                 </div>
            </div>
            <span class="client-detail-code">${clientData.code}</span>
        </div>

        <div class="modal-body">
            <!-- Info List -->
            <div class="info-row">
                <div class="info-icon-box"><span class="material-icons-round text-gray">numbers</span></div>
                <div>
                     <p class="info-label">CÓDIGO DE CLIENTE</p>
                     <p class="info-value">${clientData.code}</p>
                </div>
            </div>
             <div class="info-row">
                <div class="info-icon-box"><span class="material-icons-round text-gray">place</span></div>
                <div>
                     <p class="info-label">DIRECCIÓN</p>
                     <p class="info-value text-sm">${clientData.address}</p>
                </div>
            </div>
             <div class="info-row">
                <div class="info-icon-box"><span class="material-icons-round text-gray">language</span></div>
                <div>
                     <p class="info-label">LOCALIDAD</p>
                     <p class="info-value">${clientData.location} ${clientData.cp ? `(${clientData.cp})` : ''}</p>
                     <p class="text-xs text-gray">Provincia: ${clientData.province}</p>
                </div>
            </div>
             <div class="info-row">
                <div class="info-icon-box"><span class="material-icons-round text-gray">person</span></div>
                <div>
                     <p class="info-label">PERSONA DE CONTACTO</p>
                     <p class="info-value">${clientData.contact}</p>
                </div>
            </div>
            <div class="info-row items-center justify-between">
                <div class="flex gap-4 items-center">
                    <div class="info-icon-box"><span class="material-icons-round text-gray">phone</span></div>
                    <div>
                         <p class="info-label">TELÉFONO</p>
                         <a href="tel:${clientData.phone.replace(/\s/g, '')}" class="info-value text-blue-primary font-bold no-underline hover:underline block">${clientData.phone}</a>
                    </div>
                </div>
                
                <button class="whatsapp-btn" style="white-space: nowrap;" onclick="window.open('https://wa.me/34${clientData.phone.replace(/[^0-9]/g, '')}', '_blank')">
                    <span class="material-icons-round" style="font-size: 16px;">chat</span>
                    Enviar Whatsapp
                </button>
            </div>
             <div class="info-row">
                <div class="info-icon-box"><span class="material-icons-round text-gray">email</span></div>
                <div>
                     <p class="info-label">CORREO ELECTRÓNICO</p>
                     <a href="mailto:${clientData.email}" class="info-value text-blue-primary text-sm no-underline hover:underline block">${clientData.email}</a>
                </div>
            </div>
            
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1.5rem 0;">

            <!-- History -->
            <div class="history-section-title">
                <span class="material-icons-round text-blue-primary">history</span>
                <h3>Historial de Pedidos</h3>
            </div>

            ${historyHtml}

            <button class="close-modal-btn-large" onclick="closeClientDetailModal()">Cerrar</button>

        </div>
    `;

    document.getElementById('clientDetailModal').classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeClientDetailModal() {
    document.getElementById('clientDetailModal').classList.remove('open');
    document.body.classList.remove('no-scroll');
}


// --- ALERTAS VIEW ---
async function renderAlertas() {
    const app = document.getElementById('app');

    const headerHtml = getCommonHeaderHtml('Alertas');

    let contentHtml = `<main style="padding: 1rem; padding-bottom: 100px;">`;

    // --- REAL DATA FETCH ---
    const orders = await dataManager.getOrders();
    const clients = await dataManager.getClients();
    const clientMap = new Map(clients.map(c => [c.name, c]));

    // Filter by Current Year
    const currentYear = new Date().getFullYear();
    const yearOrders = orders.filter(o => new Date(o.dateISO).getFullYear() === currentYear);

    // Find last order per client
    const lastOrders = {}; // shopName -> dateISO string

    yearOrders.forEach(o => {
        if (!lastOrders[o.shop] || o.dateISO > lastOrders[o.shop]) {
            lastOrders[o.shop] = o.dateISO;
        }
    });

    const today = new Date();

    const alertsData = Object.entries(lastOrders).map(([shop, dateISO]) => {
        const orderDate = new Date(dateISO);
        // Calculate diff in days
        const diffTime = Math.abs(today - orderDate);
        const daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const client = clientMap.get(shop);

        return {
            name: shop,
            location: client ? client.location : '',
            province: client ? client.province : '',
            daysAgo: daysAgo
        };
    }).sort((a, b) => a.daysAgo - b.daysAgo); // Most recent first (smallest daysAgo)

    if (alertsData.length > 0) {
        // Title Section
        contentHtml += `
            <div class="flex items-center gap-2 mb-4">
                <span class="material-icons-round text-blue-primary" style="font-size: 28px;">calendar_today</span>
                <h2 class="text-xl font-bold">Última compra</h2>
            </div>
        `;

        contentHtml += `<div class="alertas-list">`;
        alertsData.forEach(item => {
            // Logic: <= 35 days GREEN, > 35 days RED
            const isGreen = item.daysAgo <= 35;
            const accentColor = isGreen ? '#22c55e' : '#ef4444';
            const cardBg = isGreen ? '#f0fdf4' : '#fef2f2'; // Soft green / Soft red
            const badgeBg = isGreen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            const textColor = isGreen ? '#166534' : '#991b1b';

            contentHtml += `
                <div class="card mb-3 flex justify-between items-center shadow-sm" 
                     style="padding: 1rem 1.25rem; background-color: ${cardBg}; border: 1px solid ${accentColor}20; border-left: 6px solid ${accentColor};">
                    <div style="flex: 1;">
                        <h3 class="font-bold" style="color: ${textColor}; font-size: 1.1rem; margin-bottom: 2px;">${item.name}</h3>
                        <p class="uppercase font-bold" style="color: ${textColor}; opacity: 0.6; font-size: 0.65rem; letter-spacing: 0.5px;">${item.location || 'SIN LOCALIDAD'}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="background-color: ${badgeBg}; color: ${textColor}; padding: 6px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; border: 1px solid ${accentColor}33;">
                            Hace ${item.daysAgo} días
                        </div>
                    </div>
                </div>
            `;
        });
        contentHtml += `</div>`;
    } else {
        // No hay alertas este año (Estado vacío al inicio del año)
        contentHtml += `
            <div class="flex flex-col items-center justify-center h-64 text-gray-400">
                <span class="material-icons-round" style="font-size: 48px; opacity: 0.3;">notifications_off</span>
                <p class="mt-2 text-sm">Sin actividad de pedidos en ${currentYear}</p>
            </div>
        `;
    }

    contentHtml += `</main>`;
    contentHtml += renderBottomNav('alertas');
    app.innerHTML = headerHtml + contentHtml;
}

// --- OBJETIVOS VIEW ---
async function renderObjetivos() {
    const app = document.getElementById('app');

    const headerHtml = getCommonHeaderHtml('Objetivos');

    let contentHtml = `<main style="padding: 1rem; padding-bottom: 0; height: calc(100vh - 120px); overflow: hidden; display: flex; flex-direction: column;">`;

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const goals = await dataManager.getDetailedGoals();
    const data3 = goals.data3;
    const data4 = goals.data4;
    const data5 = goals.data5;

    // Totals
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const total3 = sum(data3);
    const total4 = sum(data4);
    const total5 = sum(data5);

    contentHtml += `
        <div class="objetivos-container">
            <!-- Header -->
            <div class="obj-header">
                <div class="col-mes">MES</div>
                <div class="col-data"><div class="col-header-box blue">3 %</div></div>
                <div class="col-data"><div class="col-header-box light-purple">4 %</div></div>
                <div class="col-data"><div class="col-header-box purple">5 %</div></div>
            </div>

            <div class="obj-body">
    `;

    months.forEach((mes, index) => {
        contentHtml += `
            <div class="obj-row">
                <div class="cell-mes">${mes}</div>
                <div class="cell-input"><input type="text" inputmode="numeric" class="obj-input col-3" value="${Math.round(data3[index]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}" onchange="window.handleGoalUpdate(3, ${index}, this.value, ${index * 3})"></div>
                <div class="cell-input"><input type="text" inputmode="numeric" class="obj-input col-4" value="${Math.round(data4[index]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}" onchange="window.handleGoalUpdate(4, ${index}, this.value, ${index * 3 + 1})"></div>
                <div class="cell-input"><input type="text" inputmode="numeric" class="obj-input col-5" value="${Math.round(data5[index]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}" onchange="window.handleGoalUpdate(5, ${index}, this.value, ${index * 3 + 2})"></div>
            </div>
        `;
    });

    contentHtml += `
            </div> <!-- End body -->

            <!-- Total Row -->
            <div class="obj-total-row">
                <div class="total-value-label">TOTAL</div>
                <div class="total-cell">${Math.round(total3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</div>
                <div class="total-cell">${Math.round(total4).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</div>
                <div class="total-cell">${Math.round(total5).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</div>
            </div>
        </div>
    `;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav('objetivos');
    app.innerHTML = headerHtml + contentHtml;

    // Enable Navigation
    setupGridNavigation('.objetivos-container', '.obj-input');

    // Restore focus if needed
    if (window.pendingFocusIndex !== undefined && window.pendingFocusContainer === '.objetivos-container') {
        const inputs = document.querySelectorAll('.objetivos-container .obj-input');
        if (inputs[window.pendingFocusIndex]) {
            inputs[window.pendingFocusIndex].focus();
            inputs[window.pendingFocusIndex].select();
        }
        window.pendingFocusIndex = undefined;
    }
}

// --- NEW CLIENT LOGIC ---

async function openNewClientModal(clientCode = null) {
    const modal = document.getElementById('newClientModal');
    const form = document.getElementById('newClientForm');
    const title = modal.querySelector('h2');

    form.reset();

    if (clientCode) {
        // Edit Mode
        const client = await dataManager.getClientByCode(clientCode);
        if (!client) return alert("Error cargando cliente");

        title.textContent = 'Editar Cliente';
        form.dataset.isEdit = 'true';
        form.dataset.originalCode = client.code;

        document.getElementById('ncCode').value = client.code;
        document.getElementById('ncName').value = client.name;
        document.getElementById('ncNif').value = client.nif || '';
        document.getElementById('ncEmail').value = client.email || '';
        document.getElementById('ncPhone').value = client.phone || '';
        document.getElementById('ncAddress').value = client.address || '';
        document.getElementById('ncLocation').value = client.location || '';
        document.getElementById('ncProvince').value = client.province || '';
        document.getElementById('ncCP').value = client.cp || '';
        document.getElementById('ncContact').value = client.contact || '';
        document.getElementById('ncSchedule').value = client.schedule || '';
        document.getElementById('ncLat').value = client.lat || '';
        document.getElementById('ncLng').value = client.lng || '';

    } else {
        // Create Mode
        title.textContent = 'Crear Cliente Nuevo';
        form.dataset.isEdit = 'false';
        delete form.dataset.originalCode;
    }

    modal.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeNewClientModal() {
    document.getElementById('newClientModal').classList.remove('open');
    document.body.classList.remove('no-scroll');
    const form = document.getElementById('newClientForm');
    form.reset();
    delete form.dataset.isEdit;
    delete form.dataset.originalCode;
}

function getCurrentCoordinates() {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Obteniendo...';
    btn.disabled = true;

    if (!navigator.geolocation) {
        alert("La geolocalización no es soportada por este navegador.");
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            document.getElementById('ncLat').value = position.coords.latitude;
            document.getElementById('ncLng').value = position.coords.longitude;
            btn.innerHTML = '<span class="material-icons-round">check</span> Completado';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        },
        (error) => {
            alert("Error obteniendo ubicación: " + error.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    );
}

async function saveNewClient() {
    const form = document.getElementById('newClientForm');
    const isEditMode = form.dataset.isEdit === 'true';
    const originalCode = form.dataset.originalCode;

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons-round animate-spin">sync</span> Guardando...';
    btn.disabled = true;

    const latVal = document.getElementById('ncLat').value;
    const lngVal = document.getElementById('ncLng').value;

    const data = {
        code: document.getElementById('ncCode').value,
        name: document.getElementById('ncName').value,
        nif: document.getElementById('ncNif').value,
        email: document.getElementById('ncEmail').value,
        phone: document.getElementById('ncPhone').value,
        address: document.getElementById('ncAddress').value,
        location: document.getElementById('ncLocation').value,
        province: document.getElementById('ncProvince').value,
        cp: document.getElementById('ncCP').value,
        contact: document.getElementById('ncContact').value,
        schedule: document.getElementById('ncSchedule').value,
        lat: latVal ? parseFloat(latVal.replace(',', '.')) : '',
        lng: lngVal ? parseFloat(lngVal.replace(',', '.')) : ''
    };

    try {
        const filename = 'Clientes_CON_COORDENADAS.xlsx';
        let result;

        if (isEditMode) {
            result = await dataManager.updateClientInDrive(APPS_SCRIPT_URL, filename, originalCode, data);
        } else {
            result = await dataManager.saveNewClientToDrive(APPS_SCRIPT_URL, filename, data);
        }

        if (result.success) {
            alert(isEditMode ? "Cliente actualizado correctamente." : "Cliente creado correctamente.");
            closeNewClientModal();
            closeClientDetailModal(); // Close detail if open
            renderClientes();
        } else {
            alert("Error al guardar: " + result.message);
        }
    } catch (e) {
        alert("Error inesperado: " + e.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// --- FORM NAVIGATION ---
function handleFormNavigation(event) {
    if (event.key === 'Enter') {
        const form = event.currentTarget;
        const inputs = Array.from(form.querySelectorAll('input, select, textarea, button'));
        const index = inputs.indexOf(event.target);

        // If it's the specific button or last input, let it submit?
        // Actually user wants to move to next field.
        // If it is a textarea, Enter should probably newline, but here we only have text inputs mostly.

        if (event.target.type !== 'submit' && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            if (index > -1 && index < inputs.length - 1) {
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                    if (nextInput.select) nextInput.select();
                }
            }
        }
    }
}

async function handleDeleteClient(code) {
    if (!confirm("¿Estás seguro de que quieres ELIMINAR este cliente? Esta acción borrará el cliente del Excel en Drive permanentemente.")) return;

    // Show loading? We can't easily show loading on the Delete button inside Modal without selection, but we can block UI.
    const modalContent = document.querySelector('#clientDetailModal .modal-content');
    const oldOpacity = modalContent.style.opacity;
    modalContent.style.opacity = '0.5';
    modalContent.style.pointerEvents = 'none';

    try {
        const filename = 'Clientes_CON_COORDENADAS.xlsx';
        const result = await dataManager.deleteClientFromDrive(APPS_SCRIPT_URL, filename, code);

        if (result.success) {
            alert("Cliente eliminado correctamente.");
            closeClientDetailModal();
            renderClientes();
        } else {
            alert("Error al eliminar: " + result.message);
        }
    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        if (modalContent) {
            modalContent.style.opacity = oldOpacity || '1';
            modalContent.style.pointerEvents = 'auto';
        }
    }
}

// --- HELPER FUNCTIONS ---

async function handleOrdersImport(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
            const result = await dataManager.importOrdersFromExcel(file);
            if (result.success) {
                alert(`Importados ${result.count} pedidos correctamente.`);
                renderPedidos();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error al importar pedidos: ' + error.message);
        }
    }
}

async function saveNewOrder() {
    const dateInput = document.getElementById('orderDate').value;
    const clientInput = document.getElementById('orderClient').value;
    const amountInput = document.getElementById('orderAmount').value;
    const noTampoInput = document.getElementById('orderNoTampo').value;
    const facturadoTodoInput = document.getElementById('orderFacturadoTodo').value;
    const commentsInput = document.getElementById('orderComments').value;
    const idInput = document.getElementById('orderId').value; // Get manual ID
    const isNewClient = document.getElementById('isNewClientSwitch').checked;

    if (!dateInput || !clientInput || !amountInput) {
        alert('Por favor completa los campos obligatorios (Fecha, Cliente, Importe)');
        return;
    }

    try {
        const dateObj = new Date(dateInput);
        const year = dateObj.getFullYear();
        const numberVal = parseInt(idInput);

        // Composite Key to ensure uniqueness per year: "YYYY-ID"
        // This prevents "1" in 2026 colliding with "1" in 2027.
        const compositeId = `${year}-${numberVal}`;

        const orderData = {
            id: compositeId,        // Internal Unique Key
            displayId: numberVal,   // Visual Number
            date: dateInput,
            shop: clientInput,
            amount: parseFloat(amountInput),
            noTampo: noTampoInput,
            facturadoTodo: facturadoTodoInput,
            comments: commentsInput,
            comments: commentsInput,
            year: year,
            persistedIsNewClient: isNewClient
        };

        // Handle ID Change or Migration (Delete old if exists and different)
        // e.g. changing date moves order to new Year-ID, or migrating old "1" to "2026-1"
        const orderIdField = document.getElementById('orderId');
        const originalId = orderIdField.dataset.originalId;

        if (originalId && originalId !== compositeId) {
            console.log(`Renaming/Migrating order from ${originalId} to ${compositeId}`);
            await dataManager.deleteOrder(originalId);
        }

        await dataManager.createOrder(orderData);

        // Handle "New Client" flag
        if (isNewClient) {
            // Find client by name to get their code (ID)
            const clients = await dataManager.getClients();
            const client = clients.find(c => c.name === clientInput);
            if (client) {
                // Update client createdAt to now
                const now = new Date().toISOString();
                // We use db directly to update
                // Since 'clients' store uses 'code' as key, we need that.
                await dataManager.db.put('clients', { ...client, createdAt: now });
            }
        }

        closeNewOrderModal();
        renderPedidos(); // Reload view

        // Optional: Show success toast
    } catch (error) {
        console.error(error);
        alert('Error al guardar el pedido: ' + error.message);
    }
}

async function deleteCurrentOrder() {
    const orderIdField = document.getElementById('orderId');
    const idToDelete = orderIdField.dataset.originalId;

    // DEBUG: Alert ID
    alert("Debug: Intentando borrar ID: " + idToDelete);

    if (!idToDelete) {
        alert("No se puede eliminar: Falta ID original. ¿Es un pedido nuevo?");
        return;
    }

    if (!confirm('¿Estás seguro de que quieres ELIMINAR este pedido permanentemente?')) {
        return;
    }

    try {
        console.log("Llamando a db.deleteOrder con", idToDelete);
        await dataManager.deleteOrder(idToDelete);

        alert("Debug: DB delete completado. Recargando...");

        closeNewOrderModal();

        if (typeof renderPedidos === 'function') {
            await renderPedidos();
        } else {
            location.reload();
        }

    } catch (e) {
        console.error(e);
        alert("Error al eliminar el pedido: " + e.message);
    }
}

// --- MAPA VIEW ---
function renderMapa() {
    const app = document.getElementById('app');

    const headerHtml = getCommonHeaderHtml('Mapa');

    let contentHtml = `<main style="padding: 0; position: relative;">`;

    // Legend floating over map
    contentHtml += `
        <div class="map-legend-card">
            <div class="legend-item">
                <div class="legend-dot legend-red"></div>
                <span>Inactivo > 35d</span>
            </div>
            <div class="legend-item">
                <div class="legend-dot legend-green"></div>
                <span>Al día (<= 35d)</span>
            </div>
            <div class="legend-item">
                <div class="legend-dot" style="background-color: #3b82f6;"></div>
                <span>Sin pedidos este año</span>
            </div>
        </div>
    `;

    // Map Container
    contentHtml += `<div id="map-container"></div>`;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav('mapa');
    app.innerHTML = headerHtml + contentHtml;

    // Initialize Map AFTER DOM is updated
    initLeafletMap();
}

// --- FACTURA VIEW ---
async function renderFactura() {
    const app = document.getElementById('app');

    const headerHtml = getCommonHeaderHtml('Factura');

    let contentHtml = `<main style="padding: 1rem; padding-bottom: 0; height: calc(100vh - 110px); overflow: hidden; display: flex; flex-direction: column;">`;

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Fetch Real Data
    const history = await dataManager.getInvoiceHistory();

    // Show ALL years since 2023
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = startYear; y <= currentYear; y++) {
        years.push(y);
    }

    const allData = years.map(y => history[y] || Array(12).fill(0));
    const totals = allData.map(yearData => yearData.reduce((a, b) => a + b, 0));

    contentHtml += `
        <div class="factura-container">
            <div style="min-width: 100%; width: max-content; display: flex; flex-direction: column; flex-grow: 1;">
                <!-- Header -->
                <div class="fac-header">
                    <div class="col-fac-mes">MES</div>
                    ${years.map(y => `
                        <div class="col-fac-year">
                            <div class="year-header-box">${y}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="fac-body">
    `;

    months.forEach((mes, mIdx) => {
        contentHtml += `
            <div class="fac-row">
                <div class="cell-fac-mes">${mes}</div>
                ${years.map((y, yIdx) => `
                    <div class="cell-fac-input">
                        <input type="text" inputmode="numeric" class="fac-input" 
                               value="${allData[yIdx][mIdx] === 0 ? '' : Math.round(allData[yIdx][mIdx]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}" 
                               placeholder="-" 
                               onchange="window.handleFacturaUpdate(${y}, ${mIdx}, this.value, ${mIdx * years.length + yIdx})">
                    </div>
                `).join('')}
            </div>
        `;
    });

    contentHtml += `
                </div> <!-- End body -->

                <!-- Total Row -->
                <div class="fac-total-row">
                    <div class="col-fac-mes total-value">TOTAL</div>
                    ${years.map((y, yIdx) => `
                        <div class="cell-fac-input total-value">
                            ${Math.round(totals[yIdx]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                        </div>
                    `).join('')}
                </div>
            </div> <!-- End layout wrapper -->
            
            <div class="factura-instruction">
                Introduce aquí los importes reales facturados cada mes.
            </div>
        </div>
    `;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav('factura');
    app.innerHTML = headerHtml + contentHtml;

    // Enable Navigation
    setupGridNavigation('.factura-container', '.fac-input');

    // Auto-scroll to the right to see the current year
    setTimeout(() => {
        const container = document.querySelector('.factura-container');
        if (container) {
            container.scrollLeft = container.scrollWidth;
        }
    }, 100);

    // Enable Navigation
    setupGridNavigation('.factura-container', '.fac-input');

    // Restore focus if needed
    if (window.pendingFocusIndex !== undefined && window.pendingFocusContainer === '.factura-container') {
        const inputs = document.querySelectorAll('.factura-container .fac-input');
        if (inputs[window.pendingFocusIndex]) {
            inputs[window.pendingFocusIndex].focus();
            inputs[window.pendingFocusIndex].select();
        }
        window.pendingFocusIndex = undefined;
    }

    // Scroll to right to show latest year
    const container = document.querySelector('.factura-container');
    if (container) {
        requestAnimationFrame(() => {
            container.scrollLeft = container.scrollWidth;
        });
    }
}

async function initLeafletMap() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        document.getElementById('map-container').innerHTML = '<div class="p-4 text-center">Error: Mapa no disponible offline.</div>';
        return;
    }

    // Default center (Asturias roughly)
    const centerLat = 43.36;
    const centerLng = -5.85;
    const map = L.map('map-container').setView([centerLat, centerLng], 9);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    try {
        const clients = await dataManager.getClients();
        const orders = await dataManager.getOrders();

        // Helper: safe float parse (handle commas)
        // Helper: safe float parse (handle commas)
        const parseCoord = (val) => {
            if (val === null || val === undefined || val === '') return null;
            if (typeof val === 'number') return val;
            const parsed = parseFloat(String(val).replace(',', '.').trim());
            return isNaN(parsed) ? null : parsed;
        };

        // Helper: Days since last order
        // Helper: Days since last order
        const now = new Date();
        const currentYear = now.getFullYear();

        const getDaysSinceLastOrder = (clientName) => {
            // Filter by shop AND current year
            const clientOrders = orders.filter(o =>
                o.shop === clientName &&
                new Date(o.dateISO || o.date).getFullYear() === currentYear
            );

            if (clientOrders.length === 0) return 999;

            const dates = clientOrders.map(o => new Date(o.dateISO || o.date).getTime());
            const maxDate = Math.max(...dates);

            const diffTime = Math.abs(now - maxDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        const validClients = clients.filter(c => parseCoord(c.lat) && parseCoord(c.lng));

        // Group by coordinates to handle overlaps (Spiderfy logic)
        const grouped = new Map();
        validClients.forEach(client => {
            const lat = parseCoord(client.lat);
            const lng = parseCoord(client.lng);
            const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(client);
        });

        grouped.forEach((group) => {
            const baseLat = parseCoord(group[0].lat);
            const baseLng = parseCoord(group[0].lng);

            group.forEach((client, index) => {
                let finalLat = baseLat;
                let finalLng = baseLng;

                // If overlap, spread in circle
                if (group.length > 1) {
                    const angle = (index / group.length) * Math.PI * 2;
                    const offset = 0.00015; // Approx 15m radius
                    finalLat = baseLat + Math.cos(angle) * offset;
                    finalLng = baseLng + Math.sin(angle) * offset;
                }

                const daysAgo = getDaysSinceLastOrder(client.name);

                let color = '#3b82f6'; // BLUE (Default / No orders)
                let textColorClass = 'text-gray-500';

                if (daysAgo !== 999) {
                    if (daysAgo <= 35) {
                        color = '#22c55e'; // GREEN
                        textColorClass = 'text-green-600';
                    } else {
                        color = '#ef4444'; // RED
                        textColorClass = 'text-red-500';
                    }
                }

                L.circleMarker([finalLat, finalLng], {
                    color: 'white',
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 1,
                    radius: 7 // Slightly larger for better touch target
                }).addTo(map)
                    .bindPopup(`
                      <div class="text-center">
                        <b class="text-sm text-gray-800">${client.name}</b><br>
                        <span class="text-xs text-gray-500">${client.location || ''}</span><br>
                        <div class="mt-1 ${textColorClass} font-bold text-xs">
                            ${daysAgo === 999 ? 'Sin pedidos este año' : `Hace ${daysAgo} días`}
                        </div>
                      </div>
                  `);
            });
        });

    } catch (err) {
        console.error("Error loading map data", err);
    }

    // --- GEOLOCATION (Blue Dot) ---
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                L.circleMarker([latitude, longitude], {
                    color: 'white',
                    weight: 3,
                    fillColor: '#f59e0b', // Amber/Orange for high visibility
                    fillOpacity: 1,
                    radius: 10
                }).addTo(map)
                    .bindPopup('<b>Mi Ubicación</b>');

                // Optional: Fly to user if desired, or keep view to show all clients
                // map.flyTo([latitude, longitude], 10);
            },
            (error) => {
                console.warn("Geolocation warning", error);
            },
            { enableHighAccuracy: true }
        );
    }
}

// Make functions global
window.renderDash = renderDash;
window.renderPedidos = renderPedidos;
window.renderTotales = renderTotales;
window.renderClientes = renderClientes;
// --- VENTAS VIEW ---
async function renderVentas() { // Made Async
    const app = document.getElementById('app');

    // Header logic: 'timeline' is active
    const headerHtml = getCommonHeaderHtml('Ventas');

    // Fetch Real Data
    const history = await dataManager.getSalesHistory();

    // Dynamic Years: 2023 to (Current Year)
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    const endYear = currentYear;
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
        years.push(y);
    }

    const allData = years.map(y => history[y] || Array(12).fill(0));

    let contentHtml = `<main style="padding: 1rem; padding-bottom: 0; height: calc(100vh - 110px); overflow: hidden; display: flex; flex-direction: column;">`;

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const totals = allData.map(yearData => sum(yearData));

    contentHtml += `
        <div class="ventas-container">
            <div style="min-width: 100%; width: max-content; display: flex; flex-direction: column; flex-grow: 1;">
                <!-- Header -->
                <div class="ventas-header">
                    <div class="col-ventas-mes">MES</div>
                    ${years.map(y => `
                        <div class="col-ventas-year">
                            <div class="ventas-year-box">${y}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="ventas-body">
    `;

    months.forEach((mes, mIdx) => {
        contentHtml += `
            <div class="ventas-row">
                <div class="cell-ventas-mes">${mes}</div>
                 ${allData.map((arr, yIdx) => `
                     <div class="cell-ventas-input">
                        <input type="text" inputmode="numeric" class="ventas-input" 
                               value="${arr[mIdx] === 0 ? '' : Math.round(arr[mIdx]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}" 
                               placeholder="-" 
                               onchange="window.handleSalesUpdate(${years[yIdx]}, ${mIdx}, this.value, ${mIdx * years.length + yIdx})"
                        >
                     </div>
                 `).join('')}
            </div>
        `;
    });

    contentHtml += `
                </div> <!-- End body -->

                <!-- Total Row -->
                <div class="ventas-total-row">
                    <div class="col-ventas-mes total-amount">TOTAL</div>
                    ${totals.map((t, idx) => {
        let percentHtml = '';
        if (idx > 0) {
            const prevTotal = totals[idx - 1];
            if (prevTotal > 0) {
                const diffPercent = ((t - prevTotal) / prevTotal) * 100;
                const isPositive = diffPercent >= 0;
                const colorClass = isPositive ? 'percent-green' : 'percent-red';
                const sign = isPositive ? '+' : '';
                percentHtml = `<span class="total-percent ${colorClass}">${sign}${Math.round(diffPercent)}%</span>`;
            } else if (t === 0 && prevTotal === 0) {
                percentHtml = `<span class="total-percent percent-green">0%</span>`;
            } else {
                percentHtml = `<span class="total-percent percent-green">+100%</span>`;
            }
        } else {
            // Placeholder for the first year so it aligns
            percentHtml = `<span class="total-percent" style="opacity: 0;">-</span>`;
        }

        return `
                            <div class="total-cell-complex">
                                <span class="total-amount">${Math.round(t).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                                ${percentHtml}
                            </div>
                        `;
    }).join('')}
                </div>
            </div> <!-- End layout wrapper -->
        </div>
    `;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav(null);
    app.innerHTML = headerHtml + contentHtml;

    // Enable Navigation
    setupGridNavigation('.ventas-container', '.ventas-input');

    // Auto-scroll to the right to show latest year
    setTimeout(() => {
        const container = document.querySelector('.ventas-container');
        if (container) {
            container.scrollLeft = container.scrollWidth;
        }
    }, 100);

    // Restore focus if needed
    if (window.pendingFocusIndex !== undefined && window.pendingFocusContainer === '.ventas-container') {
        const inputs = document.querySelectorAll('.ventas-container .ventas-input');
        if (inputs[window.pendingFocusIndex]) {
            inputs[window.pendingFocusIndex].focus();
            inputs[window.pendingFocusIndex].select();
        }
        window.pendingFocusIndex = undefined;
    }
}

// --- DEPARTAMENTOS VIEW ---
async function renderDepartamentos() {
    const app = document.getElementById('app');

    const headerHtml = getCommonHeaderHtml('Departamentos', {
        showBack: true,
        showSystemIcons: false, // Ocultar iconos para no saturar el encabezado con el botón
        extraAction: `
             <button class="btn-primary-header" onclick="openDeptModal()">
                Nuevo departamento
            </button>
        `
    });

    let contentHtml = `<main style="padding: 1rem; padding-bottom: 100px;">`;

    // Load Departments
    const depts = await dataManager.getDepartamentos();

    contentHtml += `<div class="flex flex-col gap-3">`;

    if (!depts || depts.length === 0) {
        contentHtml += `
            <div class="text-center p-8 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
                <button class="btn-primary mb-4" onclick="openDeptModal()">Nuevo departamento</button>
                <span class="material-icons-round text-gray-300" style="font-size: 48px;">category</span>
                <p class="text-gray-500 mt-2">No tienes departamentos creados.</p>
            </div>
        `;
    } else {
        depts.forEach(dept => {
            const displayName = dept.contactName ? `${dept.contactName} - ${dept.name}` : dept.name;
            contentHtml += `
                <div class="card dept-card flex justify-between items-center shadow-sm cursor-pointer" onclick="openDeptDetailModal('${dept.id}')">
                    <div class="flex items-center gap-6">
                        <div class="icon-circle-btn bg-blue-50 text-blue-primary" style="flex-shrink: 0;">
                            <span class="material-icons-round">person</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <h3 class="font-bold text-lg text-gray-800" style="line-height: 1.2;">${displayName}</h3>
                            ${dept.functions ? `<p class="text-sm text-gray-500 line-clamp-1">${dept.functions}</p>` : ''}
                        </div>
                    </div>
                     <span class="material-icons-round text-gray-300">chevron_right</span>
                </div>
            `;
        });
    }
    contentHtml += `</div>`;

    contentHtml += `</main>`;
    // reuse 'dash' bottom nav active state or none
    contentHtml += renderBottomNav(null);
    app.innerHTML = headerHtml + contentHtml;

    injectDeptModal();
    injectDeptDetailModal();
}

function injectDeptDetailModal() {
    const existing = document.getElementById('deptDetailModal');
    if (existing) existing.remove();

    const modalHtml = `
    <div id="deptDetailModal" class="modal-overlay">
        <div class="modal-content" style="max-height: 90vh;">
            <div class="modal-header">
                <h2 id="detailTitle">Detalle</h2>
                <button class="icon-btn" onclick="closeDeptDetailModal()"><span class="material-icons-round">close</span></button>
            </div>
            <div class="modal-body">
                <div id="detailContent" class="flex flex-col gap-4">
                    <!-- Dynamic info -->
                </div>
 
                <div class="flex justify-center flex-wrap gap-3 mt-4">
                    <button id="btnCall" class="action-btn-circle bg-green-light text-green">
                        <span class="material-icons-round">call</span>
                        <span class="text-sm">Llamar</span>
                    </button>
                    <button id="btnWA" class="action-btn-circle bg-green-500 text-white">
                        <span class="material-icons-round">chat</span>
                        <span class="text-sm">WhatsApp</span>
                    </button>
                    <button id="btnMail" class="action-btn-circle bg-blue-light text-blue-primary">
                        <span class="material-icons-round">mail</span>
                        <span class="text-sm">Email</span>
                    </button>
                </div>
 
                <div class="modal-actions mt-8">
                    <button id="btnDeleteDept" class="btn-danger">
                        <span class="material-icons-round">delete</span>
                        Eliminar
                    </button>
                    <button id="btnEditDept" class="btn-primary">
                        <span class="material-icons-round">edit</span>
                        Editar
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function openDeptDetailModal(id) {
    const depts = await dataManager.getDepartamentos();
    const dept = depts.find(d => d.id === String(id));
    if (!dept) return;

    const modal = document.getElementById('deptDetailModal');
    const content = document.getElementById('detailContent');
    const title = document.getElementById('detailTitle');

    title.innerText = dept.name;

    content.innerHTML = `
        <div class="mb-4 text-center">
            <span class="label-detail">Nombre:</span>
            <p class="text-detail-xl font-bold">${dept.contactName || '---'}</p>
        </div>
        
        <div class="detail-field-box-gray p-4 rounded-xl mb-8">
            <span class="label-detail">Funciones:</span>
            <p class="text-detail-large text-gray-800 font-medium">${dept.functions || 'Sin descripción detallada'}</p>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="detail-field-box-gray text-center">
                <span class="label-detail">Teléfono:</span>
                <p class="text-detail-large font-bold">${dept.phone || '---'}</p>
            </div>
            <div class="detail-field-box-gray text-center">
                <span class="label-detail">WhatsApp:</span>
                <p class="text-detail-large font-bold">${dept.whatsapp || '---'}</p>
            </div>
        </div>

        <div class="detail-field-box-gray text-center mb-10">
            <span class="label-detail">Email:</span>
            <p class="text-detail-large font-bold">${dept.mail || '---'}</p>
        </div>
    `;





    // Button actions
    document.getElementById('btnCall').onclick = () => dept.phone ? window.location.href = `tel:${dept.phone}` : alert('Sin teléfono');
    document.getElementById('btnWA').onclick = () => dept.whatsapp ? window.open(`https://wa.me/34${dept.whatsapp.replace(/\s+/g, '')}`, '_blank') : alert('Sin WhatsApp');
    document.getElementById('btnMail').onclick = () => dept.mail ? window.location.href = `mailto:${dept.mail}` : alert('Sin email');

    document.getElementById('btnEditDept').onclick = () => {
        closeDeptDetailModal();
        openDeptModal(dept);
    };

    document.getElementById('btnDeleteDept').onclick = async () => {
        if (confirm('¿Borrar departamento?')) {
            await dataManager.deleteDepartamento(dept.id);
            closeDeptDetailModal();
            renderDepartamentos();
        }
    };

    modal.classList.add('open');
}

function closeDeptDetailModal() {
    const modal = document.getElementById('deptDetailModal');
    if (modal) modal.classList.remove('open');
}

window.openDeptDetailModal = openDeptDetailModal;
window.closeDeptDetailModal = closeDeptDetailModal;


function injectDeptModal() {
    // Remove if exists to prevent stale state
    const existing = document.getElementById('newDeptModal');
    if (existing) existing.remove();

    const modalHtml = `
    <div id="newDeptModal" class="modal-overlay">
        <div class="modal-content" style="max-height: 90vh;">
            <div class="modal-header">
                <h2>Nuevo Departamento</h2>
                <button class="icon-btn" onclick="closeDeptModal()"><span class="material-icons-round">close</span></button>
            </div>
            <div class="modal-body">
                <form id="newDeptForm" onsubmit="event.preventDefault(); saveNewDepartment();">
                    <div class="mb-4">
                         <label class="form-label">Departamento *</label>
                         <input type="text" id="deptName" class="form-input" required placeholder="Ej: Recursos Humanos">
                    </div>
                    
                    <div class="mb-4">
                         <label class="form-label">Nombre:</label>
                         <input type="text" id="deptContactName" class="form-input" placeholder="Nombre de contacto">
                    </div>
 
                    <div class="mb-4">
                         <label class="form-label">Funciones</label>
                         <textarea id="deptFunctions" class="form-input" rows="3" placeholder="Descripción de funciones..."></textarea>
                    </div>
 
                    <div class="grid grid-cols-2 gap-4">
                        <div class="mb-4">
                             <label class="form-label">Teléfono</label>
                             <input type="tel" id="deptPhone" class="form-input" placeholder="600 000 000">
                        </div>
                        <div class="mb-4">
                             <label class="form-label">Whatsapp:</label>
                             <input type="tel" id="deptWhatsapp" class="form-input" placeholder="600 000 000">
                        </div>
                    </div>
 
                     <div class="mb-4">
                         <label class="form-label">Mail:</label>
                         <input type="email" id="deptMail" class="form-input" placeholder="ejemplo@email.com">
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn-ghost" onclick="closeDeptModal()">Cancelar</button>
                        <button type="submit" class="btn-primary">
                            <span class="material-icons-round">save</span>
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.renderDepartamentos = renderDepartamentos;

// --- DEPARTAMENTOS LOGIC ---
function openDeptModal(editData = null) {
    let modal = document.getElementById('newDeptModal');

    if (!modal) {
        injectDeptModal();
        modal = document.getElementById('newDeptModal');
    }

    if (modal) {
        const form = document.getElementById('newDeptForm');
        const title = modal.querySelector('h2');
        if (form) form.reset();

        // Reset hidden ID if any
        let idInput = document.getElementById('deptId');
        if (!idInput) {
            idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.id = 'deptId';
            form.appendChild(idInput);
        }
        idInput.value = '';

        if (editData) {
            title.innerText = 'Editar Departamento';
            idInput.value = editData.id;
            document.getElementById('deptName').value = editData.name;
            document.getElementById('deptContactName').value = editData.contactName;
            document.getElementById('deptFunctions').value = editData.functions;
            document.getElementById('deptPhone').value = editData.phone;
            document.getElementById('deptWhatsapp').value = editData.whatsapp;
            document.getElementById('deptMail').value = editData.mail;
        } else {
            title.innerText = 'Nuevo Departamento';
        }

        modal.classList.add('open');
    }
}

function closeDeptModal() {
    const modal = document.getElementById('newDeptModal');
    if (modal) modal.classList.remove('open');
}

window.openDeptModal = openDeptModal;
window.closeDeptModal = closeDeptModal;

async function saveNewDepartment() {
    const idInput = document.getElementById('deptId');
    const nameInput = document.getElementById('deptName');
    const contactInput = document.getElementById('deptContactName');
    const functionsInput = document.getElementById('deptFunctions');
    const phoneInput = document.getElementById('deptPhone');
    const whatsappInput = document.getElementById('deptWhatsapp');
    const mailInput = document.getElementById('deptMail');

    if (!nameInput.value.trim()) {
        alert('El nombre del departamento es obligatorio');
        return;
    }

    const deptData = {
        name: nameInput.value.trim(),
        contactName: contactInput ? contactInput.value.trim() : '',
        functions: functionsInput ? functionsInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        whatsapp: whatsappInput ? whatsappInput.value.trim() : '',
        mail: mailInput ? mailInput.value.trim() : '',
        id: idInput ? idInput.value : undefined,
        createdAt: new Date().toISOString()
    };

    try {
        await dataManager.saveDepartamento(deptData);
        closeDeptModal();
        renderDepartamentos(); // Reload list
    } catch (e) {
        console.error(e);
        alert('Error al guardar');
    }
}
window.saveNewDepartment = saveNewDepartment;


// ... existing code ...
// Make functions global
window.renderDash = renderDash;
window.renderPedidos = renderPedidos;
window.renderTotales = renderTotales;
window.renderClientes = renderClientes;
window.renderAlertas = renderAlertas;
window.renderObjetivos = renderObjetivos;
// --- MEDIAS MENSUALES VIEW ---
async function renderMedias() {
    const app = document.getElementById('app');

    // Header logic: 'history' (clock) is active
    const headerHtml = getCommonHeaderHtml('Medias Mensuales');

    let contentHtml = `<main style="padding: 0; display: flex; flex-direction: column; height: calc(100vh - 110px); overflow: hidden;">`;

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Fetch Real Data for Medias
    const history = await dataManager.getSalesHistory();
    const currentYear = new Date().getFullYear();

    // Obtener todos los años disponibles que sean menores al actual
    const allYears = Object.keys(history).map(Number).sort((a, b) => a - b);
    const validYears = allYears.filter(y => y < currentYear);
    const yearsCount = validYears.length > 0 ? validYears.length : 1;

    // Calcular promedios mensuales
    const monthAverages = months.map((_, i) => {
        let sum = 0;
        validYears.forEach(y => {
            sum += (history[y][i] || 0);
        });
        return Math.floor(sum / yearsCount);
    });

    // Calculate Total Annual Average
    const annualAverage = Math.floor(monthAverages.reduce((a, b) => a + b, 0));


    contentHtml += `
        <div class="medias-container">
            <div class="months-grid">
                ${months.map((mes, i) => `
                    <div class="month-card">
                        <span class="month-card-title">${mes}</span>
                        <span class="month-card-value">${monthAverages[i].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                    </div>
                `).join('')}
            </div>

            <div class="annual-media-card">
                <span class="annual-title">MEDIA VENTAS</span>
                <span class="annual-value">${annualAverage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                <div class="annual-chart-deco">
                    <span class="material-icons-round" style="font-size: 80px; color: white;">show_chart</span>
                </div>
            </div>
        </div>
    `;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav(null);
    app.innerHTML = headerHtml + contentHtml;
}

// ... existing code ...
// --- AJUSTES VIEW ---
// --- AJUSTES VIEW ---
async function renderAjustes() {
    const app = document.getElementById('app');

    // Fetch data for counters
    const orders = await dataManager.getOrders();
    const ordersCount = orders ? orders.length : 0;

    // Header logic: 'settings' (gear) is active
    const headerHtml = getCommonHeaderHtml('Ajustes');

    let contentHtml = `<main style="padding: 0; display: flex; flex-direction: column; height: 100vh;">`;

    contentHtml += `
        <div class="ajustes-container">
            <div class="ajustes-section-title">
                <span class="material-icons-round text-blue-primary">shield</span>
                Ajustes y Sistema
            </div>

            <div class="info-box-blue">
                Gestiona tus datos y la configuración del tiempo de la aplicación.
            </div>

            <!-- Card 1: Cloud Backups -->
            <div class="settings-card">
                <div class="card-header-row">
                    <div class="icon-box-large bg-purple-light">
                        <span class="material-icons-round">cloud_upload</span>
                    </div>
                    <div>
                        <h3 class="settings-card-title">Copias en Nube (Drive)</h3>
                        <p class="settings-card-desc">Guarda y recupera tus datos directamente desde tu Google Drive.</p>
                    </div>
                </div>
                <div class="actions-row">
                    <button class="btn-purple-fill" style="transition: all 0.2s;" onclick="initiateDriveBackup()">
                        <span class="material-icons-round">upload</span>
                        Guardar Ahora
                    </button>
                    <button class="btn-purple-light" style="transition: all 0.2s;" onclick="openBackupsModal()">
                        <span class="material-icons-round">download</span>
                        Ver Copias
                    </button>
                </div>
            </div>

            <!-- Card 2: Local Backups -->
            <div class="settings-card">
                 <div class="card-header-row">
                    <div class="icon-box-large bg-blue-light">
                        <span class="material-icons-round">sim_card_download</span>
                    </div>
                    <div>
                        <h3 class="settings-card-title">Copias Locales (Excel)</h3>
                        <p class="settings-card-desc">Crea un archivo Excel con todos tus datos actuales para guardar en tu equipo.</p>
                    </div>
                </div>
                <div class="actions-row">
                     <button class="btn-blue-fill" onclick="handleExportExcel()">
                        <span class="material-icons-round">download</span>
                        Exportar Excel
                    </button>
                     <button class="btn-blue-light" onclick="document.getElementById('backupInput').click()">
                        <span class="material-icons-round">upload</span>
                        Importar Excel
                    </button>
                    <input type="file" id="backupInput" accept=".xlsx, .xls" style="display: none;" onchange="handleImportExcel(this)">
                </div>
            </div>

            <!-- Card 3: Drive Sync -->
             <div class="settings-card">
                 <div class="card-header-row">
                    <div class="icon-box-large bg-red-light">
                        <span class="material-icons-round">sync</span>
                    </div>
                    <div>
                        <h3 class="settings-card-title">Sincronización Drive</h3>
                        <p class="settings-card-desc">Conecta la app con tu Google Sheets para guardar copias en la nube.</p>
                    </div>
                </div>
                
                <div class="mb-4">
                    <p class="text-xs font-bold text-gray uppercase mb-2" style="letter-spacing: 0.5px; opacity: 0.7;">URL del Script de Google</p>
                    <input type="text" class="script-url-input" value="${GOOGLE_SCRIPT_URL}" 
                           onchange="saveScriptUrl(this.value)" 
                           placeholder="https://script.google.com/macros/s/..."
                    >
                </div>
                
                <div class="flex justify-between items-center mb-4">
                    <div class="status-badge unknown" id="connectionStatus">
                        <span class="material-icons-round" style="font-size: 16px;">help_outline</span>
                        Estado desconocido
                    </div>
                    <button class="btn-grey-light" style="width: auto; margin-bottom: 0; padding: 0.6rem 1.2rem; border-radius: 10px;" onclick="testDriveConnection()">
                        <span class="material-icons-round" style="font-size: 18px;">refresh</span>
                        Probar
                    </button>
                </div>

                <button class="btn-dark-blue" style="height: 50px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" onclick="forceSyncAll()">
                    <span class="material-icons-round">cloud_upload</span>
                    Forzar Sincronización Todo (${ordersCount})
                </button>
                 <p class="text-xs text-gray text-center mt-3" style="opacity: 0.6; font-style: italic;">
                    Úsalo para enviar pedidos que no se guardaron en Drive.
                 </p>
            </div>

            <div class="settings-card">
                 <div class="card-header-row" style="margin-bottom: 1rem;">
                    <div class="icon-box-large bg-green-light">
                        <span class="material-icons-round">calendar_month</span>
                    </div>
                    <div class="w-full flex justify-between items-center">
                        <div>
                            <h3 class="settings-card-title">Gestión de Años</h3>
                            <p class="settings-card-desc">Añade el próximo año a tus tablas de datos.</p>
                        </div>
                        <button class="btn-green-fill" style="width: auto; padding: 0.6rem 1rem; flex-direction: row; gap: 0.5rem;" onclick="handleAddNextYear()">
                             <span class="material-icons-round" style="font-size: 18px;">add</span>
                             Añadir
                        </button>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <p class="text-xs font-bold text-gray uppercase">AÑOS CONFIGURADOS:</p>
                    <div class="flex gap-2 flex-wrap">
                        <span class="year-chip">2023</span>
                        <span class="year-chip">2024</span>
                        <span class="year-chip">2025</span>
                        <span class="year-chip">2026</span>
                        <span class="year-chip">${new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>

            <!-- Footer Warning -->
            <div class="warning-box">
                <span class="material-icons-round" style="color: #ea580c;">warning</span>
                <span>Asegúrate de exportar tus datos regularmente. Los cambios en el sistema son permanentes.</span>
            </div>

        </div>

        <!-- Modal Backups -->
        <div id="backupsModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                     <h2 class="text-xl font-bold">Copias Disponibles</h2>
                     <button class="icon-btn" onclick="closeBackupsModal()"><span class="material-icons-round">close</span></button>
                </div>
                <div class="modal-body">
                    <!-- Backup List -->
                    <div class="backup-item">
                        <div class="backup-info">
                            <span class="backup-date">19-01-2026</span>
                            <span class="backup-size">83.7 KB</span>
                        </div>
                        <div class="flex gap-2 items-center">
                            <div class="icon-delete"><span class="material-icons-round" style="font-size: 18px;">delete</span></div>
                            <button class="btn-restore">
                                 <span class="material-icons-round" style="font-size: 16px;">download</span>
                                 Restaurar
                            </button>
                        </div>
                    </div>
                     <div class="backup-item">
                        <div class="backup-info">
                            <span class="backup-date">18-01-2026</span>
                            <span class="backup-size">83.5 KB</span>
                        </div>
                        <div class="flex gap-2 items-center">
                            <div class="icon-delete"><span class="material-icons-round" style="font-size: 18px;">delete</span></div>
                            <button class="btn-restore">
                                 <span class="material-icons-round" style="font-size: 16px;">download</span>
                                 Restaurar
                            </button>
                        </div>
                    </div>
                     <div class="backup-item">
                        <div class="backup-info">
                            <span class="backup-date">15-01-2026</span>
                            <span class="backup-size">83.1 KB</span>
                        </div>
                        <div class="flex gap-2 items-center">
                            <div class="icon-delete"><span class="material-icons-round" style="font-size: 18px;">delete</span></div>
                            <button class="btn-restore">
                                 <span class="material-icons-round" style="font-size: 16px;">download</span>
                                 Restaurar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    contentHtml += `</main>`;
    contentHtml += renderBottomNav(null);
    app.innerHTML = headerHtml + contentHtml;
}

async function openBackupsModal() {
    document.getElementById('backupsModal').classList.add('open');
    document.body.classList.add('no-scroll');

    const modalBody = document.querySelector('#backupsModal .modal-body');
    modalBody.innerHTML = '<div class="text-center p-4 text-gray">Cargando copias desde Drive...<br><small>Esto puede tardar unos segundos</small></div>';

    // Get URL
    const urlInput = document.querySelector('.script-url-input');
    const scriptUrl = urlInput ? urlInput.value.trim() : '';

    if (!scriptUrl || scriptUrl.includes('...')) {
        modalBody.innerHTML = '<div class="text-center p-4 text-red">Error: URL del script no válida o incompleta.</div>';
        return;
    }

    try {
        // Fetch List
        // scriptUrl should end in /exec. We append ?action=list
        const fetchUrl = `${scriptUrl}?action=list`;
        const response = await fetch(fetchUrl);
        const result = await response.json();

        if (result.status === 'success' && Array.isArray(result.files)) {
            if (result.files.length === 0) {
                modalBody.innerHTML = '<div class="text-center p-4 text-gray">No se encontraron copias de seguridad.</div>';
                return;
            }

            let html = '';
            result.files.forEach(file => {
                // file: { id, name, date, size, ... } created by Google Script
                const dateStr = new Date(file.date).toLocaleDateString();
                const sizeStr = (file.size / 1024).toFixed(1) + ' KB';

                html += `
                    <div class="backup-item">
                        <div class="backup-info">
                            <span class="backup-date">${file.name}</span>
                            <span class="backup-size">${dateStr} - ${sizeStr}</span>
                        </div>
                        <div class="flex gap-2 items-center h-full">
                            <button class="flex items-center justify-center p-2 rounded-full hover:bg-red-50 transition-colors" 
                                    style="border: none; background: transparent; cursor: pointer; height: 40px; width: 40px;"
                                    onclick="event.stopPropagation(); console.log('Click delete', '${file.id}'); deleteBackup('${file.id}')" 
                                    title="Eliminar copia">
                                <span class="material-icons-round" style="font-size: 24px; color: #ef4444;">delete</span>
                            </button>
                            <button class="btn-restore flex items-center gap-2 px-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors" 
                                    style="border: none; height: 40px; display: flex; align-items: center;"
                                    onclick="event.stopPropagation(); restoreBackup('${file.id}')">
                                 <span class="material-icons-round" style="font-size: 18px;">download</span>
                                 Restaurar
                            </button>
                        </div>
                        </div>
                    </div>
                `;
            });
            modalBody.innerHTML = html;

        } else {
            modalBody.innerHTML = `<div class="text-center p-4 text-red">Error al obtener lista: ${result.message || 'Respuesta desconocida'}</div>`;
        }

    } catch (error) {
        console.error(error);
        modalBody.innerHTML = `<div class="text-center p-4 text-red">Error de conexión: ${error.message}</div>`;
    }
}

async function restoreBackup(fileId) {
    if (!confirm('¿Estás SEGURO de que quieres restaurar esta copia? \nSE BORRARÁN LOS DATOS ACTUALES y se reemplazarán por los de la copia.')) {
        return;
    }

    const urlInput = document.querySelector('.script-url-input');
    const scriptUrl = urlInput ? urlInput.value.trim() : '';

    // Show loading indicator (maybe simpler handling for now)
    const originalText = document.querySelector('.modal-header h2').textContent;
    document.querySelector('.modal-header h2').textContent = 'Restaurando...';

    try {
        const fetchUrl = `${scriptUrl}?action=get&id=${fileId}`;
        const response = await fetch(fetchUrl);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            // result.data is the JSON string Content of the file
            // We need to parse it if it comes as string, or use as object if auto-parsed.
            // Google script usually returns JSON. If the file content IS json, it might be nested in data.

            let backupData = result.data;
            if (typeof backupData === 'string') {
                try {
                    backupData = JSON.parse(backupData);
                } catch (e) {
                    // Maybe it's already object
                    console.warn("Could not parse data as string, assuming object", e);
                }
            }

            await dataManager.restoreFullBackup(backupData);

            alert('Restauración completada con éxito.');
            location.reload(); // Reload to refresh all views with new data

        } else {
            alert('Error al descargar copia: ' + (result.message || 'Error desconocido'));
        }

    } catch (error) {
        console.error(error);
        alert('Error de conexión al restaurar: ' + error.message);
    } finally {
        document.querySelector('.modal-header h2').textContent = originalText;
    }
}

async function deleteBackup(fileId) {
    if (!confirm('¿Seguro que quieres ELIMINAR esta copia de seguridad?')) {
        return;
    }

    const urlInput = document.querySelector('.script-url-input');
    const scriptUrl = urlInput ? urlInput.value.trim() : '';

    // Feedback visual
    const modalBody = document.querySelector('#backupsModal .modal-body');
    // Optional: show loading overlay or just reload list after

    try {
        const fetchUrl = `${scriptUrl}?action=delete&id=${fileId}`;
        const response = await fetch(fetchUrl);
        const result = await response.json();

        if (result.status === 'success') {
            alert('Copia eliminada correctamente');
            openBackupsModal(); // Refresh list
        } else {
            alert('Error al eliminar: ' + (result.message || 'Error desconocido'));
        }

    } catch (error) {
        console.error(error);
        alert('Error de conexión al eliminar: ' + error.message);
    }
}

function closeBackupsModal() {
    document.getElementById('backupsModal').classList.remove('open');
    document.body.classList.remove('no-scroll');
}

// ... existing code ...
// --- EDIT ORDER LOGIC ---
async function openEditOrderModal(orderId) {
    try {
        console.log("Opening edit for order:", orderId);
        const order = await dataManager.getOrderById(orderId);
        if (!order) {
            console.error("Order not found");
            return;
        }

        openNewOrderModal(); // Opens modal

        // Show Delete Button & Bind Logic Inline
        const btnDelete = document.getElementById('btnDeleteOrder');
        if (btnDelete) {
            btnDelete.style.display = 'block';

            // Remove old listeners just in case (though onclick property overwrite handles it)
            btnDelete.onclick = async function () {
                const idToDelete = document.getElementById('orderId').dataset.originalId;

                // Debug Alert
                alert(`DEBUG FINAL: ID Original detectado: ${idToDelete}`);

                if (!idToDelete) {
                    alert("Error: No se detecta el ID del pedido.");
                    return;
                }

                if (!confirm("¿SEGURO que quieres eliminar este pedido? Esta acción es irreversible.")) {
                    return;
                }

                try {
                    await dataManager.deleteOrder(idToDelete);
                    alert("Pedido eliminado correctamente.");

                    document.getElementById('newOrderModal').classList.remove('open');

                    if (typeof renderPedidos === 'function') {
                        await renderPedidos();
                    } else {
                        location.reload();
                    }
                } catch (e) {
                    alert("Error borrando: " + e.message);
                }
            };
        }

        // Update Title
        const titleEl = document.querySelector('#newOrderModal h2');
        if (titleEl) titleEl.textContent = 'Editar Pedido';

        // Populate Fields
        let dateVal = order.dateISO || order.date;
        if (dateVal && dateVal.includes('T')) dateVal = dateVal.split('T')[0];

        document.getElementById('orderDate').value = dateVal || '';
        // Show Clean ID (remove Year prefix)
        document.getElementById('orderId').value = order.displayId || String(order.id).split('-').pop();
        document.getElementById('orderId').dataset.originalId = order.id;

        document.getElementById('orderClient').value = order.shop;
        document.getElementById('orderAmount').value = order.amount;
        document.getElementById('orderNoTampo').value = order.noTampo || '';
        document.getElementById('orderFacturadoTodo').value = order.facturadoTodo || '';
        document.getElementById('orderComments').value = order.comments || '';

        if (document.getElementById('isNewClientSwitch')) {
            document.getElementById('isNewClientSwitch').checked = !!order.persistedIsNewClient;
        }

    } catch (e) {
        console.error("Error opening edit modal:", e);
    }
}

async function autoFillOrderId() {
    try {
        // Use the date set in the form to determine the year context
        const orderDateInput = document.getElementById('orderDate');
        const dateVal = orderDateInput && orderDateInput.value ? orderDateInput.value : new Date().toISOString();
        const year = new Date(dateVal).getFullYear();

        const orders = await dataManager.getOrders();

        // Filter orders for this year
        const yearOrders = orders.filter(o => {
            const oDate = o.dateISO || o.date;
            if (!oDate) return false;
            return new Date(oDate).getFullYear() === year;
        });

        // Extract numbers
        const ids = yearOrders.map(o => {
            return o.displayId || parseInt(String(o.id).split('-').pop());
        }).filter(n => !isNaN(n));

        let nextId = 1;
        if (ids.length > 0) {
            nextId = Math.max(...ids) + 1;
        }

        const orderIdInput = document.getElementById('orderId');
        if (orderIdInput) {
            orderIdInput.value = nextId;
        }

        // Auto-focus on Client field
        setTimeout(() => {
            const clientInput = document.getElementById('orderClient');
            if (clientInput) clientInput.focus();
        }, 100);

    } catch (error) {
        console.error("Error auto-filling order ID:", error);
    }
}

// --- DELETE ORDER LOGIC ---
async function deleteCurrentOrder() {
    const orderId = document.getElementById('orderId').value;
    if (!orderId) return;

    if (confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
        try {
            await dataManager.deleteOrder(orderId);
            closeNewOrderModal();
            // Refresh views
            await renderPedidos();
            // Also refresh Totales if sticking to auto-refresh logic, or just let user navigate?
            // renderPedidos is enough for the current view.
        } catch (e) {
            console.error(e);
            alert('Error al eliminar: ' + e.message);
        }
    }
}

// Make functions global
window.renderDash = renderDash;
window.renderPedidos = renderPedidos;
window.renderTotales = renderTotales;
window.renderClientes = renderClientes;
window.renderAlertas = renderAlertas;
window.renderObjetivos = renderObjetivos;
window.renderMapa = renderMapa;
window.renderFactura = renderFactura;
window.renderVentas = renderVentas;
window.renderMedias = renderMedias;
window.renderAjustes = renderAjustes; // Export
window.openNewOrderModal = openNewOrderModal;
window.closeNewOrderModal = closeNewOrderModal;
window.saveNewOrder = saveNewOrder;
window.openEditOrderModal = openEditOrderModal;
window.deleteCurrentOrder = deleteCurrentOrder; // Export
window.autoFillOrderId = autoFillOrderId;
window.openClientDetailModal = openClientDetailModal;
window.closeClientDetailModal = closeClientDetailModal;
window.openBackupsModal = openBackupsModal;
window.closeBackupsModal = closeBackupsModal;

// Sales Input Handler
window.handleSalesUpdate = async (year, month, value, currentIndex) => {
    // Limpiar formato (quitar puntos de miles)
    const cleanValue = String(value).replace(/\./g, '').replace(',', '.');
    const numericValue = Math.round(parseFloat(cleanValue)) || 0;

    await dataManager.saveSalesHistory(year, month, numericValue);
    if (currentIndex !== undefined) {
        window.pendingFocusIndex = currentIndex + 1;
        window.pendingFocusContainer = '.ventas-container';
    }
    renderVentas();
};

window.handleFacturaUpdate = async (year, month, value, currentIndex) => {
    // Limpiar formato (quitar puntos de miles)
    const cleanValue = String(value).replace(/\./g, '').replace(',', '.');
    const numericValue = Math.round(parseFloat(cleanValue)) || 0;

    await dataManager.saveInvoiceHistory(year, month, numericValue);
    if (currentIndex !== undefined) {
        window.pendingFocusIndex = currentIndex + 1;
        window.pendingFocusContainer = '.factura-container';
    }
    renderFactura();
};

window.handleGoalUpdate = async (goalPercent, monthIndex, value, currentIndex) => {
    // Limpiar formato (quitar puntos de miles)
    const cleanValue = String(value).replace(/\./g, '').replace(',', '.');
    const numericValue = Math.round(parseFloat(cleanValue)) || 0;

    const goals = await dataManager.getDetailedGoals();
    const key = `data${goalPercent}`;
    if (goals[key]) {
        goals[key][monthIndex] = numericValue;
        await dataManager.saveGoals(goals);

        if (currentIndex !== undefined) {
            window.pendingFocusIndex = currentIndex + 1;
            window.pendingFocusContainer = '.objetivos-container';
        }
        renderObjetivos();
    }
};

// --- NAVIGATION HELPER ---
function setupGridNavigation(containerSelector, inputSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const inputs = Array.from(container.querySelectorAll(inputSelector));

    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const nextIndex = index + 1;

                // Set pending focus in case onchange triggers a re-render
                window.pendingFocusIndex = nextIndex;
                window.pendingFocusContainer = containerSelector;

                if (nextIndex < inputs.length) {
                    inputs[nextIndex].focus();
                    inputs[nextIndex].select();
                } else {
                    input.blur();
                    window.pendingFocusIndex = undefined;
                }
            }
        });
    });
}

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0oAQ1Dq8gKHsy6vutnPh9xylbcFThY1irpehdeQTT9pY7LJAbvNIU0t6ZT0ovD2rMeg/exec";

// --- BACKUP SCHEDULER ---
window.startBackupScheduler = function () {
    console.log("Iniciando planificador de copias automáticas...");
    checkAutoBackup(); // Check immediately on load
    // Check every minute (60 * 1000 ms)
    setInterval(checkAutoBackup, 60000);
};

window.checkAutoBackup = async function () {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    // Config: Monday (1) to Friday (5)
    if (day < 1 || day > 5) return;

    const hour = now.getHours();
    const minutes = now.getMinutes();
    const timeValue = hour * 60 + minutes;

    // Target: 20:30 (1230) to 23:59 (1439)
    // 20 * 60 + 30 = 1200 + 30 = 1230
    // 23 * 60 + 59 = 1380 + 59 = 1439

    if (timeValue >= 1230 && timeValue <= 1439) {
        const todayStr = now.toISOString().split('T')[0];
        const lastBackup = localStorage.getItem('lastAutoBackupDate');

        // If we haven't backed up today, do it
        if (lastBackup !== todayStr) {
            console.log(`[AutoBackup] Hora: ${hour}:${minutes}. Ejecutando copia automática...`);

            // Call backup in silent mode
            const success = await initiateDriveBackup(true);

            if (success) {
                localStorage.setItem('lastAutoBackupDate', todayStr);
                console.log("[AutoBackup] Copia completada y registrada.");
            } else {
                console.error("[AutoBackup] Falló la copia automática.");
            }
        }
    }
};

async function initiateDriveBackup(silent = false) {
    if (!silent) {
        if (!confirm('¿Crear copia de seguridad en Google Drive?')) {
            return false;
        }
    }

    // Use constant for URL, fallback to DOM if for some reason constant is missing (unlikely)
    const scriptUrl = typeof GOOGLE_SCRIPT_URL !== 'undefined' ? GOOGLE_SCRIPT_URL : '';

    if (!scriptUrl) {
        if (!silent) alert('Error: URL del script no definida.');
        console.error('Error: GOOGLE_SCRIPT_URL no definida');
        return false;
    }

    // Indicate loading state (only if button exists)
    const btn = document.querySelector('button[onclick="initiateDriveBackup()"]');
    const originalText = btn ? btn.innerHTML : '';

    if (btn && !silent) {
        btn.innerHTML = '<span class="material-icons-round spin">sync</span> Guardando...';
        btn.disabled = true;
    }

    if (silent) {
        // Optional: Show a non-intrusive toast or console log
        // If we had a toast system: showToast("Iniciando copia automática...", "info");
        console.log("Iniciando copia de seguridad automática...");
    }

    try {
        console.log("Exporting data...");
        const data = await dataManager.exportFullBackup();

        console.log("Sending to Drive...", scriptUrl);

        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            if (!silent) {
                alert('¡Copia de seguridad guardada correctamente en Drive!\nArchivo: ' + result.name);
            } else {
                console.log('Copia automática exitosa:', result.name);
            }
            return true;
        } else {
            const msg = 'Error del servidor: ' + (result.message || 'Desconocido');
            if (!silent) alert(msg);
            console.error(msg);
            return false;
        }

    } catch (error) {
        console.error(error);
        if (!silent) alert('Error al conectar con Drive: ' + error.message);
        return false;
    } finally {
        if (btn && !silent) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}
window.initiateDriveBackup = initiateDriveBackup;
window.restoreBackup = restoreBackup;
window.deleteBackup = deleteBackup;
window.deleteCurrentOrder = deleteCurrentOrder;

// --- BACKUP HELPERS ---
async function handleExportExcel() {
    try {
        const result = await dataManager.exportBackupToExcel();
        if (result.success) {
            // Excel download is handled by XLSX.writeFile automatically in browser
            // alert("Copia exportada correctamente.");
        } else {
            alert("Error al exportar: " + result.message);
        }
    } catch (e) {
        alert("Error: " + e.message);
    }
}

async function handleImportExcel(input) {
    if (input.files && input.files[0]) {
        if (!confirm("⚠️ ATENCIÓN: Al importar una copia de seguridad se SOBREESCRIBIRÁN todos los datos actuales (Clientes, Pedidos, Objetivos).\n\n¿Estás seguro de continuar?")) {
            input.value = ''; // Reset
            return;
        }

        const file = input.files[0];
        try {
            const result = await dataManager.importBackupFromExcel(file);
            if (result.success) {
                alert("Copia restaurada con éxito. La aplicación se recargará.");
                location.reload();
            } else {
                alert("Error al importar: " + result.message);
            }
        } catch (error) {
            alert("Error crítico: " + error.message);
        }
        input.value = ''; // Reset
    }
}

window.handleExportExcel = handleExportExcel;
window.handleImportExcel = handleImportExcel;

// --- DRIVE CONNECTION TEST ---
async function testDriveConnection() {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;

    // Set loading state
    statusEl.innerHTML = `
        <span class="material-icons-round spin" style="font-size: 16px;">sync</span>
        Comprobando...
    `;
    statusEl.className = 'status-text'; // Reset classes
    statusEl.style.color = '#64748b'; // Gray

    const scriptUrl = typeof GOOGLE_SCRIPT_URL !== 'undefined' ? GOOGLE_SCRIPT_URL : '';

    if (!scriptUrl) {
        statusEl.innerHTML = `
            <span class="material-icons-round" style="font-size: 16px;">error</span>
            URL no configurada
        `;
        statusEl.style.color = '#ef4444'; // Red
        return;
    }

    try {
        const response = await fetch(`${scriptUrl}?action=list`);
        const json = await response.json();

        if (json.status === 'success') {
            statusEl.innerHTML = `
                <span class="material-icons-round" style="font-size: 16px;">check_circle</span>
                Sincronización activa
            `;
            statusEl.style.color = '#16a34a'; // Green
        } else {
            throw new Error(json.message || "Respuesta inválida");
        }

    } catch (error) {
        console.error("Test Connection Error", error);
        statusEl.innerHTML = `
            <span class="material-icons-round" style="font-size: 16px;">cancel</span>
            Error de conexión
        `;
        statusEl.style.color = '#ef4444'; // Red
    }
}

window.testDriveConnection = testDriveConnection;

// --- FORCE SYNC WRAPPER ---
async function forceSyncAll() {
    if (!confirm("¿Quieres forzar la subida de TODOS los pedidos locales a Drive?\n\nEsto actualizará el archivo 'Pedidos.xlsx' en tu Drive con los datos de esta aplicación.")) {
        return;
    }

    const btn = document.querySelector('button[onclick="forceSyncAll()"]');
    const originalText = btn ? btn.innerHTML : '';

    if (btn) {
        btn.innerHTML = '<span class="material-icons-round spin">sync</span> Sincronizando...';
        btn.disabled = true;
    }

    try {
        const scriptUrl = typeof GOOGLE_SCRIPT_URL !== 'undefined' ? GOOGLE_SCRIPT_URL : '';
        if (!scriptUrl) throw new Error("URL de script no configurada.");

        const result = await dataManager.forceSyncOrders(scriptUrl);

        if (result.success) {
            alert(`¡Sincronización completada!\nSe han actualizado ${result.count} pedidos en Drive (Pedidos.xlsx).`);
        } else {
            alert("Error: " + result.message);
        }

    } catch (error) {
        alert("Error al sincronizar: " + error.message);
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

window.forceSyncAll = forceSyncAll;
// --- INFO MODAL ---

function openInfoModal() {
    let modal = document.getElementById('infoModal');
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = 'infoModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const currentYear = new Date().getFullYear();

    modal.innerHTML = `
        <div class="modal-content" style="height: 85vh; max-width: 600px;">
            <div class="modal-header">
                <div class="flex items-center gap-2">
                    <span class="material-icons-round text-blue-primary">info</span>
                    <h2 class="text-xl font-bold">Guía de Uso</h2>
                </div>
                <button class="icon-btn" onclick="closeInfoModal()"><span class="material-icons-round">close</span></button>
            </div>
            <div class="modal-body text-gray-800" style="padding: 1.5rem; line-height: 1.6;">
                <p class="text-center font-bold text-blue-primary mb-4" style="font-size: 0.95rem; opacity: 0.9;">
                    App creada por Manuel Fco. Serantes Pérez
                </p>

                <section class="mb-6">
                    <h3 class="font-bold text-blue-primary border-b pb-1 mb-3 flex items-center gap-2">
                        <span class="material-icons-round" style="font-size: 20px;">layers</span> Explora las Vistas
                    </h3>
                    <ul class="flex flex-col gap-4">
                        <li>
                            <strong>📊 Dashboard (Inicio):</strong> Tu panel de control. Gráfico circular de progreso (expandido para mejor lectura) y comparativa de objetivos anuales con nuevo diseño premium.
                        </li>
                        <li>
                            <strong>🛍️ Pedidos:</strong> Registro de actividad comercial con filtros avanzados y creación rápida de ventas.
                        </li>
                        <li>
                            <strong>🏆 Ranking de Ventas:</strong> Analiza tu rendimiento y descubre tus mejores momentos del año con el nuevo sistema de clasificación por facturación.
                        </li>
                        <li>
                            <strong>💶 Totales por Zona:</strong> Análisis preciso por provincias. Ahora incluye el <strong>Total de Pedidos</strong> y el <strong>Ticket Medio Real</strong> (excluyendo automáticamente las muestras de 0€).
                        </li>
                        <li>
                            <strong>👥 Agenda de Clientes:</strong> Base de datos completa con **Búsqueda Inteligente** y botón de limpieza rápida para agilizar tus consultas.
                        </li>
                        <li>
                            <strong>🔔 Panel de Alertas:</strong> Localiza clientes inactivos al instante mediante el nuevo sistema de <strong>tarjetas tintadas</strong> (Verde: Activo | Rojo: +35 días sin compra).
                        </li>
                        <li>
                            <strong>📍 Mapa Interactivo:</strong> Visualización geográfica de tu red de clientes con código de colores según su actividad reciente.
                        </li>
                    </ul>
                </section>

                <section class="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 class="font-bold text-blue-primary mb-3 flex items-center gap-2">
                        <span class="material-icons-round" style="font-size: 20px;">palette</span> Smart Legend (Mapa)
                    </h3>
                    <div class="flex flex-col gap-3 text-sm">
                        <div class="flex items-start gap-3">
                            <div style="min-width: 14px; height: 14px; border-radius: 50%; background-color: #22c55e; margin-top: 3px;"></div>
                            <span><strong>Punto Verde:</strong> Cliente al día. Ha realizado al menos un pedido en los últimos 35 días. Indica una cuenta activa y saludable.</span>
                        </div>
                        <div class="flex items-start gap-3">
                            <div style="min-width: 14px; height: 14px; border-radius: 50%; background-color: #ef4444; margin-top: 3px;"></div>
                            <span><strong>Punto Rojo:</strong> Cliente inactivo. Han pasado más de 35 días desde su última compra este año. ¡Necesita atención!</span>
                        </div>
                        <div class="flex items-start gap-3">
                            <div style="min-width: 14px; height: 14px; border-radius: 50%; background-color: #3b82f6; margin-top: 3px;"></div>
                            <span><strong>Punto Azul:</strong> Cliente sin pedidos en el año actual (${currentYear}). Incluye clientes nuevos o aquellos que aún no has visitado en este ciclo.</span>
                        </div>
                        <div class="flex items-start gap-3">
                            <div style="min-width: 14px; height: 14px; border-radius: 50%; background-color: #f59e0b; margin-top: 3px;"></div>
                            <span><strong>Punto Ámbar:</strong> Tu posición GPS actual. Sirve de referencia para planificar tu ruta de visitas.</span>
                        </div>
                    </div>
                </section>

                <section class="mb-6">
                    <h3 class="font-bold text-orange-600 border-b pb-1 mb-3 flex items-center gap-2">
                        <span class="material-icons-round" style="font-size: 20px;">event_repeat</span> Ciclo de Año Nuevo (Transición)
                    </h3>
                    <p class="text-sm mb-3">
                        La aplicación está diseñada para ser autónoma. Cada <strong>1 de enero a las 00:00</strong>:
                    </p>
                    <div class="text-sm flex flex-col gap-3 ml-2">
                        <div class="flex items-start gap-2">
                            <span class="material-icons-round text-orange-400" style="font-size: 18px;">auto_awesome</span>
                            <span><strong>Reset inteligente:</strong> Las vistas de Alertas y Mapa se reinician para mostrar el estado real del nuevo año (todos los clientes pasan a azul).</span>
                        </div>
                        <div class="flex items-start gap-2">
                            <span class="material-icons-round text-orange-400" style="font-size: 18px;">storage</span>
                            <span><strong>Inicialización:</strong> Se crean automáticamente las estructuras de datos para las nuevas tablas de ventas y facturación de ese año.</span>
                        </div>
                        <div class="flex items-start gap-2">
                            <span class="material-icons-round text-orange-400" style="font-size: 18px;">history</span>
                            <span><strong>Histórico:</strong> Todos tus datos de años anteriores permanecen seguros y consultables en las vistas correspondientes.</span>
                        </div>
                    </div>
                </section>

                <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mb-6">
                    <span class="material-icons-round text-blue-primary" style="font-size: 24px;">security</span>
                    <div>
                        <p class="text-xs text-blue-900 font-bold mb-1 italic">Seguridad y Backups</p>
                        <p class="text-xs text-blue-800">
                            Recuerda sincronizar tus pedidos con <strong>Google Drive</strong> desde los Ajustes periódicamente. Esto asegura que tus datos estén a salvo ante cualquier problema con tu dispositivo.
                        </p>
                    </div>
                </div>

                <p class="text-center text-xs font-bold text-blue-primary mt-8 mb-4" style="opacity: 0.8;">
                    App creada por Manuel Fco. Serantes Pérez
                </p>
            </div>
        </div>
    `;

    modal.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.classList.remove('no-scroll');
    }
}

window.openInfoModal = openInfoModal;
window.closeInfoModal = closeInfoModal;

// --- RANKING MODAL ---
async function openRankingModal() {
    let modal = document.getElementById('rankingModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'rankingModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const currentYear = new Date().getFullYear();
    const ranking = await dataManager.getYearlyRanking();

    let rankingListHtml = '';
    if (ranking.length === 0) {
        rankingListHtml = `<p class="text-center text-gray p-4">No hay ventas registradas en ${currentYear}.</p>`;
    } else {
        rankingListHtml = `<div class="flex flex-col gap-2">`;
        ranking.forEach(item => {
            let rankClass = 'rank-default';
            if (item.rank === 1) rankClass = 'rank-1';
            if (item.rank === 2) rankClass = 'rank-2';
            if (item.rank === 3) rankClass = 'rank-3';

            rankingListHtml += `
            <div class="card p-3 flex items-center justify-between" style="margin-bottom: 0.5rem; border-radius: 12px; border: 1px solid #f3f4f6;">
                <div class="flex items-center gap-3">
                    <div class="rank-badge ${rankClass}">
                        ${item.rank}
                    </div>
                    <span class="font-bold text-gray-800 text-sm">${item.name}</span>
                </div>
                <span class="font-bold text-blue-primary text-sm">${Math.round(item.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €</span>
            </div>
            `;
        });
        rankingListHtml += `</div>`;
    }

    modal.innerHTML = `
        <div class="modal-content" style="height: 85vh; width: 95%; max-width: 450px; display: flex; flex-direction: column; margin: 0 auto;">
            <div class="modal-header">
                <div class="flex items-center gap-2">
                    <span class="material-icons-round text-yellow-500">emoji_events</span>
                    <h2 class="text-xl font-bold">Ranking Ventas ${currentYear}</h2>
                </div>
                <button class="icon-btn" onclick="closeRankingModal()"><span class="material-icons-round">close</span></button>
            </div>
            <div class="modal-body bg-gray-50" style="padding: 1rem; flex: 1; overflow-y: auto;">
                ${rankingListHtml}
            </div>
        </div>
        `;

    modal.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeRankingModal() {
    const modal = document.getElementById('rankingModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.classList.remove('no-scroll');
    }
}

window.openRankingModal = openRankingModal;
window.closeRankingModal = closeRankingModal;
