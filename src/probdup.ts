// Problems:
// 1) Lockup caused by blowballs,
// 2) Whole topology knowledge is assumed for each node in order to achieve
// randomness
// My proposition, use directed trust, so that we won't be locked up by nodes
// trusting us

import vis from "vis-network";
import {
  addNode,
  addEdge,
  updateNode,
  clear,
  reset,
  setData,
  getNodes,
  getEdges,
  tic,
  getClock
} from "./data";
import nodeEdges1000NoGrape from "./probdup/nodeEdge1000NoGrape.json";
import nodeEdges1000 from "./probdup/nodeEdge1000.json";

import { State } from "./plot";
import { getNetwork } from "./network";
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
    let searching: boolean = true;
    while (searching) {
      const availableNodes = getNodes().get();
      from = availableNodes.splice(
        Math.round(Math.random() * (availableNodes.length - 1)),
        1
      )[0].id;

      to = availableNodes.splice(
        Math.round(Math.random() * (availableNodes.length - 1)),
        1
      )[0].id;

      searching = getEdges()
        .get()
        .some(
          (edge: vis.Edge) =>
            (edge.from === from && edge.to === to) ||
            (edge.from === to && edge.to === from)
        );
    }

    addEdge(from, to);
  }

  const phi = Number($("#phi").val());
  for (let i: number = initNodes; i < noNodes; i++) {
    await delay(0.001);
    /* await delayIndex(i); */
    const availableNodes = getNodes().get();
    let pickedHost = Math.round(Math.random() * (availableNodes.length - 1));

    const outEdges = getEdges()
      .get()
      .filter((edge: vis.Edge) => edge.from === pickedHost);
    const inEdges = getEdges()
      .get()
      .filter((edge: vis.Edge) => edge.to === pickedHost);
    let addedEdges = 0;
    outEdges
      .filter(() => Math.random() <= phi)
      .forEach((edge: vis.Edge) => {
        if (i === edge.to) {
          throw new Error("Can not create self loop");
        }
        addEdge(i, Number(edge.to));
        addedEdges++;
      });

    inEdges
      .filter(() => Math.random() <= phi)
      .forEach((edge: vis.Edge) => {
        if (i === edge.from) {
          throw new Error("Can not create self loop");
        }
        addEdge(i, Number(edge.from));
        addedEdges++;
      });

    if (addedEdges === 0 && $("#cbPreventGrape").prop("checked")) {
      let randomNeighbour = 0;
      if (Math.random() < 0.5 && outEdges.length > 0) {
        const randomEdge =
          outEdges[Math.round(Math.random() * (outEdges.length - 1))];
        randomNeighbour = randomEdge.to;
      } else if (inEdges.length > 0) {
        const randomEdge =
          inEdges[Math.round(Math.random() * (inEdges.length - 1))];
        randomNeighbour = randomEdge.from;
      } else {
        const randomEdge =
          outEdges[Math.round(Math.random() * (outEdges.length - 1))];
        randomNeighbour = randomEdge.to;
      }

      if (i === randomNeighbour) {
        throw new Error("Can not create self loop");
      }
      addEdge(i, Number(randomNeighbour));
      addedEdges++;
    }

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
function buildAdjacentList(nodes: Node[], edges: Edge[]): Array<Array<Node>> {
  const adjacentList = new Array<Array<Node>>();
  edges.forEach(edge => {
    const fromAdjances = adjacentList[Number(edge.from)] || new Array<Node>();
    fromAdjances.push(nodes[Number(edge.to)]);
    adjacentList[Number(edge.from)] = fromAdjances;
    if (!$("#cbDirected").prop("checked")) {
      const toAdjances = adjacentList[Number(edge.to)] || new Array<Node>();
      toAdjances.push(nodes[Number(edge.from)]);
      adjacentList[Number(edge.to)] = toAdjances;
    }
  });
  return adjacentList;
}

function buildNeighboursRatio(adjacentList: Array<Array<Node>>): Array<Number> {
  const neighboursRatio = new Array<Number>(adjacentList.length);
  adjacentList.forEach((neighbours, nodeId) => {
    neighboursRatio[nodeId] =
      neighbours.filter(
        neighbour => neighbour.group === 1 || neighbour.group === 2
      ).length / neighbours.length;
  });
  return neighboursRatio;
}

function spread() {
  tic();
  const xi = Number($("#xi").val());
  const Zia = Number($("#zia").val());
  const Zhq = Number($("#zhq").val());
  const tau = Number($("#tau").val());
  console.log({ xi, Zia, Zhq, tau });

  const nodes: Node[] = getNodes().get();
  const edges: Edge[] = getEdges().get();
  const adjacentList: Array<Node[]> = buildAdjacentList(nodes, edges);
  const neighboursRatio: Array<Number> = buildNeighboursRatio(adjacentList);
  window.adjacentList = adjacentList;
  window.neighboursRatio = neighboursRatio;
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
      if (Math.random() <= 1 / Zhq && getClock() < tau) {
        if (neighboursRatio[node.id] >= xi) {
          updateNode(node.id, State.IA);
        } else {
          updateNode(node.id, State.HS);
        }
      }
    }
  });
  checkBoundaryConditions();
}

async function startSpreading() {
  if ($("#cbAutoSpread").prop("checked")) {
    while (!finished && $("#cbAutoSpread").prop("checked")) {
      await delay(0.1);
      spread();
    }
  } else {
    spread();
  }
}

function checkBoundaryConditions() {
  if (
    !getNodes()
      .get()
      .some(node => node.group === State.IA || node.group === State.IR)
  ) {
    alert("Extinction");
    console.log("Extinction");
    $("#cbAutoSpread").prop("checked", false);
    finished = true;
  } else if (
    !getNodes()
      .get()
      .some(node => node.group === State.HS || node.group === State.HQ)
  ) {
    alert("Epidemic");
    console.log("Epidemic");
    $("#cbAutoSpread").prop("checked", false);
    finished = true;
  }
}

$("#dump").click(() => {
  const network = getNetwork();
  exportNetwork(network);
});

$("#restore1000NoGrape").click(() => {
  const data = importNetwork(nodeEdges1000NoGrape);
  setData(data);
});

$("#restore1000").click(() => {
  const data = importNetwork(nodeEdges1000);
  setData(data);
});

let finished = true;
$("#publish").click(async () => {
  finished = false;
  const publishCount = Number($("#publishCount").val());
  for (let i = 0; i < publishCount; i++) {
    if (!finished) {
      await delay(0.2);
      publish();
    }
    if (!finished) {
      await delay(0.2);
      spread();
    }
  }
});
$("#spread").click(() => startSpreading());
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
  finished = true;
  reset();
});
/* const data = importNetwork(nodeEdges1000); */
/* setData(data); */
