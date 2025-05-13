<template>
    <div class="globe-container">
        <div ref="globeContainer" class="globe"></div>
        <div v-if="selectedPort" class="info-panel" :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">{{ selectedPort.port_name }}</h5>
                    <p class="card-text">{{ selectedPort.description }}</p>
                    <p class="card-text"><small class="text-muted">Country: {{ selectedPort.country }}</small></p>
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
const tooltipX = ref(0)
const tooltipY = ref(0)
let globe = null

onMounted(async () => {
    // Initialize Globe.GL
    globe = Globe()(globeContainer.value)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(globeContainer.value.clientWidth)
        .height(globeContainer.value.clientHeight)
        .pointAltitude(0.1)
        .pointColor(() => 'rgba(255, 68, 68, 0.6)')
        .pointRadius(0.3)
        .pointsMerge(true)
        .pointLabel(d => d.port_name)
        .onPointHover(d => {
            selectedPort.value = d
            if (d) {
                const { x, y } = globe.pointOfView()
                const { clientX, clientY } = d.event
                tooltipX.value = clientX + 10
                tooltipY.value = clientY + 10
            } else {
                selectedPort.value = null
            }
        })

    // Load and process data
    try {
        const response = await fetch('/China Ports - 1 ports list.csv')
        const csvText = await response.text()
        const ports = parseCSV(csvText)

        // Add points to the globe
        globe
            .pointsData(ports)
            .render()
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

.globe {
    width: 100%;
    height: 100%;
}

.info-panel {
    position: absolute;
    z-index: 1000;
    max-width: 300px;
    pointer-events: none;
}

.card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: none;
    border-radius: 8px;
}

.card-body {
    padding: 1rem;
}

.card-title {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
}

.card-text {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.card-text:last-child {
    margin-bottom: 0;
}
</style>