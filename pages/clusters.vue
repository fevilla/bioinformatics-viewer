<template>
  <div class="container mx-auto p-4">
    <h1 class="text-xl text-center font-black pb-6 pt-9 sm:pt-14">Clustering Jerárquico</h1>
    <button @click="look = !look"
      class="text-section mt-8 rounded focus:outline-none font-bold focus:shadow-outline transition duration-150 ease-in-out">
      >
      <span v-if="look">Ocultar Información</span> <span v-else>Ver Información</span>
    </button>
    <div v-if="look" class="text-section">
      <p>El clustering jerárquico es una técnica de análisis de datos que agrupa elementos similares en clústeres de
        manera jerárquica. Esta técnica es especialmente útil cuando se desea entender la estructura subyacente de los
        datos, ya que proporciona una representación visual intuitiva a través de un dendrograma, el cual muestra las
        relaciones de proximidad entre los elementos y los clústeres formados en distintos niveles de similitud.</p>

      <h3 class="text-lg font-bold mt-4">Métodos de Clustering Jerárquico</h3>
      <p>Existen varios métodos para realizar el clustering jerárquico, cada uno con sus propias características y
        aplicaciones. Entre los más comunes se encuentran el método de enlace simple, el método de enlace completo y el
        método de enlace promedio.</p>

      <h4 class="text-md font-bold mt-2">Enlace Simple (Single Linkage)</h4>
      <p>El método de enlace simple, también conocido como "mínimo enlace", forma clústeres basándose en la distancia
        mínima entre los puntos de diferentes clústeres. Es decir, la distancia entre dos clústeres se define como la
        distancia mínima entre cualquier par de puntos en los dos clústeres diferentes.</p>

      <h4 class="text-md font-bold mt-2">Enlace Completo (Complete Linkage)</h4>
      <p>El método de enlace completo, también conocido como "máximo enlace", utiliza la distancia máxima entre los
        puntos de diferentes clústeres para determinar la distancia entre los clústeres. En este caso, se asegura que
        todos los puntos dentro del clúster resultante están a una distancia menor o igual que la especificada.</p>

      <h4 class="text-md font-bold mt-2">Enlace Promedio (Average Linkage)</h4>
      <p>El método de enlace promedio, también conocido como "promedio de grupo", define la distancia entre dos
        clústeres como el promedio de las distancias entre todos los pares de puntos en los dos clústeres diferentes.
        Este enfoque es un compromiso entre el enlace simple y el enlace completo.</p>

    </div>

    <div class="flex flex-col items-center mb-6 mt-5">
      <div class="mb-4">
        <label for="method" class="mr-2 font-semibold">Seleccione el método de aglomeración:</label>
        <select id="method" v-model="selectedMethod"
          class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <option value="max">Máximo (Complete Linkage)</option>
          <option value="min">Mínimo (Single Linkage)</option>
          <option value="avg">Promedio (Average Linkage)</option>
        </select>
      </div>

      <div class="w-full max-w-2xl">
        <textarea v-model="distanceMatrixInput" placeholder="Introduce la matriz de distancias"
          class="shadow appearance-none border rounded w-full h-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
      </div>
      <InputError :codeErrors="errors.type"></InputError>

    </div>

    <div class="flex justify-center mb-4">
      <button @click="generateDendrogram"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
        Generar Dendrograma
      </button>
    </div>

  </div>
  <div ref="dendrogramContainer" class="flex justify-center mt-6"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';
import { agnes } from 'ml-hclust';

const dendrogramContainer = ref(null);
const selectedMethod = ref('max');
const distanceMatrixInput = ref('');
const look = ref(false);
const errors = ref({})

const generateDendrogram = () => {
  errors.value.type = []
  const matrix = parseMatrix();
  dendrogramContainer.value.innerHTML = ''; // Limpiar el contenedor
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
    let matrix = distanceMatrixInput.value.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));
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
    console.log("MAT: " , matrix);
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


onMounted(() => {
});

function dendrogram(data, options = {}) {
  const {
    width = 1200,
    height = 800,
    hideLabels = false,
    paddingBottom = hideLabels ? 20 : 200,
    innerHeight = height - paddingBottom,
    innerWidth = width - 10,
    paddingLeft = 50,
    h: cutHeight = undefined,
    yLabel = "↑ Height",
    colors = d3.schemeSet3,
    fontFamily = "Inter, sans-serif",
    linkColor = "gray",
    fontSize = 15,
    strokeWidth = 2,
    showWeights = true,
    weightFontSize = 12,
  } = options;

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, innerHeight])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  let clusterLayout = d3.cluster().size([width - paddingLeft * 2, innerHeight]);

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
  const colorScale = d3.scaleOrdinal(d3.schemeSet3);


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
        child.color = colors[curIndex % colors.length];
      } else if (child.parent && child.parent.color) {
        child.color = child.parent.color;
      }
    });
  } else {
    root.each((d, i) => {
      d.color = colorScale(i);
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
        .attr("y", -30)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .style("font-family", fontFamily)
        .style("font-size", `${fontSize}px`)
        .style("font-weight", "bold")
        .text(yLabel)
    )
    .selectAll(".tick")
    .classed("baseline", (d) => d == 0)
    .style("font-size", `${fontSize}px`)
    .style("font-family", fontFamily);

  // Links
  root.links().forEach((link) => {
    const linkPath = svg
      .append("path")
      .attr("class", "link")
      .attr("stroke", link.source.color || linkColor)
      .attr("stroke-width", `${strokeWidth}px`)
      .attr("fill", "none")
      .attr("transform", `translate(${paddingLeft}, ${hideLabels ? 20 : 0})`)
      .attr("d", elbow(link));

    if (showWeights) {
      // Mostrar la altura en el punto de unión
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .style("font-size", `${fontSize}px`)
        .style("font-family", fontFamily)
        .attr("x", link.source.x + 50)
        .attr("y", transformY(link.source) + 15)
        .text(link.source.data.height.toFixed(2))
    }
  });

  // Nodes
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  root.descendants().forEach((desc) => {
    if (desc.data.isLeaf && !hideLabels) {
      svg
        .append("text")
        .attr("dx", -5)
        .attr("dy", 5)
        .attr("text-anchor", "end")
        .style("font-size", `${fontSize}px`)
        .style("font-family", fontFamily)
        .attr(
          "transform",
          `translate(${desc.x + paddingLeft},${transformY(desc)}) rotate(360)`
        )
        .text(alphabet[desc.data.index % alphabet.length] || desc.name);
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

p {
  text-align: justify
}

.link {
  fill: none;
  stroke: #555;
  stroke-width: 1.5px;
}
</style>
