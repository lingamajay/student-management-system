// ===================================================================
// Frontend Configuration & Utilities
// ===================================================================

const CONFIG = {
    // Dynamic API URL detection:
    // 1. Can be manually overridden via: localStorage.setItem('api_base_url', 'https://your-backend.com/api')
    // 2. When hosted on GitHub Pages (*.github.io), points to Render backend
    // 3. When hosted on Vercel (*.vercel.app), uses relative /api (proxied via vercel.json)
    // 4. When local on port 8080 (served by Spring Boot), uses /api
    // 5. When local on other ports (Live Server / Node.js), points to http://localhost:8080/api
    API_BASE_URL: (() => {
        if (localStorage.getItem('api_base_url')) {
            return localStorage.getItem('api_base_url');
        }

        const port = window.location.port;
        const hostname = window.location.hostname;

        // GitHub Pages deployment
        if (hostname.endsWith('github.io')) {
            return 'https://learnpredict-backend.onrender.com/api';
        }

        // Vercel deployment (uses vercel.json proxy)
        if (hostname.endsWith('vercel.app')) {
            return '/api';
        }

        // Local: served by Spring Boot directly
        if (port === '8080') {
            return '/api';
        }

        // Local: served by separate dev server (Node.js/Live Server)
        return 'http://localhost:8080/api';
    })(),

    WEAK_THRESHOLD: 60.0,
    STRONG_THRESHOLD: 75.0
};

// UI formatting helpers
const Utils = {
    formatPercentage(val) {
        if (val === null || val === undefined) return '0%';
        return Number(val).toFixed(1) + '%';
    },

    getStatusBadge(status) {
        const s = (status || '').toUpperCase();
        if (s === 'WEAK') return '<span class="badge badge-weak"><i class="bi bi-exclamation-triangle me-1"></i>WEAK</span>';
        if (s === 'AVERAGE') return '<span class="badge badge-average"><i class="bi bi-dash-circle me-1"></i>AVERAGE</span>';
        return '<span class="badge badge-strong"><i class="bi bi-check-circle me-1"></i>STRONG</span>';
    },

    getRiskBadge(risk) {
        const r = (risk || '').toUpperCase();
        if (r === 'HIGH') return '<span class="badge badge-high-risk"><i class="bi bi-shield-fill-exclamation me-1"></i>HIGH RISK</span>';
        if (r === 'MEDIUM') return '<span class="badge badge-medium-risk"><i class="bi bi-shield-exclamation me-1"></i>MEDIUM RISK</span>';
        return '<span class="badge badge-low-risk"><i class="bi bi-shield-check me-1"></i>LOW RISK</span>';
    },

    getDifficultyBadge(diff) {
        const d = (diff || '').toUpperCase();
        if (d === 'HARD') return '<span class="badge bg-danger">HARD</span>';
        if (d === 'MEDIUM') return '<span class="badge bg-warning text-dark">MEDIUM</span>';
        return '<span class="badge bg-success">EASY</span>';
    },

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};
