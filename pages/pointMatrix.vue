<template>
    <h5 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Needleman Wunsch - Alineamiento global</h5>
    <div class="font-sans justify-center items-center p-6 flex">
        <div class="w-full max-w-5xl">
            <form @submit.prevent="pointMatrix" class="rounded px-8 pt-6 pb-8 mb-4">
                <div class="mb-4">
                    <label for="seq1" class="block text-gray-700 text-sm font-bold mb-2">
                        Secuencia 1:
                    </label>
                    <input id="seq1" v-model="seq1" type="text" placeholder="Introduce la primera secuencia"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required>
                </div>
                <div class="mb-6">
                    <label for="seq2" class="block text-gray-700 text-sm font-bold mb-2">
                        Secuencia 2:
                    </label>
                    <input id="seq2" v-model="seq2" type="text" placeholder="Introduce la segunda secuencia"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required>
                </div>
                <div class="flex items-center justify-between">
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit">
                        Computar alineamientos óptimos
                    </button>
                </div>
            </form>
        </div>
    </div>
    <div v-if="submitting" class="font-sans justify-center items-center p-6 flex flex-col">
        <h5>Cantidad de Alineamientos {{ cnt }}</h5>
        <div v-for="(alignment, index) in alignments" :key="index" class="table-auto mb-4 flex">
            <label class="block text-gray-700 text-sm font-bold mr-5">
                Alineamiento {{ index + 1 }}:
            </label>
            <table>
                <tbody>
                    <tr>
                        <td v-for="(char, idx) in alignment.seq1" :key="'seq1-' + idx" :class="getColorByChar(char)"
                            class="cellAlignment">
                            {{ char }}
                        </td>
                    </tr>
                    <tr>
                        <td v-for="(char, idx) in alignment.seq2" :key="'seq2-' + idx" :class="getColorByChar(char)"
                            class="cellAlignment">
                            {{ char }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div v-if="submitting" class="font-sans justify-center items-center p-6 flex flex-col">
        <div class="text-xs overflow-x-auto shadow-md rounded-lg">
            <table class="min-w-max w-full">
                <thead class="bg-blue-600 text-white">
                    <tr>
                        <th class="px-4 py-2 border bg-blue-200 border-blue-200 cell"></th>
                        <th class="px-4 py-2 border border-blue-800 cell" v-for="(char, index) in seq2"
                            :key="'top-' + index">
                            {{ char }}
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    <tr v-for="(row, i) in mx" :key="'row-' + i">
                        <td class="px-4 py-2 border bg-blue-600 text-white cell">{{ seq1[i] }}</td>
                        <td :class="{ 'cellOneAlignment': oneAligment.find(obj => (obj.i == i && obj.j == j)) !== undefined }"
                            class="relative cell cellPoint justify-center items-center" v-for="(cell, j) in row"
                            :key="'cell-' + i + '-' + j">
                            {{ cell }}
                            <!-- <span v-if="cell.second[0] == '1'"
                                class="absolute top-1 left-1 transform -translate-x-1/2 -translate-y-1/2">↖</span>
                            <span v-if="cell.second[1] == '1'"
                                class="absolute top-1.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">↑</span>
                            <span v-if="cell.second[2] == '1'"
                                class="absolute left-1 top-1/2 transform -translate-x-1/2 -translate-y-1/2">←</span> -->
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>

let seq1 = ''
let seq2 = ''
const submitting = ref(false)
const alignments = ref([])
const mx = ref([])
const cnt = ref(0)
const score = ref(0)
let oneAligment = []


const calculateOne = (lenSeq1, lenSeq2) => {
    let j = 0, i = 0, ant_i = 0
    oneAligment = []
    while (j < lenSeq2) {
        i = ant_i
        while (i < lenSeq1) {
            if (seq1[i] === seq2[j]) {
                console.log(seq1[i], seq2[j])
                oneAligment.push({ i: i, j: j });
                i++
                j++
                ant_i = i
            }
            else {
                i++
            }
        }
        j++

    }
}

const pointMatrix = () => {
    // fix/verify if string are ADN and ARN
    submitting.value = false
    let lenSeq1 = seq1.length
    let lenSeq2 = seq2.length


    mx.value = Array.from({ length: lenSeq1 }, () => Array.from({ length: lenSeq2 }, () => ('')));
    for (let i = 0; i < lenSeq1; i++) {
        for (let j = 0; j < lenSeq2; j++) {
            if (seq1[i] === seq2[j]) mx.value[i][j] = '•';
        }
    }

    calculateOne(lenSeq1, lenSeq2)
    submitting.value = true
}
</script>

<style scoped>
.link {
    fill: none;
    stroke: #555;
    stroke-width: 1.5px;
}

.cell {
    border: 1px solid black;
    text-align: center;
    width: 20px;
    height: 40px;
}

.cellOneAlignment {
    color: white;
    background-color: rgb(245, 69, 69);
}

.cellAlignment {
    border: 1px solid black;
    text-align: center;
    padding: 0.1rem;
    font-size: 1.0rem;
    min-width: 30px;
}

.cellPoint {
    font-size: 40px;
    color: rgb(0, 208, 255);
}
</style>