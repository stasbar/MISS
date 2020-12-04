import * as yargs from "yargs";
import { importNetwork } from "../utils";
import { generatePropDup } from "./fastGenerator";
import { Environment } from "./environment";
import fs from "fs";
import { Data } from "./fast-data";

const argv = yargs.argv;
console.log({ argv });

let data: Data;
if (argv.in) {
  console.log(`Loading network from file ${argv.in}`);
  const networkJson = fs.readFileSync(argv.in as string);
  data = importNetwork(JSON.parse((networkJson as unknown) as string));
} else {
  console.log(`Generating new network`);
  data = generatePropDup(
    Number(argv.nodes || 1000),
    Math.min(Number(argv.nodes || 1000), 10),
    20,
    0.5,
    false
  );
  fs.writeFileSync("lastGeneratedData.json", JSON.stringify(data));
}
const env = new Environment(data);

export interface Configuration {
  publications: number;
  iterations: number;
  xi: number;
  zia: number;
  zhq: number;
  tau: number;
}
export function performTest({
  publications,
  iterations,
  xi,
  zia,
  zhq,
  tau,
}: Configuration) {
  let extinctions = 0;
  let extinctionsClockCounter = 0;
  let epidemics = 0;
  let epidemicsClockCounter = 0;
  let epidemicsAfterPublications = 0;
  console.dir({
    nodes: env.data.nodes.length,
    edges: env.data.edges.size,
    publications,
    xi,
    tau,
    zhq,
    zia,
    iterations,
  });
  for (let index = 0; index < iterations; index++) {
    env.reset();
    env.start(publications, xi, tau, zhq, zia);

    if (env.extinction) {
      extinctions++;
      extinctionsClockCounter += env.clock;
    } else if (env.epidemic) {
      epidemics++;
      epidemicsClockCounter += env.clock;
      if (env.clock > publications) {
        epidemicsAfterPublications++;
      }
    }
  }
  console.log(
    `\nExtinctions/Epidemics ${extinctions}/${epidemics} = ${
      (extinctions / iterations) * 100
    }/${(epidemics / iterations) * 100} average cycles ${
      extinctions ? extinctionsClockCounter / extinctions : 0
    } / ${epidemics ? epidemicsClockCounter / epidemics : 0}`
  );
  return {
    epidemicProportion: Math.round((epidemics / iterations) * 100),
    epidemics,
    epidemicsAvgCycles: epidemics
      ? Math.round(epidemicsClockCounter / epidemics)
      : 0,
    extinctions,
    extinctionsAvgCycles: extinctions
      ? Math.round(extinctionsClockCounter / extinctions)
      : 0,
    epidemicsAfterPublications,
  };
}

const iterations: number = Number(argv.iterations ?? 50);
const publications: number = Number(argv.publications || 30);
const xi: number = Number(argv.xi || 0.25);
const zia: number = Number(argv.zia || 100);
const zhq: number = Number(argv.zhq || 1);
const tau: number = Number(argv.tau || 200);

const {
  epidemicProportion,
  epidemics,
  extinctions,
  epidemicsAvgCycles,
  extinctionsAvgCycles,
  epidemicsAfterPublications,
} = performTest({ publications, xi, zia, zhq, tau, iterations });

if (argv.save) {
  fs.appendFile(
    `outputs/zia${zia}xi${xi}.csv`,
    `"${publications}","${xi}","${zia}","${zhq}","${tau}","${epidemicProportion}","${epidemics}","${extinctions}","${epidemicsAvgCycles}","${extinctionsAvgCycles}","${epidemicsAfterPublications}"\n`,
    (error) => {
      console.error(error);
    }
  );
}

