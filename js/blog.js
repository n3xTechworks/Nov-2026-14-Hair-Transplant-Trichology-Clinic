/* Hair Transplant & Trichology Clinic: blog filtering, search, and pagination.
   - Real category chip filtering ("All", "Transplant Science", "Trichology & PRP", "Aftercare & Recovery", "Hair Loss Prevention")
   - Real-time search by title, tag, category, author, and description
   - Real pagination (6 posts per page), active page pill, Prev/Next disabled states
*/
(function (global) {
  'use strict';

  var POSTS_PER_PAGE = 6;

  function norm(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/&amp;/g, '&')
      .replace(/\band\b/g, '&')
      .replace(/[^a-z0-9&]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function initBlog() {
    var blogGrid = document.querySelector('.blog-grid, #blogGrid, [data-blog-grid]');
    var cards = Array.from(document.querySelectorAll('.blog-card'));

    if (!cards.length) return;

    var filterTabsContainer = document.querySelector('.filter-tabs, #blogFilters, [data-blog-filters]');
    var filterButtons = Array.from(document.querySelectorAll('.filter-btn, [data-category-filter], [data-filter]'));
    var searchInput = document.querySelector('#blogSearch, [data-blog-search], input[name="blog-search"], .blog-search-input');
    var paginationContainer = document.querySelector('.pagination, #blogPagination, [data-blog-pagination]');

    var activeCategory = 'all';
    var searchQuery = '';
    var currentPage = 1;

    // Cache card metadata for instant searching and filtering
    var cardData = cards.map(function (card) {
      var titleEl = card.querySelector('.card-title, h2, h3, h4, a.post-title');
      var title = titleEl ? titleEl.textContent.trim() : '';

      var authorEl = card.querySelector('.author-name, .author');
      var author = authorEl ? authorEl.textContent.trim() : '';

      var badgeEl = card.querySelector('.badge, .card-badge, .card-category, .tag');
      var category = card.getAttribute('data-category') || (badgeEl ? badgeEl.textContent.trim() : '');

      var excerptEl = card.querySelector('.card-excerpt, p, .post-excerpt');
      var excerpt = excerptEl ? excerptEl.textContent.trim() : '';

      var allText = [title, author, category, excerpt].join(' ');

      return {
        element: card,
        title: title,
        author: author,
        category: category,
        normCategory: norm(category),
        normAllText: norm(allText)
      };
    });

    // Create or locate "No articles found" message
    var emptyMessage = document.querySelector('.blog-empty, #blogEmptyState, .no-results');
    if (!emptyMessage && blogGrid) {
      emptyMessage = document.createElement('div');
      emptyMessage.className = 'blog-empty no-results';
      emptyMessage.style.cssText =
        'grid-column: 1 / -1; text-align: center; padding: 48px 24px; background-color: var(--surface); border: 1px dashed var(--border); border-radius: var(--r-lg); display: none;';
      emptyMessage.innerHTML =
        '<p style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">No articles found</p>' +
        '<p style="color: var(--text-secondary); font-size: 0.925rem;">Try selecting a different topic or clearing your search term.</p>';
      blogGrid.appendChild(emptyMessage);
    }

    /* ---------- Filtering & Pagination Engine ---------- */

    function getFilteredCards() {
      var normCat = norm(activeCategory);
      var isAllCat = !normCat || normCat === 'all' || normCat === '*';
      var normQuery = norm(searchQuery);
      var queryTokens = normQuery ? normQuery.split(/\s+/).filter(Boolean) : [];

      return cardData.filter(function (item) {
        // Category check
        var matchesCategory = isAllCat;
        if (!matchesCategory) {
          // Exact match or contains category phrase
          matchesCategory =
            item.normCategory === normCat ||
            item.normCategory.indexOf(normCat) !== -1 ||
            normCat.indexOf(item.normCategory) !== -1;
        }
        if (!matchesCategory) return false;

        // Search tokens check (every token must be matched)
        if (!queryTokens.length) return true;
        return queryTokens.every(function (token) {
          return item.normAllText.indexOf(token) !== -1;
        });
      });
    }

    function renderPagination(totalPages) {
      if (!paginationContainer) return;

      if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        paginationContainer.style.display = 'none';
        return;
      }

      paginationContainer.style.display = 'flex';
      paginationContainer.innerHTML = '';

      // Previous button
      var prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'page-btn page-btn--prev';
      prevBtn.setAttribute('data-page', 'prev');
      prevBtn.setAttribute('aria-label', 'Previous page');
      prevBtn.innerHTML = '‹';
      if (currentPage === 1) {
        prevBtn.disabled = true;
        prevBtn.setAttribute('aria-disabled', 'true');
      } else {
        prevBtn.addEventListener('click', function () {
          goToPage(currentPage - 1);
        });
      }
      paginationContainer.appendChild(prevBtn);

      // Numbered page pills
      for (var p = 1; p <= totalPages; p++) {
        (function (pageNum) {
          var pageBtn = document.createElement('button');
          pageBtn.type = 'button';
          pageBtn.className = 'page-btn' + (pageNum === currentPage ? ' active' : '');
          pageBtn.setAttribute('data-page', String(pageNum));
          pageBtn.setAttribute('aria-label', 'Page ' + pageNum);
          if (pageNum === currentPage) {
            pageBtn.setAttribute('aria-current', 'page');
          }
          pageBtn.textContent = String(pageNum);

          pageBtn.addEventListener('click', function () {
            goToPage(pageNum);
          });
          paginationContainer.appendChild(pageBtn);
        })(p);
      }

      // Next button
      var nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'page-btn page-btn--next';
      nextBtn.setAttribute('data-page', 'next');
      nextBtn.setAttribute('aria-label', 'Next page');
      nextBtn.innerHTML = '›';
      if (currentPage === totalPages) {
        nextBtn.disabled = true;
        nextBtn.setAttribute('aria-disabled', 'true');
      } else {
        nextBtn.addEventListener('click', function () {
          goToPage(currentPage + 1);
        });
      }
      paginationContainer.appendChild(nextBtn);
    }

    function update() {
      var filtered = getFilteredCards();
      var totalItems = filtered.length;
      var totalPages = Math.max(1, Math.ceil(totalItems / POSTS_PER_PAGE));

      if (currentPage > totalPages) {
        currentPage = totalPages;
      }
      if (currentPage < 1) {
        currentPage = 1;
      }

      var startIndex = (currentPage - 1) * POSTS_PER_PAGE;
      var endIndex = startIndex + POSTS_PER_PAGE;
      var currentVisibleSlice = filtered.slice(startIndex, endIndex);

      var visibleSet = new Set(
        currentVisibleSlice.map(function (item) {
          return item.element;
        })
      );

      // Show/hide cards
      cards.forEach(function (card) {
        if (visibleSet.has(card)) {
          card.style.display = '';
          card.classList.remove('is-hidden');
          card.removeAttribute('aria-hidden');
        } else {
          card.style.display = 'none';
          card.classList.add('is-hidden');
          card.setAttribute('aria-hidden', 'true');
        }
      });

      // Show/hide empty state
      if (emptyMessage) {
        if (totalItems === 0) {
          emptyMessage.style.display = 'block';
        } else {
          emptyMessage.style.display = 'none';
        }
      }

      renderPagination(totalPages);
    }

    function goToPage(page) {
      currentPage = page;
      update();

      // Smooth scroll back to top of blog section if scrolled down
      if (blogGrid) {
        var rect = blogGrid.getBoundingClientRect();
        if (rect.top < 80) {
          blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    /* ---------- Event Listeners: Category Chips ---------- */

    function wireCategoryButtons() {
      filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var cat = btn.getAttribute('data-category') || btn.getAttribute('data-filter') || btn.textContent.trim();
          activeCategory = cat;
          currentPage = 1;

          filterButtons.forEach(function (b) {
            var isCurrent = b === btn;
            b.classList.toggle('active', isCurrent);
            b.classList.toggle('is-active', isCurrent);
            b.setAttribute('aria-pressed', String(isCurrent));
          });

          update();
        });
      });
    }

    wireCategoryButtons();

    /* ---------- Event Listeners: Search Input ---------- */

    if (searchInput) {
      var debounceTimer = null;
      searchInput.addEventListener('input', function () {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          searchQuery = searchInput.value || '';
          currentPage = 1;
          update();
        }, 120);
      });

      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && searchInput.value) {
          searchInput.value = '';
          searchQuery = '';
          currentPage = 1;
          update();
        }
      });
    }

    // Initial update
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlog);
  } else {
    initBlog();
  }

})(typeof window !== 'undefined' ? window : globalThis);
