// Enhanced CodeBuddy.ai with Resizable Panels and Default Terminal
console.log('Loading CodeBuddy.ai Enhanced...');

class CodeBuddyApp {
    constructor() {
        this.editor = null;
        this.socket = null;
        this.sessionId = null;
        this.isConnected = false;
        this.currentUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            name: 'You',
            avatar: 'Y'
        };
        this.fileSystem = new Map();
        this.openTabs = new Map();
        this.currentFile = 'src/Main.java';
        this.collaborators = new Map();
        this.aiMessages = [];
        this.peer = null;
        this.localStream = null;
        this.remoteStreams = new Map();
        this.isInCall = false;
        this.editorInitialized = false;
        
        // Resizing state
        this.isResizing = false;
        this.resizeType = null;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        
        console.log('CodeBuddy.ai constructor called');
        this.init();
    }

    async init() {
        console.log('Initializing CodeBuddy.ai Enhanced...');
        try {
            this.initializeFileSystem();
            this.setupEventListeners();
            await this.initializeEditor();
            this.loadSampleCode();
            this.setupWebRTC();
            this.setupResizableHandles();
            this.addWelcomeMessage();
            console.log('CodeBuddy.ai Enhanced initialized successfully!');
        } catch (error) {
            console.error('Error initializing CodeBuddy.ai:', error);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachEventListeners();
            });
        } else {
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        console.log('Attaching event listeners to DOM elements...');
        
        // Connection controls
        this.addEventListenerSafe('connectBtn', 'click', () => {
            console.log('Connect button clicked');
            this.connect();
        });
        
        this.addEventListenerSafe('disconnectBtn', 'click', () => {
            console.log('Disconnect button clicked');
            this.disconnect();
        });

        // AI Chat
        this.addEventListenerSafe('aiChatBtn', 'click', () => {
            console.log('AI Chat button clicked');
            this.openAiChat();
        });
        
        this.addEventListenerSafe('closeAiChat', 'click', () => this.closeAiChat());
        this.addEventListenerSafe('sendAiMessage', 'click', () => this.sendAiMessage());
        
        const aiInput = document.getElementById('aiInput');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendAiMessage();
                }
            });
        }

        // Terminal controls
        this.addEventListenerSafe('clearTerminal', 'click', () => {
            console.log('Clear terminal clicked');
            this.clearTerminal();
        });
        
        this.addEventListenerSafe('minimizeTerminal', 'click', () => {
            console.log('Minimize terminal clicked');
            this.minimizeTerminal();
        });
        
        // Run Code button
        this.addEventListenerSafe('runCodeBtn', 'click', () => {
            console.log('Run Code button clicked');
            this.runCode();
        });

        // File Explorer
        this.addEventListenerSafe('newFileBtn', 'click', () => {
            console.log('New File button clicked');
            this.createNewFile();
        });
        
        this.addEventListenerSafe('newFolderBtn', 'click', () => {
            console.log('New Folder button clicked');
            this.createNewFolder();
        });
        
        this.addEventListenerSafe('refreshBtn', 'click', () => {
            console.log('Refresh button clicked');
            this.refreshFileTree();
        });

        // Chat controls
        this.addEventListenerSafe('sendBtn', 'click', () => {
            console.log('Send message button clicked');
            this.sendMessage();
        });
        
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Video/Audio call controls
        this.addEventListenerSafe('videoCallBtn', 'click', () => {
            console.log('Video call button clicked');
            this.startVideoCall();
        });
        
        this.addEventListenerSafe('audioCallBtn', 'click', () => {
            console.log('Audio call button clicked');
            this.startAudioCall();
        });

        // Collaborator management
        this.addEventListenerSafe('addCollaboratorBtn', 'click', () => {
            console.log('Add collaborator button clicked');
            this.openAddCollaboratorModal();
        });
        
        this.addEventListenerSafe('cancelAddCollaborator', 'click', () => this.closeAddCollaboratorModal());
        this.addEventListenerSafe('confirmAddCollaborator', 'click', () => this.addCollaborator());

        // File tree interactions
        this.setupFileTreeListeners();

        // GitHub export
        this.addEventListenerSafe('githubExport', 'click', () => {
            console.log('GitHub export button clicked');
            this.exportToGitHub();
        });

        // Save functionality
        this.addEventListenerSafe('saveBtn', 'click', () => {
            console.log('Save button clicked');
            this.saveSession();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        console.log('All event listeners attached successfully');
    }

    addEventListenerSafe(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            console.log(`✅ Event listener added for ${elementId}`);
        } else {
            console.warn(`❌ Element ${elementId} not found`);
        }
    }

    // Resizable Panels Setup
    setupResizableHandles() {
        console.log('Setting up resizable handles...');
        
        // Left sidebar resize handle
        const leftHandle = document.getElementById('leftResizeHandle');
        if (leftHandle) {
            leftHandle.addEventListener('mousedown', (e) => this.startResize(e, 'left'));
        }

        // Right sidebar resize handle
        const rightHandle = document.getElementById('rightResizeHandle');
        if (rightHandle) {
            rightHandle.addEventListener('mousedown', (e) => this.startResize(e, 'right'));
        }

        // Terminal resize handle
        const terminalHandle = document.getElementById('terminalResizeHandle');
        if (terminalHandle) {
            terminalHandle.addEventListener('mousedown', (e) => this.startResize(e, 'terminal'));
        }

        // Global mouse events for resizing
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        
        console.log('Resizable handles setup complete');
    }

    startResize(e, type) {
        console.log('Starting resize:', type);
        e.preventDefault();
        
        this.isResizing = true;
        this.resizeType = type;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        const fileExplorer = document.getElementById('fileExplorer');
        const chatPanel = document.getElementById('chatPanel');
        const terminalPanel = document.getElementById('terminalPanel');
        
        if (type === 'left' && fileExplorer) {
            this.startWidth = fileExplorer.offsetWidth;
        } else if (type === 'right' && chatPanel) {
            this.startWidth = chatPanel.offsetWidth;
        } else if (type === 'terminal' && terminalPanel) {
            this.startHeight = terminalPanel.offsetHeight;
        }
        
        document.body.classList.add('resizing');
        document.body.style.cursor = type === 'terminal' ? 'ns-resize' : 'ew-resize';
    }

    handleResize(e) {
        if (!this.isResizing) return;
        
        const fileExplorer = document.getElementById('fileExplorer');
        const chatPanel = document.getElementById('chatPanel');
        const terminalPanel = document.getElementById('terminalPanel');
        
        if (this.resizeType === 'left' && fileExplorer) {
            const deltaX = e.clientX - this.startX;
            const newWidth = Math.max(200, Math.min(400, this.startWidth + deltaX));
            fileExplorer.style.width = newWidth + 'px';
            
        } else if (this.resizeType === 'right' && chatPanel) {
            const deltaX = this.startX - e.clientX;
            const newWidth = Math.max(250, Math.min(500, this.startWidth + deltaX));
            chatPanel.style.width = newWidth + 'px';
            
        } else if (this.resizeType === 'terminal' && terminalPanel) {
            const deltaY = this.startY - e.clientY;
            const newHeight = Math.max(100, Math.min(400, this.startHeight + deltaY));
            terminalPanel.style.height = newHeight + 'px';
        }
        
        // Trigger editor resize
        if (this.editor) {
            setTimeout(() => this.editor.layout(), 0);
        }
    }

    stopResize() {
        if (!this.isResizing) return;
        
        console.log('Stopping resize');
        this.isResizing = false;
        this.resizeType = null;
        
        document.body.classList.remove('resizing');
        document.body.style.cursor = '';
        
        // Final editor layout
        if (this.editor) {
            setTimeout(() => this.editor.layout(), 100);
        }
    }

    async initializeEditor() {
        console.log('Initializing Monaco Editor...');
        
        if (this.editorInitialized) {
            console.log('Editor already initialized');
            return;
        }

        return new Promise((resolve, reject) => {
            if (window.monaco) {
                console.log('Monaco already available');
                this.createEditor();
                resolve();
                return;
            }

            if (typeof require !== 'undefined') {
                console.log('Using existing require');
                require.config({ 
                    paths: { 
                        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
                    } 
                });
                
                require(['vs/editor/editor.main'], () => {
                    console.log('Monaco editor main loaded via existing require');
                    this.createEditor();
                    resolve();
                });
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
            script.onload = () => {
                console.log('Monaco loader loaded');
                
                require.config({ 
                    paths: { 
                        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
                    } 
                });
                
                require(['vs/editor/editor.main'], () => {
                    console.log('Monaco editor main loaded');
                    this.createEditor();
                    resolve();
                });
            };
            script.onerror = (error) => {
                console.error('Failed to load Monaco Editor:', error);
                reject(error);
            };
            
            if (!document.querySelector('script[src*="monaco-editor"]')) {
                document.head.appendChild(script);
            }
        });
    }

    createEditor() {
        const editorElement = document.getElementById('editor');
        if (!editorElement) {
            console.error('Editor element not found');
            return;
        }

        if (this.editor) {
            console.log('Disposing existing editor');
            this.editor.dispose();
            this.editor = null;
        }

        editorElement.innerHTML = '';

        try {
            console.log('Creating new Monaco editor instance');
            this.editor = monaco.editor.create(editorElement, {
                value: '',
                language: 'java',
                theme: 'vs-dark',
                fontSize: 14,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible'
                },
                wordWrap: 'on',
                contextmenu: true,
                mouseWheelZoom: true,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection'
            });

            this.editor.onDidChangeModelContent((e) => {
                if (this.isConnected && this.socket) {
                    this.sendCodeChange();
                }
                this.saveFileContent();
            });

            this.editor.onDidChangeCursorPosition((e) => {
                if (this.isConnected && this.socket) {
                    this.sendCursorPosition(e.position);
                }
            });

            this.editorInitialized = true;
            console.log('Monaco Editor created successfully');
        } catch (error) {
            console.error('Error creating Monaco Editor:', error);
            this.editorInitialized = false;
        }
    }

    setupFileTreeListeners() {
        const fileTree = document.getElementById('fileTree');
        
        if (fileTree) {
            fileTree.addEventListener('click', (e) => {
                const treeItem = e.target.closest('.tree-item');
                if (!treeItem) return;

                const action = e.target.closest('.item-action');
                if (action) {
                    e.stopPropagation();
                    this.handleFileAction(action, treeItem);
                    return;
                }

                if (treeItem.classList.contains('file')) {
                    console.log('File clicked:', treeItem.dataset.path);
                    this.openFile(treeItem.dataset.path);
                } else if (treeItem.classList.contains('folder')) {
                    console.log('Folder clicked:', treeItem.dataset.path);
                    this.toggleFolder(treeItem);
                }
            });
        }
    }

    handleFileAction(actionBtn, treeItem) {
        const action = actionBtn.title.toLowerCase();
        const path = treeItem.dataset.path;

        console.log('File action:', action, 'on', path);

        switch (action) {
            case 'add file':
                this.createNewFile(path);
                break;
            case 'rename':
                this.renameItem(path);
                break;
            case 'delete':
                this.deleteItem(path);
                break;
        }
    }

    initializeFileSystem() {
        this.fileSystem.set('src/', { type: 'folder', children: ['src/Main.java', 'src/Utils.java'] });
        this.fileSystem.set('src/Main.java', { type: 'file', content: '', language: 'java' });
        this.fileSystem.set('src/Utils.java', { type: 'file', content: '', language: 'java' });
        this.fileSystem.set('README.md', { type: 'file', content: '', language: 'markdown' });
        console.log('File system initialized');
    }

    loadSampleCode() {
        const sampleCode = `package com.codebuddy.example;

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Welcome to CodeBuddy.ai Enhanced!");
        
        // Example: Simple calculator
        int a = 10;
        int b = 5;
        
        System.out.println("Addition: " + (a + b));
        System.out.println("Subtraction: " + (a - b));
        System.out.println("Multiplication: " + (a * b));
        System.out.println("Division: " + (a / b));
        
        // Example: Array processing
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        
        for (int num : numbers) {
            sum += num;
        }
        
        System.out.println("Sum of array: " + sum);
        System.out.println("Average: " + (sum / numbers.length));
        
        // Example: String manipulation
        String message = "CodeBuddy.ai is awesome!";
        System.out.println("Message: " + message);
        System.out.println("Length: " + message.length());
        System.out.println("Uppercase: " + message.toUpperCase());
    }
}`;
        
        this.fileSystem.set('src/Main.java', { 
            type: 'file', 
            content: sampleCode, 
            language: 'java' 
        });
        
        if (this.editor) {
            this.editor.setValue(sampleCode);
        }
        
        console.log('Sample code loaded');
    }

    // Terminal Methods
    addWelcomeMessage() {
        this.addTerminalOutput('🚀 Welcome to CodeBuddy.ai Enhanced Terminal!', 'success');
        this.addTerminalOutput('💡 Features: Resizable panels, real-time collaboration, AI assistance', 'info');
        this.addTerminalOutput('⚡ Ready to execute Java, Python, JavaScript, and C++ code', 'info');
        this.addTerminalOutput('📝 Use Ctrl+R or click "Run" to execute your program', 'info');
        this.addTerminalOutput('─'.repeat(60), 'info');
    }

    clearTerminal() {
        console.log('clearTerminal called');
        const terminalOutput = document.getElementById('terminalOutput');
        if (terminalOutput) {
            terminalOutput.innerHTML = '';
            this.addTerminalOutput('Terminal cleared.', 'info');
            console.log('Terminal cleared');
        }
    }

    minimizeTerminal() {
        console.log('minimizeTerminal called');
        const terminalPanel = document.getElementById('terminalPanel');
        if (terminalPanel) {
            const currentHeight = terminalPanel.offsetHeight;
            if (currentHeight > 50) {
                terminalPanel.style.height = '35px';
                this.addTerminalOutput('Terminal minimized. Click to restore.', 'info');
            } else {
                terminalPanel.style.height = '200px';
                this.addTerminalOutput('Terminal restored.', 'info');
            }
            
            // Trigger editor resize
            if (this.editor) {
                setTimeout(() => this.editor.layout(), 100);
            }
        }
    }

    addTerminalOutput(text, type = 'info') {
        const terminalOutput = document.getElementById('terminalOutput');
        if (terminalOutput) {
            const outputLine = document.createElement('div');
            outputLine.className = `output-line ${type}`;
            
            // Add timestamp for better debugging
            const timestamp = new Date().toLocaleTimeString();
            outputLine.textContent = `[${timestamp}] ${text}`;
            
            terminalOutput.appendChild(outputLine);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            console.log('Added terminal output:', text, type);
        } else {
            console.error('Terminal output element not found');
        }
    }

    // Enhanced Run Code Method
    async runCode() {
        console.log('runCode called - Enhanced version with terminal');
        
        if (!this.editor || !this.editorInitialized) {
            console.error('Editor not ready');
            this.showNotification('Editor not ready. Please wait for initialization.', 'warning');
            return;
        }

        const code = this.editor.getValue();
        if (!code.trim()) {
            console.log('No code to execute');
            this.showNotification('No code to execute', 'warning');
            this.addTerminalOutput('❌ No code to execute', 'error');
            return;
        }

        console.log('Code to execute:', code.substring(0, 100) + '...');

        // Get language and filename
        const file = this.fileSystem.get(this.currentFile);
        const language = file ? file.language : 'java';
        const filename = this.currentFile ? this.currentFile.split('/').pop().split('.')[0] : 'Main';

        console.log('Executing with language:', language, 'filename:', filename);

        this.addTerminalOutput(`▶ Executing ${language} code (${filename})...`, 'info');
        this.addTerminalOutput('─'.repeat(60), 'info');

        try {
            console.log('Making API request to /api/code/execute');
            
            const response = await fetch('/api/code/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    filename: filename
                })
            });

            console.log('API response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API response result:', result);

            if (result.success) {
                if (result.output && result.output.trim()) {
                    this.addTerminalOutput('📤 Program Output:', 'info');
                    // Split output into lines and add each line
                    result.output.split('\n').forEach(line => {
                        if (line.trim()) {
                            this.addTerminalOutput(line, 'success');
                        }
                    });
                } else {
                    this.addTerminalOutput('✅ Program executed successfully (no output)', 'success');
                }
                
                if (result.error && result.error.trim()) {
                    this.addTerminalOutput('⚠️ Warnings/Errors:', 'warning');
                    result.error.split('\n').forEach(line => {
                        if (line.trim()) {
                            this.addTerminalOutput(line, 'warning');
                        }
                    });
                }
                
                this.addTerminalOutput(`⏱️ Execution completed in ${result.executionTime}ms`, 'info');
                this.showNotification('Code executed successfully!', 'success');
            } else {
                this.addTerminalOutput('❌ Execution failed:', 'error');
                this.addTerminalOutput(result.error || 'Unknown error', 'error');
                this.showNotification('Code execution failed', 'error');
            }

        } catch (error) {
            console.error('Code execution error:', error);
            this.addTerminalOutput('🔌 Network/Connection Error:', 'error');
            this.addTerminalOutput(error.message, 'error');
            this.addTerminalOutput('Please check if the server is running on port 3000', 'error');
            this.showNotification(`Execution error: ${error.message}`, 'error');
        }

        this.addTerminalOutput('─'.repeat(60), 'info');
    }

    // File Management Methods
    createNewFile(parentPath = '') {
        const fileName = prompt('Enter file name:');
        if (!fileName) return;

        const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
        const language = this.getLanguageFromExtension(fileName);
        
        this.fileSystem.set(fullPath, {
            type: 'file',
            content: '',
            language: language
        });

        this.refreshFileTree();
        this.openFile(fullPath);
        this.showNotification(`Created file: ${fileName}`, 'success');
        this.addTerminalOutput(`📄 Created new file: ${fileName}`, 'info');
    }

    createNewFolder() {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        this.fileSystem.set(`${folderName}/`, {
            type: 'folder',
            children: []
        });

        this.refreshFileTree();
        this.showNotification(`Created folder: ${folderName}`, 'success');
        this.addTerminalOutput(`📁 Created new folder: ${folderName}`, 'info');
    }

    renameItem(path) {
        const currentName = path.split('/').pop();
        const newName = prompt('Enter new name:', currentName);
        if (!newName || newName === currentName) return;

        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const newPath = parentPath ? `${parentPath}/${newName}` : newName;

        const item = this.fileSystem.get(path);
        this.fileSystem.delete(path);
        this.fileSystem.set(newPath, item);

        this.refreshFileTree();
        this.showNotification(`Renamed to: ${newName}`, 'success');
        this.addTerminalOutput(`✏️ Renamed ${currentName} to ${newName}`, 'info');
    }

    deleteItem(path) {
        if (!confirm(`Are you sure you want to delete ${path}?`)) return;

        this.fileSystem.delete(path);
        
        if (this.openTabs.has(path)) {
            this.closeTab(path);
        }

        this.refreshFileTree();
        this.showNotification(`Deleted: ${path}`, 'success');
        this.addTerminalOutput(`🗑️ Deleted: ${path}`, 'warning');
    }

    openFile(path) {
        console.log('Opening file:', path);
        
        const file = this.fileSystem.get(path);
        if (!file || file.type !== 'file') return;

        if (!this.openTabs.has(path)) {
            this.openTabs.set(path, file);
            this.addFileTab(path);
        }

        this.currentFile = path;
        if (this.editor) {
            this.editor.setValue(file.content);
            this.setEditorLanguage(file.language);
        }
        this.updateActiveTab(path);
        this.updateActiveFileInTree(path);
        this.addTerminalOutput(`📂 Opened file: ${path}`, 'info');
    }

    saveFileContent() {
        if (this.currentFile && this.fileSystem.has(this.currentFile) && this.editor) {
            const file = this.fileSystem.get(this.currentFile);
            file.content = this.editor.getValue();
        }
    }

    addFileTab(path) {
        const fileName = path.split('/').pop();
        const icon = this.getFileIcon(fileName);
        
        const tabsContainer = document.getElementById('fileTabs');
        if (!tabsContainer) return;
        
        const tab = document.createElement('div');
        tab.className = 'file-tab';
        tab.dataset.file = path;
        tab.innerHTML = `
            <i class="${icon}"></i>
            <span>${fileName}</span>
            <button class="tab-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        tab.addEventListener('click', (e) => {
            if (e.target.closest('.tab-close')) {
                this.closeTab(path);
            } else {
                this.openFile(path);
            }
        });

        tabsContainer.appendChild(tab);
    }

    closeTab(path) {
        this.openTabs.delete(path);
        const tab = document.querySelector(`[data-file="${path}"]`);
        if (tab) tab.remove();

        if (this.currentFile === path) {
            const remainingTabs = Array.from(this.openTabs.keys());
            if (remainingTabs.length > 0) {
                this.openFile(remainingTabs[0]);
            } else {
                if (this.editor) {
                    this.editor.setValue('');
                }
                this.currentFile = null;
            }
        }
    }

    updateActiveTab(path) {
        document.querySelectorAll('.file-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.file === path);
        });
    }

    updateActiveFileInTree(path) {
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.toggle('active', item.dataset.path === path);
        });
    }

    refreshFileTree() {
        const fileTree = document.getElementById('fileTree');
        if (!fileTree) return;
        
        fileTree.innerHTML = '';

        const items = Array.from(this.fileSystem.entries()).sort((a, b) => {
            const [pathA, itemA] = a;
            const [pathB, itemB] = b;
            
            if (itemA.type === 'folder' && itemB.type === 'file') return -1;
            if (itemA.type === 'file' && itemB.type === 'folder') return 1;
            
            return pathA.localeCompare(pathB);
        });

        items.forEach(([path, item]) => {
            const treeItem = this.createTreeItem(path, item);
            fileTree.appendChild(treeItem);
        });
    }

    createTreeItem(path, item) {
        const div = document.createElement('div');
        div.className = `tree-item ${item.type}`;
        div.dataset.path = path;

        const name = path.split('/').pop() || path;
        const icon = item.type === 'folder' ? 'fas fa-folder folder-icon' : this.getFileIcon(name);

        div.innerHTML = `
            <i class="tree-icon ${icon}"></i>
            <span>${name}</span>
            <div class="tree-item-actions">
                ${item.type === 'folder' ? '<button class="item-action" title="Add File"><i class="fas fa-plus"></i></button>' : ''}
                <button class="item-action" title="Rename"><i class="fas fa-edit"></i></button>
                <button class="item-action" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;

        return div;
    }

    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'java': 'fab fa-java file-icon',
            'js': 'fab fa-js file-icon',
            'ts': 'fab fa-js file-icon',
            'py': 'fab fa-python file-icon',
            'html': 'fab fa-html5 file-icon',
            'css': 'fab fa-css3 file-icon',
            'md': 'fab fa-markdown file-icon',
            'json': 'fas fa-code file-icon',
            'xml': 'fas fa-code file-icon',
            'cpp': 'fas fa-code file-icon',
            'c': 'fas fa-code file-icon'
        };
        return iconMap[ext] || 'fas fa-file file-icon';
    }

    getLanguageFromExtension(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const langMap = {
            'java': 'java',
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'md': 'markdown',
            'json': 'json',
            'xml': 'xml',
            'cpp': 'cpp',
            'c': 'c'
        };
        return langMap[ext] || 'plaintext';
    }

    setEditorLanguage(language) {
        if (this.editor && window.monaco) {
            const model = this.editor.getModel();
            monaco.editor.setModelLanguage(model, language);
        }
    }

    // AI Chat Methods
    openAiChat() {
        console.log('Opening AI Chat');
        const modal = document.getElementById('aiChatModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeAiChat() {
        const modal = document.getElementById('aiChatModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async sendAiMessage() {
        const input = document.getElementById('aiInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;

        console.log('Sending AI message:', message);

        this.addAiMessage('user', message);
        input.value = '';

        const loadingId = this.addAiMessage('assistant', 'Thinking...', true);

        try {
            const currentCode = this.editor ? this.editor.getValue() : '';
            const context = currentCode ? `Current code:\n\`\`\`${this.getCurrentLanguage()}\n${currentCode}\n\`\`\`` : '';
            
            const response = await this.callAI(message, context);
            
            this.removeAiMessage(loadingId);
            this.addAiMessage('assistant', response);
            
        } catch (error) {
            this.removeAiMessage(loadingId);
            this.addAiMessage('assistant', `Sorry, I encountered an error: ${error.message}`);
        }
    }

    async callAI(message, context = '') {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                context: context,
                sessionId: this.sessionId,
                userId: this.currentUser.id
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    }

    addAiMessage(role, content, isLoading = false) {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        const messageId = 'msg-' + Date.now();
        
        messageDiv.id = messageId;
        messageDiv.className = `ai-message ${role} fade-in`;
        
        const icon = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const roleText = role === 'user' ? 'You' : 'AI Assistant';
        
        messageDiv.innerHTML = `
            <div class="ai-message-header">
                <i class="${icon}"></i>
                <span class="ai-message-role ${role}">${roleText}</span>
            </div>
            <div class="ai-message-content">${isLoading ? this.getLoadingHTML() : this.formatAiContent(content)}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageId;
    }

    removeAiMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) message.remove();
    }

    formatAiContent(content) {
        return content
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    getLoadingHTML() {
        return `
            <div class="loading">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
                <span style="margin-left: 12px;">Thinking...</span>
            </div>
        `;
    }

    getCurrentLanguage() {
        if (!this.currentFile) return 'plaintext';
        const file = this.fileSystem.get(this.currentFile);
        return file ? file.language : 'plaintext';
    }

    // WebRTC Video/Audio Call Methods
    setupWebRTC() {
        this.checkWebRTCSupport();
    }

    checkWebRTCSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('WebRTC not supported in this browser');
            const videoBtn = document.getElementById('videoCallBtn');
            const audioBtn = document.getElementById('audioCallBtn');
            if (videoBtn) videoBtn.disabled = true;
            if (audioBtn) audioBtn.disabled = true;
        }
    }

    async startVideoCall() {
        if (this.isInCall) {
            this.showNotification('Already in a call', 'warning');
            return;
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            this.isInCall = true;
            this.updateCallButtons();
            this.showNotification('Video call started', 'success');
            this.addTerminalOutput('📹 Video call started', 'info');
            
            if (this.socket) {
                this.socket.emit('call-start', {
                    sessionId: this.sessionId,
                    userId: this.currentUser.id,
                    type: 'video'
                });
            }

        } catch (error) {
            console.error('Error starting video call:', error);
            this.showNotification('Failed to start video call', 'error');
            this.addTerminalOutput('❌ Failed to start video call', 'error');
        }
    }

    async startAudioCall() {
        if (this.isInCall) {
            this.showNotification('Already in a call', 'warning');
            return;
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });

            this.isInCall = true;
            this.updateCallButtons();
            this.showNotification('Audio call started', 'success');
            this.addTerminalOutput('🎤 Audio call started', 'info');
            
            if (this.socket) {
                this.socket.emit('call-start', {
                    sessionId: this.sessionId,
                    userId: this.currentUser.id,
                    type: 'audio'
                });
            }

        } catch (error) {
            console.error('Error starting audio call:', error);
            this.showNotification('Failed to start audio call', 'error');
            this.addTerminalOutput('❌ Failed to start audio call', 'error');
        }
    }

    updateCallButtons() {
        const videoBtn = document.getElementById('videoCallBtn');
        const audioBtn = document.getElementById('audioCallBtn');
        
        if (videoBtn) videoBtn.classList.toggle('active', this.isInCall);
        if (audioBtn) audioBtn.classList.toggle('active', this.isInCall);
    }

    // Collaborator Management
    openAddCollaboratorModal() {
        const modal = document.getElementById('addCollaboratorModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeAddCollaboratorModal() {
        const modal = document.getElementById('addCollaboratorModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        const collaboratorId = document.getElementById('collaboratorId');
        const permissionLevel = document.getElementById('permissionLevel');
        
        if (collaboratorId) collaboratorId.value = '';
        if (permissionLevel) permissionLevel.value = 'edit';
    }

    async addCollaborator() {
        const collaboratorIdInput = document.getElementById('collaboratorId');
        const permissionLevelInput = document.getElementById('permissionLevel');
        
        if (!collaboratorIdInput || !permissionLevelInput) return;
        
        const collaboratorId = collaboratorIdInput.value.trim();
        const permissionLevel = permissionLevelInput.value;

        if (!collaboratorId) {
            this.showNotification('Please enter a collaborator ID', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/collaborators/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    collaboratorId: collaboratorId,
                    permissionLevel: permissionLevel
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(result.message, 'success');
                this.addTerminalOutput(`👥 Added collaborator: ${collaboratorId}`, 'info');
                this.closeAddCollaboratorModal();
                this.updateCollaboratorsList();
            } else {
                const error = await response.json();
                this.showNotification(`Failed to add collaborator: ${error.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error adding collaborator: ${error.message}`, 'error');
        }
    }

    updateCollaboratorsList() {
        // Implementation would update the collaborators list
    }

    // Connection and Communication Methods
    connect() {
        const sessionIdInput = document.getElementById('sessionId');
        if (!sessionIdInput) return;
        
        this.sessionId = sessionIdInput.value.trim();
        
        if (!this.sessionId) {
            this.showNotification('Please enter a session ID', 'error');
            return;
        }

        console.log('Connecting to session:', this.sessionId);

        try {
            if (typeof io === 'undefined') {
                console.error('Socket.IO not loaded');
                this.showNotification('Socket.IO not available', 'error');
                return;
            }

            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Socket connected');
                this.socket.emit('join-session', {
                    sessionId: this.sessionId,
                    userId: this.currentUser.id,
                    username: this.currentUser.name
                });
            });

            this.socket.on('session-joined', (data) => {
                console.log('Session joined:', data);
                this.isConnected = true;
                this.updateConnectionStatus(true, 'Connected');
                this.showNotification(`Connected to session: ${this.sessionId}`, 'success');
                this.addTerminalOutput(`🔗 Connected to session: ${this.sessionId}`, 'success');
            });

            this.socket.on('user-joined', (data) => {
                this.addChatMessage('System', `${data.username} joined the session`, new Date(), false, 'system');
                this.addTerminalOutput(`👋 ${data.username} joined the session`, 'info');
            });

            this.socket.on('user-left', (data) => {
                this.addChatMessage('System', `${data.username} left the session`, new Date(), false, 'system');
                this.addTerminalOutput(`👋 ${data.username} left the session`, 'warning');
            });

            this.socket.on('code-change', (data) => {
                if (data.userId !== this.currentUser.id) {
                    this.handleRemoteCodeChange(data);
                }
            });

            this.socket.on('chat-message', (data) => {
                if (data.userId !== this.currentUser.id) {
                    this.addChatMessage(data.username, data.message, new Date(data.timestamp), false);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
                this.isConnected = false;
                this.updateConnectionStatus(false, 'Disconnected');
                this.showNotification('Disconnected from session', 'warning');
                this.addTerminalOutput('🔌 Disconnected from session', 'warning');
            });

        } catch (error) {
            console.error('Connection error:', error);
            this.showNotification('Failed to connect to session', 'error');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.isConnected = false;
        this.updateConnectionStatus(false, 'Disconnected');
        this.showNotification('Disconnected from session', 'info');
        this.addTerminalOutput('🔌 Manually disconnected from session', 'info');
    }

    updateConnectionStatus(connected, statusText) {
        const statusElement = document.getElementById('connectionStatus');
        const statusTextElement = document.getElementById('statusText');
        
        if (statusElement) {
            statusElement.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
        }
        
        if (statusTextElement) {
            statusTextElement.textContent = statusText;
        }
        
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const sessionIdInput = document.getElementById('sessionId');
        
        if (connectBtn) connectBtn.disabled = connected;
        if (disconnectBtn) disconnectBtn.disabled = !connected;
        if (sessionIdInput) sessionIdInput.disabled = connected;
    }

    sendCodeChange() {
        if (!this.isConnected || !this.socket || !this.editor) return;
        
        this.socket.emit('code-change', {
            sessionId: this.sessionId,
            userId: this.currentUser.id,
            filename: this.currentFile,
            content: this.editor.getValue(),
            timestamp: Date.now()
        });
    }

    sendCursorPosition(position) {
        if (!this.isConnected || !this.socket) return;
        
        this.socket.emit('cursor-position', {
            sessionId: this.sessionId,
            userId: this.currentUser.id,
            position: position,
            timestamp: Date.now()
        });
    }

    handleRemoteCodeChange(data) {
        if (data.filename === this.currentFile && this.editor) {
            const currentPosition = this.editor.getPosition();
            this.editor.setValue(data.content);
            this.editor.setPosition(currentPosition);
        }
        
        if (this.fileSystem.has(data.filename)) {
            const file = this.fileSystem.get(data.filename);
            file.content = data.content;
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;
        
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        console.log('Sending message:', content);
        
        this.addChatMessage(this.currentUser.name, content, new Date(), true);
        messageInput.value = '';
        
        if (this.isConnected && this.socket) {
            this.socket.emit('chat-message', {
                sessionId: this.sessionId,
                userId: this.currentUser.id,
                username: this.currentUser.name,
                message: content,
                timestamp: Date.now()
            });
        }
    }

    addChatMessage(username, content, timestamp, isOwn, type = 'user') {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message fade-in ${isOwn ? 'own' : ''}`;
        
        if (type === 'system') {
            messageDiv.style.background = 'rgba(78, 205, 196, 0.2)';
            messageDiv.style.border = '1px solid rgba(78, 205, 196, 0.3)';
        }
        
        const timeStr = timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-username">${username}</span>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Utility Methods
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveSession();
                    break;
                case 'n':
                    e.preventDefault();
                    this.createNewFile();
                    break;
                case 'r':
                    e.preventDefault();
                    this.runCode();
                    break;
                case '`':
                    e.preventDefault();
                    this.minimizeTerminal();
                    break;
            }
        }
    }

    saveSession() {
        this.saveFileContent();
        this.showNotification('Session saved successfully!', 'success');
        this.addTerminalOutput('💾 Session saved successfully', 'success');
    }

    async exportToGitHub() {
        if (!this.sessionId) {
            this.showNotification('Please connect to a session first', 'warning');
            return;
        }

        const repoName = prompt('Enter GitHub repository name:');
        if (!repoName) return;

        const accessToken = prompt('Enter your GitHub access token:');
        if (!accessToken) return;

        this.addTerminalOutput(`📤 Exporting to GitHub repository: ${repoName}`, 'info');

        try {
            const response = await fetch('/api/github/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    repoName: repoName,
                    accessToken: accessToken,
                    files: Object.fromEntries(
                        Array.from(this.fileSystem.entries())
                            .filter(([path, item]) => item.type === 'file')
                            .map(([path, item]) => [path, item.content])
                    )
                })
            });

            const result = await response.json();
            if (response.ok) {
                this.showNotification(`Successfully exported to GitHub: ${result.url}`, 'success');
                this.addTerminalOutput(`✅ Successfully exported to GitHub: ${result.url}`, 'success');
            } else {
                this.showNotification(`Export failed: ${result.error}`, 'error');
                this.addTerminalOutput(`❌ Export failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Export failed: ${error.message}`, 'error');
            this.addTerminalOutput(`❌ Export failed: ${error.message}`, 'error');
        }
    }

    showNotification(message, type = 'info') {
        console.log('Notification:', type, message);
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(20px);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        const colors = {
            success: 'linear-gradient(45deg, #4caf50, #45a049)',
            error: 'linear-gradient(45deg, #f44336, #d32f2f)',
            warning: 'linear-gradient(45deg, #ff9800, #f57c00)',
            info: 'linear-gradient(45deg, #2196f3, #1976d2)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the application
console.log('Setting up DOMContentLoaded listener...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing CodeBuddy.ai Enhanced...');
    try {
        window.codeBuddyApp = new CodeBuddyApp();
        console.log('✅ CodeBuddy.ai Enhanced initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize CodeBuddy.ai:', error);
    }
});

if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded...');
} else {
    console.log('DOM already loaded, initializing immediately...');
    try {
        window.codeBuddyApp = new CodeBuddyApp();
        console.log('✅ CodeBuddy.ai Enhanced initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize CodeBuddy.ai:', error);
    }
}