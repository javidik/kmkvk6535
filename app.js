// ========== УПРАВЛЕНИЕ ДАННЫМИ И СОСТОЯНИЕМ ========== 

const AppState = {
    isLoggedIn: false,
    currentUser: null,
    userProgress: {
        tests: [],
        favoriteVuzy: [],
        history: [],
        testResults: {}
    },

    initialize() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
    },

    loadFromLocalStorage() {
        const saved = localStorage.getItem('userState');
        if (saved) {
            const state = JSON.parse(saved);
            this.isLoggedIn = state.isLoggedIn;
            this.currentUser = state.currentUser;
            this.userProgress = state.userProgress;
        }
    },

    saveToLocalStorage() {
        localStorage.setItem('userState', JSON.stringify({
            isLoggedIn: this.isLoggedIn,
            currentUser: this.currentUser,
            userProgress: this.userProgress
        }));
    },

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUI();
        });
    },

    updateUI() {
        const profileBtn = document.getElementById('profileBtn');
        const userMenu = document.getElementById('userMenu');

        if (this.isLoggedIn && profileBtn) {
            profileBtn.textContent = this.currentUser?.name || 'Профиль';
            profileBtn.onclick = () => {
                window.location.href = 'pages/profile.html';
            };
        }
    },

    login(email, password) {
        // Базовая валидация
        if (!email || !password) return false;

        const user = {
            email: email,
            name: email.split('@')[0],
            loginDate: new Date(),
            id: Math.random().toString(36).substr(2, 9)
        };

        this.currentUser = user;
        this.isLoggedIn = true;
        this.saveToLocalStorage();
        return true;
    },

    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.saveToLocalStorage();
        window.location.href = 'index.html';
    },

    addFavoriteVuz(vuzId) {
        if (!this.userProgress.favoriteVuzy.includes(vuzId)) {
            this.userProgress.favoriteVuzy.push(vuzId);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },

    removeFavoriteVuz(vuzId) {
        this.userProgress.favoriteVuzy = this.userProgress.favoriteVuzy.filter(id => id !== vuzId);
        this.saveToLocalStorage();
    },

    isFavoriteVuz(vuzId) {
        return this.userProgress.favoriteVuzy.includes(vuzId);
    },

    saveTestResult(testId, score, answers) {
        this.userProgress.testResults[testId] = {
            score: score,
            date: new Date(),
            answers: answers
        };
        if (!this.userProgress.tests.includes(testId)) {
            this.userProgress.tests.push(testId);
        }
        this.saveToLocalStorage();
    },

    addToHistory(action, details) {
        this.userProgress.history.push({
            action: action,
            details: details,
            timestamp: new Date()
        });
        if (this.userProgress.history.length > 100) {
            this.userProgress.history = this.userProgress.history.slice(-100);
        }
        this.saveToLocalStorage();
    }
};

// ========== УТИЛИТЫ ========== 

const Utils = {
    // Отправка данных AJAX
    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    },

    // Переключение видимости элемента
    toggleElement(element, show = null) {
        if (show === null) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        } else {
            element.style.display = show ? 'block' : 'none';
        }
    },

    // Открытие модали
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    // Закрытие модали
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Валидация email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Форматирование даты
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Создание уведомления
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = \`notification notification-\${type}\`;
        notification.textContent = message;
        notification.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background-color: var(--\${type});
            color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        \`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
};

// ========== УПРАВЛЕНИЕ ВКЛАДКАМИ ========== 

class TabManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.init();
    }

    init() {
        const tabButtons = this.container.querySelectorAll('.tab-btn');
        const tabContents = this.container.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName, tabButtons, tabContents);
            });
        });
    }

    switchTab(tabName, buttons, contents) {
        buttons.forEach(btn => btn.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        event.target.classList.add('active');
        document.querySelector(\`.tab-content[data-tab="\${tabName}"]\`)?.classList.add('active');
    }
}

// ========== УПРАВЛЕНИЕ ФОРМАМИ ========== 

class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        this.setupValidation();
    }

    setupValidation() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validate()) {
                this.handleSubmit();
            }
        });
    }

    validate() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--danger)';
                isValid = false;
            } else {
                input.style.borderColor = 'var(--border)';
            }
        });

        const emailInputs = this.form.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            if (input.value && !Utils.validateEmail(input.value)) {
                input.style.borderColor = 'var(--danger)';
                isValid = false;
            }
        });

        return isValid;
    }

    getData() {
        const formData = new FormData(this.form);
        return Object.fromEntries(formData);
    }

    handleSubmit() {
        // Переопределить в подклассах
        console.log('Form submitted:', this.getData());
    }
}

// ========== ФИЛЬТРАЦИЯ ВУЗов ========== 

class VuzFilter {
    constructor(containerId, dataUrl) {
        this.container = document.getElementById(containerId);
        this.dataUrl = dataUrl;
        this.allVuzy = [];
        this.init();
    }

    async init() {
        this.allVuzy = await Utils.fetchJSON(this.dataUrl);
        this.setupFilters();
        this.render(this.allVuzy);
    }

    setupFilters() {
        const filterInputs = this.container.querySelectorAll('.filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.applyFilters());
        });
    }

    applyFilters() {
        const typeFilter = document.querySelector('.filter-type')?.value || '';
        const egeFilter = document.querySelector('.filter-ege')?.value || '';

        let filtered = this.allVuzy;

        if (typeFilter) {
            filtered = filtered.filter(vuz => vuz.type === typeFilter);
        }

        if (egeFilter) {
            filtered = filtered.filter(vuz => vuz.ege.includes(egeFilter));
        }

        this.render(filtered);
    }

    render(vuzy) {
        const grid = this.container.querySelector('.vuz-grid');
        grid.innerHTML = '';

        if (vuzy.length === 0) {
            grid.innerHTML = '<p>ВУЗы не найдены</p>';
            return;
        }

        vuzy.forEach(vuz => {
            const card = this.createVuzCard(vuz);
            grid.appendChild(card);
        });
    }

    createVuzCard(vuz) {
        const card = document.createElement('div');
        card.className = 'card vuz-card';
        const isFavorite = AppState.isFavoriteVuz(vuz.id);

        card.innerHTML = \`
            <div class="card-header">
                <h3 class="card-title">\${vuz.name}</h3>
                <span class="badge badge-primary">\${vuz.type}</span>
            </div>
            <div class="card-body">
                <p><strong>Город:</strong> \${vuz.city}</p>
                <p><strong>Специальности:</strong> \${vuz.specialties.slice(0, 2).join(', ')}...</p>
                <p><strong>ЕГЭ:</strong> \${vuz.ege.join(', ')}</p>
                <p><strong>Минимум баллов:</strong> <span class="text-accent">\${vuz.minBalls}</span></p>
            </div>
            <div class="card-footer">
                <button class="btn btn-accent btn-small" onclick="AppState.addFavoriteVuz('\${vuz.id}'); Utils.showNotification('ВУЗ добавлен в избранное');">
                    ☆ Избранное
                </button>
                <button class="btn btn-primary btn-small" onclick="showVuzDetails('\${vuz.id}')">
                    Подробнее
                </button>
            </div>
        \`;

        return card;
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ========== 

document.addEventListener('DOMContentLoaded', () => {
    AppState.initialize();

    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = \`
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    \`;
    document.head.appendChild(style);
});

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ========== 

function toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
