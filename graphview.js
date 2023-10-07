class GraphView {
    #nodeRadius = 5;
    #margin = { "top": 10, "bottom": 10, "left": 10, "right": 10 };

    constructor(svgId, nodes, edges) {
        //Need a deep copy so we don't modify the backend data.
        this.nodes = JSON.parse(JSON.stringify(nodes));
        this.edges = JSON.parse(JSON.stringify(edges));

        this.svg = d3.select(svgId);

        let width = this.svg.node().getBoundingClientRect().width;
        let height = this.svg.node().getBoundingClientRect().height;
        this.layer1 = this.svg.append("g");
        this.layer2 = this.layer1.append("g");

        this.sim = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges).id(n => n.id))
            .force("repulse", d3.forceManyBody().strength(-100).distanceMax(50 * this.#nodeRadius))
            .force("y", d3.forceY(height / 2).strength(1e-1))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .stop();

        this.calcDegree();
        this.sim.nodes(this.nodes)

        this.zoomLevel = d3.zoomIdentity;
        this.currentSource = null;
        this.currentTarget = null;
        this.tmpLine = null;

        this.width = width;
        this.height = height;

        this.textVisible = false;

        const layoutDropdown = d3.select("#layout");
        this.handleLayoutChange(layoutDropdown.property("value"), 0);
        layoutDropdown.on("change", () => this.handleLayoutChange(layoutDropdown.property("value"), 150));

        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', () => {
            const searchText = searchInput.value;
            this.searchFor(searchText);
        });
    }

    calcDegree() {
        this.nodes.forEach(n => n.degree = 0);
        this.edges.forEach(e => {
            e.source.degree++;
            e.target.degree++;
        });
    }

    showText() {
        this.layer1.selectAll(".names")
            .data(this.nodes, d => d.id)
            .join(
                enter => enter.append("text")
                    .style("pointer-events", "none")
                    .attr("class", "names")
                    .attr("x", d => d.x)
                    .attr("y", d => d.y)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 10)
                    .text(d => d.name),
                update => update.attr("x", d => d.x).attr("y", d => d.y),
            );
        this.textVisible = true;
    }

    removeText() {
        this.layer1.selectAll(".names").remove();
        this.textVisible = false;
    }

    checkText() {
        if (this.textVisible)
            this.showText();
    }

    startSim() {
        let ticked = () => {

            let xbound = x => Math.max(this.#nodeRadius, Math.min(this.width - this.#nodeRadius, x));
            let ybound = y => Math.max(this.#nodeRadius, Math.min(this.height - this.#nodeRadius, y))

            this.layer1.selectAll(".links")
                .attr("x1", e => e.source.x)
                .attr("y1", e => e.source.y)
                .attr("x2", e => e.target.x)
                .attr("y2", e => e.target.y);

            this.layer1.selectAll(".nodes")
                .attr("cx", n => n.x = xbound(n.x))
                .attr("cy", n => n.y = ybound(n.y));

            this.checkText();

        }

        this.sim.on('tick', ticked);
        this.sim.restart();
    }

    removeGraph() {
        this.sim.stop();
        this.layer1.selectAll(".nodes").remove();
        this.layer1.selectAll(".links").remove();
        this.layer1.selectAll(".names").remove();
    }

    draw() {

        this.layer1.selectAll(".links")
            .data(this.edges, e => e.source.id + e.target.id)
            .join(
                enter =>
                    enter.append("line")
                        .attr("class", "links")
                        .attr("x1", e => e.source.x)
                        .attr("y1", e => e.source.y)
                        .attr("x2", e => e.target.x)
                        .attr("y2", e => e.target.y)
                        .attr("stroke", "black")
                        .attr("opacity", 0.5)
                        .attr("transform", this.zoomLevel),
                update => update,
                exit => exit
            );

        this.layer1.selectAll(".nodes")
            .data(this.nodes, d => d.id)
            .join(
                enter =>
                    enter.append("circle")
                        .attr("class", "nodes")
                        .attr("cx", n => n.x)
                        .attr("cy", n => n.y)
                        .attr("r", this.#nodeRadius)
                        .attr("fill", "#fa9f2f")
                        .attr("stroke", "black")
                        .attr("transform", this.zoomLevel),
                update => update,
                exit => exit
            ).raise();

        this.sim.nodes(this.nodes);

        this.sim.alpha(0.5);
        this.sim.restart();

    }

    handleLayoutChange(layout, delay) {
        this.sim.force("link", null); // Remove existing force
        this.sim.force("repulse", null); // Remove existing force
        this.sim.force("y", null); // Remove existing force
        this.sim.force("center", null)
        this.sim.force("radial", null);

        if (layout == "force directed") {
            this.sim.force("link", d3.forceLink(this.edges).id(n => n.id))
                .force("repulse", d3.forceManyBody().strength(-100).distanceMax(50 * this.#nodeRadius))
                .force("y", d3.forceY(this.height / 2).strength(1e-1))
                .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                .stop();

        } else if (layout == "circular") {
            setTimeout(() => {
                const numNodes = this.nodes.length;
                const radius = Math.min(this.width, this.height) * 0.48;
                this.sim.force("radial", d3.forceRadial(radius, this.width / 2, this.height / 2));
            
                this.nodes.forEach((node, i) => {
                    const angle = (2 * Math.PI * i) / numNodes;
                    node.x = this.width / 2 + radius * Math.cos(angle);
                    node.y = this.height / 2 + radius * Math.sin(angle);
                });
            
                // Update edge positions for circular layout
                this.layer1.selectAll(".links")
                    .attr("x1", e => e.source.x)
                    .attr("y1", e => e.source.y)
                    .attr("x2", e => e.target.x)
                    .attr("y2", e => e.target.y);
            }, delay);
        
        }

        this.draw();
    }

    searchFor(id) {
        let targetNode = this.nodes.find(node => node.id === id);

        if (targetNode) {
            this.layer1.selectAll(".nodes")
            .attr("opacity", 0.8)
            .filter(d => d === targetNode)
            .attr("opacity", 1)
            .attr("r", 8)
            .attr("fill", "red");

        } else {
            d3.selectAll(".nodes").attr("fill", "#fa9f2f").attr("r", 5).attr("opacity", 1);
        }
    }

    rescale() {
        let tthis = this;
        let handleZoom = function (e) {
            tthis.zoomLevel = e.transform;
            tthis.svg.selectAll(".links")
                .attr("transform", e.transform);
            tthis.svg.selectAll(".nodes")
                .attr("transform", e.transform);
        };

        let zoom = d3.zoom().scaleExtent([0.005, 10]).on('zoom', handleZoom);

        this.svg.call(zoom);
    }

    rescale2() {
        var bounds = this.svg.node().getBBox();
        var parent = this.svg.node().parentElement;
        var fullWidth = parent.clientWidth,
            fullHeight = parent.clientHeight;
        var width = bounds.width,
            height = bounds.height;
        var midX = bounds.x + width / 2,
            midY = bounds.y + height / 2;
        if (width == 0 || height == 0) return; // nothing to fit
        var scale = (.9) / Math.max(width / fullWidth, height / fullHeight);
        var translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

        var transform = d3.zoomIdentity
            .translate(translate[0], translate[1])
            .scale(scale);

        this.layer1.attr("transform", transform);
    }

    addClickListener() {
        this.svg.on("click", e => {
            if (this.currentSource)
                return;

            let [x, y] = d3.pointer(e);
            this.nodes.push({
                'id': this.nodes.length.toString(),
                'x': x,
                'y': y
            });
            this.draw();
            this.addDragListener();
        });

        this.layer1.selectAll(".nodes")
            .on("click", () => { });
    }

    addDragListener() {
        var tthis = this;
        this.layer1.selectAll(".nodes")
            .on("mousedown", (e, d) => {
                this.svg.on(".zoom", null);
                this.svg.on("click", null);

                d.fx = d.x;
                d.fy = d.y;

                let [x, y] = d3.pointer(e);

                this.currentSource = d;
                this.tmpLine = this.layer2.append("line")
                    // .attr("class", "links")
                    .attr("x1", this.currentSource.x)
                    .attr("y1", this.currentSource.y)
                    .attr("x2", x)
                    .attr("y2", y)
                    .attr("stroke", "black")
                    .attr("transform", this.zoomLevel);
            })
            .on("mouseover", function (e, d) {
                if (tthis.currentSource) {
                    tthis.currentTarget = d;
                    d3.select(this).attr("fill", "blue")
                        .attr("opacity", 1);
                }
                else {
                    d3.select(this).classed("node-highlight", true);
                    d3.selectAll(".links").filter(e => e.source.id === d.id || e.target.id === d.id)
                        .classed("link-highlight", true);
                }
                document.getElementById("movie-name").innerHTML = d.name;

            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "#fa9f2f").attr("r", 5).classed("node-highlight", false);
                d3.selectAll(".links").classed("link-highlight", false);
                tthis.currentTarget = null;
                document.getElementById("movie-name").innerHTML = null;
            });

        this.svg.on("mousemove", e => {
            if (this.currentSource) {
                let [x, y] = d3.pointer(e);
                this.tmpLine
                    .attr("x2", x)
                    .attr("y2", y)
                    .attr("transform", this.zoomLevel)
            }
        });

        this.svg.on("mouseup", () => {
            if (this.tmpLine)
                this.tmpLine.remove();

            if (this.currentTarget) {

                if (this.currentSource === this.currentTarget) {
                    alert("Self loops not allowed");
                    return;
                }

                let newEdge = { "source": this.currentSource, "target": this.currentTarget };
                this.edges.forEach(e => {
                    if (newEdge.source.id === e.source.id && newEdge.target.id === e.target.id) {
                        alert("edge already exists");
                        return;
                    } else if (newEdge.target.id === e.source.id && newEdge.source.id === e.target.id) {
                        alert("edge already exists");
                        return;
                    }
                });

                this.currentSource.fx = null;
                this.currentSource.fy = null;

                this.edges.push(newEdge);
                d3.selectAll(".nodes").attr("fill", "#fa9f2f").attr("r", 5);
                this.draw();
                setTimeout(() => this.addClickListener(), 200);
            }

            // this.rescale();
            this.currentSource = null;
            this.currentTarget = null;
        })
    }

}