import { Data, Edge, State } from "./fast-data";

export function generateRandom(noNodes: number): Data {
  const data = new Data(noNodes);
  for (let i: number = 0; i < noNodes; i++) {
    const availableNodes = data.nodes;
    const pickedHost = Math.round(Math.random() * (availableNodes.length - 1));

    data.addNode(i, 0);
    if (i !== 0) {
      data.addEdge(i, pickedHost);
    }
  }

  const availableNodes = data.nodes;
  for (let i: number = 0; i < noNodes; i++) {
    const from = Math.round(Math.random() * (availableNodes.length - 1));
    let to = Math.round(Math.random() * (availableNodes.length - 1));
    while (from === to) {
      to = Math.round(Math.random() * (availableNodes.length - 1));
    }

    data.addEdge(to, from);
  }

  data.buildAdjacentList(false);
  return data;
}

export function generatePropDup(
  noNodes: number,
  initNodes: number,
  initEdges: number,
  phi: number,
  preventGrape: boolean
): Data {
  const data = new Data(noNodes);
  // Build tree
  for (let i = 0; i < initNodes; i++) {
    data.addNode(i, 0);
    if (i == 0) continue;

    const randomNeighbour = Number(Math.round(Math.random() * (i - 1)));
    data.addEdge(i, randomNeighbour);
  }

  //Fill with random edges
  for (let i = 0; i < initEdges - initNodes + 1; i++) {
    let from: number;
    let to: number;
    let searching: boolean = true;
    while (searching) {
      from = Math.floor(Math.random() * (initNodes- 1))
      to = Math.floor(Math.random() * (initNodes- 1))

      searching = Array.from(data.edges.values()).some(
        (edge: Edge) =>
          (edge.from === from && edge.to === to) ||
          (edge.from === to && edge.to === from)
      );
    }

    data.addEdge(from, to);
  }

  for (let i: number = initNodes; i < noNodes; i++) {
    let pickedHost = Math.floor(Math.random() * i);
    const edges = Array.from(data.edges.values())

    const outEdges = edges.filter(
      (edge: Edge) => edge.from === pickedHost
    );
    const inEdges = edges.filter((edge: Edge) => edge.to === pickedHost);
    let addedEdges = 0;
    outEdges
      .filter(() => Math.random() <= phi)
      .forEach((edge: Edge) => {
        if (i === edge.to) {
          throw new Error("Can not create self loop");
        }
        data.addEdge(i, Number(edge.to));
        addedEdges++;
      });

    inEdges
      .filter(() => Math.random() <= phi)
      .forEach((edge: Edge) => {
        if (i === edge.from) {
          throw new Error("Can not create self loop");
        }
        data.addEdge(i, Number(edge.from));
        addedEdges++;
      });

    if (addedEdges === 0 && preventGrape) {
      let randomNeighbour = 0;
      if (Math.random() < 0.5 && outEdges.length > 0) {
        const randomEdge =
          outEdges[Math.floor(Math.random() * (outEdges.length - 1))];
        randomNeighbour = randomEdge.to;
      } else if (inEdges.length > 0) {
        const randomEdge =
          inEdges[Math.round(Math.random() * (inEdges.length - 1))];
        randomNeighbour = randomEdge.from;
      } else {
        const randomEdge =
          outEdges[Math.round(Math.random() * (outEdges.length - 1))];
        randomNeighbour = randomEdge.to;
      }

      if (i === randomNeighbour) {
        throw new Error("Can not create self loop");
      }
      data.addEdge(i, Number(randomNeighbour));
      addedEdges++;
    }

    data.addNode(i, State.HS);
    data.addEdge(i, pickedHost);
  }
  data.buildAdjacentList(false);
  return data;
}
