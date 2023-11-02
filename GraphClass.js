export default class GraphClass {
  constructor() {
    this.graph = {
      nodes: [],
      edges: [],
      nodeDegrees: {}
    };
  }

  computeDegree(node) {
    var id = node.id;
    var nodeDegree = 0;
    for (const edge of this.graph.edges) {
      if (edge.source == id || edge.target == id) {
        nodeDegree += 1;
      }
      if (edge.source.id == id || edge.target.id == id) {
        nodeDegree += 1;
      }
    }
    return nodeDegree;
  }

  // Problem 6a) Compute average node degree
  computeAverageNodeDegree() {
    var avg;
    for (const node of this.graph.nodes) {
      const nodeDegree = this.computeDegree(node);
      this.graph.nodeDegrees[node.id] = nodeDegree;
    }

    var total = 0;
    var count = 0;
    for (const degree in this.graph.nodeDegrees) {
      total += this.graph.nodeDegrees[degree];
      count++;
    }

    avg = total / count;
    return avg;
  }

  // Problem 6b) Number of connected components
  computeConnectedComponents() {
    let visited = new Set();
    let components = 0;

    const dfs = (node) => {
      visited.add(node);
      for (const edge of this.graph.edges) {
        if (edge.source == node && !visited.has(edge.target)) {
          dfs(edge.target);
        }
        if (edge.source.id == node && !visited.has(edge.target.id)) {
          dfs(edge.target.id);
        }
        if (edge.target == node && !visited.has(edge.source)) {
          dfs(edge.source);
        }
        if (edge.target.id == node && !visited.has(edge.source.id)) {
          dfs(edge.source.id);
        }
      }
    }

    for (const node of this.graph.nodes) {
      if (!visited.has(node.id)) {
        components++;
        dfs(node.id);
      }
    }

    return components;
  }

  // Problem 6c) Compute graph density
  computeGraphDensity() {
    let V = this.graph.nodes.length;
    let E = this.graph.edges.length;

    if (V <= 1) {
      console.log("Density undefined");
      return 0;
    }

    return 2 * E / (V * (V - 1));
  }

  findLargestConnectedComponent() {
    let idsPresent = false;
    if (this.graph.edges[0].source.id != null) {
      idsPresent = true;
    }
    let visited = new Set();
    let maxComponent = {
      nodes: [],
      edges: []
    };

    let curComponent = {
      nodes: [],
      edges: []
    };

    const dfs = (node) => {
      visited.add(node);
      for (const edge of this.graph.edges) {
        if (!idsPresent) {
          if (edge.source == node && !visited.has(edge.target)) {
            curComponent.nodes.push({ id: edge.target });
            dfs(edge.target);
          }
          if (edge.target == node && !visited.has(edge.source)) {
            curComponent.nodes.push({ id: edge.source });
            dfs(edge.source);
          }
        }
        else {
          if (edge.source.id == node && !visited.has(edge.target.id)) {
            curComponent.nodes.push({ id: edge.target.id });
            dfs(edge.target.id);
          }
          if (edge.target.id == node && !visited.has(edge.source.id)) {
            curComponent.nodes.push({ id: edge.source.id });
            dfs(edge.source.id);
          }
        }
      }
    }

    for (const node of this.graph.nodes) {
      curComponent = {
        nodes: [],
        edges: []
      };
      if (!visited.has(node.id)) {
        curComponent.nodes.push({ id: node.id });
        dfs(node.id, 0);
        if (curComponent.nodes.length > maxComponent.nodes.length) {
          maxComponent = curComponent;
        }
      }
    }

    visited = new Set();
    for (const node of maxComponent.nodes) {
      for (const edge of this.graph.edges) {
        if (!idsPresent) {
          if (edge.source == node.id && !visited.has(edge)) {
            maxComponent.edges.push(edge);
            visited.add(edge);
          }
          if (edge.target == node.id && !visited.has(edge)) {
            maxComponent.edges.push(edge);
            visited.add(edge);
          }
        }
        else {
          if (edge.source.id == node.id && !visited.has(edge)) {
            maxComponent.edges.push(edge);
            visited.add(edge);
          }
          if (edge.target.id == node.id && !visited.has(edge)) {
            maxComponent.edges.push(edge);
            visited.add(edge);
          }
        }
      }

      for (const oldNode of this.graph.nodes) {
        if (node.id == oldNode.id) {
          node.name = oldNode.name;
          node.rank = oldNode.rank;
          node.genre = oldNode.genre;
          node.cast_name = oldNode.castName;
          node.director_name = oldNode.director_name;
          node.writter_name = oldNode.writter_name;
          node.year = oldNode.year;
          node.duration = oldNode.duration;
          node.imdb_rating = oldNode.imdb_rating;
        }
      }
    }

    return maxComponent;
  }

  findGraphDiameter() {
    let idsPresent = false;
    if (this.graph.edges[0].source.id != null) {
      idsPresent = true;
    }

    let component = this.findLargestConnectedComponent();
    let maxDiameter = 0;

    for (const node of component.nodes) {
      let visited = new Set();
      let queue = [];
      queue.push({ node: node.id, distance: 0 });
      visited.add(node.id);

      while (queue.length > 0) {
        let { node, distance } = queue.shift();
        maxDiameter = Math.max(maxDiameter, distance);

        for (const edge of component.edges) {
          if (!idsPresent) {
            if (edge.source == node && !visited.has(edge.target)) {
              queue.push({ node: edge.target, distance: distance + 1 });
              visited.add(edge.target);
            }
            if (edge.target == node && !visited.has(edge.source)) {
              queue.push({ node: edge.source, distance: distance + 1 });
              visited.add(edge.source);
            }
          }
          else {
            if (edge.source.id == node && !visited.has(edge.target.id)) {
              queue.push({ node: edge.target.id, distance: distance + 1 });
              visited.add(edge.target.id);
            }
            if (edge.target.id == node && !visited.has(edge.source.id)) {
              queue.push({ node: edge.source.id, distance: distance + 1 });
              visited.add(edge.source.id);
            }
          }
        }
      }
    }

    return maxDiameter;
  }

  computeAPL() {
    const largestComponent = this.findLargestConnectedComponent();

    let totalSP = 0;
    let totalPaths = 0;

    var object = false;
    if (typeof largestComponent.edges[0].source === 'object') {
      object = true;
    }

    for (const node of largestComponent.nodes) {
      let visited = new Set();
      let queue = [];
      queue.push({ node: node.id, distance: 0 });
      visited.add(node.id);

      while (queue.length > 0) {
        let { node, distance } = queue.shift();

        for (const edge of largestComponent.edges) {
          if (object) {
            if (edge.source.id == node) {
              const targetId = edge.target.id;
              if (!visited.has(targetId)) {
                queue.push({ node: targetId, distance: distance + 1 });
                visited.add(targetId);
                totalSP += distance + 1;
                totalPaths++;
              }
            }
            if (edge.target.id == node) {
              const sourceId = edge.source.id;
              if (!visited.has(sourceId)) {
                queue.push({ node: sourceId, distance: distance + 1 });
                visited.add(sourceId);
                totalSP += distance + 1;
                totalPaths++;
              }
            } 
          } else {

            if (edge.source == node) {
              const targetId = edge.target;
              if (!visited.has(targetId)) {
                queue.push({ node: targetId, distance: distance + 1 });
                visited.add(targetId);
                totalSP += distance + 1;
                totalPaths++;
              }
            }
            if (edge.target == node) {
              const sourceId = edge.source;
              if (!visited.has(sourceId)) {
                queue.push({ node: sourceId, distance: distance + 1 });
                visited.add(sourceId);
                totalSP += distance + 1;
                totalPaths++;
              }
            }
          }
        }
      }
    }

    return totalSP / totalPaths;
  }
}

