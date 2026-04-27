// public/js/api.js — Carga dinámica de documentos desde la API

const API_BASE = '/api';

async function cargarDocumentos(etapaId, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="col-12 loading-state" style="text-align:center;padding:3rem;color:#64748b;">
            <div class="spinner-border mb-3" style="width:2rem;height:2rem;color:#1d4ed8;"></div>
            <p class="small">Cargando documentos...</p>
        </div>`;

    try {
        const res  = await fetch(`${API_BASE}/documentos/etapa/${etapaId}`);
        const json = await res.json();

        if (!json.ok || json.data.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12">
                    <div style="text-align:center;padding:3rem;color:#94a3b8;">
                        <i class="bi bi-file-earmark-x" style="font-size:2.5rem;opacity:0.4;display:block;margin-bottom:0.75rem;"></i>
                        <p class="small mb-0">No hay documentos disponibles en este momento.</p>
                    </div>
                </div>`;
            return;
        }

        contenedor.innerHTML = json.data.map(doc => crearTarjeta(doc)).join('');

    } catch (err) {
        console.error('Error al cargar documentos:', err);
        contenedor.innerHTML = `
            <div class="col-12">
                <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:16px;padding:1.25rem 1.5rem;">
                    <i class="bi bi-exclamation-triangle-fill me-2" style="color:#d97706;"></i>
                    <span style="font-size:0.875rem;color:#92400e;">No se pudieron cargar los documentos. Verifica tu conexión.</span>
                </div>
            </div>`;
    }
}

function crearTarjeta(doc) {
    const tieneArchivo = Boolean(doc.nombre_archivo);
    const tieneGuia    = doc.tiene_guia && doc.nombre_guia;

    const btnDescargar = tieneArchivo
        ? `<a href="${API_BASE}/documentos/descargar/${doc.id}"
              class="btn-download ${tieneGuia ? '' : 'w-100'}"
              style="${tieneGuia ? 'flex:1;justify-content:center;' : ''}"
              download>
             <i class="bi bi-download"></i> Descargar
           </a>`
        : `<button class="btn-disabled ${tieneGuia ? '' : 'w-100'}"
              style="${tieneGuia ? 'flex:1;justify-content:center;' : ''}"
              disabled>
             <i class="bi bi-clock"></i> Próximamente
           </button>`;

    const btnGuia = tieneGuia
        ? `<a href="${API_BASE}/documentos/descargar/${doc.id}?guia=1"
              class="btn-guide"
              title="Descargar guía de llenado"
              download>
             <i class="bi bi-book"></i> Guía
           </a>`
        : '';

    const iconos = {
        1: { bg: '#eff6ff', color: '#1d4ed8', icon: 'bi-file-earmark-pdf-fill' },
        2: { bg: '#f0fdf4', color: '#059669', icon: 'bi-file-earmark-bar-graph-fill' },
        3: { bg: '#fff1f2', color: '#dc2626', icon: 'bi-file-earmark-check-fill' },
    };
    const est = iconos[doc.etapa_id] || iconos[1];

    return `
        <div class="col-md-4">
            <div class="doc-card">
                <div class="doc-icon" style="background:${est.bg};color:${est.color};">
                    <i class="bi ${est.icon}"></i>
                </div>
                <h6 class="doc-title">${escapeHtml(doc.titulo)}</h6>
                <p class="doc-desc">${escapeHtml(doc.descripcion || '')}</p>
                <div class="d-flex gap-2 mt-auto">
                    ${btnDescargar}
                    ${btnGuia}
                </div>
            </div>
        </div>`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
