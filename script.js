// Language Handling
let currentLanguage = 'ar';
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`languages/${lang}.js`);
        const module = await response.text();
        // Safely evaluate the translations object
        translations = (new Function(`${module} return translations;`))();
        return translations;
    } catch (error) {
        console.error('Error loading translations:', error);
        return {};
    }
}

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[key];
            } else {
                element.textContent = translations[key];
            }
        }
    });
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
}

// Language Switcher
document.querySelectorAll('.language-switcher a').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const lang = e.target.getAttribute('lang');
        if (lang !== currentLanguage) {
            currentLanguage = lang;
            await loadTranslations(lang);
            translatePage();
            // Update active state
            document.querySelectorAll('.language-switcher a').forEach(a => {
                a.classList.toggle('active', a.getAttribute('lang') === lang);
            });
        }
    });
});

// Google Analytics
function initializeAnalytics() {
    // Google Analytics code
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'YOUR-GA-ID');

    // Track page views and events
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            gtag('event', 'click', {
                'event_category': 'navigation',
                'event_label': e.target.href || e.target.textContent
            });
        });
    });
}

// Newsletter System
function initializeNewsletter() {
    const form = document.querySelector('.newsletter-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value;
        const submitButton = form.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.classList.add('loading');

            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message || 'تم الاشتراك بنجاح!', 'success');
                emailInput.value = '';
            } else {
                showNotification(data.error || 'حدث خطأ، يرجى المحاولة مرة أخرى.', 'error');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            showNotification('حدث خطأ في الاتصال.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Progress Bar
function updateProgressBar() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('progressBar').style.width = scrolled + '%';
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize progress bar
    window.addEventListener('scroll', updateProgressBar);
    
    // Load initial translations
    await loadTranslations(currentLanguage);
    translatePage();
    
    // Initialize analytics
    initializeAnalytics();
    
    // Initialize newsletter
    initializeNewsletter();
});
