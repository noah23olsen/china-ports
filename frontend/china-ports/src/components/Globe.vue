<template>
    <div class="globe-container">
        <div ref="globeContainer" class="globe"></div>
        <div v-if="selectedPort" class="info-panel">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">{{ selectedPort.name }}</h5>
                    <p class="card-text">Debt to China: ${{ formatNumber(selectedPort.debtToChina) }}</p>
                    <p class="card-text">Total Debt: ${{ formatNumber(selectedPort.totalDebt) }}</p>
                    <p class="card-text">Debt to China Share: {{ selectedPort.debtToChinaShare }}%</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Globe from 'globe.gl'
import { processPortData, calculateMarkerSize, calculateMarkerColor } from '../utils/dataProcessor'

const globeContainer = ref(null)
const selectedPort = ref(null)
let globe = null

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
}

onMounted(async () => {
    // Initialize Globe.GL
    globe = Globe()(globeContainer.value)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(globeContainer.value.clientWidth)
        .height(globeContainer.value.clientHeight)

    // Load and process data
    try {
        const response = await fetch('/api/ports')
        const data = await response.json()
        const processedData = processPortData(data)

        // Add points to the globe
        globe
            .pointsData(processedData)
            .pointColor(d => calculateMarkerColor(d.debtToChinaShare))
            .pointRadius(d => calculateMarkerSize(d.debtToChina))
            .pointAltitude(0.1)
            .onPointClick(d => {
                selectedPort.value = d
            })
            .render()
    } catch (error) {
        console.error('Error loading port data:', error)
    }
})

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
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 300px;
}

.card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
}
</style>