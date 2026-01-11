// Browser shim for observer/safety module

export class SafetyConstraint {
  constructor(options = {}) {
    this.name = options.name || 'unnamed';
    this.description = options.description || '';
    this.type = options.type || 'soft';
    this.response = options.response || 'warn';
    this.condition = options.condition || (() => false);
  }
  
  check(state) {
    const violated = this.condition(state);
    return {
      constraint: this,
      violated,
      severity: this.type
    };
  }
}

export class SafetyMonitor {
  constructor() {
    this.alertLevel = 0;
    this.alerts = [];
  }
  
  addAlert(alert) {
    this.alerts.push(alert);
    this.alertLevel = Math.max(this.alertLevel, alert.severity === 'hard' ? 2 : 1);
  }
  
  reset() {
    this.alerts = [];
    this.alertLevel = 0;
  }
}

export class SafetyLayer {
  constructor(options = {}) {
    this.constraints = [];
    this.monitor = new SafetyMonitor();
    this.onViolation = options.onViolation || (() => {});
    this.emergencyShutdown = false;
    this.shutdownReason = null;
  }
  
  addConstraint(constraint) {
    this.constraints.push(constraint);
  }
  
  checkConstraints(state) {
    const violations = [];
    for (const constraint of this.constraints) {
      const result = constraint.check(state);
      if (result.violated) {
        violations.push(result);
        this.onViolation(state, result);
        this.monitor.addAlert(result);
      }
    }
    return {
      safe: violations.length === 0,
      violations
    };
  }
  
  resetEmergency() {
    this.emergencyShutdown = false;
    this.shutdownReason = null;
    this.monitor.reset();
  }
  
  getStats() {
    return {
      constraintCount: this.constraints.length,
      alertLevel: this.monitor.alertLevel,
      isSafe: !this.emergencyShutdown && this.monitor.alertLevel < 2
    };
  }
}

export default { SafetyConstraint, SafetyMonitor, SafetyLayer };