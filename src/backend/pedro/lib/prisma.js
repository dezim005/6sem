const { PrismaClient } = require("@prisma/client");

const prisma = globalThis.__PRISMA__ || new PrismaClient();

module.exports = { prisma };
