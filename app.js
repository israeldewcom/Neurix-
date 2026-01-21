/**
 * ChangeX Neurix - Main Application Script
 * Complete frontend with all backend integrations
 */

class NeurixApp {
    constructor() {
        this.config = {
            apiBaseUrl: window.location.origin + '/api/v2',
            socketUrl: window.location.origin,
            defaultTheme: 'dark',
            enableAnimations: true,
            enableSocket: true,
            enableServiceWorker: true,
            enableNotifications: true,
            enableAnalytics: true,
            enableOfflineMode: true,
            enableModelCache: true,
            enableAutoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            maxFileSize: 1024 * 1024 * 100, // 100MB
            maxImageSize: 4096,
            maxVideoDuration: 300, // 5 minutes
            maxAudioDuration: 3600, // 1 hour
            defaultModel: 'gpt-3.5-turbo',
            defaultImageModel: 'stable-diffusion-v1-5',
            defaultVideoModel: 'video-synthesis',
            defaultAudioModel: 'tts-v1',
            iotRefreshInterval: 10000, // 10 seconds
            analyticsRefreshInterval: 60000, // 1 minute
            notificationCheckInterval: 30000, // 30 seconds
            sessionTimeout: 3600000, // 1 hour
            idleTimeout: 300000, // 5 minutes
            rateLimit: {
                requests: 100,
                period: 60000 // 1 minute
            }
        };

        this.state = {
            user: null,
            token: localStorage.getItem('token'),
            theme: localStorage.getItem('theme') || this.config.defaultTheme,
            currentPage: 'dashboard',
            previousPage: null,
            isLoading: false,
            isOnline: navigator.onLine,
            isIdle: false,
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isTouch: 'ontouchstart' in window,
            models: {},
            connections: {},
            notifications: [],
            unreadNotifications: 0,
            iotDevices: [],
            activeJobs: [],
            completedJobs: [],
            failedJobs: [],
            usageStats: {},
            systemHealth: {},
            socket: null,
            serviceWorker: null,
            autoSaveTimer: null,
            idleTimer: null,
            sessionTimer: null,
            lastActivity: Date.now()
        };

        this.components = {
            router: null,
            api: null,
            socket: null,
            storage: null,
            notifications: null,
            models: null,
            iot: null,
            automation: null,
            payments: null,
            admin: null,
            analytics: null
        };

        this.cache = {
            pages: {},
            models: {},
            images: {},
            videos: {},
            audio: {},
            data: {}
        };

        this.events = {
            onUserUpdate: [],
            onThemeChange: [],
            onPageChange: [],
            onModelUpdate: [],
            onIotUpdate: [],
            onNotification: [],
            onJobUpdate: [],
            onConnectionChange: []
        };

        this.init();
    }

    // Initialize the application
    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize core components
            await this.initializeCore();
            
            // Initialize UI components
            await this.initializeUI();
            
            // Initialize service worker
            if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
                await this.initializeServiceWorker();
            }
            
            // Initialize WebSocket
            if (this.config.enableSocket) {
                await this.initializeSocket();
            }
            
            // Initialize analytics
            if (this.config.enableAnalytics) {
                await this.initializeAnalytics();
            }
            
            // Initialize notifications
            if (this.config.enableNotifications && 'Notification' in window) {
                await this.initializeNotifications();
            }
            
            // Load initial data
            await this.loadInitialData();
            
            // Start background tasks
            this.startBackgroundTasks();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Initialize router
            this.initializeRouter();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('Neurix App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Initialization failed', error.message);
        }
    }

    // Initialize core components
    async initializeCore() {
        // Initialize API client
        this.components.api = new NeurixAPI({
            baseUrl: this.config.apiBaseUrl,
            token: this.state.token,
            onTokenExpired: this.handleTokenExpired.bind(this),
            onRateLimitExceeded: this.handleRateLimit.bind(this)
        });

        // Initialize storage
        this.components.storage = new NeurixStorage();

        // Initialize model manager
        this.components.models = new ModelManager({
            api: this.components.api,
            cache: this.cache.models,
            enableCache: this.config.enableModelCache
        });

        // Initialize IoT manager
        this.components.iot = new IoTManager({
            api: this.components.api,
            refreshInterval: this.config.iotRefreshInterval,
            onDeviceUpdate: this.handleIotDeviceUpdate.bind(this)
        });

        // Initialize automation manager
        this.components.automation = new AutomationManager({
            api: this.components.api
        });

        // Initialize payments manager
        this.components.payments = new PaymentManager({
            api: this.components.api
        });

        // Initialize admin manager
        this.components.admin = new AdminManager({
            api: this.components.api
        });

        // Initialize analytics
        this.components.analytics = new AnalyticsManager({
            api: this.components.api,
            refreshInterval: this.config.analyticsRefreshInterval
        });
    }

    // Initialize UI components
    async initializeUI() {
        // Set theme
        this.setTheme(this.state.theme);
        
        // Initialize components
        this.initializeComponents();
        
        // Update UI based on auth state
        this.updateUIForAuthState();
        
        // Initialize tooltips and popovers
        this.initializeTooltips();
        
        // Initialize charts
        this.initializeCharts();
    }

    // Initialize service worker
    async initializeServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            this.state.serviceWorker = registration;
            
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showToast('New version available', 'info', {
                            action: 'Update',
                            onClick: () => window.location.reload()
                        });
                    }
                });
            });
        } catch (error) {
            console.warn('Service worker registration failed:', error);
        }
    }

    // Initialize WebSocket connection
    async initializeSocket() {
        try {
            this.components.socket = new NeurixSocket({
                url: this.config.socketUrl,
                token: this.state.token,
                onConnect: this.handleSocketConnect.bind(this),
                onDisconnect: this.handleSocketDisconnect.bind(this),
                onMessage: this.handleSocketMessage.bind(this),
                onError: this.handleSocketError.bind(this)
            });
            
            await this.components.socket.connect();
        } catch (error) {
            console.warn('WebSocket connection failed:', error);
        }
    }

    // Initialize notifications
    async initializeNotifications() {
        this.components.notifications = new NotificationManager({
            api: this.components.api,
            checkInterval: this.config.notificationCheckInterval,
            onNotification: this.handleNotification.bind(this)
        });
        
        // Request permission
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    // Initialize analytics
    async initializeAnalytics() {
        // Track page views
        this.trackPageView(this.state.currentPage);
        
        // Track user actions
        this.setupAnalyticsTracking();
    }

    // Load initial data
    async loadInitialData() {
        try {
            // Check authentication
            if (this.state.token) {
                await this.loadUserData();
            }
            
            // Load system status
            await this.loadSystemStatus();
            
            // Load available models
            await this.loadAvailableModels();
            
            // Load recent activity
            await this.loadRecentActivity();
            
            // Load notifications
            if (this.components.notifications) {
                await this.components.notifications.load();
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    // Start background tasks
    startBackgroundTasks() {
        // Auto-save
        if (this.config.enableAutoSave) {
            this.state.autoSaveTimer = setInterval(() => {
                this.autoSave();
            }, this.config.autoSaveInterval);
        }
        
        // Session timeout
        this.state.sessionTimer = setInterval(() => {
            this.checkSession();
        }, 60000); // Check every minute
        
        // Idle detection
        this.setupIdleDetection();
        
        // Online/offline detection
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.handleOnlineStatusChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.handleOnlineStatusChange(false);
        });
    }

    // Initialize router
    initializeRouter() {
        this.components.router = new NeurixRouter({
            routes: {
                'dashboard': this.loadDashboard.bind(this),
                'models': this.loadModels.bind(this),
                'models/text': this.loadTextModel.bind(this),
                'models/image': this.loadImageModel.bind(this),
                'models/video': this.loadVideoModel.bind(this),
                'models/audio': this.loadAudioModel.bind(this),
                'models/code': this.loadCodeModel.bind(this),
                'automation': this.loadAutomation.bind(this),
                'iot': this.loadIot.bind(this),
                'scripts': this.loadScripts.bind(this),
                'payments': this.loadPayments.bind(this),
                'profile': this.loadProfile.bind(this),
                'settings': this.loadSettings.bind(this),
                'admin': this.loadAdmin.bind(this),
                'notifications': this.loadNotifications.bind(this),
                'create/image': this.createImage.bind(this),
                'create/video': this.createVideo.bind(this),
                'create/audio': this.createAudio.bind(this),
                'create/automation': this.createAutomation.bind(this)
            },
            onRouteChange: this.handleRouteChange.bind(this),
            onRouteError: this.handleRouteError.bind(this)
        });
        
        // Start router
        this.components.router.start();
    }

    // Set up event listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // Sidebar toggle
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Activity tracking
        document.addEventListener('click', () => {
            this.updateLastActivity();
        });
        
        document.addEventListener('keypress', () => {
            this.updateLastActivity();
        });
        
        document.addEventListener('scroll', () => {
            this.updateLastActivity();
        });
        
        // Before unload
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    // Theme management
    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Emit event
        this.emitEvent('onThemeChange', theme);
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Update button icon
        const icon = document.querySelector('#theme-toggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Authentication
    async login(credentials) {
        try {
            this.setLoading(true);
            
            const response = await this.components.api.post('/auth/login', credentials);
            
            if (response.success) {
                this.state.token = response.token;
                this.state.user = response.user;
                
                // Save token
                localStorage.setItem('token', response.token);
                
                // Update API client
                this.components.api.setToken(response.token);
                
                // Update UI
                this.updateUIForAuthState();
                
                // Load user data
                await this.loadUserData();
                
                // Connect WebSocket
                if (this.components.socket) {
                    await this.components.socket.connect();
                }
                
                // Show welcome message
                this.showToast(`Welcome back, ${response.user.username}!`, 'success');
                
                // Navigate to dashboard
                this.navigateTo('dashboard');
                
                return { success: true };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        } finally {
            this.setLoading(false);
        }
    }

    async logout() {
        try {
            this.setLoading(true);
            
            // Call logout endpoint
            await this.components.api.post('/auth/logout');
            
            // Clear state
            this.state.token = null;
            this.state.user = null;
            
            // Clear storage
            localStorage.removeItem('token');
            
            // Disconnect WebSocket
            if (this.components.socket) {
                this.components.socket.disconnect();
            }
            
            // Update UI
            this.updateUIForAuthState();
            
            // Clear cache
            this.clearCache();
            
            // Navigate to login
            this.navigateTo('dashboard');
            
            this.showToast('Logged out successfully', 'info');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            this.setLoading(false);
        }
    }

    // Navigation
    navigateTo(page, params = {}) {
        if (this.components.router) {
            this.components.router.navigateTo(page, params);
        } else {
            window.location.hash = page;
        }
    }

    // Page loading methods
    async loadDashboard(params = {}) {
        try {
            this.setLoading(true);
            
            const [stats, activity, health] = await Promise.all([
                this.components.api.get('/dashboard/stats'),
                this.components.api.get('/activity/recent'),
                this.components.api.get('/health')
            ]);
            
            const content = await this.renderTemplate('dashboard', {
                stats: stats.data,
                activity: activity.data,
                health: health.data,
                user: this.state.user
            });
            
            this.setContent(content);
            this.initializeDashboardComponents();
        } catch (error) {
            this.showError('Failed to load dashboard', error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async loadModels(params = {}) {
        try {
            this.setLoading(true);
            
            const models = await this.components.api.get('/models');
            
            const content = await this.renderTemplate('models', {
                models: models.data,
                categories: this.groupModelsByCategory(models.data)
            });
            
            this.setContent(content);
            this.initializeModelComponents();
        } catch (error) {
            this.showError('Failed to load models', error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async loadImageModel(params = {}) {
        try {
            this.setLoading(true);
            
            const [model, history, settings] = await Promise.all([
                this.components.api.get('/models/image'),
                this.components.api.get('/generations/images/recent'),
                this.components.storage.get('image-generation-settings')
            ]);
            
            const content = await this.renderTemplate('image-generation', {
                model: model.data,
                history: history.data,
                settings: settings || {},
                presets: this.getImageGenerationPresets()
            });
            
            this.setContent(content);
            this.initializeImageGenerationComponents();
        } catch (error) {
            this.showError('Failed to load image generator', error.message);
        } finally {
            this.setLoading(false);
        }
    }

    // Image generation
    async generateImage(prompt, options = {}) {
        try {
            this.setLoading(true, 'Generating image...');
            
            const response = await this.components.api.post('/image-generation/generate', {
                prompt,
                ...options
            });
            
            if (response.success) {
                // Display image
                this.displayGeneratedImage(response.data);
                
                // Save to history
                await this.saveToHistory('image', {
                    prompt,
                    image: response.data,
                    options,
                    timestamp: new Date().toISOString()
                });
                
                // Update usage
                await this.updateUsage('image');
                
                return response.data;
            }
        } catch (error) {
            this.showError('Image generation failed', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Video generation
    async generateVideo(text, options = {}) {
        try {
            this.setLoading(true, 'Generating video...');
            
            const response = await this.components.api.post('/video-generation/generate', {
                text,
                ...options
            });
            
            if (response.success) {
                // Display video
                this.displayGeneratedVideo(response.data);
                
                // Save to history
                await this.saveToHistory('video', {
                    text,
                    video: response.data,
                    options,
                    timestamp: new Date().toISOString()
                });
                
                // Update usage
                await this.updateUsage('video');
                
                return response.data;
            }
        } catch (error) {
            this.showError('Video generation failed', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Audio processing
    async processAudio(text, options = {}) {
        try {
            this.setLoading(true, 'Processing audio...');
            
            const response = await this.components.api.post('/audio-processing/text-to-speech', {
                text,
                ...options
            });
            
            if (response.success) {
                // Play audio
                this.playAudio(response.data);
                
                // Save to history
                await this.saveToHistory('audio', {
                    text,
                    audio: response.data,
                    options,
                    timestamp: new Date().toISOString()
                });
                
                // Update usage
                await this.updateUsage('audio');
                
                return response.data;
            }
        } catch (error) {
            this.showError('Audio processing failed', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // IoT control
    async controlIotDevice(deviceId, action, params = {}) {
        try {
            this.setLoading(true, 'Sending command...');
            
            const response = await this.components.api.post(`/iot/devices/${deviceId}/control`, {
                action,
                ...params
            });
            
            if (response.success) {
                this.showToast(`Device ${action} command sent`, 'success');
                
                // Update device state
                this.updateIotDeviceState(deviceId, response.data);
                
                return response.data;
            }
        } catch (error) {
            this.showError('Device control failed', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Automation
    async createAutomationWorkflow(workflow) {
        try {
            this.setLoading(true, 'Creating workflow...');
            
            const response = await this.components.api.post('/automation/workflows', workflow);
            
            if (response.success) {
                this.showToast('Workflow created successfully', 'success');
                return response.data;
            }
        } catch (error) {
            this.showError('Workflow creation failed', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Payments
    async createPayment(amount, method, options = {}) {
        try {
            this.setLoading(true, 'Processing payment...');
            
            const response = await this.components.api.post('/payments/create', {
                amount,
                method,
                ...options
            });
            
            if (response.success) {
                if (response.data.requiresApproval) {
                    this.showToast('Payment submitted for approval', 'info');
                } else {
                    this.showToast('Payment processed successfully', 'success');
                }
                
                return response.data;
            }
        } catch (error) {
            this.showError('Payment failed', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Admin functions
    async approvePremium(userId, notes = '') {
        try {
            this.setLoading(true, 'Approving premium access...');
            
            const response = await this.components.api.post(`/admin/users/${userId}/approve-premium`, {
                notes
            });
            
            if (response.success) {
                this.showToast('Premium access approved', 'success');
                return response.data;
            }
        } catch (error) {
            this.showError('Approval failed', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Utility methods
    showLoading(show = true, message = 'Loading...') {
        this.state.isLoading = show;
        
        const loadingEl = document.getElementById('loading-screen');
        const messageEl = loadingEl?.querySelector('h3');
        
        if (loadingEl) {
            if (show) {
                loadingEl.classList.remove('hidden');
                if (messageEl) messageEl.textContent = message;
            } else {
                setTimeout(() => {
                    loadingEl.classList.add('hidden');
                }, 300);
            }
        }
    }

    showToast(message, type = 'info', options = {}) {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        
        const toastId = 'toast-' + Date.now();
        toast.id = toastId;
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        const container = document.querySelector('.toast-container');
        container.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: options.delay || 5000
        });
        
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
        
        if (options.action) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'btn btn-sm btn-light ms-2';
            actionBtn.textContent = options.action;
            actionBtn.onclick = options.onClick || (() => bsToast.hide());
            
            toast.querySelector('.toast-body').appendChild(actionBtn);
        }
        
        return toastId;
    }

    showError(title, message) {
        const modal = new bootstrap.Modal(document.getElementById('error-modal'));
        
        document.getElementById('error-title').textContent = title;
        document.getElementById('error-message').textContent = message;
        
        modal.show();
    }

    setContent(content) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = content;
            
            // Initialize components in new content
            this.initializeComponentsInContent(contentArea);
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }

    async renderTemplate(template, data) {
        // Check cache first
        const cacheKey = `${template}-${JSON.stringify(data)}`;
        if (this.cache.pages[cacheKey]) {
            return this.cache.pages[cacheKey];
        }
        
        try {
            // Load template
            const response = await fetch(`/pages/${template}.html`);
            let html = await response.text();
            
            // Render template with data
            html = this.renderTemplateString(html, data);
            
            // Cache result
            this.cache.pages[cacheKey] = html;
            
            return html;
        } catch (error) {
            console.error(`Failed to load template ${template}:`, error);
            return `<div class="alert alert-danger">Failed to load page: ${error.message}</div>`;
        }
    }

    renderTemplateString(template, data) {
        return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    // Event handling
    emitEvent(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${eventName} callback:`, error);
                }
            });
        }
    }

    on(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName].push(callback);
        }
    }

    off(eventName, callback) {
        if (this.events[eventName]) {
            const index = this.events[eventName].indexOf(callback);
            if (index > -1) {
                this.events[eventName].splice(index, 1);
            }
        }
    }

    // Cleanup
    destroy() {
        // Clear timers
        if (this.state.autoSaveTimer) clearInterval(this.state.autoSaveTimer);
        if (this.state.sessionTimer) clearInterval(this.state.sessionTimer);
        if (this.state.idleTimer) clearTimeout(this.state.idleTimer);
        
        // Disconnect WebSocket
        if (this.components.socket) {
            this.components.socket.disconnect();
        }
        
        // Stop background tasks
        if (this.components.notifications) {
            this.components.notifications.stop();
        }
        
        if (this.components.analytics) {
            this.components.analytics.stop();
        }
        
        // Remove event listeners
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        
        console.log('Neurix App destroyed');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.neurixApp = new NeurixApp();
});
