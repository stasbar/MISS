import _ from "lodash";

export function* defensiveAlliances(adjacentList: number[][], xi: number) {
  console.log(adjacentList.keys());
  const nodes = Array.from(adjacentList.keys());
  console.log(nodes);
  let counter = 0;
  for (let subset of subsets(nodes)) {
    counter++;
    if (isDefensiveAlliance(subset, adjacentList, xi)) {
      yield subset;
    }
  }
  console.log(`Power set of ${nodes.length} = ${counter}`);
}
// Generate all array subsets:
function* subsets(
  array: Array<number>,
  offset: number = 0
): Generator<Set<number>> {
  while (offset < array.length) {
    let first = array[offset++];
    for (let subset of subsets(array, offset)) {
      subset.add(first);
      if (subset.size > 0 && subset.size < array.length) {
        yield subset;
      }
    }
  }
  yield new Set();
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
