// Write a script to populate the folder_order field in the folder table
//
// Path: prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const folders = await prisma.folder.findMany({
    where: {
      user_id: "cldye57zw0000obudma4ewyvr",
    },
  });

  const folderOrder = folders.map((folder) => folder.id);
  const response = await prisma.user.update({
    where: {
      id: "cldye57zw0000obudma4ewyvr",
    },
    data: {
      folder_order: folderOrder.join(","),
    },
  });
  console.log(response);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
