class AkramPill extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.drawPill());
    } else {
      requestAnimationFrame(() => this.drawPill());
    }

    this.handleResize = () => this.drawPill();
    window.addEventListener("resize", this.handleResize);
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    const num = this.getAttribute('num') || '';
    const lbl = this.getAttribute('lbl') || '';

    this.shadowRoot.innerHTML = `
      <style>
        .stat-pill {
          position: relative;
          display: inline-flex;
          align-items: stretch;
          height: 42px;
        }

        .stat-pill svg.shape {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .stat-pill .num,
        .stat-pill .lbl {
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
          font-family: "Space Grotesk", sans-serif;
          font-size: 22px;
          font-weight: 500;
          color: #ffffff;
        }

        .stat-pill .lbl {
          padding: 0 18px;
          font-family: "Inter", sans-serif;
          font-size: 20px;
          font-weight: 400;
          line-height: 1.3;
          color: #ffffff;
          opacity: 0.85;
        }

        @media (max-width: 680px) {
          .stat-pill { height: 38px; }
          .stat-pill .num { font-size: 18px; padding: 0 16px; }
          .stat-pill .lbl { font-size: 16px; padding: 0 14px; }
        }
      </style>
      <div class="stat-pill">
        <svg class="shape" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="none" stroke="#ffffff" stroke-width="1"/>
        </svg>
        <div class="num">${num}</div>
        <div class="lbl">${lbl}</div>
      </div>
    `;
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
      "C", x2 + a*notchHalf, 0, x3 - b*notchHalf, c*notchDepth, x3, notchDepth,
      "C", x3 + b*notchHalf, c*notchDepth, x4 - a*notchHalf, 0, x4, 0,
      "H", x5,
      "C", x5 + kappa*capW, 0, total, ymid - kappa*ymid, total, ymid,
      "C", total, ymid + kappa*ymid, x5 + kappa*capW, H, x5, H,
      "H", x4,
      "C", x4 - a*notchHalf, H, x3 + b*notchHalf, H - c*notchDepth, x3, H - notchDepth,
      "C", x3 - b*notchHalf, H - c*notchDepth, x2 + a*notchHalf, H, x2, H,
      "H", x1,
      "C", x1 - kappa*capW, H, 0, ymid + kappa*ymid, 0, ymid,
      "C", 0, ymid - kappa*ymid, x1 - kappa*capW, 0, x1, 0,
      "Z"
    ].join(" ");

    return { d: d, total: total };
  }

  drawPill() {
    var pill = this.shadowRoot.querySelector(".stat-pill");
    if (!pill) return;
    var num = pill.querySelector(".num");
    var lbl = pill.querySelector(".lbl");
    var svg = pill.querySelector("svg.shape");
    var path = svg.querySelector("path");
    var H = pill.clientHeight || 42;

    var leftW = num.offsetWidth || 50;
    var rightW = lbl.offsetWidth || 150;

    var shape = this.buildShapePath(leftW, rightW, H);
    svg.setAttribute("viewBox", "0 0 " + shape.total + " " + H);
    path.setAttribute("d", shape.d);

    pill.style.width = shape.total + "px";
  }
}

customElements.define('akram-pill', AkramPill);