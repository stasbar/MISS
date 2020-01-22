// Problems:
// 1) Lockup caused by blowballs,
// 2) Whole topology knowledge is assumed for each node in order to achieve
// randomness
// My proposition, use directed trust, so that we won't be locked up by nodes
// trusting us

// Can EIP infect HQ or only HS ?
// How do you measure epidemic ? All IA or IR ?

import {
  State,
  Node,
  updateNode,
  reset,
  getNodes,
  tic,
  getClock,
  calculateNeighbourRatioFor
} from "./data";

async function delay(msec: number) {
  return new Promise(resolve => setTimeout(resolve, msec * 1000));
}

function publish() {
  console.log("publish");
  const availableNodes = getNodes()
    .get()
    .filter(node => node.group === State.HS || node.group === State.HQ);

  if (availableNodes.length === 0) {
    console.error("Could not find healthly node");
    return;
  }
  const pickedHost =
    availableNodes[Math.round(Math.random() * (availableNodes.length - 1))];
  updateNode(pickedHost.id, State.IA);
  console.log(`infecting: ${pickedHost.id}`);
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

function spread() {
  tic();
  const xi = Number($("#xi").val());
  const Zia = Number($("#zia").val());
  const Zhq = Number($("#zhq").val());
  const tau = Number($("#tau").val());

  getNodes() //TODO make it random selection
    .get()
    .forEach((node: Node) => {
      const neighbourRatio = calculateNeighbourRatioFor(node.id);

      if (node.group === State.HS) {
        if (neighbourRatio >= xi) {
          // More than epsilon of my neighbours are infected so do I
          updateNode(node.id, State.IA);
        }
      } else if (node.group === State.IA) {
        if (Math.random() <= 1 / Zia) {
          if (neighbourRatio === 1) {
            // All of my neighbours are infected so do I
            updateNode(node.id, State.IR);
          } else {
            updateNode(node.id, State.HQ);
          }
        }
      } else if (node.group === State.IR) {
        if (neighbourRatio < 1) {
          // Not all of my neighbours are infected, so I suspect that something is
          // going on there.
          updateNode(node.id, State.HQ);
        }
      } else if (node.group === State.HQ) {
        if (Math.random() <= 1 / Zhq && getClock() < tau) {
          if (neighbourRatio >= xi) {
            updateNode(node.id, State.IA);
          } else {
            updateNode(node.id, State.HS);
          }
        }
      }
    });
  checkBoundaryConditions();
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
$("#reset").click(() => {
  finished = true;
  reset();
});
/* const data = importNetwork(nodeEdges1000); */
/* setData(data); */
