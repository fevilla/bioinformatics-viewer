<template>
    <div class="xl:flex flex-col w-60 h-dvh sticky top-0 shadow-md">
        <div class="flex flex-col gap-3 pt-12 pb-7 px-12">
            <div class="flex gap-3 text-gray-700 font-book">
                <img src="~assets/images/logo.png" alt="" class="size-10 block" />
                Bioinformática
            </div>
        </div>
        <div class="overflow-y-auto overflow-x-none overscroll-y-none flex-1 scrollbar-custom">
            <nuxt-link to="/transcription"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Transcripcion</div>
            </nuxt-link>
            <nuxt-link to="/needleman"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Needleman Wunsch</div>
            </nuxt-link>
            <nuxt-link to="/smithWaterman"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Smith Waterman</div>
            </nuxt-link>
            <nuxt-link to="/starAlignment"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active" @click.prevent="toggleDropdown">
                <div>Alineamiento múltiple</div>
                <svg :class="{ 'transform rotate-180': dropdownOpen }" class="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </nuxt-link>
            <div v-show="dropdownOpen" class="pl-20 bg-gray-100">
                <nuxt-link to="/starAlignment" class="block py-2 text-gray-700 hover:bg-gray-200">Alineamiento
                    Estrella</nuxt-link>
                <nuxt-link to="/filogenetic" class="block py-2 text-gray-700 hover:bg-gray-200">Neighbor
                    Joining</nuxt-link>
            </div>
            <nuxt-link to="/pointMatrix"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Matriz de puntos</div>
            </nuxt-link>
            <nuxt-link to="/blosum"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Alinemiento global de proteinas</div>
            </nuxt-link>
            <nuxt-link to="/watsonCrick"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Watson Crick</div>
            </nuxt-link>
            <nuxt-link to="/clusters"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Clustering</div>
            </nuxt-link>
            <nuxt-link to="/upgma_filo"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Filogenia</div>
            </nuxt-link>
        </div>
    </div>
</template>

<script setup lang="ts">

const dropdownOpen = ref(false)
const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
}
</script>

<style scoped>
.sidebar-link.active {
    color: black;
    font-weight: bold;
}
</style>