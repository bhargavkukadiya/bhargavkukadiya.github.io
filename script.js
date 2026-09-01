/**
 * ==========================================================================
 * BHARGAV KUKADIYA — PORTFOLIO CLIENT LOGIC
 * Minimalist Architecture · Fast Static Execution · Framer Aesthetics
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initRoleTyping();
    initNavigation();
    initScrollReveal();
    initSkillsFilter();
    initCopyActions();
    initPdfModal();
    initLocalClock();
});

/* ==========================================================================
   1. THEME SWITCHER (Light / Dark)
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('bk_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Default to dark or saved theme
    const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', activeTheme);

    // Toggle theme on button click
    themeToggleBtn?.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

        root.setAttribute('data-theme', nextTheme);
        localStorage.setItem('bk_theme', nextTheme);

        showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });

    // Listen for OS system theme change if no manual preference saved
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('bk_theme')) {
            const systemTheme = e.matches ? 'dark' : 'light';
            root.setAttribute('data-theme', systemTheme);
        }
    });
}

/* ==========================================================================
   2. ROLE CYCLER / TYPING ANIMATION
   ========================================================================== */
function initRoleTyping() {
    const roleElem = document.getElementById('typed-role');
    if (!roleElem) return;

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        roleElem.textContent = 'Senior iOS Developer & Apple Platforms Architect';
        return;
    }

    const roles = [
        'Senior iOS Application Developer',
        'Apple Platforms Architect',
        'Swift 6 Concurrency Specialist',
        'iOS Architect (MVVM-R · VIPER · MVC)',
        'Open-Source Framework Author',
        'Full-Stack Mobile & .NET Engineer'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typeLoop() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            roleElem.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 35;
        } else {
            roleElem.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = 2200; // Pause at end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 400; // Pause before next word
        }

        setTimeout(typeLoop, typingSpeed);
    }

    setTimeout(typeLoop, 600);
}

/* ==========================================================================
   3. NAVIGATION & SCROLL TRACKING
   ========================================================================== */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function setDrawerState(open) {
        if (!mobileDrawer || !mobileToggle) return;
        if (open) {
            mobileDrawer.classList.add('open');
            mobileDrawer.setAttribute('aria-hidden', 'false');
            mobileToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            // Move focus into the first drawer interactive element once rendered and visible
            const focusFirstItem = () => {
                if (!mobileDrawer.classList.contains('open')) return;
                const firstFocusable = mobileDrawer.querySelector('a, button');
                firstFocusable?.focus();
            };

            // Defer focus to the next rendered frame, transition completion, and timeout fallback
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(focusFirstItem);
            }
            mobileDrawer.addEventListener('transitionend', focusFirstItem, { once: true });
            setTimeout(focusFirstItem, 50);
        } else {
            mobileDrawer.classList.remove('open');
            mobileDrawer.setAttribute('aria-hidden', 'true');
            mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            mobileToggle.focus();
        }
    }

    // Mobile menu toggle click
    mobileToggle?.addEventListener('click', () => {
        const isOpen = mobileDrawer?.classList.contains('open');
        setDrawerState(!isOpen);
    });

    // Close mobile menu on drawer link click
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            setDrawerState(false);
        });
    });

    // Close mobile drawer when clicking backdrop
    mobileDrawer?.addEventListener('click', (e) => {
        if (e.target === mobileDrawer) {
            setDrawerState(false);
        }
    });

    // Keyboard support: Escape to close, Tab containment
    document.addEventListener('keydown', (e) => {
        if (!mobileDrawer?.classList.contains('open')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            setDrawerState(false);
            return;
        }

        if (e.key === 'Tab') {
            const focusables = mobileDrawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
            if (!focusables.length) return;

            const firstEl = focusables[0];
            const lastEl = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
    });

    // Active link highlighting on scroll
    function highlightActiveSection() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 140;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveSection, { passive: true });
    highlightActiveSection();
}

/* ==========================================================================
   4. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
    const elementsToReveal = document.querySelectorAll(
        '.fade-in, .project-card, .os-card, .timeline-card, .skill-category-card, .cert-card, .edu-card'
    );

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        elementsToReveal.forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementsToReveal.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

/* ==========================================================================
   5. COPY TO CLIPBOARD ACTIONS & INLINE FEEDBACK
   ========================================================================== */
function setButtonCopiedState(btn, copiedText) {
    if (!btn) return;

    // Store original HTML if not already cached
    if (!btn._originalHTML) {
        btn._originalHTML = btn.innerHTML;
    }

    btn.classList.add('is-copied');

    const checkmarkSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    if (copiedText) {
        btn.innerHTML = `${checkmarkSVG}<span>${copiedText}</span>`;
    } else {
        btn.innerHTML = checkmarkSVG;
    }

    if (btn._resetTimer) {
        clearTimeout(btn._resetTimer);
    }

    btn._resetTimer = setTimeout(() => {
        btn.classList.remove('is-copied');
        if (btn._originalHTML) {
            btn.innerHTML = btn._originalHTML;
            btn._originalHTML = null;
        }
    }, 2000);
}

function initCopyActions() {
    // SPM Dependency Copy Buttons
    document.querySelectorAll('.btn-copy-spm').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const spmCode = btn.getAttribute('data-spm');
            if (spmCode) {
                copyToClipboard(spmCode, () => setButtonCopiedState(btn, 'Copied!'));
            }
        });
    });

    // Contact Copy Buttons (Email / Phone)
    document.querySelectorAll('.btn-copy-contact').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const textToCopy = btn.getAttribute('data-copy');
            if (textToCopy) {
                copyToClipboard(textToCopy, () => setButtonCopiedState(btn, null));
            }
        });
    });

    // Hero Email Copy Button
    const heroEmailBtn = document.getElementById('btn-copy-hero-email');
    heroEmailBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        copyToClipboard('bhargavkukadiya007@gmail.com', () => setButtonCopiedState(heroEmailBtn, 'Email Copied!'));
    });
}

function copyToClipboard(text, onSuccess) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            if (onSuccess) onSuccess();
        }).catch(() => {
            fallbackCopy(text, onSuccess);
        });
    } else {
        fallbackCopy(text, onSuccess);
    }
}

function fallbackCopy(text, onSuccess) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful && onSuccess) {
            onSuccess();
        } else if (!successful) {
            showToast('Unable to copy text');
        }
    } catch (err) {
        showToast('Unable to copy text');
    }
    document.body.removeChild(textArea);
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 250);
    }, 2800);
}

/* ==========================================================================
   6. MULTI-DOCUMENT & CERTIFICATE PREVIEW MODAL / STEPPER ENGINE
   ========================================================================== */
function initPdfModal() {
    const modal = document.getElementById('pdf-modal');
    const iframe = document.getElementById('modal-pdf-iframe');
    const imgElem = document.getElementById('modal-img');
    const titleElem = document.getElementById('modal-cert-title');
    const pagerText = document.getElementById('modal-pager-text');
    const pillNav = document.getElementById('modal-pill-nav');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');
    const downloadLink = document.getElementById('modal-download-link');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!modal) return;

    // State
    let currentDocList = [];
    let currentDocTitles = [];
    let currentIndex = 0;
    let currentTitle = 'Document Preview';
    let previousActiveElement = null;

    function renderActiveDoc() {
        if (!currentDocList.length) return;

        const activeDoc = currentDocList[currentIndex];
        const total = currentDocList.length;
        const activeDocTitle = currentDocTitles[currentIndex] || '';
        const isImage = /\.(jpe?g|png|webp|gif)$/i.test(activeDoc);

        // Update iframe or image source
        if (isImage) {
            if (iframe) {
                iframe.style.display = 'none';
                iframe.src = '';
            }
            if (imgElem) {
                imgElem.style.display = 'block';
                imgElem.src = activeDoc;
            }
            if (downloadLink) {
                downloadLink.href = activeDoc;
                downloadLink.textContent = 'Open Full Image ↗';
            }
        } else {
            if (imgElem) {
                imgElem.style.display = 'none';
                imgElem.src = '';
            }
            if (iframe) {
                iframe.style.display = 'block';
                iframe.src = activeDoc;
            }
            if (downloadLink) {
                downloadLink.href = activeDoc;
                downloadLink.textContent = 'Open Full PDF ↗';
            }
        }

        // Update header & pager title
        if (titleElem) {
            if (activeDocTitle) {
                titleElem.textContent = `${activeDocTitle} (${currentIndex + 1}/${total})`;
            } else {
                titleElem.textContent = `${currentTitle} (${currentIndex + 1}/${total})`;
            }
        }
        if (pagerText) {
            pagerText.textContent = activeDocTitle ? activeDocTitle : `Document ${currentIndex + 1} of ${total}`;
        }

        // Update Previous / Next button states
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex === total - 1;

        // Update numbered dots / pills
        if (pillNav) {
            pillNav.innerHTML = '';
            currentDocList.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.className = `modal-page-dot ${idx === currentIndex ? 'active' : ''}`;
                dot.textContent = idx + 1;
                const dotLabel = currentDocTitles[idx] || `View Document ${idx + 1}`;
                dot.title = dotLabel;
                dot.addEventListener('click', () => {
                    currentIndex = idx;
                    renderActiveDoc();
                });
                pillNav.appendChild(dot);
            });
        }
    }

    function openModalWithDocs(docs, title, startIndex = 0, titles = []) {
        previousActiveElement = document.activeElement;
        currentDocList = Array.isArray(docs) ? docs : [docs];
        currentDocTitles = Array.isArray(titles) ? titles : [];
        currentTitle = title || 'Document Preview';
        currentIndex = Math.max(0, Math.min(startIndex, currentDocList.length - 1));

        renderActiveDoc();

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus close button on dialog open
        setTimeout(() => {
            closeBtn?.focus();
        }, 30);
    }

    // Bind Primary "View All PDFs" Buttons
    document.querySelectorAll('.btn-view-pdf').forEach(btn => {
        btn.addEventListener('click', () => {
            const rawPdfs = btn.getAttribute('data-pdfs');
            const singlePdf = btn.getAttribute('data-pdf');
            const title = btn.getAttribute('data-title') || 'Certificate Preview';

            let pdfList = [];
            if (rawPdfs) {
                try {
                    pdfList = JSON.parse(rawPdfs);
                } catch (e) {
                    pdfList = [rawPdfs];
                }
            } else if (singlePdf) {
                pdfList = [singlePdf];
            }

            if (pdfList.length) {
                openModalWithDocs(pdfList, title, 0);
            }
        });
    });

    // Bind Quick Module Pills in Certificate Cards
    document.querySelectorAll('.cert-pill-btn').forEach(pill => {
        pill.addEventListener('click', () => {
            const rawDocs = pill.getAttribute('data-docs') || pill.getAttribute('data-pdfs');
            const rawTitles = pill.getAttribute('data-titles');
            const index = parseInt(pill.getAttribute('data-doc-index') || pill.getAttribute('data-cert-index') || '0', 10);
            const courseTitle = pill.getAttribute('data-course') || 'Document Preview';

            let docList = [];
            let titlesList = [];

            if (rawDocs) {
                try {
                    docList = JSON.parse(rawDocs);
                } catch (e) {
                    docList = [rawDocs];
                }
            }
            if (rawTitles) {
                try {
                    titlesList = JSON.parse(rawTitles);
                } catch (e) {
                    titlesList = [];
                }
            }

            if (docList.length) {
                openModalWithDocs(docList, courseTitle, index, titlesList);
            }
        });
    });

    // Next / Previous Click Handlers
    prevBtn?.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            renderActiveDoc();
        }
    });

    nextBtn?.addEventListener('click', () => {
        if (currentIndex < currentDocList.length - 1) {
            currentIndex++;
            renderActiveDoc();
        }
    });

    // Close modal function with focus restoration
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (iframe) iframe.src = '';
        if (imgElem) imgElem.src = '';

        // Restore focus to trigger element
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
            previousActiveElement.focus();
        }
    }

    closeBtn?.addEventListener('click', closeModal);

    // Close when clicking outside modal window
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Keyboard Navigation: Escape to close, Tab focus trapping, Left/Right arrow
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusables = modal.querySelectorAll(
                'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusables.length) return;

            const firstEl = focusables[0];
            const lastEl = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
            return;
        }

        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            currentIndex--;
            renderActiveDoc();
        } else if (e.key === 'ArrowRight' && currentIndex < currentDocList.length - 1) {
            currentIndex++;
            renderActiveDoc();
        }
    });
}

/* ==========================================================================
   7. INTERACTIVE CONTACT FORM SUBMISSION
   ========================================================================== */
window.handleContactSubmit = function(event) {
    event.preventDefault();

    const name = document.getElementById('form-name')?.value.trim();
    const email = document.getElementById('form-email')?.value.trim();
    const topic = document.getElementById('form-topic')?.value || 'Project Inquiry';
    const message = document.getElementById('form-message')?.value.trim();

    if (!name || !email || !message) {
        showToast('Please fill out all required fields');
        return;
    }

    const subject = encodeURIComponent(`[${topic}] Inquiry from ${name}`);
    const body = encodeURIComponent(
        `Hi Bhargav,\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}\n\nSent via bhargavkukadiya.in`
    );

    showToast('Launching email client...');

    // Open default mail client
    window.location.href = `mailto:bhargavkukadiya007@gmail.com?subject=${subject}&body=${body}`;
};

/* ==========================================================================
   8. REAL-TIME LOCAL CLOCK (Surat, India - IST)
   ========================================================================== */
function initLocalClock() {
    const clockElem = document.getElementById('local-time-clock');
    if (!clockElem) return;

    function updateClock() {
        const now = new Date();
        const options = {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };

        const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
        clockElem.textContent = `${timeStr} IST`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================================================
   9. SKILLS BENTO CATEGORY FILTER
   ========================================================================== */
function initSkillsFilter() {
    const filterBtns = document.querySelectorAll('.skills-filter-btn');
    const bentoCards = document.querySelectorAll('.skills-bento-grid .bento-card');

    if (!filterBtns.length || !bentoCards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            // Toggle active state on buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter bento cards
            bentoCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden-category');
                } else {
                    card.classList.add('hidden-category');
                }
            });
        });
    });
}
