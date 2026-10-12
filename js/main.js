/* =========================================================
   SRI PROPERTIES — Interactions & motion
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const hasGSAP = typeof window.gsap !== "undefined";
  const hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const animate = hasST && !reduceMotion;

  const CFG = window.SITE_CONFIG || { currency: "USD", locale: "en-US" };
  const DATA = window.PROPERTIES || [];

  const money = new Intl.NumberFormat(CFG.locale, { style: "currency", currency: CFG.currency, maximumFractionDigits: 0 });
  const moneyCompact = new Intl.NumberFormat(CFG.locale, { style: "currency", currency: CFG.currency, notation: "compact", maximumFractionDigits: 2 });

  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- storage (safe) ---------------- */
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }
  };

  /* ---------------- toast ---------------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2600);
  }

  /* ---------------- smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasST) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function scrollToEl(target, offset = 0) {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.5 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth" });
  }
  const lockScroll = (on) => {
    if (lenis) on ? lenis.stop() : lenis.start();
    document.documentElement.style.overflow = on ? "hidden" : "";
  };

  /* ---------------- text splitting ---------------- */
  function splitWords(el, makeWord) {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = "";
    let i = 0;
    const walk = (list, parent) => {
      list.forEach((node) => {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) parent.appendChild(document.createTextNode(" "));
            else parent.appendChild(makeWord(tok, i++));
          });
        } else if (node.nodeType === 1) {
          const clone = node.cloneNode(false);
          parent.appendChild(clone);
          walk(Array.from(node.childNodes), clone);
        }
      });
    };
    walk(nodes, el);
    return el;
  }
  const maskWord = (t) => {
    const outer = document.createElement("span");
    outer.className = "split-line";
    outer.style.display = "inline-block";
    const inner = document.createElement("span");
    inner.textContent = t;
    outer.appendChild(inner);
    return outer;
  };

  /* =========================================================
     PRELOADER
     ========================================================= */
  const preloader = $("#preloader");
  document.body.classList.add("is-loading");

  function loadImages(imgs, onProgress) {
    let done = 0;
    return Promise.all(imgs.map((img) => new Promise((res) => {
      const finish = () => { done++; onProgress(done / imgs.length); res(); };
      if (img.complete && img.naturalWidth) return finish();
      img.addEventListener("load", finish, { once: true });
      img.addEventListener("error", finish, { once: true });
      setTimeout(finish, 5000);
    })));
  }

  function runPreloader() {
    const imgs = $$(".hero__slide img");
    const bar = $("#preloaderBar");
    const count = $("#preloaderCount");
    const prog = { v: 0 };
    let target = 0;

    if (!hasGSAP) {
      loadImages(imgs, () => {}).then(() => {
        preloader.remove();
        document.body.classList.remove("is-loading");
      });
      return;
    }

    const tick = gsap.to(prog, { v: 100, duration: 1.8, ease: "none", paused: true,
      onUpdate() { const v = Math.min(prog.v, target); bar.style.width = v + "%"; count.textContent = Math.round(v); } });
    const minTime = new Promise((r) => setTimeout(r, reduceMotion ? 100 : 1100));
    const loaded = loadImages(imgs, (p) => { target = p * 100; });
    tick.play();
    // keep ticking up to target
    const follow = gsap.ticker.add(() => {
      const v = Math.min(prog.v, target);
      bar.style.width = v + "%";
      count.textContent = Math.round(v);
    });

    Promise.all([loaded, minTime]).then(() => {
      target = 100;
      gsap.to(prog, { v: 100, duration: 0.4, onUpdate() { bar.style.width = prog.v + "%"; count.textContent = Math.round(prog.v); } });
      const tl = gsap.timeline({ delay: 0.45, onComplete() {
        gsap.ticker.remove(follow);
        preloader.remove();
        document.body.classList.remove("is-loading");
        if (hasST) ScrollTrigger.refresh();
      } });
      tl.to(".preloader__inner", { opacity: 0, y: -30, duration: 0.6, ease: "power3.in" })
        .to(".preloader__panel--1", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.1")
        .to(".preloader__panel--2", { yPercent: 100, duration: 1.1, ease: "expo.inOut" }, "<")
        .add(heroIntro, "-=0.75");
    });
  }

  /* =========================================================
     HERO
     ========================================================= */
  function heroIntro() {
    hero.start();
    if (!hasGSAP || reduceMotion) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".hero__media", { scale: 1.2, duration: 2.4, ease: "power3.out" }, 0)
      .from(".hero__title .line > span", { yPercent: 115, rotate: 3, duration: 1.5, stagger: 0.12 }, 0.1)
      .from(".hero__eyebrow", { opacity: 0, y: 20, duration: 1 }, 0.3)
      .from(".hero__sub", { opacity: 0, y: 26, duration: 1.2 }, 0.5)
      .from(".search", { opacity: 0, y: 40, duration: 1.3 }, 0.6)
      .from(".hero__bottom > *", { opacity: 0, y: 20, duration: 1, stagger: 0.1 }, 0.8)
      .from(".header__inner > *", { opacity: 0, y: -20, duration: 1, stagger: 0.08 }, 0.4);
  }

  const hero = (() => {
    const slides = $$(".hero__slide");
    const dots = $$("#heroDots button");
    const caption = $("#heroCaption");
    const DURATION = 6500;
    document.documentElement.style.setProperty("--slide-ms", DURATION + "ms");
    let idx = 0, timer = null;

    function go(n) {
      if (n === idx) return;
      const prev = slides[idx];
      slides.forEach((s) => s.classList.remove("is-prev"));
      prev.classList.remove("is-active");
      prev.classList.add("is-prev");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("is-active");
      dots.forEach((d, i) => {
        d.classList.remove("is-active");
        d.setAttribute("aria-selected", i === idx);
      });
      void dots[idx].offsetWidth; // restart progress animation
      dots[idx].classList.add("is-active");
      const text = slides[idx].dataset.caption;
      if (hasGSAP) {
        gsap.to(caption, { opacity: 0, y: -8, duration: 0.3, onComplete() {
          caption.textContent = text;
          gsap.fromTo(caption, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 });
        } });
      } else caption.textContent = text;
    }
    function start() { stop(); timer = setInterval(() => go(idx + 1), DURATION); }
    function stop() { clearInterval(timer); }
    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); start(); }));
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    return { start, stop };
  })();

  /* custom glass dropdowns for the hero search */
  function enhanceSelect(sel, countFor) {
    const field = sel.closest(".search__field");
    field.classList.add("dd");
    sel.classList.add("dd__native");
    sel.tabIndex = -1;
    sel.setAttribute("aria-hidden", "true");
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "dd__btn";
    btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", field.querySelector(".search__label").textContent);
    const list = document.createElement("ul");
    list.className = "dd__list"; list.setAttribute("role", "listbox"); list.hidden = true; list.setAttribute("data-lenis-prevent", "");
    [...sel.options].forEach((o, i) => {
      if (o.dataset.hidden) return;
      const li = document.createElement("li");
      li.setAttribute("role", "option"); li.dataset.value = o.value; li.dataset.i = i;
      const isSvc = o.value.startsWith("svc-");
      const isParent = !!o.dataset.parent;
      const isChild = !!o.dataset.sub;
      if (isSvc) li.classList.add("dd__svc");
      if (isParent) { li.classList.add("dd__parent"); li.setAttribute("aria-expanded", "false"); }
      if (isChild) { li.classList.add("dd__child"); li.dataset.sub = o.dataset.sub; li.hidden = true; li.title = `${o.textContent}: ${o.dataset.desc || ""}`; }
      const n = isSvc || isParent ? -1 : countFor(o.value);
      const side = isParent
        ? `<b>${o.dataset.price}</b><i>${sel.querySelectorAll(`option[data-sub="${o.value}"]`).length} levels</i>`
        : `${o.dataset.price ? `<b>${o.dataset.price}</b>` : ""}<i>${n < 0 ? "View package" : `${n} ${n === 1 ? "listing" : "listings"}`}</i>`;
      li.innerHTML = `<span class="dd__main"><strong>${o.textContent}</strong>${o.dataset.desc ? `<em>${o.dataset.desc}</em>` : ""}</span>
        <span class="dd__side">${side}</span>
        ${isParent ? '<svg class="dd__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' : '<svg class="dd__tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'}`;
      list.appendChild(li);
    });
    field.append(btn, list);
    const items = $$("li[role=option]", list);
    const vis = () => items.filter((li) => !li.hidden);
    let active = 0;
    const sync = () => {
      btn.innerHTML = `<span>${sel.selectedOptions[0].textContent}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
      items.forEach((li) => li.setAttribute("aria-selected", li.dataset.value === sel.value));
    };
    const highlight = (i) => { const v = vis(); active = (i + v.length) % v.length; items.forEach((li) => li.classList.remove("is-hl")); v[active].classList.add("is-hl"); };
    // second, separate panel for Premium's sub-levels (desktop); inline accordion where there is no room (phones)
    const sub = document.createElement("ul");
    sub.className = "dd__sub"; sub.setAttribute("role", "listbox"); sub.hidden = true; sub.setAttribute("data-lenis-prevent", "");
    field.appendChild(sub);
    let flyMode = false;
    const canFly = () => {
      if (window.innerWidth < 900) return false;
      const lr = list.getBoundingClientRect(), w = 270;
      return lr.right + 10 + w <= window.innerWidth - 12 || lr.left - 10 - w >= 12;
    };
    const placeSub = (parentLi) => {
      const fr = field.getBoundingClientRect(), lr = list.getBoundingClientRect(), pr = parentLi.getBoundingClientRect();
      const w = 270, hb = (document.querySelector(".header")?.getBoundingClientRect().bottom || 0) + 8;
      const right = lr.right + 10 + w <= window.innerWidth - 12;
      sub.style.width = w + "px";
      sub.style.left = (right ? lr.right - fr.left + 10 : lr.left - fr.left - 10 - w) + "px";
      const h = sub.offsetHeight;
      const top = Math.max(hb, Math.min(pr.top - 6, window.innerHeight - h - 16));
      sub.style.top = (top - fr.top) + "px"; sub.style.bottom = "auto";
    };
    const toggleSub = (parentLi, force) => {
      const open = force !== undefined ? force : parentLi.getAttribute("aria-expanded") !== "true";
      parentLi.setAttribute("aria-expanded", open);
      fit();
      const kids = items.filter((li) => li.dataset.sub === parentLi.dataset.value);
      if (open) {
        flyMode = canFly();
        parentLi.dataset.fly = flyMode ? "1" : "";
        if (flyMode) {
          kids.forEach((li) => { sub.appendChild(li); li.hidden = false; });
          sub.hidden = false;
          placeSub(parentLi);
          if (hasGSAP && !reduceMotion) gsap.fromTo(sub, { opacity: 0, x: -10, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: "power3.out" });
        } else {
          let ref = parentLi;
          kids.forEach((li) => { ref.after(li); ref = li; li.hidden = false; });
          sub.hidden = true;
          if (hasGSAP && !reduceMotion) kids.forEach((li) => gsap.fromTo(li, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", delay: 0.05 }));
        }
      } else {
        sub.hidden = true;
        kids.forEach((li) => { li.hidden = true; });
        parentLi.dataset.fly = "";
        flyMode = false;
      }
    };
    const fit = () => {
      const hb = (document.querySelector(".header")?.getBoundingClientRect().bottom || 0) + 16;
      const fr = field.getBoundingClientRect();
      const above = fr.top - 16 - hb;
      const below = window.innerHeight - fr.bottom - 24;
      const NEED = 400;
      const down = above < NEED && below > above;
      list.classList.toggle("dd__list--down", down);
      list.style.maxHeight = Math.max(220, Math.min(520, down ? below : above)) + "px";
    };
    const open = () => {
      $$(".dd.is-open").forEach((d) => d !== field && d.ddClose());
      fit();
      field.classList.add("is-open"); list.hidden = false; btn.setAttribute("aria-expanded", "true");
      highlight(Math.max(0, vis().findIndex((li) => li.dataset.value === sel.value)));
      if (hasGSAP && !reduceMotion) gsap.fromTo(list, { opacity: 0, y: list.classList.contains("dd__list--down") ? -12 : 12, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" });
      setTimeout(() => { if (!list.hidden) fit(); }, 500);
    };
    const close = () => {
      field.classList.remove("is-open"); list.hidden = true; btn.setAttribute("aria-expanded", "false");
      const par = items.find((li) => li.classList.contains("dd__parent"));
      if (par && par.getAttribute("aria-expanded") === "true") toggleSub(par, false);
    };
    field.ddClose = close;
    const choose = (li) => {
      if (li.classList.contains("dd__parent")) {
        toggleSub(li); highlight(vis().indexOf(li));
        if (li.getAttribute("aria-expanded") === "true") setTimeout(() => { if (list.scrollHeight > list.clientHeight + 1) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" }); }, 160);
        return;
      }
      const v = li.dataset.value;
      if (v.startsWith("svc-")) {
        btn.querySelector("span").textContent = (li.classList.contains("dd__child") ? "Premium · " : "") + li.querySelector("strong").textContent;
        items.forEach((x) => x.setAttribute("aria-selected", x === li));
        close(); showTier(v.slice(4)); return;
      }
      sel.selectedIndex = +li.dataset.i; sel.dispatchEvent(new Event("change", { bubbles: true })); sync(); close(); btn.focus();
    };
    btn.addEventListener("click", () => (list.hidden ? open() : close()));
    items.forEach((li) => {
      li.addEventListener("click", () => choose(li));
      li.addEventListener("mouseenter", () => highlight(vis().indexOf(li)));
    });
    btn.addEventListener("keydown", (e) => {
      if (list.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); open(); return; }
      if (list.hidden) return;
      const cur = vis()[active];
      if (e.key === "ArrowDown") { e.preventDefault(); highlight(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); highlight(active - 1); }
      else if (e.key === "ArrowRight" && cur && cur.classList.contains("dd__parent")) { e.preventDefault(); toggleSub(cur, true); }
      else if (e.key === "ArrowLeft" && cur && cur.classList.contains("dd__child")) { e.preventDefault(); const p = items.find((x) => x.dataset.value === cur.dataset.sub); toggleSub(p, false); highlight(vis().indexOf(p)); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (cur) choose(cur); }
      else if (e.key === "Escape" || e.key === "Tab") close();
    });
    sel.addEventListener("change", sync);
    sync();
    return { sync };
  }
  function showTier(key) {
    const card = $(`#tier-${key}`);
    if (!card) return;
    scrollToEl(card, -120);
    setTimeout(() => { card.classList.remove("is-flash"); void card.offsetWidth; card.classList.add("is-flash"); }, 900);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".tier__btn");
    if (!b) return;
    const msg = $("#fMsg");
    if (msg) { msg.value = `I'm interested in the ${b.dataset.tier}.`; }
  });
  const priceIn = (v, r) => { if (r === "all") return true; const [a, b] = r.split("-").map(Number); return v >= a && v <= b; };
  const dropdowns = [
    enhanceSelect($("#searchType"), (v) => DATA.filter((p) => v === "all" || p.type === v).length),
    enhanceSelect($("#searchSize"), (v) => DATA.filter((p) => priceIn(p.acres, v)).length),
    enhanceSelect($("#searchBudget"), (v) => DATA.filter((p) => priceIn(p.price, v)).length)
  ];
  document.addEventListener("click", (e) => { if (!e.target.closest(".dd")) $$(".dd.is-open").forEach((d) => d.ddClose()); });

  /* hero search */
  $("#heroSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const type = $("#searchType").value;
    state.search = {
      size: $("#searchSize").value,
      budget: $("#searchBudget").value
    };
    state.filter = type;
    syncChips();
    renderGrid(true);
    scrollToEl($("#properties"), -10);
  });

  /* =========================================================
     HEADER / NAV / MENU
     ========================================================= */
  const header = $("#header");
  const progress = $("#scrollProgress");
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 60);
    if (!document.body.classList.contains("menu-open")) {
      if (y > lastY + 6 && y > 500) header.classList.add("is-hidden");
      else if (y < lastY - 6 || y < 500) header.classList.remove("is-hidden");
    }
    lastY = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // active nav highlight
  const navLinks = $$(".nav__link");
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((l) => { const s = $(l.getAttribute("href")); if (s) sectionIO.observe(s); });

  // mobile menu
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", !open);
    lockScroll(open);
    if (open) header.classList.remove("is-hidden");
  }
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));

  // anchor links
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (href.startsWith("#property-")) return;
    if (a.dataset.filterLink) { state.filter = a.dataset.filterLink; state.search = null; syncChips(); renderGrid(true); }
    e.preventDefault();
    if (document.body.classList.contains("menu-open")) setMenu(false);
    if (href === "#" || href === "#home") return scrollToEl(0);
    const target = $(href);
    if (target) scrollToEl(target);
  });

  /* =========================================================
     CURSOR + MAGNETIC
     ========================================================= */
  if (finePointer && hasGSAP && !reduceMotion) {
    document.documentElement.classList.add("has-cursor");
    const cursor = $("#cursor"), dot = $("#cursorDot"), label = $("#cursorLabel");
    const cx = gsap.quickTo(cursor, "x", { duration: 0.5, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.5, ease: "power3" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.1 });
    const dy = gsap.quickTo(dot, "y", { duration: 0.1 });
    cursor.classList.add("is-idle"); dot.classList.add("is-idle");
    window.addEventListener("mousemove", (e) => {
      cursor.classList.remove("is-idle"); dot.classList.remove("is-idle");
      cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY);
    }, { passive: true });
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      cursor.classList.remove("is-view", "is-link");
      if (t.closest(".card") && !t.closest(".card__fav, .tcg__btn")) { cursor.classList.add("is-view"); label.textContent = t.closest(".card").classList.contains("is-flipped") ? "Back" : "Flip"; }
      else if (t.closest(".land:not(.is-active)")) { cursor.classList.add("is-view"); label.textContent = "Open"; }
      else if (t.closest("a, button, select, input[type=range], label.check, summary")) cursor.classList.add("is-link");
    });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));

    $$(".magnetic").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3" });
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  /* =========================================================
     PROPERTIES — dynamic grid
     ========================================================= */
  const state = {
    filter: "farmland",
    sort: "featured",
    search: null,
    saved: new Set(store.get("va-saved", []))
  };
  const grid = $("#propertyGrid");
  const emptyState = $("#emptyState");
  const resultCount = $("#resultCount");
  const activeSearch = $("#activeSearch");
  const chips = $$("#filterChips .chip");
  const savedCount = $("#savedCount");
  const savedBtn = $("#savedBtn");

  const ICON = {
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    area: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 3c3.5 4 6 7.3 6 10.5a6 6 0 0 1-12 0C6 10.3 8.5 7 12 3z"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.4C1.2 8.3 3.4 5 6.8 5c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.4 0 5.6 3.3 4.3 6.6C19.5 16.4 12 21 12 21z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  const inRange = (val, range) => {
    if (!range || range === "all") return true;
    const [min, max] = range.split("-").map(Number);
    return val >= min && val <= max;
  };

  function getList() {
    let list = DATA.slice();
    if (state.filter === "saved") list = list.filter((p) => state.saved.has(p.id));
    else if (state.filter !== "all") list = list.filter((p) => p.type === state.filter);
    if (state.search) {
      list = list.filter((p) => inRange(p.acres, state.search.size) && inRange(p.price, state.search.budget));
    }
    const sorters = {
      featured: (a, b) => a.featured - b.featured,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "size-desc": (a, b) => b.acres - a.acres
    };
    return list.sort(sorters[state.sort] || sorters.featured);
  }

  const MAX = {
    acres: Math.max(...DATA.map((x) => x.acres)),
    price: Math.max(...DATA.map((x) => x.price)),
    ppa: Math.max(...DATA.map((x) => x.price / x.acres))
  };
  const rarityOf = (price) => (price >= 2000000 ? "legendary" : price >= 600000 ? "epic" : "rare");
  const pct = (v, m) => Math.max(8, Math.round((v / m) * 100));
  function cardHTML(p, i) {
    const saved = state.saved.has(p.id);
    const factKey = Object.keys(p.facts)[0];
    const rarity = rarityOf(p.price);
    const ppa = p.price / p.acres;
    return `
      <article class="card tcg r-${rarity}" data-id="${p.id}" style="--i:${i}" tabindex="0" aria-label="${p.title}, ${moneyCompact.format(p.price)}. Press Enter to flip.">
        <div class="tcg__float">
          <div class="tcg__inner">
            <div class="tcg__face tcg__front">
              <div class="tcg__top">
                <span class="tcg__rarity">${rarity}</span>
                <button class="card__fav${saved ? " is-saved" : ""}" aria-pressed="${saved}" aria-label="${saved ? "Remove from saved" : "Save property"}">${ICON.heart}</button>
              </div>
              <div class="tcg__art"><img src="${p.image}" alt="${p.title}, ${p.location}" loading="lazy" style="object-position:${p.focus || "50% 50%"}" /><span class="tcg__tag">${p.tag}</span></div>
              <div class="tcg__name">
                <h3 class="card__title"><a href="#property-${p.id}">${p.title}</a></h3>
                <span>${p.location} · ${p.typeLabel}</span>
              </div>
              <div class="tcg__foot">
                <strong class="tcg__price">${moneyCompact.format(p.price)}</strong>
                <span class="tcg__gem"><b>${p.acres}</b>ac</span>
              </div>
              <span class="tcg__hint">Tap to flip ↻</span>
              <span class="tcg__holo" aria-hidden="true"></span>
              <span class="tcg__glare" aria-hidden="true"></span>
            </div>
            <div class="tcg__face tcg__back">
              <img class="tcg__emblem" src="assets/img/logo-icon.png" alt="" />
              <span class="tcg__rarity">${rarity}</span>
              <h4>${p.title}</h4>
              <div class="tcg__stats">
                <div class="tcg__stat"><span>Size</span><i style="--v:${pct(p.acres, MAX.acres)}%"></i><b>${p.acres} ac</b></div>
                <div class="tcg__stat"><span>Value</span><i style="--v:${pct(p.price, MAX.price)}%"></i><b>${moneyCompact.format(p.price)}</b></div>
                <div class="tcg__stat"><span>Per acre</span><i style="--v:${pct(ppa, MAX.ppa)}%"></i><b>${moneyCompact.format(ppa)}</b></div>
              </div>
              <p class="tcg__fact"><span>${factKey}</span>${p.facts[factKey]}</p>
              <button class="tcg__btn" data-action="details">View details ${ICON.arrow}</button>
              <span class="tcg__hint">Tap to flip back ↺</span>
            </div>
          </div>
        </div>
      </article>`;
  }

  let firstRender = true;
  let refreshTimer;
  function renderGrid(animateIn = false) {
    const list = getList();
    const useWide = false; // uniform luxury grid
    grid.innerHTML = list.map((p, i) => cardHTML(p, i)).join("");
    emptyState.hidden = list.length > 0;
    resultCount.textContent = `${list.length} ${list.length === 1 ? "property" : "properties"}`;

    // active search pills
    if (state.search && (state.search.size !== "all" || state.search.budget !== "all")) {
      const pills = [];
      const sizeTxt = $("#searchSize").selectedOptions[0]?.textContent;
      const budTxt = $("#searchBudget").selectedOptions[0]?.textContent;
      if (state.search.size !== "all") pills.push(`<span class="pill">${sizeTxt}</span>`);
      if (state.search.budget !== "all") pills.push(`<span class="pill">${budTxt}</span>`);
      activeSearch.innerHTML = `Showing results for ${pills.join("")} <button type="button" id="clearSearch">Clear</button>`;
      activeSearch.hidden = false;
    } else {
      activeSearch.hidden = true;
      activeSearch.innerHTML = "";
    }

    const cards = $$(".card", grid);
    if (animate) {
      if (firstRender) {
        gsap.set(cards, { opacity: 0, y: 220, scale: 0.6, rotation: () => gsap.utils.random(-28, 28) });
        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1.1, ease: "back.out(1.6)", stagger: 0.11 })
        });
      } else if (animateIn) {
        gsap.fromTo(cards, { opacity: 0, y: 160, scale: 0.6, rotation: () => gsap.utils.random(-24, 24) }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.95, ease: "back.out(1.6)", stagger: 0.08 });
      }
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    }
    firstRender = false;
    bindTilt(cards);
  }

  function syncChips() {
    chips.forEach((c) => {
      const on = c.dataset.filter === state.filter;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on);
    });
  }

  chips.forEach((c) => c.addEventListener("click", () => {
    state.filter = c.dataset.filter;
    syncChips();
    renderGrid(true);
  }));
  $("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(true); });
  $("#resetFilters").addEventListener("click", resetFilters);
  activeSearch.addEventListener("click", (e) => { if (e.target.id === "clearSearch") resetFilters(); });
  function resetFilters() {
    state.filter = "farmland"; state.search = null; state.sort = "featured";
    $("#sortSelect").value = "featured";
    $("#searchType").value = "farmland"; $("#searchSize").value = "all"; $("#searchBudget").value = "all"; dropdowns.forEach((d) => d.sync());
    syncChips(); renderGrid(true);
  }

  savedBtn.addEventListener("click", () => {
    state.filter = "saved"; state.search = null; syncChips(); renderGrid(true);
    scrollToEl($("#properties"));
  });

  function toggleSave(id) {
    const p = DATA.find((x) => x.id === id);
    if (state.saved.has(id)) { state.saved.delete(id); toast(`Removed “${p.title}” from saved`); }
    else { state.saved.add(id); toast(`Saved “${p.title}” ♥`); }
    store.set("va-saved", Array.from(state.saved));
    updateSavedCount(true);
    $$(`.card[data-id="${id}"] .card__fav`).forEach((b) => {
      const s = state.saved.has(id);
      b.classList.toggle("is-saved", s);
      b.setAttribute("aria-pressed", s);
      b.setAttribute("aria-label", s ? "Remove from saved" : "Save property");
      b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
    });
    if (drawerId === id) syncDrawerSave();
    if (state.filter === "saved") renderGrid(false);
  }
  function updateSavedCount(bump) {
    savedCount.textContent = state.saved.size;
    savedCount.classList.toggle("has-items", state.saved.size > 0);
    if (bump) { savedBtn.classList.remove("bump"); void savedBtn.offsetWidth; savedBtn.classList.add("bump"); }
  }

  function flipCard(card) {
    const on = !card.classList.contains("is-flipped");
    $$(".card.is-flipped", grid).forEach((c) => c !== card && c.classList.remove("is-flipped"));
    card.classList.toggle("is-flipped", on);
  }
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    if (e.target.closest(".card__fav")) return toggleSave(card.dataset.id);
    if (e.target.closest('[data-action="details"]')) return openDrawer(card.dataset.id, true);
    flipCard(card);
  });
  grid.addEventListener("keydown", (e) => {
    const card = e.target.closest(".card");
    if (!card || e.target !== card) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipCard(card); }
  });

  function bindTilt(cards) {
    if (!finePointer || !hasGSAP || reduceMotion) return;
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
        gsap.to(card, { rotateY: (px - 0.5) * 22, rotateX: -(py - 0.5) * 22, scale: 1.04, transformPerspective: 900, duration: 0.5, ease: "power3" });
      });
      card.addEventListener("mouseleave", () => gsap.to(card, { rotateY: 0, rotateX: 0, scale: 1, duration: 1.1, ease: "elastic.out(1,0.45)" }));
    });
  }

  /* =========================================================
     DRAWER (property details) — deep-linkable via #property/<id>
     ========================================================= */
  const drawer = $("#drawer");
  let drawerId = null;
  let lastFocus = null;

  function openDrawer(id, push) {
    const p = DATA.find((x) => x.id === id);
    if (!p) return;
    drawerId = id;
    lastFocus = document.activeElement;
    $("#dType").textContent = p.typeLabel;
    $("#dTitle").textContent = p.title;
    $("#dLoc").textContent = `${p.location} · ${p.acres} acres`;
    $("#dPrice").textContent = money.format(p.price);
    $("#dPerAcre").textContent = `≈ ${money.format(Math.round(p.price / p.acres))} per acre`;
    $("#dDesc").textContent = p.description;
    $("#dFacts").innerHTML = [["Size", `${p.acres} acres`], ...Object.entries(p.facts)]
      .map(([k, v]) => `<div class="fact"><span>${k}</span><strong>${v}</strong></div>`).join("");
    $("#dAmen").innerHTML = p.amenities.map((a) => `<li>${a}</li>`).join("");

    const main = $("#dMainImg");
    const setMain = (src, i) => {
      main.src = src;
      main.alt = `${p.title} — photo ${i + 1}`;
      main.style.objectPosition = i === 0 ? p.focus || "50% 50%" : "50% 50%";
      main.classList.remove("is-swap"); void main.offsetWidth; main.classList.add("is-swap");
      $$("#dThumbs button").forEach((b, j) => b.classList.toggle("is-active", j === i));
    };
    $("#dThumbs").innerHTML = p.gallery.map((src, i) =>
      `<button type="button" aria-label="Show photo ${i + 1}"><img src="${src}" alt="" style="object-position:${i === 0 ? p.focus : "50% 50%"}" /></button>`).join("");
    $$("#dThumbs button").forEach((b, i) => b.addEventListener("click", () => setMain(p.gallery[i], i)));
    setMain(p.gallery[0], 0);
    syncDrawerSave();

    $("#drawerScroll").scrollTop = 0;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    lockScroll(true);
    if (push) { try { history.pushState({ property: id }, "", `#property-${id}`); } catch { /* sandboxed */ } }
    setTimeout(() => $(".drawer__close").focus({ preventScroll: true }), 400);
  }
  function closeDrawer(fromHistory) {
    if (!drawerId) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    drawerId = null;
    lockScroll(false);
    if (!fromHistory && location.hash.startsWith("#property-")) { try { history.replaceState(null, "", location.pathname + location.search); } catch { /* sandboxed */ } }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function syncDrawerSave() {
    const s = state.saved.has(drawerId);
    const b = $("#dSave");
    b.classList.toggle("is-saved", s);
    b.querySelector("span").textContent = s ? "Saved" : "Save";
  }
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeDrawer(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (drawerId) closeDrawer();
      else if (document.body.classList.contains("menu-open")) setMenu(false);
    }
    // focus trap in drawer
    if (e.key === "Tab" && drawerId) {
      const f = $$("button, a[href], [tabindex]:not([tabindex='-1'])", $(".drawer__panel")).filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $("#dSave").addEventListener("click", () => toggleSave(drawerId));
  $("#dShare").addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#property-${drawerId}`;
    try { await navigator.clipboard.writeText(url); toast("Link copied to clipboard"); }
    catch { toast(url); }
  });
  $("#dBook").addEventListener("click", () => {
    const id = drawerId;
    closeDrawer();
    const sel = $("#fProperty");
    sel.value = DATA.find((p) => p.id === id)?.title || "";
    sel.classList.toggle("has-value", !!sel.value);
    setTimeout(() => scrollToEl($("#contact")), 350);
  });
  function routeFromHash(fromHistory) {
    const m = location.hash.match(/^#property-(.+)$/);
    if (m) openDrawer(decodeURIComponent(m[1]), false);
    else if (drawerId) closeDrawer(fromHistory);
  }
  window.addEventListener("popstate", () => routeFromHash(true));

  /* =========================================================
     SCROLL ANIMATIONS
     ========================================================= */
  function initScrollAnimations() {
    if (!animate) {
      // still animate counters to final values instantly
      $$(".counter").forEach((c) => (c.textContent = Number(c.dataset.to).toLocaleString(CFG.locale)));
      $$(".step").forEach((s) => s.classList.add("is-on"));
      $$("#aboutStatement").forEach((el) => el.classList.add("no-anim"));
      return;
    }

    // split headings
    $$("[data-split]").forEach((el) => {
      splitWords(el, maskWord);
      gsap.from($$(".split-line > span", el), {
        yPercent: 110, rotate: 4, duration: 1.3, ease: "expo.out", stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    // generic reveals
    gsap.set("[data-reveal]", { opacity: 0, y: 44 });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%", once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.09 })
    });

    // image clip reveals
    $$(".reveal-img").forEach((fig) => {
      gsap.fromTo(fig, { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut",
        scrollTrigger: { trigger: fig, start: "top 85%" }
      });
      const img = $("img", fig);
      gsap.from(img, { scale: 1.3, duration: 2, ease: "expo.out", scrollTrigger: { trigger: fig, start: "top 85%" } });
    });

    // parallax
    $$("[data-speed]").forEach((el) => {
      const s = parseFloat(el.dataset.speed);
      gsap.fromTo(el, { yPercent: -s * 100 }, {
        yPercent: s * 100, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // hero parallax-out
    gsap.to(".hero__media", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__content", { yPercent: -12, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });

    // about — word-by-word fill
    const stmt = $("#aboutStatement");
    if (stmt) {
      splitWords(stmt, (t) => { const s = document.createElement("span"); s.className = "w"; s.textContent = t; return s; });
      const words = $$(".w", stmt);
      ScrollTrigger.create({
        trigger: stmt, start: "top 80%", end: "bottom 45%", scrub: true,
        onUpdate(self) {
          const n = Math.round(self.progress * words.length);
          words.forEach((w, i) => w.classList.toggle("is-on", i < n));
        }
      });
    }

    // about highlights — stagger in
    gsap.from(".about__points li", { opacity: 0, y: 24, duration: 0.9, ease: "expo.out", stagger: 0.1,
      scrollTrigger: { trigger: ".about__points", start: "top 88%" } });

    // counters
    $$(".counter").forEach((c) => {
      const to = Number(c.dataset.to);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 2.4, ease: "power3.out",
        scrollTrigger: { trigger: c, start: "top 90%", once: true },
        onUpdate() { c.textContent = Math.round(o.v).toLocaleString(CFG.locale); }
      });
    });

    // marquee speed reacts to scroll velocity
    const track = $(".marquee__track");
    let skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
    ScrollTrigger.create({ onUpdate: (self) => skewTo(gsap.utils.clamp(-8, 8, self.getVelocity() / -300)) });

    // process steps
    gsap.fromTo("#stepsLine", { scaleY: 0 }, { scaleY: 1, ease: "none",
      scrollTrigger: { trigger: "#steps", start: "top 60%", end: "bottom 65%", scrub: true } });
    $$(".step").forEach((s) => ScrollTrigger.create({
      trigger: s, start: "top 62%", onEnter: () => s.classList.add("is-on"), onLeaveBack: () => s.classList.remove("is-on")
    }));
    gsap.from(".step", { opacity: 0, x: 40, duration: 1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: "#steps", start: "top 75%" } });

    // feature cards — subtle stagger is handled by [data-reveal]

    // footer giant text
    gsap.from(".wm-art", { yPercent: 40, opacity: 0, scale: 0.94, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".wm-art", start: "top 95%" } });
    gsap.from(".fcta", { y: 50, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".fcta", start: "top 92%" } });

    const mm = gsap.matchMedia();

    // aerial expanding video
    mm.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)" }, (ctx) => {
      const from = ctx.conditions.desktop ? "inset(10% 14% 10% 14% round 28px)" : "inset(6% 4% 6% 4% round 22px)";
      const tl = gsap.timeline({
        scrollTrigger: { trigger: "#aerialStage", start: "top top", end: "+=70%", pin: true, scrub: 1, anticipatePin: 1, refreshPriority: 5 }
      });
      tl.fromTo("#aerialFrame", { clipPath: from }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut" }, 0)
        .fromTo("#aerialVideo", { scale: 1.12 }, { scale: 1, ease: "power2.inOut" }, 0)
        .from(".aerial__copy > *", { opacity: 0, y: 40, stagger: 0.1, ease: "power2.out", duration: 0.4 }, 0.45)
        .from(".aerial__play", { scale: 0, rotate: -90, ease: "back.out(2)", duration: 0.4 }, 0.5);
    });

    // pinned sections are created last but carry a higher refreshPriority,
    // so they're measured first (top → bottom) and everything else after.
    ScrollTrigger.refresh();
  }

  /* =========================================================
     LIFESTYLE — expanding gallery
     ========================================================= */
  $$(".land__count").forEach((el) => {
    const list = DATA.filter((p) => p.type === el.dataset.count);
    if (!list.length) { el.remove(); return; }
    const from = Math.min(...list.map((p) => p.price));
    el.textContent = `${list.length} ${list.length === 1 ? "listing" : "listings"} · from ${moneyCompact.format(from)}`;
  });
  const lands = $$(".land");
  let landIdx = 0, landTimer = null, landPaused = false;
  function openLand(i) {
    landIdx = (i + lands.length) % lands.length;
    lands.forEach((l, j) => {
      const on = j === landIdx;
      l.classList.toggle("is-active", on);
      l.setAttribute("aria-expanded", on);
    });
  }
  function landAuto() {
    clearInterval(landTimer);
    if (reduceMotion) return;
    landTimer = setInterval(() => { if (!landPaused && !document.hidden) openLand(landIdx + 1); }, 5000);
  }
  lands.forEach((l, i) => {
    if (finePointer) l.addEventListener("mouseenter", () => { openLand(i); });
    l.addEventListener("click", (e) => { if (!l.classList.contains("is-active")) { e.preventDefault(); openLand(i); landAuto(); } });
    l.addEventListener("focusin", () => openLand(i));
    l.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); lands[(i + 1) % lands.length].focus(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); lands[(i - 1 + lands.length) % lands.length].focus(); }
    });
  });
  const landsRow = $("#landsRow");
  if (landsRow) {
    landsRow.addEventListener("mouseenter", () => (landPaused = true));
    landsRow.addEventListener("mouseleave", () => (landPaused = false));
    landAuto();
  }
  /* =========================================================
     AERIAL VIDEO controls
     ========================================================= */
  const video = $("#aerialVideo");
  const playBtn = $("#aerialPlay");
  let userPaused = false;
  const setPlayUI = () => {
    const paused = video.paused;
    playBtn.classList.toggle("is-paused", paused);
    playBtn.setAttribute("aria-label", paused ? "Play video" : "Pause video");
  };
  video.addEventListener("play", setPlayUI);
  video.addEventListener("pause", setPlayUI);
  playBtn.addEventListener("click", () => {
    if (video.paused) { userPaused = false; video.play().catch(() => {}); }
    else { userPaused = true; video.pause(); }
  });
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !userPaused && !reduceMotion) video.play().catch(() => {});
    else if (!en.isIntersecting) video.pause();
  }, { threshold: 0.25 }).observe(video);
  $$(".aerial__switch button").forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-active")) return;
    $$(".aerial__switch button").forEach((x) => x.classList.toggle("is-active", x === b));
    const swap = () => {
      video.poster = b.dataset.poster;
      video.src = b.dataset.src;
      if (!userPaused) video.play().catch(() => {});
      if (hasGSAP) gsap.to(video, { opacity: 1, duration: 0.6 });
    };
    if (hasGSAP) gsap.to(video, { opacity: 0, duration: 0.35, onComplete: swap }); else swap();
  }));

  /* =========================================================
     FEATURES spotlight
     ========================================================= */
  $$(".feature").forEach((f) => f.addEventListener("pointermove", (e) => {
    const r = f.getBoundingClientRect();
    f.style.setProperty("--mx", `${e.clientX - r.left}px`);
    f.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  /* =========================================================
     TESTIMONIALS
     ========================================================= */
  const quotes = $$(".quote");
  quotes.forEach((q) => splitWords($("blockquote", q), (t, i) => {
    const s = document.createElement("span");
    s.className = "qw"; s.textContent = t; s.style.transitionDelay = `${i * 28}ms`;
    return s;
  }));
  let qi = 0, qTimer;
  function showQuote(n) {
    quotes[qi].classList.remove("is-active");
    qi = (n + quotes.length) % quotes.length;
    quotes[qi].classList.add("is-active");
    $("#quoteIdx").textContent = String(qi + 1).padStart(2, "0");
  }
  const qAuto = () => { clearInterval(qTimer); qTimer = setInterval(() => showQuote(qi + 1), 7000); };
  $("#quotePrev").addEventListener("click", () => { showQuote(qi - 1); qAuto(); });
  $("#quoteNext").addEventListener("click", () => { showQuote(qi + 1); qAuto(); });
  qAuto();

  /* =========================================================
     FAQ — smooth accordion
     ========================================================= */
  const accs = $$(".acc");
  accs.forEach((d) => {
    const summary = $("summary", d);
    const body = $(".acc__body", d);
    summary.addEventListener("click", (e) => {
      if (!hasGSAP || reduceMotion) return;
      e.preventDefault();
      const closeIt = (el) => {
        const b = $(".acc__body", el);
        gsap.fromTo(b, { height: b.offsetHeight }, { height: 0, duration: 0.5, ease: "power3.inOut",
          onComplete() { el.open = false; gsap.set(b, { clearProps: "height" }); if (hasST) ScrollTrigger.refresh(); } });
      };
      if (d.open) closeIt(d);
      else {
        accs.forEach((o) => { if (o !== d && o.open) closeIt(o); });
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: 0.6, ease: "power3.out",
          onComplete() { gsap.set(body, { clearProps: "height" }); if (hasST) ScrollTrigger.refresh(); } });
      }
    });
  });

  // FAQ live search
  const faqSearch = $("#faqSearch");
  if (faqSearch) {
    const items = $$(".acc");
    const count = $("#faqCount"), none = $("#faqNone");
    faqSearch.addEventListener("input", () => {
      const q = faqSearch.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((d) => {
        const hit = !q || d.textContent.toLowerCase().includes(q);
        d.hidden = !hit;
        if (hit) shown++;
      });
      count.textContent = `${shown} ${shown === 1 ? "question" : "questions"}`;
      none.hidden = shown > 0;
      if (hasST) ScrollTrigger.refresh();
    });
  }

  /* =========================================================
     BOOKING FORM
     ========================================================= */
  const form = $("#visitForm");
  const fProperty = $("#fProperty");
  DATA.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.title; o.textContent = `${p.title} — ${p.location}`;
    fProperty.insertBefore(o, fProperty.lastElementChild);
  });
  fProperty.addEventListener("change", () => fProperty.classList.toggle("has-value", !!fProperty.value));
  const tomorrow = new Date(Date.now() + 864e5);
  const isoDay = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  $("#fDate").min = isoDay(tomorrow);

  const validators = {
    fName: (v) => v.trim().length >= 2,
    fPhone: (v) => /^[0-9+()\-\s]{7,}$/.test(v.trim()),
    fEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    fProperty: (v) => !!v,
    fDate: (v) => !!v && v >= isoDay(tomorrow)
  };
  Object.keys(validators).forEach((id) => {
    const el = $("#" + id);
    const ev = el.tagName === "SELECT" || el.type === "date" ? "change" : "input";
    el.addEventListener(ev, () => { if (validators[id](el.value)) el.closest(".field").classList.remove("is-invalid"); });
  });
  $("#fConsent").addEventListener("change", (e) => e.target.closest(".check").classList.toggle("is-invalid", !e.target.checked));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstBad = null;
    Object.entries(validators).forEach(([id, fn]) => {
      const el = $("#" + id);
      const field = el.closest(".field");
      const ok = fn(el.value);
      field.classList.remove("is-invalid");
      if (!ok) { void field.offsetWidth; field.classList.add("is-invalid"); firstBad = firstBad || el; }
    });
    const consent = $("#fConsent");
    consent.closest(".check").classList.toggle("is-invalid", !consent.checked);
    if (!consent.checked) firstBad = firstBad || consent;
    if (firstBad) { firstBad.focus({ preventScroll: true }); return; }

    const btn = $(".form__submit", form);
    btn.classList.add("is-loading");
    btn.disabled = true;
    const payload = Object.fromEntries(new FormData(form).entries());

    /* ------------------------------------------------------
       Connect your backend / CRM here, e.g.:
       fetch("/api/site-visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
       ------------------------------------------------------ */
    setTimeout(() => {
      btn.classList.remove("is-loading");
      btn.disabled = false;
      const first = payload.name.trim().split(" ")[0];
      const date = new Date(payload.date + "T00:00:00").toLocaleDateString(CFG.locale, { weekday: "long", month: "long", day: "numeric" });
      const prop = payload.property === "Not sure yet" ? "a property that suits you" : payload.property;
      $("#successMsg").textContent = `Thanks, ${first}! We've pencilled in a visit to ${prop} on ${date}. A land advisor will call you within one business day to confirm.`;
      $(".form__body", form).hidden = true;
      $("#formSuccess").hidden = false;
      if (hasGSAP) gsap.from("#formSuccess > *", { opacity: 0, y: 20, stagger: 0.08, duration: 0.8, ease: "expo.out" });
    }, 1100);
  });
  $("#formAgain").addEventListener("click", () => {
    form.reset();
    fProperty.classList.remove("has-value");
    $("#formSuccess").hidden = true;
    $(".form__body", form).hidden = false;
  });

  // newsletter
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", e.target);
    const msg = $("#newsMsg");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) { msg.textContent = "Please enter a valid email."; return; }
    msg.textContent = "You're on the list — new listings land in your inbox first.";
    input.value = "";
  });

  $("#year").textContent = new Date().getFullYear();
  const wm = $("#wmArt");
  if (wm && finePointer) {
    wm.addEventListener("pointermove", (e) => {
      const r = wm.getBoundingClientRect();
      wm.classList.add("is-tracking");
      wm.style.setProperty("--wx", `${((e.clientX - r.left) / r.width) * 100}%`);
      wm.style.setProperty("--wy", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    wm.addEventListener("pointerleave", () => wm.classList.remove("is-tracking"));
  }

  /* =========================================================
     BOOT
     ========================================================= */
  updateSavedCount(false);
  renderGrid(false);
  initScrollAnimations();
  runPreloader();
  routeFromHash(false);

  let rw = window.innerWidth;
  window.addEventListener("resize", () => {
    // re-render when crossing the mobile breakpoint (wide card layout)
    if ((rw > 640) !== (window.innerWidth > 640)) renderGrid(false);
    rw = window.innerWidth;
  });
})();
