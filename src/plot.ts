import vis from "vis-timeline";
import {
  State,
  getNodes,
  getEdges,
  getClock,
  registerResetListener
} from "./data";
import "./plot.css";

var DELAY = 500; // delay in ms to add new data points

// create a graph2d with an (currently empty) dataset
var container = document.getElementById("visualization");
var dataset = new vis.DataSet();
var groups = new vis.DataSet();

registerResetListener(() => {
  console.log("Called cleanup");
  dataset.clear();
  var now = getClock();
  var range = graph2d.getWindow();
  var interval = range.end - range.start;
  graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
});

groups.add({
  id: 0,
  content: "Nodes",
  options: {
    drawPoints: {
      style: "square" // square, circle
    },
    shaded: {
      orientation: "bottom" // top, bottom
    }
  }
});

groups.add({
  id: 1,
  content: "Edges",
  options: {
    drawPoints: {
      style: "circle" // square, circle
    }
  }
});

groups.add({
  id: 2,
  content: "Infected",
  className: "infected",
  options: {
    drawPoints: {
      style: "square" // square, circle
    }
  }
});

groups.add({
  id: 3,
  content: "Healthly",
  className: "healthly",
  options: {
    drawPoints: {
      style: "square" // square, circle
    }
  }
});

var options = {
  start: 0,
  end: 100,
  legend: true,
  dataAxis: {
    left: {
      range: {
        min: -1
      }
    }
  }
};

var graph2d = new vis.Graph2d(container, dataset, groups, options);

function renderStep() {
  // move the window (you can think of different strategies).
  var now = getClock();
  var range = graph2d.getWindow();
  var interval = range.end - range.start;
  const strategy = "static";

  switch (strategy) {
    case "continuous":
      // continuously move the window
      graph2d.setWindow(now - interval, now, { animation: false });
      requestAnimationFrame(renderStep);
      break;

    case "discrete":
      graph2d.setWindow(now - interval, now, { animation: false });
      setTimeout(renderStep, DELAY);
      break;

    default:
      // 'static'
      // move the window 90% to the left when now is larger than the end of the window
      if (now > range.end) {
        graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
      }
      setTimeout(renderStep, DELAY);
      break;
  }
}
renderStep();

/**
 * Add a new datapoint to the graph
 */
function addDataPoint() {
  // add a new data point to the dataset
  var now = getClock();
  dataset.update({
    x: now,
    y: getNodes().getIds().length,
    group: 0
  });
  dataset.update({
    x: now,
    y: getEdges().getIds().length,
    group: 1
  });
  dataset.update({
    x: now,
    y: getNodes()
      .get()
      .filter(node => node.group === State.IA || node.group === State.IR)
      .length,
    group: 2
  });
  dataset.update({
    x: now,
    y: getNodes()
      .get()
      .filter(node => node.group === State.HS || node.group === State.HQ)
      .length,
    group: 3
  });

  // remove all data points which are no longer visible
  var range = graph2d.getWindow();
  var interval = range.end - range.start;
  var oldIds = dataset.getIds({
    filter: function(item) {
      return item.x < range.start - interval;
    }
  });
  dataset.remove(oldIds);

  setTimeout(addDataPoint, DELAY);
}
addDataPoint();
