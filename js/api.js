// ═══════════════════════════════════════════════════
// ResiHub – API Helper (js/api.js)
// Se encarga de toda comunicación con el backend
// ═══════════════════════════════════════════════════

const API_URL = 'http://localhost:3000/api';

// ─── AUTH ────────────────────────────────────────────

const Auth = {
  getToken: () => localStorage.getItem('rh_token'),
  getUser:  () => JSON.parse(localStorage.getItem('rh_user') || 'null'),
  isAdmin:  () => Auth.getUser()?.rol === 'admin',

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem('rh_token', data.token);
      localStorage.setItem('rh_user', JSON.stringify(data.usuario));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('rh_token');
    localStorage.removeItem('rh_user');
    window.location.href = 'login.html';
  }
};

// ─── DOCUMENTOS (público) ────────────────────────────

const Documentos = {
  async listar(etapa = '') {
    const url = etapa ? `${API_URL}/documentos?etapa=${etapa}` : `${API_URL}/documentos`;
    const res = await fetch(url);
    return res.json();
  },

  urlDescarga(id) {
    return `${API_URL}/documentos/${id}/descargar`;
  }
};

// ─── ADMIN ───────────────────────────────────────────

const Admin = {
  headers() {
    return { Authorization: `Bearer ${Auth.getToken()}`, 'Content-Type': 'application/json' };
  },

  async estadisticas() {
    const res = await fetch(`${API_URL}/admin/estadisticas`, { headers: this.headers() });
    return res.json();
  },

  async listarDocumentos() {
    const res = await fetch(`${API_URL}/admin/documentos`, { headers: this.headers() });
    return res.json();
  },

  async crearDocumento(formData) {
    const res = await fetch(`${API_URL}/admin/documentos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${Auth.getToken()}` },
      body: formData // FormData (incluye archivo)
    });
    return res.json();
  },

  async actualizarDocumento(id, formData) {
    const res = await fetch(`${API_URL}/admin/documentos/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${Auth.getToken()}` },
      body: formData
    });
    return res.json();
  },

  async eliminarDocumento(id) {
    const res = await fetch(`${API_URL}/admin/documentos/${id}`, {
      method: 'DELETE',
      headers: this.headers()
    });
    return res.json();
  },

  async listarUsuarios() {
    const res = await fetch(`${API_URL}/admin/usuarios`, { headers: this.headers() });
    return res.json();
  },

  async crearUsuario(datos) {
    const res = await fetch(`${API_URL}/admin/usuarios`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(datos)
    });
    return res.json();
  }
};

// ─── UTILIDADES UI ───────────────────────────────────

function mostrarToast(mensaje, tipo = 'success') {
  const toastEl = document.getElementById('toastMsg');
  if (!toastEl) return;
  toastEl.querySelector('.toast-body').textContent = mensaje;
  toastEl.className = `toast align-items-center text-white border-0 bg-${tipo === 'success' ? 'success' : 'danger'}`;
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

function iconoEtapa(slug) {
  const map = { solicitud: 'bi-file-earmark-text', seguimiento: 'bi-check-circle', liberacion: 'bi-mortarboard' };
  return map[slug] || 'bi-file-earmark';
}

function colorEtapa(slug) {
  const map = { solicitud: 'primary', seguimiento: 'secondary', liberacion: 'danger' };
  return map[slug] || 'primary';
}
