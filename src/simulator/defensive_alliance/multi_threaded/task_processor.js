const { parentPort } = require("worker_threads");
const { generatePropDup } = require("../../fastGenerator");
const { findDefensiveAlliances } = require("../../helpers");

parentPort.on("message", (task) => {
  const data = generatePropDup(
    Number(task.nodes),
    Math.min(task.nodes, 10),
    20,
    0.5,
    false
  );
  findDefensiveAlliances(data, task.xi);

  parentPort.postMessage("done");
});
