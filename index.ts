import {PrismaClient as PrismaClientNapi} from './prisma/client'
import {PrismaClient as PrismaClientNoNapi} from './prisma/client-nonapi'
import pTimes from 'p-times'
import {performance} from 'perf_hooks'
const prettyMs = require('pretty-ms')
const Benchmark = require('benchmark')
const measured = require('measured-core')

main().then().catch(e => console.error(e))

async function main() {
  const a = await runTest(false)
  const b = await runTest(true)
  console.log('No napi')
  printResults(a)
  console.log('Napi')
  printResults(b)
}

async function runTest(useNapi) {
  const PrismaClient = useNapi ? PrismaClientNapi : PrismaClientNoNapi
  const prisma = new PrismaClient()

  const histogram = new measured.Histogram()

  await pTimes(
    1000,
    async () => {
      const start = now()
      const results = await prisma.customer.findMany()
      histogram.update(now() - start)
    },
    {concurrency: 100},
  )
  const results = histogram.toJSON()

  await prisma.$disconnect()
  return results
}

function printResults(results) {
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
