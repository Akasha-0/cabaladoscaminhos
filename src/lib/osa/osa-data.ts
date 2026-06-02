// Osa data

export interface OsaData {
  odu: string;
  meaning: string;
  sign: string;
}

function getData(): OsaData[] {
  return [
    { odu: 'Osa-Meji', meaning: 'Double Osa - Unity and completion', sign: 'Ogun' },
    { odu: 'Osa-Ogbe', meaning: 'Osa leads - Transformation and change', sign: 'Shango' },
    { odu: 'Osa-Oyu', meaning: 'Osa with Oyu - Balance and harmony', sign: 'Obatala' },
    { odu: 'Osa-Oji', meaning: 'Osa with Oji - Wisdom and clarity', sign: 'Orunmila' },
    { odu: 'Osa-Owan', meaning: 'Osa with Owan - Strength and courage', sign: 'Ogun' },
    { odu: 'Osa-Irosun', meaning: 'Osa with Irosun - Intuition and insight', sign: 'Eleggua' },
    { odu: 'Osa-Odi', meaning: 'Osa with Odi - Reflection and patience', sign: 'Osain' },
    { odu: 'Osa-Oshey', meaning: 'Osa with Oshey - Joy and celebration', sign: 'Shango' },
    { odu: 'Osa-Okanran', meaning: 'Osa with Okanran - Deep knowledge', sign: 'Olokun' },
    { odu: 'Osa-Ogunda', meaning: 'Osa with Ogunda - Power and precision', sign: 'Ogun' },
    { odu: 'Osa-Osa', meaning: 'Double Osa - Perfect balance', sign: 'All' },
  ];
}