import {PrismaClient as PrismaClientNapi} from './prisma/client'
import {PrismaClient as PrismaClientNoNapi} from './prisma/client-nonapi'
import pTimes from 'p-times'
import {performance} from 'perf_hooks'
const prettyMs = require('pretty-ms')
const Benchmark = require('benchmark')
const measured = require('measured-core')
var asciichart = require('asciichart')
const c = require('chalk')

main()
  .then()
  .catch(e => console.error(e))

async function main() {
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

function sampleData(oldArr, width) {
  const factor = Math.round(oldArr.length / width)
  return oldArr.filter(function (value, index, Arr) {
    return index % factor == 0
  })
}

async function runTest(useNapi) {
  const PrismaClient = useNapi ? PrismaClientNapi : PrismaClientNoNapi
  const prisma = new PrismaClient()

  const histogram = new measured.Histogram()

  const data = []

  await pTimes(
    1000,
    async () => {
      const start = now()
      const results = await prisma.customer.findMany()
      const duration = now() - start
      histogram.update(duration)
      data.push(duration)
    },
    {concurrency: 100},
  )
  const results = histogram.toJSON()

  await prisma.$disconnect()
  return {results, data}
}

function printResults({results}) {
  for (const key in results) {
    if (key === 'count') continue
    results[key] = prettyMs(results[key])
  }
  console.log(results)
}

////////////////////////////////////////////////////////////////////////////////

function now() {
  return performance.now()
}

////////////////////////////////////////////////////////////////////////////////

//const suite = new Benchmark.Suite()
//suite
//  .add('', () => {})
//  .on('cycle', function (event) {
//    console.log(String(event.target))
//  })
//  .on('complete', function () {
//    console.log('done')
//  })
//  .run()

////////////////////////////////////////////////////////////////////////////////
