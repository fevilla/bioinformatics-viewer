<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-center mb-4">Clustering Jerárquico</h1>
    <div class="flex justify-center mb-4">
      <label for="method" class="mr-2">Seleccione el método de aglomeración:</label>
      <select id="method" v-model="selectedMethod" @change="generateDendrogram">
        <option value="max">Máximo (Complete Linkage)</option>
        <option value="min">Mínimo (Single Linkage)</option>
        <option value="avg">Promedio (Average Linkage)</option>
      </select>
    </div>
    <div class="flex justify-center mb-4">
      <textarea v-model="distanceMatrixInput" placeholder="Introduce la matriz de distancias" class="w-full h-40 p-2 border"></textarea>
    </div>
    <div class="flex justify-center">
      <button @click="parseMatrix" class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Generar Dendrograma</button>
    </div>
    <div ref="dendrogramContainer" class="flex justify-center mt-4"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';
import { agnes } from 'ml-hclust';

const dendrogramContainer = ref(null);
const selectedMethod = ref('max');
const distanceMatrixInput = ref('');

const generateDendrogram = () => {
  const matrix = parseMatrix();
  if (!matrix) return;

  const method = selectedMethod.value;

  let methodFunction;
  switch (method) {
    case 'max':
      methodFunction = 'complete';
      break;
    case 'min':
      methodFunction = 'single';
      break;
    case 'avg':
      methodFunction = 'average';
      break;
  }

  const result = agnes(matrix, { method: methodFunction, isDistanceMatrix: true });
  const svgElement = dendrogram(result, { h: 2.5 });
  dendrogramContainer.value.innerHTML = ''; // Limpiar el contenedor
  dendrogramContainer.value.appendChild(svgElement);
};

const parseMatrix = () => {
  try {
    const matrix = distanceMatrixInput.value.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));
    if (matrix.some(row => row.some(isNaN))) throw new Error('Invalid matrix');
    return matrix;
  } catch (error) {
    alert('Por favor, ingrese una matriz de distancias válida.');
    return null;
  }
};

onMounted(() => {
  generateDendrogram();
});

function dendrogram(data, options = {}) {
  const {
    width: width = 420,
    height: height = 320,
    hideLabels: hideLabels = false,
    paddingBottom: paddingBottom = hideLabels ? 20 : 80,
    innerHeight = height - paddingBottom,
    innerWidth = width - 10,
    paddingLeft = 30,
    h: cutHeight = undefined,
    yLabel: yLabel = "↑ Height",
    colors: colors = d3.schemeTableau10,
    fontFamily: fontFamily = "Inter, sans-serif",
    linkColor: linkColor = "grey",
    fontSize: fontSize = 10,
    strokeWidth: strokeWidth = 1
  } = options;

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, innerHeight])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  var clusterLayout = d3.cluster().size([width - paddingLeft * 2, innerHeight]);

  const root = d3.hierarchy(data);
  const maxHeight = root.data.height;

  const yScaleLinear = d3
    .scaleLinear()
    .domain([0, maxHeight])
    .range([hideLabels ? innerHeight - 35 : innerHeight, 0]);

  const yAxisLinear = d3.axisLeft(yScaleLinear).tickSize(5);

  function transformY(data) {
    const height = hideLabels ? innerHeight - 15 : innerHeight;
    return height - (data.data.height / maxHeight) * height;
  }

  if (cutHeight) {
    let curIndex = -1;
    root.each((child) => {
      if (
        child.data.height <= cutHeight &&
        child.data.height > 0 &&
        child.parent &&
        !child.parent.color
      ) {
        curIndex++;
        child.color = colors[curIndex];
      } else if (child.parent && child.parent.color) {
        child.color = child.parent.color;
      }
    });
  }

  clusterLayout(root);

  svg
    .append("g")
    .attr("transform", `translate(0, ${hideLabels ? 20 : 0})`)
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${paddingLeft},${hideLabels ? 20 : 0})`)
    .call(yAxisLinear)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .append("text")
        .attr("x", -paddingLeft)
        .attr("y", -20)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .style("font-family", fontFamily)
        .text(yLabel)
    )
    .selectAll(".tick")
    .classed("baseline", (d) => d == 0)
    .style("font-size", `${fontSize}px`)
    .style("font-family", fontFamily);

  // Links
  root.links().forEach((link) => {
    svg
      .append("path")
      .attr("class", "link")
      .attr("stroke", link.source.color || linkColor)
      .attr("stroke-width", `${strokeWidth}px`)
      .attr("fill", "none")
      .attr("transform", `translate(${paddingLeft}, ${hideLabels ? 20 : 0})`)
      .attr("d", elbow(link));
  });

  // Nodes
  root.descendants().forEach((desc) => {
    if (desc.data.isLeaf && !hideLabels) {
      svg
        .append("text")
        .attr("dx", -5)
        .attr("dy", 3)
        .attr("text-anchor", "end")
        .style("font-size", `${fontSize}px`)
        .style("font-family", fontFamily)
        .attr(
          "transform",
          `translate(${desc.x + paddingLeft},${transformY(desc)}) rotate(270)`
        )
        .text(desc.name || desc.data.index);
    }
  });

  function elbow(d) {
    return (
      "M" +
      d.source.x +
      "," +
      transformY(d.source) +
      "H" +
      d.target.x +
      "V" +
      transformY(d.target)
    );
  }
  return svg.node();
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

.axis text {
  font-family: "Inter, sans-serif";
}

.link {
  fill: none;
  stroke: #555;
  stroke-width: 1.5px;
}
</style>
