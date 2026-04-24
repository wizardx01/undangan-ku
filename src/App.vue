<template>
  <div>
    <LoadingSpinner v-if="globalLoading" fullscreen text="Memuat..." />
    <router-view />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

const globalLoading = ref(false)
provide('globalLoading', globalLoading)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>