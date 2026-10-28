/* ==========================================================
   最小系统大师 · 三段练习
   三段的走法完全一致：
     动手看图 → 点按钮出题 → 三道答对 → 弹小结或思政 → 按钮去下一段
   题目不再自动冒出来，由学生自己按按钮调出来。
   ========================================================== */
(function () {
  'use strict';

  /* 三段是否学过，记在本机；公开课不分人，一台机器一套进度 */
  var DONE_KEY = 'minsys_lab_done';

  /* ---------------- 三段内容 ---------------- */
  var SECTIONS = {
    pin: {
      no: '01',
      label: '认引脚',
      title: '认引脚 · 练习',
      hint: function (got, need) {
        return got >= need ? '四类都点过了，可以做练习' : '把四类引脚各点一次，还差 ' + (need - got) + ' 类';
      },
      questions: [
        {
          q: '40 只引脚按功能分成四类，数量分别是？',
          opts: ['2、4、30、4', '2、3、32、3', '2、3、30、5', '4、4、28、4'],
          a: 1,
          why: '电源线 2 根、运行必备 3 根、应用 I/O 口 32 根、并行扩展必备 3 根，合起来正好 40 根。'
        },
        {
          q: 'EA 引脚接地（低电平），芯片会怎样？',
          opts: ['复位失效，程序无法启动', '时钟停振，CPU 停止工作', '从片外程序存储器取指，片内程序不执行', '进入掉电模式，功耗降到最低'],
          a: 2,
          why: 'EA 是片内/片外取指选择端，接高才从片内 0000H 开始执行。本课必须接 VCC，接错三只灯全不亮。'
        },
        {
          q: 'P3 口的第二功能包括哪些？',
          opts: ['只有普通输入与输出', '地址总线的高 8 位', '电源与复位信号', '串行收发、外部中断、定时器计数、片外读写选通'],
          a: 3,
          why: 'P3.0—P3.7 依次是 RXD、TXD、INT0、INT1、T0、T1、/WR、/RD。做普通 I/O 还是做第二功能，由程序里对该口的设置决定。'
        }
      ],
      pop: {
        kind: 'summary',
        kicker: '项目总结 · 01 认引脚',
        title: '40 只引脚，四类分工',
        rows: [
          ['2 根', '电源线', 'VCC 接 +5V，VSS 接地，其余 38 根都靠这两根供电。'],
          ['3 根', '运行必备', 'XTAL1、XTAL2 外接晶振，RST 接复位支路，缺一根芯片就不跑。'],
          ['32 根', '应用 I/O', 'P0—P3 四个并行口，每口 8 根，是芯片对外的通道。'],
          ['3 根', '并行扩展', '/EA、/PSEN、ALE，本课只接 /EA 到 VCC。']
        ],
        line: '2 + 3 + 32 + 3 = 40。先把功能分清，名字自然记得住。'
      }
    },

    core: {
      no: '02',
      label: '看片内',
      title: '看片内 · 练习',
      hint: function (got, need) {
        return got >= need ? '三个部件看过了，可以做练习' : '点 3 个部件或总线，还差 ' + (need - got) + ' 个';
      },
      questions: [
        {
          q: '4KB 片内 ROM 用来做什么？',
          opts: ['存放运行中的变量与中间结果', '存放程序代码与固定常数', '存放堆栈', '存放端口锁存器的状态'],
          a: 1,
          why: 'ROM 掉电不丢，放程序；变量、堆栈、中间结果都在 128B 的片内 RAM 里，断电即失。'
        },
        {
          q: '三条总线中，哪一条是单向的？',
          opts: ['数据总线 DB', '控制总线 CB', '地址总线 AB', '三条都是双向'],
          a: 2,
          why: '地址由 CPU 单方向指向存储器，16 位；DB 是 8 位双向；CB 有的进有的出，方向不固定。'
        },
        {
          q: '复位后，CPU 从哪个地址取第一条指令？',
          opts: ['0000H', '0003H', '0030H', '0FFFH'],
          a: 0,
          why: '复位后程序计数器清 0，从 0000H 开始。0003H 是外部中断 0 的入口，0030H 常作主程序起始。'
        }
      ],
      pop: {
        kind: 'summary',
        kicker: '项目总结 · 02 看片内',
        title: '八个部件，三条总线',
        rows: [
          ['3 条', '总线', 'AB 16 位单向送地址，DB 8 位双向传数据与指令，CB 逐根传送读写与中断信号。'],
          ['4KB', 'ROM 程序存储器', '占 0000H—0FFFH，断电不丢；复位后从 0000H 取第一条指令。'],
          ['128B', 'RAM 数据存储器', '存变量、堆栈与中间结果，一断电就清空，和 ROM 分工明确。'],
          ['8 个', '部件各司其职', 'CPU、振荡器、ROM、RAM、定时器、I/O 口、串口、中断源，都挂在三条总线上。']
        ],
        line: '看片内不是背名词，是知道程序跑起来的时候，哪个部件在干哪件活。'
      }
    },

    wire: {
      no: '03',
      label: '连线台',
      title: '连线 · 写程序',
      type: 'code',
      hint: function (got, need) {
        return got >= need ? '十八条线接通了，可以写程序了' : '先把线接完再写程序，还差 ' + (need - got) + ' 条';
      },
      code: {
        file: 'test4.c',
        intro: '照着参考程序把空填上：三只灯轮流亮，每只亮 1 秒。',
        steps: [
          {
            title: '给三只灯起名字',
            note: 'sbit 把 P2 口的某一位起个名字。名字起好，写 LED_RED = 0; 就是给这一位写 0。',
            blanks: [
              { ans: ['P2^0'], w: 56, hint: '红灯接在 P2 口第 0 位上。写法是「端口 ^ 位号」，^ 是位寻址符号，不是乘方。', hint2: '按 P2^0 的格式写：端口名大写，位号填 0。' },
              { ans: ['P2^1'], w: 56, hint: '黄灯占第 1 位，把上一行改一个数字。', hint2: '写作 P2^1。' },
              { ans: ['P2^2'], w: 56, hint: '蓝灯占第 2 位，照同样格式写。', hint2: '写作 P2^2。' }
            ],
            lines: [
              ['sbit LED_RED    = ', 0, ';', '   // 红灯接 P2.0'],
              ['sbit LED_YELLOW = ', 1, ';', '   // 黄灯接 P2.1'],
              ['sbit LED_BLUE   = ', 2, ';', '   // 蓝灯接 P2.2'],
              ['']
            ]
          },
          {
            title: '写一个毫秒级延时',
            note: '单片机没有现成的 sleep，用空循环凑时间：内层跑 120 次约 1ms，外层要延时多少毫秒就循环多少次。',
            blanks: [
              { ans: ['unsigned int'], w: 96, hint: '毫秒数最大要到 1000，8 位只到 255，得用 16 位无符号整型，两个词。', hint2: '写作 unsigned int，两个词中间一个空格。' },
              { ans: ['unsigned char'], w: 100, hint: '循环变量只数到 120，8 位无符号整型就够，两个词。', hint2: '写作 unsigned char。' },
              { ans: ['x--'], w: 46, hint: 'while 的条件要「先取 x 的当前值，再减 1」，写后置自减。', hint2: '写作 x--，减号在后。' },
              { ans: ['120'], w: 46, hint: '内层空循环跑多少次？课本取 120 次约合 1ms，填数字。', hint2: '填 120。' }
            ],
            lines: [
              ['void DelayMS(', 0, ' x)', '           // 形参：要延时的毫秒数'],
              ['{'],
              ['    ', 1, ' i;', '              // 循环变量，只数到 120'],
              ['    while(', 2, ')', '            // 每循环一次，剩余毫秒减 1'],
              ['    {'],
              ['        for(i = 0; i < ', 3, '; i++);', '   // 空循环，约 1ms'],
              ['    }'],
              ['}'],
              ['']
            ]
          },
          {
            title: '主循环里让三只灯轮着亮',
            note: '共阳接法：写 0 点亮、写 1 熄灭。三组各停 1 秒，外面套一层死循环，灯就一直转下去。',
            blanks: [
              { ans: ['1'], w: 40, hint: 'while 的条件填一个非零常数，程序就不会退出主循环。', hint2: '填 1。' },
              { ans: ['0'], w: 40, hint: '共阳接法，口线拉低才有电流。红灯这一段末尾是「红灯亮」，该写什么？', hint2: '写 0。' },
              { ans: ['0'], w: 40, hint: '轮到黄灯了，黄灯这一位写 0，另外两位保持 1。', hint2: '写 0。' },
              { ans: ['0'], w: 40, hint: '同一道理，蓝灯这一位写 0。', hint2: '写 0。' }
            ],
            lines: [
              ['void main()'],
              ['{'],
              ['    while(', 0, ')', '                 // 死循环，程序一直跑'],
              ['    {'],
              ['        LED_RED = ', 1, ';  LED_YELLOW = 1;  LED_BLUE = 1;', '   // 红灯亮'],
              ['        DelayMS(1000);'],
              ['        LED_RED = 1;  LED_YELLOW = ', 2, ';  LED_BLUE = 1;', '   // 黄灯亮'],
              ['        DelayMS(1000);'],
              ['        LED_RED = 1;  LED_YELLOW = 1;  LED_BLUE = ', 3, ';', '   // 蓝灯亮'],
              ['        DelayMS(1000);'],
              ['    }'],
              ['}']
            ]
          }
        ]
      },
      pop: {
        kind: 'summary',
        kicker: '项目总结 · 03 连线台',
        title: '18 条线，11 处空',
        rows: [
          ['6 条', '时钟', '晶振两端接 19、18 脚，两只 22pF 电容下端回同一个地。'],
          ['3 条', '电源与取指', '40 脚接 +5V，20 脚接地，/EA 接高电平才从片内取指。'],
          ['9 条', '三色指示', 'P2.0—P2.2 各经 220Ω 接 +5V，口线写 0 点亮。'],
          ['11 空', '程序', 'sbit 起名、延时函数定节拍、主循环里三只灯轮流写 0。']
        ],
        line: '接线决定板子能不能跑，程序决定板子跑成什么样。线少一条、空错一处，灯就不按你想的顺序亮。'
      }
    }
  };

  var ORDER = ['pin', 'core', 'wire'];
  var NEXT = { pin: 'core', core: 'wire', wire: null };
  var NEXT_TEXT = {
    pin: '进入下一段 · 看片内<i>→</i>',
    core: '进入下一段 · 连线台<i>→</i>',
    wire: '三段学完 · 打开结课页<i>→</i>'
  };
  var FINALE = 'finale.html';

  /* ---------------- 进度 ---------------- */
  function loadDone() {
    try {
      var raw = localStorage.getItem(DONE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveDone(d) {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(d)); } catch (e) {}
  }
  var doneMap = loadDone();

  function renderBar() {
    ORDER.forEach(function (k) {
      var seg = document.querySelector('.lab-progress .seg[data-seg="' + k + '"]');
      if (seg) seg.classList.toggle('done', !!doneMap[k]);
    });
    var go = document.getElementById('labGo');
    if (go) {
      var n = ORDER.filter(function (k) { return doneMap[k]; }).length;
      var full = n === ORDER.length;
      go.classList.toggle('done', full);
      go.textContent = full ? '三段已学完 · 打开结课页 →' : '还剩 ' + (ORDER.length - n) + ' 段没练';
    }
  }

  /* 三段都过了，进度条右边那个标签就变成入口 */
  var goBtn = document.getElementById('labGo');
  if (goBtn) {
    goBtn.addEventListener('click', function () {
      if (goBtn.classList.contains('done')) location.href = FINALE;
    });
    goBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && goBtn.classList.contains('done')) location.href = FINALE;
    });
  }

  /* ---------------- 单段状态 ---------------- */
  var state = {};       /* lock / ready / open / passed */
  var prog = {};        /* { got, need } */

  ORDER.forEach(function (k) {
    prog[k] = { got: 0, need: 0 };
    state[k] = doneMap[k] ? 'passed' : 'lock';
  });

  function ctaParts(box) {
    return {
      btn: box.querySelector('[data-act="start"]'),
      hint: box.querySelector('.ct-hint'),
      cta: box.querySelector('.lq-cta')
    };
  }

  function updateCta(box, key) {
    var st = state[key];
    var sec = SECTIONS[key];
    var p = ctaParts(box);
    if (!p.btn) return;

    p.btn.classList.toggle('primary', st === 'ready');
    p.btn.classList.toggle('ghost', st !== 'ready');
    p.btn.classList.toggle('glow', st === 'ready');
    p.btn.hidden = (st === 'open');
    /* 这一段要先接线再写程序：线没接完，按钮不放开 */
    p.btn.disabled = (st === 'lock' && sec.type === 'code');
    p.btn.innerHTML = (st === 'passed') ? '再看一遍总结<i>→</i>' : '完成练习<i>→</i>';

    if (st === 'lock' || st === 'ready') p.hint.textContent = sec.hint(prog[key].got, prog[key].need);
    else if (st === 'open') p.hint.textContent = sec.type === 'code' ? '练习已开始，把空填上，填对了自动跳到下一空' : '练习已开始，选完点「核对答案」';
    else p.hint.textContent = '这一段已经通过，小结可以再看';

    p.hint.classList.toggle('ok', st === 'ready' || st === 'passed');
    box.classList.toggle('passed', st === 'passed');
  }

  /* ---------------- 骨架 ---------------- */
  function build(box, key) {
    var sec = SECTIONS[key];
    prog[key] = { got: 0, need: { pin: 4, core: 3, wire: 18 }[key] };
    box.innerHTML =
      '<div class="lq-cta">' +
        '<span class="ck">CHECK ' + sec.no + '</span>' +
        '<span class="ct"><b>' + sec.title + '</b><em class="ct-hint"></em></span>' +
        '<button type="button" class="btn sm ghost" data-act="start">完成练习<i>→</i></button>' +
      '</div>' +
      '<div class="lq-body" hidden></div>';

    updateCta(box, key);

    box.querySelector('[data-act="start"]').addEventListener('click', function () {
      if (state[key] === 'passed') { showPop(key); return; }
      if (state[key] === 'open') { reveal(box); return; }
      if (sec.type === 'code') { openCode(box, key); return; }
      openQuiz(box, key);
    });
  }

  /* ================= 代码填空 ================= */
  var FULLW = function (s) {
    return s.replace(/[\uFF01-\uFF5E]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    }).replace(/\u3000/g, ' ');
  };
  function norm(s) {
    return FULLW(String(s || '')).replace(/\s+/g, '');
  }
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function hi(s) {
    var out = esc(s), com = '';
    var i = out.indexOf('//');
    if (i >= 0) { com = out.slice(i); out = out.slice(0, i); }
    out = out.replace(/\b(sbit|void|unsigned|int|char|while|for|if)\b/g, '<i class="k">$1</i>');
    out = out.replace(/\b(\d+)\b/g, '<b class="n">$1</b>');
    if (com) out += '<i class="c">' + com + '</i>';
    return out;
  }

  function openCode(box, key) {
    var sec = SECTIONS[key];
    var body = box.querySelector('.lq-body');
    var BL = [];
    var n = 0;
    var lineNo = 0;
    var html = '';

    html += '<div class="cl"><i class="ln">' + (++lineNo) + '</i><span class="cx"><i class="c">/* 三色状态指示 · 80C51 · 12MHz */</i></span></div>';
    html += '<div class="cl"><i class="ln">' + (++lineNo) + '</i><span class="cx">#include &lt;reg51.h&gt;</span></div>';
    html += '<div class="cl"><i class="ln">' + (++lineNo) + '</i><span class="cx"></span></div>';

    sec.code.steps.forEach(function (st, si) {
      var h = '<div class="cstep" data-s="' + si + '"' + (si === 0 ? '' : ' hidden') + '>' +
        '<div class="cstep-h">' +
          '<i class="sn">' + (si + 1) + '</i>' +
          '<b>第 ' + (si + 1) + ' 步 · ' + st.title + '</b>' +
          '<em>' + st.note + '</em>' +
        '</div>';
      st.lines.forEach(function (line) {
        var seg = '';
        line.forEach(function (s) {
          if (typeof s === 'number') {
            var b = st.blanks[s], gi = n++;
            BL.push({ ans: b.ans, hint: b.hint, hint2: b.hint2, step: si, tries: 0, input: null });
            seg += '<input class="cblk" data-b="' + gi + '" style="width:' + b.w + 'px" ' +
              (si === 0 ? '' : 'disabled ') +
              'autocomplete="off" autocorrect="off" spellcheck="false" aria-label="第 ' + (gi + 1) + ' 空">';
          } else {
            seg += hi(s);
          }
        });
        h += '<div class="cl"><i class="ln">' + (++lineNo) + '</i><span class="cx">' + seg + '</span></div>';
      });
      h += '</div>';
      html += h;
    });

    body.innerHTML =
      '<div class="code-wrap">' +
        '<div class="code-bar">' +
          '<span class="cf">' + sec.code.file + '</span>' +
          '<span class="ci">' + sec.code.intro + '</span>' +
          '<span class="cs" data-cs>已填 0 / ' + n + '</span>' +
        '</div>' +
        '<pre class="code">' + html + '</pre>' +
        '<div class="code-foot"><span class="cf-msg" data-msg>从第 1 空开始，填对了自动跳到下一空；填错了会告诉你错在哪。</span></div>' +
      '</div>';

    var msg = body.querySelector('[data-msg]');
    var counter = body.querySelector('[data-cs]');
    var done = 0;

    function say(t, kind) {
      msg.textContent = t;
      msg.className = 'cf-msg ' + (kind || '');
    }

    function pass(b) {
      b.input.readOnly = true;
      b.input.classList.remove('bad');
      b.input.classList.add('ok');
      done++;
      counter.textContent = '已填 ' + done + ' / ' + n;
      counter.classList.toggle('all', done === n);
      say('对了。', 'ok');
      /* 同一段里还有空，就把光标挪到下一个 */
      var sib = Array.prototype.slice.call(body.querySelectorAll('.cstep[data-s="' + b.step + '"] .cblk'));
      var nx0 = sib.filter(function (x) { return !x.classList.contains('ok'); })[0];
      if (nx0) setTimeout(function () { nx0.focus(); }, 170);
      /* 本步是否全部填对 */
      var stepBl = BL.filter(function (x) { return x.step === b.step; });
      if (stepBl.every(function (x) { return x.input.classList.contains('ok'); })) {
        var st = body.querySelector('.cstep[data-s="' + b.step + '"]');
        if (st) st.classList.add('done');
        var next = body.querySelector('.cstep[data-s="' + (b.step + 1) + '"]');
        if (next && next.hidden) {
          next.hidden = false;
          next.classList.add('in');
          Array.prototype.forEach.call(next.querySelectorAll('.cblk'), function (x) { x.disabled = false; });
          say('第 ' + (b.step + 1) + ' 步完成，接着看下一步。', 'ok');
          var first = next.querySelector('.cblk');
          if (first) setTimeout(function () { first.focus(); }, 280);
          return;
        }
        if (done === n) finishCode();
      }
    }

    function fail(b, t) {
      b.input.classList.add('bad');
      setTimeout(function () { b.input.classList.remove('bad'); }, 520);
      say(t, 'bad');
      b.input.focus();
      b.input.select();
    }

    function check(b) {
      var v = norm(b.input.value);
      if (!v) { fail(b, '这一空还没填。' + b.hint); return; }
      var okHit = b.ans.some(function (a) { return norm(a) === v; });
      if (okHit) { pass(b); return; }
      var caseOnly = b.ans.some(function (a) { return norm(a).toLowerCase() === v.toLowerCase(); });
      b.tries++;
      if (caseOnly) {
        fail(b, '拼写对了，大小写不对。C 语言区分大小写：端口名 P2 大写，sbit、while 这些关键字全小写。');
        return;
      }
      fail(b, b.tries >= 2 ? (b.hint2 || b.hint) : b.hint);
    }

    function finishCode() {
      var f = document.createElement('div');
      f.className = 'code-ok';
      f.innerHTML = '<b>编译通过</b><span>0 error · 0 warning</span>' +
        '<em>烧进去，三只灯就按这个顺序转起来了。</em>' +
        '<button type="button" class="btn ghost xs" data-replay>再跑一遍</button>';
      body.querySelector('.code-wrap').appendChild(f);
      say('全部填对。', 'ok');
      state[key] = 'passed';
      doneMap[key] = 1;
      saveDone(doneMap);
      updateCta(box, key);
      renderBar();
      if (window.MinsysWire) {
        if (window.MinsysWire.run) window.MinsysWire.run();
        else if (window.MinsysWire.blink) window.MinsysWire.blink();
      }
      var rp = f.querySelector('[data-replay]');
      if (rp) rp.addEventListener('click', function () {
        if (window.MinsysWire.run) window.MinsysWire.run();
      });
      setTimeout(function () { showPop(key); }, 6600);
    }

    body.querySelectorAll('.cblk').forEach(function (inp) {
      var b = BL[+inp.dataset.b];
      b.input = inp;
      inp.addEventListener('input', function () {
        if (inp.classList.contains('ok')) return;
        var v = norm(inp.value);
        if (v && b.ans.some(function (a) { return norm(a) === v; })) pass(b);
      });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!inp.classList.contains('ok')) check(b);
        }
      });
      inp.addEventListener('blur', function () {
        if (inp.value && !inp.classList.contains('ok')) check(b);
      });
    });

    state[key] = 'open';
    updateCta(box, key);
    body.hidden = false;
    reveal(box);
    setTimeout(function () {
      var f = body.querySelector('.cblk');
      if (f) f.focus();
    }, 260);
  }

  /* ---------------- 出题 ---------------- */
  function openQuiz(box, key, quiet) {
    var sec = SECTIONS[key];
    var body = box.querySelector('.lq-body');
    body.innerHTML =
      sec.questions.map(function (q, i) {
        return '<div class="lq-q" data-i="' + i + '">' +
          '<div class="qt"><i>Q' + (i + 1) + '</i>' + q.q + '</div>' +
          '<div class="lq-opts">' +
            q.opts.map(function (o, j) {
              return '<button type="button" class="lq-opt" data-i="' + i + '" data-j="' + j + '">' +
                '<i class="ol">' + 'ABCD'.charAt(j) + '</i>' +
                '<span class="ot">' + o + '</span>' +
              '</button>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('') +
      '<div class="lq-foot">' +
        '<span class="lq-msg"></span>' +
        '<button type="button" class="btn primary sm" data-act="check">核对答案</button>' +
      '</div>';

    var picked = new Array(sec.questions.length).fill(-1);

    body.querySelectorAll('.lq-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (box.classList.contains('passed')) return;
        var i = +btn.dataset.i;
        picked[i] = +btn.dataset.j;
        body.querySelectorAll('.lq-opt[data-i="' + i + '"]').forEach(function (b) {
          b.classList.toggle('on', b === btn);
          b.classList.remove('right', 'wrong');
        });
      });
    });

    body.querySelector('[data-act="check"]').addEventListener('click', function () {
      if (box.classList.contains('passed')) { showPop(key); return; }
      if (picked.indexOf(-1) >= 0) {
        setMsg(body, '还有题没选，每道都选上再核对。', 'bad');
        return;
      }
      var wrong = [];
      sec.questions.forEach(function (q, i) {
        var opts = body.querySelectorAll('.lq-opt[data-i="' + i + '"]');
        opts.forEach(function (b, j) {
          b.classList.remove('on');
          if (j === q.a) b.classList.add('right');
          else if (j === picked[i]) b.classList.add('wrong');
        });
        if (picked[i] !== q.a) wrong.push(i);
      });

      if (wrong.length) {
        setMsg(body, '第 ' + wrong.map(function (i) { return i + 1; }).join('、') +
          ' 题不对。绿色是正确项，读一读再选一次。', 'bad');
        wrong.forEach(function (i) {
          picked[i] = -1;
          setTimeout(function () {
            body.querySelectorAll('.lq-opt[data-i="' + i + '"]').forEach(function (b) {
              b.classList.remove('right', 'wrong');
            });
          }, 1600);
        });
        return;
      }

      setMsg(body, '全部答对。', 'ok');
      state[key] = 'passed';
      doneMap[key] = 1;
      saveDone(doneMap);
      updateCta(box, key);
      renderBar();
      setTimeout(function () { showPop(key); }, 520);
    });

    state[key] = 'open';
    updateCta(box, key);
    body.hidden = false;
    reveal(box);

    /* 题出来了就把视线带过来：第一题若在屏幕外，滚到答题目板顶端 */
    var first = body.querySelector('.lq-q');
    if (first && !quiet) {
      var r = first.getBoundingClientRect();
      if (r.top > 70 && r.bottom > window.innerHeight - 24) {
        var top = box.getBoundingClientRect().top + window.scrollY - 92;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  }

  function reveal(box) {
    var body = box.querySelector('.lq-body');
    body.classList.remove('in');
    void body.offsetWidth;
    body.classList.add('in');
  }

  function setMsg(body, txt, kind) {
    var m = body.querySelector('.lq-msg');
    if (!m) return;
    m.textContent = txt;
    m.className = 'lq-msg ' + (kind || '');
  }

  /* ---------------- 小结 / 思政弹窗 ---------------- */
  var mask = document.getElementById('szMask');
  var szBox = document.getElementById('szBox');
  var szBody = document.getElementById('szBody');
  var szNext = document.getElementById('szNext');
  var szStay = document.getElementById('szStay');
  var curKey = null;

  function showPop(key) {
    curKey = key;
    var sec = SECTIONS[key];
    var p = sec.pop;

    szBox.setAttribute('data-kind', p.kind);
    document.getElementById('szKicker').textContent = p.kicker;
    document.getElementById('szTitle').textContent = p.title;

    if (p.kind === 'summary') {
      szBody.innerHTML =
        '<ul class="sz-list">' +
          p.rows.map(function (r, i) {
            return '<li style="animation-delay:' + (60 + i * 70) + 'ms">' +
              '<b class="n">' + r[0] + '</b>' +
              '<span class="h">' + r[1] + '</span>' +
              '<span class="d">' + r[2] + '</span>' +
            '</li>';
          }).join('') +
        '</ul>' +
        (p.line ? '<div class="sz-line">' + p.line + '</div>' : '');
    } else {
      szBody.innerHTML =
        p.paras.map(function (t, i) {
          return '<p style="animation-delay:' + (60 + i * 80) + 'ms">' + t + '</p>';
        }).join('') +
        (p.line ? '<div class="sz-line">' + p.line + '</div>' : '');
    }

    document.getElementById('szFrom').textContent = '实验台 ' + sec.no + ' · ' + sec.label;
    szNext.innerHTML = NEXT_TEXT[key];
    szStay.hidden = !NEXT[key];

    /* 每段都是「本段完成」的总结，弹一次盖一次章 */
    var seal = document.getElementById('szSeal');
    if (seal) {
      seal.hidden = p.kind !== 'summary';
      seal.classList.remove('in');
      void seal.offsetWidth;
      seal.classList.add('in');
    }

    mask.classList.add('show');
    mask.setAttribute('aria-hidden', 'false');
    setTimeout(function () { szNext.focus(); }, 260);
  }

  function hidePop() {
    mask.classList.remove('show');
    mask.setAttribute('aria-hidden', 'true');
  }

  szNext.addEventListener('click', function () {
    var nk = curKey ? NEXT[curKey] : null;
    hidePop();
    if (!nk) { location.href = FINALE; return; }
    setTimeout(function () {
      if (window.MinsysLab) window.MinsysLab.goTab(nk);
      var panel = document.querySelector('.lab-panel[data-panel="' + nk + '"]');
      if (panel) {
        var top = panel.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }, 240);
  });

  szStay.addEventListener('click', hidePop);
  mask.addEventListener('click', function (e) { if (e.target === mask) hidePop(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mask.classList.contains('show')) hidePop();
  });

  /* ---------------- 初始化 ---------------- */
  ORDER.forEach(function (key) {
    var box = document.querySelector('.lq[data-quiz="' + key + '"]');
    if (!box) return;
    build(box, key);
    if (state[key] === 'passed') box.classList.add('passed');
  });
  renderBar();

  /* ---------------- 与实验台联动 ---------------- */
  document.addEventListener('lab:progress', function (e) {
    var d = e.detail;
    if (!d || !SECTIONS[d.kind]) return;
    prog[d.kind] = { got: d.got, need: d.need };
    var box = document.querySelector('.lq[data-quiz="' + d.kind + '"]');
    if (!box || state[d.kind] === 'passed' || state[d.kind] === 'open') return;
    state[d.kind] = d.got >= d.need ? 'ready' : 'lock';
    updateCta(box, d.kind);
  });

  document.addEventListener('lab:ready', function (e) {
    var k = e.detail && e.detail.kind;
    if (!k || !SECTIONS[k]) return;
    if (state[k] === 'passed' || state[k] === 'open') return;
    prog[k].got = prog[k].need;
    state[k] = 'ready';
    var box = document.querySelector('.lq[data-quiz="' + k + '"]');
    if (!box) return;
    updateCta(box, k);
    var cta = box.querySelector('.lq-cta');
    cta.classList.remove('flash');
    void cta.offsetWidth;
    cta.classList.add('flash');
    setTimeout(function () { cta.classList.remove('flash'); }, 2000);
  });
})();
