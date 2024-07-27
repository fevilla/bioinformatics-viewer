<template>
    <h5 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Needleman Wunsch - Alineamiento global</h5>
    <div class="font-sans justify-center items-center p-6 flex">
        <div class="w-full max-w-5xl">
            <form @submit.prevent="watsonCrick" class="rounded px-8 pt-6 pb-8 mb-4">
                <div class="mb-4">
                    <label for="seq1" class="block text-gray-700 text-sm font-bold mb-2">
                        Secuencia:
                    </label>
                    <input id="seq1" v-model="seq1" type="text" placeholder="Introduce la primera secuencia"
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
        <h5>Maximo score: {{ score }}</h5>
        <div class="text-xs overflow-x-auto shadow-md rounded-lg">
            <table class="min-w-max w-full">
                <thead class="bg-blue-600 text-white">
                    <tr>
                        <th class="px-4 py-2 border bg-blue-200 border-blue-200 cell"></th>
                        <th class="px-4 py-2 border border-blue-800 cell" v-for="(char, index) in seq1"
                            :key="'top-' + index">
                            {{ char }}
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    <tr v-for="(row, i) in mx" :key="'row-' + i">
                        <td class="px-4 py-2 border bg-blue-600 text-white cell">{{ seq1[i] }}</td>
                        <td :class="{ 'cellOneAlignment': oneAligment.find(obj => obj.i === i && obj.j === j) !== undefined }"
                            class="relative cell" v-for="(cell, j) in row" :key="'cell-' + i + '-' + j">
                            {{ cell.first }}
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
    <div ref="vizContainer"></div>


</template>

<script setup>
import * as d3 from 'd3';


let seq1 = ''
const submitting = ref(false)
const alignments = ref([])
const mx = ref([])
const cnt = ref(0)
const score = ref(0)
let oneAligment = [], fold = []
const vizContainer = ref(null);
const nodeNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank"];
const edgeNames = ["Amistad", "Colaboración", "Conocido", "Familia", "Vecino"];


const couple = (pair) => {
    const pairs = {
        'a': 'u',
        'u': 'a',
        'g': 'c',
        'c': 'g'
    };
    const firstChar = pair[0].toLowerCase();
    const secondChar = pair[1].toLowerCase();
    return pairs[firstChar] === secondChar ? -1 : 0;
}

const traceback = (i, j) => {
    oneAligment.push({ i: i, j: j })
    if (i < j) {
        if (mx.value[i][j].first === mx.value[i + 1][j - 1].first + couple([seq1[i], seq1[j]])) { // 3rd rule
            fold.push({ first: i, second: j })
            traceback(i + 1, j - 1);
        } else if (mx.value[i][j].first === mx.value[i + 1][j].first) { // 1st rule
            traceback(i + 1, j);
        } else if (mx.value[i][j].first === mx.value[i][j - 1].first) { // 2nd rule
            traceback(i, j - 1);
        } else {
            for (let k = i + 1; k < j; ++k) {
                if (mx.value[i][j].value === mx.value[i][k].value + mx.value[k + 1][j].value) { // 4th rule
                    traceback(i, k);
                    traceback(k + 1, j);
                    break;
                }
            }
        }
    }
    return fold;
}


const watsonCrick = () => {
    // fix/verify if string are ADN and ARN
    submitting.value = false
    let length = seq1.length
    console.log(length)
    // vizContainer.value = null

    mx.value = Array.from({ length: length }, () => Array.from({ length: length }, () => ({ first: 0, second: '000' })));
    alignments.value = []
    oneAligment = []
    let score_min = [0, 0];

    for (let k = 1; k < length; ++k) {
        for (let i = 0; i < length - k; ++i) {
            let j = i + k;
            if (j - i >= 0) {
                let down = mx.value[i + 1][j].first; // 1st rule
                let left = mx.value[i][j - 1].first; // 2nd rule
                let diag = mx.value[i + 1][j - 1].first + couple([seq1[i], seq1[j]]); // 3rd rule
                let rc = 1000000000;
                for (let t = i + 1; t < j; t++) { // 4th rule
                    rc = Math.min(rc, mx.value[i][t].first + mx.value[t + 1][j].first);
                }
                mx.value[i][j].first = Math.min(down, left, diag, rc); // min of all
            } else {
                mx.value[i][j].first = 0;
            }

            if (mx.value[i][j].first <= mx.value[score_min[0]][score_min[1]].first) {
                score_min[0] = i;
                score_min[1] = j;
            }
        }
    }
    traceback(score_min[0], score_min[1])
    draw();
    submitting.value = true
}

const draw = () => {
    const width = 800;
    const height = 600;
    const margin = 20; // Añadir margen para evitar recortes

    const svg = d3.select(vizContainer.value)
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin + margin} ${height + margin + margin}`)
        .append("g")
        .attr("transform", `translate(${margin},${margin})`);

    // Datos JSON definidos directamente en el código
    const data = {
        nodes: [],
        links: []
    };

    for (let i = 0; i < seq1.length; i++) {
        console.log(i)
        data.nodes.push({
            id: i,
            name: `${seq1[i]}${i}`
        });
    }


    for (let i = 0; i < fold.length; i++) {
        data.links.push({
            source: fold[i].first,
            target: fold[i].second,
            name: 'helix',
            color: 'red'
        });
    }

    for (let i = 0; i < seq1.length - 1; i++) {
        if (data.links.find(obj => obj.source === i && obj.target === i + 1)) continue
        data.links.push({
            source: i,
            target: i + 1,
            color: 'black'
        });
    }




    const link = svg.selectAll(".link")
        .data(data.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .style("stroke", d => d.color);

    const linkText = svg.selectAll(".link-text")
        .data(data.links)
        .enter()
        .append("text")
        .attr("class", "link-text")
        .text(d => d.name)
        .style("fill", "#555")
        .style("font-size", "10px")
        .style("color", d => d.color)
        .attr("text-anchor", "middle");

    const node = svg.selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", 10)
    // .style("fill", () => randomColor());

    const nodeText = svg.selectAll(".node-text")
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("class", "node-text")
        .text(d => d.name)
        .style("fill", "#fff")
        .style("font-weight", "bold")
        .style("font-size", "8px")  // Tamaño de fuente más pequeño para los nombres de los nodos
        .attr("text-anchor", "middle");

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink().id(d => d.id).links(data.links))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        linkText
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        nodeText
            .attr("x", d => d.x)
            .attr("y", d => d.y + 5); // Ajuste para centrar el texto en el nodo
    }
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

#vizContainer {
    width: 100%;
    height: 100%;
    display: block
}

.cellAlignment {
    border: 1px solid black;
    text-align: center;
    padding: 0.1rem;
    font-size: 1.0rem;
    min-width: 30px;
}
</style>