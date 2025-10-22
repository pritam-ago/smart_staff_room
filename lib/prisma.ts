import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` across module reloads in development
  // eslint-disable-next-line vars-on-top
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
