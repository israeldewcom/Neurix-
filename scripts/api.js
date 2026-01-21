/**
 * ChangeX Neurix - API Client
 * Handles all backend API communication
 */

class NeurixAPI {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || '/api/v2';
        this.token = config.token || null;
        this.onTokenExpired = config.onTokenExpired || null;
        this.onRateLimitExceeded = config.onRateLimitExceeded || null;
        
        this.requests = {};
        this.queue = [];
        this.isProcessingQueue = false;
        
        this.initialize();
    }
    
    initialize() {
        // Set default headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Set up request interceptor
        this.interceptors = {
            request: [],
            response: []
        };
    }
    
    setToken(token) {
        this.token = token;
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }
    
    async request(method, endpoint, data = null, options = {}) {
        const requestId = this.generateRequestId();
        
        // Prepare request
        const config = {
            method,
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };
        
        if (data) {
            if (method === 'GET') {
                // Convert data to query params for GET requests
                const params = new URLSearchParams(data).toString();
                endpoint += `?${params}`;
            } else {
                config.body = JSON.stringify(data);
            }
        }
        
        // Apply request interceptors
        let modifiedConfig = config;
        for (const interceptor of this.interceptors.request) {
            modifiedConfig = await interceptor(modifiedConfig);
        }
        
        // Track request
        this.requests[requestId] = {
            endpoint,
            method,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        try {
            // Make request
            const response = await fetch(`${this.baseUrl}${endpoint}`, modifiedConfig);
            
            // Apply response interceptors
            let modifiedResponse = response;
            for (const interceptor of this.interceptors.response) {
                modifiedResponse = await interceptor(modifiedResponse);
            }
            
            // Parse response
            const contentType = modifiedResponse.headers.get('content-type');
            let responseData;
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await modifiedResponse.json();
            } else if (contentType && contentType.includes('text/')) {
                responseData = await modifiedResponse.text();
            } else {
                responseData = await modifiedResponse.blob();
            }
            
            // Update request status
            this.requests[requestId].status = 'completed';
            this.requests[requestId].response = {
                status: modifiedResponse.status,
                data: responseData
            };
            
            // Handle errors
            if (!modifiedResponse.ok) {
                await this.handleError(modifiedResponse, responseData);
            }
            
            // Handle rate limiting
            const remaining = modifiedResponse.headers.get('X-RateLimit-Remaining');
            const reset = modifiedResponse.headers.get('X-RateLimit-Reset');
            
            if (remaining && parseInt(remaining) < 10) {
                this.handleRateLimitWarning(parseInt(remaining), parseInt(reset));
            }
            
            return {
                success: true,
                status: modifiedResponse.status,
                data: responseData,
                headers: Object.fromEntries(modifiedResponse.headers.entries())
            };
            
        } catch (error) {
            // Update request status
            this.requests[requestId].status = 'failed';
            this.requests[requestId].error = error;
            
            // Handle network errors
            if (!navigator.onLine) {
                throw new Error('Network connection lost. Please check your internet connection.');
            }
            
            throw error;
        } finally {
            // Clean up old requests
            this.cleanupOldRequests();
        }
    }
    
    async handleError(response, data) {
        const error = new Error(data?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        
        switch (response.status) {
            case 401:
                // Unauthorized - token expired
                if (this.onTokenExpired) {
                    this.onTokenExpired();
                }
                break;
                
            case 403:
                // Forbidden
                error.message = 'You do not have permission to perform this action';
                break;
                
            case 404:
                // Not found
                error.message = 'The requested resource was not found';
                break;
                
            case 422:
                // Validation error
                error.message = 'Validation failed';
                error.errors = data?.errors || {};
                break;
                
            case 429:
                // Rate limited
                if (this.onRateLimitExceeded) {
                    this.onRateLimitExceeded(data);
                }
                error.message = 'Rate limit exceeded. Please try again later.';
                break;
                
            case 500:
                // Server error
                error.message = 'Internal server error. Please try again later.';
                break;
                
            case 502:
            case 503:
            case 504:
                // Service unavailable
                error.message = 'Service temporarily unavailable. Please try again later.';
                break;
        }
        
        throw error;
    }
    
    handleRateLimitWarning(remaining, reset) {
        const resetTime = new Date(reset * 1000);
        const now = new Date();
        const minutesLeft = Math.ceil((resetTime - now) / 60000);
        
        console.warn(`Rate limit warning: ${remaining} requests remaining. Resets in ${minutesLeft} minutes.`);
        
        // Show warning toast
        if (window.neurixApp) {
            window.neurixApp.showToast(
                `Rate limit: ${remaining} requests remaining`,
                'warning',
                { delay: 3000 }
            );
        }
    }
    
    // Convenience methods
    async get(endpoint, data = null, options = {}) {
        return this.request('GET', endpoint, data, options);
    }
    
    async post(endpoint, data = null, options = {}) {
        return this.request('POST', endpoint, data, options);
    }
    
    async put(endpoint, data = null, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }
    
    async patch(endpoint, data = null, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }
    
    async delete(endpoint, data = null, options = {}) {
        return this.request('DELETE', endpoint, data, options);
    }
    
    // File upload
    async upload(endpoint, file, fieldName = 'file', additionalData = {}) {
        const formData = new FormData();
        formData.append(fieldName, file);
        
        // Add additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        
        return this.request('POST', endpoint, null, {
            headers: {
                ...this.defaultHeaders,
                'Content-Type': undefined // Let browser set multipart boundary
            },
            body: formData
        });
    }
    
    // Stream response
    async stream(endpoint, data = null, onChunk, onComplete, onError) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: data ? JSON.stringify(data) : null
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    if (onComplete) onComplete();
                    break;
                }
                
                const chunk = decoder.decode(value);
                if (onChunk) onChunk(chunk);
            }
        } catch (error) {
            if (onError) onError(error);
        }
    }
    
    // WebSocket-like streaming for AI responses
    async streamAIResponse(endpoint, data, onToken, onComplete, onError) {
        return this.stream(endpoint, data, 
            (chunk) => {
                try {
                    const lines = chunk.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        if (line.startsWith('data: ')) {
                            const json = line.slice(6);
                            if (json === '[DONE]') {
                                if (onComplete) onComplete();
                                return;
                            }
                            
                            try {
                                const data = JSON.parse(json);
                                if (data.token && onToken) {
                                    onToken(data.token);
                                }
                            } catch (e) {
                                console.error('Failed to parse stream data:', e);
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error processing stream chunk:', error);
                }
            },
            onComplete,
            onError
        );
    }
    
    // Batch requests
    async batch(requests) {
        const batchId = `batch_${Date.now()}`;
        const results = [];
        
        for (const request of requests) {
            try {
                const result = await this.request(
                    request.method,
                    request.endpoint,
                    request.data,
                    request.options
                );
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error });
            }
        }
        
        return results;
    }
    
    // Queue for rate limiting
    async enqueue(request) {
        return new Promise((resolve, reject) => {
            this.queue.push({ request, resolve, reject });
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.isProcessingQueue || this.queue.length === 0) {
            return;
        }
        
        this.isProcessingQueue = true;
        
        while (this.queue.length > 0) {
            const { request, resolve, reject } = this.queue.shift();
            
            try {
                const result = await this.request(
                    request.method,
                    request.endpoint,
                    request.data,
                    request.options
                );
                resolve(result);
            } catch (error) {
                reject(error);
            }
            
            // Add delay between requests to respect rate limits
            await this.delay(100);
        }
        
        this.isProcessingQueue = false;
    }
    
    // Cache support
    async getWithCache(endpoint, ttl = 300000) { // 5 minutes default
        const cacheKey = `api_cache_${endpoint}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            
            if (Date.now() - timestamp < ttl) {
                return { success: true, data, cached: true };
            }
        }
        
        try {
            const result = await this.get(endpoint);
            
            // Cache the result
            localStorage.setItem(cacheKey, JSON.stringify({
                data: result.data,
                timestamp: Date.now()
            }));
            
            return { ...result, cached: false };
        } catch (error) {
            // Return cached data even if expired when offline
            if (!navigator.onLine && cached) {
                const { data } = JSON.parse(cached);
                return { success: true, data, cached: true, offline: true };
            }
            throw error;
        }
    }
    
    // Interceptors
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }
    
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }
    
    // Utilities
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    cleanupOldRequests() {
        const now = Date.now();
        const oneHour = 3600000;
        
        Object.keys(this.requests).forEach(id => {
            if (now - this.requests[id].timestamp > oneHour) {
                delete this.requests[id];
            }
        });
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Status monitoring
    getRequestStats() {
        const now = Date.now();
        const oneMinute = 60000;
        
        const recent = Object.values(this.requests).filter(
            req => now - req.timestamp < oneMinute
        );
        
        const stats = {
            total: Object.keys(this.requests).length,
            recent: recent.length,
            pending: recent.filter(req => req.status === 'pending').length,
            completed: recent.filter(req => req.status === 'completed').length,
            failed: recent.filter(req => req.status === 'failed').length,
            queue: this.queue.length
        };
        
        return stats;
    }
    
    // Mock responses for testing/offline
    mockResponse(endpoint, method, data) {
        const mockKey = `mock_${method}_${endpoint}`;
        this.mocks = this.mocks || {};
        this.mocks[mockKey] = data;
    }
    
    // Error recovery
    async retry(requestFn, maxRetries = 3, delayMs = 1000) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                // Don't retry on 4xx errors (except 429)
                if (error.status >= 400 && error.status < 500 && error.status !== 429) {
                    break;
                }
                
                // Exponential backoff
                await this.delay(delayMs * Math.pow(2, i));
            }
        }
        
        throw lastError;
    }
}
