import vis from "vis-network";
import data, {
  addNode,
  removeNode,
  addEdge,
  isExtinct,
  clearNodes,
  persist,
  restore
} from "./data";
import edges from "./probdup/edges.json";
import nodes from "./probdup/nodes.json";

import "./plot";

// create a network
var options = {
  edges: {
    arrows: "to",
    smooth: {
      type: "continuous" // continuous
    }
  },
  physics: { stabilization: false }
};

const networkContainer = document.getElementById("network");
new vis.Network(networkContainer, data, options);

const minSuspicion = 1;
const maxSuspicion = 4;
function randomSuspicion() {
  return Math.round(
    Math.random() * (maxSuspicion - minSuspicion) + minSuspicion
  );
}

async function delay(msec: number) {
  return new Promise(resolve => setTimeout(resolve, msec * 1000));
}

async function generate() {
  const initNodes = 10;

  for (let i = 0; i < initNodes; i++) {
    await delay(0.5);
    /* await delayIndex(i); */
    const suspicion = randomSuspicion();

    const availableNodes = data.nodes.get();
    const edges = Array.from({ length: suspicion }, () =>
      availableNodes.length > 0
        ? {
            from: i,
            to: Number(
              availableNodes.splice(
                Math.round(Math.random() * (availableNodes.length - 1)),
                1
              )[0].id
            )
          }
        : undefined
    );

    addNode(i, 0);

    edges
      .filter(edge => edge !== undefined)
      .forEach(edge => addEdge(edge.from, edge.to));
  }

  for (let i: number = initNodes; i < initNodes + 990; i++) {
    await delay(0.01);
    /* await delayIndex(i); */
    const availableNodes = data.nodes.get();
    const pickedHost = Math.round(Math.random() * (availableNodes.length - 1));

    data.edges
      .get()
      .filter((edge: vis.Edge) => edge.from === pickedHost)
      .filter(() => Math.random() > 0.5)
      .forEach((edge: vis.Edge) => addEdge(i, Number(edge.to)));

    addNode(i, 0);
    addEdge(i, pickedHost);
  }
}

restore(nodes, edges);
