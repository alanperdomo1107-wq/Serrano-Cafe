/* =========================================================
   SERRANO CAFÉ — script.js
   - Navegación móvil (toggle accesible)
   - Año dinámico en el footer
   - Formulario de contacto con envío real via EmailJS
   =========================================================

   CONFIGURACIÓN EMAILJS (3 pasos):
   ─────────────────────────────────
   1. Crear cuenta gratuita en https://www.emailjs.com
   2. En "Email Services" → Add Service → Gmail → conectar tu cuenta.
      Copiar el Service ID (ej: "service_abc123") → reemplazar EMAILJS_SERVICE_ID
   3. En "Email Templates" → Create Template. Usar estos campos en el cuerpo:
        De: {{from_name}} ({{from_email}})
        Teléfono: {{phone}}
        Comensales: {{people}}
        Mensaje: {{message}}
        Asunto: Nueva reserva - Serrano Café
      Copiar el Template ID → reemplazar EMAILJS_TEMPLATE_ID
   4. En "Account" → Public Key → reemplazar EMAILJS_PUBLIC_KEY

   ⚠️  La Public Key de EmailJS está DISEÑADA para ser pública en
       el frontend. NO es una clave secreta. El servicio la usa solo
       para asociar el envío a tu cuenta, sin exponer tu contraseña.
   ========================================================= */

(() => {
  'use strict';

  /* ── CONFIGURACIÓN: reemplazá estos tres valores con los tuyos ── */
  const EMAILJS_PUBLIC_KEY   = 'YZii0wJ0kqvsGfjRz';    // ej: "xK2abc..."
  const EMAILJS_SERVICE_ID   = 'service_ot0550g';    // ej: "service_abc123"
  const EMAILJS_TEMPLATE_ID  = 'template_wi2acyo';   // ej: "template_xyz456"
  /* ─────────────────────────────────────────────────────────────── */

  /* ---------- Inicializar EmailJS ---------- */
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  /* ---------- Año dinámico en el footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Navegación móvil ---------- */
  const header    = document.querySelector('.site-header');
  const navToggle = document.getElementById('nav-toggle');
  const mainNav   = document.getElementById('main-nav');

  if (navToggle && header && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Validación del formulario ---------- */
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('name-error'),
      validate(value) {
        if (value.trim().length < 2)   return 'Ingresá tu nombre completo (mínimo 2 caracteres).';
        if (value.trim().length > 60)  return 'El nombre es demasiado largo.';
        if (!/^[a-zA-ZÀ-ÿñÑ\s'-]+$/.test(value.trim())) return 'Usá solo letras y espacios.';
        return '';
      },
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('email-error'),
      validate(value) {
        const t = value.trim();
        if (t.length === 0)   return 'Ingresá tu correo electrónico.';
        if (t.length > 80)    return 'El correo es demasiado largo.';
        if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,24}$/.test(t))
          return 'Ingresá un correo válido (ej: nombre@dominio.com).';
        return '';
      },
    },
    phone: {
      input: document.getElementById('phone'),
      error: document.getElementById('phone-error'),
      validate(value) {
        const t = value.trim();
        if (t.length === 0) return '';           // opcional
        if (t.length > 20)  return 'El teléfono es demasiado largo.';
        if (!/^[0-9+\s()-]{6,20}$/.test(t)) return 'Usá solo números y símbolos como + ( ) -.';
        return '';
      },
    },
    people: {
      input: document.getElementById('people'),
      error: document.getElementById('people-error'),
      validate(value) {
        if (!value) return 'Elegí la cantidad de comensales.';
        return '';
      },
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('message-error'),
      validate(value) {
        const t = value.trim();
        if (t.length < 10)   return 'Contanos un poco más (mínimo 10 caracteres).';
        if (t.length > 500)  return 'El mensaje no puede superar los 500 caracteres.';
        return '';
      },
    },
  };

  /* ---------- Contador de caracteres ---------- */
  const messageInput = fields.message.input;
  const messageCount = document.getElementById('message-count');
  if (messageInput && messageCount) {
    messageInput.addEventListener('input', () => {
      messageCount.textContent = `${messageInput.value.length} / 500`;
    });
  }

  /* ---------- Helpers de error ---------- */
  function setFieldError(key, message) {
    const { input, error } = fields[key];
    const row = input.closest('.form-row');
    error.textContent = message;          // siempre textContent, nunca innerHTML
    if (message) {
      row.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
    } else {
      row.classList.remove('error');
      input.removeAttribute('aria-invalid');
    }
  }

  function validateField(key) {
    const { input, validate } = fields[key];
    const msg = validate(input.value);
    setFieldError(key, msg);
    return msg === '';
  }

  Object.keys(fields).forEach((key) => {
    fields[key].input.addEventListener('blur', () => validateField(key));
  });

  /* ---------- Envío del formulario ---------- */
  const statusEl  = document.getElementById('form-status');
  const submitBtn = form.querySelector('.form-submit');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    /* Validar todos los campos */
    let valid = true;
    Object.keys(fields).forEach((key) => { if (!validateField(key)) valid = false; });

    if (!valid) {
      statusEl.textContent = 'Revisá los campos marcados antes de enviar.';
      statusEl.className   = 'form-status error';
      const firstError = form.querySelector('.form-row.error input, .form-row.error select, .form-row.error textarea');
      if (firstError) firstError.focus();
      return;
    }

    /* Comprobar que el usuario configuró sus claves */
    if (
      EMAILJS_PUBLIC_KEY  === 'TU_PUBLIC_KEY'  ||
      EMAILJS_SERVICE_ID  === 'TU_SERVICE_ID'  ||
      EMAILJS_TEMPLATE_ID === 'TU_TEMPLATE_ID'
    ) {
      statusEl.textContent = '⚙️ Falta completar las claves de EmailJS en script.js para activar el envío.';
      statusEl.className   = 'form-status error';
      return;
    }

    /* Deshabilitar botón mientras envía */
    submitBtn.disabled   = true;
    submitBtn.textContent = 'Enviando...';
    statusEl.textContent = '';
    statusEl.className   = 'form-status';

    /* Nombre del cliente (saneado con textContent vía DOM) */
    const clientName = fields.name.input.value.trim();

    /*
     * Parámetros que irán al template de EmailJS.
     * Todos los valores de usuario se pasan SÓLO a través de los campos
     * del template de EmailJS (no se insertan en el DOM con innerHTML).
     */
    const templateParams = {
      from_name:      clientName,
      from_email:     fields.email.input.value.trim(),
      phone:          fields.phone.input.value.trim() || 'No indicado',
      people:         fields.people.input.value,
      message:        fields.message.input.value.trim(),
      /* Mensaje de confirmación que EmailJS enviará al cliente */
      reply_message:  `¡Hola! ${clientName}, tu mesa ha sido reservada correctamente.`,
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      /* Éxito */
      statusEl.textContent = `¡Hola! ${clientName}, tu mesa ha sido reservada correctamente. ¡Nos vemos en Serrano Café!`;
      statusEl.className   = 'form-status success';
      form.reset();
      messageCount.textContent = '0 / 500';
      Object.keys(fields).forEach((key) => setFieldError(key, ''));

    } catch (err) {
      /* Fallo de red o configuración */
      console.error('EmailJS error:', err);
      statusEl.textContent = 'Hubo un problema al enviar el mensaje. Por favor intentá de nuevo o llamanos al 097 681 172.';
      statusEl.className   = 'form-status error';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Enviar mensaje';
    }
  });
})();
