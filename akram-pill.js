class AkramPill extends HTMLElement {
  static get observedAttributes() {
    return ['num', 'lbl', 'fill', 'stroke', 'num-color', 'lbl-color', 'height'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.pillEl = null;
    this.numEl = null;
    this.lblEl = null;
    this.resizeObserver = null;
    this.sizes = {};
  }

  connectedCallback() {
    this.loadFonts();
    this.sizes = {};
    this.render();

    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        var box = entry.borderBoxSize && entry.borderBoxSize[0];
        var target = entry.target;
        var w = box ? box.inlineSize : target.offsetWidth;
        var h = box ? box.blockSize : target.offsetHeight;

        if (target === this.numEl) this.sizes.num = w;
        else if (target === this.lblEl) this.sizes.lbl = w;
        else this.sizes.h = h;
      });
      this.drawPill();
    });

    this.resizeObserver.observe(this.numEl);
    this.resizeObserver.observe(this.lblEl);
    this.resizeObserver.observe(this.pillEl);
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  attributeChangedCallback(name) {
    if (!this.pillEl) return;

    if (name === 'num' || name === 'lbl') {
      this.updateText();
    } else {
      this.applyOptions();
    }
  }

  loadFonts() {
    if (document.getElementById('akram-pill-fonts')) return;
    var link = document.createElement('link');
    link.id = 'akram-pill-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500&family=Inter:wght@400&display=swap';
    document.head.appendChild(link);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          vertical-align: middle;
        }

        :host([hidden]) {
          display: none;
        }

        .stat-pill {
          position: relative;
          display: flex;
          align-items: stretch;
          height: var(--h, 42px);
        }

        .stat-pill svg.shape {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .stat-pill svg.shape path {
          fill: var(--fill, var(--akram-pill-fill, transparent));
          stroke: var(--stroke, var(--akram-pill-stroke, currentColor));
          stroke-width: var(--akram-pill-stroke-width, 1);
        }

        .stat-pill .num,
        .stat-pill .lbl {
          box-sizing: border-box;
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          white-space: nowrap;
        }

        .stat-pill .num {
          padding: 0 20px;
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: var(--num-size, 22px);
          font-weight: 500;
          color: var(--num-color, var(--akram-pill-num-color, #ffffff));
        }

        .stat-pill .lbl {
          padding: 0 18px;
          font-family: "Inter", system-ui, sans-serif;
          font-size: var(--lbl-size, 20px);
          font-weight: 400;
          line-height: 1.3;
          color: var(--lbl-color, var(--akram-pill-lbl-color, #ffffff));
          opacity: 0.85;
        }

        @media (max-width: 680px) {
          .stat-pill { height: var(--h, 38px); }
          .stat-pill .num { font-size: var(--num-size, 18px); padding: 0 16px; }
          .stat-pill .lbl { font-size: var(--lbl-size, 16px); padding: 0 14px; }
        }
      </style>
      <div class="stat-pill" part="pill">
        <svg class="shape" part="shape" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path/>
        </svg>
        <div class="num" part="num"></div>
        <div class="lbl" part="lbl"></div>
      </div>
    `;

    this.pillEl = this.shadowRoot.querySelector('.stat-pill');
    this.numEl = this.shadowRoot.querySelector('.num');
    this.lblEl = this.shadowRoot.querySelector('.lbl');
    this.updateText();
    this.applyOptions();
  }

  updateText() {
    this.numEl.textContent = this.getAttribute('num') || '';
    this.lblEl.textContent = this.getAttribute('lbl') || '';
  }

  applyOptions() {
    var pill = this.pillEl;
    var colorVars = {
      'fill': '--fill',
      'stroke': '--stroke',
      'num-color': '--num-color',
      'lbl-color': '--lbl-color'
    };

    Object.keys(colorVars).forEach((attr) => {
      var value = this.getAttribute(attr);
      if (value) {
        pill.style.setProperty(colorVars[attr], value);
      } else {
        pill.style.removeProperty(colorVars[attr]);
      }
    });

    var h = parseFloat(this.getAttribute('height'));
    if (h > 0) {
      pill.style.setProperty('--h', h + 'px');
      pill.style.setProperty('--num-size', Math.round(h * 22 / 42) + 'px');
      pill.style.setProperty('--lbl-size', Math.round(h * 20 / 42) + 'px');
    } else {
      pill.style.removeProperty('--h');
      pill.style.removeProperty('--num-size');
      pill.style.removeProperty('--lbl-size');
    }
  }

  buildShapePath(leftW, rightW, H) {
    var s = H / 300;
    var capW = 130 * s;
    var notchHalf = 100 * s;
    var notchDepth = 54 * s;
    var kappa = 0.5523;
    var a = 0.43, b = 0.22, c = 0.3519;

    var minCell = capW + notchHalf;
    leftW = Math.max(leftW, minCell);
    rightW = Math.max(rightW, minCell);
    var total = leftW + rightW;

    var x1 = capW;
    var x2 = leftW - notchHalf;
    var x3 = leftW;
    var x4 = leftW + notchHalf;
    var x5 = total - capW;
    var ymid = H / 2;

    var d = [
      "M", x1, 0,
      "H", x2,
      "C", x2 + a * notchHalf, 0, x3 - b * notchHalf, c * notchDepth, x3, notchDepth,
      "C", x3 + b * notchHalf, c * notchDepth, x4 - a * notchHalf, 0, x4, 0,
      "H", x5,
      "C", x5 + kappa * capW, 0, total, ymid - kappa * ymid, total, ymid,
      "C", total, ymid + kappa * ymid, x5 + kappa * capW, H, x5, H,
      "H", x4,
      "C", x4 - a * notchHalf, H, x3 + b * notchHalf, H - c * notchDepth, x3, H - notchDepth,
      "C", x3 - b * notchHalf, H - c * notchDepth, x2 + a * notchHalf, H, x2, H,
      "H", x1,
      "C", x1 - kappa * capW, H, 0, ymid + kappa * ymid, 0, ymid,
      "C", 0, ymid - kappa * ymid, x1 - kappa * capW, 0, x1, 0,
      "Z"
    ].join(" ");

    return { d: d, total: total };
  }

  drawPill() {
    var pill = this.pillEl;
    if (!pill) return;

    var svg = pill.querySelector("svg.shape");
    var path = svg.querySelector("path");
    var H = this.sizes.h || pill.clientHeight || 42;

    var minCell = H * 230 / 300;
    this.numEl.style.minWidth = minCell + "px";
    this.lblEl.style.minWidth = minCell + "px";

    var leftW = this.sizes.num || this.numEl.offsetWidth || 50;
    var rightW = this.sizes.lbl || this.lblEl.offsetWidth || 150;

    var shape = this.buildShapePath(leftW, rightW, H);
    svg.setAttribute("viewBox", "0 0 " + shape.total + " " + H);
    path.setAttribute("d", shape.d);
  }
}

AkramPill.observedAttributes.forEach(function (attr) {
  var prop = attr.replace(/-([a-z])/g, function (m, ch) { return ch.toUpperCase(); });
  Object.defineProperty(AkramPill.prototype, prop, {
    get: function () { return this.getAttribute(attr); },
    set: function (value) {
      if (value === null || value === undefined) this.removeAttribute(attr);
      else this.setAttribute(attr, value);
    }
  });
});

if (!customElements.get('akram-pill')) {
  customElements.define('akram-pill', AkramPill);
}