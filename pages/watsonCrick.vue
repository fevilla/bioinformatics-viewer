<template>
    <h5 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Watson-Crick - Estructura Secundaria</h5>
    <div class="font-sans justify-center items-center p-6 flex">
        <div class="w-full max-w-sm">
            <form @submit.prevent="watsonCrick" class="rounded px-8 pt-6 pb-8 mb-4">
                <div class="mb-4">
                    <label for="seq1" class="block text-gray-700 text-sm font-bold mb-2">
                        Secuencia:
                    </label>
                    <input id="seq1" v-model="seq1" type="text" placeholder="Introduce la primera secuencia"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required>
                    <InputError :codeErrors="errors.seq1"></InputError>
                </div>
                <div class="flex items-center justify-between">
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit">
                        Estructura secundaria </button>
                </div>
                <InputError :codeErrors="errors.type"></InputError>
            </form>
        </div>
    </div>
    <div ref="cyContainer" class="cy-container"></div>
    <div v-if="submitting" class="font-sans justify-center items-center p-6 flex flex-col">
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
    <!-- <div ref="vizContainer"></div> -->

</template>

<script setup>
import * as d3 from 'd3';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use(coseBilkent);

let seq1 = ''
const submitting = ref(false)
const alignments = ref([])
const mx = ref([])
const cnt = ref(0)
const score = ref(0)
const cyContainer = ref(null);
const errors = ref({})
const type = ref(null);
let bulges = [], bulgesi = [], bulgesj = []
let oneAligment = [], fold = []
const vizContainer = ref(null);

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

const traceback = (startI, startJ) => {
    let stack = [{ i: startI, j: startJ }];

    let auxBulgei = []
    let auxBulgej = []

    let ok = 0;
    while (stack.length > 0) {
        let { i, j } = stack.pop();
        oneAligment.push({ i, j });
        if (i < j) {
            if (mx.value[i][j].first === mx.value[i + 1][j - 1].first + couple([seq1[i], seq1[j]])) { // 3rd rule
                fold.push({ first: i, second: j });
                ok = ok + 1
                if (ok == 2) {
                    ok = 1
                    let lenAuxBulgei = auxBulgei.length
                    let lenAuxBulgej = auxBulgej.length
                    console.log(lenAuxBulgei, lenAuxBulgej)
                    if (lenAuxBulgei > 0 && lenAuxBulgej > 0) bulges.push(...auxBulgei, auxBulgej);
                    else if (lenAuxBulgei > 0) bulgesi.push(...auxBulgei);
                    else if (lenAuxBulgej > 0) bulgesj.push(...auxBulgej);
                    auxBulgei = []
                    auxBulgej = []
                }
                stack.push({ i: i + 1, j: j - 1 });
            } else if (mx.value[i][j].first === mx.value[i + 1][j].first) { // 1st rule
                auxBulgei.push(i)
                stack.push({ i: i + 1, j: j });
            } else if (mx.value[i][j].first === mx.value[i][j - 1].first) { // 2nd rule
                auxBulgej.push(j)
                stack.push({ i: i, j: j - 1 });
            } else {
                for (let k = i + 1; k < j; k++) {
                    if (mx.value[i][j].first === (mx.value[i][k].first + mx.value[k + 1][j].first)) { // 4th rule
                        stack.push({ i: i, j: k });
                        stack.push({ i: k + 1, j });
                        break;
                    }
                }
            }
        }
    }
    return fold;
}




const cleanValues = async (lenSeq1, lenSeq2) => {
    mx.value = Array.from({ length: lenSeq1 }, () => Array.from({ length: lenSeq2 }, () => ({ first: 0, second: '000' })));
    alignments.value = []
    oneAligment = []
    errors.value = {}
    fold = []
    type.value = ''
    score.value = 0
    bulges = []
    bulgesi = []
    bulgesj = []
    cnt.value = 0
    submitting.value = false
    const container = d3.select(vizContainer.value);
    container.select("svg").remove();
}


const watsonCrick = () => {
    let length = seq1.length
    seq1 = seq1.toLowerCase();

    cleanValues(length, length);

    if (validateInputs([seq1], errors)) return
    let types = determineType(seq1)
    if (!types.includes('RNA')) {
        errors.value.type = ['La secuencias debe de ser RNA']
        return
    }

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
                mx.value[i][j].first = Math.min(down, left, diag, rc); // min of allif
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


const getColor = (char) => {
    switch (char.toLowerCase()) {
        case 'a':
            return '#18981D'; // Adenina
        case 'c':
            return '#FDBF07'; // Citosina
        case 'g':
            return '#3b82f6';
        case 'u':
            return '#45B39D';
    }
}
const draw = () => {

    const nodeData = [];
    const edgeData = [];

    for (let i = 0; i < seq1.length; i++) {
        nodeData.push({
            id: i,
            name: `${seq1[i]}${i}`,
            type: '',
            color: getColor(seq1[i]),
        });
    }

    for (let i = 0; i < bulges.length; i++) {
        let new_node = nodeData.find(obj => obj.id === bulges[i])
        if (new_node) new_node.type = 'bulge'
    }

    for (let i = 0; i < bulgesi.length; i++) {
        let new_node = nodeData.find(obj => obj.id === bulgesi[i])
        if (new_node) new_node.type = 'bulgei'
    }

    for (let i = 0; i < bulgesj.length; i++) {
        let new_node = nodeData.find(obj => obj.id === bulgesj[i])
        if (new_node) new_node.type = 'bulgej'
    }

    for (let i = 0; i < fold.length; i++) {
        edgeData.push({
            source: fold[i].first,
            target: fold[i].second,
            name: 'helix',
            color: '#EF4444',
            stroke: '3px'
        });
    }

    for (let i = 0; i < seq1.length - 1; i++) {
        if (edgeData.find(obj => obj.source === i && obj.target === i + 1)) continue
        edgeData.push({
            source: i,
            target: i + 1,
            color: 'black',
            stroke: '1px',
        });
    }

    const cy = cytoscape({
        container: cyContainer.value,
        elements: [
            ...nodeData.map(node => ({ data: { id: node.id, color: node.color, name: node.name + '  ' + node.type } })),
            ...edgeData.map(edge => ({ data: { source: edge.source, target: edge.target, color: edge.color, name: edge.name } }))
        ],
        style: [
            {
                selector: 'node',
                style: {
                    'width': 7,
                    'height': 7,
                    'font-size': 4,
                    'background-color': 'data(color)',
                    'label': 'data(name)', // Concatenar nombre y tipo
                }
            },
            {
                selector: 'node[type="type1"]',
                style: {
                    'label': 'data(name) + "\\n" + data(type)' // Mostrar nombre y tipo del nodo tipo1
                }
            },
            {
                selector: 'node[type="type2"]',
                style: {
                    'label': 'data(name) + "\\n" + data(type)' // Mostrar nombre y tipo del nodo tipo2
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 0.5,
                    'line-color': 'data(color)',
                    'target-arrow-color': 'data(color)',
                    'target-arrow-shape': 'triangle',
                    'font-size': 4,
                    'label': 'data(name)' // Mostrar nombre de la arista
                }
            }
        ],
        layout: {
            name: 'cose-bilkent',
            nodeDimensionsIncludeLabels: true, // Considera las etiquetas en el cálculo del layout
            padding: 10, // Padding alrededor del gráfico
            idealEdgeLength: 2, // Longitud ideal de los enlaces
            edgeElasticity: 0.45, // Elasticidad de los enlaces (menor es más rígido)
            nestingFactor: 0.5, // Influencia del anidamiento de los nodos
            animate: 'end', // Anima solo al finalizar el layout
        },
        zoom: 1, // Nivel de zoom inicial
        minZoom: 0.5, // Nivel mínimo de zoom
        maxZoom: 5, // Nivel máximo de zoom
        wheelSensitivity: 0.1, // Sensibilidad de la rueda del ratón
        userZoomingEnabled: true, // Habilitar/deshabilitar zoom por el usuario
        userPanningEnabled: true // Habilitar/deshabilitar paneo por el usuario
    });
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

.cy-container {
    width: 100%;
    height: 600px;
    display: block;
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









// const draw = () => {
// const margin = { top: 20, right: 30, bottom: 20, left: 30 };
// const width = 1500 - margin.left - margin.right; // Ancho interno del área gráfica
// const height = 1500 - margin.top - margin.bottom; // Altura interna del área gráfica

// const svg = d3.select(vizContainer.value)
// .append("svg")
// .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
// .append("g")
// .attr("transform", `translate(${margin.left},${margin.top})`);


// // Datos JSON definidos directamente en el código
// const data = {
// nodes: [],
// links: []
// };

// for (let i = 0; i < seq1.length; i++) { // data.nodes.push({ // id: i, // name: `${seq1[i]}${i}`, // type: '' // });
    // } // for (let i=0; i < bulges.length; i++) { // let new_node=data.nodes.find(obj=> obj.id === bulges[i])
    // if (new_node) {
    // new_node.type = 'bulge'
    // }
    // }

    // for (let i = 0; i < bulgesi.length; i++) { // console.log(bulgesi[i]) // let new_node=data.nodes.find(obj=>
        obj.id === bulgesi[i])
        // if (new_node) {
        // new_node.type = 'bulgei'
        // }
        // }

        // for (let i = 0; i < bulgesj.length; i++) { // console.log(bulgesi[i]) // let new_node=data.nodes.find(obj=>
            obj.id === bulgesi[i])
            // if (new_node) {
            // new_node.type = 'bulgej'
            // }
            // }



            // for (let i = 0; i < fold.length; i++) { // data.links.push({ // source: fold[i].first, // target:
                fold[i].second, // name: 'helix' , // color: 'red' , // stroke: '3px' // }); // } // for (let i=0; i <
                seq1.length - 1; i++) { // if (data.links.find(obj=> obj.source === i && obj.target === i + 1)) continue
                // data.links.push({
                // source: i,
                // target: i + 1,
                // color: 'black',
                // stroke: '1px',
                // });
                // }

                // const link = svg.selectAll(".link")
                // .data(data.links)
                // .enter()
                // .append("line")
                // .attr("class", "link")
                // .attr("stroke-width", 8)
                // .style("stroke", d => d.color)
                // .attr("stroke-width", d => d.stroke);

                // const linkText = svg.selectAll(".link-text")
                // .data(data.links)
                // .enter()
                // .append("text")
                // .attr("class", "link-text")
                // .text(d => d.name)
                // .style("fill", "#555")
                // .style("font-size", "7px")
                // .style("color", d => d.color)
                // .attr("text-anchor", "middle")
                // .attr("x", d => (d.source.x + d.target.x) / 2)
                // .attr("y", d => (d.source.y + d.target.y) / 2 + 10); // Desplazamiento hacia abajo

                // const node = svg.selectAll(".node")
                // .data(data.nodes)
                // .enter()
                // .append("circle")
                // .attr("class", "node")
                // .attr("r", 15)
                // .style("fill", d => getColor(d.name[0]));

                // const nodeText = svg.selectAll(".node-text")
                // .data(data.nodes)
                // .enter()
                // .append("text")
                // .attr("class", "node-text")
                // .text(d => d.name)
                // .style("fill", "#fff")
                // .style("font-weight", "bold")
                // .style("font-size", "7px") // Tamaño de fuente más pequeño para los nombres de los nodos
                // .attr("text-anchor", "middle");

                // const nodeTextFormation = svg.selectAll(".node-text-formation")
                // .data(data.nodes)
                // .enter()
                // .append("text")
                // .attr("class", "node-text-formation")
                // .text(d => d.type)
                // .style("fill", "#000")
                // .style("font-size", "7px") // Tamaño de fuente más pequeño para los nombres de los nodos
                // .attr("text-anchor", "middle");


                // const simulation = d3.forceSimulation(data.nodes)
                // .force("link", d3.forceLink().id(d => d.id).links(data.links).distance(100))
                // .force("charge", d3.forceManyBody().strength(-600))
                // .force("center", d3.forceCenter(width / 2, height / 2))
                // .on("tick", ticked);

                // function ticked() {
                // link
                // .attr("x1", d => d.source.x)
                // .attr("y1", d => d.source.y)
                // .attr("x2", d => d.target.x)
                // .attr("y2", d => d.target.y);

                // linkText
                // .attr("x", d => (d.source.x + d.target.x) / 2)
                // .attr("y", d => (d.source.y + d.target.y + 8) / 2);

                // node
                // .attr("cx", d => d.x)
                // .attr("cy", d => d.y);

                // nodeText
                // .attr("x", d => d.x)
                // .attr("y", d => d.y + 5); // Ajuste para centrar el texto en el nodo

                // nodeTextFormation
                // .attr("x", d => d.x + 14)
                // .attr("y", d => d.y - 5); // Ajuste para centrar el texto en el nodo

                // }
                // }
