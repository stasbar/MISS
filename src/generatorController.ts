import nodeEdges1000NoGrape from "./probdup/nodeEdge1000NoGrape.json";
import nodeEdges1000 from "./probdup/nodeEdge1000.json";

import { getNetwork } from "./network";
import { importNetwork, exportNetwork } from "./utils";
import {
  Node,
  Edge,
  setData,
  clear,
  State,
  addNode,
  addEdge,
  getNodes,
  getEdges,
  buildAdjacentList
} from "./data";

async function delay(msec: number) {
  return new Promise(resolve => setTimeout(resolve, msec * 1000));
}

export async function generateRandom(noNodes: number) {
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

  buildAdjacentList();
}

export async function generatePropDup(noNodes: number) {
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
          (edge: Edge) =>
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
      .filter((edge: Edge) => edge.from === pickedHost);
    const inEdges = getEdges()
      .get()
      .filter((edge: Edge) => edge.to === pickedHost);
    let addedEdges = 0;
    outEdges
      .filter(() => Math.random() <= phi)
      .forEach((edge: Edge) => {
        if (i === edge.to) {
          throw new Error("Can not create self loop");
        }
        addEdge(i, Number(edge.to));
        addedEdges++;
      });

    inEdges
      .filter(() => Math.random() <= phi)
      .forEach((edge: Edge) => {
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
  buildAdjacentList();
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
$("#generate").click(() => {
  clear();
  const noNodes = Number($("#noNodes ").val());
  if ($("#propDup").prop("checked")) {
    generatePropDup(noNodes);
  } else {
    generateRandom(noNodes);
  }
});

