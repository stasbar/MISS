import vis, { IdType } from "vis-network";
import { moment } from "vis-timeline";
import { interval } from "rxjs";
import { countBy, chain } from "lodash";

moment.updateLocale("en", {
  relativeTime: {
    s: "%d seconds"
  }
});

console.log("Evalutated data.ts");
const data = {
  nodes: new vis.DataSet(),
  edges: new vis.DataSet()
};

var expirationTime: moment.Moment = undefined;

interval(1000).subscribe(updateExpirationTimer);
interval(1000).subscribe(updateGraphFeatures);

export function addNode(id: number | string | IdType, group: number = 0) {
  if (expirationTime && moment().isAfter(expirationTime)) {
    console.error("Can not add node, file expired");
    console.log({ now: moment(), extendedTo: expirationTime });
    return;
  }

  if (!expirationTime) {
    expirationTime = moment();
  }

  data.nodes.add({ id, group });
  expirationTime = expirationTime.add(4000, "ms");
}

export function removeNode(id: number | vis.IdType) {
  data.nodes.remove({ id });
}

export function addEdge(
  from: number | string | IdType,
  to: number | string | IdType,
  hidden: boolean = false
) {
  data.edges.add({ from, to, hidden });
}

export function clearNodes() {
  data.nodes.clear();
  data.edges.clear();
}

export function isExtinct() {
  return moment().isAfter(expirationTime);
}

export function restore(nodes: vis.Node[], edges: vis.Edge[]) {
  if (nodes) {
    nodes.forEach(node => {
      addNode(node.id, 0);
    });
  }
  if (edges) {
    edges.forEach(edge => {
      addEdge(edge.from, edge.to, false);
    });
  }
}

export function persist() {
  console.log(JSON.stringify(data.nodes.get()));
  console.log(JSON.stringify(data.edges.get()));
}

function updateExpirationTimer() {
  if (expirationTime) {
    document.getElementById("expiration-timer").textContent =
      "File expire " + expirationTime.fromNow();
  }
}

function updateGraphFeatures() {
  (function updateTopInDegree() {
    const tos = countBy(data.edges.get(), "to");
    const sorted = chain(tos)
      .map((cnt, to) => ({ to, count: cnt }))
      .sortBy("count")
      .takeRight(10)
      .value();

    document.getElementById("max-in-degree").textContent =
      "Top10 In-Degree: " +
      sorted
        .reverse()
        .map(({ to, count }) => `𝞓(${to}) = ${count}`)
        .join(" | ");
  })();
  (function updateTopOutDegree() {
    const froms = countBy(data.edges.get(), "from");
    const sorted = chain(froms)
      .map((cnt, from) => ({ from, count: cnt }))
      .sortBy("count")
      .takeRight(10)
      .value();

    document.getElementById("max-out-degree").textContent =
      "Top10 Out-Degree: " +
      sorted
        .reverse()
        .map(({ from, count }) => `𝞓(${from}) = ${count}`)
        .join(" | ");
  })();
}

export default data;
