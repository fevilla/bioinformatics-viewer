<template>
    <div class="xl:flex flex-col w-60 h-dvh sticky top-0 shadow-md">
        <div class="flex flex-col gap-3 pt-12 pb-7 px-12">
            <div class="flex gap-3 text-gray-700 font-book">
                <img src="~assets/images/logo.png" alt="" class="size-10 block" />
                Bioinformática
            </div>
        </div>
        <div class="overflow-y-auto overflow-x-none overscroll-y-none flex-1 scrollbar-custom">
            <nuxt-link to="/needleman" class="pr-0 pl-12 py-5 flex items-center gap-3 font-black">
                <div>Needleman Wunsch</div>
            </nuxt-link>
            <nuxt-link to="/"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold">
                <div>Smith Waterman</div>
            </nuxt-link>
            <nuxt-link to="/"
                class="pr-0 pl-12 py-5 flex items-center gap-3 sidebar-link text-gray-700 hover:text-black font-book hover:font-bold">
                <div>Alineamiento multiple</div>
            </nuxt-link>
        </div>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.scrollbar-custom:hover::-webkit-scrollbar-thumb {
    @apply visible;
}

.scrollbar-custom::-webkit-scrollbar {
    width: 7px;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
    border-radius: 7px;

    @apply bg-gray-400 invisible;
}

.scrollbar-custom:hover::-webkit-scrollbar-thumb {
    @apply visible;
}
</style>