import type { MenuItem, Order, OrderStatus } from '../types'
import { calcTotals } from '../lib/format'

export const seedMenu: MenuItem[] = [
  {
    id: 'm-nasgor',
    name: 'Nasi Goreng Kampung',
    description:
      'Nasi goreng dengan bumbu terasi, ayam suwir, telur mata sapi, dan kerupuk. Pedasnya bisa request.',
    price: 28_000,
    category: 'Makanan Utama',
    emoji: '🍛',
    rating: 4.9,
    sold: 1_240,
    prepTime: 15,
    tags: ['Best seller', 'Pedas'],
    available: true,
  },
  {
    id: 'm-geprek',
    name: 'Ayam Geprek Sambal Matah',
    description:
      'Ayam crispy digeprek dengan sambal matah segar, nasi hangat, dan lalapan. Level pedas 1–5.',
    price: 32_000,
    category: 'Makanan Utama',
    emoji: '🍗',
    rating: 4.8,
    sold: 980,
    prepTime: 18,
    tags: ['Best seller', 'Pedas'],
    available: true,
  },
  {
    id: 'm-mieayam',
    name: 'Mie Ayam Bakso',
    description:
      'Mie kenyal dengan topping ayam kecap, bakso sapi, sawi, dan kuah kaldu gurih yang hangat.',
    price: 26_000,
    category: 'Makanan Utama',
    emoji: '🍜',
    rating: 4.7,
    sold: 760,
    prepTime: 12,
    tags: ['Favorit'],
    available: true,
  },
  {
    id: 'm-sate',
    name: 'Sate Ayam Madura',
    description:
      'Sepuluh tusuk sate ayam bakar arang, disiram bumbu kacang kental dan kecap manis. Plus lontong.',
    price: 30_000,
    category: 'Makanan Utama',
    emoji: '🍢',
    rating: 4.8,
    sold: 540,
    prepTime: 20,
    tags: ['Bakar'],
    available: true,
  },
  {
    id: 'm-rendang',
    name: 'Nasi Rendang Daging',
    description:
      'Rendang sapi empuk yang dimasak perlahan 6 jam dengan rempah pilihan. Gurih, pedas, legit.',
    price: 38_000,
    category: 'Makanan Utama',
    emoji: '🥘',
    rating: 4.9,
    sold: 430,
    prepTime: 10,
    tags: ['Spesial'],
    available: true,
  },
  {
    id: 'm-gado',
    name: 'Gado-Gado Segar',
    description:
      'Sayuran rebus, tahu, tempe, telur, dan lontong dengan saus kacang rumahan. Vegetarian friendly.',
    price: 24_000,
    category: 'Makanan Utama',
    emoji: '🥗',
    rating: 4.6,
    sold: 320,
    prepTime: 12,
    tags: ['Vegetarian'],
    available: true,
  },
  {
    id: 'm-tahu',
    name: 'Tahu Crispy Cabe Garam',
    description:
      'Tahu putih crispy dengan taburan cabe garam dan daun bawang. Renyah di luar, lembut di dalam.',
    price: 18_000,
    category: 'Camilan',
    emoji: '🧆',
    rating: 4.7,
    sold: 610,
    prepTime: 10,
    tags: ['Camilan'],
    available: true,
  },
  {
    id: 'm-pisang',
    name: 'Pisang Goreng Keju',
    description:
      'Pisang goreng hangat dengan topping keju parut melimpah dan susu kental manis. Manis pas.',
    price: 16_000,
    category: 'Camilan',
    emoji: '🍌',
    rating: 4.8,
    sold: 450,
    prepTime: 8,
    tags: ['Manis'],
    available: true,
  },
  {
    id: 'm-kentang',
    name: 'Kentang Goreng Sambal',
    description:
      'Kentang goreng renyah dengan saus sambal mayo pedas. Cocok buat ngemil sore.',
    price: 20_000,
    category: 'Camilan',
    emoji: '🍟',
    rating: 4.5,
    sold: 380,
    prepTime: 10,
    tags: ['Pedas'],
    available: true,
  },
  {
    id: 'm-esteh',
    name: 'Es Teh Manis Jumbo',
    description:
      'Teh tubruk asli dengan gula batu dan es serut. Segar, manisnya bisa request kurang.',
    price: 8_000,
    category: 'Minuman',
    emoji: '🥤',
    rating: 4.7,
    sold: 2_100,
    prepTime: 3,
    tags: ['Best seller'],
    available: true,
  },
  {
    id: 'm-esjeruk',
    name: 'Es Jeruk Peras',
    description:
      'Jeruk peras segar tanpa pengawet, dipadukan dengan es batu dan sedikit gula. Vitamin C harian.',
    price: 12_000,
    category: 'Minuman',
    emoji: '🍹',
    rating: 4.8,
    sold: 870,
    prepTime: 4,
    tags: ['Segar'],
    available: true,
  },
  {
    id: 'm-kopi',
    name: 'Kopi Susu Gula Aren',
    description:
      'Espresso robusta, susu segar, dan gula aren cair. Manisnya pas, bikin melek seharian.',
    price: 18_000,
    category: 'Minuman',
    emoji: '☕',
    rating: 4.9,
    sold: 1_050,
    prepTime: 5,
    tags: ['Best seller'],
    available: true,
  },
  {
    id: 'm-klepon',
    name: 'Klepon Pandan',
    description:
      'Enam butir klepon pandan isi gula merah yang meledak di mulut, dibalur kelapa parut.',
    price: 15_000,
    category: 'Dessert',
    emoji: '🍡',
    rating: 4.6,
    sold: 210,
    prepTime: 6,
    tags: ['Tradisional'],
    available: true,
  },
  {
    id: 'm-puding',
    name: 'Puding Cokelat Lumer',
    description:
      'Puding cokelat lembut dengan saus cokelat lumer dan taburan kacang. Dingin dan creamy.',
    price: 17_000,
    category: 'Dessert',
    emoji: '🍮',
    rating: 4.7,
    sold: 190,
    prepTime: 5,
    tags: ['Manis'],
    available: false,
  },
]

const DEMO_STATUSES: OrderStatus[] = ['baru', 'diproses', 'dikirim', 'selesai', 'dibatalkan']

export function buildSeedOrders(menu: MenuItem[]): Order[] {
  const byId = (id: string) => menu.find((item) => item.id === id) ?? menu[0]
  const now = Date.now()

  const create = (
    suffix: string,
    minutesAgo: number,
    fulfillment: Order['fulfillment'],
    status: OrderStatus,
    lines: { id: string; qty: number }[],
    customer: Order['customer'],
  ): Order => {
    const items = lines.map(({ id, qty }) => {
      const item = byId(id)
      return {
        itemId: item.id,
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        qty,
      }
    })
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const totals = calcTotals(subtotal, fulfillment, null)
    return {
      id: `ord-demo-${suffix}`,
      code: `RSA-${suffix.toUpperCase()}`,
      createdAt: new Date(now - minutesAgo * 60_000).toISOString(),
      customer,
      fulfillment,
      payment: fulfillment === 'delivery' ? 'qris' : 'cod',
      items,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      serviceFee: totals.serviceFee,
      discount: 0,
      promo: null,
      total: totals.total,
      status,
    }
  }

  return [
    create(
      'a7k2',
      12,
      'delivery',
      DEMO_STATUSES[0],
      [
        { id: 'm-nasgor', qty: 2 },
        { id: 'm-esteh', qty: 2 },
      ],
      {
        name: 'Dinda Putri',
        phone: '0812-3456-7890',
        address: 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan',
        notes: 'Tolong sambalnya dipisah ya.',
      },
    ),
    create(
      'b3m9',
      38,
      'pickup',
      DEMO_STATUSES[1],
      [
        { id: 'm-geprek', qty: 1 },
        { id: 'm-kopi', qty: 1 },
      ],
      {
        name: 'Raka Pratama',
        phone: '0857-1122-3344',
        address: 'Ambil di Rasa Dapur, Jl. Kemang Raya No. 8',
        notes: '',
      },
    ),
    create(
      'c8x4',
      95,
      'delivery',
      DEMO_STATUSES[2],
      [
        { id: 'm-mieayam', qty: 1 },
        { id: 'm-tahu', qty: 1 },
        { id: 'm-esjeruk', qty: 1 },
      ],
      {
        name: 'Sinta Maharani',
        phone: '0813-9988-7766',
        address: 'Jl. Cikini Raya No. 45, Menteng, Jakarta Pusat',
        notes: 'Titip di pos keamanan.',
      },
    ),
    create(
      'd5p1',
      26 * 60,
      'delivery',
      DEMO_STATUSES[3],
      [
        { id: 'm-sate', qty: 2 },
        { id: 'm-pisang', qty: 1 },
      ],
      {
        name: 'Bagas Nugroho',
        phone: '0821-4455-6677',
        address: 'Jl. Senopati No. 21, Kebayoran Baru, Jakarta Selatan',
        notes: '',
      },
    ),
    create(
      'e2r6',
      50 * 60,
      'pickup',
      DEMO_STATUSES[4],
      [{ id: 'm-rendang', qty: 1 }],
      {
        name: 'Ayu Lestari',
        phone: '0899-1234-5678',
        address: 'Ambil di Rasa Dapur, Jl. Kemang Raya No. 8',
        notes: '',
      },
    ),
  ]
}
