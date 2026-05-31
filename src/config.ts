export interface SiteConfig {
  language: string
  siteTitle: string
  siteDescription: string
}

export interface NavigationLink {
  label: string
  href: string
}

export interface NavigationConfig {
  brandName: string
  links: NavigationLink[]
}

export interface HeroConfig {
  eyebrow: string
  titleLines: string[]
  leadText: string
  supportingNotes: string[]
}

export interface ManifestoConfig {
  videoPath: string
  text: string
}

export interface FacilityArticle {
  title: string
  paragraphs: string[]
}

export interface FacilityItem {
  slug: string
  name: string
  code: string
  address: string
  status: string
  email: string
  phone: string
  ctaText: string
  ctaHref: string
  image: string
  utcOffset: number
  article: FacilityArticle
}

export interface FacilitiesConfig {
  sectionLabel: string
  detailBackText: string
  detailNotFoundText: string
  detailReturnText: string
  items: FacilityItem[]
}

export interface ObservationConfig {
  sectionLabel: string
  videoPath: string
  statusText: string
  latLabel: string
  lonLabel: string
  initialLat: number
  initialLon: number
}

export interface ArchiveItem {
  src: string
  label: string
}

export interface ArchivesConfig {
  sectionLabel: string
  vaultTitle: string
  closeText: string
  items: ArchiveItem[]
}

export interface FooterConfig {
  copyrightText: string
  statusText: string
}

// ============================================================
// SITE CONFIGURATION — Lunar Observatory
// ============================================================

export const siteConfig: SiteConfig = {
  language: 'zh-CN',
  siteTitle: 'LUNAR OBSERVATORY — ASCII Moon',
  siteDescription: 'A monochrome lunar observatory with interactive ASCII moon field and the Lunar Defender space shooter game.',
}

export const navigationConfig: NavigationConfig = {
  brandName: 'LUNAR',
  links: [
    { label: 'FACILITIES', href: '#facilities' },
    { label: 'OBSERVE', href: '#observation' },
    { label: 'GAME', href: '#game' },
    { label: 'ARCHIVES', href: '#archives' },
  ],
}

export const heroConfig: HeroConfig = {
  eyebrow: 'EST. 1969 — LUNAR OBSERVATORY NETWORK',
  titleLines: ['THE', 'SILENT', 'SURFACE'],
  leadText: 'A permanent installation tracking the lunar surface through ASCII telemetry. The moon speaks in characters.',
  supportingNotes: [
    'Real-time ASCII rendering of lunar surface topology with interactive field distortion.',
    'Scroll down to explore observatory facilities, live observation feeds, and pilot the Lunar Defender.',
    'All data processed through monochrome transmission protocols.',
  ],
}

export const manifestoConfig: ManifestoConfig = {
  videoPath: '/videos/manifesto.mp4',
  text: 'The Lunar Observatory was established to maintain an unbroken line of sight to the moon. We believe the surface holds patterns invisible to conventional imaging. Through ASCII telemetry, we render the lunar topology in characters — each symbol a pixel of truth. Our facilities across four continents synchronize their observations, creating a composite view that no single telescope can achieve. The silent surface is not empty. It is a text written in light and shadow, waiting to be read.',
}

export const facilitiesConfig: FacilitiesConfig = {
  sectionLabel: 'FACILITIES DIRECTORY',
  detailBackText: 'BACK TO DIRECTORY',
  detailNotFoundText: 'FACILITY NOT FOUND',
  detailReturnText: 'RETURN TO DIRECTORY',
  items: [
    {
      slug: 'arecibo-station',
      name: 'ARECIBO STATION',
      code: 'AR-01',
      address: 'ARECIBO, PUERTO RICO',
      status: 'OPERATIONAL — CLEAR SKIES',
      email: 'ar01@lunar.obs',
      phone: '+1-787-555-0142',
      ctaText: 'VIEW TELEMETRY',
      ctaHref: '#observation',
      image: '/images/facility-arecibo.jpg',
      utcOffset: -4,
      article: {
        title: 'The Arecibo Legacy',
        paragraphs: [
          'Arecibo Station maintains the largest single-aperture lunar receiver in the observatory network. Built into a natural karst sinkhole, the dish spans 305 meters — large enough to catch whispers from the lunar regolith.',
          'The station processes over 2.4 million ASCII data points per second, converting raw radio echoes into character-based surface maps. During meteor showers, the data rate doubles as impact ejecta create temporary surface alterations visible in our telemetry.',
          'Station AR-01 operates continuously with a crew of twelve observers working in six-hour shifts. The tropical climate provides stable atmospheric conditions for 280 days per year.',
        ],
      },
    },
    {
      slug: 'atacama-array',
      name: 'ATACAMA ARRAY',
      code: 'AT-02',
      address: 'ATACAMA DESERT, CHILE',
      status: 'OPERATIONAL — DRY CONDITIONS',
      email: 'at02@lunar.obs',
      phone: '+56-2-555-0189',
      ctaText: 'VIEW TELEMETRY',
      ctaHref: '#observation',
      image: '/images/facility-atacama.jpg',
      utcOffset: -4,
      article: {
        title: 'Desert Precision',
        paragraphs: [
          'Atacama Array sits at 5,060 meters above sea level on the Chajnantor Plateau. The extreme altitude and aridity reduce atmospheric interference to near zero, producing the sharpest lunar edge-detection in the network.',
          'The array consists of 66 compact antennas arranged in configurations that can stretch across 16 kilometers. This baseline allows us to resolve surface features as small as 10 meters across — unprecedented for ground-based observation.',
          'Night temperatures drop to -20C, freezing equipment into silent precision. The ASCII output from Atacama carries a distinctive clarity: fewer noise characters, sharper terminator lines.',
        ],
      },
    },
    {
      slug: 'mauna-kea',
      name: 'MAUNA KEA',
      code: 'MK-03',
      address: 'HAWAII, USA',
      status: 'OPERATIONAL — HIGH PRESSURE',
      email: 'mk03@lunar.obs',
      phone: '+1-808-555-0234',
      ctaText: 'VIEW TELEMETRY',
      ctaHref: '#observation',
      image: '/images/facility-mauna.jpg',
      utcOffset: -10,
      article: {
        title: 'Above the Clouds',
        paragraphs: [
          'Mauna Kea Observatory stands at 4,205 meters on the summit of a dormant volcano. Thirteen major telescopes share the summit, but our lunar station operates independently, focused solely on the ASCII surface rendering project.',
          'The Hawaiian location provides unique orbital coverage, filling gaps left by Arecibo and Atacama during Earth rotation. MK-03 captures the eastern limb with exceptional detail, tracking libration effects that other stations miss.',
          'Cultural protocols govern all operations. We observe only during designated windows, maintaining the sanctity of the summit while advancing our understanding of the lunar surface.',
        ],
      },
    },
    {
      slug: 'sutherland-node',
      name: 'SUTHERLAND NODE',
      code: 'SU-04',
      address: 'KAROO, SOUTH AFRICA',
      status: 'OPERATIONAL — STABLE',
      email: 'su04@lunar.obs',
      phone: '+27-21-555-0317',
      ctaText: 'VIEW TELEMETRY',
      ctaHref: '#observation',
      image: '/images/facility-sutherland.jpg',
      utcOffset: 2,
      article: {
        title: 'Southern Hemisphere Watch',
        paragraphs: [
          'Sutherland Node anchors the southern hemisphere segment of our network. Located in the Karoo semi-desert, the station benefits from minimal light pollution and stable atmospheric conditions year-round.',
          'The node specializes in polar observation, tracking the lunar south pole where permanently shadowed regions may contain water ice. Our ASCII renderings have detected anomalous reflections in Shackleton Crater that warrant continued investigation.',
          'SU-04 coordinates closely with the Square Kilometre Array precursors, sharing radio-quiet zone protocols and calibration data. The result is the most consistent lunar telemetry stream in the Southern Hemisphere.',
        ],
      },
    },
  ],
}

export const observationConfig: ObservationConfig = {
  sectionLabel: 'LIVE OBSERVATION FEED',
  videoPath: '/videos/observation.mp4',
  statusText: 'LIVE — RECEIVING',
  latLabel: 'LAT',
  lonLabel: 'LON',
  initialLat: 0.67,
  initialLon: 23.47,
}

export const archivesConfig: ArchivesConfig = {
  sectionLabel: 'TELEMETRY ARCHIVES',
  vaultTitle: 'OPEN THE VAULT',
  closeText: 'CLOSE VAULT',
  items: [
    {
      src: '/images/archive-01.jpg',
      label: 'APOLLO 11 SITE — 1969',
    },
    {
      src: '/images/archive-02.jpg',
      label: 'FAR SIDE CRATER FIELD',
    },
    {
      src: '/images/archive-03.jpg',
      label: 'TERMINATOR SHADOW STUDY',
    },
    {
      src: '/images/archive-04.jpg',
      label: 'SOUTH POLE ANOMALY',
    },
  ],
}

export const footerConfig: FooterConfig = {
  copyrightText: 'LUNAR OBSERVATORY NETWORK',
  statusText: 'ALL SYSTEMS NOMINAL',
}
