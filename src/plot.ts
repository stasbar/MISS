import vis from "vis-timeline";
import data from "./data";
var DELAY = 500; // delay in ms to add new data points

// create a graph2d with an (currently empty) dataset
var container = document.getElementById("visualization");
var dataset = new vis.DataSet();
var groups = new vis.DataSet();
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
  options: {
    drawPoints: {
      style: "square" // square, circle
    }
  }
});

var options = {
  start: vis.moment().add(-30, "seconds"), // changed so its faster
  end: vis.moment(),
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

// a function to generate data points
function y(x) {
  return (Math.sin(x / 2) + Math.cos(x / 4)) * 5;
}

function renderStep() {
  // move the window (you can think of different strategies).
  var now = vis.moment();
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
  var now = vis.moment();
  dataset.add({
    x: now,
    y: data.nodes.getIds().length,
    group: 0
  });
  dataset.add({
    x: now,
    y: data.edges.getIds().length,
    group: 1
  });
  dataset.add({
    x: now,
    y: data.nodes.get().filter(node => node.group === 1).length,
    group: 2
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
