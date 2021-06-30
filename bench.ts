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

export async function runTest(useNapi, concurrency, f) {
  const {prisma} = await setup(useNapi)
  await prisma.$connect();

  const histogram = new measured.Histogram()
  const data = []

  // warmup
  await pTimes(
    100,
    async () => {
      await f(prisma)
    },
    { concurrency: 8 }
  )

  //test
  await pTimes(
    80,
    async () => {
      let length = data.push(undefined)

      const start = performance.now()
      await f(prisma)
      const duration = performance.now() - start

      histogram.update(duration)
      data[length-1] = duration
    },
    {concurrency: concurrency},
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

export function printResultsCsv(results) {
  var fields = Object.keys(results[0].results)
  var replacer = function(key, value) { return value === null ? '' : value }
  var csv = results.map(function(row){
    return fields.map(function(fieldName){
      return JSON.stringify(row.results[fieldName], replacer)
    }).join(',')
  })
  csv.unshift(fields.join(',')) // add header column
  csv = csv.join('\r\n');
  console.log(csv)

  console.log("---- Graph ----")

  var csv = results.map(function(row) {
    return row.data.join(',')
  })

  console.log(csv.join('\r\n'))
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
