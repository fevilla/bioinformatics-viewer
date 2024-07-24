<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-center mb-4">Arboles filogéneticos</h1>
    <div class="flex justify-center mb-4">
      <textarea v-model="inputMatrix" placeholder="Introduce la matriz de distancias: " class="w-full h-40 p-2 border"></textarea>
    </div>
    <div class="flex justify-center mb-4">
      <textarea v-model="inputLabels" placeholder="Introduce las etiquetas: " class="w-full h-40 p-2 border"></textarea>
    </div>
    <div class="flex justify-center">
      <button @click="generateTree" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Generar árbol</button>
    </div>
    <div ref="treeContainer" class="flex justify-center mt-4"></div>
  </div>
</template>


<script>
  import * as d3 from 'd3';
  import { neighborJoining } from '~/utils/neighborJoining.js';

  export default {
    methods: {
      generateTree() {
        const matrix = this.inputMatrix.split('\n').map(row => row.split(' ').map(Number));
        const labels = this.inputLabels.split(' ');

        const treeData = neighborJoining(matrix, labels);
        this.drawPhyloTree(treeData);
      },
      drawPhyloTree(data) {
        const width = 800;
        const height = 600;
        const margin = 50; // Añadir margen para evitar recortes

        d3.select(this.$refs.treeContainer).selectAll('*').remove();

        const treeLayout = d3.tree().size([width - 2 * margin, height - 2 * margin]);

        const root = d3.hierarchy(data);
        treeLayout(root);

        // Ajustar el tamaño del SVG
        const svg = d3.select(this.$refs.treeContainer)
                      .append('svg')
                      .attr('width', width)
                      .attr('height', height);

        const g = svg.append('g')
                    .attr('transform', `translate(${margin}, ${margin})`);

        g.selectAll('line')
        .data(root.links())
        .enter()
        .append('line')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)
        .attr('stroke', 'black');

        g.selectAll('circle')
        .data(root.descendants())
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .attr('fill', 'blue');

        g.selectAll('text.node-label')
        .data(root.descendants())
        .enter()
        .append('text')
        .attr('x', d => d.x + 10)
        .attr('y', d => d.y)
        .text(d => d.data.name);

        g.selectAll('text.link-label')
        .data(root.links())
        .enter()
        .append('text')
        .attr('class', 'link-label')
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', -5)
        .text(d => d.target.data.distance);
      }
    }
  }
</script>