# Prisma Benchmark

## Getting Started

### Load database

https://github.com/lerocha/chinook-database

```
user: postgres
pass: postgres
database: chinook
```

### Configure PG

_postgresql.conf_

```
max_connections = 100
```

Restart database.

### Install

```
pnpm i
```

### Generate

```
prisma generate
```

### Run

```
ts-node -T .
```

## Results

```
MacBook Pro (16-inch, 2019)
2.4 GHz 8-Core Intel Core i9
```

```
No napi
{
  min: '25ms',
  max: '617ms',
  sum: '3m 17.5s',
  variance: '13.7s',
  mean: '198ms',
  stddev: '117ms',
  count: 1000,
  median: '160ms',
  p75: '203ms',
  p95: '518ms',
  p99: '601ms',
  p999: '617ms'
}
Napi
{
  min: '94ms',
  max: '436ms',
  sum: '5m 30.1s',
  variance: '1.5s',
  mean: '330ms',
  stddev: '40ms',
  count: 1000,
  median: '338ms',
  p75: '343ms',
  p95: '364ms',
  p99: '379ms',
  p999: '436ms'
}
```
