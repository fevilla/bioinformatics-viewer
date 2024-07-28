<template>
    <h5 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Transcripcion</h5>
    <div class="font-sans p-6 justify-center flex">
        <div class="w-full max-w-sm">
            <form @submit.prevent="Transcripcion" class="rounded px-8 pt-6 pb-8 mb-4">
                <div class="mb-4">
                    <label for="seq1" class="block text-gray-700 text-sm font-bold mb-2">
                        Secuencia 1:
                    </label>
                    <input id="seq1" v-model="seq1Input" type="text" placeholder="Introduce la primera secuencia"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required>
                    <InputError :codeErrors="errors.seq1"></InputError>
                </div>
                <div class="flex items-center justify-between">
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit">
                        Realizar Transcripcion
                    </button>
                </div>
                <InputError :codeErrors="errors.type"></InputError>
            </form>
        </div>
        <div v-if="submitting" class="font-sans">
            <div class="p-9 flex flex-col">
                <h5><b>Cadena:</b> {{ seq1Input }}</h5>
                <h2><b>Tipo:</b> {{ type }}</h2>
                <h5><b>Transcripcion:</b> {{ ans }}</h5>
            </div>
        </div>
    </div>
    <div v-if="submitting" class="font-sans justify-center items-center p-6 flex flex-col">
        <label class="block text-gray-700 text-sm font-bold mr-5">
            Transcripcion:
        </label>
        <table>
            <tbody>
                <tr>
                    <td v-for="(char, idx) in seq1Input" :key="'seq1-' + idx" :class="getColorByChar(char)"
                        class="cellAlignment">
                        {{ char }}
                    </td>
                </tr>
                <tr>
                    <td v-for="(char, idx) in ans" :key="'seq2-' + idx" :class="getColorByChar(char)"
                        class="cellAlignment">
                        {{ char }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>

let seq1Input = ''
const ans = ref('')

const submitting = ref(false);
const type = ref(null);
const errors = ref({});


const Transcripcion = () => {
    submitting.value = false
    seq1Input = seq1Input.toLowerCase();

    if (validateInputs([seq1Input], errors)) return
    let types = determineType(seq1Input)
    if (!types.includes('DNA')) {
        errors.value.type = ['Las secuencias deben de ser DNA']
        return
    }
    type.value = 'DNA'
    ans.value = transcription(seq1Input)
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
</style>