import * as yargs from "yargs";
import { importNetwork } from "../utils";
import { generatePropDup } from "./fastGenerator";
import { Environment } from "./environment";
import { Data } from "./fast-data";
import fs from "fs";

const argv = yargs.argv;
console.log({argv})

let data: Data;
if (argv.in) {
  console.log(`Loading network from file ${argv.in}`);
  const networkJson = fs.readFileSync(argv.in as string);
  data = importNetwork(JSON.parse((networkJson as unknown) as string));
} else {
  console.log(`Generating new network`);
  data = generatePropDup(Number(argv.nodes || 1000), 10, 20, 0.5, false);
}
const env = new Environment(data);

function performTest() {
  const publications: number = Number(argv.publications || 30);
  const xi: number = Number(argv.xi || 0.25);
  const tau: number = Number(argv.tau || 200);
  const zhq: number = Number(argv.zhq || 1);
  const zia: number = Number(argv.zia || 100);

  let extinctions = 0;
  let epidemics = 0;
  const iterations: number = Number(argv.iterations || 50);
  console.dir({
    nodes: env.data.nodes.length,
    edges: env.data.edges.size,
    publications,
    xi,
    tau,
    zhq,
    zia,
    iterations
  });
  for (let index = 0; index < iterations; index++) {
    env.reset();
    env.start(publications, xi, tau, zhq, zia);

    if (env.extinction) extinctions++;
    else if (env.epidemic) epidemics++;
  }
  console.log(
    `\nExtinctions/Epidemics ${extinctions}/${epidemics} = ${(extinctions /
      iterations) *
      100}/${(epidemics / iterations) * 100}`
  );
  return Math.round((extinctions / iterations) * 100);
}

if (!argv.all) {
  performTest();
} else {
  const results = [25, 50, 100, 200, 300, 500].map(zia => {
    argv.zia = zia;
    const extinctions = performTest();
    return { zia, extinctions };
  });

  const writer = fs.createWriteStream("outputs.csv");
  results.forEach(({ zia, extinctions }) => {
    writer.write(`"${zia}","${extinctions}"\n`);
  });

  writer.close();
}
