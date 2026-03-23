import { CarConfig, CarClass } from './types.js';

const STOCK: CarConfig = {
  name: 'Stock',
  maxRpm: 6200,
  idleRpm: 700,
  peakTorqueRpm: 3600,
  peakHpRpm: 5600,
  peakTorqueNm: 678,       // 500 ft-lb = 678 Nm (LS6 454)
  mass: 1600,
  dragCoeffArea: 0.99,     // Cd 0.45 * 2.2 m² frontal area
  tireGrip: 0.90,          // street tire on prepped surface
  gearRatios: [2.52, 1.88, 1.46, 1.00],  // Muncie M20 wide ratio
  finalDrive: 3.73,
  tireRadius: 0.35,
  rpmBuildRate: 0.8,
  shiftDropRpm: 0,         // now calculated from gear ratios in engine
  targetEt: 13.5,
  targetMph: 107,
};

const MODIFIED: CarConfig = {
  name: 'Modified',
  maxRpm: 7200,
  idleRpm: 850,
  peakTorqueRpm: 4800,
  peakHpRpm: 6400,
  peakTorqueNm: 840,       // 620 ft-lb = 840 Nm (supercharged Coyote)
  mass: 1400,
  dragCoeffArea: 0.80,     // Cd 0.40 * 2.0 m²
  tireGrip: 1.10,          // DOT drag radials
  gearRatios: [2.66, 1.78, 1.30, 1.00],  // T56 style
  finalDrive: 3.73,
  tireRadius: 0.36,
  rpmBuildRate: 1.2,
  shiftDropRpm: 0,
  targetEt: 10.5,
  targetMph: 132,
};

const FUNNY_CAR: CarConfig = {
  name: 'Funny Car',
  maxRpm: 8600,
  idleRpm: 2800,
  peakTorqueRpm: 6500,
  peakHpRpm: 8000,
  peakTorqueNm: 9492,      // 7000 ft-lb = 9492 Nm (nitro Hemi)
  mass: 1135,               // NHRA minimum 2500 lb
  dragCoeffArea: 0.54,      // Cd 0.30 * 1.8 m²
  tireGrip: 2.50,           // heated slicks on prepped surface
  gearRatios: [2.30, 1.55, 1.15, 1.00],  // virtual clutch stages for gameplay
  finalDrive: 3.22,
  tireRadius: 0.46,         // 36" slicks
  rpmBuildRate: 1.8,
  shiftDropRpm: 0,
  targetEt: 4.0,
  targetMph: 330,
};

const TOP_FUEL: CarConfig = {
  name: 'Top Fuel',
  maxRpm: 8800,
  idleRpm: 2800,
  peakTorqueRpm: 6800,
  peakHpRpm: 8200,
  peakTorqueNm: 10848,     // 8000 ft-lb = 10848 Nm (Top Fuel Hemi)
  mass: 1043,               // NHRA minimum 2300 lb
  dragCoeffArea: 0.30,      // Cd 0.25 * 1.2 m² (low profile dragster)
  tireGrip: 3.50,           // top fuel slicks, maximum compound
  gearRatios: [2.10, 1.45, 1.10, 1.00],  // virtual clutch stages
  finalDrive: 3.22,
  tireRadius: 0.46,
  rpmBuildRate: 2.2,
  shiftDropRpm: 0,
  targetEt: 3.8,
  targetMph: 335,
};

export const CAR_CLASSES: Record<CarClass, CarConfig> = {
  stock: STOCK,
  modified: MODIFIED,
  funny_car: FUNNY_CAR,
  top_fuel: TOP_FUEL,
};

export const CAR_CLASS_ORDER: CarClass[] = ['stock', 'modified', 'funny_car', 'top_fuel'];
