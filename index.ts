import {printResults, printResultsCsv, runTest, sampleData} from './bench'
import bennyBenchmark from './benny'

const prettyMs = require('pretty-ms')
const Benchmark = require('benchmark')
const measured = require('measured-core')
var asciichart = require('asciichart')
const c = require('chalk')

main()
  .then()
  .catch(e => console.error(e))

async function main() {
  //await customCsv()
  await custom()
}

async function customCsv() {
  const nApi = await runTest(false)
  const binary = await runTest(true)
  printResultsCsv([nApi, binary])
}

async function custom() {
  const a = await runTest(false)
  const b = await runTest(true)
  console.log('No napi')
  printResults(a)
  console.log('Napi')
  printResults(b)

  console.log(c.blue('No napi'))
  console.log(c.green('Napi'))
  const width = 120
  console.log(
    asciichart.plot([sampleData(a.data, width), sampleData(b.data, width)], {
      height: 10,
      colors: [asciichart.blue, asciichart.green],
    }),
  )
}

async function benny() {
  await bennyBenchmark()
}
