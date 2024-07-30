// utils/upgma.js
export function upgma(matrix, labels) {
    let nodes = labels.map((label, i) => ({ name: label, index: i, children: [] }));
    const n = matrix.length;

    // Helper function to calculate the average distance between clusters
    const calculateAverageDistance = (cluster, distances) => {
        const size = cluster.length;
        let totalDistance = 0;
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                totalDistance += distances[cluster[i]][cluster[j]];
            }
        }
        return totalDistance / (size * (size - 1) / 2);
    };

    while (nodes.length > 2) {
        let minDistance = Infinity;
        let minIndices = [-1, -1];
        const n = nodes.length;
        // Find the closest pair of clusters
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (matrix[i][j] < minDistance) {
                    minDistance = matrix[i][j];
                    minIndices = [i, j];
                }
            }
        }

        const [a, b] = minIndices;
        const newDist = matrix[a][b] / 2;
        const newNode = {
            name: `Node_${nodes.length}`,
            children: [
                { ...nodes[a], distance: newDist },
                { ...nodes[b], distance: newDist },
            ],
            index: nodes.length,
        };

        // Update matrix
        const clusterA = a;
        const clusterB = b;
        let newMatrix = []
        let newRow = [0];
        console.log("NEW: " , matrix)

        for (let i = 0; i < n; i++) {
            if (i !== a && i !== b) {
                const newDist = (matrix[i][a] + matrix[i][b]) / 2;
                newRow.push(newDist);
            }
        }
        newMatrix.push(newRow);
        for (let i = 0; i < n; i++) {
            if (i !== a && i !== b) {
                const newRow = [];
                for (let j = i; j < n; j++) {
                    if (j !== a && j !== b) {
                        newRow.push(matrix[i][j]);
                    }
                }
                newMatrix.push(newRow);
            }
        }
        let size = newMatrix.length;
        let completeMatrix = Array.from({ length: size }, () => Array(size).fill(0));
        for (let i = 0; i < size; i++) {
            let c = i;
            for (let j = 0; j < newMatrix[i].length; j++) {
                completeMatrix[i][c] = newMatrix[i][j];
                c++;
            }
        }
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < i; j++) {
                completeMatrix[i][j] = completeMatrix[j][i];
            }
        }
        newMatrix = completeMatrix;
        // Remove the old rows and columns for clusters A and B
        
        nodes = nodes.filter((_, index) => index !== clusterA && index !== clusterB);
        nodes.unshift(newNode);
        matrix = newMatrix;
    }
    const aux = nodes[1];
    nodes = nodes[0];
    nodes.children.push({...aux, distance: matrix[0][1] / 2})
    console.log(nodes)
    return nodes;
}
