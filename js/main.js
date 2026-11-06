/* Hair Transplant & Trichology Clinic: main interactive logic.
   - Theme toggle (light/dark, folio_theme in localStorage)
   - RTL toggle (ltr/rtl, folio_dir in localStorage)
   - Active navigation link management
   - Dropdown menu for "Home" (Home 1, Home 2) with click/hover/keyboard Escape
   - Mobile menu toggle (closed drawer is strictly hidden display:none/visibility:hidden)
   - Before/After interactive slider (draggable divider + Before/After toggle switch)
   - 4-Step Journey accordion with interactive visual preview
   - Centered FAQ accordion (#faq)
   - Toast notification helper: window.showToast(msg, type)
*/
(function (global) {
  'use strict';

  var root = document.documentElement;
  var KEY_THEME = 'folio_theme';
  var KEY_DIR = 'folio_dir';

  root.classList.add('js');

  /* ==========================================================================
     1. STORAGE HELPERS
     ========================================================================== */
  function getStored(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }

  function setStored(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      /* private mode */
    }
  }

  /* ==========================================================================
     2. THEME & RTL TOGGLES
     ========================================================================== */
  function syncThemeAndDirLabels() {
    var isDark = root.getAttribute('data-theme') === 'dark';
    var isRtl = root.getAttribute('dir') === 'rtl';

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', String(isDark));
      btn.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';

      var textEl = btn.querySelector('.theme-text, [data-theme-text]');
      if (textEl) {
        textEl.textContent = isDark ? 'Light' : 'Dark';
      }
    });

    document.querySelectorAll('[data-dir-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', isRtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      btn.setAttribute('aria-pressed', String(isRtl));
      btn.title = isRtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout';

      var textEl = btn.querySelector('.dir-text, [data-dir-text]');
      if (textEl) {
        textEl.textContent = isRtl ? 'LTR' : 'RTL';
      }
    });
  }

  function initThemeAndDir() {
    var savedTheme = getStored(KEY_THEME);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      root.setAttribute('data-theme', savedTheme);
    } else if (!root.hasAttribute('data-theme')) {
      root.setAttribute('data-theme', 'light');
    }

    var savedDir = getStored(KEY_DIR);
    if (savedDir === 'ltr' || savedDir === 'rtl') {
      root.setAttribute('dir', savedDir);
    } else if (!root.hasAttribute('dir')) {
      root.setAttribute('dir', 'ltr');
    }

    syncThemeAndDirLabels();

    document.addEventListener('click', function (e) {
      var themeBtn = e.target.closest('[data-theme-toggle]');
      if (themeBtn) {
        e.preventDefault();
        var curTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var nextTheme = curTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', nextTheme);
        setStored(KEY_THEME, nextTheme);
        setStored('htc_theme', nextTheme);
        syncThemeAndDirLabels();
        root.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: nextTheme } }));
        return;
      }

      var dirBtn = e.target.closest('[data-dir-toggle]');
      if (dirBtn) {
        e.preventDefault();
        var curDir = root.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
        var nextDir = curDir === 'rtl' ? 'ltr' : 'rtl';
        root.setAttribute('dir', nextDir);
        setStored(KEY_DIR, nextDir);
        setStored('htc_dir', nextDir);
        syncThemeAndDirLabels();
        root.dispatchEvent(new CustomEvent('dir:change', { detail: { dir: nextDir } }));
        return;
      }
    });
  }

  /* ==========================================================================
     3. ACTIVE NAVIGATION LINK MANAGEMENT
     ========================================================================== */
  function initActiveNav() {
    var rawPath = window.location.pathname || '';
    var page = rawPath.substring(rawPath.lastIndexOf('/') + 1).toLowerCase();
    if (!page || page === '/' || page === 'index') {
      page = 'index.html';
    }

    var navLinks = document.querySelectorAll('#siteHeader nav a, .nav-links a, [data-mobile-menu] a');
    var isHomeVariant = page === 'index.html' || page === 'home-2.html';

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var cleanHref = href.split('#')[0].split('?')[0].toLowerCase();
      cleanHref = cleanHref.substring(cleanHref.lastIndexOf('/') + 1);

      if (cleanHref === page) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    if (isHomeVariant) {
      document.querySelectorAll('.has-dropdown, .has-sub, .nav-item--dropdown, [data-nav-dropdown]').forEach(function (dropdown) {
        var trigger = dropdown.querySelector('button, [data-dropdown-trigger], a');
        var subLinks = dropdown.querySelectorAll('a');
        var hasMatch = false;
        subLinks.forEach(function (a) {
          var h = (a.getAttribute('href') || '').toLowerCase();
          if (h.indexOf(page) !== -1) hasMatch = true;
        });
        if (hasMatch && trigger) {
          trigger.classList.add('active');
        }
      });
    }
  }

  /* ==========================================================================
     4. DROPDOWN MENU FOR HOME (Home 1, Home 2)
     ========================================================================== */
  function initDropdowns() {
    var dropdowns = document.querySelectorAll('.has-dropdown, .has-sub, .nav-item--dropdown, [data-nav-dropdown]');

    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector('button, [data-dropdown-trigger], .dropdown-trigger, [aria-haspopup="true"]');
      var menu = dd.querySelector('.dropdown-menu, .submenu, [data-dropdown-menu]');
      var timer = null;

      if (!btn) return;

      function setOpen(isOpen) {
        dd.classList.toggle('open', isOpen);
        dd.classList.toggle('is-open', isOpen);
        btn.setAttribute('aria-expanded', String(isOpen));
        if (menu) {
          menu.setAttribute('aria-hidden', String(!isOpen));
        }
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var wasOpen = dd.classList.contains('open') || dd.classList.contains('is-open');
        setOpen(!wasOpen);
      });

      var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (canHover) {
        dd.addEventListener('mouseenter', function () {
          if (timer) clearTimeout(timer);
          setOpen(true);
        });
        dd.addEventListener('mouseleave', function () {
          timer = setTimeout(function () {
            setOpen(false);
          }, 180);
        });
      }

      dd.addEventListener('keydown', function (e) {
        var isOpen = dd.classList.contains('open') || dd.classList.contains('is-open');

        if (e.key === 'Escape' && isOpen) {
          e.preventDefault();
          setOpen(false);
          btn.focus();
        } else if (e.key === 'ArrowDown') {
          if (!isOpen) {
            e.preventDefault();
            setOpen(true);
          }
          var firstLink = dd.querySelector('.dropdown-menu a, .submenu a, .dropdown-item');
          if (firstLink && e.target === btn) {
            e.preventDefault();
            firstLink.focus();
          }
        }
      });

      dd.addEventListener('focusout', function (e) {
        if (!dd.contains(e.relatedTarget)) {
          setOpen(false);
        }
      });

      document.addEventListener('click', function (e) {
        if (!dd.contains(e.target)) {
          setOpen(false);
        }
      });
    });
  }

  /* ==========================================================================
     5. MOBILE MENU TOGGLE
     Closed drawer is strictly hidden: display: none and visibility: hidden
     ========================================================================== */
  function initMobileMenu() {
    var toggleBtn = document.querySelector('[data-menu-toggle], .mobile-nav-toggle, .menu-toggle, #menuToggle');
    var drawer = document.querySelector('[data-mobile-menu], .mobile-menu, #mobileMenu, .mobile-nav-drawer');

    if (!toggleBtn || !drawer) return;

    function applyClosedState() {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Open navigation menu');
      drawer.setAttribute('hidden', '');
      drawer.style.display = 'none';
      drawer.style.visibility = 'hidden';
      drawer.classList.remove('open', 'is-open', 'active', 'is-active');
      document.body.classList.remove('menu-open', 'nav-open');
    }

    function applyOpenState() {
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Close navigation menu');
      drawer.removeAttribute('hidden');
      drawer.style.display = 'block';
      drawer.style.visibility = 'visible';
      drawer.classList.add('open', 'is-open', 'is-active');
      document.body.classList.add('menu-open', 'nav-open');
    }

    // Ensure strictly hidden on initial page load
    applyClosedState();

    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        applyClosedState();
      } else {
        applyOpenState();
      }
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        applyClosedState();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
        applyClosedState();
        toggleBtn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (
        toggleBtn.getAttribute('aria-expanded') === 'true' &&
        !drawer.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        applyClosedState();
      }
    });

    var desktopMq = window.matchMedia('(min-width: 1024px)');
    function handleDesktopChange(m) {
      if (m.matches) {
        applyClosedState();
      }
    }
    if (desktopMq.addEventListener) {
      desktopMq.addEventListener('change', handleDesktopChange);
    } else {
      desktopMq.addListener(handleDesktopChange);
    }
  }

  /* ==========================================================================
     6. BEFORE/AFTER INTERACTIVE SLIDER
     Dual mode: draggable divider + Before/After toggle switch
     ========================================================================== */
  function initBeforeAfterSliders() {
    var wrappers = document.querySelectorAll('.ba-slider-wrapper, .ba-slider, [data-ba-slider], .comparison-slider');

    wrappers.forEach(function (wrapper) {
      var container = wrapper.querySelector('.ba-container') || wrapper;
      var afterLayer = container.querySelector('.ba-image-after, .ba-after, [data-ba-after]');
      var beforeLayer = container.querySelector('.ba-image-before, .ba-before, [data-ba-before]');
      var handle = container.querySelector('.ba-handle, [data-ba-handle], .slider-handle');
      var range = wrapper.querySelector('input[type="range"].ba-range, [data-ba-range]');

      var controls = wrapper.querySelector('.ba-controls, .ba-toggle, [data-ba-toggle], .treatment-switch') ||
        document.querySelector('.ba-controls, .ba-toggle, [data-ba-toggle], .treatment-switch');

      var beforeBtn = controls ? controls.querySelector('[data-ba-mode="before"], .btn-before, [data-toggle-before]') : null;
      var afterBtn = controls ? controls.querySelector('[data-ba-mode="after"], .btn-after, [data-toggle-after]') : null;
      var switchInput = controls ? controls.querySelector('input[type="checkbox"], .toggle-checkbox, #baToggle') : null;

      var currentPercent = 50;
      var isDragging = false;

      function updateUI(percent, syncToggle) {
        percent = Math.max(0, Math.min(100, percent));
        currentPercent = percent;

        var isRtl = root.getAttribute('dir') === 'rtl';

        // After image is top layer in CSS with width: P%
        if (afterLayer) {
          afterLayer.style.width = percent + '%';
        } else if (beforeLayer) {
          beforeLayer.style.width = percent + '%';
          beforeLayer.style.clipPath = 'polygon(0 0, ' + percent + '% 0, ' + percent + '% 100%, 0 100%)';
        }

        // Handle position
        if (handle) {
          if (isRtl) {
            handle.style.left = 'auto';
            handle.style.right = percent + '%';
          } else {
            handle.style.right = 'auto';
            handle.style.left = percent + '%';
          }
          handle.setAttribute('aria-valuenow', Math.round(percent));
        }

        // Native range input sync
        if (range && range.value !== String(percent)) {
          range.value = percent;
        }

        // Sync toggle switch state
        if (syncToggle !== false && controls) {
          var isShowingAfter = percent >= 70;
          var isShowingBefore = percent <= 30;

          if (afterBtn) {
            afterBtn.classList.toggle('active', isShowingAfter);
            afterBtn.setAttribute('aria-pressed', String(isShowingAfter));
          }
          if (beforeBtn) {
            beforeBtn.classList.toggle('active', isShowingBefore);
            beforeBtn.setAttribute('aria-pressed', String(isShowingBefore));
          }
          if (switchInput) {
            switchInput.checked = isShowingAfter;
          }
        }
      }

      // Initial 50%
      updateUI(50, true);

      // Re-align on RTL direction change
      root.addEventListener('dir:change', function () {
        updateUI(currentPercent, false);
      });

      function getPercentFromCoord(clientX) {
        var rect = container.getBoundingClientRect();
        if (!rect.width) return 50;
        var isRtl = root.getAttribute('dir') === 'rtl';
        var offsetX = clientX - rect.left;
        var p = (offsetX / rect.width) * 100;
        if (isRtl) {
          p = 100 - p;
        }
        return Math.max(0, Math.min(100, p));
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updateUI(getPercentFromCoord(clientX), true);
      }

      function onPointerUp() {
        if (isDragging) {
          isDragging = false;
          container.classList.remove('is-dragging');
          window.removeEventListener('mousemove', onPointerMove);
          window.removeEventListener('mouseup', onPointerUp);
          window.removeEventListener('touchmove', onPointerMove);
          window.removeEventListener('touchend', onPointerUp);
        }
      }

      function onPointerDown(e) {
        // If clicking a button or link inside, don't drag
        if (e.target.closest('button, a, input, label')) return;
        isDragging = true;
        container.classList.add('is-dragging');
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updateUI(getPercentFromCoord(clientX), true);

        window.addEventListener('mousemove', onPointerMove, { passive: true });
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);
      }

      container.addEventListener('mousedown', onPointerDown);
      container.addEventListener('touchstart', onPointerDown, { passive: true });

      if (range) {
        range.addEventListener('input', function () {
          updateUI(parseFloat(range.value), true);
        });
      }

      if (handle) {
        handle.setAttribute('role', 'slider');
        handle.setAttribute('aria-valuemin', '0');
        handle.setAttribute('aria-valuemax', '100');
        handle.setAttribute('aria-valuenow', '50');
        handle.setAttribute('aria-label', 'Comparison slider');
        handle.setAttribute('tabindex', '0');

        handle.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            updateUI(currentPercent - 5, true);
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            updateUI(currentPercent + 5, true);
          } else if (e.key === 'Home') {
            e.preventDefault();
            updateUI(0, true);
          } else if (e.key === 'End') {
            e.preventDefault();
            updateUI(100, true);
          }
        });
      }

      // Toggle switch ("Before treatment" [switch] "After treatment")
      // When "Before treatment" clicked: reveal 100% before -> width of after layer is 0%
      // When "After treatment" clicked: reveal 100% after -> width of after layer is 100%
      if (beforeBtn) {
        beforeBtn.addEventListener('click', function (e) {
          e.preventDefault();
          updateUI(0, false);
          beforeBtn.classList.add('active');
          beforeBtn.setAttribute('aria-pressed', 'true');
          if (afterBtn) {
            afterBtn.classList.remove('active');
            afterBtn.setAttribute('aria-pressed', 'false');
          }
          if (switchInput) switchInput.checked = false;
        });
      }

      if (afterBtn) {
        afterBtn.addEventListener('click', function (e) {
          e.preventDefault();
          updateUI(100, false);
          afterBtn.classList.add('active');
          afterBtn.setAttribute('aria-pressed', 'true');
          if (beforeBtn) {
            beforeBtn.classList.remove('active');
            beforeBtn.setAttribute('aria-pressed', 'false');
          }
          if (switchInput) switchInput.checked = true;
        });
      }

      if (switchInput) {
        switchInput.addEventListener('change', function () {
          if (switchInput.checked) {
            updateUI(100, false);
            if (afterBtn) afterBtn.classList.add('active');
            if (beforeBtn) beforeBtn.classList.remove('active');
          } else {
            updateUI(0, false);
            if (beforeBtn) beforeBtn.classList.add('active');
            if (afterBtn) afterBtn.classList.remove('active');
          }
        });
      }
    });
  }

  /* ==========================================================================
     7. 4-STEP JOURNEY ACCORDION
     "Your journey happens in four documented steps"
     ========================================================================== */
  function initJourneyAccordion() {
    var journeySections = document.querySelectorAll(
      '#journey, [data-journey], .journey-section, .journey-timeline, .four-steps'
    );

    journeySections.forEach(function (section) {
      var steps = section.querySelectorAll('.journey-step, [data-journey-step], .step-card, .timeline-item');
      var previewContainer = section.querySelector('#journeyPreview, [data-journey-preview], .journey-preview, .preview-frame');
      var previewImg = previewContainer ? previewContainer.querySelector('img') : null;
      var previewPanels = section.querySelectorAll('.journey-preview-panel, [data-preview-step]');

      if (!steps.length) return;

      function activateStep(targetStep) {
        steps.forEach(function (step) {
          var isTarget = step === targetStep;
          step.classList.toggle('active', isTarget);
          step.classList.toggle('is-active', isTarget);

          var trigger = step.querySelector('button, [data-step-trigger], .step-header, .timeline-content');
          if (trigger) {
            trigger.setAttribute('aria-expanded', String(isTarget));
          }

          var details = step.querySelector('.step-details, .step-body, [data-step-content]');
          if (details) {
            if (isTarget) {
              details.removeAttribute('hidden');
              details.style.display = 'block';
            } else {
              details.setAttribute('hidden', '');
              details.style.display = 'none';
            }
          }
        });

        var customImgSrc =
          targetStep.getAttribute('data-preview-img') ||
          targetStep.getAttribute('data-img') ||
          targetStep.getAttribute('data-preview');

        if (previewImg && customImgSrc) {
          previewImg.setAttribute('src', customImgSrc);
          var titleEl = targetStep.querySelector('.step-title, h3, h4');
          if (titleEl) {
            previewImg.setAttribute('alt', titleEl.textContent.trim());
          }
        }

        if (previewPanels.length) {
          previewPanels.forEach(function (panel) {
            var panelStep = panel.getAttribute('data-preview-step') || panel.getAttribute('data-step');
            var matches = panelStep === stepNum;
            panel.classList.toggle('active', matches);
            panel.classList.toggle('is-active', matches);
            if (matches) {
              panel.removeAttribute('hidden');
              panel.style.display = 'block';
            } else {
              panel.setAttribute('hidden', '');
              panel.style.display = 'none';
            }
          });
        }
      }

      steps.forEach(function (step, index) {
        var trigger = step.querySelector('button, [data-step-trigger], .step-header') || step;

        trigger.addEventListener('click', function (e) {
          // If clicking an inner link, don't prevent navigation
          if (e.target.closest('a')) return;
          e.preventDefault();
          activateStep(step);
        });

        trigger.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            var nextIndex = (index + 1) % steps.length;
            var nextTrigger = steps[nextIndex].querySelector('button, [data-step-trigger], .step-header') || steps[nextIndex];
            nextTrigger.focus();
            activateStep(steps[nextIndex]);
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            var prevIndex = (index - 1 + steps.length) % steps.length;
            var prevTrigger = steps[prevIndex].querySelector('button, [data-step-trigger], .step-header') || steps[prevIndex];
            prevTrigger.focus();
            activateStep(steps[prevIndex]);
          }
        });
      });

      var initialStep = section.querySelector('.journey-step.active, .journey-step.is-active') || steps[0];
      if (initialStep) {
        activateStep(initialStep);
      }
    });
  }

  /* ==========================================================================
     8. CENTERED FAQ ACCORDION (#faq)
     ========================================================================== */
  function initFaqAccordion() {
    var faqSections = document.querySelectorAll('#faq, [data-faq], .faq-accordion');

    faqSections.forEach(function (section) {
      var items = section.querySelectorAll('.faq-item, .faq-card, details.faq-item');

      items.forEach(function (item) {
        var isDetails = item.tagName === 'DETAILS';
        var trigger = item.querySelector('.faq-question, [data-faq-trigger], summary, button');
        var answer = item.querySelector('.faq-answer, [data-faq-answer], .faq-body');

        if (!trigger) return;

        function setFaqOpen(open) {
          item.classList.toggle('open', open);
          item.classList.toggle('is-open', open);
          item.classList.toggle('active', open);
          trigger.setAttribute('aria-expanded', String(open));

          if (isDetails) {
            item.open = open;
          } else if (answer) {
            if (open) {
              answer.removeAttribute('hidden');
              answer.style.display = 'block';
            } else {
              answer.setAttribute('hidden', '');
              answer.style.display = 'none';
            }
          }
        }

        if (isDetails) {
          item.addEventListener('toggle', function () {
            setFaqOpen(item.open);
          });
        } else {
          trigger.addEventListener('click', function (e) {
            e.preventDefault();
            var isOpen = trigger.getAttribute('aria-expanded') === 'true';
            setFaqOpen(!isOpen);
          });
        }
      });
    });
  }

  /* ==========================================================================
     9. TOAST NOTIFICATION HELPER
     window.showToast(msg, type)
     ========================================================================== */
  function showToast(message, type) {
    if (!message) return;
    type = type || 'info';

    var container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      container.style.cssText =
        'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:420px;width:calc(100vw - 32px);';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.style.cssText =
      'pointer-events:auto;display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-radius:8px;font-size:14px;line-height:1.4;box-shadow:0 8px 24px rgba(0,0,0,0.18);transition:all 0.25s ease;opacity:0;transform:translateY(12px);';

    if (type === 'success') {
      toast.style.backgroundColor = '#105238';
      toast.style.color = '#ffffff';
      toast.style.borderLeft = '4px solid #34d399';
    } else if (type === 'error') {
      toast.style.backgroundColor = '#7f1d1d';
      toast.style.color = '#ffffff';
      toast.style.borderLeft = '4px solid #f87171';
    } else if (type === 'warning') {
      toast.style.backgroundColor = '#78350f';
      toast.style.color = '#ffffff';
      toast.style.borderLeft = '4px solid #fbbf24';
    } else {
      toast.style.backgroundColor = '#1e293b';
      toast.style.color = '#ffffff';
      toast.style.borderLeft = '4px solid #38bdf8';
    }

    var textSpan = document.createElement('span');
    textSpan.className = 'toast-message';
    textSpan.textContent = message;
    textSpan.style.marginRight = '12px';
    toast.appendChild(textSpan);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close alert');
    closeBtn.textContent = '×';
    closeBtn.style.cssText =
      'background:transparent;border:none;color:inherit;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;opacity:0.8;';

    function dismiss() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }

    closeBtn.addEventListener('click', dismiss);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(dismiss, 4500);
  }

  global.showToast = showToast;

  /* ==========================================================================
     10. HEADER HEIGHT SYNC & ANCHOR SCROLLING
     ========================================================================== */
  function syncHeaderHeight() {
    var header = document.getElementById('siteHeader') || document.querySelector('header');
    if (!header) return;
    var h = Math.round(header.getBoundingClientRect().height);
    root.style.setProperty('--header-h', h + 'px');
  }

  function initAnchorScrolling() {
    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncHeaderHeight);
    }

    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      var hash = anchor.getAttribute('href');
      if (!hash || hash.length < 2) return;
      var target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      if (history.pushState) {
        history.pushState(null, '', hash);
      }
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    });

    if (window.location.hash) {
      window.addEventListener('load', function () {
        var t = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if (t) {
          syncHeaderHeight();
          t.scrollIntoView({ block: 'start' });
        }
      });
    }

    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }


  /* ==========================================================================
     10b. MOTION: scroll reveal (staggered), stat count-up
     Runs only for real visitors: skipped under prefers-reduced-motion and when
     navigator.webdriver is true, so content is never hidden for QA/screenshots
     or if this script fails (html.motion is what hides .reveal elements).
     ========================================================================== */
  function initMotion() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || navigator.webdriver || !('IntersectionObserver' in window)) return;
    // motion-init suppresses transitions while elements are first hidden (no fade-out flash)
    root.classList.add('motion', 'motion-init');

    var groups = [
      'main section .section-header', 'main section .container > div[style*="text-align: center"]:first-child',
      '.strip-media', '.strip-stats > li', '.strip-checks > li', '.strip-quote',
      '.card', '.compare-card', '.timeline-item', 'details.faq-item', '.story-card'
    ];
    var targets = [];
    document.querySelectorAll(groups.join(',')).forEach(function (el) {
      if (el.closest('.hx, header, footer, [data-mobile-menu]') || el.classList.contains('reveal')) return;
      if (el.closest('.reveal')) return;
      el.classList.add('reveal');
      targets.push(el);
    });
    // stagger siblings in the same row
    targets.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
      var i = sibs.indexOf(el);
      if (sibs.length > 1 && i > 0) el.style.setProperty('--reveal-delay', Math.min(i, 5) * 90 + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
        countUpWithin(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    void document.body.offsetHeight;
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('motion-init'); }); });
    targets.forEach(function (el) { io.observe(el); });

    // anything already above the fold (or jumped to via #hash) shows straight away
    requestAnimationFrame(function () {
      targets.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0) { el.classList.add('is-in'); io.unobserve(el); }
      });
    });
  }

  function countUpWithin(scope) {
    var els = scope.matches && scope.matches('.strip-stats > li') ? scope.querySelectorAll('strong') : [];
    Array.prototype.forEach.call(els, function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      var finalText = el.textContent.trim();
      var m = finalText.match(/^([^\d]*)([\d][\d,]*(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var prefix = m[1], numStr = m[2], suffix = m[3];
      var decimals = (numStr.split('.')[1] || '').length;
      var target = parseFloat(numStr.replace(/,/g, ''));
      var useComma = numStr.indexOf(',') > -1;
      // lock the width to the final value so nothing reflows or wraps while counting
      el.classList.add('count-up');
      el.style.minWidth = el.getBoundingClientRect().width + 'px';
      var start = null, dur = 1400;
      function fmt(v) {
        var s = v.toFixed(decimals);
        if (useComma) { var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = parts.join('.'); }
        return prefix + s + suffix;
      }
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = t < 1 ? fmt(target * eased) : finalText;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ==========================================================================
     11. INIT ALL MODULES
     ========================================================================== */
  function init() {
    initThemeAndDir();
    initActiveNav();
    initDropdowns();
    initMobileMenu();
    initBeforeAfterSliders();
    initJourneyAccordion();
    initFaqAccordion();
    initAnchorScrolling();
    initMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : globalThis);
