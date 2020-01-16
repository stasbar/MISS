import vis from "vis-network";
import { getNodes, getEdges } from "./data";
var DELAY = 2000; // delay in ms to add new data points

var data = {
  nodes: new vis.DataSet(),
  edges: new vis.DataSet()
};

// create a network
var options = {
  interaction: { hover: true },
  edges: {
    width: 0.15,
    arrows: "to",
    color: { inherit: "to" },
    smooth: {
      type: "continuous" // continuous
    }
  },
  nodes: {
    shape: "dot",
    size: 100,
    scaling: {
      min: 50,
      max: 60
    }
  },
  groups: {
    0: { color: { background: "#97C2FC" } },
    1: { color: { background: "#cc435d" } },
    2: { color: { background: "#fff769" } },
    3: { color: { background: "#9fff69" } }
  },
  physics: {
    enabled: false,
    stabilization: false,
    forceAtlas2Based: {
      gravitationalConstant: -800,
      springLength: 10,
      springConstant: 0.01
    },
    maxVelocity: 200,
    solver: "forceAtlas2Based"
  }
};

const networkContainer = document.getElementById("network");
const network = new vis.Network(networkContainer, data, options);

/**
 * Add a new datapoint to the graph
 */
function addDataPoint() {
  data.nodes.update(getNodes().get());
  data.edges.update(getEdges().get());

  setTimeout(addDataPoint, DELAY);
}
addDataPoint();
