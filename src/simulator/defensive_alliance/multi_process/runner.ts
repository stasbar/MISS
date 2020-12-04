import concurrently from "concurrently";

const nodes = [100, 300, 1000];
const xis = [0.2, 0.3];
const samples = [...Array(100)];

const commands = nodes
  .map((nodes) => {
    return xis.map((xi) => {
      return samples.map(() => {
        return {
          command: `ts-node src/simulator/defensive_alliance/multi_process/cli.ts -- --xi=${xi} --nodes=${nodes}`,
          name: `[${nodes}][${xi}]`,
        };
      });
    });
  })
  .flatMap((publications) =>
    publications.flatMap((xi) => xi.flatMap((iteration) => iteration))
  );

concurrently(commands, { maxProcesses: 8 });
