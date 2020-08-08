import vis from "vis-network";
import { moment } from "vis-timeline";
import { interval } from "rxjs";
import { countBy, chain } from "lodash";
import { State, Node, Edge, Data as FastData } from "./simulator/fast-data";
import { v4 as uuidv4 } from "uuid";
import Chart from "chart.js";

interface UINode extends Node {
  title: number;
}
interface Data {
  nodes: vis.DataSet<UINode, "id">;
  edges: vis.DataSet<Edge, "id">;
  adjacentList?: number[][];
}

moment.updateLocale("en", {
  relativeTime: {
    s: "%d seconds",
  },
});

console.log("Evalutated data.ts");
let data: Data = {
  nodes: new vis.DataSet(),
  edges: new vis.DataSet(),
  adjacentList: undefined,
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
interval(5000).subscribe(updateGraphFeatures);

const resetListeners: Array<() => any> = [];
export function registerResetListener(listener: () => any) {
  resetListeners.push(listener);
}
export function clear() {
  data.nodes.clear();
  data.edges.clear();
  data.adjacentList = undefined;
  resetListeners.forEach((listener) => listener());
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

export function setData(newData: FastData) {
  clear();
  window.adjacentList = newData.adjacentList;
  data = {
    //@ts-ignore
    nodes: new vis.DataSet(newData.nodes),
    //@ts-ignore
    edges: new vis.DataSet(Array.from(newData.edges.values())),
  };
  buildAdjacentList()
  onDataSetListeeners.forEach((listener) => listener(data));
}

export function buildAdjacentList() {
  const adjacentList = new Array<Array<number>>();
  getEdges().forEach((edge) => {
    const fromAdjances = adjacentList[Number(edge.from)] || new Array<number>();
    fromAdjances.push(Number(edge.to));
    adjacentList[Number(edge.from)] = fromAdjances;
    if (!$("#cbDirected").prop("checked")) {
      const toAdjances = adjacentList[Number(edge.to)] || new Array<number>();
      toAdjances.push(Number(edge.from));
      adjacentList[Number(edge.to)] = toAdjances;
    }
  });
  data.adjacentList = adjacentList;
  window.adjacentList = adjacentList;
}

export function calculateNeighbourRatioFor(nodeId: number): number {
  const adjacents = data.adjacentList[nodeId];
  const ratio =
    adjacents.filter(
      (neighbour) =>
        data.nodes.get(neighbour).group === State.IA ||
        data.nodes.get(neighbour).group === State.IR
    ).length / adjacents.length;

  return ratio;
}

export function reset() {
  clock = 0;
  const newNodes = data.nodes
    .getIds()
    .map((id) => ({ id: Number(id), group: 0 }));
  data.nodes.update(newNodes);
  resetListeners.forEach((listener) => listener());
}

const onNodeChangeListeners: Array<(name: string, node: any) => any> = [];
export function addOnNodeChangeListener(
  listener: (name: string, node: any) => any
) {
  onNodeChangeListeners.push(listener);
}

export function addNode(id: number, group: number = 0) {
  data.nodes.add({ id, group, title: id });
  onNodeChangeListeners.forEach((listener) =>
    listener("add", { id, group, title: id })
  );
}

export function updateNode(id: number, group: number) {
  data.nodes.update({ id, group });
  onNodeChangeListeners.forEach((listener) =>
    listener("update", { id, group })
  );
}

const onEdgeChangeListeners: Array<(name: string, edge: any) => any> = [];
export function addOnEdgeChangeListener(
  listener: (name: string, edge: any) => any
) {
  onEdgeChangeListeners.push(listener);
}

export function addEdge(from: number, to: number) {
  data.edges.add({ id: uuidv4(), from, to });
  onEdgeChangeListeners.forEach((listener) => listener("add", { from, to }));
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
  document.getElementById("cycles").textContent = `${getClock()}`;
}

const myChart = new Chart("histogram", {
  type: "bar",
  data: {
    labels: ["Degree"],
    datasets: [
      {
        label: "Degree",
        data: [],
        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)"],
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
      xAxes: [
        {
          // type: 'logarithmic',
        },
      ],
    },
  },
});

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

  (function updateHistogram() {
    const reversed = data.edges
      .get()
      .map((value) => ({ from: value.to, to: value.from }));
    const froms = countBy([...reversed, ...data.edges.get()], "from");
    const items = chain(froms)
      .map((cnt, from) => ({ from, count: cnt }))
      .sortBy("count")
      .value();
    const counts = countBy(items, "count");
    const grouped = chain(counts)
      .map((value, degree) => ({ degree, count: value }))
      // .sortBy("count")
      // .reverse()
      .value();

    myChart.data.labels = grouped.map((item) => item.degree);
    myChart.data.datasets = [
      {
        label: "Degree",
        backgroundColor: "rgba(0, 0, 0, 1)",
        borderColor: "rgba(255, 99, 132, 1)",
        data: grouped.map((item) => item.count),
      },
    ];
    myChart.update();
  })();
}
