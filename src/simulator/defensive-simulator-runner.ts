import concurrently from "concurrently";

const commands = [300, 500, 1000, 2000, 3000]
  .map((nodes) => {
    return [0.35, 0.4, 0.5].map((xi) => {
      return [...Array(100)].map(() => {
        return {
          command: `npm run simulate -- --findDefensiveAlliances --xi=${xi} --nodes=${nodes} --publications=0 --iterations=0`,
          name: `[${nodes}][${xi}]`,
        };
      });
    });
  })
  .flatMap((publications) =>
    publications.flatMap((xi) => xi.flatMap((iteration) => iteration))
  );

concurrently(commands, { maxProcesses: 8 });
