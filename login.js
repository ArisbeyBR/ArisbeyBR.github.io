// Configuración de roles: Aquí defines tus rutas de imagen y los textos.
const roleData = {
    directivo: {
        image: "url('./img/Esc.background.jpeg')", 
        features: [
            { title: "Gestión de permisos", desc: "Revisa las solicitaciones y justificantes de ausencias en línea para Docentes y alumnos" },
            { title: "Aprobación inmediata", desc: "Aprueba y emite justificantes digitales" },
            { title: "Registro de asistencias", desc: "Control mensual por salón con historial completo" }
        ]
    },
    docente: {
        image: "url('./img/login-Salon.jpeg')", 
        features: [
            { title: "Gestión de permisos", desc: "Solicita ausencias en línea, para Docentes" },
            { title: "Gestión de solicitudes", desc: "Genera solicitudes de salidas tempranas para alumnos" },
            { title: "Registro de asistencias", desc: "Control diario por salón con historial completo de asistencias" }
        ]
    },
    padre: {
        image: "url('./img/login-Alumnos.jpg')", 
        features: [
            { title: "Gestión de permisos", desc: "Justifica ausencias en línea" },
            { title: "Aprobación inmediata", desc: "El directivo revisa y emite justificantes digitales en formato PDF" },
            { title: "Asistencias", desc: "Comprobación de estado de asistencia diaria y análisis de su situación" }
        ]
    }
};

const leftPanel = document.getElementById('left-panel');
const dynamicFeatures = document.getElementById('dynamic-features');
const roleButtons = document.querySelectorAll('.role-btn');

//Imagenes para que carguen rapido y no se trabe la pagina
Object.values(roleData).forEach(data => {
    const img = new Image();
    const urlMatch = data.image.match(/url\(['"]?(.*?)['"]?\)/);
    if (urlMatch) img.src = urlMatch[1];
});

function updateInterface(role) {
    const data = roleData[role];
    if (!data) return;

    //fondo
    leftPanel.style.backgroundImage = data.image;
    dynamicFeatures.innerHTML = '';
    data.features.forEach(feature => {
        const item = document.createElement('div');
        item.className = 'feature-item';
        item.innerHTML = `
            <div>
                <h4>${feature.title}</h4>
                <p>${feature.desc}</p>
            </div>
        `;
        dynamicFeatures.appendChild(item);
    });
}

// Eventos de los botones
roleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        roleButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        updateInterface(e.target.dataset.role);
    });
});

updateInterface('directivo');

const usuariosMock = {
    "directivo@sec.edu": { password: "123", rol: "directivo", redirect: "Directivos.html" },
    "docente@sec.edu": { password: "123", rol: "docente", redirect: "Asistencias.html" },
    "tutor@sec.edu": { password: "123", rol: "padre", redirect: "Permisos.html" }
};

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const emailInput = loginForm.querySelector('input[type="email"]').value.trim().toLowerCase();
    const passwordInput = loginForm.querySelector('input[type="password"]').value;
    
    const activeRoleBtn = document.querySelector('.role-btn.active').dataset.role;
    const usuario = usuariosMock[emailInput];

    if (!usuario) {
        alert("El correo no existe.");
        return;
    }

    if (usuario.password !== passwordInput) {
        alert("Contraseña incorrecta.");
        return;
    }

    if (usuario.rol !== activeRoleBtn) {
        alert("Tus credenciales son de ${usuario.rol}, pero estás intentando entrar en la pestaña de "+{activeRoleBtn});
        return;
    }

    window.location.href = usuario.redirect;
});
// ─── Tutorial Driver.js ──────────────────────────────────

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
        popover: {
          title: '¿Cómo iniciar sesión?',
          description: 'Esta página te da acceso al <b>Sistema de Gestión de Permisos</b>. Tienes credenciales diferentes según tu rol en la escuela.',
          side: 'over',
          align: 'center'
        }
      },
      {
        element: '.login-left',
        popover: {
          title: '1. Panel informativo',
          description: 'A la izquierda verás información sobre las <b>funciones disponibles</b> según el rol que selecciones: directivo, docente o padre/tutor.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.role-selector',
        popover: {
          title: '2. Selecciona tu rol',
          description: 'Elige tu perfil antes de ingresar:<br>• <b>Directivo</b>: aprueba permisos y gestiona el sistema<br>• <b>Docente</b>: toma asistencia y ve permisos de su grupo<br>• <b>Padre/Tutor</b>: envía solicitudes de permiso',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#login-form .input-group:first-child',
        popover: {
          title: '3. Correo electrónico',
          description: 'Escribe el <b>correo institucional</b> que te fue asignado al registrarte en el sistema.',
          side: 'bottom'
        }
      },
      {
        element: '#login-form .input-group:last-of-type',
        popover: {
          title: '4. Contraseña',
          description: 'Ingresa tu contraseña. Si es la primera vez que accedes o la olvidaste, contacta al administrador del sistema.',
          side: 'top'
        }
      },
      {
        element: '.btn-submit',
        popover: {
          title: '5. Entrar al sistema',
          description: 'Haz clic en <b>"Entrar al sistema"</b> para ingresar. Serás redirigido al panel correspondiente a tu rol.',
          side: 'top',
          align: 'center'
        }
      }
    ]
  });
 
  tour.drive();
}