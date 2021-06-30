'use strict';

import {printResults, printResultsCsv, runTest, sampleData, setup} from './bench';
import {testFindMany, testFindFirst, testLargeInput} from './tests';

const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');

const prettyMs = require('pretty-ms')
const Benchmark = require('benchmark')
const measured = require('measured-core')

var asciichart = require('asciichart')
const c = require('chalk')

main()
  .then()
  .catch(e => console.error(e))

async function main() {
  const parser = new ArgumentParser({
    description: 'Prisma Benchmarks'
  });

  parser.add_argument('-v', '--version', { action: 'version', version });
  parser.add_argument('-o', '--output', { help: 'csv or fancy' });

  const args = parser.parse_args();

  const tests = {
    testFindFirst: testFindFirst,
    testFindMany: testFindMany,
    testLargeInput: testLargeInput,
  };

  if (args.output == 'csv') {
    throw "Please write support for this again!"
  } else if (args.output == 'fancy') {
    const concurrencies = [1, 4, 8];

    for (const key in tests) {
      for (let i = 0; i < concurrencies.length; i++) {
        const concurrency = concurrencies[i];
        console.log(key + ", Concurrency=" + concurrency);

        await fancyTest(tests[key], concurrency);
      }
    }
  } else {
    throw "Please choose either `csv` or `fancy` output."
  }
}

async function fancyTest(f, concurrency) {
  const binary = await runTest(false, concurrency, f);
  const nodeApi = await runTest(true, concurrency, f);

  console.log('Binary');
  printResults(binary);
  console.log('Node-API');
  printResults(nodeApi);

  console.log(c.blue('Binary'));
  console.log(c.green('Node-API'));

  const width = 120;

  console.log(
    asciichart.plot([sampleData(binary.data, width), sampleData(nodeApi.data, width)], {
      height: 10,
      colors: [asciichart.blue, asciichart.green],
    }),
  );
}
