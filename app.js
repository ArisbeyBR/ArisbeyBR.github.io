// =====================
// NAVEGACIÓN ENTRE PÁGINAS
// =====================
function goPage(page, el) {
  // Si es un archivo HTML externo, navegar a esa página
  if (page.endsWith('.html')) {
    window.location.href = page;
    return;
  }

  // cambiar páginas
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
  });

  const targetPage = document.getElementById("page-" + page);
  if (targetPage) targetPage.classList.add("active");

  // cambiar label en topbar
  const label = document.getElementById("tb-page-label");
  if (label) label.textContent = page.toUpperCase();

  // activar menú lateral
  document.querySelectorAll(".nav-item").forEach(n => {
    n.classList.remove("active");
  });

  // marcar activo el elemento que llamó a la función
  if (el) {
    el.classList.add("active");
  }

}

// =====================
// SELECCIÓN DE TABS (ALUMNO / DOCENTE)
// =====================
function seleccionarTab(tabElement, tipo) {
  // Remover clase 'active' de todos los tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Agregar clase 'active' al tab clicado
  tabElement.classList.add('active');

  // Mostrar/ocultar formularios
  const formAlumno = document.getElementById('form-alumno');
  const formDocente = document.getElementById('form-docente');
  const previewAlumno = document.getElementById('preview-alumno');
  const previewDocente = document.getElementById('preview-docente');

  if (tipo === 'alumno') {
    formAlumno.style.display = 'block';
    formDocente.style.display = 'none';
    previewAlumno.style.display = 'block';
    previewDocente.style.display = 'none';
  } else if (tipo === 'docente') {
    formAlumno.style.display = 'none';
    formDocente.style.display = 'block';
    previewAlumno.style.display = 'none';
    previewDocente.style.display = 'block';
  }
}


//===================== VARIABLES ===========================================================
let solicitudes = [];
let actividades = [];
let filtroActual = "todas";
let ordenActual = "reciente";
let archivoBase64 = "";

//================================= BOTONES DE SOLICITUDES ==================================
function aprobarPendientes() {
  const pendientes = solicitudes.filter(s => s.estado === "pendiente");
  if (pendientes.length === 0) {
    alert("No hay solicitudes pendientes.");
    return;
  }
  pendientes.forEach(s => {
    s.estado = "aprobado";
    agregarActividad("aprobar", s.nombre);
  });
  guardarStorage();
  renderSolicitudes();
  renderReporte();
  alert("✅ " + pendientes.length + " solicitud(es) aprobada(s).");
}
function setFiltro(filtro, el) {

  filtroActual = filtro;

  document.querySelectorAll(".filtro").forEach(btn => {
    btn.classList.remove("active");
  });

  el.classList.add("active");

  renderSolicitudes();
}





//===================== HISTORIAL DE ACTIVIDADES ===========================================

function agregarActividad(tipo, nombre = "") {

  const hora = new Date().toLocaleTimeString();

  let mensaje = "";

  if (tipo === "crear") {
    mensaje = `${hora} - ${nombre} - solicitud creada`;
  }

  if (tipo === "aprobar") {
    mensaje = `${hora} - ${nombre} - solicitud aprobada`;
  }

  if (tipo === "rechazar") {
    mensaje = `${hora} - ${nombre} - solicitud rechazada`;
  }

  if (mensaje !== "") {

    actividades.unshift(mensaje);

    // máximo 10 actividades
    if (actividades.length > 10) {
      actividades.pop();
    }

    localStorage.setItem("actividades", JSON.stringify(actividades));

    renderActividades();
  }
}
function renderActividades() {

  const cont = document.getElementById("activity-list");

  if (!cont) return;

  cont.innerHTML = "";

  if (actividades.length === 0) {

    cont.innerHTML = `
      <div class="activity-item">
        Sin actividades
      </div>
    `;

    return;
  }

  actividades.forEach(a => {

    const div = document.createElement("div");

    div.className = "activity-item";

    div.textContent = a;

    cont.appendChild(div);

  });
}

// =====================
// VALIDACIÓN DE BUSQUEDAS
// =====================
function validarBusqueda(input) {

  let valor = input.value.toUpperCase();

  // permitir letras y números
  valor = valor.replace(/[^A-Z0-9\s]/g, "");

  // limitar a 18
  if (valor.length > 18) {
    valor = valor.substring(0, 18);
  }

  input.value = valor;
}


// =====================
// RENDER SOLICITUDES
// =====================
function renderSolicitudes() {

  const cont = document.getElementById("dir-list");
  if (!cont) return;

  cont.innerHTML = "";

  let lista = [...solicitudes];
  const texto = document.getElementById("s").value.trim().toLowerCase();

  // ── Filtro por tipo / estado ──
  if (filtroActual !== "todas") {
    lista = lista.filter(s => {
      if (filtroActual === "pendiente") return s.estado === "pendiente";
      if (filtroActual === "falta")     return s.tipo.toLowerCase().includes("falta");
      if (filtroActual === "permiso")   return s.tipo.toLowerCase().includes("permiso");
      if (filtroActual === "retardo")   return s.tipo.toLowerCase().includes("retardo");
      if (filtroActual === "salida")    return s.tipo.toLowerCase().includes("salida");
    });
  }

  // ── Buscador ──
  if (texto !== "") {
    lista = lista.filter(s => {
      const nombre = s.nombre.toLowerCase();
      const curp   = (s.curp || "").toLowerCase();
      if (texto.length === 18) return curp === texto;       // CURP exacto
      if (texto.length >= 3)   return nombre.includes(texto); // nombre parcial
      return false;
    });
  }

  // ── Orden ──
  if (ordenActual === "nombre")   lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
  if (ordenActual === "tipo")     lista.sort((a, b) => a.tipo.localeCompare(b.tipo));
  if (ordenActual === "reciente") lista.reverse();

  // ── Sin resultados ──
  if (lista.length === 0) {
    cont.innerHTML = `<div class="sol-empty">No hay resultados para este filtro.</div>`;
    return;
  }

  // ── Renderizar tarjetas ──
  lista.forEach(s => {

    const indexReal = solicitudes.indexOf(s);

    // Iniciales del alumno (máx. 2 letras)
    const iniciales = s.nombre
      .split(" ")
      .slice(0, 2)
      .map(p => p[0] || "")
      .join("")
      .toUpperCase();

    // Formatear fecha legible (dd/mm/yyyy → d mmm yyyy)
    let fechaLegible = s.fecha;
    try {
      const partes = s.fecha.split("/");
      if (partes.length === 3) {
        const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
        fechaLegible = `${parseInt(partes[0])} ${meses[parseInt(partes[1]) - 1]} ${partes[2]}`;
      }
    } catch(e) { /* deja la fecha original si hay error */ }

    const div = document.createElement("div");
    div.className = `sol-item estado-${s.estado}`;

    div.innerHTML = `
      <div class="sol-stripe"></div>

      <div class="sol-main">
        <div class="sol-av">${iniciales}</div>

        <div class="sol-info" onclick="verDetalle(${indexReal})">
          <div class="sol-name">${s.nombre}</div>
          <div class="sol-meta">
            <span><i class="fa-solid fa-id-card"></i> ${s.curp || "—"}</span>
            <span><i class="fa-solid fa-graduation-cap"></i> ${s.grupo || "—"}</span>
            <span><i class="fa-regular fa-calendar"></i> ${fechaLegible}</span>
          </div>
          <div class="sol-desc">"${s.motivo}"</div>
        </div>

        <div class="sol-badges">
          <span class="pill-tipo">${s.tipo}</span>
          <span class="pill-estado ${s.estado}">${s.estado}</span>
        </div>
      </div>

      <div class="sol-actions">
        <button class="btn-aprobar" onclick="aprobar(${indexReal})">
          <i class="fa-solid fa-check"></i> Aprobar
        </button>
        <button class="btn-rechazar" onclick="rechazar(${indexReal})">
          <i class="fa-solid fa-xmark"></i> Rechazar
        </button>
      </div>
    `;

    cont.appendChild(div);
  });
}

// =====================
// FUNCIONES DE APROBAR O RECHAZAR SOLICITUDES
// =====================

function aprobar(i) {

  solicitudes[i].estado = "aprobado";

  guardarStorage();

  renderSolicitudes();

  agregarActividad("aprobar", solicitudes[i].nombre);

  renderReporte();
}


function rechazar(i) {
  solicitudes[i].estado = "rechazado";
  guardarStorage();
  renderSolicitudes();
  agregarActividad("rechazar", solicitudes[i].nombre);
  renderReporte();
}

function guardarStorage() {
  localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
}
function verDetalle(i) {
  const s = solicitudes[i];
  
  // Guardar el índice para las acciones del modal
  window.modalIndex = i;

  // Poblar campos del modal
  document.getElementById("m-nombre").textContent = s.nombre || "—";
  document.getElementById("m-curp").textContent = s.curp || "—";
  document.getElementById("m-grupo").textContent = s.grupo || "—";
  document.getElementById("m-fecha").textContent = s.fecha || "—";
  document.getElementById("m-motivo").textContent = s.motivo || "—";

  // Badge de tipo
  const tipoBadge = document.getElementById("m-tipo-badge");
  tipoBadge.textContent = s.tipo || "—";
  tipoBadge.className = "modal-badge tipo";

  // Badge de estado
  const estadoBadge = document.getElementById("m-estado-badge");
  const estado = s.estado || "pendiente";
  estadoBadge.textContent = estado.toUpperCase();
  estadoBadge.className = `modal-badge estado-${estado}`;

  // Mostrar modal
  const modal = document.getElementById("modal");
  modal.classList.add("show");
}

function cerrarModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("show");
  window.modalIndex = null;
}

function approveFromModal() {
  if (window.modalIndex !== null && window.modalIndex !== undefined) {
    aprobar(window.modalIndex);
    cerrarModal();
  }
}

function rejectFromModal() {
  if (window.modalIndex !== null && window.modalIndex !== undefined) {
    rechazar(window.modalIndex);
    cerrarModal();
  }
}

// =====================
// PERFIL DE SESIÓN Y BOTÓN DE SALIR
// =====================
function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) {
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }
}

function toggleNotif() {
  const panel = document.getElementById("notif-panel");
  if (!panel) return;
  const visible = panel.style.display === "block";
  panel.style.display = visible ? "none" : "block";
  if (!visible) renderNotificaciones();
}

function renderNotificaciones() {
  const lista = document.getElementById("notif-list");
  const countLabel = document.getElementById("notif-count-label");
  const countBadge = document.getElementById("notif-count");
  if (!lista) return;

  lista.innerHTML = "";

  if (solicitudes.length === 0) {
    lista.innerHTML = "<div class='notif-empty'>Sin notificaciones</div>";
    if (countBadge) countBadge.style.display = "none";
    return;
  }

  const pendientes = solicitudes.filter(s => s.estado === "pendiente").length;

  if (countLabel) countLabel.textContent = pendientes + " pendiente" + (pendientes !== 1 ? "s" : "");
  if (countBadge) {
    countBadge.textContent = pendientes;
    countBadge.style.display = pendientes > 0 ? "flex" : "none";
  }

  [...solicitudes].reverse().forEach(s => {
    const colorEstado = s.estado === "aprobado" ? "green" : s.estado === "rechazado" ? "red" : "yellow";
    const icono = s.estado === "aprobado" ? "✔" : s.estado === "rechazado" ? "✖" : "⏳";
    const div = document.createElement("div");
    div.className = "notif-item";
    div.style.cursor = "pointer";
    div.innerHTML = `
      <div class="notif-icono notif-${colorEstado}">${icono}</div>
      <div class="notif-info">
        <div class="notif-nombre">${s.nombre}</div>
        <div class="notif-meta">${s.tipo} · ${s.fecha}</div>
        <div class="notif-estado notif-${colorEstado}">${s.estado.toUpperCase()}</div>
      </div>
    `;
    div.addEventListener("click", () => {
      document.getElementById("notif-panel").style.display = "none";
      goPage("solicitudes");
    });
    lista.appendChild(div);
  });
}

function logout() {
  alert("Sesión cerrada.");
  // Redirigir a la página de login
  window.location.href = 'login.html';
}

// Cerrar menú si se hace clic fuera
document.addEventListener('click', function (event) {
  const menu = document.getElementById('user-menu');
  const chip = document.querySelector('.user-chip');
  if (menu && chip && !chip.contains(event.target) && !menu.contains(event.target)) {
    menu.style.display = 'none';
  }

  const panel = document.getElementById("notif-panel");
  const btn = document.querySelector(".notif-btn");
  if (panel && btn && !btn.contains(event.target) && !panel.contains(event.target)) {
    panel.style.display = "none";
  }
});
// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {

  //  DATOS GUARDADOS
  const data = localStorage.getItem("solicitudes");

  if (data) {
    solicitudes = JSON.parse(data);
  }

  // cargar historial
  const hist = localStorage.getItem("actividades");
  if (hist) {
    actividades = JSON.parse(hist);
  }

  document.querySelector(".ordenar").addEventListener("change", function () {
    const valor = this.value;

    if (valor === "Más recientes") ordenActual = "reciente";
    if (valor === "Por nombre") ordenActual = "nombre";
    if (valor === "Por tipo") ordenActual = "tipo";

    renderSolicitudes();
  });

  goPage("solicitudes");
  renderSolicitudes();
  renderActividades();
  renderReporte();
});

//===================================
//Reporte mensual

//===================================================================================
//============================ SOLICITUD DE PERMISOS ================================

// Selección de tipo
function selectTipo(el, tipo) {
  document.querySelectorAll(".tipo-card").forEach(t => {
    t.classList.remove("active");
  });

  el.classList.add("active");

  const tipoPreview = document.getElementById("p-tipo");
  if (tipoPreview) tipoPreview.textContent = tipo;
}


// Vista previa dinámica (TODO EN UNA SOLA FUNCIÓN)
function updatePreview(campo, valor) {

  // NOMBRE
  if (campo === "nombre") {
    const apellido = document.getElementById("p-nombre")?.dataset.apellido || "";
    const el = document.getElementById("p-nombre");
    if (el) {
      el.textContent = valor + " " + apellido;
      el.dataset.nombre = valor;
    }
  }

  // APELLIDO
  if (campo === "apellido") {
    const nombre = document.getElementById("p-nombre")?.dataset.nombre || "";
    const el = document.getElementById("p-nombre");
    if (el) {
      el.textContent = nombre + " " + valor;
      el.dataset.apellido = valor;
    }
  }

  // GRADO
  if (campo === "grado") {
    const el = document.getElementById("p-grado");
    if (el) el.textContent = valor;
  }

  // TURNO
  if (campo === "turno") {
    const el = document.getElementById("p-turno");
    if (el) el.textContent = valor;
  }

  // FECHA
  if (campo === "fecha") {
    const el = document.getElementById("p-fecha");
    if (el) el.textContent = valor;
  }

  // MOTIVO
  if (campo === "motivo") {
    const el = document.getElementById("p-motivo");
    if (el) el.textContent = valor;
  }
  // CURP
  if (campo === "curp") {
    const el = document.getElementById("p-curp");
    if (el) el.textContent = valor;
  }

  if (campo === "padre-nombre") {
    const el = document.getElementById("p-padre-nombre");
    if (el) el.textContent = valor;
  }
  if (campo === "padre-parentesco") {
    const el = document.getElementById("p-padre-parentesco");
    if (el) el.textContent = valor;
    const label = document.getElementById("p-padre-label");
    if (label) label.textContent = valor.toUpperCase();
  }
  if (campo === "padre-tel") {
    const el = document.getElementById("p-padre-tel");
    if (el) el.textContent = valor;
  }
  if (campo === "padre-correo") {
    const el = document.getElementById("p-padre-correo");
    if (el) el.textContent = valor;
  }
}


// Vista previa del archivo
function previewFile(input) {

  const file = input.files[0];

  if (!file) return;

  // MOSTRAR BADGE
  const badge = document.getElementById("file-badge");
  const nameEl = document.getElementById("file-name");

  if (badge && nameEl) {
    nameEl.textContent = file.name;
    badge.style.display = "flex"; // or block, depending on CSS
  }

  // LEER ARCHIVO
  const reader = new FileReader();

  reader.onload = function (e) {

    archivoBase64 = e.target.result;

  };

  reader.readAsDataURL(file);
}

function removeFile() {
  // LIMPIAR INPUT
  const input = document.getElementById("archivo");
  if (input) {
    input.value = "";
  }

  // OCULTAR BADGE
  const badge = document.getElementById("file-badge");
  if (badge) {
    badge.style.display = "none";
  }

  // LIMPIAR BASE64
  archivoBase64 = "";
}

function previewFileDocente(input) {
  const file = input.files[0];
  if (!file) return;

  // MOSTRAR BADGE
  const badge = document.getElementById("doc-file-badge");
  const nameEl = document.getElementById("doc-file-name");
  if (badge && nameEl) {
    nameEl.textContent = file.name;
    badge.style.display = "flex";
  }

  // LEER ARCHIVO
  const reader = new FileReader();
  reader.onload = function (e) {
    archivoBase64 = e.target.result; // reusing for simplicity
  };
  reader.readAsDataURL(file);
}

function removeFileDocente() {
  const input = document.getElementById("doc-archivo");
  if (input) {
    input.value = "";
  }
  const badge = document.getElementById("doc-file-badge");
  if (badge) {
    badge.style.display = "none";
  }
  archivoBase64 = "";
}

//################# GUARDADO DE LOS DATOS DE LOS PERMISOS SOLICITADOS ###############
function guardarSolicitud() {

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const curp = document.getElementById("curp").value.trim();
  const grado = document.getElementById("grado").value.trim();
  const turno = document.getElementById("turno").value.trim();
  const motivo = document.getElementById("motivo").value.trim();

  const padreNombre = document.getElementById("padre-nombre").value.trim();
  const padreParentesco = document.getElementById("padre-parentesco").value.trim();
  const padreTel = document.getElementById("padre-tel").value.trim();
  const padreCorreo = document.getElementById("padre-correo").value.trim();

  const tipo = document.getElementById("p-tipo").textContent;

  // VALIDAR CAMPOS
 const esDocente = document.getElementById("form-docente").style.display === "block";
if (esDocente) {
  const docNombre = document.getElementById("doc-docente").value.trim();
  const docMateria = document.getElementById("doc-materia").value.trim();
  const docSalon = document.getElementById("doc-salon").value.trim();
  const docFecha = document.getElementById("doc-fecha").value.trim();
  const docAluNombre = document.getElementById("doc-alumno-nombre").value.trim();
  const docAluApellido = document.getElementById("doc-apellido").value.trim();
  const docGrado = document.getElementById("doc-grado-alumno").value.trim();
  const docObservaciones = document.getElementById("doc-observaciones").value.trim();
  const tipoDocente = document.getElementById("pd-tipo").textContent;

  if (docNombre === "" || docAluNombre === "" || docObservaciones === "" || tipoDocente === "SIN TIPO") {
    alert("⚠ Completa al menos el nombre del docente, alumno y tipo de registro");
    return;
  }

  const nueva = {
    nombre: docAluNombre + " " + docAluApellido,
    curp: "",
    grupo: docGrado,
    turno: "",
    fecha: new Date().toLocaleDateString(),
    tipo: tipoDocente,
    motivo: docObservaciones,
    archivo: "",
    estado: "pendiente",
    esDocente: true,
    docente: {
      nombre: docNombre,
      materia: docMateria,
      salon: docSalon
    }
  };

  solicitudes.push(nueva);
  localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
  agregarActividad("crear", docAluNombre + " " + docAluApellido);
  renderSolicitudes();
  renderReporte();
  alert("✅ Registro docente guardado correctamente");
  return;


if (!esDocente) {
  if (
    nombre === "" ||
    apellido === "" ||
    curp === "" ||
    grado === "" ||
    turno === "" ||
    motivo === "" ||
    padreNombre === "" ||
    padreParentesco === "" ||
    padreTel === "" ||
    padreCorreo === "" ||
    tipo === "SIN TIPO" ||
    archivoBase64 === ""
  ) {
    alert("⚠ Debes completar todos los campos y subir un comprobante");
    return;
  }
}
}


  // CREAR SOLICITUD
  const nueva = {

    nombre: nombre + " " + apellido,
    curp,
    grupo: grado,
    turno,
    fecha: new Date().toLocaleDateString(),
    tipo,
    motivo,
    archivo: archivoBase64,
    padre: {
      nombre: padreNombre,
      parentesco: padreParentesco,
      telefono: padreTel,
      correo: padreCorreo
    },

    estado: "pendiente"
  };

  solicitudes.push(nueva);

  // GUARDAR EN LOCALSTORAGE
  localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

  // ACTIVIDAD
  agregarActividad("crear", nombre + " " + apellido);

  // ACTUALIZAR VISTA
  renderSolicitudes();

  // MENSAJE
  renderReporte();
  alert("✅ Solicitud guardada correctamente");

  // CAMBIAR DE PÁGINA
  goPage("solicitudes");

}

function renderReporte() {
  const tbody = document.getElementById("reporte-tbody");
  const registros = solicitudes.filter(s => s.estado === "aprobado" || s.estado === "rechazado");

  // TABLA
  if (tbody) {
    tbody.innerHTML = "";
    if (registros.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4'>Sin registros</td></tr>";
    } else {
      registros.forEach(s => {
        const tr = document.createElement("tr");
        const claseEstado = s.estado === "aprobado" ? "approved" : "rejected";
        const textoEstado = s.estado === "aprobado" ? "Aprobado" : "Rechazado";
        tr.innerHTML = `
          <td>${s.nombre}</td>
          <td>${s.fecha}</td>
          <td>${s.tipo}</td>
          <td class="${claseEstado}">${textoEstado}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  // TARJETAS
  const total = solicitudes.length;
  const aprobados = solicitudes.filter(s => s.estado === "aprobado").length;
  const rechazados = solicitudes.filter(s => s.estado === "rechazado").length;
  const pendientes = solicitudes.filter(s => s.estado === "pendiente").length;
  const asistencia = total > 0 ? (((total - rechazados) / total) * 100).toFixed(1) : "0.0";

  const cardAsistencia = document.getElementById("card-asistencia");
  const cardTotal = document.getElementById("card-total");
  const cardAprobados = document.getElementById("card-aprobados");
  const cardPendientes = document.getElementById("card-pendientes");

  if (cardAsistencia) cardAsistencia.textContent = asistencia + "%";
  if (cardTotal) cardTotal.textContent = total;
  if (cardAprobados) cardAprobados.textContent = aprobados;
  if (cardPendientes) cardPendientes.textContent = pendientes;

  // BARRAS DE VALIDACIÓN
  const barAprobados = document.getElementById("bar-aprobados");
  const barRechazados = document.getElementById("bar-rechazados");
  const barPendientes = document.getElementById("bar-pendientes");
  const numAprobados = document.getElementById("num-aprobados");
  const numRechazados = document.getElementById("num-rechazados");
  const numPendientes = document.getElementById("num-pendientes");

  if (total > 0) {
    if (barAprobados) barAprobados.style.width = ((aprobados / total) * 100) + "%";
    if (barRechazados) barRechazados.style.width = ((rechazados / total) * 100) + "%";
    if (barPendientes) barPendientes.style.width = ((pendientes / total) * 100) + "%";
  }
  if (numAprobados) numAprobados.textContent = aprobados;
  if (numRechazados) numRechazados.textContent = rechazados;
  if (numPendientes) numPendientes.textContent = pendientes;

  // BITÁCORA
  const bitacora = document.getElementById("bitacora-list");
  if (bitacora) {
    bitacora.innerHTML = "";
    if (actividades.length === 0) {
      bitacora.innerHTML = "<p>Sin actividad registrada</p>";
      return;
    }
    actividades.slice(0, 10).forEach(a => {
      const p = document.createElement("p");
      let texto = a;
      if (a.includes("solicitud aprobada")) {
        const nombre = a.split(" - ")[1] || "";
        const hora = a.split(" - ")[0] || "";
        texto = `${hora} — Directivo aprobó solicitud de ${nombre}`;
      } else if (a.includes("solicitud rechazada")) {
        const nombre = a.split(" - ")[1] || "";
        const hora = a.split(" - ")[0] || "";
        texto = `${hora} — Directivo rechazó solicitud de ${nombre}`;
      } else if (a.includes("solicitud creada")) {
        const nombre = a.split(" - ")[1] || "";
        const hora = a.split(" - ")[0] || "";
        texto = `${hora} — Nueva solicitud creada: ${nombre}`;
      }
      p.textContent = texto;
      bitacora.appendChild(p);
    });
  }
}

// =====================
// PDF FORMULARIO PADRE/TUTOR
// =====================
function descargarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ENCABEZADO
  doc.setFillColor(141, 64, 46);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text("Esc. Sec. Tec. 14 - Ramon Lopez Velarde", 14, 12);

  y = 28;
  doc.setTextColor(60, 40, 40);
  doc.setFontSize(11);
  doc.text("JUSTIFICANTE DE AUSENCIA - CICLO 2025-2026", 14, y);
  y += 5;
  doc.setDrawColor(200, 180, 170);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // TIPO
  const tipo = document.getElementById("p-tipo")?.textContent || "SIN TIPO";
  doc.setFillColor(249, 245, 240);
  doc.roundedRect(14, y, pageWidth - 28, 10, 2, 2, "F");
  doc.setTextColor(141, 64, 46);
  doc.setFontSize(11);
  doc.text("TIPO: " + tipo, 18, y + 7);
  y += 18;

  // DATOS ALUMNO
  doc.setFillColor(242, 235, 228);
  doc.rect(14, y, pageWidth - 28, 8, "F");
  doc.setTextColor(141, 64, 46);
  doc.setFontSize(10);
  doc.text("● DATOS DEL ALUMNO", 18, y + 5.5);
  y += 12;

  const nombre = document.getElementById("p-nombre")?.textContent || "—";
  const curp = document.getElementById("p-curp")?.textContent || "—";
  const grado = document.getElementById("p-grado")?.textContent || "—";
  const turno = document.getElementById("p-turno")?.textContent || "—";
  const fecha = document.getElementById("p-fecha")?.textContent || "—";
  const motivo = document.getElementById("p-motivo")?.textContent || "—";

  doc.setTextColor(60, 40, 40);
  doc.setFontSize(10);
  doc.text("NOMBRE: " + nombre, 18, y); y += 8;
  doc.text("CURP: " + curp, 18, y); y += 8;
  doc.text("GRADO: " + grado + "   TURNO: " + turno, 18, y); y += 8;
  doc.text("FECHA: " + fecha, 18, y); y += 8;

  const motivoLines = doc.splitTextToSize("MOTIVO: " + motivo, pageWidth - 36);
  doc.text(motivoLines, 18, y);
  y += motivoLines.length * 7 + 6;

  // DATOS PADRE/TUTOR
  doc.setFillColor(242, 235, 228);
  doc.rect(14, y, pageWidth - 28, 8, "F");
  doc.setTextColor(141, 64, 46);
  doc.setFontSize(10);
  doc.text("● DATOS DEL PADRE / TUTOR", 18, y + 5.5);
  y += 12;

  const padreLabel = document.getElementById("p-padre-label")?.textContent || "PADRE/TUTOR";
  const padreNombre = document.getElementById("p-padre-nombre")?.textContent || "—";
  const padreParentesco = document.getElementById("p-padre-parentesco")?.textContent || "—";
  const padreTel = document.getElementById("p-padre-tel")?.textContent || "—";
  const padreCorreo = document.getElementById("p-padre-correo")?.textContent || "—";

  doc.setTextColor(60, 40, 40);
  doc.text(padreLabel + ": " + padreNombre, 18, y); y += 8;
  doc.text("PARENTESCO: " + padreParentesco, 18, y); y += 8;
  doc.text("TELÉFONO: " + padreTel, 18, y); y += 8;
  doc.text("CORREO: " + padreCorreo, 18, y); y += 12;

  // PIE
  doc.setDrawColor(200, 180, 170);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;
  doc.setTextColor(180, 160, 150);
  doc.setFontSize(8);
  doc.text("Documento generado digitalmente - Sistema de Asistencias 2025-2026", 14, y);

  doc.save("justificante-padre-tutor.pdf");
}

// =====================
// PDF FORMULARIO DOCENTE
// =====================
function descargarPDFDocente() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ENCABEZADO
  doc.setFillColor(141, 64, 46);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text("Esc. Sec. Tec. 14 - Ramon Lopez Velarde", 14, 12);

  y = 28;
  doc.setTextColor(60, 40, 40);
  doc.setFontSize(11);
  doc.text("REGISTRO DOCENTE - CICLO 2025-2026", 14, y);
  y += 5;
  doc.setDrawColor(200, 180, 170);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // TIPO
  const tipo = document.getElementById("pd-tipo")?.textContent || "SIN TIPO";
  doc.setFillColor(249, 245, 240);
  doc.roundedRect(14, y, pageWidth - 28, 10, 2, 2, "F");
  doc.setTextColor(141, 64, 46);
  doc.setFontSize(11);
  doc.text("TIPO: " + tipo, 18, y + 7);
  y += 18;

  // DATOS ALUMNO
  doc.setFillColor(242, 235, 228);
  doc.rect(14, y, pageWidth - 28, 8, "F");
  doc.setTextColor(141, 64, 46);
  doc.setFontSize(10);
  doc.text("● DATOS DEL ALUMNO", 18, y + 5.5);
  y += 12;

  const aluNombre = document.getElementById("pd-nombre")?.textContent || "—";
  const aluGrado = document.getElementById("pd-grado")?.textContent || "—";
  const aluSalon = document.getElementById("pd-gradosalon")?.textContent || "—";
  const aluFecha = document.getElementById("pd-fecha")?.textContent || "—";

  doc.setTextColor(60, 40, 40);
  doc.text("NOMBRE: " + aluNombre, 18, y); y += 8;
  doc.text("GRADO: " + aluGrado + "   SALÓN: " + aluSalon, 18, y); y += 8;
  doc.text("FECHA: " + aluFecha, 18, y); y += 12;

  // DETALLE
  doc.setFillColor(242, 235, 228);
  doc.rect(14, y, pageWidth - 28, 8, "F");
  doc.setTextColor(141, 64, 46);
  doc.setFontSize(10);
  doc.text("● DETALLE DEL REGISTRO", 18, y + 5.5);
  y += 12;

  const observaciones = document.getElementById("pd-observaciones")?.textContent || "—";
  const autorizacion = document.getElementById("pd-autorizacion")?.textContent || "—";

  doc.setTextColor(60, 40, 40);
  const obsLines = doc.splitTextToSize("OBSERVACIONES: " + observaciones, pageWidth - 36);
  doc.text(obsLines, 18, y);
  y += obsLines.length * 7 + 6;
  doc.text("AUTORIZACIÓN: " + autorizacion, 18, y); y += 12;

  // DATOS DOCENTE
  doc.setFillColor(242, 235, 228);
  doc.rect(14, y, pageWidth - 28, 8, "F");
  doc.setTextColor(141, 64, 46);
  doc.setFontSize(10);
  doc.text("● DATOS DEL DOCENTE", 18, y + 5.5);
  y += 12;

  const docNombre = document.getElementById("pd-ddocente")?.textContent || "—";
  const docMateria = document.getElementById("pd-materia")?.textContent || "—";

  doc.setTextColor(60, 40, 40);
  doc.text("DOCENTE: " + docNombre, 18, y); y += 8;
  doc.text("MATERIA: " + docMateria, 18, y); y += 12;

  // PIE
  doc.setDrawColor(200, 180, 170);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;
  doc.setTextColor(180, 160, 150);
  doc.setFontSize(8);
  doc.text("Documento generado digitalmente - Sistema de Asistencias 2025-2026", 14, y);

  doc.save("registro-docente.pdf");
}
// =====================
// LIMPIAR VISTA PREVIA
// =====================
function limpiarPreview() {
  document.getElementById("p-tipo").textContent = "SIN TIPO";
  document.getElementById("p-nombre").textContent = "Sin nombre";
  document.getElementById("p-curp").textContent = "Sin CURP";
  document.getElementById("p-grado").textContent = "Sin grado";
  document.getElementById("p-turno").textContent = "Matutino";
  document.getElementById("p-fecha").textContent = "Seleccionar fecha";
  document.getElementById("p-motivo").textContent = "Sin motivo";
  document.getElementById("p-padre-nombre").textContent = "Sin nombre";
  document.getElementById("p-padre-parentesco").textContent = "Sin parentesco";
  document.getElementById("p-padre-label").textContent = "PADRE/TUTOR";
  document.getElementById("p-padre-tel").textContent = "Sin teléfono";
  document.getElementById("p-padre-correo").textContent = "Sin correo";

  document.querySelectorAll(".tipo-card").forEach(t => t.classList.remove("active"));

  document.getElementById("pd-tipo").textContent = "SIN TIPO";
  document.getElementById("pd-nombre") && (document.getElementById("pd-nombre").textContent = "Sin nombre");
  document.getElementById("pd-grado") && (document.getElementById("pd-grado").textContent = "—");
  document.getElementById("pd-gradosalon") && (document.getElementById("pd-gradosalon").textContent = "Sin salón");
  document.getElementById("pd-fecha") && (document.getElementById("pd-fecha").textContent = "00/00/0000");
  document.getElementById("pd-observaciones") && (document.getElementById("pd-observaciones").textContent = "Sin observaciones");
  document.getElementById("pd-ddocente") && (document.getElementById("pd-ddocente").textContent = "Sin docente");
  document.getElementById("pd-alu-nombre") && (document.getElementById("pd-alu-nombre").textContent = "Sin nombre");
  document.getElementById("pd-alu-grado") && (document.getElementById("pd-alu-grado").textContent = "—");
  document.getElementById("pd-alu-turno") && (document.getElementById("pd-alu-turno").textContent = "Matutino");
  document.getElementById("pd-hora-inicio") && (document.getElementById("pd-hora-inicio").textContent = "--:--");
  document.getElementById("pd-hora-fin") && (document.getElementById("pd-hora-fin").textContent = "--:--");
  document.getElementById("pd-autorizacion") && (document.getElementById("pd-autorizacion").textContent = "No aplica / Pendiente");
  document.getElementById("pd-materia") && (document.getElementById("pd-materia").textContent = "Sin materia");
  document.querySelectorAll("#form-docente .tipo-card").forEach(t => t.classList.remove("active"));
}

// =====================
// SWITCH ALUMNO / DOCENTE
// =====================
function switchFormulario(tipo) {
  const formAlumno = document.getElementById("form-alumno");
  const formDocente = document.getElementById("form-docente");
  const prevAlumno = document.getElementById("preview-alumno");
  const prevDocente = document.getElementById("preview-docente");
  const btnAlumno = document.getElementById("btn-alumno");
  const btnDocente = document.getElementById("btn-docente");

  if (tipo === "alumno") {
    formAlumno.style.display = "block";
    formDocente.style.display = "none";
    prevAlumno.style.display = "block";
    prevDocente.style.display = "none";
    btnAlumno.classList.add("active");
    btnDocente.classList.remove("active");
  } else {
    formAlumno.style.display = "none";
    formDocente.style.display = "block";
    prevAlumno.style.display = "none";
    prevDocente.style.display = "block";
    btnAlumno.classList.remove("active");
    btnDocente.classList.add("active");
  }
}

// =====================
// TIPO DOCENTE
// =====================
function selectTipoDocente(el, tipo) {
  document.querySelectorAll("#form-docente .tipo-card").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  const el2 = document.getElementById("pd-tipo");
  if (el2) el2.textContent = tipo;
}

// =====================
// UPDATE PREVIEW DOCENTE
// =====================
function updatePreviewDocente(campo, valor) {

  // NOMBRE DOCENTE
  if (campo === "doc-dnombre") {
    const el = document.getElementById("pd-ddocente");
    if (el) el.textContent = valor || "Sin docente";
  }

  // MATERIA (no se muestra en preview, pero lo dejamos por si luego lo usas)
  if (campo === "doc-materia") {
    // opcional
  }

  // SALÓN
  if (campo === "doc-salon") {
    const el = document.getElementById("pd-gradosalon");
    if (el) el.textContent = valor || "Sin salon";
  }

  // NOMBRE ALUMNO
  if (campo === "doc-nombre") {
    const apellido = document.getElementById("pd-nombre")?.dataset.apellido || "";
    const el = document.getElementById("pd-nombre");

    if (el) {
      el.textContent = valor + " " + apellido;
      el.dataset.nombre = valor;
    }
  }

  // APELLIDO ALUMNO
  if (campo === "doc-apellido") {
    const nombre = document.getElementById("pd-nombre")?.dataset.nombre || "";
    const el = document.getElementById("pd-nombre");

    if (el) {
      el.textContent = nombre + " " + valor;
      el.dataset.apellido = valor;
    }
  }

  // GRADO
  if (campo === "doc-grado") {
    const el = document.getElementById("pd-grado");
    if (el) el.textContent = valor || "—";
  }

  // FECHA 
  if (campo === "doc-fecha" || campo === "doc-fecha-fin") {
    const fechaInicio = document.getElementById("doc-fecha")?.value;
    const fechaFin = document.getElementById("doc-fecha-fin")?.value;
    const el = document.getElementById("pd-fecha");

    if (el) {
      let fechaTexto = "";
      if (fechaInicio) {
        const partes = fechaInicio.split("-");
        fechaTexto = partes[2] + "/" + partes[1] + "/" + partes[0];
        if (fechaFin && fechaFin !== fechaInicio) {
          const partesFin = fechaFin.split("-");
          fechaTexto += " - " + partesFin[2] + "/" + partesFin[1] + "/" + partesFin[0];
        }
      } else {
        fechaTexto = "00/00/0000";
      }
      el.textContent = fechaTexto;
    }
  }

  // OBSERVACIONES
  if (campo === "doc-observaciones") {
    const el = document.getElementById("pd-observaciones");
    if (el) el.textContent = valor || "Sin observaciones";
  }

  // AUTORIZACIÓN / DOCENTE (como lo estás usando visualmente)
  if (campo === "doc-docente") {
    const el = document.getElementById("pd-ddocente");
    if (el) el.textContent = valor;
  }
}

// =====================
// EXPORTAR BANDEJA A PDF
// =====================
function exportarBandeja() {
  if (solicitudes.length === 0) {
    alert("No hay solicitudes para exportar.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ENCABEZADO
  doc.setFillColor(141, 64, 46);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text("Esc. Sec. Tec. 14 - Ramon Lopez Velarde", 14, 12);

  y = 28;
  doc.setTextColor(60, 40, 40);
  doc.setFontSize(11);
  doc.text("Bandeja de Solicitudes - Ciclo 2025-2026", 14, y);

  y += 5;
  doc.setDrawColor(200, 180, 170);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // LISTA DE SOLICITUDES
  solicitudes.forEach((s, i) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    const colorEstado =
      s.estado === "aprobado" ? [46, 125, 50] :
      s.estado === "rechazado" ? [198, 40, 40] :
      [183, 121, 31];

    // Fondo tarjeta
    doc.setFillColor(249, 245, 240);
    doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, "F");

    // Borde izquierdo de color
    doc.setFillColor(...colorEstado);
    doc.rect(14, y, 3, 28, "F");

    // Nombre
    doc.setTextColor(60, 40, 40);
    doc.setFontSize(11);
    doc.text(s.nombre || "Sin nombre", 22, y + 8);

    // Meta
    doc.setFontSize(9);
    doc.setTextColor(140, 122, 122);
    doc.text(`CURP: ${s.curp || "—"}  |  Grado: ${s.grupo || "—"}  |  Fecha: ${s.fecha || "—"}`, 22, y + 15);

    // Tipo
    doc.text(`Tipo: ${s.tipo || "—"}`, 22, y + 21);

    // Estado badge
    doc.setFillColor(...colorEstado);
    doc.roundedRect(pageWidth - 50, y + 6, 30, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(s.estado.toUpperCase(), pageWidth - 45, y + 12);

    y += 34;
  });

  // PIE
  doc.setTextColor(180, 160, 150);
  doc.setFontSize(8);
  doc.text("Documento generado digitalmente - Sistema de Asistencias", 14, 290);

  doc.save("bandeja-solicitudes.pdf");
}


/* ═══════════════════════════════════════════════════
   tutorial-integrador.js
   Tour Driver.js Sistema Directivo
   Secundaria Técnica 14 · Ciclo 2025-2026
═══════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════
   tutorial-integrador.js
   Tour inteligente por sección
═══════════════════════════════════════════════════ */

function iniciarTutorialIntegrador() {

  const driver = window.driver.js.driver;

  let steps = [];

  // Detectar página activa
  const paginaActiva = document.querySelector('.page.active');

  // =====================================================
  // INTRO GENERAL
  // =====================================================

  steps.push({
    popover: {
      title: '👋 Bienvenido al sistema',
      description:
        'Este sistema permite administrar permisos escolares, validar solicitudes y generar reportes académicos.',
      side: 'over',
      align: 'center'
    }
  });

  steps.push({
    element: '.sidebar',
    popover: {
      title: '📚 Menú de navegación',
      description:
        'Desde aquí puedes moverte entre bandeja de solicitudes, formulario de permisos y reportes mensuales.',
      side: 'right'
    }
  });

  // =====================================================
  // SOLICITUDES
  // =====================================================

  if (paginaActiva.id === 'page-solicitudes') {

    steps.push(
      {
        element: '#buscarform',
        popover: {
          title: '🔎 Buscar solicitudes',
          description:
            'Encuentra rápidamente permisos escribiendo el nombre del alumno.',
          side: 'bottom'
        }
      },

      {
        element: '.filters',
        popover: {
          title: '🎯 Filtros rápidos',
          description:
            'Filtra solicitudes por estado: pendientes, aprobadas, retardos o salidas.',
          side: 'bottom'
        }
      },

      {
        element: '.ordenar',
        popover: {
          title: '↕ Ordenar resultados',
          description:
            'Puedes ordenar las solicitudes por fecha, nombre o tipo.',
          side: 'left'
        }
      },

      {
        element: '#dir-list',
        popover: {
          title: '📋 Bandeja de solicitudes',
          description:
            'Aquí aparecen todas las solicitudes registradas por padres y docentes.',
          side: 'top'
        }
      },

      {
        element: '.sol-actions',
        popover: {
          title: '✅ Validación de permisos',
          description:
            'Puedes aprobar o rechazar solicitudes directamente desde cada tarjeta.',
          side: 'left'
        }
      }
    );

  }

  // =====================================================
  // PERMISOS
  // =====================================================

  if (paginaActiva.id === 'page-permisos') {

    steps.push(

      {
        element: '.tabs',
        popover: {
          title: '👥 Tipo de usuario',
          description:
            'Selecciona si el registro será realizado por padre/tutor o docente.',
          side: 'bottom'
        }
      },

      {
        element: '.tipo-grid',
        popover: {
          title: '📝 Tipo de solicitud',
          description:
            'Selecciona el motivo del permiso: enfermedad, retardo, salida o permiso anticipado.',
          side: 'bottom'
        }
      },

      {
        element: '#form-alumno',
        popover: {
          title: '📄 Formulario del alumno',
          description:
            'Aquí se capturan los datos escolares y personales del alumno.',
          side: 'top'
        }
      },

      {
        element: '#motivo',
        popover: {
          title: '✏ Motivo de ausencia',
          description:
            'Describe claramente la razón del permiso o incidencia.',
          side: 'top'
        }
      },

      {
        element: '.upload-zone',
        popover: {
          title: '📎 Documento de respaldo',
          description:
            'Puedes adjuntar recetas médicas, justificantes o documentos PDF.',
          side: 'top'
        }
      },

      {
        element: '.preview-card',
        popover: {
          title: '👁 Vista previa',
          description:
            'La tarjeta lateral muestra cómo quedará el permiso antes de guardarlo.',
          side: 'left'
        }
      }
    );

  }

  // =====================================================
  // REPORTE
  // =====================================================

  if (paginaActiva.id === 'page-reporte') {

    steps.push(

      {
        element: 'panel(1)',
        popover: {
          title: '📊 Indicadores generales',
          description:
            'Aquí puedes visualizar estadísticas rápidas del ciclo escolar.',
          side: 'bottom'
        }
      },

      {
        element: '.validation',
        popover: {
          title: '⚙ Motor de validación',
          description:
            'Muestra el porcentaje y cantidad de solicitudes aprobadas, rechazadas y pendientes.',
          side: 'top'
        }
      },

      {
        element: '.history',
        popover: {
          title: '🧾 Bitácora de auditoría',
          description:
            'Registra actividades importantes realizadas dentro del sistema.',
          side: 'top'
        }
      },

      {
        element: '.table-section',
        popover: {
          title: '📑 Justificantes recientes',
          description:
            'Consulta los permisos más recientes registrados en el sistema.',
          side: 'top'
        }
      }
    );

  }

  // =====================================================
  // FINAL GLOBAL
  // =====================================================

  steps.push({
    element: '#btn-ayuda',
    popover: {
      title: '❓ Centro de ayuda',
      description:
        'Puedes volver a abrir este tutorial en cualquier momento usando este botón.',
      side: 'left'
    }
  });

  // =====================================================

  const tour = driver({

    showProgress: true,
    animate: true,
    smoothScroll: true,

    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Finalizar',

    progressText: 'Paso {{current}} de {{total}}',

    steps

  });

  tour.drive();

}