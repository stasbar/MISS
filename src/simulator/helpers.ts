import { defensiveAlliances } from "./defensive_alliance/defensiveAlliance";
import fs from "fs";
import { Data, State } from "./fast-data";

export function findDefensiveAlliances(data: Data, xi: number, zia: number = 100) {
  const defAlliances: Array<Set<number>> = [];
  for (let defAliance of defensiveAlliances(data.adjacentList, xi)) {
    defAlliances.push(defAliance);
    console.log("defensive alliance:", defAliance);
    fs.appendFile(
      `outputs/defensiveAlliance/xi${xi}nodes${data.nodes.length}.csv`,
      `"${data.nodes.length}","${xi}","${zia}"\n`,
      (error) => {
        console.error(error);
      }
    );
  }
  if (defAlliances.length > 0) {
    defAlliances.forEach((alliance) => {
      alliance.forEach((element) => {
        data.updateNode(element, State.IA);
      });
    });
    fs.writeFileSync(`outputs/defensiveAlliance/xi${xi}nodes${data.nodes.length}.json`, JSON.stringify(data));
  }
}
