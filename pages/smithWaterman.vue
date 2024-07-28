<template>
  <h5 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Smith Waterman - Alineamiento local</h5>
  <div class="font-sans p-6 justify-center flex">
    <div class="w-full max-w-sm">
      <form @submit.prevent="smithWaterman" class="rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label for="seq1" class="block text-gray-700 text-sm font-bold mb-2">
            Secuencia 1:
          </label>
          <input id="seq1" v-model="seq1Input" type="text" placeholder="Introduce la primera secuencia"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required>
          <InputError :codeErrors="errors.seq1"></InputError>
        </div>
        <div class="mb-6">
          <label for="seq2" class="block text-gray-700 text-sm font-bold mb-2">
            Secuencia 2:
          </label>
          <input id="seq2" v-model="seq2Input" type="text" placeholder="Introduce la segunda secuencia"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required>
          <InputError :codeErrors="errors.seq2"></InputError>
        </div>
        <div class="mb-4">
          <label for="gapPenalty" class="block text-gray-700 text-sm font-bold mb-2">
            Penalidad por gap:
          </label>
          <input id="gapPenalty" v-model.number="gapPenalty" type="number" placeholder="Penalidad por gap"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required>
        </div>
        <div class="mb-4">
          <label for="mismatchPenalty" class="block text-gray-700 text-sm font-bold mb-2">
            Penalidad por mismatch:
          </label>
          <input id="mismatchPenalty" v-model.number="mismatchPenalty" type="number"
            placeholder="Penalidad por mismatch"
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
        <InputError :codeErrors="errors.type"></InputError>
      </form>
    </div>
    <div v-if="submitting" class="font-sans">
      <div class="p-9 flex flex-col">
        <h5><b>Secuencia 1:</b> {{ seq1Input }}</h5>
        <h5><b>Secuencia 2:</b> {{ seq2Input }}</h5>
        <h2><b>Tipo:</b> {{ type }}</h2>
        <h5><b>Cantidad de Alineamientos:</b> {{ cnt }}</h5>
        <h5><b>Score:</b> {{ score }}</h5>
      </div>
    </div>
  </div>
  <div v-if="submitting" class="font-sans justify-center items-center p-6 flex flex-col">
    <div v-for="(alignment, index) in alignments" :key="index" class="table-auto mb-4 flex">
      <label class="block text-gray-700 text-sm font-bold mr-5">
        Alineamiento {{ index + 1 }}:
      </label>
      <table>
        <tbody>
          <tr>
            <td v-for="(char, idx) in alignment.seq1" :key="'seq1-' + idx"
              :class="getClassByIndexSeq(char, idx, index, 0)" class="cellAlignment">
              {{ char }}
            </td>
          </tr>
          <tr>
            <td v-for="(char, idx) in alignment.seq2" :key="'seq2-' + idx"
              :class="getClassByIndexSeq(char, idx, index, 1)" class="cellAlignment">
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

const gapPenalty = ref(-2);
const mismatchPenalty = ref(-1);
const submitting = ref(false);
const alignments = ref([]);
const mx = ref([]);
const cnt = ref(0);
const score = ref(0);
const type = ref('');
const errors = ref({})
const maxLen = ref(null);
let positionAlignment = []
let positionAlignmentFig = []
let oneAligment = [];

const calculate = (f, c, str0, str1, seq1, seq2, score) => {
  for (let i = 0; i < score; i++) {
    if (mx.value[f][c].second[0] === '1') {
      f--;
      c--;
    }
  }

  if (mx.value[f][c].first == 0) {
    cnt.value++;
    if (cnt.value <= 5) {
      positionAlignment.push({ i: f + 1, j: c + 1 });
    }
  }
}

const getClassByIndexSeq = (char, idx, index, q) => {
  let a = positionAlignmentFig[index]
  if (char == '-') return 'text-white';
  if (idx >= a && idx < a + score.value) return getColorByChar(char);
  return '';
}

const calculateOne = () => {
  let a = positionAlignment[0].i
  let b = positionAlignment[0].j
  let c = score.value;

  for (let i = 0; i < c; i++) {
    oneAligment.push({ i: a, j: b })
    a++;
    b++;
  }
}

const cleanValues = (lenSeq1, lenSeq2) => {
  submitting.value = false;
  alignments.value = [];
  cnt.value = 0;
  score.value = null;
  type.value = '';
  errors.value = {}
  maxLen.value = Math.max(lenSeq1, lenSeq2);
  positionAlignment = []
  positionAlignmentFig = []
  oneAligment = [];
  mx.value = Array.from({ length: lenSeq1 }, () => Array.from({ length: lenSeq2 }, () => ({ first: 0, second: '000' })));
}


function padStartCustom(sequence, maxLength) {
  const lengthToAdd = maxLength - sequence.length;
  if (lengthToAdd > 0) return '-'.repeat(lengthToAdd) + sequence;
  return sequence;
}

const smithWaterman = () => {
  seq1Input = seq1Input.toLowerCase();
  seq2Input = seq2Input.toLowerCase();
  let seq1 = '-' + seq1Input
  let seq2 = '-' + seq2Input
  let lenSeq1 = seq1.length
  let lenSeq2 = seq2.length
  cleanValues(lenSeq1, lenSeq2)

  let scores = []
  if (validateInputs([seq1Input, seq2Input], errors)) return
  type.value = determineType(seq1Input)[0]

  for (let i = 1; i < lenSeq1; i++) {
    mx.value[i][0].first = 0
    mx.value[i][0].second = replaceCharAt(mx.value[i][0].second, 1, '1')
  }

  for (let i = 1; i < lenSeq2; i++) {
    mx.value[0][i].first = 0;
    mx.value[0][i].second = replaceCharAt(mx.value[0][i].second, 2, '1')
  }

  for (let i = 1; i < lenSeq1; i++) {
    for (let j = 1; j < lenSeq2; j++) {
      const a = mx.value[i - 1][j - 1].first + (seq1[i] === seq2[j] ? 1 : mismatchPenalty.value);
      const b = mx.value[i - 1][j].first + gapPenalty.value;
      const c = mx.value[i][j - 1].first + gapPenalty.value;
      const d = 0;
      const r = Math.max(a, b, c, d);
      scores.push({ i: i, j: j })

      mx.value[i][j].first = r;
      mx.value[i][j].second = (r === a ? '1' : '0') + (r === b ? '1' : '0') + (r === c ? '1' : '0');
    }
  }
  scores.sort((a, b) => mx.value[b.i][b.j].first - mx.value[a.i][a.j].first);

  let s
  score.value = mx.value[scores[0].i][scores[0].j].first

  for (s of scores) {
    if (score.value === 0) break;
    console.log(s, mx.value[s.i][s.j].first, cnt.value)
    if (cnt.value > 0 && score.value !== mx.value[s.i][s.j].first) {
      calculateOne()
      break;
    }
    calculate(s.i, s.j, '', '', seq1, seq2, score.value);
    score.value = mx.value[s.i][s.j].first;
  }

  if (positionAlignment.length > 0) {
    let preSeq1, postSeq1, preSeq2, postSeq2, p;
    for (p of positionAlignment) {
      preSeq1 = seq1.substring(1, p.i)
      preSeq2 = seq2.substring(1, p.j)
      postSeq1 = seq1.substring(p.i + score.value, lenSeq1)
      postSeq2 = seq2.substring(p.j + score.value, lenSeq2)
      if (preSeq1.length < preSeq2.length) preSeq1 = padStartCustom(preSeq1, preSeq2.length)
      else preSeq2 = padStartCustom(preSeq2, preSeq1.length)
      if (postSeq1.length < postSeq2.length) postSeq1 = postSeq1.padEnd(postSeq2.length, '-');
      else postSeq2 = postSeq2.padEnd(postSeq1.length, '-');
      alignments.value.push({
        seq1: preSeq1 + seq1.substring(p.i, p.i + score.value) + postSeq1,
        seq2: preSeq2 + seq2.substring(p.j, p.j + score.value) + postSeq2
      });
      positionAlignmentFig.push(preSeq1.length)
    }
  }
  submitting.value = true
}
</script>

<style scoped>
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

// alignments.value.push({
// seq1: str0.split('').reverse().join(''),
// seq2: str1.split('').reverse().join('')
// });