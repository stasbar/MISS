import vis, { IdType } from "vis-network";
import { moment } from "vis-timeline";
import { interval } from "rxjs";
import { countBy, chain } from "lodash";

interface Data {
  nodes: vis.DataSet<any, "id">;
  edges: vis.DataSet<any, "id">;
}
moment.updateLocale("en", {
  relativeTime: {
    s: "%d seconds"
  }
});

console.log("Evalutated data.ts");
let data: Data = {
  nodes: new vis.DataSet(),
  edges: new vis.DataSet()
};

let clock = 0;
export function tic() {
  clock++;
}
export function getClock() {
  return clock;
}

var expirationTime: moment.Moment = undefined;

interval(1000).subscribe(updateExpirationTimer);
interval(1000).subscribe(updateCycleCount);
interval(1000).subscribe(updateGraphFeatures);

const resetListeners: Array<() => any> = [];
export function registerResetListener(listener: () => any) {
  resetListeners.push(listener);
}
export function clear() {
  data.nodes.clear();
  data.edges.clear();
  resetListeners.forEach(listener => listener());
}

export function getData(): Data {
  return data;
}

export function getNodes(): vis.DataSet<any, "id"> {
  return data.nodes;
}

export function getEdges(): vis.DataSet<any, "id"> {
  return data.edges;
}

const onDataSetListeeners: Array<(dataset: any) => any> = [];
export function addOnDataSetListener(listener: (data) => any) {
  onDataSetListeeners.push(listener);
}

export function setData(newData: Data) {
  clear();
  data = newData;
  onDataSetListeeners.forEach(listener => listener(data));
}

export function reset() {
  clock = 0;
  const newNodes = data.nodes.getIds().map(id => ({ id, group: 0 }));
  data.nodes.update(newNodes);
  resetListeners.forEach(listener => listener());
}

const onNodeChangeListeners: Array<(name: string, node: any) => any> = [];
export function addOnNodeChangeListener(
  listener: (name: string, node: any) => any
) {
  onNodeChangeListeners.push(listener);
}

export function addNode(id: IdType, group: number = 0) {
  if (expirationTime && moment().isAfter(expirationTime)) {
    console.error("Can not add node, file expired");
    console.log({ now: moment(), extendedTo: expirationTime });
    return;
  }

  if (!expirationTime) {
    expirationTime = moment();
  }

  data.nodes.add({ id, group, title: id });
  onNodeChangeListeners.forEach(listener =>
    listener("add", { id, group, title: id })
  );
  expirationTime = expirationTime.add(4000, "ms");
}

export function updateNode(id: number | string | IdType, group: number) {
  data.nodes.update({ id, group });
  onNodeChangeListeners.forEach(listener => listener("update", { id, group }));
}

export function removeNode(id: number | vis.IdType) {
  data.nodes.remove({ id });
  onNodeChangeListeners.forEach(listener => listener("remove", { id }));
}

const onEdgeChangeListeners: Array<(name: string, edge: any) => any> = [];
export function addOnEdgeChangeListener(
  listener: (name: string, edge: any) => any
) {
  onEdgeChangeListeners.push(listener);
}

export function addEdge(
  from: number | string | IdType,
  to: number | string | IdType
) {
  data.edges.add({ from, to });
  onEdgeChangeListeners.forEach(listener => listener("add", { from, to }));
}

export function isExtinct() {
  return moment().isAfter(expirationTime);
}

function updateExpirationTimer() {
  if (expirationTime) {
    document.getElementById("expiration-timer").textContent =
      "File expire " + expirationTime.fromNow();
  }
}

function updateCycleCount() {
  document.getElementById("cycles").textContent = getClock();
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
