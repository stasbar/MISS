import vis from "vis-network";
import data, {
  addNode,
  removeNode,
  addEdge,
  updateNode,
  updateEdge,
  isExtinct,
  clearNodes,
  dump,
  restore
} from "./data";
import edges from "./probdup/edges.json";
import nodes from "./probdup/nodes.json";

import "./plot";

// create a network
var options = {
  edges: {
    arrows: "to",
    color: { inherit: "to" },
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

function publishOn(initNodes: number) {
  const availableNodes = data.nodes.getIds();
  for (let index = 0; index < initNodes; index++) {
    const pickedHost = Math.round(Math.random() * (availableNodes.length - 1));
    data.nodes.update({ id: pickedHost, group: 1 });
  }
}

interface Node {
  id: number;
  group: number;
}
interface Edge {
  from: number;
  to: number;
}
function buildAdjacentList(
  nodes: Node[],
  edges: Edge[]
): Map<Number, Array<Node>> {
  const adjacentList = new Map<Number, Array<Node>>();
  edges.forEach(edge => {
    const fromAdjances = adjacentList.get(edge.from) || new Array<Node>();
    fromAdjances.push(nodes[edge.to]);
    adjacentList.set(edge.from, fromAdjances);
    const toAdjances = adjacentList.get(edge.to) || new Array<Node>();
    toAdjances.push(nodes[edge.from]);
    adjacentList.set(edge.to, toAdjances);
  });
  console.log(`adjacentList size: ${adjacentList.size}`);
  return adjacentList;
}

function buildNeighboursRatio(
  adjacentList: Map<Number, Array<Node>>
): Array<Number> {
  const neighboursRatio = new Array<Number>(adjacentList.size);
  console.log(`adjacentList length ${adjacentList.size}`);
  adjacentList.forEach((neighbours, nodeId) => {
    console.log(
      `calculating neighboursRatio for ${nodeId} with neighbours count: ${neighbours.length}`
    );
    neighboursRatio[nodeId] =
      neighbours.filter(
        neighbour => neighbour.group === 1 || neighbour.group === 2
      ).length / neighbours.length;
    console.log(`neighbours ratio ${neighboursRatio[nodeId]}`);
  });
  console.log({ neighboursRatio });
  return neighboursRatio;
}

// 0 - Health Susceptible initial state
// 1 - Infected Acute when infected by EIP
// 2 - Infected Recoverable - when all neighbours are infected
// 3 - Healthly Quarantine - healed, can stay here forever if stayed long enough
const epsilon = 0.1;
const Zia = 20;
const Zhq = 2;
const tao = 20;
let currentCycle = 0;
function spread() {
  console.log("spread");
  const nodes: Node[] = data.nodes.get();
  const edges: Edge[] = data.edges.get();
  const adjacentList: Map<Number, Node[]> = buildAdjacentList(nodes, edges);
  console.log(`builded adjacentList: ${adjacentList.size}`);

  const neighboursRatio: Array<Number> = buildNeighboursRatio(adjacentList);
  nodes.forEach(node => {
    if (node.group === 0) {
      if (neighboursRatio[node.id] >= epsilon) {
        // More than epsilon of my neighbours are infected so do I
        updateNode(node.id, 1);
      }
    } else if (node.group === 1) {
      if (Math.random() <= 1 / Zia) {
        if (neighboursRatio[node.id] === 1) {
          // All of my neighbours are infected so do I
          updateNode(node.id, 2);
        } else {
          updateNode(node.id, 3);
        }
      }
    } else if (node.group === 2) {
      if (neighboursRatio[node.id] < 1) {
        // Not all of my neighbours are infected, so I suspect that something is
        // going on there.
        updateNode(node.id, 3);
      }
    } else if (node.group === 3) {
      if (Math.random() <= 1 / Zhq && currentCycle < tao) {
        if (neighboursRatio[node.id] >= epsilon) {
          updateNode(node.id, 1);
        } else {
          updateNode(node.id, 0);
        }
      }
    }
  });
  currentCycle++;
}

$("#restore").click(() => restore(nodes, edges));
$("#publish").click(() => publishOn(1));
$("#spread").click(spread);
