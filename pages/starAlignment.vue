<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Star Alignment - Alineamiento Multiple</h2>
    <button @click="look = !look"
      class="text-section mt-8 rounded focus:outline-none font-bold focus:shadow-outline transition duration-150 ease-in-out">
      >
      <span v-if="look">Ocultar Informacion</span> <span v-else>Ver Informacion</span>
    </button>
    <div v-if="look" class="text-section">
      <!-- <h2 class="text-xl font-bold mb-4">Introducción al Método Neighbor Joining</h2> -->
      <p class="justify-text">El alineamiento múltiple de secuencias (MSA, por sus siglas en inglés) es una herramienta fundamental en la bioinformática y la biología evolutiva. Se utiliza para comparar tres o más secuencias biológicas (ya sean ADN, ARN o proteínas) y determinar las regiones de similitud y diferencia entre ellas. Estas regiones pueden proporcionar información sobre la funcionalidad, estructura y evolución de las secuencias.</p>
      <h2 class="text-xl font-bold mb-4">Introducción al Star Alignment</h2>
      <p class="justify-text">El Star Alignment es un enfoque utilizado para el alineamiento múltiple de secuencias (MSA) que se basa en la selección de una secuencia central o "estrella" como referencia para alinear todas las demás secuencias. Este método es conocido por su simplicidad y eficiencia, especialmente adecuado para conjuntos de datos donde una secuencia de referencia es claramente identificable.</p>
    </div>
    <div class="font-sans justify-center items-center p-6 flex">
      <div class="w-full max-w-sm bg-white shadow-md rounded-lg p-8">
        <form @submit.prevent="smithWaterman">
          <div class="mb-4">
            <label for="numSequences" class="block text-gray-700 text-sm font-bold mb-2">Número de secuencias:</label>
            <input
              class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number" v-model="numSequences" min="2" />
          </div>
          <div v-if="numSequences > 0">
            <div v-for="(index) in numSequences" :key="index" class="mb-4">
              <label :for="'seq' + index" class="text-gray-700 text-sm font-bold mb-2">Secuencia {{ index
                }}:</label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text" v-model="sequenceInputs[index - 1]" :id="'seq' + index" required />
              <InputError v-if="errors && errors.value" :codeErrors="errors.value['seq' + (index)]"></InputError>
            </div>
            <div class="flex mb-4 space-x-4">
              <div class="flex-1">
                <label for="gapPenalty" class="block text-gray-700 text-sm font-bold mb-2">
                  gap:
                </label>
                <input id="gapPenalty" v-model.number="gapPenalty" type="number" placeholder="Penalidad por gap"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required>
              </div>
              <div class="flex-1">
                <label for="matchPenalty" class="block text-gray-700 text-sm font-bold mb-2">
                  match:
                </label>
                <input id="matchPenalty" v-model.number="matchPenalty" type="number" placeholder="Penalidad por match"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required>
              </div>
              <div class="flex-1">
                <label for="mismatchPenalty" class="block text-gray-700 text-sm font-bold mb-2">
                  mismatch:
                </label>
                <input id="mismatchPenalty" v-model.number="mismatchPenalty" type="number"
                  placeholder="Penalidad por mismatch"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required>
              </div>
            </div>
            <button
              class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              @click="alignSequences">Alinear </button>
          </div>
          <InputError v-if="errors && errors.value" :codeErrors="errors.value.type"></InputError>

        </form>
      </div>
    </div>

    <div class="font-sans justify-center items-center p-6 flex flex-col">
      <h5 class="text-lg font-bold mb-4">Secuencias Alineadas</h5>
      <table class="table-auto mb-4">
        <tbody>
          <tr v-for="(alignment, index) in alignedSequences" :key="index">
            <td v-for="(char, idx) in alignment" :key="'seq1-' + idx"
              :class="getColorByChar(char) + ' cellAlignment px-2 py-1 border'">
              {{ char }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
const look = ref(false)
</script>
<script>

export default {
  data() {
    return {
      numSequences: 2,
      inputSequences: [],
      alignedSequences: [],
      globalScore: 0,
      sequenceInputs: [],
      idx: 0,
      gapPenalty: -2,
      matchPenalty: 1,
      mismatchPenalty: -1,
      errors: {}
    };
  },
  methods: {
    score(a, b) {
      return a === b ? this.matchPenalty : this.mismatchPenalty;
    },

    calculateAlignmentScore(seq1, seq2) {
      const m = seq1.length;
      const n = seq2.length;
      const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

      for (let i = 0; i <= m; ++i) dp[i][0] = i * this.gapPenalty;
      for (let j = 0; j <= n; ++j) dp[0][j] = j * this.gapPenalty;

      for (let i = 1; i <= m; ++i) {
        for (let j = 1; j <= n; ++j) {
          dp[i][j] = Math.max(
            dp[i - 1][j - 1] + this.score(seq1[i - 1], seq2[j - 1]),
            dp[i - 1][j] + this.gapPenalty,
            dp[i][j - 1] + this.gapPenalty
          );
        }
      }

      return dp[m][n];
    },
    calculateScoreMatrix(sequences) {
      const n = sequences.length;
      const scoreMatrix = Array.from({ length: n }, () => Array(n).fill(0));

      for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
          if (i !== j) {
            const score = this.calculateAlignmentScore(sequences[i], sequences[j]);
            scoreMatrix[i][j] = score;
            scoreMatrix[j][i] = score;
          }
        }
      }

      return scoreMatrix;
    },
    findStarSequence(scoreMatrix) {
      const n = scoreMatrix.length;
      let minSum = -Infinity;
      let starIndex = 0;

      for (let i = 0; i < n; ++i) {
        const sum = scoreMatrix[i].reduce((a, b) => a + b, 0);
        if (sum > minSum) {
          minSum = sum;
          starIndex = i;
        }
      }
      this.globalScore = minSum;
      this.idx = starIndex;
      return starIndex;
    },
    alignSequences() {
      const sequences = this.sequenceInputs;
      this.alignedSequences = []
      this.globalScore = 0
      this.errors = {}
      if (validateInputs(sequences, this.errors)) {
        return
      }
      const scoreMatrix = this.calculateScoreMatrix(sequences);
      const starIndex = this.findStarSequence(scoreMatrix);
      const alignedSequences = this.multipleSequenceAlignment(sequences, starIndex);
      this.alignedSequences = alignedSequences;
    },

    alignPair(seq1, seq2) {
      const m = seq1.length;
      const n = seq2.length;
      const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
      console.log(dp);
      for (let i = 0; i <= m; ++i) dp[i][0] = i * this.gapPenalty;
      for (let j = 0; j <= n; ++j) dp[0][j] = j * this.gapPenalty;

      for (let i = 1; i <= m; ++i) {
        for (let j = 1; j <= n; ++j) {
          dp[i][j] = Math.max(
            dp[i - 1][j - 1] + this.score(seq1[i - 1], seq2[j - 1]),
            dp[i - 1][j] + this.gapPenalty,
            dp[i][j - 1] + this.gapPenalty
          );
        }
      }
      console.log("Distance matrix: " , dp);
      let alignedSeq1 = '';
      let alignedSeq2 = '';
      let i = m, j = n;

      while (i > 0 && j > 0) {
        if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + this.score(seq1[i - 1], seq2[j - 1])) {
          alignedSeq1 = seq1[i - 1] + alignedSeq1;
          alignedSeq2 = seq2[j - 1] + alignedSeq2;
          --i;
          --j;
          console.log("DIAGONAL")
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + this.gapPenalty) {
          alignedSeq1 = seq1[i - 1] + alignedSeq1;
          alignedSeq2 = '-' + alignedSeq2;
          --i;
          console.log("ARRIBA")
        } else {
          alignedSeq1 = '-' + alignedSeq1;
          alignedSeq2 = seq2[j - 1] + alignedSeq2;
          console.log("IZQUIERDA")
          --j;
        }
      }
      while (i > 0) {
        console.log("i:", i)
        alignedSeq1 = seq1[i - 1] + alignedSeq1;
        alignedSeq2 = '-' + alignedSeq2;
        --i;
      }
      
      
      while (j > 0) {
        console.log("j: ", j)
        alignedSeq1 = '-' + alignedSeq1;
        alignedSeq2 = seq2[j - 1] + alignedSeq2;
        --j;
      }
      console.log("PRES: " , alignedSeq1 , alignedSeq2);
      return [alignedSeq1, alignedSeq2];
    },


    balanceSequence(s1, s2) {
      let maxS, minS;
      if (s1.length > s2.length) {
        maxS = s1;
        minS = s2;
      } else {
        minS = s1;
        maxS = s2;
      }

      let i = 0, j = 0;
      let ans = '';
      while (j < maxS.length) {
        if (maxS[j] === minS[i]) {
          ans += maxS[j];
          i++;
          j++;
        } else {
          ans += '-';
          if (maxS[j] === '-') {
            j++;
          }
          else {
            i++;
          }
        }
      }

      while (i < minS.length) {
        ans += minS[i];
        i++;
      }
      return ans;
    },

    getAlignment(s1, s2, s3) {
      let ans = '';
      let i = 0;
      for (const element of s1) {
        if (element === s3[i]) {
          ans += s2[i++];
        } else {
          ans += '-';
        }
      }
      return ans;
    },

    multipleSequenceAlignment(sequences, starIndex) {
      const n = sequences.length;
      const alignedSequences = [];
      for (let i = 0; i < n; ++i) {
        if (i !== starIndex) {
          const aux = this.alignPair(sequences[starIndex], sequences[i]);
          alignedSequences.push(aux);
        }
      }

      let balance = alignedSequences[0][0];
      console.log("Alineciones guardadas: ", alignedSequences)
      for (let i = 1; i < n - 1; i++) {
        if (balance === alignedSequences[i][0]) continue;
        balance = this.balanceSequence(balance, alignedSequences[i][0]);
      }
      console.log("Alineciones guardadas despues: ", alignedSequences)
      console.log("STAR: ", balance)
      const result = [balance];

      for (let i = 0; i < n - 1; i++) {
        let r = '';
        let m = 0;
        for (const element of balance) {
          if (element === alignedSequences[i][0][m] && alignedSequences[i][1][m]) {
            r += alignedSequences[i][1][m++];
          }
          else {
            r += '-';
          }
          console.log("Alineado: ", r);
        }
        result.push(r);
      }
      return result;
    }
  }
};
</script>

<style scoped>
textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
}

button {
  display: block;
  margin-bottom: 20px;
}

.cellAlignment {
  text-align: center;
  padding: 0.1rem;
  font-size: 1.0rem;
  min-width: 30px;
}
</style>