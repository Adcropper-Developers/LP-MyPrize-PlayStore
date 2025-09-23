// Breakpoint values in pixels
const BREAKPOINTS = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// Signal implementation
class Signal {
  constructor(initialValue) {
    this._value = initialValue;
    this._listeners = new Set();
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      this._notify();
    }
  }

  subscribe(listener) {
    this._listeners.add(listener);
    // Return unsubscribe function
    return () => this._listeners.delete(listener);
  }

  _notify() {
    this._listeners.forEach((listener) => listener(this._value));
  }
}

// Window size helper with signal
class WindowSizeHelper {
  constructor() {
    // Create signal for mobile state
    this.isMobile = new Signal(window.innerWidth < 1024);

    // Bind the handleResize method
    this.handleResize = this.handleResize.bind(this);

    // Add resize event listener
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    this.isMobile.value = window.innerWidth < 1024;
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
  }
}

const windowSize = new WindowSizeHelper();
export default windowSize;
