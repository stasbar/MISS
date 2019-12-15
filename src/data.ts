import vis from "vis-network";

console.log("Evalutated data.ts");
const data = {
  nodes: new vis.DataSet(),
  edges: new vis.DataSet()
};

export function addNode(id: number, group: number) {
  data.nodes.add({ id, group });
}

export function removeNode(id: number) {
  data.nodes.remove({ id });
}

export function addEdge(from: number, to: number, hidden: boolean = false) {
  data.edges.add({ from, to, hidden });
}

export default data;
