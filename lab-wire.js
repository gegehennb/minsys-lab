/* ==========================================================
   最小系统大师 · 连线台
   一、单片机默认就在图桌上；右侧两个框取出其余元器件；
   二、元器件可拖动摆位，点它看参数与说明；
   三、全部到位后点「开始接线」，按 18 步提示点两处端子自动连线，
       接对给理由，接错说清为什么不通；
   四、程序写完，三只灯按程序轮流点亮。
   ========================================================== */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.getElementById('wireSvg');
  if (!svg) return;

  var gParts = document.getElementById('gParts');
  var gWires = document.getElementById('gWires');
  var gNodes = document.getElementById('gNodes');

  var numEl = document.getElementById('wireNum');
  var barEl = document.getElementById('wireBar');
  var statusEl = document.getElementById('wireStatus');
  var startBtn = document.getElementById('wireStart');
  var resetBtn = document.getElementById('wireReset');
  var demoBtn = document.getElementById('wireDemo');
  var stepCard = document.getElementById('stepCard');
  var stepNo = document.getElementById('stepNo');
  var stepTip = document.getElementById('stepTip');
  var stepGrp = document.getElementById('stepGrp');
  var hintEl = document.getElementById('wireHint');

  var infoBox = document.getElementById('partInfo');
  var infoRef = document.getElementById('pinfoRef');
  var infoName = document.getElementById('pinfoName');
  var infoSpec = document.getElementById('pinfoSpec');
  var infoRows = document.getElementById('pinfoRows');
  var infoClose = document.getElementById('pinfoClose');
  var infoFoot = document.getElementById('pinfoFoot');
  var infoDel = document.getElementById('pinfoDel');

  /* ================= 绘图小工具 ================= */
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) {
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k) && attrs[k] !== null && attrs[k] !== undefined) {
          e.setAttribute(k, attrs[k]);
        }
      }
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  function ln(g, x1, y1, x2, y2, cls) {
    return el('line', { x1: x1, y1: y1, x2: x2, y2: y2, 'class': cls || 'lead-line' }, g);
  }
  function tx(g, x, y, s, cls, anchor) {
    var t = el('text', { x: x, y: y, 'class': cls || 'part-lb', 'text-anchor': anchor || 'start' }, g);
    t.textContent = s;
    return t;
  }

  /* ================= 元器件画法 ================= */
  function drawU1(g) {
    el('rect', { x: -108, y: -196, width: 216, height: 392, rx: 3, 'class': 'chip-rect' }, g);
    tx(g, 0, -176, 'U1', 'chip-tag', 'middle');

    [
      ['XTAL1', '19', -160], ['XTAL2', '18', -130], ['RST', '9', -92],
      ['/PSEN', '29', -56], ['ALE', '30', -28], ['/EA', '31', 0]
    ].forEach(function (p) {
      ln(g, -108, p[2], -146, p[2]);
      tx(g, -130, p[2] - 6, p[1], 'chip-no', 'middle');
      tx(g, -100, p[2] + 4, p[0], 'chip-pin', 'start');
    });

    [
      ['P2.0/A8', '21', -160], ['P2.1/A9', '22', -100], ['P2.2/A10', '23', -40]
    ].forEach(function (p) {
      ln(g, 108, p[2], 146, p[2]);
      tx(g, 130, p[2] - 6, p[1], 'chip-no', 'middle');
      tx(g, 100, p[2] + 4, p[0], 'chip-pin', 'end');
    });

    tx(g, 0, -10, 'P0 · AD0—AD7 · 39—32', 'chip-grp', 'middle');
    tx(g, 0, 14, 'P3 · RXD—/RD · 10—17', 'chip-grp', 'middle');
    tx(g, -100, 62, 'P1 · 1—8', 'chip-grp', 'start');

    tx(g, 0, 118, '80C51', 'chip-name', 'middle');
    tx(g, 0, 142, 'DIP-40 · 8 位单片机', 'chip-sub', 'middle');

    ln(g, -70, -196, -70, -220);
    tx(g, -78, -212, 'VCC 40', 'chip-no', 'end');
    ln(g, -70, 196, -70, 236);
    tx(g, -78, 220, 'GND 20', 'chip-no', 'end');
  }

  function drawX1(g, d) {
    ln(g, 0, -30, 0, -16);
    ln(g, -12, -16, 12, -16, 'plate');
    el('rect', { x: -10, y: -10, width: 20, height: 20, 'class': 'crystal' }, g);
    ln(g, -12, 16, 12, 16, 'plate');
    ln(g, 0, 16, 0, 30);
    tx(g, -16, -1, d.ref, 'part-lb', 'end');
    tx(g, -16, 11, d.value, 'part-sub', 'end');
  }

  /* 电容横放：左端、右端各一只端子，符号像书上那样两道竖板 */
  function drawCap(g, d) {
    ln(g, -26, 0, -5, 0);
    ln(g, -5, -12, -5, 12, 'plate');
    ln(g, 5, -12, 5, 12, 'plate');
    ln(g, 5, 0, 26, 0);
    tx(g, 0, -29, d.ref, 'part-lb', 'middle');
    tx(g, 0, -17, d.value, 'part-sub', 'middle');
  }

  function drawRes(g, d) {
    ln(g, -28, 0, -20, 0);
    el('rect', { x: -20, y: -9.5, width: 40, height: 19, 'class': 'res' }, g);
    ln(g, 20, 0, 28, 0);
    tx(g, 0, -15, d.ref, 'part-lb', 'middle');
    tx(g, 0, -27, d.value, 'part-sub', 'middle');
  }

  function drawLED(g, d) {
    ln(g, -30, 0, -12, 0);
    el('path', { d: 'M12 -11 L12 11 L-12 0 Z', 'class': 'led-tri' }, g);
    ln(g, -12, -11, -12, 11, 'plate');
    ln(g, 12, 0, 30, 0);
    el('circle', { cx: 0, cy: 0, r: 13, 'class': 'led-glow' }, g);
    el('path', { d: 'M5 -16 L12 -23 M10 -14 L17 -21', 'class': 'led-ray' }, g);
    tx(g, 0, 30, d.ref + ' ' + d.value, 'part-sub', 'middle');
  }

  function drawVcc(g) {
    ln(g, 0, 0, 0, -13);
    el('path', { d: 'M0 -27 L-8.5 -13 L8.5 -13 Z', 'class': 'pwr-arrow' }, g);
    tx(g, 0, -33, '+5V', 'part-lb', 'middle');
  }

  function drawGnd(g) {
    ln(g, 0, 0, 0, 9);
    ln(g, -13, 9, 13, 9, 'plate');
    ln(g, -8, 15, 8, 15, 'plate');
    ln(g, -3.5, 21, 3.5, 21, 'plate');
    tx(g, 0, 36, 'GND', 'part-sub', 'middle');
  }

  /* ================= 元器件表 ================= */
  var PARTS = {
    U1: {
      ref: 'U1', name: '80C51 单片机', cat: 'min', draw: drawU1,
      hit: [-108, -196, 216, 392],
      spec: 'DIP-40 · 片内 4KB ROM / 128B RAM',
      info: [
        ['封装', 'DIP-40，缺口朝上，左上为 1 脚'],
        ['程序存储器', '4KB 片内 ROM，地址 0000H 起'],
        ['数据存储器', '128B 片内 RAM'],
        ['工作电压', '+5V（40 脚），20 脚接地'],
        ['本板用到的引脚', '18、19、31、40、20 与 P2.0—P2.2']
      ],
      note: '最小系统不接全部 40 只脚，只管住时钟、电源、取指选择和三个 I/O 口。',
      terms: [
        { id: 'XTAL1', x: -146, y: -160, dir: 'l', pin: '19', label: 'XTAL1' },
        { id: 'XTAL2', x: -146, y: -130, dir: 'l', pin: '18', label: 'XTAL2' },
        { id: 'RST', x: -146, y: -92, dir: 'l', pin: '9', label: 'RST' },
        { id: 'PSEN', x: -146, y: -56, dir: 'l', pin: '29', label: '/PSEN' },
        { id: 'ALE', x: -146, y: -28, dir: 'l', pin: '30', label: 'ALE' },
        { id: 'EA', x: -146, y: 0, dir: 'l', pin: '31', label: '/EA' },
        { id: 'VCC', x: -70, y: -220, dir: 'u', pin: '40', label: 'VCC' },
        { id: 'GND', x: -70, y: 236, dir: 'd', pin: '20', label: 'GND' },
        { id: 'P20', x: 146, y: -160, dir: 'r', pin: '21', label: 'P2.0' },
        { id: 'P21', x: 146, y: -100, dir: 'r', pin: '22', label: 'P2.1' },
        { id: 'P22', x: 146, y: -40, dir: 'r', pin: '23', label: 'P2.2' }
      ]
    },
    X1: {
      ref: 'X1', name: '晶振', cat: 'min', draw: drawX1, value: '12MHz',
      hit: [-14, -20, 28, 40],
      spec: '12MHz 石英晶体',
      info: [
        ['型号', '12MHz 石英晶体谐振器'],
        ['作用', '与片内振荡电路一起产生时钟'],
        ['频率', '12MHz，一个机器周期 1μs'],
        ['接法', '两端分别接 XTAL1、XTAL2']
      ],
      note: '晶振跑不起来，CPU 就没有节拍，程序和引脚全都无从谈起。',
      terms: [
        { id: '1', x: 0, y: -30, dir: 'u', label: '上端' },
        { id: '2', x: 0, y: 30, dir: 'd', label: '下端' }
      ]
    },
    C1: {
      ref: 'C1', name: '负载电容', cat: 'min', draw: drawCap, value: '22pF',
      hit: [-30, -18, 60, 36],
      spec: '22pF 瓷片电容 · 横放',
      info: [
        ['容值', '22pF'],
        ['类型', '瓷片电容，无极性'],
        ['作用', '与晶振组成振荡回路，稳定起振'],
        ['接法', '右端并到 XTAL1，左端接地']
      ],
      note: '取值按晶振手册给，一般 15—33pF。两只电容要一样大。',
      terms: [
        { id: '1', x: -26, y: 0, dir: 'l', label: '左端' },
        { id: '2', x: 26, y: 0, dir: 'r', label: '右端' }
      ]
    },
    C2: {
      ref: 'C2', name: '负载电容', cat: 'min', draw: drawCap, value: '22pF',
      hit: [-30, -18, 60, 36],
      spec: '22pF 瓷片电容 · 横放',
      info: [
        ['容值', '22pF'],
        ['类型', '瓷片电容，无极性'],
        ['作用', '分担 XTAL2 一侧的负载'],
        ['接法', '右端并到 XTAL2，左端接地']
      ],
      note: 'C1、C2 各管一端，缺一只也能起振，但频率会偏、起振变慢。',
      terms: [
        { id: '1', x: -26, y: 0, dir: 'l', label: '左端' },
        { id: '2', x: 26, y: 0, dir: 'r', label: '右端' }
      ]
    },
    VCCA: {
      ref: 'VCC', name: '电源符号', cat: 'min', draw: drawVcc,
      hit: [-12, -31, 24, 29],
      spec: '+5V · 供芯片 40 脚',
      info: [
        ['电位', '+5V'],
        ['本处用途', '给 40 脚 VCC 供电'],
        ['注意', '同一块板上所有 +5V 符号都是同一个节点']
      ],
      note: '电源符号只画一小段箭头，实际靠板上铜箔连到稳压器输出。',
      terms: [{ id: 'V', x: 0, y: 0, dir: 'd', nos: 1, label: '端子' }]
    },
    VCCB: {
      ref: 'VCC', name: '电源符号', cat: 'min', draw: drawVcc,
      hit: [-12, -31, 24, 29],
      spec: '+5V · 供 /EA 上拉',
      info: [
        ['电位', '+5V'],
        ['本处用途', '把 31 脚 /EA 拉成高电平'],
        ['原因', '/EA 接高，CPU 才从片内 ROM 取指']
      ],
      note: '/EA 悬空或接地，芯片就去片外找程序，本板没有片外 ROM，等于不跑。',
      terms: [{ id: 'V', x: 0, y: 0, dir: 'd', nos: 1, label: '端子' }]
    },
    GND1: {
      ref: 'GND1', name: '接地符号', cat: 'min', draw: drawGnd,
      hit: [-15, 6, 30, 30],
      spec: '0V 参考点 · 与 GND2 同一个网络',
      info: [
        ['电位', '0V'],
        ['本处用途', '两只电容的左端都回到这里'],
        ['与 GND2 的关系', '同名符号＝同一个节点，接哪一处都算接通']
      ],
      note: '地是所有电流的回流路径，一处虚接整板都不稳。',
      terms: [{ id: 'V', x: 0, y: 0, dir: 'r', nos: 1, label: '端子' }]
    },
    GND2: {
      ref: 'GND2', name: '接地符号', cat: 'min', draw: drawGnd,
      hit: [-15, 6, 30, 30],
      spec: '0V 参考点 · 与 GND1 同一个网络',
      info: [
        ['电位', '0V'],
        ['本处用途', '芯片 20 脚直接回到这里'],
        ['与 GND1 的关系', '两处等电位，分开画只是让走线清爽']
      ],
      note: '同一个网络画两处地符号，等于左右两片电路共地；接到 GND1 上一样成立。',
      terms: [{ id: 'V', x: 0, y: 0, dir: 'u', nos: 1, label: '端子' }]
    },

    LEDR: {
      ref: 'D1', name: '红色指示灯', cat: 'led', draw: drawLED, lamp: 'r', value: '红',
      hit: [-15, -13, 30, 26],
      spec: 'φ5 红色 LED · 2.0V / 14mA',
      info: [
        ['颜色', '红色'],
        ['正向压降', '约 2.0V'],
        ['工作电流', '10—15mA'],
        ['本板接法', '阴极接 P2.0，阳极经 R1 接 +5V（共阳）'],
        ['点亮条件', 'P2.0 输出低电平 0']
      ],
      note: '口线拉低才有电流：+5V → R1 → 红灯 → P2.0 → 芯片内部到地。',
      terms: [
        { id: 'K', x: -30, y: 0, dir: 'l', label: '阴极' },
        { id: 'A', x: 30, y: 0, dir: 'r', label: '阳极' }
      ]
    },
    LEDY: {
      ref: 'D2', name: '黄色指示灯', cat: 'led', draw: drawLED, lamp: 'y', value: '黄',
      hit: [-15, -13, 30, 26],
      spec: 'φ5 黄色 LED · 2.1V / 14mA',
      info: [
        ['颜色', '黄色'],
        ['正向压降', '约 2.1V'],
        ['工作电流', '10—15mA'],
        ['本板接法', '阴极接 P2.1，阳极经 R2 接 +5V（共阳）'],
        ['点亮条件', 'P2.1 输出低电平 0']
      ],
      note: '安灯的三色灯语里，黄灯表示待料或预警，红黄蓝各管一种状态。',
      terms: [
        { id: 'K', x: -30, y: 0, dir: 'l', label: '阴极' },
        { id: 'A', x: 30, y: 0, dir: 'r', label: '阳极' }
      ]
    },
    LEDB: {
      ref: 'D3', name: '蓝色指示灯', cat: 'led', draw: drawLED, lamp: 'b', value: '蓝',
      hit: [-15, -13, 30, 26],
      spec: 'φ5 蓝色 LED · 3.2V / 14mA',
      info: [
        ['颜色', '蓝色'],
        ['正向压降', '约 3.2V'],
        ['工作电流', '10—15mA'],
        ['本板接法', '阴极接 P2.2，阳极经 R3 接 +5V（共阳）'],
        ['点亮条件', 'P2.2 输出低电平 0']
      ],
      note: '蓝灯压降高，限流电阻仍取 220Ω，电流约 8mA，亮度略低于红黄。',
      terms: [
        { id: 'K', x: -30, y: 0, dir: 'l', label: '阴极' },
        { id: 'A', x: 30, y: 0, dir: 'r', label: '阳极' }
      ]
    },
    R1: {
      ref: 'R1', name: '限流电阻', cat: 'led', draw: drawRes, value: '220Ω',
      hit: [-22, -14, 44, 28],
      spec: '220Ω · 1/4W',
      info: [
        ['阻值', '220Ω'],
        ['功率', '1/4W 足够'],
        ['作用', '限制红灯支路电流在 14mA 左右'],
        ['算法', '（5 − 2.0）V ÷ 220Ω ≈ 14mA']
      ],
      note: 'LED 不能直接接电源，串一只电阻才不会被烧穿。',
      terms: [
        { id: '1', x: -28, y: 0, dir: 'l', label: '左端' },
        { id: '2', x: 28, y: 0, dir: 'r', label: '右端' }
      ]
    },
    R2: {
      ref: 'R2', name: '限流电阻', cat: 'led', draw: drawRes, value: '220Ω',
      hit: [-22, -14, 44, 28],
      spec: '220Ω · 1/4W',
      info: [
        ['阻值', '220Ω'],
        ['功率', '1/4W'],
        ['作用', '限制黄灯支路电流'],
        ['算法', '（5 − 2.1）V ÷ 220Ω ≈ 13mA']
      ],
      note: '三只电阻取同一阻值，三条支路电流相近，亮度才一致。',
      terms: [
        { id: '1', x: -28, y: 0, dir: 'l', label: '左端' },
        { id: '2', x: 28, y: 0, dir: 'r', label: '右端' }
      ]
    },
    R3: {
      ref: 'R3', name: '限流电阻', cat: 'led', draw: drawRes, value: '220Ω',
      hit: [-22, -14, 44, 28],
      spec: '220Ω · 1/4W',
      info: [
        ['阻值', '220Ω'],
        ['功率', '1/4W'],
        ['作用', '限制蓝灯支路电流'],
        ['算法', '（5 − 3.2）V ÷ 220Ω ≈ 8mA']
      ],
      note: '蓝灯电流最小，若嫌暗可单独把 R3 换成 150Ω。',
      terms: [
        { id: '1', x: -28, y: 0, dir: 'l', label: '左端' },
        { id: '2', x: 28, y: 0, dir: 'r', label: '右端' }
      ]
    },
    VCCC: {
      ref: 'VCC', name: '电源符号', cat: 'led', draw: drawVcc,
      hit: [-12, -31, 24, 29],
      spec: '+5V · 三路灯的公共端',
      info: [
        ['电位', '+5V'],
        ['本处用途', '三只电阻的右端都汇到这里'],
        ['接法', '共阳：阳极经电阻上拉到 +5V']
      ],
      note: '三只电阻共用一处 +5V，就是电路图上的“汇流”，不必画三只电源符号。',
      terms: [{ id: 'V', x: 0, y: 0, dir: 'u', nos: 1, label: '端子' }]
    }
  };

  /* 默认落位：左时钟、中单片机、右指示，方向已摆正，不必再转 */
  var SLOTS = {
    U1: [400, 300],
    VCCA: [330, 44],
    X1: [140, 120],
    C1: [150, 215],
    C2: [150, 300],
    VCCB: [208, 360],
    GND1: [62, 215],
    GND2: [330, 570],
    LEDR: [642, 140],
    LEDY: [642, 200],
    LEDB: [642, 260],
    R1: [718, 140],
    R2: [718, 200],
    R3: [718, 260],
    VCCC: [776, 72]
  };

  /* 一种元器件一张卡片。need 是这一组要几只，点一次出一只，
     出够了还能接着点（多出来的最后会被数量校验挑出来）。 */
  var KINDS = [
    { id: 'X1', tray: 'min', name: '晶振', sub: '12MHz · 石英晶体', need: 1, keys: ['X1'] },
    { id: 'CAP', tray: 'min', name: '负载电容', sub: '22pF · 瓷片', need: 2, keys: ['C1', 'C2'], tag: 'C' },
    { id: 'VCCM', tray: 'min', name: '电源符号', sub: '+5V · 两处互通', need: 2, keys: ['VCCA', 'VCCB'], tag: 'VCC' },
    { id: 'GND', tray: 'min', name: '接地符号', sub: '0V · 两处互通', need: 2, keys: ['GND1', 'GND2'], tag: 'GND' },
    { id: 'LEDR', tray: 'led', name: '红色指示灯', sub: 'φ5 · 2.0V', need: 1, keys: ['LEDR'] },
    { id: 'LEDY', tray: 'led', name: '黄色指示灯', sub: 'φ5 · 2.1V', need: 1, keys: ['LEDY'] },
    { id: 'LEDB', tray: 'led', name: '蓝色指示灯', sub: 'φ5 · 3.2V', need: 1, keys: ['LEDB'] },
    { id: 'RES', tray: 'led', name: '限流电阻', sub: '220Ω · 1/4W', need: 3, keys: ['R1', 'R2', 'R3'], tag: 'R' },
    { id: 'VCCL', tray: 'led', name: '电源符号', sub: '+5V · 三路公共端', need: 1, keys: ['VCCC'], tag: 'VCC' }
  ];

  var CATS = ['min', 'led'];
  var KIND = {};         /* 种类 id → 定义 */
  var KEY2KIND = {};     /* 实例 key → 种类 id */
  KINDS.forEach(function (k) {
    KIND[k.id] = k;
    k.keys.forEach(function (key) { KEY2KIND[key] = k.id; });
  });

  /* ================= 电源与地的网络 =================
     原理图上，名字相同的电源符号是同一个节点：三处 +5V 之间、两处 GND 之间
     在铜箔上是连着的，接哪一处都一样。判定时先把端子按网络归一，再比步骤，
     学生就不会被“只能接某一个位号”卡住。 */
  var NET = { VCCA: '+5V', VCCB: '+5V', VCCC: '+5V', GND1: 'GND', GND2: 'GND' };
  function canon(key) {
    var t = String(key).split(':')[0];
    return NET[t] ? '#' + NET[t] : key;
  }
  function pairKey(a, b) {
    var x = canon(a), y = canon(b);
    return x < y ? x + '|' + y : y + '|' + x;
  }

  /* ================= 接线步骤 ================= */
  var STEPS = [
    { a: 'U1:XTAL1', b: 'X1:1', tip: '晶振的上端接到 19 脚 XTAL1', why: '时钟电路跨在 XTAL1、XTAL2 之间，先接一端。' },
    { a: 'U1:XTAL2', b: 'X1:2', tip: '晶振的下端接到 18 脚 XTAL2', why: '晶振两端各占一只引脚，不能短接在一起。' },
    { a: 'U1:XTAL1', b: 'C1:2', tip: 'C1 的右端并到 XTAL1 上', why: '负载电容与晶振组成振荡回路，容值取 22pF。' },
    { a: 'C1:1', b: 'GND1:V', tip: 'C1 的左端接地（两处地接哪一处都行）', why: '电容另一端必须回地，回路才闭合。图上两处地是同名符号，接哪一处都是同一个地网络。' },
    { a: 'U1:XTAL2', b: 'C2:2', tip: 'C2 的右端并到 XTAL2 上', why: '两只电容分担晶振两端的负载，取值要一样。' },
    { a: 'C2:1', b: 'GND1:V', tip: 'C2 的左端也回这处地', why: 'C1、C2 回的是同一个地，两处地符号等电位，接 GND1 或 GND2 都算接通。' },
    { a: 'U1:EA', b: 'VCCB:V', tip: '31 脚 /EA 接 +5V（三处电源符号互通）', why: '/EA 接高电平，CPU 才从片内 0000H 取指。' },
    { a: 'U1:VCC', b: 'VCCA:V', tip: '40 脚 VCC 接 +5V', why: '不给电，芯片内部一个部件也不动。' },
    { a: 'U1:GND', b: 'GND2:V', tip: '20 脚就近接到芯片下方这处地', why: '地是电流的回流路径，缺了它什么也通不了。' },
    { a: 'U1:P20', b: 'LEDR:K', tip: 'P2.0 接红灯的阴极', why: '口线拉低，电流才从 +5V 经灯流进芯片，红灯亮。' },
    { a: 'LEDR:A', b: 'R1:1', tip: '红灯的阳极串上限流电阻 R1', why: 'LED 不能直接接电源，220Ω 把电流限在 14mA。' },
    { a: 'R1:2', b: 'VCCC:V', tip: 'R1 的另一端接 +5V', why: '共阳接法，三只灯的阳极都汇到 +5V。' },
    { a: 'U1:P21', b: 'LEDY:K', tip: 'P2.1 接黄灯的阴极', why: '每一路灯各占一根口线，互不干扰。' },
    { a: 'LEDY:A', b: 'R2:1', tip: '黄灯的阳极串上限流电阻 R2', why: '三只电阻同阻值，三条支路亮度才齐。' },
    { a: 'R2:2', b: 'VCCC:V', tip: 'R2 的另一端接 +5V', why: '黄灯支路与红灯支路在 +5V 处汇合。' },
    { a: 'U1:P22', b: 'LEDB:K', tip: 'P2.2 接蓝灯的阴极', why: 'P2 口八根线，本板只用了低三位。' },
    { a: 'LEDB:A', b: 'R3:1', tip: '蓝灯的阳极串上限流电阻 R3', why: '蓝灯压降 3.2V，串 220Ω 后电流约 8mA。' },
    { a: 'R3:2', b: 'VCCC:V', tip: 'R3 的另一端接 +5V', why: '三路汇齐，指示电路就完整了。' }
  ];

  /* ================= 状态 ================= */
  var I = {};            /* 已放置的元器件：实例 key → {def, x, y, el} */
  var TERMS = {};        /* 端子 key → 节点元素 */
  var wires = [];        /* {a,b,step,path} */
  var solved = {};       /* 步骤序号 → true */
  var mode = 'place';    /* place | wire | done */
  var cur = 0;
  var drag = null;
  var pick = null;       /* 已点中、等第二个端子的那一处 */
  var extraNo = {};      /* 种类 id → 多生成的个数，用来给位号接着编号 */

  /* ================= 坐标换算 ================= */
  var pt = svg.createSVGPoint ? svg.createSVGPoint() : null;
  function toWorld(e) {
    if (!pt) return { x: 0, y: 0 };
    pt.x = e.clientX;
    pt.y = e.clientY;
    var m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    var p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function termOf(type, id) {
    var inst = I[type];
    if (!inst) return null;
    var t = inst.def.terms;
    for (var i = 0; i < t.length; i++) if (t[i].id === id) return t[i];
    return null;
  }
  function posOf(key) {
    var a = key.split(':');
    var inst = I[a[0]], td = termOf(a[0], a[1]);
    if (!inst || !td) return null;
    return { x: inst.x + td.x, y: inst.y + td.y };
  }
  function dirOf(key) {
    var a = key.split(':');
    var inst = I[a[0]], td = termOf(a[0], a[1]);
    if (!inst || !td) return { x: 0, y: 0, none: 1 };
    if (td.nos) return { x: 0, y: 0, none: 1 };
    return { l: { x: -1, y: 0 }, r: { x: 1, y: 0 }, u: { x: 0, y: -1 }, d: { x: 0, y: 1 } }[td.dir] || { x: -1, y: 0 };
  }
  function tname(key) {
    var a = key.split(':');
    var inst = I[a[0]], td = termOf(a[0], a[1]);
    if (!inst || !td) return key;
    return inst.def.ref + ' · ' + (td.label || a[1]) + (td.pin ? '（' + td.pin + ' 脚）' : '');
  }

  /* ================= 路径 ================= */
  function dedupe(pts) {
    var out = [];
    pts.forEach(function (p) {
      var l = out[out.length - 1];
      if (!l || Math.abs(l.x - p.x) > 0.4 || Math.abs(l.y - p.y) > 0.4) out.push(p);
    });
    return out;
  }
  function pathFrom(pts, r) {
    pts = dedupe(pts);
    if (pts.length < 2) return '';
    var d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
      var l1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      var l2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      var rr = Math.min(r, l1 / 2, l2 / 2);
      var u1 = { x: (p1.x - p0.x) / (l1 || 1), y: (p1.y - p0.y) / (l1 || 1) };
      var u2 = { x: (p2.x - p1.x) / (l2 || 1), y: (p2.y - p1.y) / (l2 || 1) };
      var a = { x: p1.x - u1.x * rr, y: p1.y - u1.y * rr };
      var b = { x: p1.x + u2.x * rr, y: p1.y + u2.y * rr };
      d += 'L' + a.x + ' ' + a.y + 'Q' + p1.x + ' ' + p1.y + ' ' + b.x + ' ' + b.y;
    }
    var last = pts[pts.length - 1];
    d += 'L' + last.x + ' ' + last.y;
    return d;
  }

  /* 每只元器件的包围盒：走线绕开它，别横穿元件本体 */
  function boxesAround() {
    var out = [];
    Object.keys(I).forEach(function (t) {
      var inst = I[t], h = inst.def.hit || [-16, -16, 32, 32];
      var x1 = inst.x + h[0] + 5, y1 = inst.y + h[1] + 5;
      var x2 = inst.x + h[0] + h[2] - 5, y2 = inst.y + h[1] + h[3] - 5;
      if (x2 > x1 && y2 > y1) out.push({ x1: x1, y1: y1, x2: x2, y2: y2, t: t });
    });
    return out;
  }
  function segCrossBox(p, q, b) {
    return Math.max(p.x, q.x) > b.x1 && Math.min(p.x, q.x) < b.x2 &&
           Math.max(p.y, q.y) > b.y1 && Math.min(p.y, q.y) < b.y2;
  }
  /* from/to：端子前面那 16px 的出线桩本来就贴着元件边，跳过不查 */
  function crossCount(pts, boxes, from, to) {
    var n = 0;
    for (var i = Math.max(1, from); i < Math.min(to, pts.length); i++) {
      for (var j = 0; j < boxes.length; j++) {
        if (segCrossBox(pts[i - 1], pts[i], boxes[j])) n++;
      }
    }
    return n;
  }
  function ptsLen(pts) {
    var n = 0;
    for (var i = 1; i < pts.length; i++) {
      n += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
    }
    return n;
  }

  function routePoints(a, b, off) {
    var A = posOf(a), B = posOf(b);
    if (!A || !B) return [];
    var da = dirOf(a), db = dirOf(b);
    var A2 = da.none ? A : { x: A.x + da.x * 16, y: A.y + da.y * 16 };
    var B2 = db.none ? B : { x: B.x + db.x * 16, y: B.y + db.y * 16 };
    var head = da.none ? [A] : [A, A2];
    var tail = db.none ? [B2] : [B2, B];
    var dx = B2.x - A2.x, dy = B2.y - A2.y;

    /* 汇到同一处的几条线要分道，这时一律走中点 Z，错开量由 off 给 */
    if (off) {
      var mid = [];
      if (Math.abs(dx) >= Math.abs(dy)) {
        var mx = (A2.x + B2.x) / 2 + off;
        mid = [{ x: mx, y: A2.y }, { x: mx, y: B2.y }];
      } else {
        var my = (A2.y + B2.y) / 2 + off;
        mid = [{ x: A2.x, y: my }, { x: B2.x, y: my }];
      }
      return head.concat(mid, [B2], tail);
    }

    /* 其余：单折 L 两种、中点 Z 两种，取最短且不穿元件的一条 */
    var mids = [];
    if (Math.abs(dx) > 1.5 && Math.abs(dy) > 1.5) {
      mids.push([{ x: B2.x, y: A2.y }]);
      mids.push([{ x: A2.x, y: B2.y }]);
      mids.push([{ x: (A2.x + B2.x) / 2, y: A2.y }, { x: (A2.x + B2.x) / 2, y: B2.y }]);
      mids.push([{ x: A2.x, y: (A2.y + B2.y) / 2 }, { x: B2.x, y: (A2.y + B2.y) / 2 }]);
    }
    var boxes = boxesAround();
    var from = head.length > 1 ? 2 : 1;
    var best = null, bestHit = Infinity, bestScore = Infinity;
    mids.forEach(function (m) {
      var pts = head.concat(m, [B2], tail);
      var to = tail.length > 1 ? pts.length - 1 : pts.length;
      var hits = crossCount(pts, boxes, from, to);
      var score = ptsLen(pts) + m.length * 26;   /* 多拐一次弯记 26，能直就直 */
      if (hits < bestHit || (hits === bestHit && score < bestScore)) {
        bestHit = hits; bestScore = score; best = pts;
      }
    });
    if (best) return best;
    /* 只有竖直或水平一条直线的情形 */
    return head.concat([B2], tail);
  }

  /* 这根线的竖段（或横段）落在哪一列（行）上，用来给同列的多条线分道 */
  function laneOf(a, b) {
    var A = posOf(a), B = posOf(b);
    if (!A || !B) return null;
    var da = dirOf(a), db = dirOf(b);
    var s = da.none ? A : { x: A.x + da.x * 16, y: A.y + da.y * 16 };
    var B2 = db.none ? B : { x: B.x + db.x * 16, y: B.y + db.y * 16 };
    var dx = B2.x - s.x, dy = B2.y - s.y;
    if (Math.abs(dx) <= 1.5 || Math.abs(dy) <= 1.5) return null;
    if (Math.abs(dx) >= Math.abs(dy)) return { axis: 'h', v: Math.round((s.y + B2.y) / 2) };
    return { axis: 'v', v: Math.round(B2.x) };
  }

  /* ================= 数量统计 ================= */
  function countKind(kind) {
    var n = 0;
    Object.keys(I).forEach(function (k) { if (KEY2KIND[k] === kind.id) n++; });
    return n;
  }
  function countAll() {
    var got = 0, need = 0;
    KINDS.forEach(function (k) {
      got += countKind(k);
      need += k.need;
    });
    return { got: got, need: need };
  }
  /* 有偏差的种类：多了或少了都算 */
  function gaps() {
    return KINDS.map(function (k) {
      var got = countKind(k);
      return { kind: k, got: got, need: k.need, over: got > k.need };
    }).filter(function (g) { return g.got !== g.need; });
  }

  /* ================= 放置元器件 ================= */
  /* 点一次出一只：先按种类的位号表往下取，取完了就接着编号（C3、R4…） */
  function placeKind(kindId, quiet) {
    var kind = KIND[kindId];
    if (!kind) return;
    if (mode === 'done') {
      setStatus('板子已经接通，元器件不再增删。要改就点「清空接线」重来。', 'warn');
      return;
    }
    var key = null;
    for (var i = 0; i < kind.keys.length; i++) {
      if (!I[kind.keys[i]]) { key = kind.keys[i]; break; }
    }
    if (!key) {
      extraNo[kind.id] = (extraNo[kind.id] || 0) + 1;
      key = (kind.tag || kind.id) + (kind.keys.length + extraNo[kind.id]);
      while (I[key]) {
        extraNo[kind.id]++;
        key = (kind.tag || kind.id) + (kind.keys.length + extraNo[kind.id]);
      }
    }
    KEY2KIND[key] = kind.id;
    place(key, quiet, kind);
  }
  function place(type, quiet, kind) {
    if (I[type]) return;
    var def = PARTS[type];
    if (!def) {
      /* 多生成的实例：照同类的画法克隆一份，只换位号 */
      var tpl = PARTS[(kind || KIND[KEY2KIND[type]] || { keys: [type] }).keys[0]];
      def = {};
      for (var kk in tpl) if (tpl.hasOwnProperty(kk)) def[kk] = tpl[kk];
      def.ref = type;
      PARTS[type] = def;
    }
    var s = SLOTS[type];
    if (!s) {
      /* 多生成的那几只落在左侧下方的空地上，按格子排，别压到芯片 */
      var nb = Object.keys(I).filter(function (k) { return !SLOTS[k]; }).length;
      s = [80 + (nb % 3) * 72, 420 + Math.floor(nb / 3) * 72];
    }
    var g = el('g', { 'class': 'part', 'data-part': type }, gParts);
    g.setAttribute('transform', 'translate(' + s[0] + ',' + s[1] + ')');
    def.draw(g, def);
    if (def.lamp) g.setAttribute('data-lamp', def.lamp);

    var h = def.hit;
    var hit = el('rect', {
      x: h[0], y: h[1], width: h[2], height: h[3], rx: 4, 'class': 'part-hit'
    }, g);

    I[type] = { type: type, def: def, x: s[0], y: s[1], el: g };

    hit.addEventListener('pointerdown', function (e) { startDrag(e, type); });

    g.classList.add('dropin');
    setTimeout(function () { g.classList.remove('dropin'); }, 520);

    buildTerms();
    refreshTrays();
    updateProgress();

    if (!quiet) {
      select(type);
      var kd = KIND[KEY2KIND[type]];
      if (kd) {
        var got = countKind(kd);
        setStatus('<b>' + def.ref + ' ' + def.name + '</b> 已放下（' + kd.name + ' ' + got + ' / ' +
          kd.need + '）。' + (got < kd.need ? '这一种还要 ' + (kd.need - got) + ' 只。' :
            got > kd.need ? '这一种已经多了 ' + (got - kd.need) + ' 只，最后校验会拦下来。' : ''), got > kd.need ? 'warn' : 'ok');
      }
    }
  }

  /* 撤掉一只：连同它身上的线一起撤，接线进度跟着回退 */
  function removePart(type) {
    if (type === 'U1' || !I[type]) return;
    if (mode === 'done') {
      setStatus('板子已经接通，先把「清空接线」点了，再来撤元器件。', 'warn');
      return;
    }
    var gone = wires.filter(function (w) {
      return w.a.split(':')[0] === type || w.b.split(':')[0] === type;
    });
    gone.forEach(function (w) {
      if (w.path.parentNode) w.path.parentNode.removeChild(w.path);
      if (w.step !== undefined) delete solved[w.step];
    });
    wires = wires.filter(function (w) { return gone.indexOf(w) < 0; });

    if (I[type].el.parentNode) I[type].el.parentNode.removeChild(I[type].el);
    var ref = I[type].def.ref;
    delete I[type];
    buildTerms();
    refreshTrays();
    updateProgress();
    cur = firstOpen();
    if (mode === 'wire') showStep();
    select(null);
    setStatus('<b>' + ref + '</b> 撤掉了。' + (gone.length ? '它身上的 ' + gone.length + ' 条线一并撤回，回到第 ' + (cur + 1) + ' 步。' : ''), '');
  }

  function startDrag(e, type) {
    e.preventDefault();
    e.stopPropagation();
    var inst = I[type];
    var p = toWorld(e);
    drag = { mode: 'part', type: type, dx: p.x - inst.x, dy: p.y - inst.y, moved: false, sx: e.clientX, sy: e.clientY };
    select(type);
    svg.classList.add('dragging');
  }

  function select(type) {
    Object.keys(I).forEach(function (k) { I[k].el.classList.toggle('sel', k === type); });
    if (!type) { infoBox.hidden = true; return; }
    var d = PARTS[type];
    infoRef.textContent = d.ref;
    infoName.textContent = d.name;
    infoSpec.textContent = d.spec;
    infoRows.innerHTML = d.info.map(function (r) {
      return '<span><i>' + r[0] + '</i><b>' + r[1] + '</b></span>';
    }).join('') + '<p class="pinfo-note">' + d.note + '</p>';
    if (infoFoot) infoFoot.hidden = (type === 'U1');
    infoBox.hidden = false;
    infoBox.setAttribute('data-part', type);
  }

  /* ================= 端子 ================= */
  function buildTerms() {
    gNodes.innerHTML = '';
    TERMS = {};
    Object.keys(I).forEach(function (t) {
      var inst = I[t];
      inst.def.terms.forEach(function (td) {
        var key = t + ':' + td.id;
        var p = posOf(key);
        var g = el('g', { 'class': 'term', 'data-t': key, transform: 'translate(' + p.x + ',' + p.y + ')' }, gNodes);
        el('circle', { r: 14, 'class': 'thit' }, g);
        el('circle', { r: 3.4, 'class': 'tdot' }, g);
        TERMS[key] = g;
        g.addEventListener('click', function (e) { onTermClick(e, key); });
      });
    });
    if (pick && TERMS[pick]) TERMS[pick].classList.add('on');
  }

  function sync() {
    Object.keys(TERMS).forEach(function (k) {
      var p = posOf(k);
      if (p) TERMS[k].setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    });
    layoutWires();
  }

  function layoutWires() {
    /* 汇到同一处的几条线分道走，别叠成一条看不清 */
    var groups = {};
    wires.forEach(function (w) {
      var l = laneOf(w.a, w.b);
      if (!l) return;
      var k = l.axis + l.v;
      (groups[k] = groups[k] || []).push(w);
    });
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      g.forEach(function (w, i) {
        w.off = g.length > 1 ? (i - (g.length - 1) / 2) * 17 : 0;
      });
    });
    wires.forEach(function (w) {
      var pts = routePoints(w.a, w.b, w.off || 0);
      w.path.setAttribute('d', pathFrom(pts, 7));
    });
  }

  /* ================= 点两处端子接线 ================= */
  function onTermClick(e, key) {
    e.preventDefault();
    e.stopPropagation();
    if (mode === 'done') {
      setStatus('线已经接完、板子已经上电，这里改不动了。要重来就点「清空接线」。', 'warn');
      return;
    }
    if (mode !== 'wire') {
      if (mode === 'place') setStatus('元器件还没放齐。先点右边两个框，把这一组要用的元器件取出来。', 'warn');
      else setStatus('元器件都到位了，点「开始接线」，再点两处端子连线。', 'warn');
      return;
    }
    if (pick === key) {
      clearPick();
      setStatus('把这一处取消了，重新点。', '');
      return;
    }
    if (!pick) {
      pick = key;
      TERMS[key].classList.add('on');
      setStatus('已选 <b>' + tname(key) + '</b>，再点另一处端子，线就接上了。', '');
      return;
    }
    var a = pick, b = key;
    clearPick();
    attempt(a, b);
  }

  function clearPick() {
    if (pick && TERMS[pick]) TERMS[pick].classList.remove('on');
    pick = null;
  }

  function onMove(e) {
    if (!drag || drag.mode !== 'part') return;
    var inst = I[drag.type];
    var p = toWorld(e);
    var nx = Math.round((p.x - drag.dx) / 5) * 5;
    var ny = Math.round((p.y - drag.dy) / 5) * 5;
    nx = Math.max(-20, Math.min(820, nx));
    ny = Math.max(-20, Math.min(620, ny));
    inst.x = nx; inst.y = ny;
    inst.el.setAttribute('transform', 'translate(' + nx + ',' + ny + ')');
    sync();
    if (Math.abs(e.clientX - drag.sx) > 3 || Math.abs(e.clientY - drag.sy) > 3) drag.moved = true;
  }

  function onUp() {
    if (!drag) return;
    if (drag.mode === 'part') {
      svg.classList.remove('dragging');
      drag = null;
    }
  }

  /* ================= 判定 ================= */
  /* 同名电源符号等同，所以比的是归一后的网络名，不是位号 */
  function samePair(s, a, b) {
    var s1 = canon(s.a), s2 = canon(s.b), a1 = canon(a), b1 = canon(b);
    return (s1 === a1 && s2 === b1) || (s1 === b1 && s2 === a1);
  }
  function stepIndexOf(a, b) {
    for (var i = 0; i < STEPS.length; i++) if (samePair(STEPS[i], a, b)) return i;
    return -1;
  }
  function firstOpen() {
    for (var i = 0; i < STEPS.length; i++) if (!solved[i]) return i;
    return -1;
  }

  function reason(a, b) {
    var pa = a.split(':')[0], pb = b.split(':')[0];
    if (pa === pb) return '两个端子都在同一个元器件上，等于把它自己短接了。';
    var isPwr = function (k) { return /^(VCC\w*|GND\d*)$/.test(k.split(':')[0]); };
    if (isPwr(a) && isPwr(b)) {
      if (canon(a) === canon(b)) {
        return '这两处本就是同一个' + (canon(a) === '#GND' ? '地' : '＋5V') +
          '网络，图上按同名符号视为已经连在一起，不必再接一条。';
      }
      return '＋5V 与 GND 直接连在一起就是电源短路，上电会烧管子。';
    }
    if (isPwr(a) || isPwr(b)) {
      var other = isPwr(a) ? b : a;
      if (/^U1:P2/.test(other)) return '口线不能直接接电源或地，中间要经过限流电阻和 LED，否则一输出就过流。';
      if (/^(X1|C\d)/.test(other)) return '晶振和电容是时钟回路的，接到电源上就起不了振。';
      if (/^(LED|R)/.test(other)) return '这条支路要先经过灯和电阻，不能跳过中间元件直接接电源。';
    }
    return '这一对端子之间没有该走的电流，看提示里这一步要接的是哪两处。';
  }

  function attempt(a, b) {
    var k = pairKey(a, b);
    if (wires.some(function (w) { return w.key === k; })) {
      var sameNet = canon(a).charAt(0) === '#' || canon(b).charAt(0) === '#';
      setStatus('这两处之间已经连过一条线了' +
        (sameNet ? '；同一个电源或地网络只接一处就够。' : '。'), 'warn');
      return;
    }
    var idx = stepIndexOf(a, b);

    if (idx < 0) {
      flashBad(a, b);
      setStatus('<b>这条不通。</b>' + reason(a, b), 'bad');
      return;
    }
    if (solved[idx]) {
      setStatus('第 ' + (idx + 1) + ' 步已经接好了，不用再接。', 'warn');
      return;
    }
    if (idx !== cur) {
      flashWarn(a, b);
      setStatus('<b>这一对本身是对的，但顺序不对。</b> 先把第 ' + (cur + 1) + ' 步接完：' +
        STEPS[cur].tip + '。', 'warn');
      return;
    }

    /* 接对了 */
    var p = el('path', { d: '', 'class': 'wire ok pop' }, gWires);
    var w = { a: a, b: b, step: idx, path: p, key: k };
    wires.push(w);
    layoutWires();
    solved[idx] = true;
    flashGood(a, b);
    updateProgress();

    cur = firstOpen();
    var next = cur >= 0 ? ' 下一步：' + STEPS[cur].tip + '。' : '';
    setStatus('<b>接对了。</b>' + STEPS[idx].why + next, 'ok');
    if (cur >= 0) showStep();

    if (cur < 0) finish();
  }

  function flashGood(a, b) {
    [a, b].forEach(function (k) {
      var g = TERMS[k];
      if (!g) return;
      g.classList.add('flash-ok');
      setTimeout(function () { g.classList.remove('flash-ok'); }, 900);
    });
  }
  function flashBad(a, b) {
    [a, b].forEach(function (k) {
      var g = TERMS[k];
      if (!g) return;
      g.classList.add('flash-bad');
      setTimeout(function () { g.classList.remove('flash-bad'); }, 900);
    });
    var p = el('path', { d: pathFrom(routePoints(a, b), 7), 'class': 'wire bad tmp' }, gWires);
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 1200);
  }
  function flashWarn(a, b) {
    var p = el('path', { d: pathFrom(routePoints(a, b), 7), 'class': 'wire warn tmp' }, gWires);
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 1200);
  }

  function removeWire(w) {
    if (w.path.parentNode) w.path.parentNode.removeChild(w.path);
    wires = wires.filter(function (x) { return x !== w; });
    if (w.step !== undefined) {
      delete solved[w.step];
      cur = firstOpen();
      updateProgress();
      showStep();
      setStatus('已删掉这条线，回到第 ' + (cur + 1) + ' 步：' + STEPS[cur].tip + '。', 'warn');
    }
  }

  /* ================= 进度与提示 ================= */
  function updateProgress() {
    var n = Object.keys(solved).length, total = STEPS.length;
    numEl.textContent = n + ' / ' + total;
    barEl.style.width = (n / total * 100) + '%';
    document.dispatchEvent(new CustomEvent('lab:progress', {
      detail: { kind: 'wire', got: n, need: total }
    }));
  }

  function showStep() {
    if (mode === 'place') { stepCard.hidden = true; return; }
    var s = STEPS[cur];
    if (!s) { stepCard.hidden = true; return; }
    stepCard.hidden = false;
    stepNo.textContent = cur + 1;
    stepGrp.textContent = cur < 9 ? '最小运行电路' : '三色状态指示';
    stepTip.textContent = s.tip;
    stepCard.classList.remove('in');
    void stepCard.offsetWidth;
    stepCard.classList.add('in');
  }

  function setStatus(html, kind) {
    statusEl.innerHTML = html;
    statusEl.className = 'wire-status ' + (kind || '');
  }

  function finish() {
    mode = 'done';
    cur = -1;
    stepCard.hidden = true;
    hintEl.hidden = true;
    var chip = document.querySelector('[data-part="U1"] .chip-rect');
    if (chip) chip.classList.add('powered');
    setStatus('<b>18 条线全部接通，板子已经上电。</b> 这会儿还没有程序，三只灯都不亮；把下面的程序写完，灯就按程序转起来。', 'ok');
    startBtn.textContent = '已接通';
    startBtn.disabled = true;
    startBtn.classList.remove('ready');
    document.dispatchEvent(new CustomEvent('lab:ready', { detail: { kind: 'wire' } }));
  }

  /* ================= 三色灯 ================= */
  var lampTimer = [];
  var runOn = false;

  function setLamp(k) {
    ['LEDR', 'LEDY', 'LEDB'].forEach(function (t) {
      var c = document.querySelector('[data-part="' + t + '"] .led-glow');
      if (c) c.classList.toggle('lit', t === k);
    });
  }
  function lampOff() {
    runOn = false;
    lampTimer.forEach(clearTimeout);
    lampTimer = [];
    setLamp(null);
  }

  /* 程序写完才跑：红 1s → 黄 1s → 蓝 1s，照 test4.c 的节拍走两圈 */
  function runProgram() {
    lampOff();
    runOn = true;
    var seq = ['LEDR', 'LEDY', 'LEDB'];
    var i = 0;
    function tick() {
      if (!runOn) return;
      setLamp(seq[i % 3]);
      i++;
      if (i >= 6) {
        runOn = false;
        lampTimer.push(setTimeout(function () { if (!runOn) setLamp(null); }, 900));
        return;
      }
      lampTimer.push(setTimeout(tick, 1000));
    }
    lampTimer.push(setTimeout(tick, 260));
  }

  /* ================= 右侧两个框 ================= */
  function buildTrays() {
    CATS.forEach(function (cat) {
      var box = document.querySelector('.wtray[data-tray="' + cat + '"]');
      if (!box) return;
      var body = box.querySelector('.wtray-b');
      var list = KINDS.filter(function (k) { return k.tray === cat; });
      body.innerHTML = list.map(function (k) {
        return '<button type="button" class="pcard" data-kind="' + k.id + '">' +
          '<span class="pt"><b>' + k.name + '<i class="pn">' + (k.need > 1 ? '×' + k.need : '') + '</i></b>' +
          '<em>' + k.sub + '</em></span>' +
          '<span class="pd"><b>0</b>/' + k.need + '</span>' +
          '</button>';
      }).join('') + '<button type="button" class="pcard all" data-all="' + cat + '">这一组按数量补齐</button>';

      box.querySelector('.wtray-h').addEventListener('click', function () {
        var open = !body.hidden;
        body.hidden = open;
        box.classList.toggle('open', !open);
      });
      body.addEventListener('click', function (e) {
        var card = e.target.closest('.pcard');
        if (!card) return;
        if (card.dataset.all) {
          /* 补到需要的数量为止，不多放 */
          var i = 0;
          list.forEach(function (k) {
            var lack = k.need - countKind(k);
            for (var n = 0; n < lack; n++) {
              setTimeout(function () { placeKind(k.id, true); }, i * 80);
              i++;
            }
          });
          setTimeout(function () {
            setStatus('这一组按数量补齐了。位置不合适就拖动调整，也可以点元器件看参数。', 'ok');
          }, i * 80 + 60);
          return;
        }
        placeKind(card.dataset.kind);
      });
    });
  }

  function refreshTrays() {
    var all = countAll();
    CATS.forEach(function (cat) {
      var box = document.querySelector('.wtray[data-tray="' + cat + '"]');
      if (!box) return;
      var list = KINDS.filter(function (k) { return k.tray === cat; });
      var need = 0, got = 0, exact = true;
      list.forEach(function (k) {
        need += k.need;
        var n = countKind(k);
        got += n;
        if (n !== k.need) exact = false;
        var card = box.querySelector('.pcard[data-kind="' + k.id + '"]');
        if (!card) return;
        card.classList.toggle('done', n === k.need);
        card.classList.toggle('over', n > k.need);
        var pd = card.querySelector('.pd');
        if (pd) pd.innerHTML = '<b>' + n + '</b>/' + k.need;
      });
      var c = box.querySelector('.wt-c');
      if (c) c.textContent = got + ' / ' + need;
      box.classList.toggle('done', exact && got > 0);
      box.classList.toggle('bad', !exact && got > 0);
    });

    var ok = gaps().length === 0;
    if (startBtn && mode === 'place') {
      startBtn.disabled = false;
      startBtn.classList.toggle('ready', ok);
      startBtn.textContent = '开始接线';
    }
  }

  /* ================= 按钮 ================= */
  var CATNO = { min: '01', led: '02' };
  function checkCount() {
    var g = gaps();
    if (!g.length) return true;
    if (countAll().got === 0) {
      CATS.forEach(function (c) {
        var box = document.querySelector('.wtray[data-tray="' + c + '"]');
        if (!box) return;
        var body = box.querySelector('.wtray-b');
        if (body && body.hidden) { body.hidden = false; box.classList.add('open'); }
      });
      setStatus('<b>图桌上还只有单片机。</b>点右边两个框，一种元器件点一次出一只，凑够卡片上写的数量。', 'bad');
      return false;
    }
    var parts = g.slice(0, 4).map(function (x) {
      return CATNO[x.kind.tray] + ' ' + x.kind.name + (x.over
        ? ' 多了 ' + (x.got - x.need) + ' 只（' + x.got + ' / ' + x.need + '）'
        : ' 还差 ' + (x.need - x.got) + ' 只（' + x.got + ' / ' + x.need + '）');
    });
    setStatus('<b>元器件数量还不对。</b>' + parts.join('；') +
      (g.length > 4 ? '；等 ' + g.length + ' 项' : '') +
      '。多出来的，点图上的元器件，在参数卡里点「移走这一个」撤掉。', 'bad');
    /* 标出有偏差的那几张卡：框收着就展开，卡片抖一下 */
    KINDS.forEach(function (k) {
      if (!g.some(function (x) { return x.kind.id === k.id; })) return;
      var card = document.querySelector('.pcard[data-kind="' + k.id + '"]');
      if (!card) return;
      var box = card.closest('.wtray');
      if (box) {
        var body = box.querySelector('.wtray-b');
        if (body && body.hidden) {
          body.hidden = false;
          box.classList.add('open');
        }
      }
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      setTimeout(function () { card.classList.remove('shake'); }, 620);
    });
    return false;
  }

  startBtn.addEventListener('click', function () {
    if (mode === 'done') return;
    if (mode === 'wire') return;
    if (!checkCount()) return;
    mode = 'wire';
    cur = firstOpen();
    startBtn.textContent = '接线中';
    startBtn.disabled = true;
    startBtn.classList.remove('ready');
    document.querySelectorAll('.wtray-b').forEach(function (b) { b.hidden = true; });
    document.querySelectorAll('.wtray').forEach(function (b) { b.classList.remove('open'); });
    setStatus('按下面的提示走：先点一处端子，再点另一处，线就自动接上。接错会说清为什么不通。', 'ok');
    showStep();
  });

  resetBtn.addEventListener('click', function () {
    gWires.innerHTML = '';
    wires = [];
    solved = {};
    cur = 0;
    clearPick();
    lampOff();
    var chip = document.querySelector('[data-part="U1"] .chip-rect');
    if (chip) chip.classList.remove('powered');
    if (mode === 'done' || mode === 'wire') {
      mode = 'place';
      refreshTrays();
    }
    updateProgress();
    stepCard.hidden = true;
    hintEl.hidden = false;
    if (mode === 'wire') setStatus('接线清空了，从第 1 步重来。', '');
    else setStatus('接线清空了。数量没问题就再点「开始接线」。', '');
  });

  if (demoBtn) {
    demoBtn.addEventListener('click', function () {
      if (mode === 'done') return;
      if (mode === 'place') {
        KINDS.forEach(function (k) {
          var lack = k.need - countKind(k);
          for (var n = 0; n < lack; n++) placeKind(k.id, true);
        });
        refreshTrays();
        startBtn.click();
        if (mode !== 'wire') return;
      }
      gWires.innerHTML = '';
      wires = []; solved = {}; cur = 0;
      var i = 0;
      var t = setInterval(function () {
        if (i >= STEPS.length) { clearInterval(t); return; }
        var s = STEPS[i];
        attempt(s.a, s.b);
        i++;
        if (mode === 'done') clearInterval(t);
      }, 420);
    });
  }

  infoClose.addEventListener('click', function () { select(null); });
  if (infoDel) {
    infoDel.addEventListener('click', function () {
      var t = infoBox.getAttribute('data-part');
      if (t) removePart(t);
    });
  }

  svg.addEventListener('pointerdown', function (e) {
    if (e.target === svg || e.target.id === 'wireBg') { select(null); clearPick(); }
  });
  gWires.addEventListener('click', function (e) {
    var p = e.target.closest ? e.target.closest('.wire') : null;
    if (!p || p.classList.contains('tmp')) return;
    var w = wires.filter(function (x) { return x.path === p; })[0];
    if (w && mode !== 'place') removeWire(w);
  });

  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);

  /* ================= 初始化 ================= */
  buildTrays();
  place('U1', true);          /* 单片机默认就在图桌上 */
  refreshTrays();
  updateProgress();
  setStatus('单片机已经在图桌上了。点右边两个框，一种元器件点一次出一只，凑够卡上写的数量。', '');
  startBtn.disabled = true;

  window.MinsysWire = {
    run: runProgram,
    blink: runProgram,
    refresh: function () { refreshTrays(); updateProgress(); },
    placeAll: function () {
      KINDS.forEach(function (k) {
        var lack = k.need - countKind(k);
        for (var n = 0; n < lack; n++) placeKind(k.id, true);
      });
      refreshTrays();
    }
  };
})();
