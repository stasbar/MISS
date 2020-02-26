import { Data, State, Node } from "./fast-data";
import { shuffle } from "lodash";

export class Environment {
  finished: boolean;
  clock: number;
  data: Data;

  constructor(data: Data) {
    this.finished = true;
    this.data = data;
  }

  reset() {
    this.clock = 0;
    this.data.nodes.forEach(
      (_, id) => (this.data.nodes[id] = { ...this.data.nodes[id], group: 0 })
    );
  }

  start(
    publishCount: number,
    xi: number,
    Zia: number,
    Zhq: number,
    tau: number
  ) {
    this.finished = false;
    for (let i = 0; i < publishCount; i++) {
      if (!this.finished) {
        this.publish(this.data);
      }
      if (!this.finished) {
        this.clock++;
        this.spread(this.data, xi, Zia, Zhq, tau, this.clock);
      }
    }
    while (!this.finished) {
      this.clock++;
      this.spread(this.data, xi, Zia, Zhq, tau, this.clock++);
    }
  }
  publish(data: Data) {
    console.log("publish");
    const availableNodes = data.nodes.filter(
      node => node.group === State.HS || node.group === State.HQ
    );

    if (availableNodes.length === 0) {
      console.error("Could not find healthly node");
      return;
    }
    const pickedHost =
      availableNodes[Math.round(Math.random() * (availableNodes.length - 1))];
    data.updateNode(pickedHost.id, State.IA);
    console.log(`infecting: ${pickedHost.id}`);
  }

  spread(
    data: Data,
    xi: number,
    Zia: number,
    Zhq: number,
    tau: number,
    clock: number
  ) {
    let indexes = new Array(data.nodes.length);
    for (let index = 0; index < indexes.length; index++) indexes[index] = index;

    shuffle(indexes).forEach(randomIndex => {
      const node = data.nodes[randomIndex];
      const neighbourRatio = this.calculateNeighbourRatioFor(data, node.id);

      if (node.group === State.HS) {
        if (neighbourRatio >= xi) {
          // More than epsilon of my neighbours are infected so do I
          data.updateNode(node.id, State.IA);
        }
      } else if (node.group === State.IA) {
        if (Math.random() <= 1 / Zia) {
          if (neighbourRatio === 1) {
            // All of my neighbours are infected so do I
            data.updateNode(node.id, State.IR);
          } else {
            data.updateNode(node.id, State.HQ);
          }
        }
      } else if (node.group === State.IR) {
        if (neighbourRatio < 1) {
          // Not all of my neighbours are infected, so I suspect that something is
          // going on there.
          data.updateNode(node.id, State.HQ);
        }
      } else if (node.group === State.HQ) {
        if (Math.random() <= 1 / Zhq && clock < tau) {
          if (neighbourRatio >= xi) {
            data.updateNode(node.id, State.IA);
          } else {
            data.updateNode(node.id, State.HS);
          }
        }
      }
    });
    this.checkBoundaryConditions(data);
  }

  calculateNeighbourRatioFor(data: Data, nodeId: number): number {
    const adjacents = data.adjacentList[nodeId];
    const ratio =
      adjacents.filter(neighbour => {
        const { group } = data.nodes[neighbour];
        return group === State.IA || group === State.IR;
      }).length / adjacents.length;

    return ratio;
  }

  checkBoundaryConditions(data: Data) {
    const isExtinction = !data.nodes.some(
      node => node.group === State.IA || node.group === State.IR
    );
    const isEpidemic = !data.nodes.some(
      node => node.group === State.HS || node.group === State.HQ
    );
    console.log(
      `Infected/Healthly: ${(data.nodes.filter(Environment.isInfected).length /
        data.nodes.length) *
        100}/${(data.nodes.filter(Environment.isHealthly).length /
        data.nodes.length) *
        100}`
    );
    if (isExtinction) {
      console.log("Extinction");
      this.finished = true;
    } else if (isEpidemic) {
      console.log("Epidemic");
      this.finished = true;
    }
  }

  static isInfected(node: Node): boolean {
    return node.group === State.IR || node.group === State.IA;
  }

  static isHealthly(node: Node): boolean {
    return node.group === State.HQ || node.group === State.HS;
  }
}
