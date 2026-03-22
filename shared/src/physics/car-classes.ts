import { CarConfig, CarClass } from './types.js';

const STOCK: CarConfig = {
  name: 'Stock',
  maxRpm: 6500,
  idleRpm: 800,
  peakTorqueRpm: 3500,
  peakHpRpm: 5500,
  peakTorqueNm: 475,
  mass: 1600,
  dragCoeffArea: 0.85,
  tireGrip: 0.85,
  gearRatios: [2.66, 1.78, 1.30, 1.00],
  finalDrive: 3.73,
  tireRadius: 0.34,
  rpmBuildRate: 1.0,
  shiftDropRpm: 1800,
  targetEt: 13.5,
  targetMph: 105,
};

const MODIFIED: CarConfig = {
  name: 'Modified',
  maxRpm: 7500,
  idleRpm: 1000,
  peakTorqueRpm: 4500,
  peakHpRpm: 6500,
  peakTorqueNm: 650,
  mass: 1400,
  dragCoeffArea: 0.78,
  tireGrip: 0.92,
  gearRatios: [2.48, 1.68, 1.21, 1.00],
  finalDrive: 4.10,
  tireRadius: 0.36,
  rpmBuildRate: 1.3,
  shiftDropRpm: 1500,
  targetEt: 10.0,
  targetMph: 140,
};

const FUNNY_CAR: CarConfig = {
  name: 'Funny Car',
  maxRpm: 8500,
  idleRpm: 1200,
  peakTorqueRpm: 5500,
  peakHpRpm: 7500,
  peakTorqueNm: 950,
  mass: 1100,
  dragCoeffArea: 0.72,
  tireGrip: 0.96,
  gearRatios: [2.30, 1.55, 1.15, 1.00],
  finalDrive: 4.56,
  tireRadius: 0.42,
  rpmBuildRate: 1.8,
  shiftDropRpm: 1200,
  targetEt: 7.0,
  targetMph: 195,
};

const TOP_FUEL: CarConfig = {
  name: 'Top Fuel',
  maxRpm: 9500,
  idleRpm: 2000,
  peakTorqueRpm: 6000,
  peakHpRpm: 8500,
  peakTorqueNm: 1800,
  mass: 1050,
  dragCoeffArea: 0.55,
  tireGrip: 0.99,
  gearRatios: [2.10, 1.45, 1.10, 1.00],
  finalDrive: 5.13,
  tireRadius: 0.45,
  rpmBuildRate: 2.5,
  shiftDropRpm: 800,
  targetEt: 5.0,
  targetMph: 260,
};

export const CAR_CLASSES: Record<CarClass, CarConfig> = {
  stock: STOCK,
  modified: MODIFIED,
  funny_car: FUNNY_CAR,
  top_fuel: TOP_FUEL,
};

export const CAR_CLASS_ORDER: CarClass[] = ['stock', 'modified', 'funny_car', 'top_fuel'];
