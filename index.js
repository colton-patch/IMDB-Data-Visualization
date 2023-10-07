// import the GraphClass definiton from GraphClass.js
import GraphClass from './GraphClass.js';

var interactiveGraph;

/*
    Given some JSON data representing a graph, render it with D3
*/
// dummy commit
function renderGraph(graphData) {
    //New object defined in graphview.js
    let graphView = new GraphView("#svgGraph", graphData.nodes, graphData.edges);
    let newGraphView;

    startGraphView(graphView);

    let showInput = d3.select("#showInput");
    showInput.on("change", () => {
        if (showInput.property("value") == "all") {
            graphView.removeGraph();
            newGraphView.removeGraph();
            graphView = new GraphView("#svgGraph", graphData.nodes, graphData.edges);
            startGraphView(graphView)
        }

        if (showInput.property("value") == "largest") {
            graphView.removeGraph();
            if (newGraphView != null) {
                newGraphView.removeGraph();
            }
            let newGraph = new GraphClass();
            newGraph.graph.nodes = graphData.nodes;
            newGraph.graph.edges = graphData.edges;
            let largestConnCompGraph = newGraph.findLargestConnectedComponent();

            newGraphView = new GraphView("#svgGraph", largestConnCompGraph.nodes, largestConnCompGraph.edges);
            startGraphView(newGraphView);
        }
    });

}

function startGraphView(graphView) {
    graphView.removeGraph();
    graphView.draw();
    graphView.startSim();
    // graphView.rescale();
    graphView.addClickListener();
    graphView.addDragListener();

    let nameButton = document.getElementById("showText");
    nameButton.remove();
    nameButton = document.createElement("button");
    nameButton.textContent = "Show Labels";
    nameButton.setAttribute("id", "showText");
    document.getElementById("buttons").appendChild(nameButton);

    nameButton.addEventListener("click", () => {
        if (graphView.textVisible === false)
            graphView.showText();
        else
            graphView.removeText();
    });

    interactiveGraph = graphView;
}

/*
    Function to fetch the JSON data from output_graph.json & call the renderGraph() method
    to visualize this data
*/
function loadAndRenderGraph(fileName, G) {
    fetch(fileName)
        .then(response => response.json())
        .then(jsonData => {
            G.graph.nodes = jsonData.nodes;
            G.graph.edges = jsonData.links;
            renderGraph(G.graph);
        });
}

/*
    A method to compute simple statistics (Programming part Subproblem 6)
    on updated graph data
*/
function displayGraphStatistics(graphObj) {
    //console.log(interactiveGraph);

    let statButton = document.getElementById("computeStats");

    statButton.addEventListener("click", () => {

        if (interactiveGraph) {
            let newGraph = new GraphClass();
            newGraph.graph.nodes = interactiveGraph.nodes;
            newGraph.graph.edges = interactiveGraph.edges;

            for (const node of newGraph.graph.nodes) {
                var nodeDegree = 0;
                for (const edge of newGraph.graph.edges) {
                    if (edge.source == node || edge.target == node) {
                        nodeDegree += 1;
                    }
                }
                newGraph.graph.nodeDegrees[node] = nodeDegree;
            }

                let avgDeg = newGraph.computeAverageNodeDegree();
                let connectedComponent = newGraph.computeConnectedComponents();
                let density = newGraph.computeGraphDensity();
                let componentDiameter = newGraph.findGraphDiameter();

                document.getElementById("avgDegree").innerHTML = avgDeg;
                document.getElementById("numComponents").innerHTML = connectedComponent;
                document.getElementById("graphDensity").innerHTML = density;
                document.getElementById("componentDiameter").innerHTML = componentDiameter;
            }

        });

}

// instantiate an object of GraphClass
let graphObj = new GraphClass();

// your saved graph file from Homework 1
let fileName = "output_graph.json";

// render the graph in the browser
loadAndRenderGraph(fileName, graphObj);

// compute and display simple statistics on the graph
displayGraphStatistics(graphObj);


