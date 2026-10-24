/*!
 * <akram-pill> – a self-contained notched stat pill (web component)
 * Zero dependencies. No network requests. Drop it in and use it.
 *
 * USAGE
 *   <script src="akram-pill.js" defer></script>
 *   <akram-pill num="5" lbl="Projects Built"></akram-pill>
 *
 * ATTRIBUTES (all optional, all live-updating)
 *   num, lbl            text for the left and right cells
 *   fill, stroke        any CSS color (shape background / outline)
 *   stroke-width        outline width in px
 *   num-color           color of the left text
 *   lbl-color           color of the right text
 *   height              pill height in px (everything scales with it)
 *
 * SLOTS (use instead of num / lbl when you need markup)
 *   <akram-pill><span slot="num">12</span><b slot="lbl">Live apps</b></akram-pill>
 *
 * CSS CUSTOM PROPERTIES (set on the element or any ancestor)
 *   --akram-pill-height        default 42px
 *   --akram-pill-fill          default transparent
 *   --akram-pill-stroke        default currentColor
 *   --akram-pill-stroke-width  default 1
 *   --akram-pill-num-color     default currentColor
 *   --akram-pill-lbl-color     default currentColor
 *   --akram-pill-lbl-opacity   default 0.85
 *   --akram-pill-num-font      default "Space Grotesk", system-ui, sans-serif
 *   --akram-pill-lbl-font      default "Inter", system-ui, sans-serif
 *   --akram-pill-num-weight    default 500
 *   --akram-pill-lbl-weight    default 400
 *   --akram-pill-num-size      default scales with height
 *   --akram-pill-lbl-size      default scales with height
 *
 * Priority for each value: attribute > CSS custom property > built-in default.
 *
 * PARTS (style from outside with ::part)
 *   pill, shape, num, lbl
 *
 * OPTIONAL HELPERS
 *   AkramPill.loadFonts()      add Space Grotesk + Inter from Google Fonts
 *                              (never called automatically)
 *   AkramPill.define('x-pill') register under another tag name
 *   el.refresh()               force a redraw (rarely needed)
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || !window.customElements) return;

  var DEFAULT_TAG = 'akram-pill';

  var TEMPLATE_HTML =
    '<style>' +
      ':host{display:inline-block;vertical-align:middle;max-width:100%}' +
      ':host([hidden]){display:none}' +

      '.pill{' +
        '--h:var(--akram-pill-height,42px);' +
        'position:relative;display:flex;align-items:stretch;' +
        'height:var(--h);width:max-content;max-width:100%;' +
      '}' +

      'svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}' +
      'path{' +
        'fill:var(--fill,var(--akram-pill-fill,transparent));' +
        'stroke:var(--stroke,var(--akram-pill-stroke,currentColor));' +
        'stroke-width:var(--stroke-width,var(--akram-pill-stroke-width,1));' +
      '}' +

      '.num,.lbl{' +
        'box-sizing:border-box;position:relative;z-index:1;height:100%;' +
        'display:flex;align-items:center;justify-content:center;' +
        'text-align:center;white-space:nowrap;' +
      '}' +

      '.num{' +
        'padding:0 calc(var(--h)*.476);' +
        'font-family:var(--akram-pill-num-font,"Space Grotesk",system-ui,sans-serif);' +
        'font-size:var(--akram-pill-num-size,calc(var(--h)*.5238));' +
        'font-weight:var(--akram-pill-num-weight,500);' +
        'color:var(--num-color,var(--akram-pill-num-color,currentColor));' +
      '}' +

      '.lbl{' +
        'padding:0 calc(var(--h)*.43);' +
        'font-family:var(--akram-pill-lbl-font,"Inter",system-ui,sans-serif);' +
        'font-size:var(--akram-pill-lbl-size,calc(var(--h)*.476));' +
        'font-weight:var(--akram-pill-lbl-weight,400);' +
        'line-height:1.3;' +
        'color:var(--lbl-color,var(--akram-pill-lbl-color,currentColor));' +
        'opacity:var(--akram-pill-lbl-opacity,.85);' +
      '}' +
    '</style>' +
    '<div class="pill" part="pill">' +
      '<svg part="shape" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path/></svg>' +
      '<div class="num" part="num"><slot name="num"><span id="t-num"></span></slot></div>' +
      '<div class="lbl" part="lbl"><slot name="lbl"><span id="t-lbl"></span></slot></div>' +
    '</div>';

  // attribute name -> CSS custom property set on the inner pill
  var STYLE_ATTRS = {
    'fill': '--fill',
    'stroke': '--stroke',
    'stroke-width': '--stroke-width',
    'num-color': '--num-color',
    'lbl-color': '--lbl-color'
  };

  var FONTS_ID = 'akram-pill-fonts';

  class AkramPill extends HTMLElement {
    static get observedAttributes() {
      return ['num', 'lbl', 'fill', 'stroke', 'stroke-width', 'num-color', 'lbl-color', 'height'];
    }

    /** Opt-in: load the default fonts. The component never does this by itself. */
    static loadFonts() {
      if (document.getElementById(FONTS_ID)) return;
      var link = document.createElement('link');
      link.id = FONTS_ID;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500&family=Inter:wght@400&display=swap';
      document.head.appendChild(link);
    }

    /** Register under a different tag name (default: akram-pill). */
    static define(tag) {
      tag = tag || DEFAULT_TAG;
      if (!customElements.get(tag)) {
        // A class can only be registered once, so extend it for extra names.
        customElements.define(tag, tag === DEFAULT_TAG ? AkramPill : class extends AkramPill {});
      }
    }

    constructor() {
      super();
      // Build the shadow DOM only. Attributes are read later, as the spec requires.
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = TEMPLATE_HTML;

      this._pill = root.querySelector('.pill');
      this._svg = root.querySelector('svg');
      this._path = root.querySelector('path');
      this._numCell = root.querySelector('.num');
      this._lblCell = root.querySelector('.lbl');
      this._numText = root.getElementById('t-num');
      this._lblText = root.getElementById('t-lbl');

      this._ro = null;
      this._onWindowResize = this.refresh.bind(this);
      this._sizes = { num: 0, lbl: 0, h: 0 };
    }

    connectedCallback() {
      this._syncText();
      this._syncOptions();

      if ('ResizeObserver' in window) {
        var self = this;
        this._ro = new ResizeObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            var box = e.borderBoxSize && e.borderBoxSize[0];
            if (e.target === self._numCell) self._sizes.num = box ? box.inlineSize : e.target.offsetWidth;
            else if (e.target === self._lblCell) self._sizes.lbl = box ? box.inlineSize : e.target.offsetWidth;
            else self._sizes.h = box ? box.blockSize : e.target.offsetHeight;
          }
          self._draw();
        });
        this._ro.observe(this._numCell);
        this._ro.observe(this._lblCell);
        this._ro.observe(this._pill);
      } else {
        window.addEventListener('resize', this._onWindowResize);
        window.addEventListener('load', this._onWindowResize);
      }

      this.refresh();
    }

    disconnectedCallback() {
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      window.removeEventListener('resize', this._onWindowResize);
      window.removeEventListener('load', this._onWindowResize);
    }

    attributeChangedCallback(name) {
      if (name === 'num' || name === 'lbl') this._syncText();
      else this._syncOptions();
    }

    /** Force a redraw. Only needed if you change fonts or CSS vars from script. */
    refresh() {
      this._sizes = {
        num: this._numCell.offsetWidth,
        lbl: this._lblCell.offsetWidth,
        h: this._pill.offsetHeight
      };
      this._draw();
    }

    _syncText() {
      this._numText.textContent = this.getAttribute('num') || '';
      this._lblText.textContent = this.getAttribute('lbl') || '';
    }

    _syncOptions() {
      var style = this._pill.style;

      Object.keys(STYLE_ATTRS).forEach(function (attr) {
        var value = this.getAttribute(attr);
        if (value !== null && value !== '') style.setProperty(STYLE_ATTRS[attr], value);
        else style.removeProperty(STYLE_ATTRS[attr]);
      }, this);

      var h = parseFloat(this.getAttribute('height'));
      if (h > 0) style.setProperty('--h', h + 'px');
      else style.removeProperty('--h');
    }

    _shape(leftW, rightW, H) {
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
      var ym = H / 2;

      var d = [
        'M', x1, 0,
        'H', x2,
        'C', x2 + a * notchHalf, 0, x3 - b * notchHalf, c * notchDepth, x3, notchDepth,
        'C', x3 + b * notchHalf, c * notchDepth, x4 - a * notchHalf, 0, x4, 0,
        'H', x5,
        'C', x5 + kappa * capW, 0, total, ym - kappa * ym, total, ym,
        'C', total, ym + kappa * ym, x5 + kappa * capW, H, x5, H,
        'H', x4,
        'C', x4 - a * notchHalf, H, x3 + b * notchHalf, H - c * notchDepth, x3, H - notchDepth,
        'C', x3 - b * notchHalf, H - c * notchDepth, x2 + a * notchHalf, H, x2, H,
        'H', x1,
        'C', x1 - kappa * capW, H, 0, ym + kappa * ym, 0, ym,
        'C', 0, ym - kappa * ym, x1 - kappa * capW, 0, x1, 0,
        'Z'
      ].join(' ');

      return { d: d, total: total };
    }

    _draw() {
      var H = this._sizes.h || this._pill.offsetHeight;
      if (!H) return; // hidden or not laid out yet; the observer calls us again

      // Keep each cell wide enough for the notch geometry.
      var minCell = (H * 230) / 300;
      this._numCell.style.minWidth = minCell + 'px';
      this._lblCell.style.minWidth = minCell + 'px';

      var shape = this._shape(
        this._sizes.num || this._numCell.offsetWidth,
        this._sizes.lbl || this._lblCell.offsetWidth,
        H
      );
      this._svg.setAttribute('viewBox', '0 0 ' + shape.total + ' ' + H);
      this._path.setAttribute('d', shape.d);
    }
  }

  // Reflect attributes as camelCase properties: el.numColor = '#fff'
  AkramPill.observedAttributes.forEach(function (attr) {
    var prop = attr.replace(/-([a-z])/g, function (m, ch) { return ch.toUpperCase(); });
    Object.defineProperty(AkramPill.prototype, prop, {
      configurable: true,
      get: function () { return this.getAttribute(attr); },
      set: function (value) {
        if (value === null || value === undefined) this.removeAttribute(attr);
        else this.setAttribute(attr, value);
      }
    });
  });

  window.AkramPill = AkramPill;
  AkramPill.define(DEFAULT_TAG);
})();