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
