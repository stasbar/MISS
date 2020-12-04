import concurrently from "concurrently";

const commands = [...Array(100),120, 140, 160, 200, 250, 300]
  .map((_, index) => index + 1)
  .map((publications) => {
    return [25, 50, 100, 300].map((zia) => {
      return [0.25, 0.51].map((xi) => {
        return {
          command: `npm run simulate -- --save --in=./src/probdup/test1000.json --xi=${xi} --zia=${zia} --zhq=${1} --tau=${200} --publications=${publications}`,
          name: `[${publications}][${xi}][${zia}][${1}][${200}]`,
        };
      });
    });
  })
  .flatMap((publications) =>
    publications.flatMap((zhq) => zhq.flatMap((value) => value))
  );

concurrently(commands, { maxProcesses: 8 });
