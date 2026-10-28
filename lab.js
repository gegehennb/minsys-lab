/* ==========================================================
   最小系统大师 · 实验台
   一、引脚图：40 只引脚按功能分四类，点一类亮一类
   二、片内结构：一张方块图，点方块看部件，点总线看数据怎么走
   （连线台在 lab-wire.js）
   ========================================================== */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------------- 引脚数据 ----------------
     [编号, 名称, 第二功能, 功能说明, 本课用法, 类别]
     pwr = 电源线    run = 运行必备    io = 应用 I/O 口    ext = 并行扩展必备
     -------------------------------------------- */
  var PINS = [
    [1, 'P1.0', '', 'P1 口第 0 位，准双向 I/O，内部带上拉电阻，可直接驱动小电流负载。', '本课未接线', 'io'],
    [2, 'P1.1', '', 'P1 口第 1 位，用法与 P1.0 相同，作通用输出或输入。', '本课未接线', 'io'],
    [3, 'P1.2', '', 'P1 口第 2 位，输出高电平时靠内部上拉，拉电流能力很弱。', '本课未接线', 'io'],
    [4, 'P1.3', '', 'P1 口第 3 位，作输入时应先写 1，把口锁存器置高。', '本课未接线', 'io'],
    [5, 'P1.4', '', 'P1 口第 4 位，可作通用 I/O，也可软件模拟时序。', '本课未接线', 'io'],
    [6, 'P1.5', '', 'P1 口第 5 位，每位可独立读写，位寻址地址 90H 起。', '本课未接线', 'io'],
    [7, 'P1.6', '', 'P1 口第 6 位，同一口的八位可整字节读写，也可按位操作。', '本课未接线', 'io'],
    [8, 'P1.7', '', 'P1 口第 7 位，P1 口在本课中全部留空。', '本课未接线', 'io'],

    [9, 'RST', 'VPD', '复位输入端。高电平持续两个机器周期以上，芯片回到初始状态，程序从 0000H 重新执行。', '外接 1kΩ 下拉与 22μF 上电复位', 'run'],
    [10, 'P3.0', 'RXD', 'P3 口第 0 位，第二功能是串行口接收端，接收外部送来的串行数据。', '本课未接线', 'io'],
    [11, 'P3.1', 'TXD', 'P3 口第 1 位，第二功能是串行口发送端，把数据按位送出。', '本课未接线', 'io'],
    [12, 'P3.2', 'INT0', 'P3 口第 2 位，第二功能是外部中断 0 的输入端，可低电平或下降沿触发。', '本课未接线', 'io'],
    [13, 'P3.3', 'INT1', 'P3 口第 3 位，第二功能是外部中断 1 的输入端。', '本课未接线', 'io'],
    [14, 'P3.4', 'T0', 'P3 口第 4 位，第二功能是定时器 0 的外部计数脉冲输入。', '本课未接线', 'io'],
    [15, 'P3.5', 'T1', 'P3 口第 5 位，第二功能是定时器 1 的外部计数脉冲输入。', '本课未接线', 'io'],
    [16, 'P3.6', 'WR', 'P3 口第 6 位，第二功能是片外数据存储器写选通，低电平有效。', '本课未接线', 'io'],
    [17, 'P3.7', 'RD', 'P3 口第 7 位，第二功能是片外数据存储器读选通，低电平有效。', '本课未接线', 'io'],
    [18, 'XTAL2', '', '振荡电路反相放大器的输出端，接石英晶振的一端，与 XTAL1 共同构成时钟源。', '接 12MHz 晶振一端', 'run'],
    [19, 'XTAL1', '', '振荡电路反相放大器的输入端，晶振产生的正弦波由此进入芯片，经分频得到机器周期。', '接 12MHz 晶振另一端', 'run'],
    [20, 'VSS', 'GND', '接地端，全片的参考零电位，电源回路必须回到这里。', '接电源负极', 'pwr'],

    [21, 'P2.0', 'A8', 'P2 口第 0 位。作通用 I/O 时是准双向口；扩展片外存储器时输出高 8 位地址 A8。', '驱动红色指示灯，写 0 点亮', 'io'],
    [22, 'P2.1', 'A9', 'P2 口第 1 位，兼具通用 I/O 与高位地址两种身份。', '驱动黄色指示灯，写 0 点亮', 'io'],
    [23, 'P2.2', 'A10', 'P2 口第 2 位，本课作为普通输出口使用，不扩展片外存储器。', '驱动蓝色指示灯，写 0 点亮', 'io'],
    [24, 'P2.3', 'A11', 'P2 口第 3 位，未扩展片外存储器时按普通 I/O 处理。', '本课未接线', 'io'],
    [25, 'P2.4', 'A12', 'P2 口第 4 位，输出高电平时由上拉电阻提供电流，能力有限。', '本课未接线', 'io'],
    [26, 'P2.5', 'A13', 'P2 口第 5 位，可直接驱动 LED，但须串限流电阻。', '本课未接线', 'io'],
    [27, 'P2.6', 'A14', 'P2 口第 6 位，也可作高位地址线输出。', '本课未接线', 'io'],
    [28, 'P2.7', 'A15', 'P2 口第 7 位，扩展片外存储器时输出地址最高位 A15。', '本课未接线', 'io'],
    [29, 'PSEN', '', '片外程序存储器读选通信号，低电平有效。本课程序存在片内，该脚不用。', '本课未接线', 'ext'],
    [30, 'ALE', 'PROG', '地址锁存允许输出。访问片外存储器时用它锁存低 8 位地址；不访问时输出 1/6 时钟频率的脉冲。', '本课未接线', 'ext'],
    [31, 'EA', 'VPP', '片内/片外程序存储器选择端。接高电平时从片内 0000H 开始执行；接低电平则从片外取指令。', '必须接 VCC，否则程序不执行', 'ext'],
    [32, 'P0.7', 'AD7', 'P0 口第 7 位。扩展存储器时与低 8 位地址分时复用；作普通 I/O 时外部须接上拉电阻。', '本课未接线', 'io'],
    [33, 'P0.6', 'AD6', 'P0 口第 6 位，内部为漏极开路结构，输出高电平需要外部上拉。', '本课未接线', 'io'],
    [34, 'P0.5', 'AD5', 'P0 口第 5 位，作输入前同样要先写 1。', '本课未接线', 'io'],
    [35, 'P0.4', 'AD4', 'P0 口第 4 位，地址与数据分时复用。', '本课未接线', 'io'],
    [36, 'P0.3', 'AD3', 'P0 口第 3 位，口线驱动能力比 P1、P2、P3 强。', '本课未接线', 'io'],
    [37, 'P0.2', 'AD2', 'P0 口第 2 位，未扩展时作普通 I/O。', '本课未接线', 'io'],
    [38, 'P0.1', 'AD1', 'P0 口第 1 位，外部须接 10kΩ 左右上拉电阻才能可靠输出高电平。', '本课未接线', 'io'],
    [39, 'P0.0', 'AD0', 'P0 口第 0 位，扩展存储器时输出最低位地址 A0。', '本课未接线', 'io'],
    [40, 'VCC', '', '电源正端，接 +5V。工作电压低于 4.0V 时芯片不能保证正常工作。', '接 +5V 电源', 'pwr']
  ];

  var GROUP_NAME = { pwr: '电源线', run: '运行必备', io: '应用 I/O', ext: '并行扩展' };
  var MAIN_CATS = ['pwr', 'run', 'io', 'ext'];

  /* 分类与引脚号的对照，由上面的表算出来，避免两处各写一遍 */
  var CAT_MAP = { pwr: [], run: [], io: [], p3: [], ext: [] };
  PINS.forEach(function (p) {
    CAT_MAP[p[5]].push(p[0]);
    if (p[0] >= 10 && p[0] <= 17) CAT_MAP.p3.push(p[0]);
  });

  /* 每一类点开后的说明卡 */
  var CAT_INFO = {
    pwr: {
      count: '2 根',
      name: '电源线',
      tag: '电源',
      fn: '芯片工作的前提。VCC 接 +5V 正电源，VSS 接地，两只引脚之间通常并一只 0.1μF 去耦电容，抑制电源纹波。',
      chips: ['40 · VCC(+5V)', '20 · VSS(GND)'],
      note: '本课接 5V 电源正负极。接反或电压不足，芯片不工作。'
    },
    run: {
      count: '3 根',
      name: '运行必备引脚',
      tag: '时钟复位',
      fn: '芯片要跑起来，这三只引脚缺一不可。XTAL1、XTAL2 外接石英晶振与两只负载电容构成时钟电路；RST 接复位支路，上电时给出一个高电平脉冲，让程序从 0000H 开始执行。',
      chips: ['19 · XTAL1', '18 · XTAL2', '9 · RST'],
      note: '本课 12MHz 晶振，RST 用 1kΩ 下拉加 22μF 上电复位。'
    },
    io: {
      count: '32 根',
      name: '应用 I/O 口',
      tag: '32 线',
      fn: '四组 8 位准双向并行口，共 32 根口线，是单片机与外部世界打交道的主要通道。P0 内部为漏极开路结构，作输出时须外接上拉电阻；P1、P2、P3 内部带上拉。',
      chips: ['P1.0—P1.7 · 1—8', 'P3.0—P3.7 · 10—17', 'P2.0—P2.7 · 21—28', 'P0.0—P0.7 · 32—39'],
      note: '本课三只指示灯接 P2.0—P2.2，写 0 点亮。P3 口八根线另有第二功能，见下一行。'
    },
    p3: {
      count: '8 根',
      name: 'P3 口第二功能',
      tag: '第二功能',
      fn: 'P3 口八根线都是双身份：平时按普通 I/O 用，设置第二功能后分别承担串行收发、外部中断、定时计数和片外读写选通。角色由程序决定，硬件上仍是同一根线。',
      chips: ['10 RXD', '11 TXD', '12 INT0', '13 INT1', '14 T0', '15 T1', '16 /WR', '17 /RD'],
      note: '本课 P3 口留空，讲串行通信和中断时再用这几个第二功能。'
    },
    ext: {
      count: '3 根',
      name: '并行扩展必备引脚',
      tag: '扩展',
      fn: '扩展片外存储器时要用的三只控制引脚。/EA 选择从片内还是片外取指令；/PSEN 读片外程序存储器；ALE 锁存低 8 位地址。不扩展时，/PSEN 与 ALE 空置，/EA 必须接高电平。',
      chips: ['31 · /EA 片内外选择', '29 · /PSEN 片外程序取指', '30 · ALE 地址锁存允许'],
      note: '本课只把 /EA 接到 VCC，另外两只悬空。'
    }
  };

  /* ---------------- 画引脚图 ---------------- */
  var PIN_Y0 = 90, PIN_STEP = 22;
  function pinY(i) { return i < 20 ? PIN_Y0 + PIN_STEP * i : PIN_Y0 + PIN_STEP * (39 - i); }

  var gPins = document.getElementById('gPins');
  var info = document.getElementById('pinInfo');
  var stage = document.querySelector('.pin-stage');

  PINS.forEach(function (p, i) {
    var left = i < 20;
    var y = pinY(i);
    var g = svgEl('g', { 'class': 'pin c-' + p[5], 'data-pin': p[0] }, gPins);
    if (p[0] >= 10 && p[0] <= 17) g.setAttribute('data-p3', '1');

    svgEl('rect', { x: left ? 96 : 404, y: y - 11, width: 60, height: 22, fill: 'transparent' }, g);
    svgEl('line', { x1: left ? 104 : 410, y1: y, x2: left ? 150 : 456, y2: y, 'class': 'lead' }, g);
    svgEl('circle', { cx: left ? 104 : 456, cy: y, r: 5.6, 'class': 'halo' }, g);
    svgEl('circle', { cx: left ? 104 : 456, cy: y, r: 3.6, 'class': 'term' }, g);
    svgEl('text', {
      x: left ? 160 : 400, y: y + 3.2, 'class': 'pno', 'text-anchor': left ? 'start' : 'end'
    }, g).textContent = p[0];
    svgEl('text', {
      x: left ? 96 : 464, y: y + 3.6, 'class': 'pname',
      'text-anchor': left ? 'end' : 'start'
    }, g).textContent = p[1] + (p[2] ? '/' + p[2] : '');

    g.addEventListener('click', function () { selectPin(p, g); });
  });

  /* ---------------- 选类 ---------------- */
  var activeCat = null;
  var allOn = false;      /* 点芯片后的「全部 40 根」总览 */
  var catSeen = {};
  var pinReady = false;
  var onPin = null;

  function clearPinOn() {
    if (onPin) { onPin.classList.remove('on'); onPin = null; }
  }

  var p3Row = document.querySelector('#catList .cat.sub');
  function revealP3() {
    if (!p3Row || p3Row.classList.contains('open')) return;
    p3Row.classList.add('open');
  }
  /* 离开「应用 I/O 口」，这一行跟着收起，不留一个悬在外面的子项 */
  function foldP3() {
    if (p3Row) p3Row.classList.remove('open');
  }

  /* mode：分类名 / 'all'（点芯片，40 根全亮）/ null（常态） */
  function setMode(mode) {
    allOn = (mode === 'all');
    activeCat = allOn ? null : mode;
    if (activeCat) catSeen[activeCat] = 1;
    stage.setAttribute('data-cat', allOn ? 'all' : (activeCat || 'none'));
    var hint = document.getElementById('bodyHint');
    if (hint) hint.textContent = allOn ? '点芯片 · 收起' : '点芯片 · 40 根全亮';
    clearPinOn();

    var list = (activeCat && !allOn) ? CAT_MAP[activeCat] : null;
    var nodes = Array.prototype.slice.call(gPins.children);

    /* 先全清再重排，让同一类再次点亮时整组重新走一遍入场 */
    nodes.forEach(function (g) { g.classList.remove('lit', 'dim'); g.style.animationDelay = ''; });
    void gPins.offsetWidth;

    if (allOn) {
      /* 40 根从第 1 脚顺着编号扫一圈，四类各自保留自己的颜色 */
      nodes.forEach(function (g, i) {
        g.classList.add('lit');
        g.style.animationDelay = (i * 9) + 'ms';
      });
    } else if (list) {
      nodes.forEach(function (g) {
        var no = +g.getAttribute('data-pin');
        var at = list.indexOf(no);
        if (at >= 0) {
          g.classList.add('lit');
          g.style.animationDelay = (at * 16) + 'ms';
        } else {
          g.classList.add('dim');
        }
      });
    }

    /* P3 第二功能是 I/O 口下面的子项，默认收着；点到「应用 I/O 口」才展开 */
    if (activeCat === 'io' || activeCat === 'p3') revealP3(); else foldP3();

    Array.prototype.forEach.call(document.querySelectorAll('#catList .cat'), function (b) {
      var key = b.getAttribute('data-cat');
      /* 亮 P3 时父项「应用 I/O 口」也保持点亮，让人看得出父子关系 */
      b.classList.toggle('on', key === activeCat || (activeCat === 'p3' && key === 'io'));
    });

    if (allOn) renderAll();
    else if (activeCat) renderCat(activeCat);
    else renderEmpty();
    reportPin();
  }

  function applyCat(cat) {
    setMode((activeCat === cat && !allOn) ? null : cat);
  }

  /* 点芯片本体：全部 40 根亮起来，再点一次收起 */
  var chipHit = document.getElementById('chipHit');
  if (chipHit) chipHit.addEventListener('click', function () { setMode(allOn ? null : 'all'); });

  function renderEmpty() {
    info.innerHTML =
      '<div class="pi-empty">' +
        '<svg class="ico"><use href="#i-pins"/></svg>' +
        '<p>点左边一类，这一类的引脚亮起来，其余退到背景；点其中一只，看它的功能。</p>' +
      '</div>';
  }

  function renderAll() {
    info.innerHTML =
      '<div class="pi-head">' +
        '<span class="pi-no">40 根</span>' +
        '<b class="pi-name">全部引脚</b>' +
        '<span class="pi-tag all">总览</span>' +
      '</div>' +
      '<p class="pi-fn">四类合起来正好 40 根。颜色即分类：红是电源，琥珀是运行必备，蓝是应用 I/O 口，' +
        '紫是并行扩展。点左边某一类，可以单独看那一类。</p>' +
      '<div class="pi-chips">' +
        '<span class="chip-p">2 · 电源</span>' +
        '<span class="chip-p">3 · 运行必备</span>' +
        '<span class="chip-p">32 · 应用 I/O</span>' +
        '<span class="chip-p">3 · 并行扩展</span>' +
      '</div>' +
      '<div class="pi-use"><span class="lb">提示</span><span class="tx">再点一次芯片收起；点单只引脚，看它的名称与第二功能。</span></div>' +
      '<div class="pi-meta mono">40 PIN &nbsp;·&nbsp; 2 + 3 + 32 + 3</div>';
  }

  function renderCat(cat) {
    var d = CAT_INFO[cat];
    info.innerHTML =
      '<div class="pi-head">' +
        '<span class="pi-no">' + d.count + '</span>' +
        '<b class="pi-name">' + d.name + '</b>' +
        '<span class="pi-tag ' + cat + '">' + d.tag + '</span>' +
      '</div>' +
      '<p class="pi-fn">' + d.fn + '</p>' +
      '<div class="pi-chips">' +
        d.chips.map(function (c) { return '<span class="chip-p">' + c + '</span>'; }).join('') +
      '</div>' +
      '<div class="pi-use used"><span class="lb">本课</span><span class="tx">' + d.note + '</span></div>';
  }

  Array.prototype.forEach.call(document.querySelectorAll('#catList .cat'), function (b) {
    b.addEventListener('click', function () { applyCat(b.getAttribute('data-cat')); });
  });

  /* ---------------- 选单只引脚 ---------------- */
  function selectPin(p, g) {
    clearPinOn();
    g.classList.add('on');
    onPin = g;

    var no = p[0], name = p[1], alt = p[2], grp = p[5];
    var used = p[4].indexOf('未接线') < 0;
    info.innerHTML =
      '<div class="pi-head">' +
        '<span class="pi-no">' + (no < 10 ? '0' + no : no) + '</span>' +
        '<b class="pi-name">' + name + (alt ? '<i>/' + alt + '</i>' : '') + '</b>' +
        '<span class="pi-tag ' + grp + '">' + GROUP_NAME[grp] + '</span>' +
      '</div>' +
      '<p class="pi-fn">' + p[3] + '</p>' +
      '<div class="pi-use ' + (used ? 'used' : '') + '">' +
        '<span class="lb">' + (used ? '本课' : '本课不接') + '</span>' +
        '<span class="tx">' + p[4] + '</span>' +
      '</div>' +
      '<div class="pi-meta mono">PIN ' + no + ' / 40 &nbsp;·&nbsp; DIP-40</div>';
  }

  /* ---------------- 进度上报 ---------------- */
  function reportPin() {
    var got = MAIN_CATS.filter(function (k) { return catSeen[k]; }).length;
    document.dispatchEvent(new CustomEvent('lab:progress', { detail: { kind: 'pin', got: got, need: 4 } }));
    if (got === MAIN_CATS.length && !pinReady) {
      pinReady = true;
      document.dispatchEvent(new CustomEvent('lab:ready', { detail: { kind: 'pin' } }));
    }
  }

  /* ---------------- 片内结构 ----------------
     一张方块图：八个部件骑在三条总线上，点方块出说明，点总线放一段传输动画
     -------------------------------------------- */
  var coreStage = document.getElementById('coreStage');
  var coreInfo = document.getElementById('coreInfo');
  var gConns = document.getElementById('gConns');
  var gBars = document.getElementById('gBars');
  var gBlocks = document.getElementById('gBlocks');
  var pkt = document.getElementById('pkt');
  var pktRect = pkt.querySelector('rect');
  var pktText = pkt.querySelector('text');
  var trail = document.getElementById('trail');
  var flowK = document.getElementById('flowK');
  var flowT = document.getElementById('flowT');
  var flowReplay = document.getElementById('flowReplay');
  var seenCore = {};
  var coreReady = false;

  var BAR = { db: 230, ab: 300, cb: 370 };
  var BAR_TXT = { db: 'DB', ab: 'AB', cb: 'CB' };
  var BAR_FULL = { db: '数据总线 DB', ab: '地址总线 AB', cb: '控制总线 CB' };
  var LANE = { db: 40, ab: 82, cb: 124 };
  var BX0 = 192, BX1 = 846;

  var BOX = {
    cpu:  { x: 26,  y: 210, w: 150, h: 180, t: '中央处理器', s: 'CPU · ALU + 控制' },
    clk:  { x: 26,  y: 62,  w: 150, h: 92,  t: '振荡器时钟电路', s: '12MHz · 12 分频' },
    ram:  { x: 210, y: 92,  w: 172, h: 92,  t: '128B/256B', s: '数据存储器 RAM', up: 1 },
    rom:  { x: 418, y: 92,  w: 172, h: 92,  t: '4KB/8KB', s: '程序存储器 ROM', up: 1 },
    tcon: { x: 626, y: 92,  w: 172, h: 92,  t: '2 个 16 位', s: '定时器 / 计数器', up: 1 },
    io:   { x: 210, y: 416, w: 172, h: 92,  t: '可编程 I/O 口', s: '4 × 8 位' },
    sio:  { x: 560, y: 416, w: 172, h: 92,  t: '可编程串行口', s: '全双工 · 4 种方式' }
  };
  /* 每只方块挂三条总线，箭头说明信号往哪边走：in 送入方块，out 送出，both 双向 */
  var DIR = {
    ram:  { db: 'both', ab: 'in', cb: 'in' },
    rom:  { db: 'out', ab: 'in', cb: 'in' },
    tcon: { db: 'both', ab: 'in', cb: 'both' },
    io:   { db: 'both', ab: 'in', cb: 'both' },
    sio:  { db: 'both', ab: 'in', cb: 'both' }
  };
  function laneX(key, bk) { return BOX[key].x + LANE[bk]; }
  function edgeY(key) { var b = BOX[key]; return b.up ? b.y + b.h : b.y; }
  function anchor(key, bk) {
    if (key === 'cpu') return { x: 176, y: BAR[bk] };
    return { x: laneX(key, bk), y: edgeY(key) };
  }

  /* ---- 画三条总线 ---- */
  ['db', 'ab', 'cb'].forEach(function (bk) {
    var g = svgEl('g', { 'class': 'bus bus-' + bk, 'data-k': bk }, gBars);
    svgEl('line', { x1: BX0, y1: BAR[bk], x2: BX1, y2: BAR[bk], 'class': 'bus-casing' }, g);
    svgEl('line', { x1: BX0, y1: BAR[bk], x2: BX1, y2: BAR[bk], 'class': 'bus-line ' + bk }, g);
    svgEl('text', { x: BX1, y: BAR[bk] - 9, 'text-anchor': 'end', 'class': 'bus-code' }, g).textContent = BAR_TXT[bk];
  });

  /* ---- 画方块与它的三条竖向接入线 ---- */
  Object.keys(BOX).forEach(function (key) {
    var b = BOX[key];
    var g = svgEl('g', { 'class': 'blk blk-' + key, 'data-k': key }, gBlocks);
    svgEl('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 3 }, g);
    var cy = b.h > 120 ? b.y + 84 : b.y + 38;
    svgEl('text', { x: b.x + b.w / 2, y: cy, 'text-anchor': 'middle', 'class': 'blk-t' }, g).textContent = b.t;
    svgEl('text', { x: b.x + b.w / 2, y: cy + 21, 'text-anchor': 'middle', 'class': 'blk-s' }, g).textContent = b.s;
  });

  /* CPU 到三条总线的短接 */
  ['db', 'ab', 'cb'].forEach(function (bk) {
    var g = svgEl('g', { 'class': 'conn conn-' + bk, 'data-k': 'cpu:' + bk }, gConns);
    svgEl('line', { x1: BX0, y1: BAR[bk], x2: 176, y2: BAR[bk], 'class': 'conn-halo' }, g);
    var ln = svgEl('line', { x1: BX0, y1: BAR[bk], x2: 176, y2: BAR[bk], 'class': 'conn-line ' + bk }, g);
    /* 线从总线画向 CPU：end 落在 CPU 上＝送入，start 反向＝送出 */
    ln.setAttribute('marker-start', 'url(#ar-' + bk + ')');
    if (bk === 'db') ln.setAttribute('marker-end', 'url(#ar-' + bk + ')');
  });

  Object.keys(BOX).forEach(function (key) {
    /* CPU 在总线左端单画，时钟电路不挂总线，两者都跳过 */
    if (key === 'cpu' || key === 'clk' || !DIR[key]) return;
    var b = BOX[key], ey = b.up ? b.y + b.h : b.y;
    ['db', 'ab', 'cb'].forEach(function (bk) {
      var x = laneX(key, bk), dir = DIR[key][bk];
      var g = svgEl('g', { 'class': 'conn conn-' + bk, 'data-k': key + ':' + bk }, gConns);
      svgEl('line', { x1: x, y1: BAR[bk], x2: x, y2: ey, 'class': 'conn-halo' }, g);
      var ln = svgEl('line', { x1: x, y1: BAR[bk], x2: x, y2: ey, 'class': 'conn-line ' + bk }, g);
      if (dir === 'in' || dir === 'both') ln.setAttribute('marker-end', 'url(#ar-' + bk + ')');
      if (dir === 'out' || dir === 'both') ln.setAttribute('marker-start', 'url(#ar-' + bk + ')');
    });
  });
  /* ---- 中断源：四路请求直接进 CPU 底部 ---- */
  var gInt = svgEl('g', { 'class': 'blk blk-int', 'data-k': 'int' }, gBlocks);
  svgEl('rect', { x: 38, y: 386, width: 136, height: 78, 'class': 'int-hit' }, gInt);
  [60, 87, 114, 141].forEach(function (x) {
    svgEl('line', { x1: x, y1: 428, x2: x, y2: 394, 'class': 'int-arw', 'marker-start': 'url(#ar-cb)' }, gInt);
  });
  svgEl('text', { x: 101, y: 452, 'text-anchor': 'middle', 'class': 'ext-lb' }, gInt).textContent = '中断源';

  /* ---- 三处对外标注：频率基准源、并行 I/O 口、串行输入输出 ---- */
  svgEl('text', { x: 101, y: 30, 'text-anchor': 'middle', 'class': 'ext-lb' }, gBlocks).textContent = '频率基准源';
  svgEl('line', { x1: 101, y1: 38, x2: 101, y2: 60, 'class': 'ext-arw', 'marker-start': 'url(#ar-cb)', 'marker-end': 'url(#ar-cb)' }, gBlocks);

  svgEl('text', { x: 296, y: 542, 'text-anchor': 'middle', 'class': 'ext-lb' }, gBlocks).textContent = '并行 I/O 口';
  [236, 276, 316, 356].forEach(function (x) {
    svgEl('line', { x1: x, y1: 510, x2: x, y2: 526, 'class': 'ext-arw', 'marker-start': 'url(#ar-cb)', 'marker-end': 'url(#ar-cb)' }, gBlocks);
  });

  svgEl('text', { x: 646, y: 542, 'text-anchor': 'middle', 'class': 'ext-lb' }, gBlocks).textContent = '串行输入 / 输出';
  svgEl('line', { x1: 606, y1: 510, x2: 606, y2: 526, 'class': 'ext-arw', 'marker-end': 'url(#ar-cb)' }, gBlocks);
  svgEl('line', { x1: 686, y1: 526, x2: 686, y2: 510, 'class': 'ext-arw', 'marker-end': 'url(#ar-cb)' }, gBlocks);

  /* ---- 说明文字 ---- */
  var CORE = {
    cpu: { tag: 'CPU', name: '中央处理器', fn: '由运算器 ALU 和控制器组成。取指、译码、执行按机器周期一步一步走，整个片内的节奏都由它指挥。', links: ['AB 送出', 'CB 送出', 'DB 双向'], note: '本课写的每一条 C 语句，最后都变成这里的一个个机器周期。' },
    clk: { tag: 'CLK', name: '振荡器时钟电路', fn: '由片内振荡器和时钟电路组成，外接 12MHz 晶振，经 12 分频得到 1μs 的机器周期。', links: ['直接给 CPU 供时钟', '不挂三条总线'], note: '本课实测：晶振 12MHz，一拍 1μs，软件延时就按这个算。' },
    rom: { tag: 'ROM', name: '程序存储器', fn: '4KB 掩膜 ROM，地址 0000H—0FFFH。只往数据总线上送，不接收，所以 DB 箭头指向总线。断电不丢。', links: ['AB 送入', 'CB 送入', 'DB 送出'], note: '本课程序就烧在这里，4KB 对三色灯控制绰绰有余。' },
    ram: { tag: 'RAM', name: '数据存储器', fn: '128 字节，地址 00H—7FH。存变量、堆栈和中间结果，靠 DB 读写，断电即失。', links: ['AB 送入', 'CB 送入', 'DB 双向'], note: '本课用一个字节存灯的状态，再逐位输出到 P2 口。' },
    tcon: { tag: 'T0/T1', name: '定时器 / 计数器', fn: '两个 16 位定时器。做定时按机器周期累加，做计数则对外部脉冲计数，溢出时置中断标志。', links: ['AB 送入', 'CB 双向', 'DB 双向'], note: '本课用软件延时循环，暂不启用定时器，它是后面做闪烁的底子。' },
    io: { tag: 'P0—P3', name: '可编程 I/O 口', fn: '四组 8 位并行口，共 32 根口线。P0 漏极开路，P1—P3 内部带上拉，CPU 把数据送到口锁存器再由引脚输出。', links: ['AB 送入', 'CB 双向', 'DB 双向'], note: '三只指示灯接在 P2.0—P2.2，写 0 点亮（共阳接法）。' },
    sio: { tag: 'SIO', name: '可编程串行口', fn: '一个全双工串口，可工作在 4 种方式。收发的字节都要经过数据总线在 SBUF 与 CPU 之间搬。', links: ['AB 送入', 'CB 双向', 'DB 双向'], note: '本课不接串口，生产线做数据上传时才用。' },
    int: { tag: 'INT', name: '中断源', fn: '5 个中断源、2 个优先级。请求直接送进 CPU，不经过三条总线；CPU 响应后跳到固定入口，如外部中断 0 是 0003H。', links: ['直接连 CPU', '不走总线'], note: '本课用查询方式，不开放中断，但按键响应最终要靠它。' },
    db: { tag: 'DB', name: '数据总线', fn: '8 位双向，宽 8 根。CPU 与存储器、外设之间传的数据和指令都走这条线，一次一个字节，方向由读写信决定。', links: ['8 位', '双向', '一次 1 字节'], note: '写 P2 口的那一个字节，就是从这条线送到口锁存器的。' },
    ab: { tag: 'AB', name: '地址总线', fn: '16 位单向，只能由 CPU 指向存储器与外设，可寻址 64KB。片内 4KB 只用低 12 位，外部器件只听话，不会反过来送地址。', links: ['16 位', '单向', 'CPU 送出'], note: '本课不扩展片外存储器，地址线只在片内选单元。' },
    cb: { tag: 'CB', name: '控制总线', fn: '传送读写选通与中断请求这些控制信号，一根线一个用途，方向各自固定。读、写、取指全靠它把动作卡在节拍上。', links: ['每根方向固定', '/RD · /WR · /PSEL', '中断请求'], note: '本课不扩展外部器件，控制信号基本在片内活动。' }
  };
  var BUS_INFO = {
    db: { bits: '8 位', dir: '双向', full: '数据总线 DB' },
    ab: { bits: '16 位', dir: '单向', full: '地址总线 AB' },
    cb: { bits: '按根计', dir: '方向各自固定', full: '控制总线 CB' }
  };

  function cardHead(tag, name, cls) {
    return '<div class="pi-head"><span class="pi-no">' + tag + '</span>' +
      '<b class="pi-name">' + name + '</b>' +
      (cls ? '<span class="pi-tag ' + cls + '">' + cls.toUpperCase() + '</span>' : '') +
      '</div>';
  }
  function chips(arr) {
    return '<div class="pi-chips">' + arr.map(function (t) { return '<span class="chip-p">' + t + '</span>'; }).join('') + '</div>';
  }

  function showBlock(key) {
    var d = CORE[key], bus = BAR_TXT[key];
    coreInfo.innerHTML = cardHead(d.tag, d.name, key === 'cpu' ? 'run' : (bus ? bus.toLowerCase() : '')) +
      '<p class="pi-fn">' + d.fn + '</p>' +
      chips(d.links) +
      '<div class="pi-use used"><span class="lb">本课</span><span class="tx">' + d.note + '</span></div>';
  }

  function showBus(key) {
    var d = CORE[key], b = BUS_INFO[key];
    coreInfo.innerHTML = cardHead(d.tag, d.name, key) +
      '<p class="pi-fn">' + d.fn + '</p>' +
      chips([b.bits, b.dir]) +
      '<div class="pi-use used"><span class="lb">本课</span><span class="tx">' + d.note + '</span></div>' +
      '<div class="pi-meta mono">动画在图下重播 &nbsp;·&nbsp; ' + b.full + '</div>';
  }

  /* ---- 点方块 / 点总线 ---- */
  Array.prototype.forEach.call(gBlocks.querySelectorAll('.blk'), function (n) {
    n.addEventListener('click', function () {
      stopFlow();
      Array.prototype.forEach.call(coreSvg.querySelectorAll('.blk.on, .bus.on'), function (x) { x.classList.remove('on'); });
      n.classList.add('on');
      var key = n.getAttribute('data-k');
      seenCore[key] = 1;
      reportCore();
      showBlock(key);
      flowK.textContent = '部件';
      flowT.textContent = '点三条总线，可以看它和别的部件之间怎么传数据。';
      flowReplay.hidden = true;
      coreStage.classList.add('focus-blk');
    });
  });

  Array.prototype.forEach.call(gBars.querySelectorAll('.bus'), function (n) {
    n.addEventListener('click', function () {
      var key = n.getAttribute('data-k');
      Array.prototype.forEach.call(coreSvg.querySelectorAll('.blk.on, .bus.on'), function (x) { x.classList.remove('on'); });
      n.classList.add('on');
      seenCore[key] = 1;
      reportCore();
      showBus(key);
      coreStage.classList.remove('focus-blk');
      playBus(key);
    });
  });

  /* ---------------- 总线传输演示 ----------------
     每段演示按「源部件 → 上总线 → 沿总线走 → 进目标部件」四段走，
     包上带着这一拍传的内容（指令、字节、地址、控制信号），落地时目标方块闪光。
     -------------------------------------------- */
  var SEQ = {
    db: [
      { from: 'rom', to: 'cpu', lb: '指令 02H', cap: '取指：ROM 把指令送上 DB，CPU 读进指令寄存器' },
      { from: 'cpu', to: 'ram', lb: '55H', cap: '写内存：CPU 把 55H 送到 RAM 的 30H 单元' },
      { from: 'ram', to: 'cpu', lb: '55H', cap: '读内存：RAM 把 55H 送回 CPU 的累加器 A' },
      { from: 'cpu', to: 'io', lb: '灯码 05H', cap: '输出：CPU 把 05H 写进 P2 口锁存器，三只灯亮' }
    ],
    ab: [
      { from: 'cpu', to: 'rom', lb: '0000H', cap: '取指地址：0000H 落到 ROM 的第一个单元' },
      { from: 'cpu', to: 'ram', lb: '0030H', cap: '读写内存：0030H 选中 RAM 里的那个字节' },
      { from: 'cpu', to: 'io', lb: 'P2', cap: '选外设：地址选中 P2 口锁存器，别的部件不响应' }
    ],
    cb: [
      { from: 'cpu', to: 'rom', lb: '/PSEN', cap: '读选通：/PSEN 有效，ROM 才把指令放上 DB' },
      { from: 'cpu', to: 'ram', lb: '/WR', cap: '写选通：/WR 有效，RAM 才接收 DB 上的数据' },
      { from: 'cpu', to: 'tcon', lb: 'TR0=1', cap: '启动定时器：置 TR0，T0 开始按机器周期计数' },
      { from: 'cpu', to: 'io', lb: '/WR', cap: '写口线：/WR 与地址同时有效，P2 锁存器随 DB 更新' }
    ]
  };

  var flowToken = 0;
  var flowAnims = [];
  var flowTimer = null;

  function stopFlow() {
    flowToken++;
    if (flowTimer) { clearTimeout(flowTimer); flowTimer = null; }
    flowAnims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    flowAnims = [];
    pkt.setAttribute('opacity', 0);
    trail.setAttribute('opacity', 0);
    Array.prototype.forEach.call(coreSvg.querySelectorAll('.act, .hit'), function (n) {
      n.classList.remove('act', 'hit');
    });
    coreStage.classList.remove('flowing');
    coreStage.removeAttribute('data-focus');
  }

  function setPkt(label) {
    var w = Math.max(48, label.length * 7.4 + 20), h = 21;
    pktRect.setAttribute('x', -w / 2);
    pktRect.setAttribute('y', -h / 2);
    pktRect.setAttribute('width', w);
    pktRect.setAttribute('height', h);
    pktText.setAttribute('y', 4.4);
    pktText.textContent = label;
    return w;
  }

  function pathOf(from, to, bk) {
    var y = BAR[bk], pts = [];
    if (from === 'cpu') {
      pts.push({ x: 176, y: y });
    } else {
      var a = anchor(from, bk);
      pts.push({ x: a.x, y: a.y });
      pts.push({ x: a.x, y: y });
    }
    var b = anchor(to, bk);
    pts.push({ x: b.x, y: y });
    pts.push({ x: b.x, y: b.y });
    return pts.filter(function (p, i, arr) {
      return i === 0 || Math.abs(p.x - arr[i - 1].x) > .6 || Math.abs(p.y - arr[i - 1].y) > .6;
    });
  }

  function runStep(seq, i, bk, token) {
    if (token !== flowToken) return;
    if (i >= seq.length) {
      coreStage.classList.remove('flowing');
      Array.prototype.forEach.call(coreSvg.querySelectorAll('.act, .hit'), function (n) { n.classList.remove('act', 'hit'); });
      pkt.setAttribute('opacity', 0);
      trail.setAttribute('opacity', 0);
      flowT.textContent = '演示结束。再点一次总线，或者点右边「重播演示」可以重看。';
      flowK.textContent = BAR_TXT[bk] + ' 完';
      return;
    }
    var st = seq[i];
    flowK.textContent = BAR_TXT[bk] + ' · ' + (i + 1) + '/' + seq.length;
    flowT.textContent = st.cap;

    var pts = pathOf(st.from, st.to, bk);
    var lens = [], total = 0;
    for (var k = 1; k < pts.length; k++) {
      var d = Math.abs(pts[k].x - pts[k - 1].x) + Math.abs(pts[k].y - pts[k - 1].y);
      lens.push(d); total += d;
    }
    setPkt(st.lb);
    pkt.setAttribute('opacity', 1);

    var src = coreSvg.querySelector('.blk[data-k="' + st.from + '"]');
    var dst = coreSvg.querySelector('.blk[data-k="' + st.to + '"]');
    Array.prototype.forEach.call(coreSvg.querySelectorAll('.act, .hit'), function (n) { n.classList.remove('act', 'hit'); });
    if (src) src.classList.add('act');

    /* 总线那一段拉一条逐渐长出来的亮线，包的位移在时间上跟它对齐 */
    var barSegStart = (st.from === 'cpu') ? 0 : 1;
    var barSegEnd = pts.length - 2;
    var barFrom = pts[barSegStart], barTo = pts[barSegEnd];
    trail.setAttribute('class', 'trail ' + bk);
    if (barSegEnd > barSegStart && Math.abs(barTo.x - barFrom.x) > 2) {
      trail.setAttribute('x1', barFrom.x);
      trail.setAttribute('y1', BAR[bk]);
      trail.setAttribute('x2', barTo.x);
      trail.setAttribute('y2', BAR[bk]);
      trail.setAttribute('opacity', .9);
    } else {
      trail.setAttribute('opacity', 0);
    }

    var dur = 1500;
    var frames = [{ transform: 'translate(' + pts[0].x + 'px,' + pts[0].y + 'px)', offset: 0 }];
    var acc = 0;
    for (var j = 1; j < pts.length; j++) {
      acc += lens[j - 1];
      frames.push({ transform: 'translate(' + pts[j].x + 'px,' + pts[j].y + 'px)', offset: acc / total });
    }
    var pa = pkt.animate(frames, { duration: dur, easing: 'linear', fill: 'forwards' });
    flowAnims.push(pa);

    if (Math.abs(barTo.x - barFrom.x) > 2) {
      var barLen = Math.abs(barTo.x - barFrom.x);
      var barStart = (st.from === 'cpu') ? 0 : lens[0] / total;
      var barEnd = acc === 0 ? 1 : (st.from === 'cpu'
        ? (Math.abs(barTo.x - 200) / total)
        : ((lens[0] + Math.abs(barTo.x - barFrom.x)) / total));
      trail.style.strokeDasharray = barLen + ' ' + barLen;
      var ta = trail.animate(
        [{ strokeDashoffset: barLen, opacity: .2, offset: 0 },
         { strokeDashoffset: barLen, opacity: .9, offset: Math.min(.95, barStart) },
         { strokeDashoffset: 0, opacity: .9, offset: Math.min(1, barEnd) }],
        { duration: dur, easing: 'linear', fill: 'forwards' }
      );
      flowAnims.push(ta);
    }

    pa.onfinish = function () {
      if (token !== flowToken) return;
      pkt.setAttribute('opacity', 0);
      if (src) src.classList.remove('act');
      if (dst) {
        dst.classList.add('act', 'hit');
        setTimeout(function () { if (token === flowToken && dst) dst.classList.remove('hit'); }, 760);
      }
      flowTimer = setTimeout(function () { runStep(seq, i + 1, bk, token); }, 620);
    };
  }

  function playBus(bk) {
    stopFlow();
    var token = flowToken;
    coreStage.classList.remove('focus-blk');
    coreStage.classList.add('flowing');
    coreStage.setAttribute('data-focus', bk);
    flowReplay.hidden = false;
    flowK.textContent = BAR_TXT[bk] + ' · 1/' + SEQ[bk].length;
    flowT.textContent = '准备：' + BAR_FULL[bk];
    flowTimer = setTimeout(function () { runStep(SEQ[bk], 0, bk, token); }, 260);
  }

  flowReplay.addEventListener('click', function () { playBus(coreStage.getAttribute('data-focus') || 'db'); });

  function reportCore() {
    var got = Math.min(Object.keys(seenCore).length, 3);
    document.dispatchEvent(new CustomEvent('lab:progress', { detail: { kind: 'core', got: got, need: 3 } }));
    if (got >= 3 && !coreReady) {
      coreReady = true;
      document.dispatchEvent(new CustomEvent('lab:ready', { detail: { kind: 'core' } }));
    }
  }

  /* ---------------- 标签切换 ---------------- */
  var tabs = document.querySelectorAll('.lab-tab');
  function goTab(key) {
    var t = document.querySelector('.lab-tab[data-tab="' + key + '"]');
    if (t && !t.classList.contains('on')) t.click();
  }

  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener('click', function () {
      var key = t.getAttribute('data-tab');
      Array.prototype.forEach.call(tabs, function (x) { x.classList.toggle('on', x === t); });
      Array.prototype.forEach.call(document.querySelectorAll('.lab-panel'), function (p) {
        p.hidden = p.getAttribute('data-panel') !== key;
      });
      var lab = document.getElementById('lab');
      if (lab) lab.setAttribute('data-active', key);
      if (key !== 'core') stopFlow();
      if (key === 'wire' && window.MinsysWire && window.MinsysWire.refresh) window.MinsysWire.refresh();
    });
  });

  window.MinsysLab = { goTab: goTab };
})();
