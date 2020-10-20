import jquery from "jquery";
window.$ = jquery;
import "popper.js";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css"; // Import precompiled Bootstrap css
import "@fortawesome/fontawesome-free/css/all.css";
import lastGeneratedGraph from "../lastGeneratedData.json";
import vis from "vis-network";
import {
  registerResetListener as onReset,
  addOnNodeChangeListener,
  addOnEdgeChangeListener,
  addOnDataSetListener,
  getNodes,
  getEdges,
  setData,
} from "./data";
import { importNetwork } from "./utils";

var data = {
  nodes: new vis.DataSet(),
  edges: new vis.DataSet(),
};

// create a network
var options = {
  interaction: { hover: true },
  edges: {
    width: 0.15,
    arrows: "to",
    color: { inherit: "to" },
    smooth: {
      type: "continuous", // continuous
    },
  },
  nodes: {
    shape: "dot",
    size: 100,
    scaling: {
      min: 50,
      max: 60,
    },
  },
  groups: {
    0: { color: { background: "#97C2FC" } },
    1: { color: { background: "#cc435d" } },
    2: { color: { background: "#fff769" } },
    3: { color: { background: "#9fff69" } },
  },
  layout: {
    improvedLayout: false,
  },
  physics: {
    enabled: $("#cbPhysics").prop("checked"),
    stabilization: false,
    forceAtlas2Based: {
      gravitationalConstant: -800,
      springLength: 10,
      springConstant: 0.01,
    },
    maxVelocity: 200,
    solver: "forceAtlas2Based",
  },
};

const networkContainer = document.getElementById("network");

const newData = importNetwork(lastGeneratedGraph);

data = {
  //@ts-ignore
  nodes: new vis.DataSet(newData.nodes),
  //@ts-ignore
  edges: new vis.DataSet(Array.from(newData.edges.values())),
};

let network = new vis.Network(networkContainer, data, options);
network.fit()
