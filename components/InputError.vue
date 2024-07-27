<template>
  <div class="ml-2 mt-3 text-red-500 font-book" v-if="codeErrors && codeErrors.length">
    <div v-for="(error, index) in codeErrors" v-bind:key="index">
      <template v-if="fieldLabel">{{ fieldLabel }}: </template>
      {{ error }}
    </div>
  </div>
</template>

<script setup>
defineProps(['codeErrors', 'fieldLabel'])
</script>

<style scoped></style>
