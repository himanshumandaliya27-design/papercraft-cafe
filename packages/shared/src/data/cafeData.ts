export interface MenuEdition {
  id: string;
  editionNumber: string;
  name: string;
  subtitle: string;
  category: 'Signature Brews' | 'Viennoiserie' | 'Tasting Flights';
  price: number;
  originOrFlour: string;
  processOrBake: string;
  tastingNotes: string[];
  description: string;
  baristaNote: string;
  dietary: string;
  image: string;
  prepTime: string;
}

export interface GalleryMoment {
  id: string;
  title: string;
  category: 'Pour & Steam' | 'Morning Light' | 'Pastry Table';
  caption: string;
  handwrittenNote: string;
  dateStamp: string;
  cameraSpec: string;
  image: string;
  tiltDeg: number;
  tapePosition: 'top-center' | 'corners' | 'top-left-right';
  tapeVariant: 'terracotta' | 'kraft';
  aspectClass: string;
  cutoutClass: string;
}

export interface StickyReview {
  id: string;
  author: string;
  role: string;
  platform: 'Google' | 'Zomato';
  rating: number;
  date: string;
  quote: string;
  orderedItem: string;
  handwrittenSignoff: string;
  tiltDeg: number;
  paperTint: string;
  tapeVariant: 'terracotta' | 'kraft';
}

export interface RoastBatch {
  batchNo: string;
  origin: string;
  altitude: string;
  process: string;
  roastDate: string;
  notes: string;
  roasterComment: string;
}

export const GENERATED_IMAGES = {
  heroInterior: '/src/assets/images/cafe_hero_interior_1791136188613.jpg',
  pourOver: '/src/assets/images/roastery_pour_over_1791136200647.jpg',
  cortado: '/src/assets/images/cardamom_rose_cortado_1791136213404.jpg',
  pastry: '/src/assets/images/brown_butter_kouign_amann_1791136225329.jpg',
  coldBrewFlight: '/src/assets/images/ethiopian_cold_brew_flight_1791136237863.jpg',
};

export const ROAST_BATCHES: RoastBatch[] = [
  {
    batchNo: 'Batch No. 418',
    origin: 'Worka Sakaro · Gedeb, Ethiopia',
    altitude: '2,150 MASL',
    process: 'Washed · 72h Ceramic Tank Fermentation',
    roastDate: 'Roasted Tuesday, 06:30 AM',
    notes: 'Bergamot peel · White peach · Jasmine blossom',
    roasterComment: 'Dropped at 196°C with 14.2% development time for tea-like clarity.',
  },
  {
    batchNo: 'Batch No. 419',
    origin: 'Finca La Mariposa · Huehuetenango',
    altitude: '1,890 MASL',
    process: 'Black Honey · Raised Cedar Beds',
    roastDate: 'Roasted Thursday, 07:15 AM',
    notes: 'Burnt fig · Toasted hazelnut · Raw cacao nib',
    roasterComment: 'Sweet syrupy body that anchors our Cardamom & Burnt Honey Cortado.',
  },
  {
    batchNo: 'Batch No. 420',
    origin: 'Chikmagalur Estate · Karnataka',
    altitude: '1,450 MASL',
    process: 'Monsooned AA · Barrel Rested',
    roastDate: 'Roasted Friday, 06:00 AM',
    notes: 'Smoked cardamom · Dark muscovado · Cedarwood',
    roasterComment: 'Low-acidity velvet crema crafted for slow morning espresso service.',
  },
];

export const SIGNATURE_MENU_EDITIONS: MenuEdition[] = [
  {
    id: 'cortado-edition',
    editionNumber: 'Edition No. 01',
    name: 'Cardamom & Burnt Honey Cortado',
    subtitle: 'Double Ristretto · Wildflower Honey · Green Cardamom',
    category: 'Signature Brews',
    price: 240,
    originOrFlour: 'Finca La Mariposa · Guatemala (Black Honey)',
    processOrBake: '42g yield over house-torched mountain honey & crushed pods',
    tastingNotes: ['Torched Honeycomb', 'Crushed Cardamom', 'Roasted Pecan'],
    description:
      'Equal parts velvety steamed A2 jersey milk and double ristretto pulled over a caramelized ribbon of wildflower honey infused with freshly mortared green cardamom.',
    baristaNote: 'Best enjoyed un-stirred for the first two sips—let the warm spiced crema settle naturally.',
    dietary: 'Oat & house-pressed macadamia milk available',
    image: GENERATED_IMAGES.cortado,
    prepTime: '4 mins',
  },
  {
    id: 'kouign-amann-edition',
    editionNumber: 'Edition No. 02',
    name: 'Brown Butter & Fig Kouign-Amann',
    subtitle: '27-Layer Cultured Butter Dough · Black Mission Fig',
    category: 'Viennoiserie',
    price: 260,
    originOrFlour: 'Stone-milled Rouge de Bordeaux Heritage Wheat',
    processOrBake: '72-hour cold ferment · Baked in cast-iron rings at 07:00 AM',
    tastingNotes: ['Caramelized Crust', 'Hazelnut Beurre Noisette', 'Jammy Fig'],
    description:
      'Crisp, shatteringly flaky Breton pastry laminated with browned Normandy cultured butter, demerara sugar crystals, and a center of roasted black mission figs.',
    baristaNote: 'Served warm from the deck oven; pairs effortlessly with washed Ethiopian filter brews.',
    dietary: 'Vegetarian · Contains heritage wheat & dairy',
    image: GENERATED_IMAGES.pastry,
    prepTime: 'Warm on plate',
  },
  {
    id: 'cold-brew-flight-edition',
    editionNumber: 'Edition No. 03',
    name: 'Yirgacheffe Pour-Over & Cold Flight',
    subtitle: 'Hot V60 Carafe + 18-Hour Slow Drip over Hand-Carved Ice',
    category: 'Tasting Flights',
    price: 380,
    originOrFlour: 'Worka Sakaro · Gedeb, Ethiopia (2,150m)',
    processOrBake: 'Side-by-side thermal extraction comparison on walnut board',
    tastingNotes: ['Blood Orange Zest', 'Darjeeling First Flush', 'Wild Apricot'],
    description:
      'Experience how temperature transforms a single harvest: one glass carafe brewed hot at 93°C alongside a crystal-clear ice tumbler of 18-hour Kyoto-style slow drip.',
    baristaNote: 'Includes a letterpress tasting card stamped with the morning roast curve.',
    dietary: 'Pure single-origin coffee · Zero additives',
    image: GENERATED_IMAGES.coldBrewFlight,
    prepTime: '6 mins',
  },
];

export const GALLERY_MOMENTS: GalleryMoment[] = [
  {
    id: 'moment-1',
    title: '07:40 AM Sunlight on the Walnut Bar',
    category: 'Morning Light',
    caption: 'Early eastern light filtering through linen curtains onto our brass pour-over station and stoneware vessels.',
    handwrittenNote: 'Morning light across the counter, Oct 2026',
    dateStamp: '14 OCT · 07:40 AM',
    cameraSpec: '35mm f/2.0 · Kodak Portra 400',
    image: GENERATED_IMAGES.heroInterior,
    tiltDeg: -2.5,
    tapePosition: 'top-center',
    tapeVariant: 'terracotta',
    aspectClass: 'aspect-[16/10]',
    cutoutClass: 'clip-cutout-1',
  },
  {
    id: 'moment-2',
    title: 'First Bloom · Copper Gooseneck Pour',
    category: 'Pour & Steam',
    caption: 'Thirty-five seconds into the bloom of Batch #418 Worka Sakaro, releasing sweet floral steam across the bar.',
    handwrittenNote: '35s bloom @ 93°C — pure jasmine!',
    dateStamp: '16 OCT · 08:15 AM',
    cameraSpec: '50mm f/1.4 · Natural Window Light',
    image: GENERATED_IMAGES.pourOver,
    tiltDeg: 2.2,
    tapePosition: 'corners',
    tapeVariant: 'kraft',
    aspectClass: 'aspect-[4/3]',
    cutoutClass: 'clip-cutout-2',
  },
  {
    id: 'moment-3',
    title: 'Two-Origin Temperature Study',
    category: 'Pour & Steam',
    caption: 'Our signature walnut tasting flight board set with a hot V60 decanter and slow-drip cold extraction over hand-cut ice.',
    handwrittenNote: 'Cold drip vs. hot filter side-by-side',
    dateStamp: '18 OCT · 11:20 AM',
    cameraSpec: '35mm f/2.8 · Warm Side Shade',
    image: GENERATED_IMAGES.coldBrewFlight,
    tiltDeg: -1.8,
    tapePosition: 'top-left-right',
    tapeVariant: 'kraft',
    aspectClass: 'aspect-[3/4]',
    cutoutClass: 'clip-cutout-3',
  },
  {
    id: 'moment-4',
    title: 'Cardamom & Burnt Honey Microfoam',
    category: 'Pour & Steam',
    caption: 'Served in custom wheel-thrown speckled stoneware by ceramicist Mara Lin exclusively for our cortado service.',
    handwrittenNote: 'Wheel-thrown cups fresh from the kiln',
    dateStamp: '19 OCT · 09:50 AM',
    cameraSpec: '60mm Macro · Diffused Daylight',
    image: GENERATED_IMAGES.cortado,
    tiltDeg: 3.1,
    tapePosition: 'top-center',
    tapeVariant: 'terracotta',
    aspectClass: 'aspect-[4/3]',
    cutoutClass: 'clip-cutout-1',
  },
  {
    id: 'moment-5',
    title: 'Morning Deck Oven Pull: Kouign-Amann',
    category: 'Pastry Table',
    caption: 'Twenty-seven layers of cultured Normandy butter caramelized with demerara sugar and black mission figs.',
    handwrittenNote: 'Gone by 10:30am almost every Sunday',
    dateStamp: '20 OCT · 07:12 AM',
    cameraSpec: '35mm f/2.0 · Bakery Table',
    image: GENERATED_IMAGES.pastry,
    tiltDeg: -2.8,
    tapePosition: 'corners',
    tapeVariant: 'terracotta',
    aspectClass: 'aspect-[4/3]',
    cutoutClass: 'clip-cutout-2',
  },
  {
    id: 'moment-6',
    title: 'Quiet Corner for Paper & Ink',
    category: 'Morning Light',
    caption: 'We keep the music acoustic and the tables unplugged on weekends so guests can journal, sketch, and linger.',
    handwrittenNote: 'Table 4 — best spot for sketching',
    dateStamp: '21 OCT · 10:05 AM',
    cameraSpec: '28mm f/2.8 · Golden Hour',
    image: GENERATED_IMAGES.heroInterior,
    tiltDeg: 1.9,
    tapePosition: 'top-center',
    tapeVariant: 'kraft',
    aspectClass: 'aspect-[16/10]',
    cutoutClass: 'clip-cutout-3',
  },
];

export const INITIAL_REVIEWS: StickyReview[] = [
  {
    id: 'rev-1',
    author: 'Elena Rostova',
    role: 'Printmaker & Bookbinder · Linden District',
    platform: 'Google',
    rating: 5,
    date: '2 days ago',
    quote:
      'I used to rush through morning espresso standing at noisy commuter counters. Sitting by the linen window at Atelier Vélin with the Cardamom Cortado and a letterpress tasting slip turned my Tuesday mornings into a calm two-hour sketching ritual.',
    orderedItem: 'Cardamom & Burnt Honey Cortado',
    handwrittenSignoff: 'The handmade paper menus are a work of art!',
    tiltDeg: -2.2,
    paperTint: '#FAF5EC',
    tapeVariant: 'terracotta',
  },
  {
    id: 'rev-2',
    author: 'Rohan Deshmukh',
    role: 'Culinary Editor · Zomato Connoisseur',
    platform: 'Zomato',
    rating: 5,
    date: '1 week ago',
    quote:
      'Most cafes over-sweeten spiced coffee with artificial syrups. Here, the burnt wildflower honey and freshly mortared cardamom let the Guatemalan Black Honey espresso shine through. Paired with the warm Fig Kouign-Amann, it is unmatched in the city.',
    orderedItem: 'Brown Butter & Fig Kouign-Amann',
    handwrittenSignoff: '10/10 lamination on that pastry crust.',
    tiltDeg: 1.8,
    paperTint: '#F7EFE2',
    tapeVariant: 'kraft',
  },
  {
    id: 'rev-3',
    author: 'Marcus Vance',
    role: 'Architectural Photographer · Old Quarter',
    platform: 'Google',
    rating: 5,
    date: '2 weeks ago',
    quote:
      'I brought a client here instead of our usual sterile coworking lounge. The Ethiopian hot-and-cold pour-over flight sparked a 45-minute conversation about craft, and we signed our studio book project right at Table 3.',
    orderedItem: 'Yirgacheffe Pour-Over & Cold Flight',
    handwrittenSignoff: 'Table 3 has the dreamiest morning shadows.',
    tiltDeg: -1.4,
    paperTint: '#FAF5EC',
    tapeVariant: 'terracotta',
  },
];
