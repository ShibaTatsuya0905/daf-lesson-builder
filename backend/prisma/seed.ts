import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu nạp dữ liệu Sách giáo khoa...');

  const menschenA1 = await prisma.book.create({
    data: {
      title: 'Menschen A1.1',
      publisher: 'Hueber',
      level: 'A1',
      coverUrl: 'https://hueber.de/menschen',
    },
  });

  await prisma.lektion.create({
    data: {
      bookId: menschenA1.id,
      lektionNumber: 1,
      title: 'Hallo! Ich bin Nicole.',
      theme: 'Begrüßung und Vorstellung',
      contents: {
        create: [
          {
            type: 'VOCAB',
            data: [
              { id: 'v1', article: '-', german: 'Hallo', translation: 'Xin chào', plural: '-', example: 'Hallo, wie geht es dir?' },
              { id: 'v2', article: '-', german: 'Tschüs', translation: 'Tạm biệt', plural: '-', example: 'Tschüs, bis morgen!' },
              { id: 'v3', article: 'der', german: 'Name', translation: 'Tên', plural: 'Namen', example: 'Mein Name ist Anna.' },
              { id: 'v4', article: '-', german: 'kommen', translation: 'đến từ', plural: '-', example: 'Ich komme aus Vietnam.' },
            ],
          },
          {
            type: 'REDEMITTEL',
            data: [
              'Wie heißt du?',
              'Ich heiße...',
              'Woher kommst du?',
              'Ich komme aus...',
            ],
          },
        ],
      },
    },
  });

  await prisma.lektion.create({
    data: {
      bookId: menschenA1.id,
      lektionNumber: 3,
      title: 'Was kostet das?',
      theme: 'Essen, Trinken und Einkaufen',
      contents: {
        create: [
          {
            type: 'VOCAB',
            data: [
              { id: 'v5', article: 'der', german: 'Apfel', translation: 'Quả táo', plural: 'Äpfel', example: 'Ich esse einen Apfel.' },
              { id: 'v6', article: 'das', german: 'Brot', translation: 'Bánh mì', plural: 'Brote', example: 'Das Brot ist sehr frisch.' },
              { id: 'v7', article: 'die', german: 'Milch', translation: 'Sữa', plural: '-', example: 'Trinkst du gern Milch?' },
              { id: 'v8', article: '-', german: 'kaufen', translation: 'mua', plural: '-', example: 'Wir kaufen im Supermarkt ein.' },
              { id: 'v9', article: '-', german: 'kosten', translation: 'có giá là', plural: '-', example: 'Was kostet der Apfel?' },
            ],
          },
          {
            type: 'REDEMITTEL',
            data: [
              'Was kostet das Brot?',
              'Das kostet 2 Euro.',
              'Ich brauche noch Äpfel.',
              'Haben wir noch Milch?',
            ],
          },
        ],
      },
    },
  });

  console.log('Nạp dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });