type MassUnit = "ug" | "mg" | "g" | "kg";
type EnergyUnit = "kcal";
type OtherUnit = "iu";
type Unit = MassUnit | EnergyUnit | OtherUnit;

type UnitKind = "mass" | "energy" | "iu";

const _UNIT_KIND: Record<Unit, UnitKind> = {
  ug: "mass",
  mg: "mass",
  g: "mass",
  kg: "mass",
  kcal: "energy",
  iu: "iu",
};

// Conversion factors to canonical sub-unit (µg for mass, kcal×10 for energy)
const TO_CANONICAL: Record<Unit, number> = {
  ug: 1,
  mg: 1_000,
  g: 1_000_000,
  kg: 1_000_000_000,
  kcal: 10, // store as kcal × 10 for one-decimal precision
  iu: 1, // IU stored as-is (integer)
};

export class Quantity {
  /** Canonical integer value (µg for mass, kcal×10 for energy, raw for IU) */
  readonly canonical: number;
  readonly kind: UnitKind;

  private constructor(canonical: number, kind: UnitKind) {
    this.canonical = Math.round(canonical);
    this.kind = kind;
  }

  // -- Constructors --

  static fromUg(amount: number): Quantity {
    return new Quantity(amount, "mass");
  }

  static fromMg(amount: number): Quantity {
    return new Quantity(amount * TO_CANONICAL.mg, "mass");
  }

  static fromG(amount: number): Quantity {
    return new Quantity(amount * TO_CANONICAL.g, "mass");
  }

  static fromKg(amount: number): Quantity {
    return new Quantity(amount * TO_CANONICAL.kg, "mass");
  }

  static fromKcal(amount: number): Quantity {
    return new Quantity(amount * TO_CANONICAL.kcal, "energy");
  }

  static fromIU(amount: number): Quantity {
    return new Quantity(amount, "iu");
  }

  static fromCanonical(canonical: number, kind: UnitKind): Quantity {
    return new Quantity(canonical, kind);
  }

  // -- Converters --

  toUg(): number {
    this.assertKind("mass");
    return this.canonical;
  }

  toMg(): number {
    this.assertKind("mass");
    return this.canonical / TO_CANONICAL.mg;
  }

  toG(): number {
    this.assertKind("mass");
    return this.canonical / TO_CANONICAL.g;
  }

  toKcal(): number {
    this.assertKind("energy");
    return this.canonical / TO_CANONICAL.kcal;
  }

  toIU(): number {
    this.assertKind("iu");
    return this.canonical;
  }

  // -- Arithmetic --

  add(other: Quantity): Quantity {
    this.assertSameKind(other);
    return new Quantity(this.canonical + other.canonical, this.kind);
  }

  sub(other: Quantity): Quantity {
    this.assertSameKind(other);
    return new Quantity(this.canonical - other.canonical, this.kind);
  }

  mul(scalar: number): Quantity {
    return new Quantity(this.canonical * scalar, this.kind);
  }

  // -- Serialisation --

  toJSON(): { canonical: number; kind: UnitKind } {
    return { canonical: this.canonical, kind: this.kind };
  }

  static fromJSON(json: { canonical: number; kind: UnitKind }): Quantity {
    return new Quantity(json.canonical, json.kind);
  }

  // -- Guards --

  private assertKind(expected: UnitKind): void {
    if (this.kind !== expected) {
      throw new Error(`Cannot convert ${this.kind} quantity to ${expected} unit`);
    }
  }

  private assertSameKind(other: Quantity): void {
    if (this.kind !== other.kind) {
      throw new Error(`Cannot combine ${this.kind} and ${other.kind} quantities`);
    }
  }
}
