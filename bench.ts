import pTimes from 'p-times'
import {PrismaClient as PrismaClientNapi} from './prisma/client'
import {PrismaClient as PrismaClientNoNapi} from './prisma/client-nonapi'
import {performance} from 'perf_hooks'

const prettyMs = require('pretty-ms')
const Benchmark = require('benchmark')
const measured = require('measured-core')
var asciichart = require('asciichart')
const c = require('chalk')

export function sampleData(oldArr, width) {
  const factor = Math.round(oldArr.length / width)
  return oldArr.filter(function (value, index, Arr) {
    return index % factor == 0
  })
}

export async function runTest(useNapi) {
  const {prisma} = await setup(useNapi)

  const histogram = new measured.Histogram()

  const data = []

  await pTimes(
    1000,
    async () => {
      const start = now()
      await test(prisma)
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

export function setup(useNapi) {
  const PrismaClient = useNapi ? PrismaClientNapi : PrismaClientNoNapi
  const prisma = new PrismaClient()
  return {prisma}
}

export async function test(prisma) {
  const results = await prisma.customer.findMany()
  return results
}

export function printResults({results}) {
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
