import 'tsconfig-paths/register';
import { earnData } from "@/utils/consts";
import prisma from '@/utils/prisma';

async function main() {
  console.log('Start seeding...');

  for (const category of earnData) {
    for (const task of category.tasks) {
      const createdTask = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          tokens: task.tokens,
          type: task.type,
          category: category.category,
          image: task.image,
          callToAction: task.callToAction,
          link: task.link,
          taskStartTimestamp: task.taskStartTimestamp,
        },
      });
      console.log(`Created task with id: ${createdTask.id}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
