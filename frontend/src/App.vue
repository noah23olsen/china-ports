<script setup>
import Globe from './components/Globe.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
</script>

<template>
  <div class="container-fluid h-100 p-0">
    <div class="row h-100 m-0">
      <div class="col-12 p-0 h-100">
        <Globe />
      </div>
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  min-width: 100vw;
  overflow: hidden;
}
</style>
