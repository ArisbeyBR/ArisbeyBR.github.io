/* ═══════════════════════════════════════════════════
   Sistema.js  –  Secundaria Técnica 14
   JS compartido: navbar, dropdown, modal cerrar sesión
   ═══════════════════════════════════════════════════ */

'use strict';

/* ─── Datos de sesión simulados ─────────────────────
   En producción esto vendría del backend/sesión real. */
const SESSION = {
  nombre:    'María González',
  apellidos: 'Morales López',
  rol:       'Docente',            // 'Docente' | 'Directivo'
  grado:     '2°B',
  turno:     'Matutino',
  escuela:   'Secundaria Técnica 14',
  correo:    'mgonzalez@sec14.edu.mx',
  telefono:  '442 123 4567',
  curp:      'GOML851030MQRNRL09',
};

/* ─── Iniciales del avatar ──────────────────────────*/
function getInitials(nombre, apellidos) {
  const n = (nombre || '').trim().split(' ')[0][0] || '';
  const a = (apellidos || '').trim().split(' ')[0][0] || '';
  return (n + a).toUpperCase();
}

/* ─── Construye la barra de navegación ─────────────
   Inserta el HTML del navbar dentro del elemento
   con id="navbar-root" que cada página debe tener. */
function buildNavbar() {
  const root = document.getElementById('navbar-root');
  if (!root) return;

  const initials  = getInitials(SESSION.nombre, SESSION.apellidos);
  const fullName  = `${SESSION.nombre} ${SESSION.apellidos}`;
  const isDocente = SESSION.rol === 'Docente';

  root.innerHTML = `
  <nav class="navbar">
    <a href="index.html" class="navbar-logo">
      <div class="logo-icon">S14</div>
      <div class="logo-text">
        <strong>Secundaria Técnica 14</strong>
        <span>Sistema de Gestión Escolar</span>
      </div>
    </a>

    <div class="navbar-links">
      <a href="#" class="nav-link ${isDocente ? 'active' : ''}">Cursos</a>
      <a href="Permisos.html" class="nav-link">Permisos</a>
      ${!isDocente ? '<a href="#" class="nav-link">Reportes</a>' : ''}
      <a href="#" class="nav-link">Calendario</a>
    </div>

    <div class="navbar-user">
      <div class="user-pill" id="user-pill" onclick="toggleDropdown()">
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
          <div class="user-name">${fullName}</div>
          <div class="user-role">${SESSION.rol}</div>
        </div>
        <span class="user-caret">▾</span>
      </div>

      <div class="user-dropdown" id="user-dropdown">
        <div class="dropdown-header">
          <div class="dh-name">${fullName}</div>
          <div class="dh-role">${SESSION.rol} · ${SESSION.escuela}</div>
        </div>
        <a href="Perfil.html" class="dropdown-item">
          <span class="di-icon">👤</span> Perfil
        </a>
        <a href="CambiarContrasena.html" class="dropdown-item">
          <span class="di-icon">🔑</span> Cambiar contraseña
        </a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item danger" onclick="openLogoutModal()">
          <span class="di-icon">↩</span> Cerrar sesión
        </button>
      </div>
    </div>
  </nav>

  <!-- Modal confirmar logout -->
  <div class="modal-overlay" id="logout-modal">
    <div class="modal-box">
      <h3>¿Cerrar sesión?</h3>
      <p>Se cerrará tu sesión actual. Tendrás que volver a ingresar tus credenciales para acceder al sistema.</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeLogoutModal()">Cancelar</button>
        <button class="btn btn-danger" onclick="doLogout()">Sí, cerrar sesión</button>
      </div>
    </div>
  </div>
  `;
}

/* ─── Toggle dropdown ───────────────────────────────*/
function toggleDropdown() {
  const pill = document.getElementById('user-pill');
  const dd   = document.getElementById('user-dropdown');
  const open = dd.classList.toggle('open');
  pill.classList.toggle('open', open);
}

/* Cierra el dropdown al clic fuera */
document.addEventListener('click', e => {
  const pill = document.getElementById('user-pill');
  const dd   = document.getElementById('user-dropdown');
  if (!pill || !dd) return;
  if (!pill.contains(e.target) && !dd.contains(e.target)) {
    dd.classList.remove('open');
    pill.classList.remove('open');
  }
});

/* ─── Modal logout ───────────────────────────────── */
function openLogoutModal()  {
  document.getElementById('user-dropdown').classList.remove('open');
  document.getElementById('user-pill').classList.remove('open');
  document.getElementById('logout-modal').classList.add('open');
}
function closeLogoutModal() { document.getElementById('logout-modal').classList.remove('open'); }
function doLogout()         { window.location.href = 'index.html'; }

/* ─── Init ──────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', buildNavbar);

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
        element: '#panel-padres .card:nth-child(2)',
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
          description: 'Escribe el nombre del <b>padre, madre o tutor</b> que realiza la solicitud, junto con su teléfono o correo de contacto.',
          side: 'top'
        }
      },
      {
        // Paso 6: Documento adjunto
        element: '.upload-zone',
        popover: {
          title: '6. Documento de respaldo (opcional)',
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

function iniciarTutorialPerfil() {
  const driver = window.driver.js.driver;
 
  const tour = driver({
    showProgress: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Entendido!',
    progressText: 'Paso {{current}} de {{total}}',
    onDestroyStarted: () => { tour.destroy(); },
    steps: [
      {
        popover: {
          title: 'Bienvenido a tu perfil',
          description: 'Desde aquí puedes <b>ver y editar tu información personal</b> registrada en el sistema. Mantén tus datos actualizados para que la escuela pueda contactarte correctamente.',
          side: 'over',
          align: 'center'
        }
      },
      {
        element: '.sidebar-card',
        popover: {
          title: '1. Tu tarjeta de identidad',
          description: 'Aquí ves un resumen rápido: tu <b>nombre, rol, turno y correo</b>. Se actualiza automáticamente cuando guardas cambios en el formulario.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.sidebar-links',
        popover: {
          title: '2. Navegación de cuenta',
          description: 'Desde este menú puedes ir a:<br>• <b>Mi perfil</b>: esta página<br>• <b>Contraseña</b>: cambiar tu clave de acceso<br>• <b>Permisos</b>: gestionar permisos de alumnos',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.school-chip',
        popover: {
          title: '3. Escuela asignada',
          description: 'Muestra la <b>institución y ciclo escolar</b> al que estás vinculado en el sistema. Este dato es asignado por el administrador.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.card:nth-of-type(2)',
        popover: {
          title: '4. Datos personales',
          description: 'Completa tu <b>nombre completo, CURP, correo y teléfono</b>. Los campos con asterisco (*) son obligatorios.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.card:nth-of-type(3)',
        popover: {
          title: '5. Domicilio',
          description: 'Registra tu <b>dirección completa</b>: municipio, colonia, calle, número y código postal. Este dato puede usarse en comunicaciones oficiales.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.card:nth-of-type(4)',
        popover: {
          title: '6. Datos laborales',
          description: 'Aquí aparece tu <b>rol en el sistema</b> (solo lectura) y puedes ajustar tu <b>turno y grupo tutorado</b>.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.form-actions',
        popover: {
          title: '7. Guardar o cancelar',
          description: '• <b>Cancelar</b>: descarta los cambios y recarga la página.<br>• <b>Guardar cambios</b>: actualiza tu información en el sistema y muestra una confirmación verde.',
          side: 'top',
          align: 'end'
        }
      }
    ]
  });
 
  tour.drive();
}

/* ═══════════════════════════════════════════════════
   tutorial-index.js
   Tour Driver.js para index.html (Página principal)
   Secundaria Técnica 14 · Ciclo 2025-2026
   ═══════════════════════════════════════════════════ */
 
function iniciarTutorialIndex() {
  const driver = window.driver.js.driver;
 
  const tour = driver({
    showProgress: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Empezar!',
    progressText: 'Paso {{current}} de {{total}}',
    onDestroyStarted: () => { tour.destroy(); },
    steps: [
      {
        popover: {
          title: 'Bienvenido a la Secundaria Técnica 14',
          description: 'Este es el sitio oficial de la <b>Esc. Sec. Téc. 14 "Ramón López Velarde"</b>. Te mostramos en segundos cómo navegar y acceder al sistema de gestión escolar.',
          side: 'over',
          align: 'center'
        }
      },
      {
        element: '.navbar',
        popover: {
          title: '1. Barra de navegación',
          description: 'En la parte superior encuentras el <b>logo de la escuela</b> y los accesos principales al sistema.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-login-header',
        popover: {
          title: '2. Iniciar sesión',
          description: 'Haz clic aquí para entrar al <b>Sistema de Gestión de Permisos</b>. Puedes ingresar como <b>Directivo, Docente o Padre/Tutor</b>.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '.hero',
        popover: {
          title: '3. Bienvenida institucional',
          description: 'Aquí encontrarás la <b>presentación oficial</b> de la escuela y sus valores educativos.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.features',
        popover: {
          title: '4. Servicios del sistema',
          description: 'Estas tarjetas describen los <b>los pilares del sistema</b>: excelencia académica, acceso digital a trámites y conectividad. Haz clic en <b>"Acceso digital"</b> para ver más detalles.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.about-section',
        popover: {
          title: '5. Sobre la escuela',
          description: 'Conoce más sobre la institución: instalaciones, enfoque académico y propuesta educativa.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.stats-section',
        popover: {
          title: '6. Datos en números',
          description: 'Un vistazo rápido: <b>52 años</b> de experiencia, más de <b>100 dispositivos</b> conectados y <b>759 alumnos</b> inscritos en el ciclo actual.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.btn-info-header',
        popover: {
          title: '7. Registrarte',
          description: 'Aun no cuentas con una cuenta? Haz clic aquí para registrarte como padre/tutor y empezar a usar el sistema.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.btn-login',
        popover: {
          title: '¡Listo para empezar!',
          description: 'Ya conoces el sitio. Cuando quieras acceder al sistema, usa el botón <b>"Iniciar sesión"</b>.',
          side: 'bottom',
          align: 'end'
        }
      }
    ]
  });
 
  tour.drive();
}
/* ═══════════════════════════════════════════════════
   tutorial-contrasena.js
   Tour Driver.js para CambiarContrasena.html
   Secundaria Técnica 14 · Ciclo 2025-2026
   ═══════════════════════════════════════════════════ */
 
function iniciarTutorialPass() {
  const driver = window.driver.js.driver;
 
  const tour = driver({
    showProgress: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Entendido!',
    progressText: 'Paso {{current}} de {{total}}',
    onDestroyStarted: () => { tour.destroy(); },
    steps: [
      {
        popover: {
          title: 'Cambio de contraseña',
          description: 'En esta página puedes <b>actualizar tu contraseña de acceso</b> al sistema. Solo necesitas tu contraseña actual y elegir una nueva que sea segura.',
          side: 'over',
          align: 'center'
        }
      },
      {
        element: '.pwd-user-header',
        popover: {
          title: '1. Tu cuenta',
          description: 'Aquí puedes confirmar que estás cambiando la contraseña de <b>tu cuenta</b> y no de otra persona.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.security-tip',
        popover: {
          title: '2. Consejo de seguridad',
          description: 'Lee este aviso antes de continuar. <b>Nunca compartas tu contraseña</b> con nadie, ni siquiera con personal de la escuela.',
          side: 'bottom'
        }
      },
      {
        element: '#pwd-actual',
        popover: {
          title: '3. Contraseña actual',
          description: 'Escribe tu contraseña <b>actual</b> para verificar tu identidad. Si la olvidaste, contacta al administrador del sistema.',
          side: 'bottom'
        }
      },
      {
        element: '#pwd-nueva',
        popover: {
          title: '4. Nueva contraseña',
          description: 'Escribe tu nueva contraseña. El sistema te mostrará un <b>medidor de fortaleza</b> en tiempo real: apunta al nivel <b>"Fuerte"</b>.',
          side: 'bottom'
        }
      },
      {
        element: '#req-list',
        popover: {
          title: '5. Requisitos de seguridad',
          description: 'Tu contraseña debe cumplir los 4 requisitos:<br>• Mínimo <b>8 caracteres</b><br>• Al menos una <b>mayúscula</b><br>• Al menos un <b>número</b><br>• Al menos un <b>carácter especial</b> (! @ # $ …)<br>Cada punto se marcará en verde al cumplirse.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#pwd-confirmar',
        popover: {
          title: '6. Confirmar contraseña',
          description: 'Vuelve a escribir la nueva contraseña para confirmar que no hay errores. Aparecerá un aviso verde cuando <b>ambas coincidan</b>.',
          side: 'top'
        }
      },
      {
        element: '#btn-actualizar',
        popover: {
          title: '7. Guardar cambios',
          description: 'El botón <b>"Actualizar contraseña"</b> se activa automáticamente cuando todos los requisitos están completos y las contraseñas coinciden. Un clic y listo.',
          side: 'top',
          align: 'end'
        }
      }
    ]
  });
 
  tour.drive();
}

/* ═══════════════════════════════════════════════════
   tutorial-asistencias.js
   Tour Driver.js para Asistencias.html (Lista de asistencia docente)
   Secundaria Técnica 14 · Ciclo 2025-2026
   ═══════════════════════════════════════════════════ */
 
function iniciarTutorial() {
  const driver = window.driver.js.driver;
 
  const tour = driver({
    showProgress: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Entendido!',
    progressText: 'Paso {{current}} de {{total}}',
    onDestroyStarted: () => { tour.destroy(); },
    steps: [
      {
        // Intro
        popover: {
          title: '📋 Bienvenido al registro de asistencias',
          description: 'Como docente, desde aquí puedes tomar <b>el pase de lista</b> de tu grupo cada día. El proceso es sencillo: selecciona el salón, la fecha y marca el estado de cada alumno.',
          side: 'over',
          align: 'center'
        }
      },
      {
        element: '#salon-sel',
        popover: {
          title: '1. Selecciona el salón',
          description: 'Elige el grupo al que le tomarás asistencia. La lista de alumnos cambiará automáticamente según el salón que escojas.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#fecha-sel',
        popover: {
          title: '2. Selecciona la fecha',
          description: 'Por defecto está marcada la <b>fecha de hoy</b>. Puedes cambiarla si necesitas registrar o corregir la asistencia de un día anterior.',
          side: 'bottom'
        }
      },
      {
        element: '#filtro',
        popover: {
          title: '3. Filtrar por nombre',
          description: 'Si el grupo es grande, escribe el apellido del alumno aquí para <b>encontrarlo rápidamente</b> en la lista.',
          side: 'bottom'
        }
      },
      {
        element: '#att-table thead',
        popover: {
          title: '4. Columnas de la lista',
          description: 'Cada fila es un alumno. Las columnas de estado son:<br>• <b>P</b> = Puntualidad (presente a tiempo)<br>• <b>A</b> = Ausencia<br>• <b>T</b> = Tardanza (llegó tarde)',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#att-tbody',
        popover: {
          title: '5. Marcar asistencia',
          description: 'Haz clic en el botón de radio (<b>P, A o T</b>) correspondiente a cada alumno. Las filas en <b>gris</b> están bloqueadas porque ya tienen un permiso aprobado por dirección.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#resumen-badge',
        popover: {
          title: '6. Resumen del grupo',
          description: 'Aquí ves rápidamente <b>cuántos alumnos</b> tiene el grupo y cuántas filas están bloqueadas por permisos aprobados.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '[onclick="resetPase()"]',
        popover: {
          title: '7. Reiniciar lista',
          description: 'Si cometiste un error, este botón <b>restablece todas las marcas</b> al estado inicial. Los cambios no guardados se perderán.',
          side: 'top',
          align: 'end'
        }
      },
      {
        element: '[onclick="guardarPase()"]',
        popover: {
          title: '8. Guardar asistencias',
          description: 'Una vez que termines de marcar a todos los alumnos, presiona <b>Guardar asistencias</b>. Recibirás una confirmación verde en la parte superior.',
          side: 'top',
          align: 'end'
        }
      }
    ]
  });
 
  tour.drive();
}
