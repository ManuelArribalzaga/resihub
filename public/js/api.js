// public/js/api.js — Lógica compartida para llamadas a la API

const API_BASE = '/api';

/**
 * Obtiene los documentos de una etapa específica y renderiza las tarjetas
 * @param {number} etapaId - 1=Solicitud, 2=Seguimiento, 3=Liberación
 * @param {string} contenedorId - ID del elemento HTML donde renderizar
 */
async function cargarDocumentos(etapaId, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  // Mostrar skeleton loader
  contenedor.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width:2.5rem;height:2.5rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="text-muted mt-3 small">Cargando documentos...</p>
    </div>`;

  try {
    const res  = await fetch(`${API_BASE}/documentos/etapa/${etapaId}`);
    const json = await res.json();

    if (!json.ok || json.data.length === 0) {
      contenedor.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info rounded-4" role="alert">
            <i class="bi bi-info-circle me-2"></i>
            No hay documentos disponibles en este momento.
          </div>
        </div>`;
      return;
    }

    contenedor.innerHTML = json.data.map(doc => crearTarjetaDocumento(doc)).join('');

  } catch (err) {
    console.error('Error al cargar documentos:', err);
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning rounded-4" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          No se pudieron cargar los documentos. Verifica tu conexión.
        </div>
      </div>`;
  }
}

/**
 * Genera el HTML de una tarjeta de documento
 */
function crearTarjetaDocumento(doc) {
  const tieneGuia   = doc.tiene_guia && doc.nombre_guia;
  const tieneArchivo = Boolean(doc.nombre_archivo);

  const btnDescargar = tieneArchivo
    ? `<a href="${API_BASE}/documentos/descargar/${doc.id}" 
          class="btn btn-dark fw-bold btn-sm py-2 ${tieneGuia ? 'w-75' : 'w-100'}"
          download>
         <i class="bi bi-download me-2"></i>Descargar
       </a>`
    : `<button class="btn btn-secondary fw-bold btn-sm py-2 ${tieneGuia ? 'w-75' : 'w-100'}" disabled title="Próximamente">
         <i class="bi bi-clock me-2"></i>Próximamente
       </button>`;

  const btnGuia = tieneGuia
    ? `<a href="${API_BASE}/documentos/descargar/${doc.id}?guia=1" 
          class="btn btn-outline-secondary w-25 fw-bold btn-sm py-2 text-dark border-opacity-25"
          download title="Descargar guía de llenado">
         Guía
       </a>`
    : '';

  return `
    <div class="col-md-4">
      <div class="card h-100 border-0 shadow-sm p-4 card-custom text-start">
        <div class="d-flex justify-content-between mb-3">
          <div class="icon-box bg-blue-light">
            <i class="bi bi-file-earmark-pdf text-primary fs-4"></i>
          </div>
          ${tieneGuia ? '<i class="bi bi-question-circle text-muted" title="Tiene guía de llenado"></i>' : '<span></span>'}
        </div>
        <h6 class="fw-bold mb-2 small">${escapeHtml(doc.titulo)}</h6>
        <p class="text-muted" style="font-size:0.75rem;">${escapeHtml(doc.descripcion || '')}</p>
        <div class="d-flex gap-2 mt-auto">
          ${btnDescargar}
          ${btnGuia}
        </div>
      </div>
    </div>`;
}

/** Escapa HTML para prevenir XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
