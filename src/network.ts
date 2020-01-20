import vis from "vis-network";
import {
  registerResetListener as onReset,
  addOnNodeChangeListener,
  addOnEdgeChangeListener,
  addOnDataSetListener,
  getNodes,
  getEdges
} from "./data";

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
    enabled: $("#cbPhysics").prop("checked"),
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
let network = new vis.Network(networkContainer, data, options);

$("#cbPhysics").change(() => {
  const physics = $("#cbPhysics").prop("checked");
  network.setOptions({ physics: { enabled: physics } });
});

let allowUpdate = $("#cbUpdateNetwork").prop("checked");
$("#cbUpdateNetwork").change(() => {
  allowUpdate = $("#cbUpdateNetwork").prop("checked");
});

$("#btnFetchNetwork").click(() => {
  console.log("fetch network");

  data.edges = getEdges();
  data.nodes = getNodes();
  network = new vis.Network(networkContainer, data, options);
});

export function getNetwork() {
  return network;
}

addOnDataSetListener(newData => {
  data = newData;
  network.redraw();
});

addOnNodeChangeListener((event, node) => {
  if (!allowUpdate) {
    return;
  }
  if (event === "add") {
    data.nodes.add(node);
  } else if (event === "remove") {
    data.nodes.remove(node);
  } else if (event === "update") {
    data.nodes.update(node);
  }
});

addOnEdgeChangeListener((event, edge) => {
  if (!allowUpdate) {
    return;
  }
  if (event === "add") {
    data.edges.add(edge);
  } else if (event === "remove") {
    data.edges.remove(edge);
  } else if (event === "update") {
    data.edges.update(edge);
  }
});

onReset(() => {
  data.nodes.clear();
  data.edges.clear();
});
