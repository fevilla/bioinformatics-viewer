<template>
    <div class="flex">
        <Sidebar />
        <div class="flex-1">
            <slot />
        </div>
    </div>
</template>

<script setup></script>

<style>
button,
select,
a {
    @apply transition duration-300 ease-in-out;
}
</style>