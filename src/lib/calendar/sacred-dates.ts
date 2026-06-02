// Sacred dates calendar
// @ts-nocheck

export interface SacredDate {
  id: string;
  name: string;
  date: string; // MM-DD format
  month: number;
  day: number;
  tradition: string;
  description: string;
  significance: string;
}

const sacredDates: SacredDate[] = [
  // Celtic/Pagan
  { id: 'imbolc', name: 'Imbolc', date: '02-01', month: 2, day: 1, tradition: 'Celtic', description: 'Festival marking the beginning of spring and honoring Brigid', significance: 'Purification, new beginnings, light returning' },
  { id: 'ostara', name: 'Ostara', date: '03-20', month: 3, day: 20, tradition: 'Celtic', description: 'Spring equinox celebration of balance and renewal', significance: 'Balance, fertility, new life' },
  { id: 'beltane', name: 'Beltane', date: '05-01', month: 5, day: 1, tradition: 'Celtic', description: 'Fire festival celebrating the union of earth and sky', significance: 'Fertility, passion, abundance' },
  { id: 'litha', name: 'Litha', date: '06-21', month: 6, day: 21, tradition: 'Celtic', description: 'Summer solstice, longest day celebrating peak solar energy', significance: 'Solar power, transformation, light' },
  { id: 'lammas', name: 'Lammas', date: '08-01', month: 8, day: 1, tradition: 'Celtic', description: 'First harvest festival honoring bread and grain', significance: 'Gratitude, harvest, thanksgiving' },
  { id: 'mabon', name: 'Mabon', date: '09-22', month: 9, day: 22, tradition: 'Celtic', description: 'Autumn equinox celebrating balance and harvest abundance', significance: 'Balance, gratitude, preparation' },
  { id: 'samhain', name: 'Samhain', date: '10-31', month: 10, day: 31, tradition: 'Celtic', description: 'New Year festival marking the veil between worlds', significance: 'Ancestor honored, reflection, transformation' },
  { id: 'yule', name: 'Yule', date: '12-21', month: 12, day: 21, tradition: 'Celtic', description: 'Winter solstice celebrating the rebirth of the sun', significance: 'Rebirth, light returning, renewal' },

  // Kabbalistic/Jewish Mysticism
  { id: 'rosh-hodesh', name: 'Rosh Chodesh', date: 'Varies', month: 1, day: 1, tradition: 'Kabbalah', description: 'New moon celebration marking the beginning of each month', significance: 'New beginnings, spiritual renewal, feminine divine' },
  { id: 'shabbat', name: 'Shabbat', date: 'Weekly', month: 1, day: 1, tradition: 'Kabbalah', description: 'Day of rest and spiritual restoration', significance: 'Sanctuary in time, divine rest, spiritual replenishment' },
  { id: 'tu-bishvat', name: 'Tu B\'Shvat', date: '01-15', month: 1, day: 15, tradition: 'Kabbalah', description: 'New Year of the Trees, connecting to nature\'s spiritual energy', significance: 'Nature connection, environmental awareness, growth' },
  { id: 'purim', name: 'Purim', date: '03-14', month: 3, day: 14, tradition: 'Kabbalah', description: 'Festival of lots celebrating divine deliverance', significance: 'Hidden miracles, spiritual reversal, joy' },
  { id: 'passover', name: 'Pesach', date: '04-15', month: 4, day: 15, tradition: 'Kabbalah', description: 'Passover celebrating liberation from Egypt', significance: 'Freedom, liberation, redemption' },
  { id: 'lag-bomer', name: 'Lag BaOmer', date: '05-18', month: 5, day: 18, tradition: 'Kabbalah', description: 'Day of unity and tikun (repair)', significance: 'Unity, healing, spiritual connection' },
  { id: 'shavuot', name: 'Shavuot', date: '06-05', month: 6, day: 5, tradition: 'Kabbalah', description: 'Festival of weeks receiving the Torah', significance: 'Revelation, wisdom, divine marriage' },
  { id: 'tisha-bav', name: 'Tisha B\'Av', date: '08-03', month: 8, day: 3, tradition: 'Kabbalah', description: 'Day of mourning for Jerusalem\'s destruction', significance: 'Reflection, mourning, hope for redemption' },
  { id: 'rosh-hashanah', name: 'Rosh Hashanah', date: '09-02', month: 9, day: 2, tradition: 'Kabbalah', description: 'Jewish New Year of creation and judgment', significance: 'Creation, judgment, repentance, renewal' },
  { id: 'yom-kippur', name: 'Yom Kippur', date: '09-11', month: 9, day: 11, tradition: 'Kabbalah', description: 'Day of Atonement for soul purification', significance: 'Purification, forgiveness, divine reconciliation' },
  { id: 'sukkot', name: 'Sukkot', date: '09-17', month: 9, day: 17, tradition: 'Kabbalah', description: 'Festival of Tabernacles dwelling in temporary shelters', significance: 'Divine protection, gratitude, sacred dwelling' },
  { id: 'simchat-torah', name: 'Simchat Torah', date: '09-24', month: 9, day: 24, tradition: 'Kabbalah', description: 'Celebration of completing and restarting Torah reading', significance: 'Joy, Torah devotion, spiritual celebration' },
  { id: 'hanukkah', name: 'Hanukkah', date: '12-07', month: 12, day: 7, tradition: 'Kabbalah', description: 'Festival of lights celebrating miraculous oil and rededication', significance: 'Light triumphing over darkness, miracles, dedication' },

  // Hindu
  { id: 'diwali', name: 'Diwali', date: '11-03', month: 11, day: 3, tradition: 'Hindu', description: 'Festival of lights celebrating victory of light over darkness', significance: 'Inner light, victory of good, prosperity' },
  { id: 'holi', name: 'Holi', date: '03-13', month: 3, day: 13, tradition: 'Hindu', description: 'Festival of colors celebrating spring and love', significance: 'Joy, release, renewal, divine love' },
  { id: 'mahashivratri', name: 'Maha Shivaratri', date: '02-26', month: 2, day: 26, tradition: 'Hindu', description: 'Night dedicated to Lord Shiva\'s wedding and divine dance', significance: 'Devotion, inner transformation, union' },
  { id: 'navratri', name: 'Navratri', date: '10-03', month: 10, day: 3, tradition: 'Hindu', description: 'Nine nights honoring the Divine Mother', significance: 'Divine feminine, victory of good, spiritual power' },
  { id: 'guru-purnima', name: 'Guru Purnima', date: '07-21', month: 7, day: 21, tradition: 'Hindu', description: 'Day to honor spiritual teachers and gurus', significance: 'Gratitude, dedication, teacher worship' },
  { id: 'krishna-janmashtami', name: 'Krishna Janmashtami', date: '08-26', month: 8, day: 26, tradition: 'Hindu', description: 'Birth celebration of Lord Krishna', significance: 'Divine incarnation, devotion, celebration' },
  { id: 'rama-navami', name: 'Rama Navami', date: '04-17', month: 4, day: 17, tradition: 'Hindu', description: 'Birth celebration of Lord Rama', significance: 'Righteousness, dharma, divine incarnation' },

  // Buddhist
  { id: 'vesak', name: 'Vesak/Wesak', date: '05-23', month: 5, day: 23, tradition: 'Buddhist', description: 'Birth, enlightenment, and passing of Buddha', significance: 'Triple celebration, compassion, spiritual awakening' },
  { id: 'losar', name: 'Losar', date: '02-10', month: 2, day: 10, tradition: 'Buddhist', description: 'Tibetan New Year celebration', significance: 'New beginnings, purification, renewal' },
  { id: 'bodhi-day', name: 'Bodhi Day', date: '12-08', month: 12, day: 8, tradition: 'Buddhist', description: 'Day Buddha attained enlightenment under Bodhi tree', significance: 'Enlightenment, awakening, path to freedom' },

  // Egyptian/Ancient
  { id: 'wepet-renpet', name: 'Wepet Renpet', date: '07-20', month: 7, day: 20, tradition: 'Egyptian', description: 'Egyptian New Year celebrating Nile flood and renewal', significance: 'Renewal, regeneration, cosmic rebirth' },
  { id: 'koron', name: 'Koron', date: '09-21', month: 9, day: 21, tradition: 'Egyptian', description: 'Autumn equinox festival honoring the goddess Seshat', significance: 'Sacred writing, endings, new cycles' },

  // Astrological/Solar
  { id: 'new-moon', name: 'New Moon', date: 'Monthly', month: 1, day: 1, tradition: 'Astrological', description: 'Monthly new moon for new intentions and beginnings', significance: 'New beginnings, setting intentions, shadows' },
  { id: 'full-moon', name: 'Full Moon', date: 'Monthly', month: 1, day: 15, tradition: 'Astrological', description: 'Monthly full moon for culmination and release', significance: 'Culmination, release, illumination' },
  { id: 'solar-eclipse', name: 'Solar Eclipse', date: 'Varies', month: 1, day: 1, tradition: 'Astrological', description: 'Powerful time for transformation and new beginnings', significance: 'Transformation, endings, powerful change' },
  { id: 'lunar-eclipse', name: 'Lunar Eclipse', date: 'Varies', month: 1, day: 1, tradition: 'Astrological', description: 'Time for release, revelation, and emotional processing', significance: 'Release, revelation, shadow work' },
  { id: 'retrograde-periods', name: 'Planetary Retrograde', date: 'Varies', month: 1, day: 1, tradition: 'Astrological', description: 'Time for reflection on the retrograde planet\'s domain', significance: 'Introspection, revision, inner work' },

  // Christian Mystical
  { id: 'epiphany', name: 'Epiphany', date: '01-06', month: 1, day: 6, tradition: 'Christian Mystical', description: 'Manifestation of Christ to the Magi', significance: 'Divine revelation, manifestation, light' },
  { id: 'candlemas', name: 'Candlemas', date: '02-02', month: 2, day: 2, tradition: 'Christian Mystical', description: 'Presentation of Jesus, blessing of candles', significance: 'Light, purification, presentation' },
  { id: 'annunciation', name: 'Annunciation', date: '03-25', month: 3, day: 25, tradition: 'Christian Mystical', description: 'Angel Gabriel announces Jesus\' conception', significance: 'Divine message, conception, sacred union' },
  { id: 'easter', name: 'Easter', date: '04-09', month: 4, day: 9, tradition: 'Christian Mystical', description: 'Resurrection celebrating triumph over death', significance: 'Resurrection, triumph, new life' },
  { id: 'ascension', name: 'Ascension', date: '05-25', month: 5, day: 25, tradition: 'Christian Mystical', description: 'Jesus ascends to heaven', significance: 'Transcendence, spiritual elevation, heaven' },
  { id: 'pentecost', name: 'Pentecost', date: '06-08', month: 6, day: 8, tradition: 'Christian Mystical', description: 'Holy Spirit descends upon disciples', significance: 'Holy Spirit, empowerment, spiritual fire' },
  { id: 'all-saints', name: 'All Saints Day', date: '11-01', month: 11, day: 1, tradition: 'Christian Mystical', description: 'Honoring all saints and martyrs', significance: 'Sainthood, holiness, honor' },
  { id: 'all-souls', name: 'All Souls Day', date: '11-02', month: 11, day: 2, tradition: 'Christian Mystical', description: 'Praying for all the faithful departed', significance: 'Ancestors, remembrance, prayers for dead' },
  { id: 'st-martins', name: 'St Martin\'s Day', date: '11-11', month: 11, day: 11, tradition: 'Christian Mystical', description: 'Honoring St Martin of Tours, beginning of winter', significance: 'Sharing, light in darkness, transition' },
  { id: 'winter-solstice-christian', name: 'Winter Solstice', date: '12-21', month: 12, day: 21, tradition: 'Christian Mystical', description: 'Shortest day, celebrating returning light', significance: 'Light returning, rebirth, cosmic Christ' },
  { id: 'christmas', name: 'Christmas', date: '12-25', month: 12, day: 25, tradition: 'Christian Mystical', description: 'Birth of Christ celebrating divine incarnation', significance: 'Divine birth, incarnation, sacred mystery' },

  // Indigenous/Native American
  { id: 'first-snow-moon', name: 'First Snow Moon Ceremony', date: '11-22', month: 11, day: 22, tradition: 'Indigenous', description: 'Honoring winter\'s arrival and preparing for stillness', significance: 'Stillness, preparation, winter wisdom' },
  { id: 'vernal-equinox-native', name: 'Vernal Equinox', date: '03-20', month: 3, day: 20, tradition: 'Indigenous', description: 'Balance of day and night, planting ceremonies', significance: 'Balance, planting, new growth' },
  { id: 'summer-solstice-native', name: 'Summer Solstice', date: '06-21', month: 6, day: 21, tradition: 'Indigenous', description: 'Longest day, sun medicine ceremonies', significance: 'Sun medicine, peak power, gratitude' },

  // Sufi/Mystical
  { id: 'mawlid', name: 'Mawlid al-Nabi', date: '09-15', month: 9, day: 15, tradition: 'Sufi', description: 'Birth celebration of Prophet Muhammad', significance: 'Divine love, Prophetic celebration, blessing' },
  { id: 'laylat-al-qadr', name: 'Laylat al-Qadr', date: 'Varies', month: 9, day: 27, tradition: 'Sufi', description: 'Night of Power during Ramadan', significance: 'Divine decree, destiny, cosmic night' },

  // Sacred Geometry/Cosmic
  { id: 'golden-ratio-day', name: 'Golden Ratio Day', date: '01-06', month: 1, day: 6, tradition: 'Sacred Geometry', description: 'Date reflects phi (1.618) in nature', significance: 'Divine proportion, nature\'s ratio, harmony' },
  { id: 'day-333', name: 'Day 333', date: '11-29', month: 11, day: 29, tradition: 'Sacred Geometry', description: 'Day 333 of 365, cosmic completion approach', significance: 'Completion, readiness, cosmic alignment' },
];

/**
 * Returns all sacred dates
 */
export function getSacredDates(): SacredDate[] {
  return sacredDates;
}

/**
 * Returns sacred dates by tradition
 */
export function getSacredDatesByTradition(tradition: string): SacredDate[] {
  return sacredDates.filter((d) => d.tradition === tradition);
}

/**
 * Returns sacred dates for a specific month (1-12)
 */
export function getSacredDatesByMonth(month: number): SacredDate[] {
  return sacredDates.filter((d) => d.month === month);
}

/**
 * Returns a specific sacred date by ID
 */
export function getSacredDateById(id: string): SacredDate | undefined {
  return sacredDates.find((d) => d.id === id);
}

/**
 * Returns all unique traditions
 */
export function getTraditions(): string[] {
  return [...new Set(sacredDates.map((d) => d.tradition))];
}
