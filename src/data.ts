import vis from "vis-network";
import { moment } from "vis-timeline";
import { interval, BehaviorSubject, noop } from "rxjs";

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

var expirationTime: BehaviorSubject<moment.Moment> = new BehaviorSubject<
  moment.Moment
>(undefined);

interval(1000).subscribe(updateExpirationTimer);

expirationTime.subscribe({
  next: v => (v ? updateExpirationTimer() : noop())
});

export function addNode(id: number, group: number) {
  if (
    expirationTime.getValue() &&
    moment().isAfter(expirationTime.getValue())
  ) {
    console.error("Can not add node, file expired");
    console.log({ now: moment(), extendedTo: expirationTime });
    return;
  }

  if (!expirationTime.getValue()) {
    expirationTime.next(moment());
  }
  data.nodes.add({ id, group });
  expirationTime.next(expirationTime.getValue().add(4000, "ms"));
  console.log({ now: moment(), extendedTo: expirationTime });
}

export function removeNode(id: number) {
  data.nodes.remove({ id });
}

export function addEdge(from: number, to: number, hidden: boolean = false) {
  data.edges.add({ from, to, hidden });
}

export function clearNodes() {
  data.nodes.clear();
  data.edges.clear();
}

export function isExtinct() {
  return moment().isAfter(expirationTime.getValue());
}
export function updateExpirationTimer() {
  if (expirationTime.getValue()) {
    document.getElementById("expiration-timer").textContent =
      "File expire " + expirationTime.getValue().fromNow();
  }
}

export default data;
