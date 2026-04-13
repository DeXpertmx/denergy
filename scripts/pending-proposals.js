const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const leads = await db.lead.findMany({
    where: {
      proposalSentAt: null,
      createdAt: { lte: cutoff }
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, nombre: true, email: true, whatsapp: true, cups: true, direccion: true, comercializadora: true, tarifa: true, potenciaP1: true, potenciaP2: true, consumoMensual: true, importeTotal: true, fechaFactura: true, periodoFacturacion: true, createdAt: true }
  });
  console.log(JSON.stringify({ count: leads.length, leads, cutoff: cutoff.toISOString() }, null, 2));
  await db.$disconnect();
})();
