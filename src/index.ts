import vis from "vis-network";
import data from "./data";
import "./plot";

async function delay(msec) {
  return new Promise(resolve => setTimeout(resolve, msec * 1000));
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
const steps = [
  {
    node: { id: 0, label: "FB", group: 0 },
    edge: [
      { from: 0, to: 1, hidden: true },
      { from: 1, to: 2, hidden: true },
      { from: 2, to: 3, hidden: true },
      { from: 3, to: 4, hidden: true },
      { from: 4, to: 0, hidden: true }
    ]
  },
  {
    node: { id: 1, label: "TW", group: 0 },
    edge: []
  },
  {
    node: { id: 2, label: "KB", group: 0 },
    edge: []
  },
  {
    node: { id: 3, label: "GH", group: 0 },
    edge: []
  },
  {
    node: { id: 4, label: "WWW", group: 0 },
    edge: []
  }
];

async function main() {
  for (let i = 0; i < steps.length; i++) {
    const { node, edge } = steps[i];
    data.nodes.add(node);
    data.edges.add(edge);

    await delay(3);
  }

  for (let i: number = steps.length; i < steps.length + 15; i++) {
    const suspicion = randomSuspicion();
    const availableNodes = data.nodes.getIds();

    if (i === steps.length + 1) {
      fakeNewsDetected();
    }

    const edges = Array.from({ length: suspicion }, () => {
      return availableNodes.length > 0
        ? {
            from: i,
            to: availableNodes.splice(
              Math.round(Math.random() * (availableNodes.length - 1)),
              1
            )[0]
          }
        : undefined;
    });

    // Could not spread
    if (edges.filter(edge => edge !== undefined).length < suspicion) {
      continue;
    }

    data.edges.add(edges);

    const node = {
      id: i,
      label: "FB",
      group: Math.round(Math.random() * 9 + 1)
    };
    data.nodes.add(node);

    await delay(1);
  }
}

function fakeNewsDetected() {
  rollBack();
}

async function rollBack() {
  data.nodes.remove({ id: 0 });
  await delay(0.1);
  data.nodes.remove({ id: 1 });
  await delay(0.1);
  data.nodes.remove({ id: 2 });
  await delay(0.1);
  data.nodes.remove({ id: 3 });
  await delay(0.1);
  data.nodes.remove({ id: 4 });
}

// TODO plot diagram of minSuspition/fakeNewsDetection
// TODO try with non linear delays
// TODO add perplot detection
// TODO add curable nodes (remove them after some delay)
main();

