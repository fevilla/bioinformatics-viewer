<template>
    <div class="container mx-auto p-4">
        <h1 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Árboles Filogenéticos</h1>
        <!-- Introducción -->
        <button @click="look = !look"
        class="text-section mt-8 rounded focus:outline-none font-bold focus:shadow-outline transition duration-150 ease-in-out">
        >
            <span v-if="look">Ocultar Información</span> <span v-else>Ver Información</span>
        </button>
        <div v-if="look" class="text-section">
            <p class="justify-text">Los árboles filogenéticos son diagramas ramificados que representan las relaciones evolutivas entre diferentes especies u otros grupos taxonómicos basados en similitudes y diferencias en sus características físicas o genéticas. Estos árboles nos permiten visualizar cómo las especies han evolucionado a lo largo del tiempo a partir de ancestros comunes.</p>
            <h2 class="text-xl font-bold mb-4">Introducción al Método UPGMA</h2>
            <p class="justify-text">El método UPGMA (Unweighted Pair Group Method with Arithmetic Mean) es una técnica utilizada para construir árboles filogenéticos basados en matrices de distancias. Este método agrupa iterativamente los taxones más cercanos, calculando las distancias promedio, y construye un árbol filogenético jerárquico.</p>
        </div>

        <!-- Entrada de Datos -->
        <div class="flex flex-col items-center mb-6 mt-5">
        <div class="w-full max-w-2xl mb-6">
            <label class="text-sm font-semibold mb-2">Matriz de Distancias:</label>
            <textarea v-model="inputMatrix" placeholder="Introduce la matriz de distancias:"
            class="w-full h-40 p-2 border rounded"></textarea>
            <label class="text-sm font-semibold mb-2">Etiquetas:</label>
            <textarea v-model="inputLabels" placeholder="Introduce las etiquetas:"
            class="shadow appearance-none border rounded w-full h-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
        </div>

        <!-- Botón para Generar Árbol -->
        <section class="flex justify-center mb-6">
            <button @click="generateTree" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Generar Árbol</button>
        </section>
        </div>
        <!-- Contenedor para el Árbol -->
        <section ref="treeContainer" class="flex justify-center mt-4"></section>
    </div>
</template>

<script setup>
import * as d3 from 'd3';
import { upgma } from '~/utils/upgma.js';

const inputMatrix = ref('');
const inputLabels = ref('');
const look = ref(false);
const treeContainer = ref(null);

const parseMatrix = () => {
  try {
    const matrix = inputMatrix.value.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));
    if (matrix.some(row => row.some(isNaN))) throw new Error('Invalid matrix');
    return matrix;
  } catch (error) {
    alert('Por favor, ingrese una matriz de distancias válida.');
    return null;
  }
};

const generateTree = () => {
  const matrix = parseMatrix();
  if (!matrix) return;

  const labels = inputLabels.value.split(/\s+/);

  const treeData = upgma(matrix, labels);
  drawPhyloTree(treeData);
};

const drawPhyloTree = (data) => {
  const width = 800;
  const height = 600;
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
    .text(d => d.target.data.distance.toFixed(3));
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
