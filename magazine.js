/* =====================================================
   TREEOAK KITCHEN — MAGAZINE JAVASCRIPT (ENHANCED)
   2-page spread on ALL devices + real book feel
   ===================================================== */

(function () {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {

    const bookEl = document.getElementById('flipBook');
    if (!bookEl || !window.St || !window.St.PageFlip) {
      console.error('StPageFlip or #flipBook not found');
      return;
    }

    // ---- Detect mobile ----
    function isMobile() {
      return window.innerWidth < 768;
    }

    // ---- Compute book dimensions ----
    function computeDims() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = isMobile();

      // A5 ratio: 210/148 (height/width for portrait)
      const A5ratio = 210 / 148;

      if (mobile) {
        // Mobile: SINGLE PAGE portrait mode — fill the screen like the reference
        // Reserve: toolbar 54px bottom, top-bar 44px, small side padding for arrows 30px each
        const arrowW = 30;
        const topPad = 44;
        const toolbarH = 54;
        const availW = vw - arrowW * 2 - 4; // small gap
        const availH = vh - topPad - toolbarH - 4;

        let pageW = availW;
        let pageH = Math.round(pageW * A5ratio);

        if (pageH > availH) {
          pageH = availH;
          pageW = Math.round(pageH / A5ratio);
        }

        return { pageW, pageH, usePortrait: true }; // portrait = single page
      } else {
        // Desktop: generous 2-page spread
        const stageW = vw - 140;
        const stageH = vh - 110;
        let pageH = stageH;
        let pageW = Math.round(pageH / A5ratio);
        if (pageW * 2 > stageW) {
          pageW = Math.floor(stageW / 2) - 3;
          pageH = Math.round(pageW * A5ratio);
        }
        return { pageW, pageH, usePortrait: false };
      }
    }

    let dims = computeDims();
    const pages = Array.from(bookEl.querySelectorAll('.page'));

    // ---- Init PageFlip with enhanced book effects ----
    const pageFlip = new St.PageFlip(bookEl, {
      width: dims.pageW,
      height: dims.pageH,
      size: 'fixed',
      startPage: 0,
      drawShadow: true,
      flippingTime: 900,        // slightly slower for weight
      usePortrait: dims.usePortrait,
      startZIndex: 0,
      autoSize: false,
      maxShadowOpacity: 0.65,   // deeper shadows
      showCover: true,
      mobileScrollSupport: false,
      swipeDistance: 30,
      clickEventForward: true,
      useMouseEvents: true,
      showPageCorners: true,
      disableFlipByClick: false,
      // Enhanced 3D perspective
      perspective: 2500
    });

    pageFlip.loadFromHTML(pages);

    // ---- Force book to center in its stage ----
    function centerBook() {
      const stfParentEl = bookEl.querySelector('.stf__parent') || bookEl;
      if (stfParentEl) {
        stfParentEl.style.margin = '0 auto';
        stfParentEl.style.display = 'block';
      }
      // Also ensure the bookEl itself is centered
      bookEl.style.margin = '0 auto';
    }
    // Run after a short delay so StPageFlip has laid out
    setTimeout(centerBook, 100);
    const stfParent = bookEl.querySelector('.stf__parent') || bookEl;
    if (stfParent) {
      stfParent.style.filter = 'drop-shadow(0 20px 60px rgba(0,0,0,0.45))';
      stfParent.style.transition = 'filter 0.3s ease';
    }

    // ---- Touch swipe support with improved gesture ----
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;
    const SWIPE_THRESHOLD = 35;
    const SWIPE_MAX_VERTICAL = 100;

    function setupTouchSwipe(el) {
      if (!el) return;
      
      el.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
      }, { passive: true });

      el.addEventListener('touchmove', function(e) {
        touchMoved = true;
      }, { passive: true });

      el.addEventListener('touchend', function(e) {
        if (!touchMoved) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        if (Math.abs(dy) > SWIPE_MAX_VERTICAL) return;
        if (dx < 0) {
          pageFlip.flipNext();
        } else {
          pageFlip.flipPrev();
        }
      }, { passive: true });
    }

    setupTouchSwipe(bookEl);
    const stageEl = document.getElementById('bookStage');
    if (stageEl) setupTouchSwipe(stageEl);

    // ---- Page number display ----
    const tbPageNum = document.getElementById('tbPageNum');
    const TOTAL = pages.length;

    function updatePageNum(idx) {
      if (!tbPageNum) return;
      // Always show spread (landscape mode)
      if (idx === 0) {
        tbPageNum.textContent = '1 / ' + TOTAL;
      } else if (idx >= TOTAL - 1) {
        tbPageNum.textContent = TOTAL + ' / ' + TOTAL;
      } else {
        tbPageNum.textContent = (idx + 1) + '-' + (idx + 2) + ' / ' + TOTAL;
      }
    }

    pageFlip.on('flip', function (e) {
      updatePageNum(e.data);
      updateArrows(e.data);
      updateThumbs(e.data);
      enhanceShadow();
    });

    pageFlip.on('init', function (e) {
      updatePageNum(e.data.page);
      updateArrows(e.data.page);
      enhanceShadow();
    });

    // ---- Enhanced shadow during animation ----
    function enhanceShadow() {
      if (stfParent) {
        stfParent.style.filter = 'drop-shadow(0 24px 70px rgba(0,0,0,0.5))';
      }
    }

    // ---- Arrow buttons ----
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const tbFirst = document.getElementById('tbFirst');
    const tbPrev  = document.getElementById('tbPrev');
    const tbNext  = document.getElementById('tbNext');
    const tbLast  = document.getElementById('tbLast');

    function updateArrows(idx) {
      if (prevBtn) {
        const atStart = idx <= 0;
        prevBtn.style.opacity = atStart ? '0.2' : '1';
        prevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
      }
      if (nextBtn) {
        const atEnd = idx >= TOTAL - 1;
        nextBtn.style.opacity = atEnd ? '0.2' : '1';
        nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { pageFlip.flipPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { pageFlip.flipNext(); });
    if (tbFirst) tbFirst.addEventListener('click', function () { pageFlip.flip(0); });
    if (tbPrev)  tbPrev.addEventListener('click',  function () { pageFlip.flipPrev(); });
    if (tbNext)  tbNext.addEventListener('click',  function () { pageFlip.flipNext(); });
    if (tbLast)  tbLast.addEventListener('click',  function () { pageFlip.flip(TOTAL - 1); });

    // ---- Keyboard ----
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') pageFlip.flipNext();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp'   || e.key === 'PageUp')   pageFlip.flipPrev();
    });

    // ---- Thumbnails ----
    const thumbOverlay  = document.getElementById('thumbOverlay');
    const thumbGrid     = document.getElementById('thumbGrid');
    const thumbCloseBtn = document.getElementById('thumbCloseBtn');
    const gridBtn       = document.getElementById('gridBtn');

    const thumbEmojis = ['📕','✉️','📋','👨‍🍳','🍛','🌿','🔥','🍹','⭐','🍮','🌧','📗',
                          '🥘','🍽️','🍷','⭐','📸','🥗','🍰','🌱','📖','📗'];
    const thumbLabels = ['Cover','Editor\'s Bite','Global Table','Contents','TOC Feature',
                          'Chef\'s Special','Chef\'s Text','Signature Dishes','Seekh Kebab',
                          'Recipe Studio','Recipe Steps','Behind Kitchen','Kitchen Text',
                          'Drink Photo','Drink Pairings','Favourites','Stats',
                          'Dessert Photo','Desserts','Seasonal','Our Story','Back Cover'];

    function buildThumbnails() {
      if (!thumbGrid) return;
      pages.forEach(function (pg, i) {
        const thumb = document.createElement('div');
        thumb.className = 'thumb-item';
        thumb.innerHTML = '<div class="thumb-preview">' + (thumbEmojis[i] || '📄') + '</div>' +
                          '<div class="thumb-lbl">' + (thumbLabels[i] || 'Page ' + (i+1)) + '</div>';
        thumb.addEventListener('click', function () {
          closeThumbnails();
          setTimeout(function () { pageFlip.flip(i); }, 150);
        });
        thumbGrid.appendChild(thumb);
      });
    }

    function updateThumbs(idx) {
      const items = document.querySelectorAll('.thumb-item');
      items.forEach(function (t, i) { t.classList.toggle('active-thumb', i === idx); });
    }

    function openThumbnails()  { if (thumbOverlay) thumbOverlay.classList.add('open'); }
    function closeThumbnails() { if (thumbOverlay) thumbOverlay.classList.remove('open'); }

    if (gridBtn) gridBtn.addEventListener('click', openThumbnails);
    if (thumbCloseBtn) thumbCloseBtn.addEventListener('click', closeThumbnails);
    if (thumbOverlay) {
      thumbOverlay.addEventListener('click', function (e) {
        if (e.target === thumbOverlay) closeThumbnails();
      });
    }

    buildThumbnails();

    // ---- Zoom ----
    const zoomBtn = document.getElementById('zoomBtn');
    let isZoomed = false;
    if (zoomBtn) {
      zoomBtn.addEventListener('click', function () {
        isZoomed = !isZoomed;
        zoomBtn.classList.toggle('active', isZoomed);
        if (stfParent) {
          stfParent.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          stfParent.style.transform = isZoomed ? 'scale(1.2)' : 'scale(1)';
        }
      });
    }

    // ---- Bookmark ----
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    let toastTimer = null;
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', function () {
        const active = bookmarkBtn.classList.toggle('active');
        showToast(active ? 'Bookmarked page ' + (pageFlip.getCurrentPageIndex() + 1) : 'Bookmark removed');
      });
    }

    // ---- Share ----
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        const url = window.location.origin + window.location.pathname + '#p=' + pageFlip.getCurrentPageIndex();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url)
            .then(function () { showToast('Link copied to clipboard'); })
            .catch(function () { showToast('Share: ' + url); });
        } else {
          showToast('Link: ' + url);
        }
      });
    }

    // ---- Fullscreen ----
    const fsBtn = document.getElementById('fsBtn');
    if (fsBtn) {
      fsBtn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          const req = document.documentElement.requestFullscreen();
          if (req && req.catch) req.catch(function () {});
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      });
    }
    document.addEventListener('fullscreenchange', function () {
      if (fsBtn) fsBtn.classList.toggle('active', !!document.fullscreenElement);
    });

    // ---- Toast notification ----
    function showToast(msg) {
      let toast = document.getElementById('mzToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mzToast';
        toast.style.cssText = 'position:fixed;bottom:64px;left:50%;transform:translateX(-50%);background:rgba(16,10,4,0.94);color:#F4EAC8;font-family:Inter,sans-serif;font-size:12px;letter-spacing:0.5px;padding:7px 16px;border-radius:4px;z-index:400;opacity:0;transition:opacity 0.25s;pointer-events:none;white-space:nowrap;';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.style.opacity = '1';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.style.opacity = '0'; }, 2000);
    }

    // ---- Resize handler — update on window change ----
    let resizeTimer = null;
    let wasMobile = isMobile();
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        const nowMobile = isMobile();
        if (nowMobile !== wasMobile) {
          // Major breakpoint change: reload
          window.location.reload();
        } else {
          pageFlip.update();
        }
      }, 250);
    });

    // ---- Premium paper texture overlay ----
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.018;mix-blend-mode:multiply;';
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 12000; i++) {
      ctx.fillStyle = 'rgba(90,60,20,' + (Math.random() * 0.7) + ')';
      ctx.fillRect(Math.random() * 300, Math.random() * 300, Math.random() * 1.5, Math.random() * 1.5);
    }
    document.body.appendChild(canvas);

    // ---- Subtle page floating animation (reduced) ----
    let t = 0;
    (function tick() {
      t += 0.003;
      if (stfParent && !isZoomed) {
        const cur = stfParent.style.transform || '';
        if (!cur.includes('scale') || cur === 'scale(1)') {
          stfParent.style.transform = 'translateY(' + (Math.sin(t) * 0.8) + 'px)';
        }
      }
      requestAnimationFrame(tick);
    })();

    // ---- Initial page from URL hash ----
    const hashMatch = window.location.hash.match(/#p=(\d+)/);
    if (hashMatch) {
      const pg = parseInt(hashMatch[1], 10);
      if (pg > 0 && pg < TOTAL) {
        setTimeout(function () { pageFlip.flip(pg); }, 600);
      }
    }

  });
})();