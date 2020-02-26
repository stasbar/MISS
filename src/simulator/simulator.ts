import * as yargs from "yargs";
import { importNetwork } from "../utils";
import { generatePropDup } from "./fastGenerator";
import { Environment } from "./environment";
import { Data } from "./fast-data";
import fs from "fs";

const argv = yargs.argv;

let data: Data;
if (argv.in) {
  console.log(`Loading network from file ${argv.in}`);
  const networkJson = fs.readFileSync(argv.in as string);
  data = importNetwork(JSON.parse((networkJson as unknown) as string));
} else {
  console.log(`Generating new network`);
  data = generatePropDup(1000, 10, 20, 0.5, false);
}
const env = new Environment(data);

const publications: number = Number(argv.publications || 30);
const xi: number = Number(argv.xi || 0.25);
const tau: number = Number(argv.tau || 200);
const zhq: number = Number(argv.zhq || 1);
const zia: number = Number(argv.zhq || 100);

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
  `Extinctions/Epidemics ${extinctions}/${epidemics} = ${(extinctions /
    iterations) *
    100}/${(epidemics / iterations) * 100}`
);
