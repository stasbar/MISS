import vis from "vis-network";
import data, { addNode, addEdge } from "./data";

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

async function delay(msec: number) {
  return new Promise(resolve => setTimeout(resolve, msec * 1000));
}

async function main() {
  for (let i: number = 0; i < 1000; i++) {
    await delay(0.01);
    /* await delayIndex(i); */
    const availableNodes = data.nodes.get();
    const pickedHost = Math.round(Math.random() * (availableNodes.length - 1));

    addNode(i, 0);
    addEdge(i, pickedHost);
  }

  const availableNodes = data.nodes.get();
  for (let i: number = 0; i < 1000; i++) {
    const first = Math.round(Math.random() * (availableNodes.length - 1));
    let second = Math.round(Math.random() * (availableNodes.length - 1));
    /* while (second === first) { */
    /*   second = Math.round(Math.random() * (availableNodes.length - 1)); */
    /* } */

    await delay(0.01);
    addEdge(first, second);
  }
}

main();
