import b from 'benny'
import {setup, test} from './bench'

export default async function bennyBenchmark() {
  b.suite(
    'customers.findMany',

    b.add('NAPI', async () => {
      const useNapi = true
      const {prisma} = await setup(useNapi)
      return async () => {
        await test(prisma)
      }
    }),

    b.add('NO NAPI', async () => {
      const useNapi = false
      const {prisma} = await setup(useNapi)
      return async () => {
        await test(prisma)
      }
    }),

    b.cycle(),
    b.complete(),
    b.save({file: 'customers.findMany', version: '1.0.0'}),
    b.save({file: 'customers.findMany', format: 'chart.html'}),
  )
}

