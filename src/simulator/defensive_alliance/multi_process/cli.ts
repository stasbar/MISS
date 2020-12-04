import * as yargs from "yargs";
import { importNetwork } from "../../utils";
import { generatePropDup } from "../fastGenerator";
import fs from "fs";
import {findDefensiveAlliances} from "../helpers";
import { Data } from "../fast-data";

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

const xi: number = Number(argv.xi || 0.25);
const zia: number = Number(argv.zia || 100);

findDefensiveAlliances(data, xi, zia)
