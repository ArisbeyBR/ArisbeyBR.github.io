/* ═══════════════════════════════════════════════════════
   Permisos.js  –  Secundaria Técnica 14
   Lógica completa de tipos, visibilidad y validación
   ═══════════════════════════════════════════════════════ */

// ─── Estado global ───────────────────────────────────────
let currentTipo = null;          // 'falta' | 'permiso' | 'retardo' | 'salida'
let folioGenerado = null;

// ─── Configuración por tipo ──────────────────────────────
const TIPO_CONFIG = {
  falta: {
    label: 'Falta por Enfermedad',
    todoDia: true,          // forzado true
    bloquearCheckbox: true, // no se puede desmarcar
    mostrarEntrada: false,
    mostrarSalida: false,
    mostrarCheckbox: false, // ocultar visualmente (ya forzado)
    mostrarHasta: true,
    deshabilitarHasta: false,
    placeholder: 'Describa brevemente el padecimiento o síntomas del alumno…',
    hint: 'Una falta por enfermedad cubre la jornada completa. Si la enfermedad dura más de un día, indica la fecha de regreso.'
  },
  permiso: {
    label: 'Permiso Anticipado',
    todoDia: null,          // el usuario decide
    bloquearCheckbox: false,
    mostrarEntrada: true,   // depende del checkbox (ver onTodoDiaChange)
    mostrarSalida: true,
    mostrarCheckbox: true,
    mostrarHasta: true,
    deshabilitarHasta: false,
    placeholder: 'Explica el motivo del permiso (cita médica, trámite, evento familiar, etc.)…',
    hint: 'Puedes marcar "Todo el día" si el alumno no asistirá, o dejar las horas si solo faltará un periodo.'
  },
  retardo: {
    label: 'Retardo',
    todoDia: false,
    bloquearCheckbox: true,
    mostrarEntrada: true,
    mostrarSalida: false,
    mostrarCheckbox: false,
    mostrarHasta: false,    // un retardo solo es un día
    deshabilitarHasta: true,
    placeholder: 'Motivo del retardo (tráfico, trámite, emergencia menor, etc.)…',
    hint: 'El retardo registra solo la hora de llegada. No aplica rango de fechas.'
  },
  salida: {
    label: 'Salida Temprana',
    todoDia: false,
    bloquearCheckbox: true,
    mostrarEntrada: false,
    mostrarSalida: true,
    mostrarCheckbox: false,
    mostrarHasta: false,
    deshabilitarHasta: true,
    placeholder: 'Motivo de la salida anticipada (cita médica, urgencia familiar, etc.)…',
    hint: 'La salida temprana registra la hora en que el alumno abandona la escuela antes del fin de jornada.'
  }
};

// ─── Folio único ────────────────────────────────────────
function generarFolio() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 4; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return `ST14-2026-${r}`;
}

// ─── Selección de tipo ───────────────────────────────────
function selectTipo(tipo, el) {
  // Marca visual
  document.querySelectorAll('.tipo-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');

  currentTipo = tipo;
  const cfg = TIPO_CONFIG[tipo];

  // ── Checkbox todo el día ──
  const chk = document.getElementById('p-todo-dia');
  chk.disabled = cfg.bloquearCheckbox;

  if (cfg.todoDia === true)  { chk.checked = true; }
  if (cfg.todoDia === false) { chk.checked = false; }
  // cfg.todoDia === null → dejar como está (permiso)

  // ── Visibilidad de campos de hora ──
  applyHoraVisibility(cfg, chk.checked);

  // ── Campo "Hasta" ──
  const hastaWrap = document.getElementById('p-fecha-fin-wrap');
  const hastaInput = document.getElementById('p-fecha-fin');
  if (cfg.mostrarHasta) {
    hastaWrap.classList.remove('hidden');
    hastaInput.disabled = cfg.deshabilitarHasta;
    if (cfg.deshabilitarHasta) hastaInput.value = '';
  } else {
    hastaWrap.classList.add('hidden');
    hastaInput.value = '';
    hastaInput.disabled = true;
  }

  // ── Placeholder motivo ──
  document.getElementById('p-motivo').placeholder = cfg.placeholder;

  // ── Hint ──
  renderHint(cfg.hint);

  // Actualiza folio parcial + preview
  folioGenerado = generarFolio();
  document.getElementById('p-prev-folio').textContent = folioGenerado;

  updatePreview();
  validateForm();
}

// Aplica visibilidad de horas según config y estado del checkbox
function applyHoraVisibility(cfg, todoDia) {
  const entradaField = document.getElementById('p-hora-entrada-field');
  const salidaField  = document.getElementById('p-hora-salida-field');
  const checkField   = document.getElementById('p-todo-dia-field');

  // Checkbox
  if (cfg.mostrarCheckbox) {
    checkField.classList.remove('hidden');
  } else {
    checkField.classList.add('hidden');
  }

  if (todoDia) {
    // Todo el día → ocultar ambas horas
    entradaField.classList.add('hidden');
    salidaField.classList.add('hidden');
  } else {
    // Mostrar según tipo
    if (cfg.mostrarEntrada) {
      entradaField.classList.remove('hidden');
    } else {
      entradaField.classList.add('hidden');
      document.getElementById('p-hora-entrada').value = '';
    }

    if (cfg.mostrarSalida) {
      salidaField.classList.remove('hidden');
    } else {
      salidaField.classList.add('hidden');
      document.getElementById('p-hora-salida').value = '';
    }
  }
}

// ─── Cambio manual del checkbox (solo Permiso Anticipado) ─
function onTodoDiaChange() {
  if (!currentTipo) return;
  const cfg = TIPO_CONFIG[currentTipo];
  const checked = document.getElementById('p-todo-dia').checked;
  applyHoraVisibility(cfg, checked);
  updatePreview();
  validateForm();
}

// ─── Hint ──────────────────────────────────────────────
function renderHint(texto) {
  // Elimina hint anterior si existe
  const old = document.getElementById('tipo-hint');
  if (old) old.remove();

  if (!texto) return;
  const div = document.createElement('div');
  div.className = 'tipo-hint';
  div.id = 'tipo-hint';
  div.textContent = texto;

  // Inserta antes de la primera card después del tipo
  const cards = document.querySelectorAll('#panel-padres .card');
  if (cards[1]) cards[1].before(div);
}

// ─── Preview en vivo ─────────────────────────────────────
function updatePreview() {
  const nombre    = document.getElementById('p-nombre').value.trim();
  const apellidos = document.getElementById('p-apellidos').value.trim();
  const grado     = document.getElementById('p-grado').value;
  const turno     = document.getElementById('p-turno').value;
  const fecha     = document.getElementById('p-fecha').value;
  const fechaFin  = document.getElementById('p-fecha-fin').value;
  const motivo    = document.getElementById('p-motivo').value.trim();
  const tutor     = document.getElementById('p-tutor').value.trim();
  const parentesco = document.getElementById('p-parentesco').value;
  const tel       = document.getElementById('p-tel').value.trim();
  const correo    = document.getElementById('p-correo').value.trim();
  const todoDia   = document.getElementById('p-todo-dia').checked;
  const horaEnt   = document.getElementById('p-hora-entrada').value;
  const horaSal   = document.getElementById('p-hora-salida').value;

  // Alumno
  const fullName = [nombre, apellidos].filter(Boolean).join(' ');
  setPreview('p-prev-alumno', fullName, 'Sin nombre');

  // Grado/Turno
  setPreview('p-prev-grado', grado ? `${grado} · ${turno}` : '', '—');

  // Tipo
  const tipoEl = document.getElementById('p-prev-tipo');
  tipoEl.textContent = currentTipo ? TIPO_CONFIG[currentTipo].label : '— Tipo no seleccionado —';

  // Fecha
  let fechaStr = '';
  if (fecha) {
    fechaStr = formatDate(fecha);
    if (fechaFin && fechaFin > fecha) fechaStr += ` al ${formatDate(fechaFin)}`;
  }
  setPreview('p-prev-fecha', fechaStr, 'Sin fecha');

  // Horario
  let horaStr = '';
  if (todoDia) {
    horaStr = 'Jornada completa';
  } else {
    const parts = [];
    if (horaEnt) parts.push(`Llegada: ${horaEnt}`);
    if (horaSal) parts.push(`Salida: ${horaSal}`);
    horaStr = parts.join(' · ');
  }
  setPreview('p-prev-hora', horaStr, '—');

  // Motivo
  setPreview('p-prev-motivo', motivo, 'Sin motivo');

  // Tutor
  const tutorStr = tutor ? `${tutor} (${parentesco})` : '';
  setPreview('p-prev-tutor', tutorStr, '—');

  // Contacto
  const contactoParts = [];
  if (tel) contactoParts.push(tel);
  if (correo) contactoParts.push(correo);
  setPreview('p-prev-contacto', contactoParts.join(' · '), '—');

  validateForm();
}

function setPreview(id, val, emptyText) {
  const el = document.getElementById(id);
  if (val) {
    el.innerHTML = val;
    el.className = 'pv-val';
  } else {
    el.innerHTML = `<span class="empty">${emptyText}</span>`;
    el.className = 'pv-val';
  }
}

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
}

// ─── Validación del botón Enviar ─────────────────────────
function validateForm() {
  const btn = document.getElementById('p-btn-enviar');

  if (!currentTipo) { btn.disabled = true; return; }

  const nombre    = document.getElementById('p-nombre').value.trim();
  const apellidos = document.getElementById('p-apellidos').value.trim();
  const grado     = document.getElementById('p-grado').value;
  const fecha     = document.getElementById('p-fecha').value;
  const motivo    = document.getElementById('p-motivo').value.trim();
  const tutor     = document.getElementById('p-tutor').value.trim();

  // Campos siempre requeridos
  if (!nombre || !apellidos || !grado || !fecha || !motivo || !tutor) {
    btn.disabled = true; return;
  }

  // Validación de hora según tipo visible
  const cfg = TIPO_CONFIG[currentTipo];
  const todoDia = document.getElementById('p-todo-dia').checked;

  if (!todoDia) {
    if (cfg.mostrarEntrada && !document.getElementById('p-hora-entrada').value) {
      btn.disabled = true; return;
    }
    if (cfg.mostrarSalida && !document.getElementById('p-hora-salida').value) {
      btn.disabled = true; return;
    }
  }

  btn.disabled = false;
}

// ─── Enviar solicitud ────────────────────────────────────
function enviarSolicitud() {
  const folio = folioGenerado || generarFolio();
  document.getElementById('p-folio-display').textContent = folio;
  document.getElementById('p-prev-folio').textContent = folio;

  const banner = document.getElementById('p-success');
  banner.style.display = 'block';
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  document.getElementById('p-btn-enviar').disabled = true;
}

// ─── Generar PDF ─────────────────────────────────────────
function generarPDF() {
  if (!currentTipo) {
    alert('Selecciona primero el tipo de solicitud antes de generar el PDF.');
    return;
  }

  // Recopilar todos los datos del formulario
  const datos = recopilarDatos();

  // Verificar campos mínimos
  if (!datos.nombre && !datos.apellidos) {
    alert('Completa al menos el nombre del alumno para generar el PDF.');
    return;
  }

  // Cargar jsPDF desde CDN si aún no está disponible
  if (typeof window.jspdf === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => construirPDF(datos);
    script.onerror = () => alert('No se pudo cargar la librería de PDF. Verifica tu conexión a internet.');
    document.head.appendChild(script);
  } else {
    construirPDF(datos);
  }
}

// Recopila todos los valores del formulario en un objeto
function recopilarDatos() {
  const todoDia  = document.getElementById('p-todo-dia').checked;
  const horaEnt  = document.getElementById('p-hora-entrada').value;
  const horaSal  = document.getElementById('p-hora-salida').value;
  const fecha    = document.getElementById('p-fecha').value;
  const fechaFin = document.getElementById('p-fecha-fin').value;
  const cfg      = currentTipo ? TIPO_CONFIG[currentTipo] : null;

  // Construir string de horario
  let horario = '';
  if (todoDia) {
    horario = 'Jornada completa';
  } else {
    const parts = [];
    if (horaEnt && cfg && cfg.mostrarEntrada) parts.push(`Llegada: ${horaEnt}`);
    if (horaSal && cfg && cfg.mostrarSalida)  parts.push(`Salida: ${horaSal}`);
    horario = parts.join('   |   ');
  }

  // Construir string de fecha
  let fechaStr = fecha ? formatDate(fecha) : '—';
  if (fechaFin && fechaFin > fecha && cfg && cfg.mostrarHasta) {
    fechaStr += ` al ${formatDate(fechaFin)}`;
  }

  return {
    folio:      folioGenerado || generarFolio(),
    tipoLabel:  cfg ? cfg.label : '—',
    nombre:     document.getElementById('p-nombre').value.trim(),
    apellidos:  document.getElementById('p-apellidos').value.trim(),
    grado:      document.getElementById('p-grado').value,
    turno:      document.getElementById('p-turno').value,
    fechaStr,
    horario,
    motivo:     document.getElementById('p-motivo').value.trim(),
    tutor:      document.getElementById('p-tutor').value.trim(),
    parentesco: document.getElementById('p-parentesco').value,
    tel:        document.getElementById('p-tel').value.trim(),
    correo:     document.getElementById('p-correo').value.trim(),
    archivo:    document.getElementById('p-file-name').textContent || '',
    fechaEmision: new Date().toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric'
    }),
  };
}

// Construye y descarga el PDF con jsPDF
function construirPDF(d) {
  // Compatibilidad: jsPDF puede estar en window.jspdf o window.jsPDF
  const jsPDFLib = (window.jspdf && window.jspdf.jsPDF)
    ? window.jspdf.jsPDF
    : window.jsPDF;

  if (!jsPDFLib) {
    alert('Error: no se pudo inicializar jsPDF. Verifica tu conexión a internet y recarga la página.');
    return;
  }

  const doc = new jsPDFLib({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW = 210;
  const PH = 297;
  const ML = 18;
  const MR = 18;
  const CW = PW - ML - MR;

  // Colores RGB
  const GUINDA  = [199, 103, 56];
  const GUINDA2 = [253, 243, 236];
  const TEXT    = [44,  26,  26 ];
  const TEXT_S  = [122, 90,  74 ];
  const LINE    = [226, 216, 204];
  const WHITE   = [255, 255, 255];
  const CREAM   = [245, 240, 232];
  const GRAY    = [100, 100, 100];

  // ── Helpers ────────────────────────────────────────
  function sf(style, size, rgb) {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...(rgb || TEXT));
  }

  function fillRect(x, y, w, h, rgb) {
    doc.setFillColor(...rgb);
    doc.rect(x, y, w, h, 'F');
  }

  function strokeRect(x, y, w, h, rgb, lw) {
    doc.setDrawColor(...rgb);
    doc.setLineWidth(lw || 0.25);
    doc.rect(x, y, w, h, 'D');
  }

  function fillStrokeRect(x, y, w, h, fillRgb, strokeRgb) {
    doc.setFillColor(...fillRgb);
    doc.setDrawColor(...strokeRgb);
    doc.setLineWidth(0.25);
    doc.rect(x, y, w, h, 'FD');
  }

  function hLine(yPos, rgb) {
    doc.setDrawColor(...(rgb || LINE));
    doc.setLineWidth(0.25);
    doc.line(ML, yPos, PW - MR, yPos);
  }

  function dot(x, y, rgb) {
    doc.setFillColor(...rgb);
    doc.circle(x, y, 1.5, 'F');
  }

  function secHeader(yPos, titulo) {
    fillStrokeRect(ML, yPos, CW, 7, GUINDA2, LINE);
    dot(ML + 4, yPos + 3.5, GUINDA);
    sf('bold', 8, GUINDA);
    doc.text(titulo, ML + 9, yPos + 4.8);
    return yPos + 10;
  }

  // ── ENCABEZADO (banda guinda) ──────────────────────
  fillRect(0, 0, PW, 30, GUINDA);

  // Caja blanca del logo
  fillRect(ML, 5, 20, 20, [230, 115, 70]);   // ligeramente más claro que guinda
  sf('bold', 13, WHITE);
  doc.text('S14', ML + 10, 17, { align: 'center' });

  // Nombre escuela
  sf('bold', 11.5, WHITE);
  doc.text('Esc. Sec. Tec. 14 "Ramon Lopez Velarde"', ML + 24, 13);
  sf('normal', 7, [240, 220, 210]);
  doc.text('SISTEMA DE GESTION DE PERMISOS  \xB7  CICLO 2025\u20132026', ML + 24, 19);

  // Folio (derecha, fondo semi-blanco)
  fillRect(PW - MR - 38, 6, 38, 18, [215, 120, 75]);
  sf('bold', 6.5, [240, 220, 210]);
  doc.text('FOLIO', PW - MR - 19, 13, { align: 'center' });
  sf('bold', 9.5, WHITE);
  doc.text(d.folio, PW - MR - 19, 20, { align: 'center' });

  // ── TÍTULO ─────────────────────────────────────────
  let y = 38;
  sf('bold', 15, GUINDA);
  doc.text('SOLICITUD DE PERMISO', PW / 2, y, { align: 'center' });
  y += 5;
  sf('normal', 9, TEXT_S);
  doc.text(d.tipoLabel.toUpperCase(), PW / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(...GUINDA);
  doc.setLineWidth(0.8);
  doc.line(PW / 2 - 22, y, PW / 2 + 22, y);

  // ── SECCIÓN ALUMNO ─────────────────────────────────
  y += 6;
  y = secHeader(y, 'DATOS DEL ALUMNO');

  const col1 = ML;
  const col2 = ML + CW / 2 + 2;
  const colW = CW / 2 - 4;
  const nombreCompleto = [d.nombre, d.apellidos].filter(Boolean).join(' ') || '\u2014';

  sf('bold', 7, TEXT_S);
  doc.text('NOMBRE COMPLETO', col1, y);
  sf('normal', 11, TEXT);
  doc.text(nombreCompleto, col1, y + 5.5);

  sf('bold', 7, TEXT_S);
  doc.text('GRADO / TURNO', col2, y);
  sf('normal', 11, TEXT);
  doc.text(`${d.grado || '\u2014'} \xB7 ${d.turno}`, col2, y + 5.5);

  y += 13;
  hLine(y);

  // ── SECCIÓN DETALLE ────────────────────────────────
  y += 5;
  y = secHeader(y, 'DETALLE DE LA AUSENCIA');

  sf('bold', 7, TEXT_S);
  doc.text('FECHA', col1, y);
  sf('normal', 10.5, TEXT);
  doc.text(d.fechaStr || '\u2014', col1, y + 5.5);

  sf('bold', 7, TEXT_S);
  doc.text('HORARIO', col2, y);
  sf('normal', 10.5, TEXT);
  doc.text(d.horario || 'Jornada completa', col2, y + 5.5);

  y += 14;

  // Caja de motivo
  sf('bold', 7, TEXT_S);
  doc.text('MOTIVO DETALLADO', col1, y);
  y += 4;
  const motivoLines = doc.splitTextToSize(d.motivo || '\u2014', CW - 6);
  const motivoH = Math.max(16, motivoLines.length * 5.2 + 7);
  fillStrokeRect(ML, y, CW, motivoH, CREAM, LINE);
  sf('normal', 9.5, TEXT);
  doc.text(motivoLines, ML + 3, y + 5.5);
  y += motivoH + 5;

  hLine(y);

  // ── SECCIÓN TUTOR ──────────────────────────────────
  y += 5;
  y = secHeader(y, 'DATOS DEL PADRE / TUTOR');

  sf('bold', 7, TEXT_S);
  doc.text('NOMBRE Y PARENTESCO', col1, y);
  sf('normal', 10.5, TEXT);
  const tutorStr = d.tutor ? `${d.tutor} (${d.parentesco})` : '\u2014';
  doc.text(tutorStr, col1, y + 5.5);

  sf('bold', 7, TEXT_S);
  doc.text('CONTACTO', col2, y);
  sf('normal', 10.5, TEXT);
  const contacto = [d.tel, d.correo].filter(Boolean).join('  |  ') || '\u2014';
  doc.text(doc.splitTextToSize(contacto, colW), col2, y + 5.5);

  y += 16;

  // Documento adjunto
  if (d.archivo) {
    hLine(y);
    y += 5;
    sf('bold', 7, TEXT_S);
    doc.text('DOCUMENTO ADJUNTO', col1, y);
    sf('normal', 9, GRAY);
    doc.text(d.archivo, col1, y + 5);
    y += 12;
  }

  hLine(y);

  // ── FIRMAS ─────────────────────────────────────────
  y += 14;
  const sigW = (CW - 12) / 2;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.5);
  // Línea firma 1
  doc.line(ML, y, ML + sigW, y);
  sf('normal', 7.5, TEXT_S);
  doc.text('Firma del padre / tutor', ML + sigW / 2, y + 4.5, { align: 'center' });
  sf('bold', 8, TEXT);
  doc.text(d.tutor || '________________________________', ML + sigW / 2, y + 9, { align: 'center' });

  // Línea firma 2
  const sig2X = ML + sigW + 12;
  doc.setDrawColor(...LINE);
  doc.line(sig2X, y, sig2X + sigW, y);
  sf('normal', 7.5, TEXT_S);
  doc.text('Vo.Bo. Direccion / Control Escolar', sig2X + sigW / 2, y + 4.5, { align: 'center' });
  sf('bold', 8, TEXT);
  doc.text('________________________________', sig2X + sigW / 2, y + 9, { align: 'center' });

  // Sello
  y += 20;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.circle(PW / 2, y + 10, 14, 'D');
  sf('normal', 7, TEXT_S);
  doc.text('SELLO', PW / 2, y + 12, { align: 'center' });
  doc.text('OFICIAL', PW / 2, y + 17, { align: 'center' });

  // ── PIE ────────────────────────────────────────────
  y = PH - 16;
  hLine(y);
  y += 5;
  sf('normal', 6.5, TEXT_S);
  doc.text(
    `Emitido el ${d.fechaEmision}  \xB7  Esc. Sec. Tec. 14  \xB7  Sistema de Gestion de Permisos  \xB7  Ciclo 2025\u20132026`,
    PW / 2, y, { align: 'center' }
  );
  sf('normal', 6, GRAY);
  doc.text(
    'Este documento es valido unicamente con sello y firma de la institucion.',
    PW / 2, y + 4, { align: 'center' }
  );

  // ── Guardar ────────────────────────────────────────
  const slug = `${d.nombre}_${d.apellidos}`.replace(/\s+/g, '_') || 'alumno';
  doc.save(`Permiso_${d.folio}_${slug}.pdf`);
}

// ─── Limpiar formulario ──────────────────────────────────
function resetForm() {
  // Inputs de texto, date, time, textarea
  ['p-nombre','p-apellidos','p-fecha','p-fecha-fin',
   'p-hora-entrada','p-hora-salida','p-motivo','p-tutor','p-tel','p-correo']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  // Selects a valor por defecto
  document.getElementById('p-grado').value = '';
  document.getElementById('p-turno').value = 'Matutino';
  document.getElementById('p-parentesco').value = 'Padre';

  // Checkbox
  const chk = document.getElementById('p-todo-dia');
  chk.checked = false;
  chk.disabled = false;

  // Tipo
  document.querySelectorAll('.tipo-opt').forEach(o => o.classList.remove('selected'));
  currentTipo = null;
  folioGenerado = null;

  // Restaurar visibilidad predeterminada
  document.getElementById('p-hora-entrada-field').classList.remove('hidden');
  document.getElementById('p-hora-salida-field').classList.remove('hidden');
  document.getElementById('p-todo-dia-field').classList.remove('hidden');
  document.getElementById('p-fecha-fin-wrap').classList.remove('hidden');
  document.getElementById('p-fecha-fin').disabled = false;

  // Placeholder motivo
  document.getElementById('p-motivo').placeholder = 'Describe el motivo de la solicitud…';

  // Hint
  const hint = document.getElementById('tipo-hint');
  if (hint) hint.remove();

  // Archivo
  removeFile();

  // Success banner
  document.getElementById('p-success').style.display = 'none';

  // Preview reset
  document.getElementById('p-prev-folio').textContent = 'ST14-2026-????';
  document.getElementById('p-prev-tipo').textContent = '— Tipo no seleccionado —';
  setPreview('p-prev-alumno', '', 'Sin nombre');
  setPreview('p-prev-grado', '', '—');
  setPreview('p-prev-fecha', '', 'Sin fecha');
  setPreview('p-prev-hora', '', '—');
  setPreview('p-prev-motivo', '', 'Sin motivo');
  setPreview('p-prev-tutor', '', '—');
  setPreview('p-prev-contacto', '', '—');

  document.getElementById('p-btn-enviar').disabled = true;
}

// ─── Archivo adjunto ────────────────────────────────────
function showFile() {
  const input = document.getElementById('p-file');
  const badge = document.getElementById('p-file-badge');
  const nameEl = document.getElementById('p-file-name');
  if (input.files && input.files[0]) {
    nameEl.textContent = input.files[0].name;
    badge.style.display = 'flex';
  }
}

function removeFile() {
  document.getElementById('p-file').value = '';
  document.getElementById('p-file-badge').style.display = 'none';
  document.getElementById('p-file-name').textContent = '';
}

// ─── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Asegurarse de que el botón empieza deshabilitado
  document.getElementById('p-btn-enviar').disabled = true;

  // Escuchar cambio en la fecha principal para validar
  document.getElementById('p-fecha').addEventListener('change', updatePreview);
});

// ─── Tutorial Driver.js ──────────────────────────────────
function iniciarTutorial() {
  const driver = window.driver.js.driver;

  const tour = driver({
    showProgress: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Listo!',
    progressText: 'Paso {{current}} de {{total}}',
    steps: [
      {
        // Paso 1: Tipo de solicitud
        element: '.tipo-grid',
        popover: {
          title: '1. Elige el tipo de solicitud',
          description: 'Selecciona si es una <b>falta por enfermedad</b>, un <b>permiso anticipado</b>, un <b>retardo</b> o una <b>salida temprana</b>. Cada tipo activa campos diferentes.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        // Paso 2: Datos del alumno
        element: '#panel-padres .card-body',
        popover: {
          title: '2. Datos del alumno',
          description: 'Escribe el <b>nombre completo</b> del alumno y selecciona su <b>grado y turno</b>. Estos datos aparecerán en el PDF final.',
          side: 'top',
          align: 'start'
        }
      },
      {
        // Paso 3: Detalle de ausencia
        element: '#p-fecha',
        popover: {
          title: '3. Fecha de la ausencia',
          description: 'Selecciona la fecha. Puedes registrar hasta <b>3 días antes o después</b> de hoy. Si la ausencia dura varios días, usa el campo "Hasta".',
          side: 'bottom'
        }
      },
      {
        // Paso 4: Motivo
        element: '#p-motivo',
        popover: {
          title: '4. Motivo detallado',
          description: 'Explica brevemente el <b>motivo</b> de la ausencia. Este texto aparecerá en el documento oficial.',
          side: 'top'
        }
      },
      {
        // Paso 5: Datos del tutor
        element: '#p-tutor',
        popover: {
          title: '5. Datos del padre o tutor',
          description: 'Escribe el nombre del <b>padre, madre o tutor</b> que realiza la solicitud, junto con su teléfono y correo electronico.',
          side: 'top'
        }
      },
      {
        // Paso 6: Documento adjunto
        element: '.upload-zone',
        popover: {
          title: '6. Documento de respaldo',
          description: 'Puedes adjuntar una <b>receta médica, cita o constancia</b> en PDF, JPG o PNG de hasta 5 MB.',
          side: 'top'
        }
      },
      {
        // Paso 7: Vista previa
        element: '.preview-card',
        popover: {
          title: '7. Vista previa en tiempo real',
          description: 'Aquí verás cómo quedará tu solicitud conforme llenas los campos. El <b>folio único</b> se genera automáticamente.',
          side: 'left'
        }
      },
      {
        // Paso 8: Botones de acción
        element: '.actions',
        popover: {
          title: '8. Botones de acción',
          description: '• <b>Limpiar</b>: borra todo el formulario.<br>• <b>Generar PDF</b>: descarga el documento oficial.<br>• <b>Enviar solicitud</b>: se activa cuando todos los campos requeridos están completos.',
          side: 'top',
          align: 'end'
        }
      }
    ]
  });

  tour.drive();
}
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
// MENÚ DE USUARIO
// =====================
function toggleUserMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('user-menu');
  const chip = event.currentTarget;
  const isOpen = menu.classList.contains('open');

  // Cierra cualquier otro menú abierto primero
  document.querySelectorAll('.user-menu.open').forEach(m => m.classList.remove('open'));

  if (!isOpen) {
    menu.classList.add('open');
    chip.classList.add('active');
  } else {
    chip.classList.remove('active');
  }
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function () {
  document.querySelectorAll('.user-menu.open').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.user-chip.active').forEach(c => c.classList.remove('active'));
});

function logout() {
  window.location.href = 'index.html';
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