// Chat Widget Functionality with Socket.io
document.addEventListener('DOMContentLoaded', () => {
    // Create chat widget elements
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
        <div class="chat-button">
            <i class="fas fa-comments"></i>
        </div>
        <div class="chat-box">
            <div class="chat-header">
                <h3>براين سايت المساعد</h3>
                <button class="close-chat"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-messages">
                <div class="message bot">
                    <div class="message-content">
                        مرحباً! كيف يمكنني مساعدتك اليوم؟
                    </div>
                </div>
            </div>
            <div class="chat-input">
                <input type="text" placeholder="اكتب رسالتك هنا..." />
                <button class="send-button">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatWidget);

    // Chat widget functionality
    const chatButton = document.querySelector('.chat-button');
    const chatBox = document.querySelector('.chat-box');
    const closeButton = document.querySelector('.close-chat');
    const sendButton = document.querySelector('.send-button');
    const chatInput = document.querySelector('.chat-input input');
    const chatMessages = document.querySelector('.chat-messages');
    
    // Check if Socket.io is being used in production
    let socket;
    try {
        // Try to connect to Socket.io server
        socket = io();
        
        // Listen for chat messages from server
        socket.on('chat message', (msg) => {
            addMessage(msg.text, 'bot');
        });
        
        socket.on('connect', () => {
            console.log('Connected to chat server');
        });
        
        socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
        });
    } catch (error) {
        console.log('Socket.io not available, using fallback mode');
        socket = null;
    }

    // Toggle chat box
    chatButton.addEventListener('click', () => {
        chatBox.classList.toggle('active');
        chatButton.classList.toggle('hidden');
    });

    // Close chat box
    closeButton.addEventListener('click', () => {
        chatBox.classList.remove('active');
        chatButton.classList.remove('hidden');
    });

    // Send message
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            // Add user message to chat
            addMessage(messageText, 'user');
            chatInput.value = '';

            if (socket && socket.connected) {
                // Send message to server via Socket.io
                socket.emit('chat message', {
                    text: messageText,
                    sender: 'user',
                    timestamp: new Date()
                });
            } else {
                // Fallback for when Socket.io is not available
                setTimeout(() => {
                    const responses = [
                        "شكراً لتواصلك معنا! سيتم الرد عليك قريباً من فريقنا.",
                        "يسعدنا مساعدتك، هل يمكنك تقديم المزيد من التفاصيل؟",
                        "نحن نعمل على تطوير حلول ذكية للعديد من القطاعات. هل تبحث عن حل معين؟",
                        "يمكنك زيارة صفحة خدماتنا لمعرفة المزيد عن الحلول التي نقدمها."
                    ];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    addMessage(randomResponse, 'bot');
                }, 1000);
            }
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${text}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message on click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
