
(() => {
  'use strict';
  const EMAILJS_PUBLIC_KEY   = 'YZii0wJ0kqvsGfjRz';    
  const EMAILJS_SERVICE_ID   = 'service_ot0550g';    
  const EMAILJS_TEMPLATE_ID  = 'template_wi2acyo';   
 

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

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
        if (t.length === 0) return '';           
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

  const messageInput = fields.message.input;
  const messageCount = document.getElementById('message-count');
  if (messageInput && messageCount) {
    messageInput.addEventListener('input', () => {
      messageCount.textContent = `${messageInput.value.length} / 500`;
    });
  }

  function setFieldError(key, message) {
    const { input, error } = fields[key];
    const row = input.closest('.form-row');
    error.textContent = message;         
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

  const statusEl  = document.getElementById('form-status');
  const submitBtn = form.querySelector('.form-submit');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    let valid = true;
    Object.keys(fields).forEach((key) => { if (!validateField(key)) valid = false; });

    if (!valid) {
      statusEl.textContent = 'Revisá los campos marcados antes de enviar.';
      statusEl.className   = 'form-status error';
      const firstError = form.querySelector('.form-row.error input, .form-row.error select, .form-row.error textarea');
      if (firstError) firstError.focus();
      return;
    }

    if (
      EMAILJS_PUBLIC_KEY  === 'YZii0wJ0kqvsGfjRz'  ||
      EMAILJS_SERVICE_ID  === 'service_ot0550g'  ||
      EMAILJS_TEMPLATE_ID === 'template_wi2acyo'
    ) {
      statusEl.textContent = '⚙️ Falta completar las claves de EmailJS en script.js para activar el envío.';
      statusEl.className   = 'form-status error';
      return;
    }

    submitBtn.disabled   = true;
    submitBtn.textContent = 'Enviando...';
    statusEl.textContent = '';
    statusEl.className   = 'form-status';

    const clientName = fields.name.input.value.trim();

  
    const templateParams = {
      from_name:      clientName,
      from_email:     fields.email.input.value.trim(),
      phone:          fields.phone.input.value.trim() || 'No indicado',
      people:         fields.people.input.value,
      message:        fields.message.input.value.trim(),
      reply_message:  `¡Hola! ${clientName}, tu mesa ha sido reservada correctamente.`,
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      statusEl.textContent = `¡Hola! ${clientName}, tu mesa ha sido reservada correctamente. ¡Nos vemos en Serrano Café!`;
      statusEl.className   = 'form-status success';
      form.reset();
      messageCount.textContent = '0 / 500';
      Object.keys(fields).forEach((key) => setFieldError(key, ''));

    } catch (err) {
      console.error('EmailJS error:', err);
      statusEl.textContent = 'Hubo un problema al enviar el mensaje. Por favor intentá de nuevo o llamanos al 097 681 172.';
      statusEl.className   = 'form-status error';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Enviar mensaje';
    }
  });
})();
