// ===================================================================
// Frontend Configuration & Utilities
// ===================================================================

const CONFIG = {
    // In production (Vercel), API calls are proxied via vercel.json rewrites.
    // In local development:
    //   - If served by Spring Boot (port 8080), uses relative /api path.
    //   - If served separately (port 3000/5500), points to localhost:8080.
    API_BASE_URL: (() => {
        const port = window.location.port;
        const hostname = window.location.hostname;

        // Production (Vercel or any non-localhost deployment)
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
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
