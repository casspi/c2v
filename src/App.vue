<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
  <footer class="footer">
    <p class="company-name">上海舒欣创中信息有限公司</p>
    <p class="copyright">&copy; {{ new Date().getFullYear() }} All Rights Reserved.</p>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}
</style>
