// ======================================
// DOM References
// ======================================

// Dashboard Cards

const totalLogsElement =
    document.getElementById("totalLogs");

const totalRequestsElement =
    document.getElementById("totalRequests");

const repeatedPatternsElement =
    document.getElementById("repeatedPatterns");

const rootCauseElement =
    document.getElementById("rootCause");


// Health

const healthStatusElement =
    document.getElementById("healthStatus");

const cpuUsageElement =
    document.getElementById("cpuUsage");

const memoryUsageElement =
    document.getElementById("memoryUsage");

const uptimeElement =
    document.getElementById("uptime");


// AI Analysis

const analysisRootCause =
    document.getElementById("analysisRootCause");

const analysisConfidence =
    document.getElementById("analysisConfidence");

const analysisRecommendation =
    document.getElementById("analysisRecommendation");


// Charts

const responseChartCanvas =
    document.getElementById("responseTimeChart");

const errorChartCanvas =
    document.getElementById("errorDistributionChart");

// ======================================
// API Endpoints
// ======================================

const HEALTH_API =
    "/health";

const METRICS_API =
    "/metrics";

const AI_ANALYSIS_API =
    "/ai-analysis";

// ======================================
// Chart Variables
// ======================================

let responseChart;

let errorChart;

// ======================================
// Initialize Charts
// ======================================

function initializeCharts() {

    responseChart = new Chart(responseChartCanvas, {

        type: "line",

        data: {

            labels: [],

            datasets: [{

                label: "Response Time (ms)",

                data: [],

                tension: 0.3,

                fill: false

            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });


    errorChart = new Chart(errorChartCanvas, {

        type: "pie",

        data: {

            labels: [],

            datasets: [{

                data: []

            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}
async function fetchHealth() {

    const response = await fetch(HEALTH_API);

    return await response.json();

}
function updateHealth(data) {

    healthStatusElement.textContent =
        data.status;

    cpuUsageElement.textContent =
        data.cpu;

    memoryUsageElement.textContent =
        data.memory;

    uptimeElement.textContent =
        data.uptime;

}
async function fetchMetrics() {

    const response = await fetch(METRICS_API);

    return await response.json();

}
function updateResponseChart(data) {

    responseChart.data.labels =
        data.labels;

    responseChart.data.datasets[0].data =
        data.responseTimes;

    responseChart.update();

}
function updateErrorChart(data) {

    errorChart.data.labels =
        Object.keys(data.errors);

    errorChart.data.datasets[0].data =
        Object.values(data.errors);

    errorChart.update();

}
async function fetchAIAnalysis() {

    const response =
        await fetch(AI_ANALYSIS_API);

    return await response.json();

}
function updateDashboardCards(data) {

    totalLogsElement.textContent =
        data.totalLogs;

    totalRequestsElement.textContent =
        data.totalRequests;

    repeatedPatternsElement.textContent =
        data.repeatedPatterns;

    rootCauseElement.textContent =
        data.rootCause;

}
function updateAIAnalysis(data) {

    analysisRootCause.textContent =
        data.rootCause;

    analysisConfidence.textContent =
        data.confidence + "%";

    analysisRecommendation.textContent =
        data.recommendation;

}
async function loadDashboard() {

    try {

        const health =
            await fetchHealth();

        updateHealth(health);


        const metrics =
            await fetchMetrics();

        updateResponseChart(metrics);

        updateErrorChart(metrics);


        const ai =
            await fetchAIAnalysis();

        updateDashboardCards(ai);

        updateAIAnalysis(ai);

    }

    catch (error) {

        console.error(error);

    }

}
function initializeDashboard() {

    initializeCharts();

    loadDashboard();

    setInterval(loadDashboard, 10000);

}

initializeDashboard();