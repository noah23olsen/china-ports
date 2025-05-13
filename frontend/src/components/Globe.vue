<template>
    <div class="globe-container">
        <div class="title-container">
            <h1>China's Global Port Network (Beta)</h1>
            <p class="subtitle">Interactive visualization of Chinese port investments worldwide</p>
        </div>
        <div ref="globeContainer" class="globe"></div>
        <div v-if="selectedPort" class="info-panel">
            <div class="panel-content">
                <div class="card">
                    <div class="card-header">
                        <div class="header-main">
                            <h5 class="card-title">{{ selectedPort.port_name }}</h5>
                            <span class="badge">{{ selectedPort.country }}</span>
                        </div>
                        <button class="close-btn" @click="closeInfoPanel" aria-label="Close">&times;</button>
                    </div>
                    <div class="card-body">
                        <div class="port-details">
                            <div class="detail-item">
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">{{ selectedPort.type }}</span>
                            </div>
                        </div>
                    </div>
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
const selectedArcPortName = ref(null)
let globe = null
let arcsRawData = []

function cleanDescription(desc) {
    if (!desc) return ''
    let cleaned = desc.trim()
    cleaned = cleaned.replace(/^"+|"+$/g, '')
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    return cleaned
}

onMounted(async () => {
    globe = Globe()(globeContainer.value)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(globeContainer.value.clientWidth)
        .height(globeContainer.value.clientHeight)
        .onGlobeReady(() => {
            globe.pointOfView({ lat: 1, lng: 13, altitude: 2.4 }, 0);
        })

    // Load and process data
    try {
        const response = await fetch('/China Ports - 1 ports list.csv')
        const csvText = await response.text()
        const ports = parseCSV(csvText)

        // Tall, solid, transparent red cylinders (arcs)
        arcsRawData = ports.map(port => ({
            ...port,
            startLat: port.lat,
            startLng: port.lng,
            endLat: port.lat + 0.25,
            endLng: port.lng,
            color: 'rgba(255,0,0,0.5)',
            stroke: 3,
            altitude: 0.7
        }))
        globe.arcsData(arcsRawData)
            .arcColor(a => a.port_name === selectedArcPortName.value ? 'rgba(0,255,0,0.7)' : 'rgba(255,0,0,0.5)')
            .arcAltitude('altitude')
            .arcStroke('stroke')
            .arcDashLength(1)
            .arcDashGap(0)
            .arcDashInitialGap(0)
            .arcDashAnimateTime(0)
            .onArcClick(d => {
                selectedPort.value = d;
                selectedArcPortName.value = d.port_name;
                if (globe && globe.controls()) {
                    globe.controls().autoRotate = false;
                }
                // Force re-render for green highlight
                globe.arcsData([...arcsRawData]);
            });

        // Points for clickability and glow
        globe.pointsData(ports)
            .pointAltitude(0.01)
            .pointColor(() => 'rgba(255, 255, 0, 0.8)')
            .pointRadius(0.7)
            .pointsMerge(false)
            .pointLabel(d => d.port_name)
        globe.onPointClick(d => {
            selectedPort.value = d
        })

    } catch (error) {
        console.error('Error loading port data:', error)
    }

    // Enable faster auto-rotation by default
    if (globe.controls()) {
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.2;
    }
})

function parseCSV(csvText) {
    const lines = csvText.split('\n')
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

function closeInfoPanel() {
    selectedPort.value = null;
    selectedArcPortName.value = null;
    if (globe && globe.controls()) {
        globe.controls().autoRotate = true;
    }
    // Force re-render for green highlight removal
    globe.arcsData([...arcsRawData]);
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
    padding: 15px 20px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    max-width: 90%;
    width: 600px;
}

.title-container h1 {
    font-size: clamp(1.5rem, 5vw, 2rem);
    margin: 0;
    font-weight: 600;
    line-height: 1.2;
}

.subtitle {
    font-size: clamp(0.9rem, 3vw, 1rem);
    margin: 8px 0 0;
    opacity: 0.9;
    line-height: 1.4;
}

.globe {
    width: 100%;
    height: 100%;
}

.info-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
}

.panel-content {
    height: 100%;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 16px;
}

.card {
    background: rgba(17, 25, 40, 0.55);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
}

.card-header {
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.2rem 1.2rem 1.2rem 1.2rem;
    border-radius: 16px 16px 0 0;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    position: relative;
    flex-direction: column;
    gap: 0.5rem;
}

.header-main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
    width: 100%;
}

.card-title {
    margin: 0;
    font-size: clamp(1.2rem, 4vw, 1.4rem);
    font-weight: 600;
    color: white;
}

.badge {
    font-size: 0.8rem;
    padding: 0.4em 0.8em;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-left: 0;
    margin-top: 0.2rem;
}

.close-btn {
    position: absolute;
    top: 8px;
    right: 12px;
    background: none;
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    z-index: 2;
}

.close-btn:hover {
    opacity: 1;
}

.card-body {
    padding: 1.2rem;
}

.card-text {
    font-size: clamp(0.9rem, 3vw, 1rem);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 1.5rem;
}

.port-details {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: clamp(0.8rem, 2.5vw, 0.9rem);
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-label {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
}

.detail-value {
    color: white;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, -48%);
    }

    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .title-container {
        top: 10px;
        padding: 12px 15px;
    }

    .info-panel {
        width: 95%;
    }

    .card-header {
        padding: 1rem 1rem 1rem 1rem;
    }

    .card-body {
        padding: 1rem;
    }
}

/* Scrollbar styling */
.panel-content::-webkit-scrollbar {
    width: 6px;
}

.panel-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>