// ==================== Navigation ====================
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.querySelectorAll('.nav-link');

// Mobile menu toggle
mobileToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    mobileToggle.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu?.classList.remove('active');
        mobileToggle?.classList.remove('active');
    });
});

// Active navigation highlighting on scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            navLink?.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// ==================== Typing Animation ====================
const typedTextElement = document.getElementById('typed-text');
const textsToType = [
    'iOS Application Developer',
    'Swift & Objective-C Expert',
    'Full-Stack Developer',
    'Problem Solver'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeText() {
    const currentText = textsToType[textIndex];

    if (isDeleting) {
        typedTextElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typedTextElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textsToType.length;
        typingSpeed = 500; // Pause before next text
    }

    setTimeout(typeText, typingSpeed);
}

// Start typing animation
if (typedTextElement) {
    setTimeout(typeText, 1000);
}

// ==================== Scroll Animations ====================
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe timeline items
const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach(item => {
    observer.observe(item);
});

// Observe fade-in elements
const fadeElements = document.querySelectorAll('.fade-in');
fadeElements.forEach(element => {
    observer.observe(element);
});

// Add fade-in class to sections for animation
document.querySelectorAll('.skill-category, .certificate-card, .stat-card').forEach(element => {
    element.classList.add('fade-in');
    observer.observe(element);
});

// ==================== Smooth Scrolling ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 70; // Account for navbar height

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== Scroll to Top ====================
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add/remove navbar shadow on scroll
    if (scrollTop > 0) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }

    lastScrollTop = scrollTop;
});

// ==================== Performance Optimization ====================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(() => {
    highlightNavigation();
}, 50);

window.addEventListener('scroll', optimizedScrollHandler);

// ==================== Loading Animation ====================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ==================== Add interaction hints ====================
// Add subtle pulse animation to contact buttons
const contactLinks = document.querySelectorAll('.contact-link');
contactLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.animation = 'pulse 0.5s ease';
    });

    link.addEventListener('animationend', () => {
        link.style.animation = '';
    });
});

// ==================== Console Easter Egg ====================
console.log('%c👋 Hello there!', 'font-size: 20px; font-weight: bold; color: #8B5CF6;');
console.log('%cLooking for something? Let\'s connect!', 'font-size: 14px; color: #60A5FA;');
console.log('%c📧 bhargavkukadiya007@gmail.com', 'font-size: 12px; color: #9CA3AF;');

// ==================== Resume JSON Integration ====================
fetch('resume.json')
    .then(response => response.json())
    .then(data => {
        // Update page title and meta description
        if (data.basics) {
            document.title = `${data.basics.name} | ${data.basics.headline}`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', data.basics.headline);
        }
        // Update hero title name
        const heroTitleSpan = document.querySelector('.hero-title .gradient-text');
        if (heroTitleSpan && data.basics) {
            heroTitleSpan.textContent = data.basics.name;
        }
        // Update hero subtitle (typed animation) with headline
        const typedTexts = [data.basics.headline];
        if (typeof typedTextElement !== 'undefined') {
            textsToType.length = 0;
            textsToType.push(...typedTexts);
        }
        // Update contact email and phone
        const emailLink = document.querySelector('.contact-link[href^="mailto:"]');
        if (emailLink && data.basics.email) {
            emailLink.href = `mailto:${data.basics.email}`;
            emailLink.textContent = data.basics.email;
        }
        const phoneItem = document.querySelector('.contact-item .contact-text');
        if (phoneItem && data.basics.phone) {
            phoneItem.textContent = data.basics.phone;
        }
        // Update About section summary
        const aboutSection = document.getElementById('about');
        if (aboutSection && data.sections && data.sections.summary && data.sections.summary.content) {
            const leadPara = aboutSection.querySelector('.lead');
            if (leadPara) {
                leadPara.innerHTML = data.sections.summary.content;
            }
        }
        // Update Experience timeline
        const timelineContainer = document.querySelector('.timeline');
        if (timelineContainer && data.sections && data.sections.experience && data.sections.experience.items) {
            const items = data.sections.experience.items;
            timelineContainer.innerHTML = '';
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'timeline-item';
                div.innerHTML = `
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-period">${item.date}</div>
            <h3 class="timeline-title">${item.position}</h3>
            <h4 class="timeline-company">${item.company}</h4>
            <p class="timeline-location">${item.location}</p>
            <ul class="timeline-responsibilities">${item.summary.replace(/<[^>]+>/g, '').split('\n').filter(Boolean).map(line => `<li>${line.trim()}</li>`).join('')}</ul>
          </div>`;
                timelineContainer.appendChild(div);
            });
        }
        // Update Skills
        const skillsSection = document.getElementById('skills');
        if (skillsSection && data.sections && data.sections.skills && data.sections.skills.items) {
            const skillCategories = {};
            data.sections.skills.items.forEach(skill => {
                const category = skill.name;
                if (!skillCategories[category]) skillCategories[category] = [];
                skillCategories[category].push(...skill.keywords);
            });
            const skillsGrid = skillsSection.querySelector('.skills-grid');
            if (skillsGrid) {
                skillsGrid.innerHTML = '';
                Object.entries(skillCategories).forEach(([cat, tags]) => {
                    const catDiv = document.createElement('div');
                    catDiv.className = 'skill-category';
                    catDiv.innerHTML = `
            <h3 class="skill-category-title">${cat}</h3>
            <div class="skill-tags">${[...new Set(tags)].map(tag => `<span class="skill-tag">${tag}</span>`).join('')}
            </div>`;
                    skillsGrid.appendChild(catDiv);
                });
            }
        }
        // Update Education
        const educationSection = document.getElementById('education');
        if (educationSection && data.sections && data.sections.education && data.sections.education.items) {
            const eduItem = data.sections.education.items[0];
            const degreeElem = educationSection.querySelector('.education-degree');
            const institutionElem = educationSection.querySelector('.education-institution');
            const detailsElem = educationSection.querySelector('.education-details');
            if (degreeElem) degreeElem.textContent = eduItem.studyType || '';
            if (institutionElem) institutionElem.textContent = eduItem.institution || '';
            if (detailsElem) detailsElem.innerHTML = `<span class="education-duration">${eduItem.date}</span> <span class="education-gpa">${eduItem.score || ''}</span>`;
        }
    })
    .catch(err => console.error('Failed to load resume.json', err));

