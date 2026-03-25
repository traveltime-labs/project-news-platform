// src/mock/vehicles.ts
export const mockVehicles = [
  {
    id: '1',
    name: 'TOYOTA ALTIS',
    licensePlate: 'ABC-1234',
    type: 'car' as const,
    brand: 'Toyota',
    model: 'Altis 1.8',
    currentMileage: 45320,
    purchaseDate: '2020-03-15',
  },
  {
    id: '2',
    name: 'YAMAHA FORCE',
    licensePlate: 'XYZ-5678',
    type: 'motorcycle' as const,
    brand: 'Yamaha',
    model: 'Force 155',
    currentMileage: 12450,
    purchaseDate: '2021-08-20',
  },
  {
    id: '3',
    name: 'HONDA FIT',
    licensePlate: 'DEF-9012',
    type: 'car' as const,
    brand: 'Honda',
    model: 'Fit 1.5',
    currentMileage: 68900,
    purchaseDate: '2018-05-10',
  },
]
