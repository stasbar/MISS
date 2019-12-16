// Assumptions
//
// The node is the proof (in for of post/record etc.)
// Everyone can become node by posting a proof
// So one user can create many nodes
// Nodes creation is limited by public smart contract
// We add the node on the graph, only when it's available to other people
// to base thier assumptions on it.
// The suspicion level indicate the leaving edges of node
// suspition may vary from minSuspicion to maxSuspicion
// We assume that each node is equally popular, thus have the same chance of being trusted.
// We assume that there is always someone willing to participate in spreading the proof. This could be motivated by the fact that clicking the link could be profitable by some kind of cryptocurrency (for example BAT) while preventing from spam attacks (generating proof require some stake in form of transaction fee).

// Limitations
//
// Hidden nodes, one can consume time slot and don't publish proof, or his
// proof won't be spreaded
// DDoS on time slots

import vis from "vis-network";
import data, {
  addNode,
  removeNode,
  addEdge,
  isExtinct,
  clearNodes
} from "./data";
import "./plot";

async function delay(msec: number) {
  return new Promise(resolve => setTimeout(resolve, msec * 1000));
}

async function delayIndex(index: number) {
  return new Promise(resolve => setTimeout(resolve, (3 / (index + 1)) * 1000));
}

// create a network
var options = {
  nodes: {
    shape: "dot",
    size: 15,
    font: {
      size: 32,
      color: "#FFF"
    },
    borderWidth: 2
  },
  edges: {
    width: 2,
    arrows: "to"
  },
  physics: {
    enabled: true
  }
};

const networkContainer = document.getElementById("network");
new vis.Network(networkContainer, data, options);

const minSuspicion = 3;
const maxSuspicion = 5;
function randomSuspicion() {
  return Math.round(
    Math.random() * (maxSuspicion - minSuspicion) + minSuspicion
  );
}

async function main() {
  const initNodes = 5;
  for (let i = 0; i < initNodes; i++) {
    addNode(i, 0);
    if (i + 1 == initNodes) {
      addEdge(i, 0, true);
    } else {
      addEdge(i, i + 1, true);
    }

    /* await delay(3); */
    await delayIndex(i);
  }

  for (let i: number = initNodes; i < initNodes + 50; i++) {
    const suspicion = randomSuspicion();
    const availableNodes = data.nodes.get();

    if (i === initNodes + 2) {
      fakeNewsDetected();
    }

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

    // Could not spread
    if (edges.filter(edge => edge !== undefined).length < suspicion) {
      continue;
    }

    edges.forEach(edge => addEdge(edge.from, edge.to));

    addNode(i, Math.round(Math.random() * 9 + 1));
    if (isExtinct()) {
      clearNodes();
      return;
    }
    /* await delay(1); */
    await delayIndex(i);
  }

  while (true) {
    if (isExtinct()) {
      clearNodes();
    }
    await delay(1);
  }
}

function fakeNewsDetected() {
  rollBack();
}

async function rollBack() {
  removeNode(0);
  await delay(0.01);
  removeNode(1);
  await delay(0.01);
  removeNode(2);
  await delay(0.01);
  removeNode(3);
  await delay(0.01);
  removeNode(4);
}

// TODO plot diagram of minSuspition/fakeNewsDetection
// TODO try with non linear delays
// TODO add perplot detection
// TODO add curable nodes (remove them after some delay)
// TODO add reactiveness, each node check his trustline in term of valid proof existence. (Each program startup can perform validity check)
main();
