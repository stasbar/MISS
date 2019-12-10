import vis from "vis-network";

async function delay(msec) {
  return new Promise(resolve => setTimeout(resolve, msec * 1000));
}

// create a network
var container = document.getElementById("app");
var data = {
  nodes: new vis.DataSet([]),
  edges: new vis.DataSet([])
};
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
  }
};

new vis.Network(container, data, options);

const minSuspicion = 2;
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

    await delay(0.1);
  }

  for (let i = steps.length; i < steps.length + 30; i++) {
    const suspicion = randomSuspicion();

    const edges = Array.from({ length: suspicion }, () => {
      return {
        from: i,
        to: Math.round(Math.random() * data.edges.length) // TODO prevent duplication
      };
    });
    console.log(`suspition: ${suspicion} edges: ${edges.length}`);
    data.edges.add(edges);

    const node = { id: i, label: "FB", group: i };
    data.nodes.add(node);

    await delay(1);
  }
}

main();
