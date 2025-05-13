<template>
    <div class="globe-container">
        <div class="title-container">
            <h1>China's Global Port Network</h1>
            <p class="subtitle">Interactive visualization of Chinese port investments worldwide</p>
        </div>
        <div ref="globeContainer" class="globe"></div>
        <div class="info-panel" :class="{ 'panel-open': selectedPort }">
            <div class="panel-content">
                <div v-if="selectedPort" class="card">
                    <div class="card-header">
                        <h5 class="card-title">{{ selectedPort.port_name }}</h5>
                        <span class="badge bg-primary">{{ selectedPort.country }}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">{{ selectedPort.description }}</p>
                        <div class="port-details">
                            <div class="detail-item">
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">{{ selectedPort.type }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Completion Year:</span>
                                <span class="detail-value">{{ selectedPort.completion_year }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="no-selection">
                    <p>Click on any port to view details</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Globe from 'globe.gl'

const globeContainer = ref(null)
const selectedPort = ref(null)
let globe = null

onMounted(async () => {
    // Initialize Globe.GL
    globe = Globe()(globeContainer.value)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(globeContainer.value.clientWidth)
        .height(globeContainer.value.clientHeight)
        .pointAltitude(0.01)
        .pointColor(() => 'rgba(255, 0, 0, 0.8)')
        .pointRadius(0.5)
        .pointsMerge(false)
        .pointLabel(d => d.port_name)
        .onPointClick(d => {
            selectedPort.value = d
        })

    // Load and process data
    try {
        const response = await fetch('/China Ports - 1 ports list.csv')
        const csvText = await response.text()
        const ports = parseCSV(csvText)

        // Add points to the globe
        globe.pointsData(ports)
    } catch (error) {
        console.error('Error loading port data:', error)
    }
})

function parseCSV(csvText) {
    const lines = csvText.split('\n')
    // Skip the first two header rows
    const headers = lines[2].split(',')

    return lines.slice(3)
        .filter(line => line.trim())
        .map(line => {
            const values = line.split(',')
            const port = {}
            headers.forEach((header, index) => {
                port[header.trim()] = values[index]?.trim()
            })
            return {
                ...port,
                lat: parseFloat(port.latitude),
                lng: parseFloat(port.longitude)
            }
        })
        .filter(port => !isNaN(port.lat) && !isNaN(port.lng))
}

onUnmounted(() => {
    if (globe) {
        globe._destructor()
    }
})
</script>

<style scoped>
.globe-container {
    width: 100%;
    height: 100%;
    background: #000;
    position: relative;
}

.title-container {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 1000;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    backdrop-filter: blur(5px);
}

.title-container h1 {
    font-size: 2rem;
    margin: 0;
    font-weight: 600;
}

.subtitle {
    font-size: 1rem;
    margin: 5px 0 0;
    opacity: 0.9;
}

.globe {
    width: 100%;
    height: 100%;
}

.info-panel {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease-in-out;
    z-index: 1000;
    backdrop-filter: blur(10px);
}

.panel-open {
    right: 0;
}

.panel-content {
    height: 100%;
    overflow-y: auto;
    padding: 20px;
}

.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.card-header {
    background: rgba(0, 0, 0, 0.03);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1.2rem;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    color: #333;
}

.badge {
    font-size: 0.8rem;
    padding: 0.4em 0.8em;
    background: #007bff;
}

.card-body {
    padding: 1.2rem;
}

.card-text {
    font-size: 1rem;
    line-height: 1.6;
    color: #444;
    margin-bottom: 1.5rem;
}

.port-details {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding: 1rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-label {
    color: #666;
    font-weight: 500;
}

.detail-value {
    color: #333;
}

.no-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
    font-size: 1.1rem;
    text-align: center;
    padding: 2rem;
}

/* Scrollbar styling */
.panel-content::-webkit-scrollbar {
    width: 8px;
}

.panel-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
}

.panel-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}
</style>