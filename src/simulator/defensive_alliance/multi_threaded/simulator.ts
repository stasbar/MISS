import WorkerPool from "./worker_pool";
import * as os from "os";

const pool = new WorkerPool(os.cpus().length);

type Task = {
  xi: number;
  nodes: number;
};
const nodes = [100, 300, 1000];
const xis = [0.2, 0.3];
const samples = [...Array(100)];
const tasks = nodes.length * xis.length * samples.length;
let finished = 0;

nodes.forEach((nodes) =>
  xis.forEach((xi) =>
    samples.forEach(() => {
      const start = process.hrtime();
      pool.runTask<Task>({ xi, nodes }, (err, result) => {
      const end = process.hrtime(start);
        console.log(`Task finished in ${end[1] / 1000000}ms`, err, result);
        if (++finished === tasks) pool.close();
      });
    })
  )
);
