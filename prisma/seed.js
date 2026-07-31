import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
    },
  });

  await prisma.user.create({
    data: {
      name: "Srabani Kar",
      email: "srabanikar@gmail.com",
      passwordHash: "hashed-password",
      role: UserRole.ADMIN,
      workspaceId: workspace.id,
    },
  });

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });