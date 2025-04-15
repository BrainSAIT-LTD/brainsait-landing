// ملف JavaScript لموقع براين سايت
document.addEventListener('DOMContentLoaded', function() {
    // تبديل القائمة في الأجهزة المحمولة
    const mobileMenuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // إغلاق القائمة عند النقر على أحد الروابط
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });

    // معالجة النموذج
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // يمكن إضافة كود للتحقق من صحة الحقول هنا
            
            const formData = new FormData(contactForm);
            const formValues = Object.fromEntries(formData);
            
            // هنا يمكن إضافة كود الإرسال عبر AJAX أو طريقة أخرى
            console.log('بيانات النموذج:', formValues);
            
            // إظهار رسالة نجاح
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً';
            
            contactForm.innerHTML = '';
            contactForm.appendChild(successMessage);
        });
    }

    // نموذج النشرة البريدية
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // هنا يمكن إضافة كود الإرسال
            console.log('تم الاشتراك بالبريد الإلكتروني:', email);
            
            // إظهار رسالة نجاح
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'تم الاشتراك بنجاح، شكراً لك!';
            
            newsletterForm.innerHTML = '';
            newsletterForm.appendChild(successMessage);
        });
    }

    // تأثيرات التمرير السلس
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // تغيير حالة القائمة عند التمرير
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.main-nav');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // تحميل شرائح الشهادات بشكل ديناميكي
    // يمكن توسيع هذا الكود لإضافة التنقل بين الشرائح
    const testimonialSlider = document.querySelector('.testimonials-slider');
    if (testimonialSlider) {
        // هنا يمكن إضافة كود التنقل بين الشهادات إذا كانت كثيرة
    }

    // تحقق من استخدام الـ localStorage للحفاظ على تفضيل اللغة
    const languageSwitcher = document.querySelector('.language-switcher');
    if (languageSwitcher) {
        const languageLinks = languageSwitcher.querySelectorAll('a');
        languageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // إزالة الفئة النشطة من جميع الروابط
                languageLinks.forEach(l => l.classList.remove('active'));
                
                // إضافة الفئة النشطة للرابط المحدد
                this.classList.add('active');
                
                // حفظ اختيار اللغة في localStorage
                localStorage.setItem('preferredLanguage', this.textContent.trim());
                
                // هنا يمكن إضافة كود تغيير اللغة
                console.log('تم تغيير اللغة إلى:', this.textContent.trim());
            });
        });
        
        // تحقق من وجود تفضيل لغة محفوظ
        const preferredLanguage = localStorage.getItem('preferredLanguage');
        if (preferredLanguage) {
            languageLinks.forEach(link => {
                if (link.textContent.trim() === preferredLanguage) {
                    link.click();
                }
            });
        }
    }

    // إضافة تأثيرات ظهور العناصر عند التمرير
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.service-card, .solution-item, .stat-item, .testimonial-card').forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });

    // إضافة كود لمعالجة الوكلاء الذكية (chatbot)
    function initAIChatbot() {
        // هذا كود افتراضي، يمكن تخصيصه حسب نوع الوكيل المستخدم
        console.log('تم تهيئة وكيل المحادثة الذكي');
    }

    // إضافة زر محادثة ذكي في أسفل الشاشة
    function addAIChatButton() {
        const chatButton = document.createElement('button');
        chatButton.className = 'ai-chat-button';
        chatButton.innerHTML = '<i class="fas fa-robot"></i>';
        chatButton.title = 'تحدث مع المساعد الذكي';
        
        const chatWindow = document.createElement('div');
        chatWindow.className = 'ai-chat-window';
        chatWindow.innerHTML = `
            <div class="chat-header">
                <span>المساعد الذكي</span>
                <button class="close-chat"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-messages">
                <div class="message bot">
                    مرحباً بك في براين سايت! كيف يمكنني مساعدتك اليوم؟
                </div>
            </div>
            <div class="chat-input">
                <input type="text" placeholder="اكتب رسالتك هنا...">
                <button class="send-message"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;
        
        document.body.appendChild(chatButton);
        document.body.appendChild(chatWindow);
        
        // إخفاء نافذة المحادثة في البداية
        chatWindow.style.display = 'none';
        
        // إظهار/إخفاء نافذة المحادثة عند النقر على الزر
        chatButton.addEventListener('click', function() {
            if (chatWindow.style.display === 'none') {
                chatWindow.style.display = 'flex';
            } else {
                chatWindow.style.display = 'none';
            }
        });
        
        // زر الإغلاق في نافذة المحادثة
        chatWindow.querySelector('.close-chat').addEventListener('click', function() {
            chatWindow.style.display = 'none';
        });
        
        // إرسال الرسائل
        const chatInput = chatWindow.querySelector('.chat-input input');
        const sendButton = chatWindow.querySelector('.send-message');
        const chatMessages = chatWindow.querySelector('.chat-messages');
        
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message === '') return;
            
            // إضافة رسالة المستخدم
            chatMessages.innerHTML += `<div class="message user">${message}</div>`;
            chatInput.value = '';
            
            // تمرير للأسفل لرؤية الرسالة الجديدة
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // هنا يمكن إضافة كود للاتصال بالخدمة الخلفية للذكاء الاصطناعي
            
            // إضافة رد افتراضي بعد تأخير قصير
            setTimeout(function() {
                chatMessages.innerHTML += `
                    <div class="message bot">
                        شكراً لتواصلك معنا. سيتم معالجة استفسارك والرد عليك في أقرب وقت ممكن.
                    </div>
                `;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
        
        sendButton.addEventListener('click', sendMessage);
        
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // تهيئة وكيل المحادثة عند تحميل الصفحة
    initAIChatbot();
    
    // إضافة زر المحادثة بعد تأخير قصير
    setTimeout(addAIChatButton, 2000);

    // إضافة تتبع التحليلات في حالة كان موقعاً حقيقياً
    function initAnalytics() {
        console.log('تم تهيئة التحليلات');
        // هنا يمكن إضافة كود خدمات التحليلات مثل Google Analytics
    }

    // تهيئة التحليلات
    initAnalytics();
});
