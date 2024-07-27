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
                active-class="active">
                <div>Alineamiento multiple</div>
            </nuxt-link>
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
            <nuxt-link to="/filogenetic"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold"
                active-class="active">
                <div>Philogenetic</div>
            </nuxt-link>
        </div>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.sidebar-link.active {
    color: black;
    font-weight: bold;
}
</style>