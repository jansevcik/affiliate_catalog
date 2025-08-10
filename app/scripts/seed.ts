
import { PrismaClient, XmlFormat } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test admin user
  const adminPasswordHash = await bcryptjs.hash('admin123', 12);
  const testPasswordHash = await bcryptjs.hash('johndoe123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    }
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      passwordHash: testPasswordHash,
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false
    }
  });

  console.log('✅ Created users');

  // Create affiliate programs
  let horsimo = await prisma.affiliateProgram.findFirst({
    where: { name: 'Horsimo.cz' }
  });
  
  if (!horsimo) {
    horsimo = await prisma.affiliateProgram.create({
      data: {
        name: 'Horsimo.cz',
        baseUrl: 'https://ehub.cz/system/scripts/click.php?a_aid=8409eef7&a_bid=horsimo',
        commissionRate: 5.5,
        cookieDays: 30,
        restrictions: 'Horse and pet supplies only'
      }
    });
  }

  let zilkahodinky = await prisma.affiliateProgram.findFirst({
    where: { name: 'Žilkahodinky.cz' }
  });
  
  if (!zilkahodinky) {
    zilkahodinky = await prisma.affiliateProgram.create({
      data: {
        name: 'Žilkahodinky.cz',
        baseUrl: 'https://ehub.cz/system/scripts/click.php?a_aid=562e063d&a_bid=d1bc0dbb',
        commissionRate: 6.4,
        cookieDays: 14,
        restrictions: 'Watches and jewelry only'
      }
    });
  }

  console.log('✅ Created affiliate programs');

  // Create categories
  const horseCategory = await prisma.category.upsert({
    where: { slug: 'vse-pro-kone-a-poniky' },
    update: {},
    create: {
      name: 'VŠE PRO KONĚ A PONÍKY',
      slug: 'vse-pro-kone-a-poniky',
      description: 'Vše pro koně a poníky'
    }
  });

  const horseCareCategory = await prisma.category.upsert({
    where: { slug: 'cisteni-kone' },
    update: {},
    create: {
      name: 'ČIŠTĚNÍ KONĚ',
      slug: 'cisteni-kone',
      parentId: horseCategory.id
    }
  });

  const horseCosmeticsCategory = await prisma.category.upsert({
    where: { slug: 'kosmetika-pro-kone' },
    update: {},
    create: {
      name: 'Kosmetika pro koně',
      slug: 'kosmetika-pro-kone',
      parentId: horseCareCategory.id
    }
  });

  const watchesCategory = await prisma.category.upsert({
    where: { slug: 'hodinky' },
    update: {},
    create: {
      name: 'Hodinky',
      slug: 'hodinky',
      description: 'Kvalitní hodinky různých značek'
    }
  });

  const mensWatchesCategory = await prisma.category.upsert({
    where: { slug: 'panske-hodinky' },
    update: {},
    create: {
      name: 'Pánské hodinky',
      slug: 'panske-hodinky',
      parentId: watchesCategory.id
    }
  });

  const womensWatchesCategory = await prisma.category.upsert({
    where: { slug: 'damske-hodinky' },
    update: {},
    create: {
      name: 'Dámské hodinky',
      slug: 'damske-hodinky',
      parentId: watchesCategory.id
    }
  });

  console.log('✅ Created categories');

  // Create sample products from XML data
  const horsimoProducts = [
    {
      externalId: 'GH-111',
      name: 'ABSORBINE Lesk pro konečnou úpravu ShowSheen, 444 ml',
      description: 'Unikátní lesk ve spreji, vyvinutý tak, aby přinášel nesrovnatelnou pomoc při péči o srst, hřívu i ocas koně. Rychleschnoucí sprej pokryje srst koně pravidelně a nezanechává šmouhy nebo pruhy.',
      price: 581.00,
      originalUrl: 'https://www.horsimo.cz/absorbine-showsheen-lesk-sprej-pro-finalni-upravu/',
      imageUrl: 'https://cdn.myshoptet.com/usr/www.horsimo.cz/user/shop/orig/22447_lesk-pro-konecnou-upravu-showsheen--444-ml.jpg?5fa906a6',
      brand: 'ABSORBINE',
      ean: '011444032090',
      availability: 'in stock',
      condition: 'new',
      shippingWeight: 0.444,
      categoryId: horseCosmeticsCategory.id,
      affiliateProgramId: horsimo.id,
      attributes: [
        { name: 'custom_label_2', value: 'Akce' },
        { name: 'adult', value: 'FALSE' },
        { name: 'item_group_id', value: '22447' }
      ]
    },
    {
      externalId: 'GH-78',
      name: 'ABSORBINE Repelent UltraShield Absorbine, 946 ml',
      description: 'Špičkový americký repelent s pyrethroidy na českém trhu! Opravdu účinný repelent s dlouhotrvajícím účinkem. Hubí a odpuzuje přes 70 druhů hmyzu včetně hovad a klíšťat.',
      price: 1552.00,
      originalUrl: 'https://www.horsimo.cz/repelent-ultra-shield-black/',
      imageUrl: 'https://cdn.myshoptet.com/usr/www.horsimo.cz/user/shop/orig/22450_repelent-ultrashield-absorbine--946-ml.png?64cb26f1',
      brand: 'ABSORBINE',
      ean: '074261208',
      availability: 'in stock',
      condition: 'new',
      shippingWeight: 1.0,
      categoryId: horseCategory.id,
      affiliateProgramId: horsimo.id,
      attributes: [
        { name: 'custom_label_2', value: 'Akce' },
        { name: 'adult', value: 'FALSE' },
        { name: 'item_group_id', value: '22450' }
      ]
    }
  ];

  const zilkahodinyProducts = [
    {
      externalId: '2010949',
      name: 'Lacoste 2010949',
      description: 'Lacoste 2010949 na Vás zapůsobí mimo jiné i svým nadčasovým vzhledem. khaki barva řemínku a klasická spona jsou již pouhou tečkou za dokonalostí tohoto modelu.',
      price: 3890.00,
      originalUrl: 'https://www.zilkahodinky.cz/lacoste-2010949/',
      imageUrl: 'https://cdn.myshoptet.com/usr/www.zilkahodinky.cz/user/shop/orig/252891_81932b87f6481d2044a49730e8406bc7.jpg?6848c908',
      brand: 'Lacoste',
      model: 'Lacoste 12.12',
      ean: '7613272262248',
      categoryId: mensWatchesCategory.id,
      affiliateProgramId: zilkahodinky.id,
      attributes: [
        { name: 'Model', value: 'Lacoste 12.12' },
        { name: 'Spona', value: 'Klasická spona' },
        { name: 'Ciferník', value: 'Analogový' },
        { name: 'Pohon strojku', value: 'Baterie (Quartz)' },
        { name: 'Vodotěsnost', value: '50M' },
        { name: 'Pohlaví', value: 'Pánské' },
        { name: 'Materiál řemínku', value: 'Silikon' },
        { name: 'Barva řemínku', value: 'Hnědá' },
        { name: 'Šířka pouzdra (mm)', value: '42 mm' },
        { name: 'Funkce', value: 'Chronograf' }
      ]
    },
    {
      externalId: 'K5Y31YB1',
      name: 'Calvin Klein K5Y31YB1',
      description: 'Calvin Klein K5Y31YB1 na Vás zapůsobí mimo jiné i svým nadčasovým vzhledem. černá barva řemínku a klasická spona jsou již pouhou tečkou za dokonalostí tohoto modelu.',
      price: 3890.00,
      originalUrl: 'https://www.zilkahodinky.cz/calvin-klein-k5y31yb1/',
      imageUrl: 'https://cdn.myshoptet.com/usr/www.zilkahodinky.cz/user/shop/orig/252912-1_94525eafb6d2746c07b98a10dd2642bf.jpg?6848c909',
      brand: 'Calvin Klein',
      model: 'Earth',
      ean: '7612635094885',
      categoryId: mensWatchesCategory.id,
      affiliateProgramId: zilkahodinky.id,
      attributes: [
        { name: 'Model', value: 'Earth' },
        { name: 'Spona', value: 'Klasická spona' },
        { name: 'Barva ciferníku', value: 'Černá' },
        { name: 'Ciferník', value: 'Analogový' },
        { name: 'Pohon strojku', value: 'Baterie (Quartz)' },
        { name: 'Barva řemínku', value: 'Černá' },
        { name: 'Materiál řemínku', value: 'Kůže' },
        { name: 'Pohlaví', value: 'Pánské' },
        { name: 'Vodotěsnost', value: '100M' },
        { name: 'Šířka pouzdra (mm)', value: '44 mm' },
        { name: 'Funkce', value: 'Datum' }
      ]
    },
    {
      externalId: 'K5V231Q4',
      name: 'Calvin Klein K5V231Q4',
      description: 'Calvin Klein K5V231Q4 na Vás zapůsobí mimo jiné i svým nadčasovým vzhledem. šedá barva řemínku a klasická spona jsou již pouhou tečkou za dokonalostí tohoto modelu.',
      price: 1890.00,
      originalUrl: 'https://www.zilkahodinky.cz/calvin-klein-k5v231q4/',
      imageUrl: 'https://cdn.myshoptet.com/usr/www.zilkahodinky.cz/user/shop/orig/252927_f0851af02d5a9ca0536ba4d2f2b91d3f.jpg?6848c909',
      brand: 'Calvin Klein',
      model: 'Spellbound',
      ean: '7612635094984',
      categoryId: womensWatchesCategory.id,
      affiliateProgramId: zilkahodinky.id,
      attributes: [
        { name: 'Model', value: 'Spellbound' },
        { name: 'Spona', value: 'Klasická spona' },
        { name: 'Ciferník', value: 'Analogový' },
        { name: 'Pohlaví', value: 'Dámské' },
        { name: 'Pohon strojku', value: 'Baterie (Quartz)' },
        { name: 'Materiál řemínku', value: 'Kůže' },
        { name: 'Vodotěsnost', value: '30M' },
        { name: 'Barva ciferníku', value: 'Stříbrná' },
        { name: 'Barva řemínku', value: 'Šedá' },
        { name: 'Šířka pouzdra (mm)', value: '39 mm' }
      ]
    }
  ];

  // Create products and their attributes
  for (const productData of [...horsimoProducts, ...zilkahodinyProducts]) {
    const { attributes, ...product } = productData;
    
    const createdProduct = await prisma.product.upsert({
      where: {
        affiliateProgramId_externalId: {
          affiliateProgramId: product.affiliateProgramId,
          externalId: product.externalId
        }
      },
      update: {},
      create: product
    });

    // Create attributes
    for (const attr of attributes) {
      await prisma.productAttribute.create({
        data: {
          productId: createdProduct.id,
          name: attr.name,
          value: attr.value
        }
      });
    }
  }

  console.log('✅ Created products and attributes');

  // Create sample import records
  await prisma.productImport.create({
    data: {
      affiliateProgramId: horsimo.id,
      xmlFormat: XmlFormat.GOOGLE_RSS,
      fileName: 'horsimo-feed.xml',
      status: 'COMPLETED',
      recordsProcessed: 2,
      recordsSuccess: 2,
      recordsError: 0
    }
  });

  await prisma.productImport.create({
    data: {
      affiliateProgramId: zilkahodinky.id,
      xmlFormat: XmlFormat.SHOPTET,
      fileName: 'zilkahodinky-feed.xml',
      status: 'COMPLETED',
      recordsProcessed: 3,
      recordsSuccess: 3,
      recordsError: 0
    }
  });

  console.log('✅ Created import records');

  // Add some products to the test user's wishlist
  const allProducts = await prisma.product.findMany({ take: 2 });
  
  for (const product of allProducts) {
    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: testUser.id,
          productId: product.id
        }
      },
      update: {},
      create: {
        userId: testUser.id,
        productId: product.id
      }
    });
  }

  console.log('✅ Created wishlist items');
  console.log('🎉 Database seed completed successfully!');
  console.log();
  console.log('Test accounts:');
  console.log('  Admin: admin@test.com / admin123');
  console.log('  User: john@doe.com / johndoe123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
