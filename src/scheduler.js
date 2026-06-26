class Scheduler {
  constructor() {
    this.jobs = [];
  }

  schedule(name, fn, delayMs) {
    const id = setTimeout(() => {
      fn();
      this.jobs = this.jobs.filter(j => j.id !== id);
    }, delayMs);
    this.jobs.push({ id, name });
    return id;
  }

  cancel(id) {
    clearTimeout(id);
    this.jobs = this.jobs.filter(j => j.id !== id);
  }

  pendingCount() {
    return this.jobs.length;
  }
}

module.exports = Scheduler;
