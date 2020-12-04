import nodeEdges1000NoGrape from "./probdup/nodeEdge1000NoGrape.json";
import nodeEdges1000 from "./probdup/nodeEdge1000.json";
import webOfTrust1000 from "./probdup/webOfTrust1000.json";
import grape from "./probdup/grape-cliquie.json";

import { getNetwork } from "./network";
import { importNetwork, exportNetwork } from "./utils";
import {
  setData,
  clear,
  addNode,
  addEdge,
  getNodes,
  getEdges,
  buildAdjacentList,
  getData,
} from "./data";

import { State, Node, Edge } from "./simulator/fast-data";
import { difference, intersection } from "lodash";

async function delay(msec: number) {
  return new Promise((resolve) => setTimeout(resolve, msec * 1000));
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

export async function generatePropDup(
  noNodes: number,
  initNodes: number,
  initEdges: number,
  phi: number,
  preventGrapening: boolean
) {
  console.log("generate");

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
    let from: number;
    let to: number;
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

  for (let i: number = initNodes; i < noNodes; i++) {
    await delay(0.001);
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

    if (addedEdges === 0 && preventGrapening) {
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
export async function generateWebOfTrust(
  noNodes: number,
  initNodes: number,
  initEdges: number,
  phi: number
) {
  // Build tree
  for (let i = 0; i < initNodes; i++) {
    await delay(0.1);
    addNode(i, 0);
    if (i == 0) continue; // there is no neighbour for the first added node

    const randomNeighbour = Number(Math.round(Math.random() * (i - 1)));
    addEdge(i, randomNeighbour);
  }

  //Fill with random edges
  for (let i = 0; i < initEdges - initNodes + 1; i++) {
    await delay(0.1);
    let from: number;
    let to: number;
    let searching: boolean = true;
    while (searching) {
      from = Math.floor(Math.random() * (initNodes - 1));
      to = Math.floor(Math.random() * (initNodes - 1));

      searching = Array.from(getEdges().get()).some(
        (edge: Edge) =>
          (edge.from === from && edge.to === to) ||
          (edge.from === to && edge.to === from)
      );
    }

    addEdge(from, to);
  }

  for (let i: number = initNodes; i < noNodes; i++) {
    await delay(0.01);
    let pickedHost = Math.floor(Math.random() * i);

    addNode(i, State.HS);
    addEdge(i, pickedHost);
  }
  buildAdjacentList();
  getNodes().forEach((node1) => {
    const allMyFriends = getData().adjacentList[node1.id];
    allMyFriends.forEach((myFriend: number) => {
      const hisFriends = getData().adjacentList[myFriend];
      const possibleNewFriends = difference(hisFriends, [
        ...allMyFriends,
        node1.id,
      ]);
      possibleNewFriends.forEach((possibleNewFriendIndex: number) => {
        const allHisFriends = getData().adjacentList[possibleNewFriendIndex];
        const commonFriends = intersection(allMyFriends, allHisFriends);
        console.log(
          `commonFriends ${commonFriends.length} / allMyFriends ${allMyFriends.length} >= ${phi}`
        );
        if (
          commonFriends.length / allHisFriends.length >= phi &&
          !getEdges()
            .get()
            .some(
              (edge) =>
                (edge.from === node1.id &&
                  edge.to === possibleNewFriendIndex) ||
                (edge.to === node1.id && edge.from === possibleNewFriendIndex)
            )
        ) {
          addEdge(node1.id, possibleNewFriendIndex);
        }
      });
    });
  });
  buildAdjacentList();
}

$("#dump").click(() => {
  const network = getNetwork();
  exportNetwork(network);
});

$("#restore1000NoGrape").click(() => {
  // @ts-ignore
  const data = importNetwork(nodeEdges1000NoGrape);
  setData(data);
});

$("#restore1000").click(() => {
  // @ts-ignore
  const data = importNetwork(nodeEdges1000);
  setData(data);
});
$("#restore1000webOfTrust").click(() => {
  // @ts-ignore
  const data = importNetwork(webOfTrust1000);
  setData(data);
});
$("#restoreGrape").click(() => {
  // @ts-ignore
  const data = importNetwork(grape);
  setData(data);
});
$("#generate").click(() => {
  clear();
  const initNodes = Number($("#initNodes").val());
  const initEdges = Number($("#initEdges").val());
  const phi = Number($("#phi").val());
  const noNodes = Number($("#noNodes ").val());
  if ($("#propDup").prop("checked")) {
    console.log("generate probDup");
    const preventGrape = $("#cbPreventGrape").prop("checked");
    generatePropDup(noNodes, initNodes, initEdges, phi, preventGrape);
  }
  if ($("#webOfTrust").prop("checked")) {
    console.log("generate webOfTrust");
    generateWebOfTrust(noNodes, initNodes, initEdges, phi);
  }
  if ($("#random").prop("checked")) {
    console.log("generate random");
    generateRandom(noNodes);
  }
});
