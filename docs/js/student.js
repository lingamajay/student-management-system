// ===================================================================
// Student Portal JavaScript Engine
// ===================================================================

const StudentApp = {
    currentStudent() {
        return Auth.getUser();
    },

    async loadDashboard() {
        const student = this.currentStudent();
        if (!student) return;

        try {
            const data = await API.get(`/students/${student.id}/dashboard`);
            
            // Set header welcome
            const welcomeElem = document.getElementById('student-welcome-name');
            if (welcomeElem) welcomeElem.textContent = data.studentName || student.name;

            // Stat Cards
            document.getElementById('overall-performance-val').textContent = Utils.formatPercentage(data.overallPerformance);
            document.getElementById('strong-topics-count').textContent = data.strongTopicsCount;
            document.getElementById('weak-topics-count').textContent = data.weakTopicsCount;
            document.getElementById('predicted-risk-count').textContent = data.predictedRiskTopicsCount;
            document.getElementById('quizzes-completed-count').textContent = data.quizzesCompleted;
            
            const progressVal = document.getElementById('learning-progress-val');
            if (progressVal) {
                progressVal.textContent = Utils.formatPercentage(data.learningProgress);
                const progressBar = document.getElementById('learning-progress-bar');
                if (progressBar) progressBar.style.width = `${data.learningProgress}%`;
            }

            // Render Charts
            this.renderTopicDistributionChart(data.strongTopicsCount, data.averageTopicsCount, data.weakTopicsCount);
            this.renderSubjectPerformanceChart(data.subjectPerformance);
            this.renderQuizTrendChart(data.recentQuizScores);

            // Render Weak Topics Table
            const weakTbody = document.getElementById('weak-topics-tbody');
            if (weakTbody) {
                if (!data.weakTopics || data.weakTopics.length === 0) {
                    weakTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No weak topics detected! Great job!</td></tr>`;
                } else {
                    weakTbody.innerHTML = data.weakTopics.map(w => `
                        <tr>
                            <td class="fw-bold">${w.topicName} <span class="text-muted small">(${w.subjectName || ''})</span></td>
                            <td><span class="fw-semibold text-danger">${Utils.formatPercentage(w.averagePercentage)}</span></td>
                            <td>${Utils.getStatusBadge(w.status)}</td>
                            <td>${Utils.getRiskBadge(w.riskLevel || 'HIGH')}</td>
                            <td class="text-end">
                                <a href="${Auth.getBasePath()}/student/practice.html?topicId=${w.topicId}" class="btn btn-sm btn-outline-primary me-1">
                                    <i class="bi bi-pencil-square me-1"></i>Practice
                                </a>
                                <a href="${Auth.getBasePath()}/student/materials.html?topicId=${w.topicId}" class="btn btn-sm btn-outline-secondary">
                                    <i class="bi bi-journal-text me-1"></i>Notes
                                </a>
                            </td>
                        </tr>
                    `).join('');
                }
            }

            // Render Personalized Recommendations
            const recContainer = document.getElementById('recommendations-container');
            if (recContainer) {
                if (!data.recommendations || data.recommendations.length === 0) {
                    recContainer.innerHTML = `<div class="p-3 text-center text-muted">No pending recommendations. Take more quizzes to discover personalized plans!</div>`;
                } else {
                    recContainer.innerHTML = data.recommendations.map(r => `
                        <div class="card mb-3 border-start border-4 ${r.priority === 'HIGH' ? 'border-danger' : 'border-warning'} shadow-sm">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="d-flex align-items-center gap-2 mb-1">
                                        <span class="badge ${r.priority === 'HIGH' ? 'bg-danger' : 'bg-warning text-dark'}">${r.priority} PRIORITY</span>
                                        <span class="badge bg-light text-dark border">${r.materialType || 'MATERIAL'}</span>
                                        <span class="text-muted small">${r.topicName}</span>
                                    </div>
                                    <h6 class="card-title fw-bold mb-1">${r.materialTitle || 'Topic Practice'}</h6>
                                    <p class="card-text text-muted small mb-0">${r.reason || ''}</p>
                                </div>
                                <div>
                                    ${r.contentUrl ? `<a href="${r.contentUrl}" target="_blank" class="btn btn-sm btn-primary">Open Resource</a>` : ''}
                                    <button class="btn btn-sm btn-outline-success ms-1" onclick="StudentApp.markRecDone(${r.id})">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            }

        } catch (err) {
            console.error('Failed to load student dashboard:', err);
        }
    },

    renderTopicDistributionChart(strong, avg, weak) {
        const ctx = document.getElementById('topicDistributionChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Strong (>75%)', 'Average (60-75%)', 'Weak (<60%)'],
                datasets: [{
                    data: [strong || 0, avg || 0, weak || 0],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    renderSubjectPerformanceChart(subjectMap) {
        const ctx = document.getElementById('subjectPerformanceChart');
        if (!ctx || !subjectMap) return;

        const labels = Object.keys(subjectMap);
        const values = Object.values(subjectMap);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Average Score (%)',
                    data: values,
                    backgroundColor: '#4f46e5',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    },

    renderQuizTrendChart(recentScores) {
        const ctx = document.getElementById('quizTrendChart');
        if (!ctx || !recentScores) return;

        const labels = recentScores.map((s, idx) => `Quiz #${recentScores.length - idx}`).reverse();
        const scores = recentScores.map(s => s.percentage).reverse();

        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Score Percentage',
                    data: scores,
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    },

    async markRecDone(recId) {
        try {
            await API.put(`/recommendations/${recId}/complete`, {});
            alert('Recommendation completed!');
            this.loadDashboard();
        } catch (err) {
            alert('Failed to update recommendation status: ' + err.message);
        }
    }
};
