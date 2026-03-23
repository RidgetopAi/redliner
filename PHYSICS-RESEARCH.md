# Drag Racing Physics Research
## Real-World Data for Quarter-Mile Racing Game Physics Engine

---

## 1. CAR CLASSES - QUARTER MILE PERFORMANCE BRACKETS

### Stock Muscle Car (Class 1)
- **Quarter Mile ET**: 12.5 - 14.0 seconds
- **Trap Speed**: 100 - 115 mph
- **60-foot time**: 1.8 - 2.1 seconds
- **Typical 330ft**: 5.5 - 6.2 seconds
- **Typical 660ft (1/8 mile)**: 8.2 - 9.0 seconds at 80-90 mph
- **Examples**: 1970 Chevelle SS 454 (13.1s @ 107mph), Pontiac Trans Am (13.4s @ 101mph), stock Camaro SS

### Modified Street Car (Class 2)
- **Quarter Mile ET**: 9.5 - 11.0 seconds
- **Trap Speed**: 120 - 140 mph
- **60-foot time**: 1.4 - 1.7 seconds
- **Examples**: Built turbo/supercharged street cars, crate engine swaps with bolt-ons

### Funny Car (Class 3)
- **Quarter Mile ET**: 3.8 - 4.2 seconds (1000ft in NHRA, but game uses 1/4 mile)
- **Trap Speed**: 320 - 342 mph
- **60-foot time**: 0.8 - 0.9 seconds
- **Record**: 3.804s / 341.68 mph (Austin Prock, 2024)

### Top Fuel (Class 4)
- **Quarter Mile ET**: 3.7 - 4.5 seconds (historical 1/4 mile data)
- **Trap Speed**: 325 - 339 mph
- **0-60 mph**: ~0.4 seconds
- **0-100 mph**: ~0.8 seconds (first 60 feet)
- **0-200 mph**: ~2.2 seconds (first 350 feet)
- **0-300 mph**: ~3.7 seconds
- **Record**: 3.641s / 338.94 mph (Brittany Force, 2022)

---

## 2. ENGINE SPECIFICATIONS PER CLASS

### Stock Muscle Car
- **Displacement**: 350-454 cubic inches (5.7L - 7.4L)
- **Configuration**: Naturally aspirated V8, single 4-barrel carburetor
- **Max HP**: 350-450 hp
- **Peak HP RPM**: 5,200 - 5,800 RPM
- **Peak Torque**: 400-500 ft-lb
- **Peak Torque RPM**: 3,200 - 4,000 RPM
- **Idle RPM**: 650-800
- **Redline**: 5,500 - 6,500 RPM
- **Example (LS6 454)**: 450 hp @ 5,600 RPM, 500 ft-lb @ 3,600 RPM

### Modified Street Car
- **Displacement**: 350-427 cubic inches (often stroked) or modern 5.0L-6.2L
- **Configuration**: Supercharged or turbocharged V8
- **Max HP**: 600-900 hp
- **Peak HP RPM**: 5,800 - 6,800 RPM
- **Peak Torque**: 550-750 ft-lb
- **Peak Torque RPM**: 3,800 - 5,000 RPM
- **Idle RPM**: 800-1000
- **Redline**: 6,500 - 7,500 RPM
- **Example**: Supercharged Coyote 5.0L making 600+ rwhp, 10.79s @ 126 mph

### Funny Car
- **Displacement**: 500 cubic inches (8.19L) - NHRA mandated
- **Configuration**: Supercharged, nitromethane-fueled Hemi V8
- **Supercharger**: Roots-type, 14-71 blower, 60-65 PSI boost
- **Max HP**: 10,000 - 11,000+ hp
- **Peak HP RPM**: ~8,000 - 8,600 RPM
- **Peak Torque**: ~7,000 ft-lb
- **Peak Torque RPM**: ~6,500 - 7,000 RPM
- **Idle RPM**: 2,500 - 3,000 (nitro idle is rough/high)
- **Redline**: 8,500 - 9,000 RPM
- **Fuel**: 85-90% nitromethane, 10-15% methanol
- **Fuel consumption**: ~15 gallons per run

### Top Fuel
- **Displacement**: 500 cubic inches (8.19L) - NHRA mandated
- **Configuration**: Supercharged, nitromethane-fueled Hemi V8
- **Supercharger**: Roots-type, 14-71 blower, 60-65 PSI boost (absorbs ~900 HP alone at 8500 RPM)
- **Max HP**: 11,000+ hp (dyno-tested at 11,051 hp)
- **Peak HP RPM**: ~8,000 - 8,500 RPM
- **Peak Torque**: ~8,000 ft-lb
- **Peak Torque RPM**: ~6,000 - 6,800 RPM
- **Idle RPM**: 2,500 - 3,000
- **Redline**: 8,500 - 9,500 RPM
- **Fuel consumption**: 4-5 gallons per quarter mile, 65 GPM fuel pump rate

---

## 3. TRANSMISSION & GEAR RATIOS

### Stock Muscle Car - 4-Speed Manual
**Wide Ratio (Muncie M20 style - better for drag racing with big blocks):**
| Gear | Ratio |
|------|-------|
| 1st  | 2.52  |
| 2nd  | 1.88  |
| 3rd  | 1.46  |
| 4th  | 1.00  |
| Final Drive | 3.55 - 4.10 |

**Close Ratio (Muncie M21/M22 style - used with steep rear gears):**
| Gear | Ratio |
|------|-------|
| 1st  | 2.20  |
| 2nd  | 1.64  |
| 3rd  | 1.28  |
| 4th  | 1.00  |
| Final Drive | 4.11 - 4.56 |

**For the game, use the wide ratio (M20) with 3.73 final drive** - this is the classic drag racing setup.

**Overall ratios (M20 + 3.73 final drive):**
- 1st: 2.52 x 3.73 = 9.40 (massive mechanical advantage)
- 2nd: 1.88 x 3.73 = 7.01
- 3rd: 1.46 x 3.73 = 5.45
- 4th: 1.00 x 3.73 = 3.73 (direct drive)

### Modified Street Car - 5-Speed Manual or 2-Speed Auto
**Option A: T56 6-speed (only use 4-5 gears in 1/4 mile)**
| Gear | Ratio |
|------|-------|
| 1st  | 2.66  |
| 2nd  | 1.78  |
| 3rd  | 1.30  |
| 4th  | 1.00  |
| Final Drive | 3.42 - 3.73 |

**Option B: Powerglide 2-speed (common in serious drag cars)**
| Gear | Ratio |
|------|-------|
| 1st  | 1.76  |
| 2nd  | 1.00  |
| Final Drive | 4.56 - 5.13 |

**For the game, use 4-speed (T56 ratios, only shift 1-2-3-4) with 3.73 final drive.**

### Funny Car - NO TRADITIONAL TRANSMISSION
- **Direct drive** (1:1 ratio) through a multi-stage centrifugal clutch
- The clutch acts as a continuously variable torque converter
- 6 clutch discs maximum, engaged progressively by pneumatic timers
- For the game: model as 5 "virtual gears" representing clutch engagement stages
- Clutch reaches full lockup (1:1) around halfway down the strip

### Top Fuel - NO TRADITIONAL TRANSMISSION
- **Direct drive** (1:1 ratio), identical concept to Funny Car
- Multi-stage centrifugal clutch with timer-controlled progressive engagement
- Engine hits ~5,000 RPM before clutch engages enough to launch
- Full lockup occurs around 1,000 feet mark
- For the game: model as 5 "virtual gears" representing clutch stages

**GAME NOTE for Funny Car / Top Fuel clutch stages:**
```
Stage 1 (Launch):     ~20% clutch engagement, engine 5000-8500 RPM, wheels much slower
Stage 2 (0-200ft):    ~40% engagement, engine 7000-8500 RPM
Stage 3 (200-500ft):  ~60% engagement, engine 7500-8500 RPM
Stage 4 (500-800ft):  ~80% engagement, engine 8000-8500 RPM
Stage 5 (800-1320ft): 100% lockup, engine 8000-8500 RPM, 1:1 with wheels
```

---

## 4. RPM BEHAVIOR PER GEAR

### How RPM Climb Rate Differs By Gear

The RPM climb rate is inversely proportional to the gear ratio's mechanical advantage against vehicle speed. In lower gears, the engine sees less load (more mechanical advantage), so RPM climbs faster.

**RPM climb rate relative to 1st gear (approximate):**
| Gear | Relative RPM Climb Rate | Why |
|------|------------------------|-----|
| 1st  | 1.00x (fastest)        | Highest gear ratio = most torque multiplication = least load on engine |
| 2nd  | 0.65x                  | Less multiplication, engine works harder against vehicle inertia |
| 3rd  | 0.45x                  | Even less multiplication |
| 4th  | 0.30x (slowest)        | Direct drive, engine fights full vehicle inertia + aero drag |

### Stock Muscle Car - Time Per Gear (13.5s Quarter Mile)
| Gear | Duration | RPM Range | Speed at Shift |
|------|----------|-----------|----------------|
| 1st  | 2.0 - 2.5s | Launch to 6,000-6,500 | 35-45 mph |
| 2nd  | 3.0 - 3.5s | 4,200-6,200 (drop then climb) | 60-70 mph |
| 3rd  | 4.0 - 4.5s | 4,500-6,000 | 85-95 mph |
| 4th  | 3.5 - 4.0s | 4,200-5,800 (crosses finish) | 100-110 mph |
| **Total** | **~13.5s** | | |

### Modified Street Car - Time Per Gear (10.5s Quarter Mile)
| Gear | Duration | RPM Range | Speed at Shift |
|------|----------|-----------|----------------|
| 1st  | 1.5 - 1.8s | Launch to 7,000-7,500 | 45-55 mph |
| 2nd  | 2.5 - 3.0s | 4,800-7,200 | 80-95 mph |
| 3rd  | 3.0 - 3.5s | 5,200-7,000 | 115-130 mph |
| 4th  | 2.5 - 3.0s | 5,500-6,800 (crosses finish) | 130-140 mph |
| **Total** | **~10.5s** | | |

### Funny Car - Clutch Stages (3.9s 1000ft, ~4.0s Quarter Mile)
The engine stays at 7,500-8,500 RPM the entire run. The "shift" is the clutch progressively locking up. RPM doesn't really "climb" in the traditional sense - it oscillates in a narrow band while the clutch engagement increases.

### Top Fuel - Clutch Stages (3.7s 1000ft, ~3.8s Quarter Mile)
Same concept as Funny Car. Engine rpm holds between 7,500-8,500 RPM. Power delivery increases as clutch locks up progressively.

### RPM Drop After Shift
The RPM drops by the ratio between the old and new gear:
```
new_RPM = old_RPM * (new_gear_ratio / old_gear_ratio)
```

**Stock car M20 example shifting at 6,200 RPM:**
- 1st->2nd: 6,200 * (1.88/2.52) = 4,625 RPM (drop of 1,575)
- 2nd->3rd: 6,200 * (1.46/1.88) = 4,814 RPM (drop of 1,386)
- 3rd->4th: 6,200 * (1.00/1.46) = 4,247 RPM (drop of 1,953)

---

## 5. SHIFT POINTS & ENGINE BLOW MECHANICS

### Optimal Shift Points
- **General rule**: Shift at or slightly past peak horsepower RPM
- **Stock muscle car**: Shift at 5,800 - 6,200 RPM (redline ~6,500)
  - Optimal: ~93-95% of redline
- **Modified**: Shift at 6,800 - 7,200 RPM (redline ~7,500)
  - Optimal: ~93-96% of redline
- **Pro Stock reference**: Different shift points per gear:
  - 1st gear: shift at 7,100 RPM
  - 2nd gear: shift at 7,600 RPM
  - 3rd gear: cross finish at 8,200-8,300 RPM
  - (Each successive gear shifts higher because RPM drop is smaller)

### Power Band Sweet Spot
- **Naturally aspirated (Stock)**: Narrow power band, peak HP at ~5,400 RPM, falls off above 5,800
  - Sweet spot: 3,500 - 5,800 RPM
  - Below 3,000 RPM: sluggish, ~60% of peak torque
- **Supercharged (Modified)**: Wider power band due to boost
  - Sweet spot: 3,500 - 7,000 RPM
  - More linear torque delivery
- **Nitro supercharged (Funny/Top Fuel)**: Very narrow operational band
  - Engine lives at 7,000 - 8,500 RPM the entire run
  - Below 6,000 RPM: dangerously lean, engine damage risk

### Over-Rev / Engine Blow Mechanics
- **0-100 RPM past redline**: Safe zone, engines have ~200 RPM margin built in
- **100-500 RPM past redline**: Danger zone, valve float begins
  - Valve springs can't close valves fast enough
  - Risk increases with duration
- **500-1000 RPM past redline**: High probability of damage
  - Valve-to-piston contact likely
  - Rod bearing failure risk
  - ~50% chance of catastrophic failure
- **1000+ RPM past redline**: Almost certain destruction
  - Connecting rod failure
  - Valve train destruction
  - "Throwing a rod" through the block

**Game implementation suggestion:**
```
overRevPercent = (currentRPM - redline) / redline

0-2%:   Warning zone (rev limiter buzzing, no damage)
2-5%:   Danger zone (increasing damage probability per frame)
5-8%:   Critical (high damage probability, power loss begins)
8%+:    Engine blow (catastrophic failure, race over)

Damage probability per tick at each level:
  2-5% over: 0.1% per game tick
  5-8% over: 2% per game tick
  8%+: 15% per game tick
```

**Missed shift scenario**: If player accidentally goes into wrong gear (e.g., 1st instead of 3rd), the drivetrain can FORCE the engine past redline via wheel speed driving the engine. This is the most dangerous over-rev scenario and should be instant or near-instant engine blow.

---

## 6. TORQUE CURVE SHAPES

### Naturally Aspirated V8 (Stock Muscle Car)
The torque curve has a distinctive "hill" shape:
```
Normalized Torque vs RPM (percentage of peak torque):

RPM (% of redline) | Torque (% of peak)
--------------------|-------------------
10% (idle ~650)     | 40%
15% (~1000)         | 50%
25% (~1625)         | 65%
35% (~2275)         | 78%
45% (~2925)         | 88%
55% (~3575)         | 96%
62% (~4030)         | 100% (PEAK TORQUE)
70% (~4550)         | 97%
77% (~5000)         | 92%
85% (~5525)         | 85%  (peak HP is around here)
92% (~5980)         | 75%
100% (redline 6500) | 62%
```

**Key characteristics:**
- Gradual rise from idle: torque builds smoothly
- Broad peak: NA engines have a rounded peak, not a spike
- Moderate falloff: torque drops ~25-35% from peak to redline
- HP peaks about 1,000-1,500 RPM above peak torque

### Supercharged V8 (Modified Street Car)
```
RPM (% of redline) | Torque (% of peak)
--------------------|-------------------
10% (idle ~750)     | 35%
15% (~1125)         | 48%
25% (~1875)         | 68%
35% (~2625)         | 82%
45% (~3375)         | 92%
55% (~4125)         | 98%
62% (~4650)         | 100% (PEAK TORQUE)
70% (~5250)         | 99%  <- flatter plateau with boost
77% (~5775)         | 96%
85% (~6375)         | 90%
92% (~6900)         | 82%
100% (redline 7500) | 70%
```

**Key characteristics:**
- Similar shape but FLATTER at the top (boost fills the curve)
- Supercharger provides instant boost (no turbo lag)
- Torque plateau is wider (~45-75% of redline stays above 90%)
- Less falloff past peak: supercharger maintains airflow at high RPM

### Nitromethane Supercharged Hemi (Funny Car / Top Fuel)
```
RPM (% of redline) | Torque (% of peak)
--------------------|-------------------
30% (idle ~2700)    | 30%  (nitro engines don't really idle smoothly)
40% (~3600)         | 55%
50% (~4500)         | 75%
60% (~5400)         | 90%
70% (~6300)         | 98%
75% (~6750)         | 100% (PEAK TORQUE)
80% (~7200)         | 99%
85% (~7650)         | 96%
90% (~8100)         | 90%
95% (~8550)         | 80%
100% (redline 9000) | 65%
```

**Key characteristics:**
- Operational range is much narrower (engine idles at ~3000 RPM)
- Enormous absolute torque values (7,000-8,000 ft-lb)
- Very steep rise from idle to peak (nitro + boost = explosive power delivery)
- Sharp falloff above peak (massive mechanical stress at high RPM)
- Engine lives at 75-95% of redline during actual racing

### Torque Curve Formula (for game implementation)
A good approximation uses a normalized parabolic-like function:
```javascript
function getTorqueAtRPM(rpm, peakTorque, peakTorqueRPM, idleRPM, maxRPM) {
  // Normalize RPM to 0-1 range
  const normalizedRPM = (rpm - idleRPM) / (maxRPM - idleRPM);
  const peakNormalized = (peakTorqueRPM - idleRPM) / (maxRPM - idleRPM);

  // Asymmetric bell curve: rises more gradually, falls more steeply
  let torqueMultiplier;
  if (normalizedRPM <= peakNormalized) {
    // Rising side: gradual climb
    const t = normalizedRPM / peakNormalized;
    torqueMultiplier = 0.4 + 0.6 * (1 - Math.pow(1 - t, 2)); // quadratic rise from 40% to 100%
  } else {
    // Falling side: steeper drop
    const t = (normalizedRPM - peakNormalized) / (1 - peakNormalized);
    torqueMultiplier = 1.0 - 0.38 * Math.pow(t, 1.5); // drops to ~62% at redline
  }

  return peakTorque * torqueMultiplier;
}
```

**For supercharged engines**, flatten the curve by reducing the exponents (less dramatic rise and fall). For nitro engines, steepen both sides and shift the operating range higher.

---

## 7. LAUNCH MECHANICS

### Reaction Times
| Skill Level | Reaction Time | Notes |
|-------------|---------------|-------|
| Perfect     | 0.000s        | Exactly when green lights |
| Pro driver  | 0.020 - 0.060s | Top Fuel avg: ~0.039s, Pro Stock: ~0.022s |
| Expert      | 0.040 - 0.080s | Consistent bracket racers |
| Good        | 0.080 - 0.150s | Experienced amateurs |
| Average     | 0.150 - 0.300s | Casual racers |
| Beginner    | 0.300 - 0.500s | First-timers |
| Red Light   | < 0.000s       | Left too early = DQ |

**Pro Tree (used in Pro classes)**: All 3 amber lights flash simultaneously, green comes 0.400s later. Drivers aim for 0.400s total response time (leave just as green hits).

**Sportsman Tree**: 3 amber lights cascade 0.500s apart, then green.

### Traction / Wheel Spin Off The Line

**Tire friction coefficients (mu):**
| Tire Type | Coefficient (mu) | Notes |
|-----------|-------------------|-------|
| Street tire (stock car) | 0.8 - 1.0 | Standard rubber on prepared surface |
| Street radial (modified) | 1.0 - 1.2 | Sticky street-legal tires |
| DOT drag radial | 1.2 - 1.5 | Drag-specific street-legal |
| Drag slick | 1.5 - 2.5 | Purpose-built racing slick |
| Top Fuel slick (heated) | 2.5 - 4.0+ | Extreme compound, acts like glue |

**Burnout effect**: Heating tires before a run increases mu by 20-40%. Cold slicks grip poorly.

**Weight transfer at launch:**
```
Rear wheel load = static_rear_weight + (acceleration * vehicle_mass * CG_height / wheelbase)
Front wheel load = static_front_weight - (same transfer amount)
```

**Traction model for game:**
```javascript
maxTractionForce = mu * rearWheelLoad * numDrivenWheels;
driveForce = engineTorque * gearRatio * finalDrive * efficiency / wheelRadius;

if (driveForce > maxTractionForce) {
  // WHEEL SPIN!
  // Actual forward force reduced
  actualForce = maxTractionForce * 0.7; // spinning tires have ~70% of static friction
  // RPM climbs faster (less load on engine)
  // Tire smoke visual effect
}
```

### Traction Changes During A Run
- **0-60 ft**: Most critical traction zone. Weight transfer peaks. Highest wheel spin risk.
- **60-330 ft**: Weight has settled on rear tires. Traction improves. Less risk.
- **330-660 ft**: Vehicle accelerating hard, traction well-managed. Aerodynamic downforce starting to help.
- **660-1320 ft**: High speed. Aerodynamic drag significant. Tire grip not usually the limiting factor anymore - power delivery is.

---

## 8. PHYSICS ENGINE FORMULAS

### Core Simulation Loop
```
For each time step (dt = 0.001s for accuracy):

1. Calculate engine torque from torque curve at current RPM
2. Apply throttle position: actual_torque = torque_curve[RPM] * throttle
3. Calculate wheel torque: wheel_torque = engine_torque * gear_ratio * final_drive * 0.85
4. Calculate drive force: F_drive = wheel_torque / wheel_radius
5. Calculate traction limit: F_max = mu * rear_wheel_load
6. Actual force = min(F_drive, F_max)  [if F_drive > F_max, wheel spin]
7. Calculate drag: F_aero = 0.5 * Cd * A * air_density * v^2
8. Calculate rolling resistance: F_roll = Crr * vehicle_weight
9. Net force: F_net = F_actual - F_aero - F_roll
10. Acceleration: a = F_net / vehicle_mass
11. Velocity: v += a * dt
12. Position: x += v * dt
13. Calculate RPM from wheel speed: RPM = v * gear_ratio * final_drive * 60 / (2 * pi * wheel_radius)
14. Check shift conditions
```

### Key Constants
| Parameter | Stock | Modified | Funny Car | Top Fuel |
|-----------|-------|----------|-----------|----------|
| Vehicle mass (kg) | 1,600 | 1,400 | 1,135 (2,500 lb min) | 1,043 (2,300 lb min) |
| Cd (drag coeff) | 0.45 | 0.40 | 0.30 | 0.25 |
| Frontal area (m2) | 2.2 | 2.0 | 1.8 | 1.2 |
| Wheel radius (m) | 0.35 | 0.36 | 0.46 (36" slick) | 0.46 (36" slick) |
| Crr (rolling resist) | 0.015 | 0.012 | 0.008 | 0.008 |
| CG height (m) | 0.50 | 0.45 | 0.30 | 0.25 |
| Wheelbase (m) | 2.90 | 2.80 | 2.90 | 4.50 (long chassis) |
| Drivetrain efficiency | 0.82 | 0.85 | 0.90 | 0.90 |
| Weight dist (% rear) | 52% | 55% | 58% | 55% |

### Shift Time (seconds of zero power delivery)
| Class | Shift Time |
|-------|-----------|
| Stock (manual) | 0.3 - 0.5s |
| Modified (manual) | 0.15 - 0.30s |
| Modified (auto/Powerglide) | 0.08 - 0.12s |
| Funny Car / Top Fuel | N/A (continuous clutch engagement) |

---

## 9. OPEN-SOURCE REFERENCES

### OpenDRAG (MATLAB)
- **Repo**: github.com/mc12027/OpenLAP-Lap-Time-Simulator
- Uses engine torque interpolation, gear ratio lookup, traction-limited acceleration model
- RPM formula: `rpm = final_ratio * gearbox_ratio * primary_ratio * v / tyre_radius * 60 / (2*pi)`
- Acceleration: `ax = min(ax_power_limit, ax_tyre_max_acc)` - minimum of power-limited and traction-limited
- Time step: 1ms

### Car Physics for Games (Marco Monster / Asawicki)
- **URL**: asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
- Comprehensive formulas for: drive force, tire slip, weight transfer, aero drag
- Corvette C5 example data (gear ratios: 2.66/1.78/1.30/1.00/0.74/0.50, diff: 3.42)
- Transmission efficiency: 70%
- Tire friction: 1.0 street, 1.5 racing
- Slip ratio for peak grip: ~6% (0.06)

### Vehicle Physics Pro (Unity)
- **URL**: vehiclephysics.com/blocks/engine/
- Engine modeled with: raw combustion torque - friction torque = net torque
- Friction formula: `Tf = frictionTorque + w * rotationalFriction + (w * viscousFriction)^2`
- Torque curve defined by: idle RPM, peak RPM, max RPM, curve bias

---

## 10. GAME-READY ENGINE CONFIGURATIONS

### Stock Muscle Car (1970 Chevelle SS 454 LS6)
```javascript
const STOCK_ENGINE = {
  name: "454 LS6 Big Block",
  displacement: 454,  // cubic inches
  idleRPM: 700,
  peakTorqueRPM: 3600,
  peakTorque: 500,     // ft-lb
  peakHPRPM: 5600,
  peakHP: 450,
  redline: 6200,
  maxRPM: 6800,        // absolute limit before mechanical failure

  gearRatios: [2.52, 1.88, 1.46, 1.00],  // M20 wide ratio
  finalDrive: 3.73,

  // Normalized torque curve [RPM_fraction, torque_fraction]
  torqueCurve: [
    [0.0, 0.40],   // idle
    [0.15, 0.50],
    [0.25, 0.65],
    [0.35, 0.78],
    [0.45, 0.88],
    [0.55, 0.96],
    [0.58, 1.00],  // peak torque
    [0.70, 0.97],
    [0.77, 0.92],
    [0.85, 0.85],
    [0.90, 0.78],  // peak HP roughly here
    [0.95, 0.70],
    [1.00, 0.62],  // redline
  ]
};
```

### Modified Street Car (Supercharged 5.0L Coyote)
```javascript
const MODIFIED_ENGINE = {
  name: "Supercharged Coyote 5.0",
  displacement: 302,  // cubic inches
  idleRPM: 850,
  peakTorqueRPM: 4800,
  peakTorque: 620,     // ft-lb
  peakHPRPM: 6400,
  peakHP: 750,
  redline: 7200,
  maxRPM: 7800,

  gearRatios: [2.66, 1.78, 1.30, 1.00],  // T56 style (skip 5th/6th)
  finalDrive: 3.73,

  torqueCurve: [
    [0.0, 0.35],
    [0.15, 0.48],
    [0.25, 0.68],
    [0.35, 0.82],
    [0.45, 0.92],
    [0.55, 0.98],
    [0.62, 1.00],  // peak torque - wider plateau
    [0.70, 0.99],
    [0.77, 0.96],
    [0.85, 0.90],
    [0.89, 0.86],  // peak HP
    [0.95, 0.78],
    [1.00, 0.70],
  ]
};
```

### Funny Car (Nitro Hemi)
```javascript
const FUNNY_CAR_ENGINE = {
  name: "500ci Nitro Hemi",
  displacement: 500,
  idleRPM: 2800,
  peakTorqueRPM: 6500,
  peakTorque: 7000,    // ft-lb
  peakHPRPM: 8000,
  peakHP: 10000,
  redline: 8600,
  maxRPM: 9200,

  // Direct drive with progressive clutch engagement
  gearRatios: [1.00],  // single ratio
  finalDrive: 3.22,    // final drive ratio for funny cars
  clutchStages: 5,     // number of progressive engagement stages

  // Clutch engagement profile [distance_fraction, engagement_fraction]
  clutchProfile: [
    [0.00, 0.15],  // launch: minimal engagement
    [0.10, 0.30],  // first 132 ft
    [0.25, 0.50],  // 330 ft
    [0.40, 0.70],  // 528 ft
    [0.60, 0.90],  // 792 ft
    [0.80, 1.00],  // full lockup by 1056 ft
  ],

  torqueCurve: [
    [0.0, 0.30],   // ~2800 RPM
    [0.20, 0.55],
    [0.35, 0.75],
    [0.50, 0.90],
    [0.60, 0.98],
    [0.68, 1.00],  // peak torque
    [0.75, 0.99],
    [0.82, 0.96],
    [0.88, 0.90],
    [0.93, 0.82],  // peak HP
    [0.97, 0.72],
    [1.00, 0.65],
  ]
};
```

### Top Fuel Dragster (Nitro Hemi)
```javascript
const TOP_FUEL_ENGINE = {
  name: "500ci Top Fuel Hemi",
  displacement: 500,
  idleRPM: 2800,
  peakTorqueRPM: 6800,
  peakTorque: 8000,    // ft-lb
  peakHPRPM: 8200,
  peakHP: 11000,
  redline: 8800,
  maxRPM: 9500,

  gearRatios: [1.00],
  finalDrive: 3.22,
  clutchStages: 5,

  clutchProfile: [
    [0.00, 0.12],
    [0.08, 0.28],
    [0.20, 0.48],
    [0.35, 0.68],
    [0.55, 0.88],
    [0.75, 1.00],  // full lockup
  ],

  torqueCurve: [
    [0.0, 0.30],
    [0.18, 0.55],
    [0.32, 0.75],
    [0.48, 0.90],
    [0.58, 0.98],
    [0.65, 1.00],  // peak torque
    [0.73, 0.99],
    [0.80, 0.96],
    [0.87, 0.90],
    [0.92, 0.82],
    [0.96, 0.72],
    [1.00, 0.65],
  ]
};
```

---

## 11. MAKING IT "FEEL RIGHT"

### Stock Car Feel
- Shifts should feel deliberate - 0.3-0.5s of dead time
- RPM climbs steadily in 1st, noticeably slower by 4th gear
- Engine sounds like it's working hard but not screaming
- Wheel spin possible on hard launch but manageable
- 60-foot time very sensitive to launch technique
- Should take 4 shifts to complete the quarter mile
- Trap speed around 105 mph feels realistic

### Modified Car Feel
- Faster shifts - 0.15-0.3s
- More violent acceleration in all gears
- Wider power band means more forgiving shift timing
- Still uses 3-4 shifts
- More wheel spin potential - traction management matters
- Car "pulls" harder through the middle of the run

### Funny Car Feel
- No traditional shifting - the clutch engagement is automatic
- Player manages throttle only (and potentially clutch timer settings)
- Violent, continuous acceleration
- Engine note stays in a narrow band (no gear changes)
- Power delivery ramps up dramatically through the run
- Small throttle inputs have massive effects
- Risk: too much throttle too early = tire smoke/loss of traction

### Top Fuel Feel
- Same as Funny Car but even more extreme
- 5+ G's at launch
- Screen should shake/blur to convey violence
- The entire run is under 4 seconds
- Every millisecond of player input matters
- Throttle modulation in the first 1-2 seconds is critical for traction
- Perfect run = manage the first second, then hold on

---

## SOURCES

- [NHRA Drag Racing Classes](https://www.nhra.com/nhra-101/drag-racing-classes)
- [Top Fuel Wikipedia](https://en.wikipedia.org/wiki/Top_Fuel)
- [Funny Car Wikipedia](https://en.wikipedia.org/wiki/Funny_Car)
- [How Much HP Top Fuel Dragster - SlashGear](https://www.slashgear.com/1810658/how-much-horsepower-top-fuel-dragster-engine/)
- [Top Fuel Engine 11,000+ HP - EngineLabs](https://www.enginelabs.com/news/video-test-shows-top-fuel-nitro-engine-makes-over-11000-horsepower/)
- [Top Fuel and Funny Car Engines - Engine Builder](https://www.enginebuildermag.com/2023/03/top-fuel-and-funny-car-engines/)
- [Top Fuel Clutch Timer System - BangShift](https://bangshift.com/bangshift1320/bangshift1320-spotlight/timers-heres-how-a-top-fuel-clutch-knows-when-to-do-what-it-does/)
- [Top Fuel Clutch - Nitromater Forum](https://nitromater.com/threads/how-does-the-top-fuel-clutch-system-work.22566/)
- [Car Physics for Games](https://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html)
- [OpenDRAG Simulator - GitHub](https://github.com/mc12027/OpenLAP-Lap-Time-Simulator/blob/master/OpenDRAG.m)
- [Vehicle Physics Pro - Engine](https://vehiclephysics.com/blocks/engine/)
- [NHRA Pro Stock Engine Specs](https://www.nhra.com/news/2020/tech-specs-inside-chevy-s-nhra-pro-stock-engine-500-cid-drce)
- [Pro Stock Engines - EngineLabs](https://www.enginelabs.com/engine-tech/engine/pro-stock-engines-whats-the-secret-to-those-big-power-numbers/)
- [Muncie Transmission Ratios](https://5speeds.com/muncie3.htm)
- [Liberty Pro Stock Transmissions](https://libertysgears.com/our-products/clutchless-transmission/)
- [Funny Car Speed Record 2024 - NHRA](https://www.nhra.com/news/2024/funny-car-world-champ-austin-prock-makes-fastest-run-nhra-history)
- [Top Fuel Acceleration Data - NobbyVille](http://www.nobbyville.com/TopFuel.htm)
- [Top Fuel Acceleration - Nitromater](https://nitromater.com/threads/where-does-a-top-fuel-dragster-accelerate-the-hardest.41387/)
- [Drag Racing Reaction Times - NHRA](https://www.nhra.com/news/2018/behind-numbers-how-i-learned-stop-worrying-and-love-reaction-times)
- [Christmas Tree Explained - R1Concepts](https://www.r1concepts.com/blog/race-nhra-drag-racing-christmas-tree-explained/)
- [Tire Friction Coefficients - HPWizard](https://hpwizard.com/tire-friction-coefficient.html)
- [Drag Slicks and Traction - OnAllCylinders](https://www.onallcylinders.com/2016/07/14/drag-slicks-traction/)
- [Over-Revving Engines - CJ Pony Parts](https://www.cjponyparts.com/resources/over-rev-engine)
- [Optimal Shift Points - GlennMessersmith](https://glennmessersmith.com/shiftpt.html)
- [Torque vs HP in Drag Racing - StreetMuscleMag](https://www.streetmusclemag.com/tech-stories/torque-vs-horsepower/)
- [Supercharged vs NA Engines - Motor1](https://www.motor1.com/features/786510/turbocharged-vs-supercharged-vs-naturally-aspirated-engines/)
- [Lenco Racing Transmissions](https://lencoracing.com/index.php?route=information/information&information_id=8)
