export async function testFindMany(prisma) {
  var results = await prisma.track.findMany();
  return results;
}

export async function testFindFirst(prisma) {
  var results = await prisma.track.findFirst({ where: { TrackId: 1 } });
  return results;
}

export async function testLargeInput(prisma) {
  const selection = Array.from({length: 1000}, () => {
    Math.floor(Math.random() * 4000);
  });

  const results = await prisma.track.findFirst({
    where: { TrackId: { in: selection } }
  });

  return results;
}
