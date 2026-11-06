/* Hair Transplant & Trichology Clinic: reusable form validation.
   Browser: forms matching form[data-validate] are automatically wired.
   Node:    const v = require('./js/validation.js');
*/
(function (global) {
  'use strict';

  var MSG = {
    required: 'Please fill in this field.',
    requiredCheck: 'Please tick this box to continue.',
    requiredSelect: 'Please choose an option.',
    nameShort: 'Please enter at least 2 letters.',
    nameDigits: 'Names cannot contain numbers.',
    nameChars: "Please use letters, spaces, hyphens ( - ), apostrophes ( ' ) or full stops only.",
    nameLong: 'Please keep the name under 80 characters.',
    email: 'Please enter a full email address, like name@example.com.',
    phoneChars: 'Please use digits only (spaces and a leading + are fine).',
    phoneLength: 'Please enter a phone number with 7 to 15 digits.',
    date: 'Please choose a valid date.',
    datePast: 'Please choose today or a date in the future.'
  };

  function str(v) { return v == null ? '' : String(v).trim(); }

  /* ---------- Pure Validators ---------- */

  function validateRequired(value) {
    return str(value) ? '' : MSG.required;
  }

  function validateName(value) {
    var v = str(value);
    if (!v) return MSG.required;
    if (/\d/.test(v)) return MSG.nameDigits;
    if (!/^[\p{L}\p{M}' .\-’]+$/u.test(v)) return MSG.nameChars;
    var letters = v.match(/\p{L}/gu) || [];
    if (letters.length < 2) return MSG.nameShort;
    if (!/^\p{L}/u.test(v)) return MSG.nameChars;
    if (v.length > 80) return MSG.nameLong;
    return '';
  }

  var EMAIL_RE = /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+'-]+(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
  function validateEmail(value) {
    var v = str(value);
    if (!v) return MSG.required;
    if (v.length > 254 || !EMAIL_RE.test(v)) return MSG.email;
    return '';
  }

  function validatePhone(value) {
    var v = str(value);
    if (!v) return MSG.required;
    if (/[a-zA-Z]/.test(v)) return MSG.phoneChars;
    if (!/^\+?[\d ]+$/.test(v)) return MSG.phoneChars;
    var digits = v.replace(/\D/g, '').length;
    if (digits < 7 || digits > 15) return MSG.phoneLength;
    return '';
  }

  function toISODate(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function validateFutureDate(value, today) {
    var v = str(value);
    if (!v) return MSG.required;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return MSG.date;
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return MSG.date;
    if (v < toISODate(today || new Date())) return MSG.datePast;
    return '';
  }

  var validateDate = validateFutureDate;

  var RULES = {
    required: validateRequired,
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    date: validateFutureDate,
    'future-date': validateFutureDate
  };

  /* ---------- Field-level rule inference ---------- */

  function rulesFor(field) {
    var explicit = field.getAttribute && field.getAttribute('data-rule');
    if (explicit) return explicit.split(/\s+/).filter(Boolean);
    var name = (field.name || '').toLowerCase();
    var type = (field.type || '').toLowerCase();
    if (type === 'email' || name === 'email') return ['email'];
    if (type === 'tel' || name === 'phone' || /(^|[-_])phone$/.test(name)) return ['phone'];
    if (type === 'date' || name === 'date' || /(^|[-_])date$/.test(name) || name === 'visit') return ['future-date'];
    if (name === 'name' || /(^|[-_])(first|last|full)?name$/.test(name)) return ['name'];
    return [];
  }

  function validateField(field) {
    var type = (field.type || '').toLowerCase();
    var required = !!field.required;
    if (type === 'checkbox') return required && !field.checked ? MSG.requiredCheck : '';
    var value = str(field.value);
    if (!value) {
      if (!required) return '';
      return field.tagName === 'SELECT' ? MSG.requiredSelect : MSG.required;
    }
    var rules = rulesFor(field);
    for (var i = 0; i < rules.length; i++) {
      var fn = RULES[rules[i]];
      if (!fn) continue;
      var msg = fn(value);
      if (msg) return msg;
    }
    return '';
  }

  var api = {
    MESSAGES: MSG,
    validateRequired: validateRequired,
    validateName: validateName,
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    validateDate: validateDate,
    validateFutureDate: validateFutureDate,
    validateField: validateField,
    rulesFor: rulesFor,
    toISODate: toISODate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (typeof document === 'undefined') return;
  global.ClinicValidation = api;

  /* ---------- Browser DOM wiring ---------- */

  var uid = 0;
  function getErrorEl(field) {
    if (!field.id) field.id = 'fld-' + (field.name || 'field') + '-' + (++uid);
    var id = field.id + '-error';
    var el = document.getElementById(id);
    var wrap = field.closest('.form-group, .field, .input-group, .form-row, .check-field') || field.parentNode;
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-error field-error';
      el.id = id;
      el.setAttribute('role', 'alert');
      el.setAttribute('aria-live', 'polite');
      wrap.appendChild(el);
    }
    var ids = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (ids.indexOf(id) === -1) {
      ids.push(id);
      field.setAttribute('aria-describedby', ids.join(' '));
    }
    return { el: el, wrap: wrap };
  }

  function updateFieldUI(field, msg) {
    var info = getErrorEl(field);
    info.el.textContent = msg || '';
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('has-error');
      field.classList.remove('is-valid');
      if (info.wrap) info.wrap.classList.add('has-error');
      info.el.style.display = 'block';
    } else {
      field.setAttribute('aria-invalid', 'false');
      field.classList.remove('has-error');
      field.classList.add('is-valid');
      if (info.wrap) info.wrap.classList.remove('has-error');
      info.el.style.display = 'none';
    }
    return !msg;
  }

  function formFields(form) {
    return Array.prototype.filter.call(form.elements, function (el) {
      return el.name && !el.disabled && /^(INPUT|SELECT|TEXTAREA)$/i.test(el.tagName) && !/^(submit|button|hidden|reset|image)$/i.test(el.type);
    });
  }

  function wireForm(form) {
    var submitted = false;
    var successBox = form.querySelector('[data-form-success], .form-success');
    var today = toISODate(new Date());

    form.querySelectorAll('input[type="date"]').forEach(function (d) {
      if (!d.min) d.min = today;
    });

    var fields = formFields(form);

    fields.forEach(function (f) {
      // Auto lowercase email on input and blur
      var isEmail = f.type === 'email' || (f.name || '').toLowerCase() === 'email';

      function handleEmailNormalize() {
        if (isEmail && f.value) {
          f.value = f.value.toLowerCase();
        }
      }

      f.addEventListener('blur', function () {
        handleEmailNormalize();
        if (submitted || str(f.value)) {
          updateFieldUI(f, validateField(f));
        }
      });

      var changeEvent = (f.type === 'checkbox' || f.tagName === 'SELECT') ? 'change' : 'input';
      f.addEventListener(changeEvent, function () {
        handleEmailNormalize();
        if (f.getAttribute('aria-invalid') === 'true') {
          updateFieldUI(f, validateField(f));
        }
        if (successBox && !successBox.hidden) {
          successBox.hidden = true;
          successBox.style.display = 'none';
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitted = true;
      var firstInvalid = null;

      fields.forEach(function (f) {
        if (f.type === 'email' || (f.name || '').toLowerCase() === 'email') {
          if (f.value) f.value = f.value.toLowerCase();
        }
        var msg = validateField(f);
        var isValid = updateFieldUI(f, msg);
        if (!isValid && !firstInvalid) {
          firstInvalid = f;
        }
      });

      if (firstInvalid) {
        if (successBox) {
          successBox.hidden = true;
          successBox.style.display = 'none';
        }
        firstInvalid.focus();
        return;
      }

      // Valid form submission
      var successMessage = form.getAttribute('data-success-message') ||
        'Thank you! Your consultation request has been received. Our clinical trichology team will be in touch shortly.';

      if (successBox) {
        var textEl = successBox.querySelector('[data-success-text], .success-text');
        if (textEl) textEl.textContent = successMessage;
        successBox.hidden = false;
        successBox.style.display = 'block';
      }

      if (typeof global.showToast === 'function') {
        global.showToast(successMessage, 'success');
      }

      form.dispatchEvent(new CustomEvent('form:success', {
        bubbles: true,
        detail: { form: form }
      }));

      form.reset();
      submitted = false;

      fields.forEach(function (f) {
        f.setAttribute('aria-invalid', 'false');
        f.classList.remove('has-error', 'is-valid');
        var err = getErrorEl(f);
        if (err.wrap) err.wrap.classList.remove('has-error');
        err.el.textContent = '';
        err.el.style.display = 'none';
      });
    });
  }

  function init() {
    document.querySelectorAll('form[data-validate]').forEach(wireForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : globalThis);
