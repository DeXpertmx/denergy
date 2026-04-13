const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  const leadId = process.argv[2];
  if (!leadId) { console.error("Usage: node mark-proposal-sent.js <leadId>"); process.exit(1); }
  await db.lead.update({ where: { id: leadId }, data: { proposalSentAt: new Date() } });
  console.log("OK: " + leadId);
  await db.$disconnect();
})();
