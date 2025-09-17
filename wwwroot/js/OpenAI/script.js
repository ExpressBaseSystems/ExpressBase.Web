$(document).ready(function () {
    // State management
    let currentSessionId = null;
    let isTyping = false;
    let chatHistory = [];

    // DOM elements
    const $hamburgerBtn = $('#hamburgerBtn');
    const $sidebar = $('#sidebar');
    const $sidebarOverlay = $('#sidebarOverlay');
    const $mainContent = $('#mainContent');
    const $themeToggle = $('#themeToggle');
    const $messageInput = $('#messageInput');
    const $sendBtn = $('#sendBtn');
    const $messagesContainer = $('#messagesContainer');
    const $welcomeMessage = $('#welcomeMessage');
    const $newChatBtn = $('#newChatBtn');
    const $chatHistory = $('#chatHistory');
    const $errorToast = $('#errorToast');
    const $loadingOverlay = $('#loadingOverlay');

    // Initialize app
    init();

    function init() {
        setupEventListeners();
        loadTheme();
        //generateSessionId();
        loadChatHistory();
        adjustTextareaHeight();
    }

    function setupEventListeners() {
        // Sidebar toggle
        $hamburgerBtn.on('click', toggleSidebar);
        $sidebarOverlay.on('click', closeSidebar);

        // Theme toggle
        $themeToggle.on('click', toggleTheme);

        // Message input
        $messageInput.on('input', handleInputChange);
        $messageInput.on('keydown', handleKeyDown);

        // Send button
        $sendBtn.on('click', sendMessage);

        // New chat button
        $newChatBtn.on('click', startNewChat);

        // Toast close
        $('.toast-close').on('click', hideToast);

        // Settings and help buttons
        //$('#settingsBtn').on('click', () => showToast('Settings feature coming soon!', 'info'));
        //$('#helpBtn').on('click', () => showToast('Help feature coming soon!', 'info'));

        // Window resize
        $(window).on('resize', handleResize);

        // Escape key to close sidebar
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape') {
                closeSidebar();
                hideToast();
            }
        });
    }

    // Sidebar management
    function toggleSidebar() {
        const isOpen = $sidebar.hasClass('open');
        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function openSidebar() {
        $sidebar.addClass('open');
        $sidebarOverlay.addClass('active');
        $('body').css('overflow', 'hidden');

        // Focus management
        $sidebar.find('button:first').focus();
    }

    function closeSidebar() {
        $sidebar.removeClass('open');
        $sidebarOverlay.removeClass('active');
        $('body').css('overflow', '');
    }

    function handleResize() {
        if ($(window).width() > 768) {
            closeSidebar();
            $('body').css('overflow', '');
        }
    }

    // Theme management
    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        setTheme(newTheme);
        saveTheme(newTheme);
    }

    function setTheme(theme) {
        $('body').attr('data-theme', theme);
        $themeToggle.find('.theme-icon').text(theme === 'light' ? '🌙' : '☀️');
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }

    function saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    // Input handling
    function handleInputChange() {
        const value = $messageInput.val().trim();
        $sendBtn.prop('disabled', !value);
        adjustTextareaHeight();
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Allow new line with Shift+Enter
                return;
            } else {
                e.preventDefault();
                sendMessage();
            }
        } else if (e.key === 'Tab') {
            // Handle tab navigation
            return;
        }
    }

    function adjustTextareaHeight() {
        const textarea = $messageInput[0];
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = newHeight + 'px';
    }

    // Message handling
    function sendMessage() {
        const message = $messageInput.val().trim();
        if (!message || isTyping) return;

        // Hide welcome message
        $welcomeMessage.hide();

        // Add user message
        addMessage(message, 'user');

        // Clear input
        $messageInput.val('');
        $sendBtn.prop('disabled', true);
        adjustTextareaHeight();

        // Show typing indicator
        showTypingIndicator();

        // Simulate API call based on message content
        //if (message.toLowerCase().includes('sql') || message.toLowerCase().includes('query')) {
        //    // SQL generation endpoint
        //    callSQLGenerationAPI(message);
        //} else if (message.toLowerCase().includes('correct') || message.toLowerCase().includes('fix')) {
        //    // SQL correction endpoint
        //    callSQLCorrectionAPI(message);
        //} else {
        //    // Generic response for other messages
        //    simulateAssistantResponse(message);
        //}

        callSQLGenerationAPI(message);

        // Scroll to bottom
        scrollToBottom();
    }

    function addMessage(content, type, timestamp = new Date()) {


        //$.ajax({
        //    url: '/openai/TEST',
        //    method: 'GET',
        //    contentType: 'application/json',
        //    data: {
        //        msg: content
        //    },
        //    timeout: 30000,
        //    success: function (response) {
        //        alert(response);
        //    },
        //    error: function (xhr, status, error) {
        //        hideTypingIndicator();
        //        let errorMessage = 'Connection error occurred';

        //        if (xhr.status === 404) {
        //            errorMessage = 'SQL generation service not available';
        //        } else if (xhr.status === 500) {
        //            errorMessage = 'Internal server error';
        //        } else if (status === 'timeout') {
        //            errorMessage = 'Request timed out';
        //        }

        //        addErrorMessage(message, errorMessage);
        //        showToast('Failed to generate SQL. Please try again.', 'error');
        //    }
        //});



        //return;/////////////

        const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const timeStr = formatTime(timestamp);

        const messageHtml = `
            <div class="message ${type}" data-message-id="${messageId}">
                <div class="message-bubble">
                    <div class="message-content">${escapeHtml(content)}</div>
                    <div class="message-time">${timeStr}</div>
                </div>
            </div>
        `;

        $messagesContainer.append(messageHtml);
        scrollToBottom();

        // Store message in session
        //if (currentSessionId) {
        //    storeMessage(content, type, timestamp);
        //}

        return messageId;
    }

    function addErrorMessage(originalMessage, error) {
        const messageHtml = `
            <div class="message assistant error">
                <div class="message-bubble">
                    <div class="message-content">
                        Sorry, I encountered an error while processing your request.
                        <br><small>Error: ${escapeHtml(error)}</small>
                    </div>
                    <button class="retry-btn" data-original-message="${escapeHtml(originalMessage)}">
                        Retry
                    </button>
                </div>
            </div>
        `;

        $messagesContainer.append(messageHtml);

        // Add retry functionality
        $('.retry-btn').last().on('click', function () {
            const originalMsg = $(this).data('original-message');
            $(this).closest('.message').remove();

            // Resend the message
            $messageInput.val(originalMsg);
            sendMessage();
        });

        scrollToBottom();
    }

    function showTypingIndicator() {
        isTyping = true;
        const typingHtml = `
            <div class="typing-indicator" id="typingIndicator">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        $messagesContainer.append(typingHtml);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        $('#typingIndicator').remove();
        isTyping = false;
    }

    function scrollToBottom() {
        $messagesContainer.animate({
            scrollTop: $messagesContainer[0].scrollHeight
        }, 300);
    }

    // API calls
    function callSQLGenerationAPI(message) {
        var isFirstChat = $("#isFirstChat").val();
        $.ajax({
            url: '/openai/PostRequest',
            method: 'POST',
            //contentType: 'application/json',
            data: {
                requestBody: message,
                isFirstChat: isFirstChat
                //session_id: currentSessionId
            },
            timeout: 30000,
            success: function (response) {
                hideTypingIndicator();
                response.forEach(item => addMessage(item, 'assistant'));
                $("#isFirstChat").val("false");
                //const sqlQuery = response
                //addMessage(sqlQuery, 'assistant');
            },
            error: function (xhr, status, error) {
                hideTypingIndicator();
                let errorMessage = 'Connection error occurred';

                if (xhr.status === 404) {
                    errorMessage = 'SQL generation service not available';
                } else if (xhr.status === 500) {
                    errorMessage = 'Internal server error';
                } else if (status === 'timeout') {
                    errorMessage = 'Request timed out';
                }

                addErrorMessage(message, errorMessage);
                showToast('Failed to generate SQL. Please try again.', 'error');
            }
        });
    }

    //function callSQLCorrectionAPI(message) {
    //    $.ajax({
    //        url: '/sql/correction',
    //        method: 'POST',
    //        contentType: 'application/json',
    //        data: JSON.stringify({
    //            sql_query: message,
    //            session_id: currentSessionId
    //        }),
    //        timeout: 30000,
    //        success: function (response) {
    //            hideTypingIndicator();
    //            const correctedSQL = response.corrected_sql || response.sql || 'Corrected SQL would appear here.';
    //            addMessage(correctedSQL, 'assistant');
    //        },
    //        error: function (xhr, status, error) {
    //            hideTypingIndicator();
    //            let errorMessage = 'Connection error occurred';

    //            if (xhr.status === 404) {
    //                errorMessage = 'SQL correction service not available';
    //            } else if (xhr.status === 500) {
    //                errorMessage = 'Internal server error';
    //            } else if (status === 'timeout') {
    //                errorMessage = 'Request timed out';
    //            }

    //            addErrorMessage(message, errorMessage);
    //            showToast('Failed to correct SQL. Please try again.', 'error');
    //        }
    //    });
    //}

    //function simulateAssistantResponse(message) {
    //    // Simulate network delay
    //    setTimeout(() => {
    //        hideTypingIndicator();

    //        // Generate contextual response
    //        let response = "I understand you're asking about: " + message + "\n\n";

    //        if (message.toLowerCase().includes('help')) {
    //            response += "I'm here to help you with SQL queries and corrections. You can:\n\n" +
    //                "• Ask me to generate SQL queries by describing what you need\n" +
    //                "• Request corrections for existing SQL code\n" +
    //                "• Get explanations for database concepts\n\n" +
    //                "How can I assist you today?";
    //        } else {
    //            response += "I'm an AI assistant specialized in SQL and database queries. " +
    //                "To better help you, please let me know if you need:\n\n" +
    //                "• SQL query generation\n" +
    //                "• SQL query correction\n" +
    //                "• Database design advice\n\n" +
    //                "Feel free to be specific about your requirements!";
    //        }

    //        addMessage(response, 'assistant');
    //    }, 1500 + Math.random() * 1000);
    //}

    // Session management
    //function generateSessionId() {
    //    currentSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    //}

    function startNewChat() {

        $.ajax({
            url: `/openai/NewChat`,
            method: 'GET',
            success: function (response) {
                $messagesContainer.empty();
                $welcomeMessage.show();

                if (response && response.length > 0) {
                    console.log(response)
                }

                if ($(window).width() <= 768) {
                    closeSidebar();
                }

                $("#isFirstChat").val("true")


                showToast('Started new conversation', 'success');
            },
            error: function () {
                showToast('Error for creating new conversation', 'error');
            }
        });

        // Clear current messages
        //$messagesContainer.empty();
        //$welcomeMessage.show();

        //// Generate new session
        ////generateSessionId();

        //// Update chat history
        ////loadChatHistory();

        //// Close sidebar on mobile
        //if ($(window).width() <= 768) {
        //    closeSidebar();
        //}
        

        //showToast('Started new conversation', 'success');
    }

    //function storeMessage(content, type, timestamp) {
    //    // Store in localStorage for demo purposes
    //    const sessionMessages = JSON.parse(localStorage.getItem(currentSessionId) || '[]');
    //    sessionMessages.push({
    //        content,
    //        type,
    //        timestamp: timestamp.toISOString()
    //    });
    //    localStorage.setItem(currentSessionId, JSON.stringify(sessionMessages));

    //    // Update chat history
    //    //updateChatHistoryItem();
    //}

    function loadSessionHistory(sessionId) {
        $.ajax({
            url: `/openai/LoadSessionHistory`,
            method: 'POST',
            data: {
                session_id: sessionId
            },
            success: function (response) {
                // Load messages from server
                $messagesContainer.empty();
                $welcomeMessage.hide();

                if (response.messages && response.messages.length > 0) {
                    response.messages.forEach(msg => {
                        addMessage(msg.content, msg.type, new Date(msg.timestamp));
                    });
                } else {
                    $welcomeMessage.show();
                }
            },
            error: function () {
                // Fallback to localStorage
                const sessionMessages = JSON.parse(localStorage.getItem(sessionId) || '[]');
                $messagesContainer.empty();

                if (sessionMessages.length > 0) {
                    $welcomeMessage.hide();
                    sessionMessages.forEach(msg => {
                        addMessage(msg.content, msg.type, new Date(msg.timestamp));
                    });
                } else {
                    $welcomeMessage.show();
                }
            }
        });
    }

    //function deleteSession(sessionId) {
    //    $.ajax({
    //        url: `/session/${sessionId}`,
    //        method: 'DELETE',
    //        success: function () {
    //            // Remove from localStorage as well
    //            localStorage.removeItem(sessionId);
    //            loadChatHistory();

    //            if (sessionId === currentSessionId) {
    //                startNewChat();
    //            }

    //            showToast('Chat deleted successfully', 'success');
    //        },
    //        error: function () {
    //            // Fallback to localStorage removal
    //            localStorage.removeItem(sessionId);
    //            loadChatHistory();
    //            showToast('Chat deleted locally', 'info');
    //        }
    //    });
    //}

    // Chat history management
    function loadChatHistory() {
        let sessions = [];

        $.ajax({
            url: `/openai/LoadChatHistory`,
            method: 'GET',
            success: function (response) {
                if (typeof response === "string") {
                    response = JSON.parse(response);
                }

                sessions = Object.values(response);

                updateChatHistoryUI(sessions);
            },
            error: function () {
                showToast('Error for loading chat history', 'error');
            }
        });

        //// Load from localStorage for demo
        //for (let i = 0; i < localStorage.length; i++) {
        //    const key = localStorage.key(i);
        //    if (key && key.startsWith('session-')) {
        //        const messages = JSON.parse(localStorage.getItem(key) || '[]');
        //        if (messages.length > 0) {
        //            sessions.push({
        //                id: key,
        //                title: getSessionTitle(messages[0].content),
        //                lastMessage: messages[messages.length - 1].timestamp,
        //                messageCount: messages.length
        //            });
        //        }
        //    }
        //}

        // Sort by last message time
        //sessions.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));

        // Update UI
        //updateChatHistoryUI(sessions);
    }

    function updateChatHistoryUI(sessions) {
        $chatHistory.empty();

        if (sessions.length === 0) {
            $chatHistory.append('<li class="chat-history-item">No previous chats</li>');
            return;
        }

        sessions.forEach(session => {
            const isActive = 'active'
            const timeStr = formatRelativeTime(new Date(session.lastMessage));

            const historyItem = $(`
                <li class="chat-history-item ${isActive}" data-session-id="${session.SessionId}">
                    <div class="chat-title">${escapeHtml(session.ChatHeading)}</div>
                    
                </li>
            `);

            historyItem.on('click', function () {
                const sessionId = $(this).data('session-id');
                loadSession(sessionId);
                closeSidebar();
            });

            $chatHistory.append(historyItem);
        });
    }

    function getSessionTitle(firstMessage) {
        const truncated = firstMessage.length > 30 ?
            firstMessage.substring(0, 30) + '...' :
            firstMessage;
        return truncated;
    }

    function updateChatHistoryItem() {
        loadChatHistory();
    }

    function loadSession(sessionId) {
        currentSessionId = sessionId;
        loadSessionHistory(sessionId);
    }

    // Toast notifications
    function showToast(message, type = 'info') {
        const $toast = $(`
            <div class="toast ${type}-toast">
                <div class="toast-content">
                    <span class="toast-icon">${getToastIcon(type)}</span>
                    <span class="toast-message">${escapeHtml(message)}</span>
                </div>
                <button class="toast-close" aria-label="Close">×</button>
            </div>
        `);

        $('body').append($toast);

        // Show toast
        setTimeout(() => $toast.addClass('show'), 100);

        // Auto hide after 5 seconds
        setTimeout(() => {
            $toast.removeClass('show');
            setTimeout(() => $toast.remove(), 300);
        }, 5000);

        // Close button
        $toast.find('.toast-close').on('click', function () {
            $toast.removeClass('show');
            setTimeout(() => $toast.remove(), 300);
        });
    }

    function getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '⚠️',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || icons.info;
    }

    function hideToast() {
        $('.toast').removeClass('show');
        setTimeout(() => $('.toast').remove(), 300);
    }

    // Utility functions
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function formatTime(date) {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    // Keyboard navigation
    function setupKeyboardNavigation() {
        $(document).on('keydown', function (e) {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                $messageInput.focus();
            }
        });
    }

    setupKeyboardNavigation();
});