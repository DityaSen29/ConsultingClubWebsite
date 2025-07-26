// Critical: Apply theme immediately before any rendering occurs
(function() {
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    // Apply to both html and body immediately
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.className = savedTheme;
    // Use a style tag to ensure immediate application
    const style = document.createElement('style');
    style.textContent = `
        html.light-theme, html.light-theme body { 
            background-color: #e8e8e8 !important; 
            color: #000000 !important; 
        }
        html.dark-theme, html.dark-theme body { 
            background-color: #121212 !important; 
            color: #ffffff !important; 
        }
        /* Immediate toggle state styling */
        .theme-switch input { opacity: 0; width: 0; height: 0; }
        html.light-theme .theme-switch input { opacity: 0; width: 0; height: 0; }
    `;
    document.head.appendChild(style);
    
    // Set toggle state immediately when DOM elements are available
    document.addEventListener('DOMContentLoaded', function() {
        const themeToggleElement = document.getElementById('themeToggle');
        if (themeToggleElement) {
            themeToggleElement.checked = savedTheme === 'light-theme';
        }
    });
})();

// DOM Elements
const backToTopButton = document.getElementById('backToTop');
const themeToggle = document.getElementById('themeToggle');

// Google Sheets configuration
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzrJkvB7yZgxoeYdRORDlvvLWeiR8Ty0tnaAQXTwyFnjVRrVxfAkSG4IkCR2Z2Yo-_-/exec';

// Theme handling - simplified since HTML handles initial application
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.className = themeName;
    
    // Update toggle state
    if (themeToggle) {
        themeToggle.checked = themeName === 'light-theme';
    }
    
    // Update icons immediately
    updateThemeIcons(themeName);
    
    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute(
            'content', 
            themeName === 'dark-theme' ? '#121212' : '#e8e8e8'
        );
    }
}

function updateThemeIcons(themeName) {
    const moonIcon = document.querySelector('.theme-icon-dark');
    const sunIcon = document.querySelector('.theme-icon-light');
    
    if (themeName === 'dark-theme') {
        if (moonIcon) moonIcon.style.opacity = '1';
        if (sunIcon) sunIcon.style.opacity = '0';
    } else {
        if (sunIcon) sunIcon.style.opacity = '1';
        if (moonIcon) moonIcon.style.opacity = '0';
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    
    // Ensure theme is applied to body (in case IIFE didn't catch it)
    document.body.className = savedTheme;
    
    // Set toggle state (this is now redundant but kept for safety)
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'light-theme';
    }
    
    // Set up meta tag
    if (!document.querySelector('meta[name="theme-color"]')) {
        const metaTag = document.createElement('meta');
        metaTag.name = 'theme-color';
        metaTag.content = savedTheme === 'dark-theme' ? '#121212' : '#e8e8e8';
        document.head.appendChild(metaTag);
    }
    
    // Update icons
    updateThemeIcons(savedTheme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark-theme';
    const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
    setTheme(newTheme);
}

// Form submission handler
async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showAlert('Please fix the errors below before submitting.', 'error');
        return;
    }
    
    const submitButton = e.target.querySelector('.contact-submit-btn');
    const submitText = submitButton.querySelector('.submit-text');
    const submitSpinner = submitButton.querySelector('.submit-spinner');
    
    try {
        submitButton.disabled = true;
        submitText.classList.add('d-none');
        submitSpinner.classList.remove('d-none');
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim()
        };
        
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // With no-cors mode, we assume success if no error is thrown
        showAlert('Thank you! Your message has been sent successfully. We\'ll get back to you soon!', 'success');
        document.getElementById('contactForm').reset();
        clearValidation();
        
    } catch (error) {
        console.error('Form submission error:', error);
        
        if (window.location.protocol === 'file:') {
            showAlert('Note: Contact form requires a web server to work. Please visit the live website or contact us directly at bitspilaniconsultingclub@bits-pilani.ac.in', 'info');
        } else {
            showAlert('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
        }
    } finally {
        submitButton.disabled = false;
        submitText.classList.remove('d-none');
        submitSpinner.classList.add('d-none');
    }
}

// Form validation
function validateForm() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');
    
    let isValid = true;
    clearValidation();
    
    if (!name.value.trim()) {
        showFieldError(name, 'nameError', 'Name is required');
        isValid = false;
    } else if (name.value.trim().length < 2) {
        showFieldError(name, 'nameError', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showFieldError(email, 'emailError', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email.value.trim())) {
        showFieldError(email, 'emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!subject.value.trim()) {
        showFieldError(subject, 'subjectError', 'Subject is required');
        isValid = false;
    } else if (subject.value.trim().length < 3) {
        showFieldError(subject, 'subjectError', 'Subject must be at least 3 characters');
        isValid = false;
    }
    
    if (!message.value.trim()) {
        showFieldError(message, 'messageError', 'Message is required');
        isValid = false;
    } else if (message.value.trim().length < 10) {
        showFieldError(message, 'messageError', 'Message must be at least 10 characters');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(field, errorId, message) {
    field.classList.add('is-invalid');
    document.getElementById(errorId).textContent = message;
}

function clearValidation() {
    const fields = ['name', 'email', 'subject', 'message'];
    const form = document.getElementById('contactForm');
    
    if (form) form.classList.remove('was-validated');
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field) field.classList.remove('is-invalid', 'is-valid');
        if (errorElement) errorElement.textContent = '';
    });
}

// Alert system
function showAlert(message, type = 'info') {
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show custom-alert position-fixed`;
    alertElement.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-triangle' : 
                 'fas fa-info-circle';
    
    alertElement.innerHTML = `
        <div class="d-flex align-items-start">
            <i class="${icon} me-2 mt-1"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(alertElement);
    
    setTimeout(() => {
        if (alertElement && alertElement.parentNode) {
            alertElement.classList.remove('show');
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.remove();
                }
            }, 150);
        }
    }, 5000);
}

// Stats counter animation
function resetAndAnimateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(element => {
        if (!element.getAttribute('data-original')) {
            element.setAttribute('data-original', element.innerText);
        }
        
        const originalValue = element.getAttribute('data-original');
        const numericPart = originalValue.replace(/\D/g, '');
        const suffix = originalValue.replace(/[0-9]/g, '');
        
        if (numericPart) {
            element.textContent = '0' + suffix;
            
            setTimeout(() => {
                animateCounter(element, parseInt(numericPart), suffix);
            }, 100);
        }
    });
}

function animateCounter(element, target, suffix = '', duration = 1500) {
    let start = 0;
    const increment = Math.max(1, Math.floor(target / 100));
    const stepTime = Math.max(1, Math.floor(duration / (target / increment)));
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = start + suffix;
        }
    }, stepTime);
}

// Preload gallery images
function preloadGalleryImages() {
    const imageSources = [
        'photos/casequesta1.jpg',
        'photos/casequesta2.jpg',
        'photos/workshop2.jpg',
        'photos/orientation.jpg'
    ];
    
    imageSources.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Document ready
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    preloadGalleryImages();
    
    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }
    
    // Enhanced mobile menu functionality
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Handle hamburger click
        navbarToggler.addEventListener('click', function(e) {
            e.preventDefault();
            navbarCollapse.classList.toggle('show');
            document.body.style.overflow = navbarCollapse.classList.contains('show') ? 'hidden' : '';
        });
        
        // Handle close button click (the × button)
        navbarCollapse.addEventListener('click', function(e) {
            if (e.target === navbarCollapse || e.target.matches('::before')) {
                navbarCollapse.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
        
        // Handle backdrop click
        document.addEventListener('click', function(e) {
            if (navbarCollapse.classList.contains('show') && 
                !navbarCollapse.contains(e.target) && 
                !navbarToggler.contains(e.target)) {
                navbarCollapse.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
        
        // Handle nav link clicks
        const navLinks = navbarCollapse.querySelectorAll('.nav-link:not(.dropdown-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 991) {
                    navbarCollapse.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 991) {
                navbarCollapse.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Enhanced About dropdown functionality
    const aboutDropdown = document.getElementById('aboutDropdown');
    const dropdownParent = aboutDropdown?.closest('.dropdown');
    
    if (aboutDropdown && dropdownParent) {
        let hoverTimeout;
        
        // Desktop hover functionality - simplified to use CSS
        if (window.innerWidth > 991) {
            dropdownParent.addEventListener('mouseenter', function() {
                clearTimeout(hoverTimeout);
            });
            
            dropdownParent.addEventListener('mouseleave', function() {
                clearTimeout(hoverTimeout);
            });
        }
        
        // Mobile - About link behavior (navigate directly to about page)
        aboutDropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 991) {
                // Close mobile menu
                if (navbarCollapse) {
                    navbarCollapse.classList.remove('show');
                    document.body.style.overflow = '';
                }
                
                // Navigate directly to about page
                window.location.href = 'about.html';
            }
        });
        
        // Handle dropdown item clicks for desktop only
        const dropdownItems = dropdownParent.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Only handle desktop dropdown functionality
                if (window.innerWidth > 991) {
                    // Handle navigation based on text content
                    const text = this.textContent.trim();
                    if (text === 'About BITS Pilani') {
                        e.preventDefault();
                        window.location.href = 'about.html'; // Navigate to top of about page, no hash
                    } else if (text === 'About Us') {
                        e.preventDefault();
                        const href = 'about.html#about-bpcc-section';
                        
                        if (window.location.pathname.includes('about.html')) {
                            const targetElement = document.getElementById('about-bpcc-section');
                            if (targetElement) {
                                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                                const extraOffset = 30;
                                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - extraOffset;
                                
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                                
                                setTimeout(() => {
                                    history.pushState(null, null, href);
                                }, 100);
                            }
                        } else {
                            window.location.href = href;
                        }
                    }
                }
            });
        });
        
        // Reset dropdown on window resize
        window.addEventListener('resize', function() {
            clearTimeout(hoverTimeout);
        });
    }
    
    // Handle direct hash navigation on page load
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const extraOffset = 30; // Additional spacing
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - extraOffset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
    
    // Carousel initialization
    const carousel = document.getElementById('eventCarousel');
    if (carousel && typeof bootstrap !== 'undefined') {
        new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true
        });
    }
    
    // Back to top button
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('d-none');
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
                setTimeout(() => {
                    if (!backToTopButton.classList.contains('show')) {
                        backToTopButton.classList.add('d-none');
                    }
                }, 300);
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Stats counters
    if (document.querySelector('.stat-number')) {
        resetAndAnimateCounters();
    }
    
    // Make mobile navbar title clickable
    const mobileNavTitle = document.querySelector('.navbar-brand-full.d-lg-none');
    if (mobileNavTitle) {
        mobileNavTitle.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
});