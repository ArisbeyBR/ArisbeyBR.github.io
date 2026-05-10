/* ═══════════════════════════════════════════════════
   tutorial-contrasena.js
   Tour Driver.js para CambiarContrasena.html
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
        popover: {
          title: '🔒 Cambio de contraseña',
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

/* ─── Crear botón flotante al cargar la página ─── */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.id = 'btn-ayuda-flotante';
  btn.innerHTML = '😊';
  btn.setAttribute('data-tooltip', 'Tour guiado');
  btn.setAttribute('title', '¿Cómo usar esta página?');
  btn.setAttribute('aria-label', 'Iniciar tutorial de ayuda');
  btn.addEventListener('click', iniciarTutorial);
  document.body.appendChild(btn);
});