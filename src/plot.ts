import { Graph2d } from "vis-timeline";
import { DataSet } from "vis-data";
import { getNodes, getClock, registerResetListener } from "./data";
import "./plot.css";
import { State } from "./simulator/fast-data";

var DELAY = 500; // delay in ms to add new data points

// create a graph2d with an (currently empty) dataset
var container = document.getElementById("visualization");
const dataset = new DataSet();
const groups = new DataSet();

registerResetListener(() => {
  console.log("Called cleanup");
  dataset.clear();
  var now = getClock();
  var { end, start } = graph2d.getWindow();
  var interval = end.getTime() - start.getTime();
  graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
});

groups.add({
  id: 0,
  // @ts-ignore
  content: "Nodes",
  options: {
    drawPoints: {
      style: "square", // square, circle
    },
    shaded: {
      orientation: "bottom", // top, bottom
    },
  },
});

groups.add({
  id: 1,
  // @ts-ignore
  content: "Infected",
  className: "infected",
  options: {
    drawPoints: {
      style: "square", // square, circle
    },
  },
});

groups.add({
  id: 2,
// @ts-ignore
  content: "Healthly",
  className: "healthly",
  options: {
    drawPoints: {
      style: "square", // square, circle
    },
  },
});

var options = {
  start: 0,
  end: 100,
  legend: true,
  dataAxis: {
    left: {
      range: {
        min: -1,
      },
    },
  },
};

  // @ts-ignore
var graph2d = new Graph2d(container, dataset, groups, options);

function renderStep() {
  // move the window (you can think of different strategies).
  var now = getClock();
  var range = graph2d.getWindow();
  var interval = range.end.getTime() - range.start.getTime();
  // move the window 90% to the left when now is larger than the end of the window
  if (now > range.end.getTime()) {
    graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
  }
  setTimeout(renderStep, DELAY);
}
renderStep();

/**
 * Add a new datapoint to the graph
 */
function addDataPoint() {
  // add a new data point to the dataset
  var now = getClock();
  dataset.update({
  // @ts-ignore
    x: now,
    y: getNodes().getIds().length,
    group: 0,
  });
  dataset.update({
  // @ts-ignore
    x: now,
    y: getNodes()
      .get()
      .filter((node) => node.group === State.IA || node.group === State.IR)
      .length,
    group: 1,
  });
  dataset.update({
  // @ts-ignore
    x: now,
    y: getNodes()
      .get()
      .filter((node) => node.group === State.HS || node.group === State.HQ)
      .length,
    group: 2,
  });

  // remove all data points which are no longer visible
  var range = graph2d.getWindow();
  var interval = range.end.getTime() - range.start.getTime();
  var oldIds = dataset.getIds({
    filter: function (item) {
      // @ts-ignore
      return item.x < range.start.getTime() - interval;
    },
  });
  dataset.remove(oldIds);

  setTimeout(addDataPoint, DELAY);
}
addDataPoint();
