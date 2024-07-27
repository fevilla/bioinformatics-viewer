<template>
  <h5 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Needleman Wunsch - Alineamiento global</h5>
  <div class="font-sans justify-center items-center p-6 flex">
    <div class="w-full max-w-5xl">
      <form @submit.prevent="NeedlemanWunsch" class="rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label for="seq1" class="block text-gray-700 text-sm font-bold mb-2">
            Secuencia 1:
          </label>
          <input id="seq1" v-model="seq1Input" type="text" placeholder="Introduce la primera secuencia"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required>
        </div>
        <div class="mb-6">
          <label for="seq2" class="block text-gray-700 text-sm font-bold mb-2">
            Secuencia 2:
          </label>
          <input id="seq2" v-model="seq2Input" type="text" placeholder="Introduce la segunda secuencia"
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
    <h5>Maximo score: {{ score }}</h5>
    <div class="text-xs overflow-x-auto shadow-md rounded-lg">
      <table class="min-w-max w-full">
        <thead class="bg-blue-600 text-white">
          <tr>
            <th class="px-4 py-2 border bg-blue-200 border-blue-200 cell"></th>
            <th class="px-4 py-2 border bg-blue-200 border-blue-200 cell">-</th>
            <th class="px-4 py-2 border border-blue-800 cell" v-for="(char, index) in seq2Input" :key="'top-' + index">
              {{ char }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(row, i) in mx" :key="'row-' + i">
            <td class="px-4 py-2 border text-white bg-blue-200 border-blue-200 cell" v-if="i === 0">-</td>
            <td class="px-4 py-2 border bg-blue-600 text-white cell" v-else>{{ seq1Input[i - 1] }}</td>
            <td class="relative cell"
              :class="{ 'cellOneAlignment': oneAligment.find(obj => obj.i === i && obj.j === j) !== undefined }"
              v-for="(cell, j) in row" :key="'cell-' + i + '-' + j">
              {{ cell.first }}
              <span v-if="cell.second[0] == '1'"
                class="absolute top-1 left-1 transform -translate-x-1/2 -translate-y-1/2">↖</span>
              <span v-if="cell.second[1] == '1'"
                class="absolute top-1.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">↑</span>
              <span v-if="cell.second[2] == '1'"
                class="absolute left-1 top-1/2 transform -translate-x-1/2 -translate-y-1/2">←</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>

let seq1Input = ''
let seq2Input = ''
const submitting = ref(false)
const alignments = ref([])
const mx = ref([])
const cnt = ref(0)
const score = ref(0)
let oneAligment = []

const calculate = (f, c, str0, str1, seq1, seq2) => {
  if (cnt.value >= 100) return

  if (f <= 0 && c <= 0) {
    cnt.value++;
    if (cnt.value >= 5) return
    alignments.value.push({
      seq1: str0.split('').reverse().join(''),
      seq2: str1.split('').reverse().join('')
    });
    return
  }

  if (mx.value[f][c].second[0] === '1') calculate(f - 1, c - 1, str0 + seq1[f], str1 + seq2[c], seq1, seq2)
  if (mx.value[f][c].second[1] === '1') calculate(f - 1, c, str0 + seq1[f], str1 + '-', seq1, seq2)
  if (mx.value[f][c].second[2] === '1') calculate(f, c - 1, str0 + '-', str1 + seq2[c], seq1, seq2)
}

const calculateOne = (f, c) => {
  if (f <= 0 && c <= 0) return
  oneAligment.push({ i: f, j: c });
  if (mx.value[f][c].second[0] === '1') calculateOne(f - 1, c - 1)
  else if (mx.value[f][c].second[1] === '1') calculateOne(f - 1, c)
  else if (mx.value[f][c].second[2] === '1') calculateOne(f, c - 1)
}

const NeedlemanWunsch = () => {
  // fix/verify if string are ADN and ARN
  submitting.value = false

  let seq1 = '-' + seq1Input
  let seq2 = '-' + seq2Input
  let lenSeq1 = seq1.length
  let lenSeq2 = seq2.length


  mx.value = Array.from({ length: lenSeq1 }, () => Array.from({ length: lenSeq2 }, () => ({ first: 0, second: '000' })));
  alignments.value = []

  for (let i = 1; i < lenSeq1; i++) {
    mx.value[i][0].first = mx.value[i - 1][0].first - 2
    mx.value[i][0].second = replaceCharAt(mx.value[i][0].second, 1, '1')
  }

  for (let i = 1; i < lenSeq2; i++) {
    mx.value[0][i].first = mx.value[0][i - 1].first - 2;
    mx.value[0][i].second = replaceCharAt(mx.value[0][i].second, 2, '1')
  }

  for (let i = 1; i < lenSeq1; i++) {
    for (let j = 1; j < lenSeq2; j++) {
      const a = mx.value[i - 1][j - 1].first + (seq1[i] === seq2[j] ? 1 : -1);
      const b = mx.value[i - 1][j].first - 2;
      const c = mx.value[i][j - 1].first - 2;
      const r = Math.max(a, Math.max(b, c));
      mx.value[i][j].first = r;
      mx.value[i][j].second = (r === a ? '1' : '0') + (r === b ? '1' : '0') + (r === c ? '1' : '0');
    }
  }
  score.value = mx.value[lenSeq1 - 1][lenSeq2 - 1].first;

  calculate(lenSeq1 - 1, lenSeq2 - 1, '', '', seq1, seq2)
  calculateOne(lenSeq1 - 1, lenSeq2 - 1)
  oneAligment.push({ i: 0, j: 0 })
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
