import vis from "vis-network";
import data, {
  addNode,
  removeNode,
  addEdge,
  updateNode,
  updateEdge,
  isExtinct,
  clear,
  dump,
  restore
} from "./data";
import edges from "./probdup/edges.json";
import nodes from "./probdup/nodes.json";

import { State } from "./plot";

// create a network
var options = {
  edges: {
    arrows: "to",
    color: { inherit: "to" },
    smooth: {
      type: "continuous" // continuous
    }
  },
  groups: {
    0: { color: { background: "#97C2FC" } },
    1: { color: { background: "#cc435d" } },
    2: { color: { background: "#fff769" } },
    3: { color: { background: "#9fff69" } }
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
  clear();
  console.log("generate");

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

  for (let i: number = initNodes; i < initNodes + 90; i++) {
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
    updateNode(pickedHost, State.IA);
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

const epsilon = 0.25;
const Zia = 25;
const Zhq = 1;
const tao = 200;
let currentCycle = 0;
function spread() {
  console.log("spread");
  const nodes: Node[] = data.nodes.get();
  const edges: Edge[] = data.edges.get();
  const adjacentList: Map<Number, Node[]> = buildAdjacentList(nodes, edges);
  console.log(`builded adjacentList: ${adjacentList.size}`);

  const neighboursRatio: Array<Number> = buildNeighboursRatio(adjacentList);
  nodes.forEach(node => {
    if (node.group === State.HS) {
      if (neighboursRatio[node.id] >= epsilon) {
        // More than epsilon of my neighbours are infected so do I
        updateNode(node.id, State.IA);
      }
    } else if (node.group === State.IA) {
      if (Math.random() <= 1 / Zia) {
        if (neighboursRatio[node.id] === 1) {
          // All of my neighbours are infected so do I
          updateNode(node.id, State.IR);
        } else {
          updateNode(node.id, State.HQ);
        }
      }
    } else if (node.group === State.IR) {
      if (neighboursRatio[node.id] < 1) {
        // Not all of my neighbours are infected, so I suspect that something is
        // going on there.
        updateNode(node.id, State.HQ);
      }
    } else if (node.group === State.HQ) {
      if (Math.random() <= 1 / Zhq && currentCycle < tao) {
        if (neighboursRatio[node.id] >= epsilon) {
          updateNode(node.id, State.IA);
        } else {
          updateNode(node.id, State.HS);
        }
      }
    }
  });

  currentCycle++;
  if ($("#cbAutoSpread").prop("checked")) {
    if (neighboursRatio.some(ratio => ratio !== 1 && ratio !== 0)) {
      console.log("auto checked");
      setTimeout(spread, 200);
    } else if (!neighboursRatio.some(ratio => ratio !== 0)) {
      alert("Extinction");
      console.log("Extinction");
      $("#cbAutoSpread").prop("checked", false);
    } else {
      alert("Epidemic");
      console.log("Epidemic");
      $("#cbAutoSpread").prop("checked", false);
    }
  }
}

$("#restore").click(() => restore(nodes, edges));
$("#publish").click(() => publishOn(1));
$("#spread").click(spread);
$("#generate").click(generate);
