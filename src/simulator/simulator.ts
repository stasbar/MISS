import * as yargs from 'yargs'
import { importNetwork } from "../utils";
import {generatePropDup} from './fastGenerator';
import { Environment } from './environment';
import { Data } from './fast-data';

const argv = yargs.argv

let data: Data;
if (argv.in) {
  console.log(`Loading network from file ${argv.in}`)
  const networkJson = require(argv.in as string)
  data = importNetwork(networkJson);
} else {
  console.log(`Generating new network`)
  data = generatePropDup(1000, 10, 20, 0.5, false)
}
const env = new Environment(data);
env.start(10, 0.25, 100, 1, 200)
