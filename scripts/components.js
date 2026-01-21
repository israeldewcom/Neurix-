/**
 * ChangeX Neurix - UI Components
 * Reusable UI components and utilities
 */

class NeurixComponents {
    constructor() {
        this.components = new Map();
        this.modals = new Map();
        this.toasts = new Map();
        this.tooltips = new Map();
        this.charts = new Map();
        this.editors = new Map();
    }
    
    // Initialize all components
    initialize() {
        this.initializeTooltips();
        this.initializePopovers();
        this.initializeDropdowns();
        this.initializeModals();
        this.initializeAccordions();
        this.initializeTabs();
        this.initializeScrollSpy();
        this.initializeCarousels();
        this.initializeCharts();
        this.initializeEditors();
        this.initializeDatePickers();
        this.initializeFileUploaders();
        this.initializeColorPickers();
        this.initializeRangeSliders();
        this.initializeCodeEditors();
        this.initializeTerminals();
        this.initializeIotControls();
        this.initializeModelInterfaces();
    }
    
    // Initialize components in specific container
    initializeInContainer(container) {
        if (!container) return;
        
        this.initializeTooltips(container);
        this.initializePopovers(container);
        this.initializeDropdowns(container);
        this.initializeAccordions(container);
        this.initializeTabs(container);
        this.initializeCharts(container);
        this.initializeEditors(container);
    }
    
    // Tooltip component
    createTooltip(element, options = {}) {
        const id = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tooltip = new bootstrap.Tooltip(element, {
            placement: options.placement || 'top',
            title: options.title || element.getAttribute('title'),
            trigger: options.trigger || 'hover focus',
            customClass: options.customClass || '',
            delay: options.delay || { show: 100, hide: 100 },
            ...options
        });
        
        this.tooltips.set(id, tooltip);
        return tooltip;
    }
    
    // Modal component
    createModal(options = {}) {
        const modalId = options.id || `modal-${Date.now()}`;
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog ${options.size ? `modal-${options.size}` : ''}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${options.title || ''}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${options.content || ''}
                        </div>
                        ${options.footer ? `
                        <div class="modal-footer">
                            ${options.footer}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        const container = document.getElementById('modal-container') || document.body;
        const modalEl = document.createElement('div');
        modalEl.innerHTML = modalHTML;
        container.appendChild(modalEl.firstElementChild);
        
        // Initialize Bootstrap modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        this.modals.set(modalId, modal);
        
        return {
            id: modalId,
            element: document.getElementById(modalId),
            instance: modal,
            show: () => modal.show(),
            hide: () => modal.hide(),
            dispose: () => {
                modal.dispose();
                modalEl.remove();
                this.modals.delete(modalId);
            }
        };
    }
    
    // Toast component
    showToast(options = {}) {
        const toastId = `toast-${Date.now()}`;
        const type = options.type || 'info';
        const delay = options.delay || 5000;
        
        const toastHTML = `
            <div class="toast align-items-center text-bg-${type} border-0" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${options.message || ''}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        // Add to toast container
        const container = document.querySelector('.toast-container') || document.body;
        const toastEl = document.createElement('div');
        toastEl.innerHTML = toastHTML;
        container.appendChild(toastEl.firstElementChild);
        
        // Initialize toast
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: delay
        });
        
        toast.show();
        
        // Remove after hide
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
            this.toasts.delete(toastId);
        });
        
        this.toasts.set(toastId, toast);
        
        return {
            id: toastId,
            element: toastElement,
            instance: toast,
            hide: () => toast.hide()
        };
    }
    
    // Chart component
    createChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id ${canvasId} not found`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: config.type || 'line',
            data: config.data || {},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                ...config.options
            }
        });
        
        this.charts.set(canvasId, chart);
        return chart;
    }
    
    // Code editor component
    createCodeEditor(elementId, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id ${elementId} not found`);
            return null;
        }
        
        // Create editor wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-editor';
        
        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'code-toolbar';
        
        // Language selector
        const languageSelect = document.createElement('select');
        languageSelect.className = 'form-select form-select-sm';
        languageSelect.innerHTML = `
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
        `;
        
        // Toolbar buttons
        const buttons = [
            { icon: 'play', title: 'Run', action: options.onRun },
            { icon: 'copy', title: 'Copy', action: options.onCopy },
            { icon: 'download', title: 'Download', action: options.onDownload },
            { icon: 'trash', title: 'Clear', action: options.onClear }
        ];
        
        buttons.forEach(btn => {
            if (btn.action) {
                const button = document.createElement('button');
                button.className = 'btn btn-sm btn-outline-secondary';
                button.innerHTML = `<i class="fas fa-${btn.icon}"></i>`;
                button.title = btn.title;
                button.onclick = btn.action;
                toolbar.appendChild(button);
            }
        });
        
        toolbar.appendChild(languageSelect);
        
        // Create code area
        const codeArea = document.createElement('textarea');
        codeArea.className = 'code-content';
        codeArea.spellcheck = false;
        codeArea.value = options.value || '';
        
        // Replace element with editor
        element.parentNode.replaceChild(wrapper, element);
        wrapper.appendChild(toolbar);
        wrapper.appendChild(codeArea);
        
        // Initialize syntax highlighting
        this.initializeSyntaxHighlighting(codeArea, languageSelect.value);
        
        // Update syntax highlighting on language change
        languageSelect.addEventListener('change', () => {
            this.initializeSyntaxHighlighting(codeArea, languageSelect.value);
        });
        
        const editor = {
            element: wrapper,
            textarea: codeArea,
            languageSelect: languageSelect,
            getValue: () => codeArea.value,
            setValue: (value) => { codeArea.value = value; },
            focus: () => codeArea.focus(),
            dispose: () => {
                wrapper.remove();
                this.editors.delete(elementId);
            }
        };
        
        this.editors.set(elementId, editor);
        return editor;
    }
    
    // Terminal component
    createTerminal(elementId, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id ${elementId} not found`);
            return null;
        }
        
        // Create terminal wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'terminal';
        
        // Create output area
        const output = document.createElement('div');
        output.className = 'terminal-output';
        
        // Create input line
        const inputLine = document.createElement('div');
        inputLine.className = 'terminal-input-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = options.prompt || '$ ';
        
        const input = document.createElement('input');
        input.className = 'terminal-input';
        input.type = 'text';
        input.spellcheck = false;
        
        inputLine.appendChild(prompt);
        inputLine.appendChild(input);
        
        wrapper.appendChild(output);
        wrapper.appendChild(inputLine);
        
        // Replace element with terminal
        element.parentNode.replaceChild(wrapper, element);
        
        // Terminal history
        const history = [];
        let historyIndex = -1;
        
        // Command handling
        const handleCommand = async (command) => {
            // Add to output
            this.addTerminalOutput(output, `${options.prompt || '$'} ${command}`);
            
            // Add to history
            history.unshift(command);
            if (history.length > 50) history.pop();
            historyIndex = -1;
            
            // Clear input
            input.value = '';
            
            // Process command
            if (options.onCommand) {
                try {
                    const result = await options.onCommand(command);
                    if (result) {
                        this.addTerminalOutput(output, result);
                    }
                } catch (error) {
                    this.addTerminalOutput(output, `Error: ${error.message}`, 'error');
                }
            }
            
            // Scroll to bottom
            wrapper.scrollTop = wrapper.scrollHeight;
        };
        
        // Input event listeners
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleCommand(input.value.trim());
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    input.value = history[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = history[historyIndex];
                } else {
                    historyIndex = -1;
                    input.value = '';
                }
            }
        });
        
        // Focus input
        wrapper.addEventListener('click', () => {
            input.focus();
        });
        
        const terminal = {
            element: wrapper,
            output: output,
            input: input,
            addOutput: (text, className) => this.addTerminalOutput(output, text, className),
            clear: () => { output.innerHTML = ''; },
            focus: () => input.focus(),
            dispose: () => {
                wrapper.remove();
            }
        };
        
        return terminal;
    }
    
    // IoT Device Control component
    createIotDeviceControl(device, options = {}) {
        const deviceId = `iot-device-${device.id}`;
        
        const controlHTML = `
            <div class="iot-device ${device.status}" id="${deviceId}">
                <div class="iot-device-header">
                    <div>
                        <h6 class="device-name">${device.name}</h6>
                        <div class="iot-device-status">
                            <span class="status-dot ${device.status}"></span>
                            <span class="status-text">${device.status}</span>
                        </div>
                    </div>
                    <div class="iot-device-controls">
                        ${device.actions.map(action => `
                            <button class="btn btn-sm btn-outline-primary device-action" 
                                    data-action="${action}"
                                    data-device-id="${device.id}">
                                ${action}
                            </button>
                        `).join('')}
                    </div>
                </div>
                ${device.data ? `
                <div class="device-data">
                    <pre class="m-0">${JSON.stringify(device.data, null, 2)}</pre>
                </div>
                ` : ''}
            </div>
        `;
        
        const element = document.createElement('div');
        element.innerHTML = controlHTML;
        
        // Add event listeners to action buttons
        element.querySelectorAll('.device-action').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const deviceId = button.dataset.deviceId;
                
                if (options.onAction) {
                    options.onAction(deviceId, action);
                }
            });
        });
        
        const control = {
            element: element.firstElementChild,
            update: (newDevice) => {
                const statusDot = element.querySelector('.status-dot');
                const statusText = element.querySelector('.status-text');
                
                if (statusDot) {
                    statusDot.className = `status-dot ${newDevice.status}`;
                }
                if (statusText) {
                    statusText.textContent = newDevice.status;
                }
                
                // Update data display
                const dataElement = element.querySelector('.device-data');
                if (newDevice.data && dataElement) {
                    dataElement.querySelector('pre').textContent = 
                        JSON.stringify(newDevice.data, null, 2);
                }
            },
            dispose: () => {
                element.remove();
            }
        };
        
        return control;
    }
    
    // AI Model Interface component
    createModelInterface(model, options = {}) {
        const interfaceId = `model-interface-${model.id}`;
        
        const interfaceHTML = `
            <div class="model-interface" id="${interfaceId}">
                <div class="model-header">
                    <div class="model-info">
                        <h5>${model.name}</h5>
                        <p class="model-description">${model.description}</p>
                    </div>
                    <div class="model-status">
                        <span class="badge ${model.loaded ? 'bg-success' : 'bg-secondary'}">
                            ${model.loaded ? 'Loaded' : 'Not Loaded'}
                        </span>
                    </div>
                </div>
                
                <div class="model-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="model-input-container">
                                <label class="form-label">Input</label>
                                <textarea class="form-control model-input" 
                                          placeholder="Enter your input here..."
                                          rows="10"></textarea>
                                <div class="input-actions mt-2">
                                    <button class="btn btn-sm btn-outline-secondary clear-input">
                                        <i class="fas fa-trash"></i> Clear
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary load-example">
                                        <i class="fas fa-download"></i> Example
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="model-output-container">
                                <label class="form-label">Output</label>
                                <div class="model-output" style="height: 200px; overflow-y: auto; padding: 10px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                                    <!-- Output will appear here -->
                                </div>
                                <div class="output-actions mt-2">
                                    <button class="btn btn-sm btn-outline-secondary copy-output">
                                        <i class="fas fa-copy"></i> Copy
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary download-output">
                                        <i class="fas fa-download"></i> Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="model-controls mt-3">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="model-parameters">
                                    ${this.generateModelParametersHTML(model.parameters)}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="model-actions">
                                    <button class="btn btn-primary w-100 generate-btn">
                                        <i class="fas fa-play"></i> Generate
                                    </button>
                                    ${model.loaded ? `
                                    <button class="btn btn-outline-secondary w-100 mt-2 unload-btn">
                                        <i class="fas fa-stop"></i> Unload Model
                                    </button>
                                    ` : `
                                    <button class="btn btn-outline-success w-100 mt-2 load-btn">
                                        <i class="fas fa-download"></i> Load Model
                                    </button>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="model-footer">
                    <div class="model-stats">
                        <div class="stat">
                            <span class="stat-label">Tokens:</span>
                            <span class="stat-value">0</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value">0s</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Cost:</span>
                            <span class="stat-value">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const element = document.createElement('div');
        element.innerHTML = interfaceHTML;
        
        // Add event listeners
        const interfaceElement = element.firstElementChild;
        const generateBtn = interfaceElement.querySelector('.generate-btn');
        const loadBtn = interfaceElement.querySelector('.load-btn');
        const unloadBtn = interfaceElement.querySelector('.unload-btn');
        const clearInputBtn = interfaceElement.querySelector('.clear-input');
        const copyOutputBtn = interfaceElement.querySelector('.copy-output');
        const loadExampleBtn = interfaceElement.querySelector('.load-example');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                const input = interfaceElement.querySelector('.model-input').value;
                if (options.onGenerate) {
                    options.onGenerate(model.id, input, this.getParameterValues(interfaceElement));
                }
            });
        }
        
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                if (options.onLoadModel) {
                    options.onLoadModel(model.id);
                }
            });
        }
        
        if (unloadBtn) {
            unloadBtn.addEventListener('click', () => {
                if (options.onUnloadModel) {
                    options.onUnloadModel(model.id);
                }
            });
        }
        
        if (clearInputBtn) {
            clearInputBtn.addEventListener('click', () => {
                interfaceElement.querySelector('.model-input').value = '';
            });
        }
        
        if (copyOutputBtn) {
            copyOutputBtn.addEventListener('click', () => {
                const output = interfaceElement.querySelector('.model-output').textContent;
                navigator.clipboard.writeText(output);
                this.showToast('Output copied to clipboard', 'success');
            });
        }
        
        if (loadExampleBtn && model.examples && model.examples.length > 0) {
            loadExampleBtn.addEventListener('click', () => {
                const example = model.examples[Math.floor(Math.random() * model.examples.length)];
                interfaceElement.querySelector('.model-input').value = example;
            });
        }
        
        const interfaceObj = {
            element: interfaceElement,
            updateOutput: (output) => {
                const outputElement = interfaceElement.querySelector('.model-output');
                outputElement.textContent = output;
                outputElement.scrollTop = outputElement.scrollHeight;
            },
            updateStats: (stats) => {
                const statsElement = interfaceElement.querySelector('.model-stats');
                if (stats.tokens) {
                    statsElement.querySelector('.stat:nth-child(1) .stat-value').textContent = stats.tokens;
                }
                if (stats.time) {
                    statsElement.querySelector('.stat:nth-child(2) .stat-value').textContent = `${stats.time}s`;
                }
                if (stats.cost) {
                    statsElement.querySelector('.stat:nth-child(3) .stat-value').textContent = `$${stats.cost.toFixed(4)}`;
                }
            },
            setLoading: (loading) => {
                const generateBtn = interfaceElement.querySelector('.generate-btn');
                if (generateBtn) {
                    generateBtn.disabled = loading;
                    generateBtn.innerHTML = loading ? 
                        '<i class="fas fa-spinner fa-spin"></i> Generating...' : 
                        '<i class="fas fa-play"></i> Generate';
                }
            },
            dispose: () => {
                interfaceElement.remove();
            }
        };
        
        return interfaceObj;
    }
    
    // Utility methods
    generateModelParametersHTML(parameters) {
        if (!parameters || parameters.length === 0) {
            return '<p class="text-muted">No parameters available for this model.</p>';
        }
        
        return parameters.map(param => `
            <div class="mb-2">
                <label class="form-label">${param.label}</label>
                ${this.generateParameterControlHTML(param)}
                ${param.description ? `<small class="form-text text-muted">${param.description}</small>` : ''}
            </div>
        `).join('');
    }
    
    generateParameterControlHTML(param) {
        switch (param.type) {
            case 'range':
                return `
                    <div class="d-flex align-items-center">
                        <input type="range" class="form-range" 
                               id="${param.id}" 
                               min="${param.min || 0}" 
                               max="${param.max || 100}" 
                               step="${param.step || 1}" 
                               value="${param.default || param.min || 0}">
                        <span class="ms-2 parameter-value">${param.default || param.min || 0}</span>
                    </div>
                `;
                
            case 'select':
                return `
                    <select class="form-select" id="${param.id}">
                        ${param.options.map(opt => `
                            <option value="${opt.value}" ${opt.value === param.default ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                `;
                
            case 'checkbox':
                return `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" 
                               id="${param.id}" ${param.default ? 'checked' : ''}>
                        <label class="form-check-label" for="${param.id}">
                            ${param.label}
                        </label>
                    </div>
                `;
                
            case 'number':
                return `
                    <input type="number" class="form-control" 
                           id="${param.id}" 
                           min="${param.min || ''}" 
                           max="${param.max || ''}" 
                           step="${param.step || 1}" 
                           value="${param.default || ''}">
                `;
                
            default:
                return `
                    <input type="text" class="form-control" 
                           id="${param.id}" 
                           value="${param.default || ''}">
                `;
        }
    }
    
    getParameterValues(interfaceElement) {
        const parameters = {};
        const paramElements = interfaceElement.querySelectorAll('[id^="param-"]');
        
        paramElements.forEach(element => {
            const paramId = element.id;
            let value;
            
            if (element.type === 'checkbox') {
                value = element.checked;
            } else if (element.type === 'range') {
                value = parseFloat(element.value);
            } else if (element.type === 'number') {
                value = parseFloat(element.value);
            } else {
                value = element.value;
            }
            
            parameters[paramId] = value;
        });
        
        return parameters;
    }
    
    addTerminalOutput(outputElement, text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        outputElement.appendChild(line);
    }
    
    initializeSyntaxHighlighting(element, language) {
        // This is a simplified version - in production, use a library like Prism.js or Highlight.js
        element.className = `code-content language-${language}`;
    }
    
    // Initialize Bootstrap components
    initializeTooltips(container = document) {
        const tooltipTriggerList = container.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
    
    initializePopovers(container = document) {
        const popoverTriggerList = container.querySelectorAll('[data-bs-toggle="popover"]');
        [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    }
    
    initializeDropdowns(container = document) {
        const dropdownTriggerList = container.querySelectorAll('[data-bs-toggle="dropdown"]');
        [...dropdownTriggerList].map(dropdownTriggerEl => new bootstrap.Dropdown(dropdownTriggerEl));
    }
    
    initializeModals() {
        const modalElements = document.querySelectorAll('.modal');
        modalElements.forEach(modalEl => {
            const modal = new bootstrap.Modal(modalEl);
            const modalId = modalEl.id;
            if (modalId) {
                this.modals.set(modalId, modal);
            }
        });
    }
    
    initializeAccordions(container = document) {
        const accordionElements = container.querySelectorAll('.accordion');
        accordionElements.forEach(accordionEl => {
            const accordion = new bootstrap.Collapse(accordionEl, {
                toggle: false
            });
        });
    }
    
    initializeTabs(container = document) {
        const tabElements = container.querySelectorAll('[data-bs-toggle="tab"]');
        tabElements.forEach(tabEl => {
            tabEl.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = new bootstrap.Tab(tabEl);
                tab.show();
            });
        });
    }
    
    initializeScrollSpy(container = document) {
        const scrollSpyElements = container.querySelectorAll('[data-bs-spy="scroll"]');
        scrollSpyElements.forEach(el => {
            new bootstrap.ScrollSpy(el);
        });
    }
    
    initializeCarousels(container = document) {
        const carouselElements = container.querySelectorAll('.carousel');
        carouselElements.forEach(carouselEl => {
            new bootstrap.Carousel(carouselEl);
        });
    }
    
    initializeCharts(container = document) {
        const chartElements = container.querySelectorAll('[data-chart]');
        chartElements.forEach(chartEl => {
            const chartId = chartEl.id || `chart-${Date.now()}`;
            chartEl.id = chartId;
            
            const config = JSON.parse(chartEl.getAttribute('data-chart') || '{}');
            this.createChart(chartId, config);
        });
    }
    
    initializeEditors(container = document) {
        const editorElements = container.querySelectorAll('[data-editor]');
        editorElements.forEach(editorEl => {
            const editorId = editorEl.id || `editor-${Date.now()}`;
            editorEl.id = editorId;
            
            const options = JSON.parse(editorEl.getAttribute('data-editor-options') || '{}');
            options.value = editorEl.value || editorEl.textContent;
            
            this.createCodeEditor(editorId, options);
        });
    }
    
    initializeDatePickers(container = document) {
        const datePickerElements = container.querySelectorAll('[data-datepicker]');
        datePickerElements.forEach(element => {
            // In production, use a datepicker library like flatpickr
            element.type = 'date';
        });
    }
    
    initializeFileUploaders(container = document) {
        const fileUploadElements = container.querySelectorAll('[data-file-upload]');
        fileUploadElements.forEach(element => {
            element.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const event = new CustomEvent('fileSelected', {
                        detail: { file, element }
                    });
                    element.dispatchEvent(event);
                }
            });
        });
    }
    
    initializeColorPickers(container = document) {
        const colorPickerElements = container.querySelectorAll('[data-color-picker]');
        colorPickerElements.forEach(element => {
            element.type = 'color';
        });
    }
    
    initializeRangeSliders(container = document) {
        const rangeSliderElements = container.querySelectorAll('[data-range-slider]');
        rangeSliderElements.forEach(slider => {
            const valueDisplay = slider.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('range-value')) {
                slider.addEventListener('input', () => {
                    valueDisplay.textContent = slider.value;
                });
            }
        });
    }
    
    initializeCodeEditors(container = document) {
        // Already handled by initializeEditors
    }
    
    initializeTerminals(container = document) {
        const terminalElements = container.querySelectorAll('[data-terminal]');
        terminalElements.forEach(terminalEl => {
            const terminalId = terminalEl.id || `terminal-${Date.now()}`;
            terminalEl.id = terminalId;
            
            const options = JSON.parse(terminalEl.getAttribute('data-terminal-options') || '{}');
            this.createTerminal(terminalId, options);
        });
    }
    
    initializeIotControls(container = document) {
        const iotElements = container.querySelectorAll('[data-iot-device]');
        iotElements.forEach(element => {
            const deviceData = JSON.parse(element.getAttribute('data-iot-device') || '{}');
            const options = JSON.parse(element.getAttribute('data-iot-options') || '{}');
            
            const control = this.createIotDeviceControl(deviceData, options);
            element.parentNode.replaceChild(control.element, element);
        });
    }
    
    initializeModelInterfaces(container = document) {
        const modelElements = container.querySelectorAll('[data-model-interface]');
        modelElements.forEach(element => {
            const modelData = JSON.parse(element.getAttribute('data-model-interface') || '{}');
            const options = JSON.parse(element.getAttribute('data-model-options') || '{}');
            
            const interface = this.createModelInterface(modelData, options);
            element.parentNode.replaceChild(interface.element, element);
        });
    }
}

// Initialize components globally
document.addEventListener('DOMContentLoaded', () => {
    window.neurixComponents = new NeurixComponents();
    window.neurixComponents.initialize();
});
