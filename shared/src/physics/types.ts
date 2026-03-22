export interface CarConfig {
  name: string;
  maxRpm: number;
  idleRpm: number;
  peakTorqueRpm: number;
  peakHpRpm: number;
  peakTorqueNm: number;
  mass: number;            // kg
  dragCoeffArea: number;   // Cd * frontal area (m^2)
  tireGrip: number;        // traction coefficient (0-1)
  gearRatios: number[];    // 4 forward gears
  finalDrive: number;
  tireRadius: number;      // meters
  rpmBuildRate: number;    // multiplier for how fast RPM climbs
  shiftDropRpm: number;   // RPM lost on upshift
  targetEt: number;       // target quarter-mile ET (seconds)
  targetMph: number;      // target trap speed
}

export interface PhysicsState {
  time: number;            // race elapsed time (seconds)
  distance: number;        // meters traveled
  velocity: number;        // m/s
  rpm: number;
  gear: number;            // 1-4
  gasOn: boolean;
  engineBlown: boolean;
  finished: boolean;
  fouled: boolean;
  reactionTime: number;    // seconds from green to first gas
  wheelSlip: number;       // 0-1 traction utilization
  gForce: number;          // longitudinal G-force
  mph: number;             // current speed in MPH
  peakMph: number;         // highest speed reached
  et: number;              // elapsed time at finish (0 if not finished)
}

export interface PhysicsInput {
  gasDown: boolean;
  shiftUp: boolean;        // true on the frame shift was pressed
}

export type CarClass = 'stock' | 'modified' | 'funny_car' | 'top_fuel';
