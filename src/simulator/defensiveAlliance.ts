import _ from "lodash";
import BronKerbosch from "@seregpie/bron-kerbosch";

export function* suspected(adjacentList: number[][]) {
  interface INode {
    index: number;
    inWeight: number;
    outWeight: number;
    outNodes: number[];
    inNodes: number[];
    isSuspected: () => boolean;
  }
  function Node(index: number, neighbours: number[]): INode {
    const inNodes = neighbours.filter((neighbour) => neighbour > index);
    const inWeight = inNodes.length;
    const outNodes = neighbours.filter((neighbour) => neighbour < index);
    const outWeight = outNodes.length;

    function isSuspected(): boolean {
      return inWeight > outWeight;
    }

    return {
      index,
      inWeight,
      outWeight,
      outNodes,
      inNodes,
      isSuspected,
    };
  }

  for (const node of adjacentList.map((neighbours, index) =>
    Node(index, neighbours)
  )) {
    if (node.isSuspected()) {
      yield new Set([...node.inNodes, node.index]);
    }
  }
}

export function* defensiveAlliances(
  adjacentList: number[][],
  xi: number
): Generator<Set<number>> {
  for (let suspect of suspected(adjacentList)) {
    if (isDefensiveAlliance(new Set(suspect), adjacentList, xi)) {
      yield suspect;
    }
  }
  const edges = new Set(
    adjacentList
      .map((adjacents, index) => {
        return adjacents
          .map((value) => [
            [index, value],
            [value, index],
          ])
          .flatMap((value) => value);
      })
      .flatMap((value) => value)
  );

  const cliques: Array<Set<number>> = BronKerbosch(edges);
  for (let clique of cliques) {
    if (isDefensiveAlliance(clique, adjacentList, xi)) {
      yield clique;
    }
  }
}

function isDefensiveAlliance(
  candiateAlliance: Set<number>,
  adjacentList: number[][],
  xi: number
) {
  if (
    candiateAlliance.size < 2 || // does not check sets with two or less nodes
    candiateAlliance.size === adjacentList.length // does not check whole set
  )
    return false;
  const candidateAlly = Array.from(candiateAlliance);
  return candidateAlly.every((value) => {
    const neighbours = adjacentList[value];
    if (neighbours.length === 0) return false;
    const common = _.intersection(neighbours, candidateAlly);
    const fraction = common.length / neighbours.length;
    return fraction > 1 - xi;
  });
}
