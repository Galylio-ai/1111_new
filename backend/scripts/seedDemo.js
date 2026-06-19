require('dotenv').config();

const knexFactory = require('knex');
const bcrypt = require('bcrypt');

const catalogDomains = ['retail', 'para', 'alimentation', 'fashion'];

function dbConfig(prefix = '') {
  const key = (name) => process.env[`${prefix}${name}`];
  return {
    client: 'pg',
    connection: {
      host: key('DB_HOST') || process.env.DB_HOST || 'localhost',
      port: Number(key('DB_PORT') || process.env.DB_PORT || 5432),
      database: key('DB_NAME') || process.env.DB_NAME || 'appdb',
      user: key('DB_USER') || process.env.DB_USER || 'postgres',
      password: key('DB_PASSWORD') || process.env.DB_PASSWORD || '',
    },
    pool: { min: 0, max: 4 },
  };
}

function domainPrefix(domain) {
  return `${domain.toUpperCase()}_`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function upsertOne(db, table, conflict, values, mergeValues = {}) {
  const [row] = await db(table)
    .insert(values)
    .onConflict(conflict)
    .merge({
      ...mergeValues,
      updated_at: db.fn.now(),
    })
    .returning('*');
  return row;
}

async function findOrInsert(db, table, where, values) {
  const existing = await db(table).where(where).first();
  if (existing) return existing;
  const [row] = await db(table).insert(values).returning('*');
  return row;
}

async function seedAuthUsers(db) {
  const password = process.env.SUPER_ADMIN_PASSWORD || 'hayder14405523*';
  const passwordHash = await bcrypt.hash(password, 12);
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'boudhriwa.haydar@gmail.com';

  await db('auth.users')
    .insert({
      full_name: process.env.SUPER_ADMIN_NAME || 'Haydar Boudhriwa',
      email: superAdminEmail,
      password_hash: passwordHash,
      role: 'super_admin',
      state: process.env.SUPER_ADMIN_STATE || 'Tunis',
      phone: process.env.SUPER_ADMIN_PHONE || null,
      is_email_verified: true,
      is_active: true,
      updated_at: db.fn.now(),
    })
    .onConflict('email')
    .merge({
      role: 'super_admin',
      is_email_verified: true,
      is_active: true,
      updated_at: db.fn.now(),
    });

  await db('auth.users')
    .insert({
      full_name: 'Demo Support Admin',
      email: 'demo.admin@1111.tn',
      password_hash: passwordHash,
      role: 'admin',
      state: 'Tunis',
      is_email_verified: true,
      is_active: true,
      updated_at: db.fn.now(),
    })
    .onConflict('email')
    .merge({
      role: 'admin',
      is_email_verified: true,
      is_active: true,
      updated_at: db.fn.now(),
    });
}

async function seedWebControl(db) {
  const heroBanner = await findOrInsert(
    db,
    'web_banners',
    { title: 'Verifiez avant d acheter', placement: 'homepage.hero' },
    {
      title: 'Verifiez avant d acheter',
      subtitle: 'Comparez les prix, surveillez les tendances et economisez plus.',
      image_url: '/uploads/web-media/demo-hero.webp',
      cta_label: 'Comparer maintenant',
      cta_url: '/compare',
      placement: 'homepage.hero',
      display_order: 1,
      catalog_domain: 'retail',
      category_level: 'top',
      category_id: 1,
      product_id: null,
      status: 'active',
      metadata: { tone: 'market', badge: 'live' },
    },
  );

  const offersSection = await upsertOne(
    db,
    'web_sections',
    'section_key',
    {
      section_key: 'top-offers',
      title: 'Top Offers',
      subtitle: 'Best live discounts across tracked shops.',
      section_type: 'catalog_query',
      display_order: 1,
      status: 'active',
      metadata: { source: 'top-discounts', limit: 12 },
    },
    {
      title: 'Top Offers',
      subtitle: 'Best live discounts across tracked shops.',
      section_type: 'catalog_query',
      display_order: 1,
      status: 'active',
      metadata: { source: 'top-discounts', limit: 12 },
    },
  );

  await findOrInsert(
    db,
    'web_section_items',
    { section_id: offersSection.id, title: 'Retail savings' },
    {
      section_id: offersSection.id,
      item_type: 'category',
      catalog_domain: 'retail',
      category_level: 'top',
      category_id: 1,
      product_id: null,
      title: 'Retail savings',
      image_url: heroBanner.image_url,
      cta_url: '/retail',
      display_order: 1,
      metadata: { layout: 'wide' },
    },
  );

  const footerGroup = await findOrInsert(
    db,
    'web_footer_groups',
    { title: '1111.tn' },
    { title: '1111.tn', display_order: 1, status: 'active' },
  );

  await findOrInsert(
    db,
    'web_footer_links',
    { group_id: footerGroup.id, label: 'Promotions' },
    {
      group_id: footerGroup.id,
      label: 'Promotions',
      href: '/promotions',
      display_order: 1,
      status: 'active',
    },
  );

  await db('web_settings')
    .insert({
      key: 'site.global',
      value: {
        brand: '1111.tn',
        marketIndexLabel: 'Meta Index Global 1111',
        defaultCurrency: 'TND',
      },
      updated_at: db.fn.now(),
    })
    .onConflict('key')
    .merge({
      value: {
        brand: '1111.tn',
        marketIndexLabel: 'Meta Index Global 1111',
        defaultCurrency: 'TND',
      },
      updated_at: db.fn.now(),
    });

  await db('mail_templates')
    .insert({
      template_key: 'demo_price_alert',
      subject: 'Your tracked product changed price',
      html_body: '<p>Hello {{ name }}, {{ product }} changed price.</p>',
      status: 'active',
      updated_at: db.fn.now(),
    })
    .onConflict('template_key')
    .merge({
      subject: 'Your tracked product changed price',
      html_body: '<p>Hello {{ name }}, {{ product }} changed price.</p>',
      status: 'active',
      updated_at: db.fn.now(),
    });
}

function samplesForDomain(domain) {
  const samples = {
    retail: {
      top: 'Electromenager',
      low: 'Climatiseurs',
      sub: 'Climatiseurs inverter',
      brand: 'Gree',
      shop: { shop_key: 'mytek', name: 'Mytek', website_url: 'https://www.mytek.tn' },
      product: 'Climatiseur Inverter 12000 BTU',
      specs: [
        ['capacity', '12000 BTU'],
        ['energy_class', 'A++'],
        ['warranty', '3 years'],
      ],
      price: 1399,
      regular: 1699,
    },
    para: {
      top: 'Parapharmacie',
      low: 'Soin visage',
      sub: 'Protection solaire',
      brand: 'La Roche-Posay',
      shop: { shop_key: 'paratunisie', name: 'Para Tunisie', website_url: 'https://example.com/para' },
      product: 'Anthelios SPF50 Gel Creme',
      specs: [
        ['spf', '50+'],
        ['skin_type', 'Sensitive'],
        ['volume', '50ml'],
      ],
      price: 58.9,
      regular: 72,
    },
    alimentation: {
      top: 'Alimentation',
      low: 'Epicerie',
      sub: 'Huiles',
      brand: 'Crystal',
      shop: { shop_key: 'aziza', name: 'Aziza', website_url: 'https://example.com/aziza' },
      product: 'Huile vegetale 1L',
      specs: [
        ['volume', '1L'],
        ['origin', 'Tunisia'],
        ['packaging', 'Bottle'],
      ],
      price: 4.25,
      regular: 4.7,
    },
    fashion: {
      top: 'Fashion',
      low: 'Accessoires',
      sub: 'Montres',
      brand: 'Casio',
      shop: { shop_key: 'fashion-demo', name: 'Fashion Demo', website_url: 'https://example.com/fashion' },
      product: 'Montre Quartz Minimal',
      specs: [
        ['gender', 'Unisex'],
        ['movement', 'Quartz'],
        ['color', 'Black'],
      ],
      price: 119,
      regular: 149,
    },
  };

  return samples[domain];
}

async function seedCatalogDatabase(domain) {
  const db = knexFactory(dbConfig(domainPrefix(domain)));
  const sample = samplesForDomain(domain);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const top = await upsertOne(
      db,
      'top_categories',
      'slug',
      { name: sample.top, slug: slugify(sample.top), status: 'active' },
      { name: sample.top, status: 'active' },
    );
    const low = await upsertOne(
      db,
      'low_categories',
      ['top_category_id', 'slug'],
      { top_category_id: top.id, name: sample.low, slug: slugify(sample.low), status: 'active' },
      { name: sample.low, status: 'active' },
    );
    const sub = await upsertOne(
      db,
      'subcategories',
      ['low_category_id', 'slug'],
      { low_category_id: low.id, name: sample.sub, slug: slugify(sample.sub), status: 'active' },
      { name: sample.sub, status: 'active' },
    );
    const brand = await upsertOne(
      db,
      'brands',
      'slug',
      { name: sample.brand, slug: slugify(sample.brand), status: 'active' },
      { name: sample.brand, status: 'active' },
    );
    const shop = await upsertOne(
      db,
      'shops',
      'shop_key',
      {
        shop_key: sample.shop.shop_key,
        name: sample.shop.name,
        slug: slugify(sample.shop.name),
        website_url: sample.shop.website_url,
        logo_url: null,
        status: 'active',
      },
      {
        name: sample.shop.name,
        website_url: sample.shop.website_url,
        status: 'active',
      },
    );
    const product = await upsertOne(
      db,
      'products',
      'slug',
      {
        brand_id: brand.id,
        source_product_id: `demo-${domain}-001`,
        name: sample.product,
        slug: slugify(sample.product),
        description: `Demo ${domain} product used by the admin platform.`,
        source_url: `${sample.shop.website_url}/demo-product`,
        status: 'active',
      },
      {
        brand_id: brand.id,
        source_product_id: `demo-${domain}-001`,
        name: sample.product,
        description: `Demo ${domain} product used by the admin platform.`,
        source_url: `${sample.shop.website_url}/demo-product`,
        status: 'active',
      },
    );

    await db('product_subcategories')
      .insert({ product_id: product.id, subcategory_id: sub.id })
      .onConflict(['product_id', 'subcategory_id'])
      .ignore();

    await db('product_images')
      .insert({
        product_id: product.id,
        image_url: `https://dummyimage.com/800x800/0f172a/ffffff&text=${encodeURIComponent(domain)}`,
      })
      .onConflict(['product_id', 'image_url'])
      .ignore();

    for (const [spec_key, spec_value] of sample.specs) {
      await db('product_specs')
        .insert({ product_id: product.id, spec_key, spec_value })
        .onConflict(['product_id', 'spec_key', 'spec_value'])
        .ignore();
    }

    await db('shop_prices')
      .insert({
        product_id: product.id,
        shop_id: shop.id,
        current_price: sample.price,
        regular_price: sample.regular,
        shop_product_url: `${sample.shop.website_url}/demo-product`,
        updated_at: db.fn.now(),
      })
      .onConflict(['product_id', 'shop_id'])
      .merge({
        current_price: sample.price,
        regular_price: sample.regular,
        shop_product_url: `${sample.shop.website_url}/demo-product`,
        updated_at: db.fn.now(),
      });

    for (const point of [
      { price: sample.regular, recorded_at: weekAgo },
      { price: Number(sample.price) + 25, recorded_at: yesterday },
      { price: sample.price, recorded_at: now },
    ]) {
      const exists = await db('price_history')
        .where({
          product_id: product.id,
          shop_id: shop.id,
          recorded_at: point.recorded_at,
        })
        .first();
      if (!exists) {
        await db('price_history').insert({
          product_id: product.id,
          shop_id: shop.id,
          price: point.price,
          regular_price: sample.regular,
          recorded_at: point.recorded_at,
        });
      }
    }

    await findOrInsert(
      db,
      'import_jobs',
      { source_type: 'json', status: 'completed', total_rows: 1 },
      {
        source_type: 'json',
        status: 'completed',
        total_rows: 1,
        valid_rows: 1,
        created_count: 1,
        updated_count: 0,
        failed_count: 0,
        archived_count: 0,
        mapping: { name: 'title', shop_key: 'shop', current_price: 'price' },
        summary: { demo: true, domain },
        finished_at: now,
      },
    );

    console.log(`Seeded ${domain} catalog data`);
  } finally {
    await db.destroy();
  }
}

async function seedSharedDatabase() {
  const db = knexFactory(dbConfig());
  try {
    await seedAuthUsers(db);
    await seedWebControl(db);
    console.log('Seeded shared admin data');
  } finally {
    await db.destroy();
  }
}

async function main() {
  await seedSharedDatabase();
  for (const domain of catalogDomains) {
    await seedCatalogDatabase(domain);
  }
  console.log('Demo seed completed');
}

main().catch((error) => {
  console.error('Demo seed failed');
  console.error(error);
  process.exitCode = 1;
});
