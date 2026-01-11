// Browser shim for observer/agency module

export class Goal {
  constructor(data = {}) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.description = data.description || '';
    this.priority = data.priority || 1;
    this.progress = data.progress || 0;
    this.isActive = true;
  }
  
  update(progress) {
    this.progress = Math.min(1, Math.max(0, progress));
    if (this.progress >= 1) {
      this.isActive = false;
    }
  }
}

export class AttentionFocus {
  constructor(data = {}) {
    this.target = data.target || '';
    this.type = data.type || 'concept';
    this.intensity = data.intensity || 1.0;
    this.decay = data.decay || 0.1;
    this.timestamp = Date.now();
  }
  
  tick() {
    this.intensity = Math.max(0, this.intensity - this.decay);
  }
}

export class AgencyLayer {
  constructor() {
    this.goals = [];
    this.focuses = [];
  }
  
  maybeCreateGoal(data) {
    const goal = new Goal(data);
    this.goals.push(goal);
    return goal;
  }
  
  addOrUpdateFocus(data) {
    const existing = this.focuses.find(f => f.target === data.target);
    if (existing) {
      existing.intensity = data.intensity || existing.intensity;
      return existing;
    }
    const focus = new AttentionFocus(data);
    this.focuses.push(focus);
    return focus;
  }
  
  getTopFocus() {
    return this.focuses.sort((a, b) => b.intensity - a.intensity)[0] || null;
  }
  
  tick() {
    this.focuses.forEach(f => f.tick());
    this.focuses = this.focuses.filter(f => f.intensity > 0);
  }
}

export default { Goal, AttentionFocus, AgencyLayer };