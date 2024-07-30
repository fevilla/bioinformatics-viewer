<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Neighbor Joining - Alinemiento múltiple</h2>
    <button @click="look = !look"
      class="text-section mt-8 rounded focus:outline-none font-bold focus:shadow-outline transition duration-150 ease-in-out">
      >
      <span v-if="look">Ocultar Informacion</span> <span v-else>Ver Informacion</span>
    </button>
    <div v-if="look" class="text-section">
      <h2 class="text-xl font-bold mb-4">Introducción al Método Neighbor Joining</h2>
      <p class="justify-text">El método Neighbor Joining es una técnica utilizada para construir árboles filogenéticos
        basados en matrices de distancias. Este método es eficiente para inferir relaciones evolutivas entre especies o
        secuencias, minimizando la longitud total del árbol para crear una estructura clara que representa las
        relaciones evolutivas.</p>
      <p class="justify-text">Neighbor Joining agrupa iterativamente los taxones que están más cerca uno del otro, y a
        partir de una matriz de distancias, construye un árbol no enraizado que puede ser enraizado posteriormente si se
        dispone de un outgroup adecuado.</p>
    </div>

    <!-- Entrada de Datos -->
    <div class="flex flex-col items-center mb-6 mt-5">
      <div class="w-full max-w-2xl mb-6">
        <label class="text-sm font-semibold mb-2">Matriz de Distancias:</label>
        <textarea v-model="inputMatrix" placeholder="Introduce la matriz de distancias:"
          class="w-full h-40 p-2 border rounded"></textarea>
        <!-- <label class="text-sm font-semibold mb-2">Etiquetas:</label>
        <textarea v-model="inputLabels" placeholder="Introduce las etiquetas:" class="w-full h-10 p-2 border rounded"></textarea> -->
        <InputError :codeErrors="errors.type"></InputError>
      </div>

      <!-- Botón para Generar Árbol -->
      <section class="flex justify-center mb-6">
        <button @click="generateTree" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Generar
          Árbol</button>
      </section>
    </div>
    <!-- Contenedor para el Árbol -->
  </div>
  <section ref="treeContainer" class="flex justify-center mt-4 bg-color-red"></section>
</template>

<script setup>
import * as d3 from 'd3';
import { neighborJoining } from '~/utils/neighborJoining.js';

const inputMatrix = ref('');
const inputLabels = ref('');
const look = ref(false);
const treeContainer = ref(null);
const errors = ref({});
const parseMatrix = () => {
  try {
    let matrix = inputMatrix.value.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));
    console.log(matrix);
    
    // Si la matriz es una diagonal inferior
    if (matrix.every((row, i) => row.length === i + 1)) {
      // Autocompletar la matriz
      const size = matrix.length;
      const fullMatrix = Array.from({ length: size }, (_, i) => Array(size).fill(0));
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j <= i; j++) {
          fullMatrix[i][j] = matrix[i][j];
          fullMatrix[j][i] = matrix[i][j];
        }
      }
      
      matrix = fullMatrix;
    }
    // console.log("MAT: " , matrix);
    if (matrix.length > 30) {
      errors.value.type = ['La matriz debe tener un tamaño máximo de 30x30.'];
      throw new Error('Invalid matrix');
    }

    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i].length !== matrix.length) {
        errors.value.type = ['La matriz debe ser cuadrada.'];
        throw new Error('Invalid matrix');
      }
    }

    if (matrix.some(row => row.some(isNaN))) {
      errors.value.type = ['Por favor, ingrese una matriz de distancias válida.'];
      throw new Error('Invalid matrix');
    }

    return matrix;
  } catch (error) {
    return null;
  }
};
const generateTree = () => {
  errors.value.type = [];
  const matrix = parseMatrix();
  console.log(matrix);
  const labels = [];
  // const labels = inputLabels.value.split(' ');
  for(let i = 0 ; i  < matrix.length; i++){
    labels.push(`SEQ_${i + 1}`)
  }
  const treeData = neighborJoining(matrix, labels);
  drawPhyloTree(treeData);
}

const drawPhyloTree = (data) => {
  const width = 1200;
  const height = 800;
  const margin = 50; // Añadir margen para evitar recortes

  // Seleccionar y limpiar el contenedor del árbol
  d3.select(treeContainer.value).selectAll('*').remove();

  const treeLayout = d3.tree().size([width - 2 * margin, height - 2 * margin]);

  const root = d3.hierarchy(data);
  treeLayout(root);

  // Ajustar el tamaño del SVG
  const svg = d3.select(treeContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', `translate(${margin}, ${margin})`);

  // Definir la escala de colores para los nodos iniciales
  const initialNodeColors = d3.scaleOrdinal(d3.schemeSet3);

  // Dibujar enlaces
  g.selectAll('line')
    .data(root.links())
    .enter()
    .append('line')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)
    .attr('stroke', 'black');

  // Dibujar nodos
  g.selectAll('circle')
    .data(root.descendants())
    .enter()
    .append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 10)
    .attr('fill', d => {
      if (d.data.name.startsWith('Node')) {
        // Nodo intermedio, asignar color uniforme
        return 'blue';
      } else {
        // Nodo inicial, asignar color único
        return initialNodeColors(d.data.name);
      }
    })
    .attr('stroke', 'black') // Añadir borde a los nodos
    .attr('stroke-width', 1.5);

  // Etiquetas de nodos
  g.selectAll('text.node-label')
    .data(root.descendants())
    .enter()
    .append('text')
    .attr('x', d => d.x + 12)
    .attr('y', d => d.y)
    .attr('font-size', '12px')
    .attr('font-family', 'Arial, sans-serif')
    .attr('font-weight', 'bold')
    .text(d => d.data.name);

  // Etiquetas de enlaces
  g.selectAll('text.link-label')
    .data(root.links())
    .enter()
    .append('text')
    .attr('class', 'link-label')
    .attr('x', d => (d.source.x + d.target.x) / 2)
    .attr('y', d => (d.source.y + d.target.y) / 2)
    .attr('text-anchor', 'middle')
    .attr('dy', -10)
    .attr('font-size', '12px') // Aumentar tamaño de fuente
    .attr('font-family', 'Arial, sans-serif') // Fuente más legible
    .attr('font-weight', 'bold')
    .text(d => d.target.data.distance.toFixed(2));
};
</script>
<style>
.container {
  max-width: 800px;
  margin: 0 auto;
}

p {
  text-align: justify;
}
</style>