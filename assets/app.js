/* PetCare — comportamiento del prototipo (maquetación navegable).
   Depende de icons.js y data.js. Cada pantalla declara <body data-page="...">. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const params = new URLSearchParams(location.search);
  const ic = (n, cls = "icon") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Number(n).toLocaleString("es-CO");
  const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const parse = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmtDate = (iso) => { const d = parse(iso); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
  const dur = (m) => (m >= 1440 ? "1 noche" : m >= 120 ? Math.round(m / 60) + " h" : m + " min");
  const STATUS = {
    pendiente: { cls: "badge-pending", label: "Pendiente", icon: "clock" },
    aceptada: { cls: "badge-accepted", label: "Aceptada", icon: "check" },
    rechazada: { cls: "badge-rejected", label: "Rechazada", icon: "x" },
  };
  const badge = (st) => { const s = STATUS[st]; return `<span class="badge ${s.cls}">${ic(s.icon)}${s.label}</span>`; };
  const typeBadge = (t) => `<span class="badge badge-cat">${ic(PC.TYPES[t].icon)}${PC.TYPES[t].label}</span>`;
  window.PCUI = { ic, money, fmtDate, badge };

  /* ---------- Modo wireframe: conserva ?wf=1 al navegar ---------- */
  if (params.get("wf")) {
    $$("a[href]").forEach((a) => {
      const h = a.getAttribute("href");
      if (h && h.endsWith(".html") || /\.html\?/.test(h || "")) a.setAttribute("href", h + (h.includes("?") ? "&" : "?") + "wf=1");
    });
    const tag = document.createElement("div"); tag.className = "wf-label"; tag.textContent = "WIREFRAME"; document.body.appendChild(tag);
  }

  /* ---------- Toast y modales ---------- */
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.innerHTML = ic("check") + esc(msg); t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2800);
  }
  let lastFocus = null;
  function openModal(id) { const m = document.getElementById(id); if (!m) return; lastFocus = document.activeElement; m.classList.add("open"); const f = m.querySelector("input,select,textarea,button"); f && f.focus(); }
  function closeModal(m) { m.classList.remove("open"); lastFocus && lastFocus.focus(); }
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]"); if (o) { e.preventDefault(); openModal(o.dataset.open); }
    const c = e.target.closest("[data-close]"); if (c) { e.preventDefault(); closeModal(c.closest(".modal-backdrop")); }
    if (e.target.classList && e.target.classList.contains("modal-backdrop")) closeModal(e.target);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".modal-backdrop.open").forEach(closeModal); });

  /* ---------- Contraseña visible ---------- */
  $$(".pw-toggle").forEach((b) => b.addEventListener("click", () => {
    const i = b.parentElement.querySelector("input"); const show = i.type === "password";
    i.type = show ? "text" : "password"; b.textContent = show ? "Ocultar" : "Mostrar"; b.setAttribute("aria-pressed", show);
  }));

  function setError(field, on, msg) {
    const f = typeof field === "string" ? $(field) : field; if (!f) return;
    f.classList.toggle("has-error", on);
    const input = f.querySelector("input,select,textarea"); input && input.setAttribute("aria-invalid", on ? "true" : "false");
    if (msg) { const m = f.querySelector(".error-msg span"); if (m) m.textContent = msg; }
  }
  const go = (url) => { location.href = url + (params.get("wf") ? (url.includes("?") ? "&" : "?") + "wf=1" : ""); };

  /* ---------- Contadores de navegación ---------- */
  function navCounts() {
    const reqs = PC.requests();
    const pend = reqs.filter((r) => r.provider === PC.PROVIDER_ME && r.status === "pendiente").length;
    $$("[data-count='prov-pending']").forEach((el) => { el.textContent = pend; el.hidden = !pend; });
  }

  /* ---------- Renderizadores reutilizables ---------- */
  function providerCard(p) {
    const act = p.services.filter((s) => s.active);
    const min = Math.min(...act.map((s) => s.price));
    return `<article class="card provider-card">
      <div class="top"><div class="avatar ${PC.TYPES[p.type].tone}" aria-hidden="true">${p.initials}</div>
        <div><h3>${esc(p.name)}</h3><div class="meta"><span>${ic("pin", "icon icon-sm")}${p.zone}</span><span>${ic("clock", "icon icon-sm")}${esc(p.hours)}</span></div></div></div>
      <div>${typeBadge(p.type)}</div>
      <p class="desc">${esc(p.desc)}</p>
      <div class="foot"><div class="price"><small>Desde</small>${money(min)}</div>
        <a class="btn btn-secondary btn-sm" href="proveedor.html?id=${p.id}">Ver perfil y servicios</a></div>
    </article>`;
  }
  function reqRow(r, mode) {
    const p = PC.provider(r.provider); const s = PC.service(r.provider, r.service) || { name: "Servicio", price: 0 };
    const d = parse(r.date);
    const who = mode === "provider"
      ? `<span>${ic("user", "icon icon-sm")}${esc(r.owner)}</span><span>${ic("paw", "icon icon-sm")}${esc(r.pet)} (${esc(r.species)})</span>`
      : `<span>${ic("store", "icon icon-sm")}${esc(p.name)}</span><span>${ic("paw", "icon icon-sm")}${esc(r.pet)}</span>`;
    let actions = badge(r.status);
    if (mode === "provider" && r.status === "pendiente") {
      actions = `<button class="btn btn-danger-outline btn-sm" data-reject="${r.id}">${ic("x", "icon icon-sm")}Rechazar</button>
                 <button class="btn btn-primary btn-sm" data-accept="${r.id}">${ic("check", "icon icon-sm")}Aceptar</button>`;
    }
    return `<article class="req" data-id="${r.id}">
      <div class="date-box" aria-hidden="true"><span class="d">${d.getDate()}</span><span class="m">${MONTHS[d.getMonth()]}</span></div>
      <div><h4>${esc(s.name)}</h4><div class="sub"><span>${ic("calendar", "icon icon-sm")}${fmtDate(r.date)} · ${r.time}</span>${who}</div>
        ${r.notes ? `<div class="small muted" style="margin-top:4px">“${esc(r.notes)}”</div>` : ""}</div>
      <div class="actions">${actions}</div></article>`;
  }
  function emptyState(icon, title, text, cta) {
    return `<div class="empty"><div class="ico">${ic(icon)}</div><h3>${title}</h3><p>${text}</p>${cta || ""}</div>`;
  }

  /* ---------- Acciones del proveedor: aceptar / rechazar (HU-06) ---------- */
  let pendingReject = null;
  function bindProviderActions(rerender) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-accept]"); const r = e.target.closest("[data-reject]");
      if (a) { updateStatus(a.dataset.accept, "aceptada"); toast("Solicitud aceptada. El propietario ya puede verla."); rerender(); }
      if (r) { pendingReject = r.dataset.reject; const req = PC.requests().find((x) => x.id === pendingReject);
        const s = PC.service(req.provider, req.service); $("#reject-detail").textContent = `${s.name} · ${req.pet} · ${fmtDate(req.date)} ${req.time}`; openModal("modal-reject"); }
    });
    const cr = $("#confirm-reject");
    cr && cr.addEventListener("click", () => { if (!pendingReject) return; updateStatus(pendingReject, "rechazada"); closeModal($("#modal-reject")); toast("Solicitud rechazada."); pendingReject = null; rerender(); });
  }
  function updateStatus(id, st) { const all = PC.requests(); const r = all.find((x) => x.id === id); if (r) { r.status = st; PC.saveRequests(all); } navCounts(); }

  /* =========================================================
     Inicializadores por pantalla
     ========================================================= */
  const pages = {
    /* Inicio de sesión (HU-02) */
    login() {
      $("#login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = $("#email").value.trim(), pw = $("#password").value;
        const err = $("#login-error");
        setError("#f-email", !/^\S+@\S+\.\S+$/.test(email), "Escribe un correo válido, por ejemplo nombre@correo.com");
        setError("#f-password", !pw, "Escribe tu contraseña");
        if (!/^\S+@\S+\.\S+$/.test(email) || !pw) return;
        if (pw.length < 8) { err.hidden = false; err.focus(); return; } // mensaje genérico: no revela qué dato falló
        go(email.toLowerCase().includes("huellitas") ? "panel-proveedor.html" : "panel-propietario.html");
      });
    },

    /* Registro con rol (HU-01) */
    registro() {
      const pw = $("#reg-password"); const meter = $("#pw-meter");
      pw.addEventListener("input", () => { const ok = pw.value.length >= 8; meter.textContent = ok ? "✓ Cumple la longitud mínima" : `Mínimo 8 caracteres (${pw.value.length}/8)`; meter.style.color = ok ? "var(--success-700)" : ""; });
      $("#register-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const role = ($("input[name=role]:checked") || {}).value;
        const name = $("#reg-name").value.trim(), email = $("#reg-email").value.trim(), p1 = pw.value, p2 = $("#reg-password2").value, terms = $("#reg-terms").checked;
        const exists = email.toLowerCase() === PC.OWNER.email;
        setError("#f-role", !role);
        setError("#f-name", !name);
        setError("#f-reg-email", !/^\S+@\S+\.\S+$/.test(email) || exists, exists ? "Este correo ya está registrado. ¿Quieres iniciar sesión?" : "Escribe un correo válido, por ejemplo nombre@correo.com");
        setError("#f-reg-password", p1.length < 8);
        setError("#f-reg-password2", !p2 || p1 !== p2);
        setError("#f-terms", !terms);
        const bad = $(".has-error"); if (bad) { const i = bad.querySelector("input"); i && i.focus(); return; }
        go(role === "proveedor" ? "panel-proveedor.html?nuevo=1" : "panel-propietario.html?nuevo=1");
      });
    },

    /* Panel del propietario */
    "panel-propietario"() {
      if (params.get("nuevo")) $("#welcome-new").hidden = false;
      const reqs = PC.requests().filter((r) => r.owner === PC.OWNER.name);
      $("#st-pend").textContent = reqs.filter((r) => r.status === "pendiente").length;
      $("#st-acc").textContent = reqs.filter((r) => r.status === "aceptada" && r.date >= PC.TODAY).length;
      $("#st-pets").textContent = PC.pets().length;
      const upcoming = reqs.filter((r) => r.date >= PC.TODAY && r.status !== "rechazada").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 3);
      $("#upcoming").innerHTML = upcoming.length ? upcoming.map((r) => reqRow(r, "owner")).join("") : emptyState("calendar", "Aún no tienes reservas próximas", "Busca un servicio y envía tu primera solicitud.", `<a class="btn btn-primary" href="buscar.html">Buscar servicios</a>`);
      const pets = PC.pets();
      $("#pets-mini").innerHTML = pets.length ? pets.map((p) => `<div class="pet-card" style="padding:8px 0"><div class="pet-ico tone-accent" style="width:44px;height:44px">${ic("paw")}</div><div><strong>${esc(p.name)}</strong><div class="small muted">${esc(p.species)} · ${p.age} ${p.age == 1 ? "año" : "años"}</div></div></div>`).join("") : `<p class="muted small">Todavía no registras mascotas.</p>`;
      $("#quick-search").addEventListener("submit", (e) => { e.preventDefault(); go(`buscar.html?tipo=${$("#qs-type").value}&zona=${encodeURIComponent($("#qs-zone").value)}`); });
    },

    /* Búsqueda con filtros (HU-04) */
    buscar() {
      let type = params.get("tipo") || ""; let zone = params.get("zona") || "";
      const zoneSel = $("#f-zone");
      zoneSel.value = zone;
      function render() {
        $$("#type-chips .chip").forEach((c) => c.setAttribute("aria-pressed", c.dataset.type === type));
        const list = PC.providers().filter((p) => p.services.some((s) => s.active) && (!type || p.type === type) && (!zone || p.zone === zone));
        const t = type ? PC.TYPES[type].label.toLowerCase() : "todos los servicios";
        $("#result-count").innerHTML = `<strong>${list.length}</strong> ${list.length === 1 ? "resultado" : "resultados"} · ${t}${zone ? " en " + zone : " en todas las zonas"}`;
        $("#results").innerHTML = list.length ? list.map(providerCard).join("")
          : `<div style="grid-column:1/-1">${emptyState("search", "No encontramos servicios con estos filtros", `No hay proveedores de ${t} en ${zone || "la zona elegida"} por ahora. Prueba otra zona o quita un filtro.`, `<button class="btn btn-secondary" id="clear-filters">Quitar filtros</button>`)}</div>`;
        $("#clear-top").hidden = !(type || zone);
        const cf = $("#clear-filters"); cf && cf.addEventListener("click", () => { type = ""; zone = ""; zoneSel.value = ""; render(); });
        history.replaceState(null, "", `?${new URLSearchParams({ ...(type && { tipo: type }), ...(zone && { zona: zone }), ...(params.get("wf") && { wf: 1 }) })}`);
      }
      $$("#type-chips .chip").forEach((c) => c.addEventListener("click", () => { type = type === c.dataset.type ? "" : c.dataset.type; render(); }));
      zoneSel.addEventListener("change", () => { zone = zoneSel.value; render(); });
      $("#clear-top").addEventListener("click", () => { type = ""; zone = ""; zoneSel.value = ""; render(); $("#type-chips .chip").focus(); });
      render();
    },

    /* Perfil del proveedor (RF-06) */
    proveedor() {
      const p = PC.provider(params.get("id") || "p1");
      document.title = `${p.name} · PetCare`;
      $("#crumb-name").textContent = p.name;
      $("#prov-hero").innerHTML = `<div class="avatar avatar-xl ${PC.TYPES[p.type].tone}" aria-hidden="true">${p.initials}</div>
        <div><div style="margin-bottom:8px">${typeBadge(p.type)}</div><h1>${esc(p.name)}</h1>
        <div class="row small muted"><span class="row" style="gap:4px">${ic("pin", "icon icon-sm")}${p.zone} · ${esc(p.address)}</span></div></div>`;
      $("#prov-desc").textContent = p.desc;
      const act = p.services.filter((s) => s.active);
      $("#prov-services").innerHTML = act.map((s) => `<div class="service-item"><div><h4>${esc(s.name)}</h4><p>${esc(s.desc)}</p><span class="dur">${ic("clock", "icon icon-sm")}${dur(s.dur)}</span></div>
        <div class="price">${money(s.price)}</div><a class="btn btn-primary btn-sm" href="solicitud.html?prov=${p.id}&serv=${s.id}">Solicitar</a></div>`).join("");
      $("#prov-contact").innerHTML = `<dt>${ic("phone", "icon icon-sm")}Teléfono</dt><dd>${p.phone}</dd><dt>${ic("mail", "icon icon-sm")}Correo</dt><dd style="word-break:break-all">${p.email}</dd><dt>${ic("clock", "icon icon-sm")}Horario</dt><dd>${esc(p.hours)}</dd><dt>${ic("pin", "icon icon-sm")}Zona</dt><dd>${p.zone}</dd>`;
      $("#prov-cta").href = `solicitud.html?prov=${p.id}&serv=${act[0] ? act[0].id : ""}`;
    },

    /* Solicitud de reserva (HU-05) */
    solicitud() {
      const p = PC.provider(params.get("prov") || "p1");
      const servSel = $("#r-service"), petSel = $("#r-pet");
      servSel.innerHTML = p.services.filter((s) => s.active).map((s) => `<option value="${s.id}">${esc(s.name)} — ${money(s.price)}</option>`).join("");
      if (params.get("serv")) servSel.value = params.get("serv");
      const pets = PC.pets();
      petSel.innerHTML = `<option value="">Selecciona una mascota</option>` + pets.map((m) => `<option value="${m.id}">${esc(m.name)} (${esc(m.species)})</option>`).join("");
      if (pets.length === 1) petSel.value = pets[0].id;
      $("#no-pets").hidden = pets.length > 0;
      $("#add-pet-link").href = "mascotas.html?nueva=1&volver=" + encodeURIComponent("solicitud.html?prov=" + p.id + "&serv=" + (params.get("serv") || ""));
      $("#prov-hours").textContent = "Horario de " + p.name + ": " + p.hours;
      $("#r-date").min = "2026-11-08";
      $("#back-prov").href = `proveedor.html?id=${p.id}`; $("#crumb-prov").href = `proveedor.html?id=${p.id}`; $("#crumb-prov").textContent = p.name;
      function summary() {
        const s = PC.service(p.id, servSel.value) || {}; const m = pets.find((x) => x.id === petSel.value);
        $("#sum").innerHTML = `<div class="row" style="margin-bottom:12px"><div class="avatar avatar-sm ${PC.TYPES[p.type].tone}">${p.initials}</div><div><strong class="small">${esc(p.name)}</strong><div class="small muted">${p.zone}</div></div></div>
          <div class="line"><span>Servicio</span><span>${esc(s.name || "—")}</span></div>
          <div class="line"><span>Mascota</span><span>${m ? esc(m.name) : "—"}</span></div>
          <div class="line"><span>Fecha</span><span>${$("#r-date").value ? fmtDate($("#r-date").value) : "—"}</span></div>
          <div class="line"><span>Hora</span><span>${$("#r-time").value || "—"}</span></div>
          <div class="total"><span>Precio de referencia</span><span>${s.price ? money(s.price) : "—"}</span></div>
          <p class="small muted" style="margin:12px 0 0">El pago se acuerda directamente con el proveedor. No se cobra nada al enviar la solicitud.</p>`;
      }
      ["change", "input"].forEach((ev) => $("#request-form").addEventListener(ev, summary)); summary();
      $("#request-form").addEventListener("submit", (e) => {
        e.preventDefault();
        setError("#f-r-pet", !petSel.value); setError("#f-r-date", !$("#r-date").value || $("#r-date").value <= PC.TODAY); setError("#f-r-time", !$("#r-time").value);
        const bad = $(".has-error"); if (bad) { bad.querySelector("select,input").focus(); return; }
        const m = pets.find((x) => x.id === petSel.value);
        const all = PC.requests(); const id = "r" + Date.now();
        all.push({ id, owner: PC.OWNER.name, pet: m.name, species: m.species, provider: p.id, service: servSel.value, date: $("#r-date").value, time: $("#r-time").value, status: "pendiente", notes: $("#r-notes").value.trim(), created: PC.TODAY });
        PC.saveRequests(all);
        $("#form-view").hidden = true; $("#success-view").hidden = false;
        $("#success-detail").textContent = `${PC.service(p.id, servSel.value).name} con ${p.name} para ${m.name}, el ${fmtDate($("#r-date").value)} a las ${$("#r-time").value}.`;
        $("#success-view").focus(); window.scrollTo(0, 0);
      });
    },

    /* Historial de solicitudes (HU-07) */
    solicitudes() {
      let filter = params.get("estado") || "todas";
      function render() {
        const all = PC.requests().filter((r) => r.owner === PC.OWNER.name).sort((a, b) => b.date.localeCompare(a.date));
        $$("#req-tabs .tab").forEach((t) => { t.setAttribute("aria-selected", t.dataset.f === filter); const n = t.querySelector(".n"); n.textContent = t.dataset.f === "todas" ? all.length : all.filter((r) => r.status === t.dataset.f).length; });
        const list = filter === "todas" ? all : all.filter((r) => r.status === filter);
        $("#req-list").innerHTML = list.length ? list.map((r) => reqRow(r, "owner")).join("") : emptyState("inbox", "No hay solicitudes en este estado", "Cuando envíes o actualicen una solicitud, aparecerá aquí.", `<a class="btn btn-primary" href="buscar.html">Buscar servicios</a>`);
      }
      $$("#req-tabs .tab").forEach((t) => t.addEventListener("click", () => { filter = t.dataset.f; render(); }));
      render();
    },

    /* Mascotas (HU-08) */
    mascotas() {
      let editing = null, deleting = null;
      function render() {
        const pets = PC.pets();
        $("#pet-list").innerHTML = pets.length ? pets.map((p) => `<article class="card pet-card">
          <div class="pet-ico tone-accent">${ic("paw", "icon icon-lg")}</div>
          <div><h3>${esc(p.name)}</h3><div class="small muted">${esc(p.species)}${p.breed ? " · " + esc(p.breed) : ""} · ${p.age} ${p.age == 1 ? "año" : "años"}</div></div>
          <div class="actions"><button class="btn btn-ghost btn-icon" data-edit="${p.id}" aria-label="Editar a ${esc(p.name)}">${ic("edit")}</button>
          <button class="btn btn-ghost btn-icon" data-del="${p.id}" aria-label="Eliminar a ${esc(p.name)}" style="color:var(--danger-700)">${ic("trash")}</button></div></article>`).join("")
          : `<div style="grid-column:1/-1">${emptyState("paw", "Aún no registras mascotas", "Agrega a tu mascota para poder elegirla al solicitar un servicio.", `<button class="btn btn-primary" data-open="modal-pet">${ic("plus")}Agregar mascota</button>`)}</div>`;
      }
      document.addEventListener("click", (e) => {
        const ed = e.target.closest("[data-edit]"); const dl = e.target.closest("[data-del]"); const add = e.target.closest("[data-open='modal-pet']");
        if (add) { editing = null; $("#pet-modal-title").textContent = "Agregar mascota"; $("#pet-form").reset(); $$("#pet-form .field").forEach((f) => setError(f, false)); }
        if (ed) { const p = PC.pets().find((x) => x.id === ed.dataset.edit); editing = p.id; $("#pet-modal-title").textContent = `Editar a ${p.name}`; $("#p-name").value = p.name; $("#p-species").value = p.species; $("#p-age").value = p.age; $("#p-breed").value = p.breed || ""; openModal("modal-pet"); }
        if (dl) { deleting = dl.dataset.del; $("#del-name").textContent = PC.pets().find((x) => x.id === deleting).name; openModal("modal-del"); }
      });
      $("#pet-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("#p-name").value.trim(), species = $("#p-species").value, age = $("#p-age").value;
        setError("#f-p-name", !name); setError("#f-p-species", !species); setError("#f-p-age", age === "" || age < 0 || age > 30);
        if ($("#pet-form .has-error")) return;
        const pets = PC.pets(); const data = { name, species, age: Number(age), breed: $("#p-breed").value.trim() };
        if (editing) Object.assign(pets.find((x) => x.id === editing), data); else pets.push({ id: "m" + Date.now(), ...data });
        PC.savePets(pets); closeModal($("#modal-pet")); render(); toast(editing ? "Cambios guardados." : `${name} se agregó a tus mascotas.`);
        const back = params.get("volver"); if (back && !editing && /^solicitud\.html\?/.test(back)) setTimeout(() => go(back), 900);
      });
      if (params.get("volver")) $("#return-note").hidden = false;
      if (params.get("nueva")) { $("#pet-modal-title").textContent = "Agregar mascota"; openModal("modal-pet"); }
      $("#confirm-del").addEventListener("click", () => { PC.savePets(PC.pets().filter((x) => x.id !== deleting)); closeModal($("#modal-del")); render(); toast("Mascota eliminada."); });
      render();
    },

    /* Panel del proveedor (RF-08, RF-10) */
    "panel-proveedor"() {
      if (params.get("nuevo")) $("#welcome-new").hidden = false;
      function render() {
        const mine = PC.requests().filter((r) => r.provider === PC.PROVIDER_ME);
        const pend = mine.filter((r) => r.status === "pendiente").sort((a, b) => a.date.localeCompare(b.date));
        $("#st-pend").textContent = pend.length;
        $("#st-acc").textContent = mine.filter((r) => r.status === "aceptada" && r.date >= PC.TODAY).length;
        $("#st-serv").textContent = PC.p1Services().filter((s) => s.active).length;
        $("#pending-list").innerHTML = pend.length ? pend.map((r) => reqRow(r, "provider")).join("") : emptyState("inbox", "Estás al día", "No tienes solicitudes pendientes por responder.");
        const next = mine.filter((r) => r.status === "aceptada" && r.date >= PC.TODAY).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        $("#agenda").innerHTML = next.length ? next.map((r) => `<div class="line" style="display:flex;justify-content:space-between;gap:8px;padding:10px 0;border-bottom:1px solid var(--ink-100)"><span class="small"><strong>${fmtDate(r.date)}</strong> · ${r.time}</span><span class="small muted">${esc(r.pet)}</span></div>`).join("") : `<p class="small muted">No hay citas aceptadas próximas.</p>`;
        navCounts();
      }
      bindProviderActions(render); render();
    },

    /* Solicitudes recibidas (RF-10) */
    "solicitudes-recibidas"() {
      let filter = params.get("estado") || "pendiente";
      function render() {
        const all = PC.requests().filter((r) => r.provider === PC.PROVIDER_ME).sort((a, b) => a.date.localeCompare(b.date));
        $$("#req-tabs .tab").forEach((t) => { t.setAttribute("aria-selected", t.dataset.f === filter); t.querySelector(".n").textContent = t.dataset.f === "todas" ? all.length : all.filter((r) => r.status === t.dataset.f).length; });
        const list = filter === "todas" ? all : all.filter((r) => r.status === filter);
        $("#req-list").innerHTML = list.length ? list.map((r) => reqRow(r, "provider")).join("") : emptyState("inbox", "Sin solicitudes en este estado", "Las nuevas solicitudes de los propietarios aparecerán aquí.");
        navCounts();
      }
      $$("#req-tabs .tab").forEach((t) => t.addEventListener("click", () => { filter = t.dataset.f; render(); }));
      bindProviderActions(render); render();
    },

    /* Gestión de servicios (HU-03, RF-04) */
    servicios() {
      let editing = null;
      function render() {
        const list = PC.p1Services();
        $("#svc-body").innerHTML = list.map((s) => `<tr>
          <td><strong>${esc(s.name)}</strong><div class="small muted">${esc(s.desc)}</div></td>
          <td data-label="Precio">${money(s.price)}</td><td data-label="Duración">${dur(s.dur)}</td>
          <td data-label="Estado"><label class="switch"><input type="checkbox" data-toggle="${s.id}" ${s.active ? "checked" : ""} aria-label="Servicio ${esc(s.name)} activo"><span class="track"></span><span>${s.active ? "Activo" : "Inactivo"}</span></label></td>
          <td style="text-align:right"><button class="btn btn-ghost btn-sm" data-edit-svc="${s.id}">${ic("edit", "icon icon-sm")}Editar</button></td></tr>`).join("");
        $("#svc-active").textContent = list.filter((s) => s.active).length; $("#svc-total").textContent = list.length;
      }
      document.addEventListener("change", (e) => {
        const t = e.target.closest("[data-toggle]"); if (!t) return;
        const list = PC.p1Services(); const s = list.find((x) => x.id === t.dataset.toggle); s.active = t.checked; PC.saveP1Services(list); render();
        toast(s.active ? "Servicio activado: ya aparece en la búsqueda." : "Servicio desactivado: ya no aparece en la búsqueda.");
      });
      document.addEventListener("click", (e) => {
        const ed = e.target.closest("[data-edit-svc]"); const add = e.target.closest("[data-open='modal-svc']");
        if (add) { editing = null; $("#svc-modal-title").textContent = "Nuevo servicio"; $("#svc-form").reset(); $$("#svc-form .field").forEach((f) => setError(f, false)); }
        if (ed) { const s = PC.p1Services().find((x) => x.id === ed.dataset.editSvc); editing = s.id; $("#svc-modal-title").textContent = "Editar servicio";
          $("#s-name").value = s.name; $("#s-desc").value = s.desc; $("#s-price").value = s.price; $("#s-dur").value = s.dur; openModal("modal-svc"); }
      });
      $("#svc-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("#s-name").value.trim(), price = Number($("#s-price").value), d = Number($("#s-dur").value);
        setError("#f-s-name", !name); setError("#f-s-price", !price || price < 0); setError("#f-s-dur", !d);
        if ($("#svc-form .has-error")) return;
        const list = PC.p1Services(); const data = { name, desc: $("#s-desc").value.trim(), price, dur: d };
        if (editing) Object.assign(list.find((x) => x.id === editing), data); else list.push({ id: "s" + Date.now(), active: true, ...data });
        PC.saveP1Services(list); closeModal($("#modal-svc")); render(); toast(editing ? "Servicio actualizado." : "Servicio publicado.");
      });
      render();
    },

    /* Índice del prototipo */
    prototipo() { const b = $("#reset-demo"); b && b.addEventListener("click", () => { PC.reset(); toast("Datos de demostración restablecidos."); }); },

    /* Landing */
    inicio() { $("#hero-search").addEventListener("submit", (e) => { e.preventDefault(); go(`buscar.html?tipo=${$("#h-type").value}&zona=${encodeURIComponent($("#h-zone").value)}`); }); },
  };

  navCounts();
  const page = document.body.dataset.page;
  pages[page] && pages[page]();
})();
