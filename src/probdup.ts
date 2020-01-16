import vis from "vis-network";
import {
  addNode,
  addEdge,
  updateNode,
  clear,
  reset,
  setData,
  getNodes,
  getEdges
} from "./data";
import nodeEdges1000 from "./probdup/nodeEdge1000.json";

import { State } from "./plot";
import "./network";
import { importNetwork, exportNetwork } from "./utils";

async function delay(msec: number) {
  return new Promise(resolve => setTimeout(resolve, msec * 1000));
}

async function generateRandom(noNodes: number) {
  for (let i: number = 0; i < noNodes; i++) {
    await delay(0.01);
    /* await delayIndex(i); */
    const availableNodes = getNodes().get();
    const pickedHost = Math.round(Math.random() * (availableNodes.length - 1));

    addNode(i, 0);
    if (i !== 0) {
      addEdge(i, pickedHost);
    }
  }

  const availableNodes = getNodes().get();
  for (let i: number = 0; i < noNodes; i++) {
    const from = Math.round(Math.random() * (availableNodes.length - 1));
    let to = Math.round(Math.random() * (availableNodes.length - 1));
    while (from === to) {
      to = Math.round(Math.random() * (availableNodes.length - 1));
    }

    await delay(0.01);
    addEdge(to, from);
  }
}

async function generatePropDup(noNodes: number) {
  console.log("generate");

  const initNodes = Number($("#initNodes").val());
  const initEdges = Number($("#initEdges").val());

  // Build tree
  for (let i = 0; i < initNodes; i++) {
    await delay(0.1);
    addNode(i, 0);
    if (i == 0) continue;

    const randomNeighbour = Number(Math.round(Math.random() * (i - 1)));
    addEdge(i, randomNeighbour);
  }

  //Fill with random edges
  for (let i = 0; i < initEdges - initNodes + 1; i++) {
    await delay(0.1);
    let from: number | string;
    let to: number | string;
    let isAlreadyLink: boolean = true;
    while (isAlreadyLink) {
      const availableNodes = getNodes().get();
      from = availableNodes.splice(
        Math.round(Math.random() * (availableNodes.length - 1)),
        1
      )[0].id;

      to = availableNodes.splice(
        Math.round(Math.random() * (availableNodes.length - 1)),
        1
      )[0].id;

      isAlreadyLink = getEdges()
        .get()
        .some(
          (edge: vis.Edge) =>
            (edge.from === from && edge.to === to) ||
            (edge.from === to && edge.to === from)
        );
    }

    addEdge(from, to);
  }

  const phi = Number($("#phi ").val());
  for (let i: number = initNodes; i < noNodes; i++) {
    await delay(0.01);
    /* await delayIndex(i); */
    const availableNodes = getNodes().get();
    let pickedHost = Math.round(Math.random() * (availableNodes.length - 1));
    while (pickedHost === i) {
      pickedHost = Math.round(Math.random() * (availableNodes.length - 1));
    }

    data.edges
      .get()
      .filter((edge: vis.Edge) => edge.from === pickedHost)
      .filter(() => Math.random() <= phi)
      .forEach((edge: vis.Edge) => {
        if (i === edge.to) {
          throw new Error("Can not create self loop");
        }
        addEdge(i, Number(edge.to));
      });

    data.edges
      .get()
      .filter((edge: vis.Edge) => edge.to === pickedHost)
      .filter(() => Math.random() <= phi)
      .forEach((edge: vis.Edge) => {
        if (i === edge.from) {
          throw new Error("Can not create self loop");
        }
        addEdge(i, Number(edge.from));
      });

    addNode(i, State.HS);
    addEdge(i, pickedHost);
  }
}

function publish() {
  console.log("publish");
  const availableNodes = getNodes().get();
  const pickedHost = availableNodes.find(
    node => node.group === State.HS || node.group === State.HQ
  );
  if (pickedHost) {
    updateNode(pickedHost.id, State.IA);
  } else {
    console.error("Could not find healthly node");
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
  return adjacentList;
}

function buildNeighboursRatio(
  adjacentList: Map<Number, Array<Node>>
): Array<Number> {
  const neighboursRatio = new Array<Number>(adjacentList.size);
  adjacentList.forEach((neighbours, nodeId) => {
    neighboursRatio[nodeId] =
      neighbours.filter(
        neighbour => neighbour.group === 1 || neighbour.group === 2
      ).length / neighbours.length;
  });
  return neighboursRatio;
}

let currentCycle = 0;

function spread(ignoreAuto: boolean) {
  console.log("spread");
  const xi = Number($("#xi").val());
  const Zia = Number($("#zia").val());
  const Zhq = Number($("#zhq").val());
  const tau = Number($("#tau").val());
  const nodes: Node[] = data.nodes.get();
  const edges: Edge[] = data.edges.get();
  const adjacentList: Map<Number, Node[]> = buildAdjacentList(nodes, edges);

  const neighboursRatio: Array<Number> = buildNeighboursRatio(adjacentList);
  nodes.forEach(node => {
    if (node.group === State.HS) {
      if (neighboursRatio[node.id] >= xi) {
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
      if (Math.random() <= 1 / Zhq && currentCycle < tau) {
        if (neighboursRatio[node.id] >= xi) {
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
      if (!ignoreAuto) {
        setTimeout(spread, 100);
      }
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

$("#dump").click(() => exportNetwork(network));
$("#restore").click(() => {
  const data = importNetwork(nodeEdges1000);
  setData(data);
  createNetwork(data);
});
$("#publish").click(async () => {
  const publishCount = Number($("#publishCount").val());
  for (let i = 0; i < publishCount; i++) {
    publish();
    await delay(0.2);
    spread(true);
    await delay(0.2);
  }
  spread(false);
});
$("#spread").click(() => spread(false));
$("#generate").click(() => {
  clear();
  const noNodes = Number($("#noNodes ").val());
  if ($("#propDup").prop("checked")) {
    generatePropDup(noNodes);
  } else {
    generateRandom(noNodes);
  }
});
$("#reset").click(() => {
  currentCycle = 0;
  reset();
});
const data = importNetwork(nodeEdges1000);
setData(data);
