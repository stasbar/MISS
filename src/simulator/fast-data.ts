import { v4 as uuidv4 } from "uuid";

export enum State {
  // eslint-disable-next-line no-unused-vars
  HS, //Health Susceptible initial state
  // eslint-disable-next-line no-unused-vars
  IA, //Infected Acute when infected by EIP
  // eslint-disable-next-line no-unused-vars
  IR, // Infected Recoverable - when all neighbours are infected
  // eslint-disable-next-line no-unused-vars
  HQ, // Healthly Quarantine - healed, can stay here forever if stayed long enough
}

export interface Node {
  id: number;
  group: number;
}

export interface Edge {
  id: string;
  from: number;
  to: number;
}

interface DataType {
  edges: Map<string, Edge>;
  nodes: Node[];
  adjacentList?: number[][];
}

export class Data implements DataType {
  edges: Map<string, Edge> = new Map<string, Edge>();
  nodes: Node[] = [];
  adjacentList?: number[][];

  constructor(nodes: number | Node[], edges?: Map<string, Edge>) {
    if (typeof nodes === "number") {
      this.nodes = new Array(nodes as number);
      console.log("created empty nodes");
    } else if (Array.isArray(nodes)) {
      this.nodes = nodes;
      this.edges = edges;
      console.log("assigned nodes and edges");
    } else {
      throw new Error("unsupported");
    }
  }

  addNode(id: number, group: number = 0) {
    this.nodes[id] = { id, group };
  }
  updateNode(id: number, group: State) {
    this.nodes[id] = { ...this.nodes[id], id, group };
  }
  addEdge(from: number, to: number) {
    const id = uuidv4();
    this.edges.set(id, { id, from, to });
  }
  buildAdjacentList(directed: boolean = false) {
    const adjacentList = new Array<Array<number>>();
    this.edges.forEach((edge: Edge) => {
      const fromAdjances =
        adjacentList[Number(edge.from)] || new Array<number>();
      fromAdjances.push(Number(edge.to));
      adjacentList[Number(edge.from)] = fromAdjances;
      if (!directed) {
        const toAdjances = adjacentList[Number(edge.to)] || new Array<number>();
        toAdjances.push(Number(edge.from));
        adjacentList[Number(edge.to)] = toAdjances;
      }
    });
    this.adjacentList = adjacentList;
  }
  toJSON() {
    return this.nodes.map((node) => {
      const connections = [];
      for (let value of this.edges.values()) {
        if (value.from === node.id) {
          connections.push(value.to);
        }
      }
      return {
        id: String(node.id),
        connections,
      };
    });
  }
}
