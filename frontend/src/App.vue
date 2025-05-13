<script setup>
import Globe from './components/Globe.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
</script>

<template>
  <div class="container-fluid h-100 p-0">
    <nav class="navbar navbar-dark bg-dark">
      <span class="navbar-brand mb-0 h1">China Ports Globe</span>
    </nav>
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
#app,
.container-fluid,
.row,
.col-12 {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
