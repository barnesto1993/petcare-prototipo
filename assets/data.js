/* PetCare — datos de demostración y almacenamiento local del prototipo.
   No hay backend en esta fase: los cambios se guardan en el navegador (localStorage)
   para que el flujo completo propietario ↔ proveedor pueda probarse con usuarios. */
const PC = (() => {
  const TYPES = {
    veterinaria: { label: "Veterinaria", icon: "vet", tone: "av-blue" },
    peluqueria: { label: "Peluquería", icon: "groom", tone: "av-orange" },
    paseo: { label: "Paseo", icon: "walk", tone: "av-teal" },
    cuidado: { label: "Cuidado temporal", icon: "stay", tone: "av-gold" },
  };
  const ZONES = ["Chapinero", "Usaquén", "Suba", "Teusaquillo", "Kennedy"];

  const PROVIDERS = [
    { id: "p1", name: "Peluquería Huellitas", type: "peluqueria", zone: "Chapinero", initials: "PH",
      desc: "Baño, corte y spa para perros y gatos. Productos hipoalergénicos y atención sin afanes.",
      phone: "300 555 0101", email: "huellitas@petcare-demo.co", hours: "Lun a sáb · 8:00 a 18:00", address: "Cra. 13 # 54-20",
      services: [
        { id: "s11", name: "Baño y corte · perro pequeño", price: 45000, dur: 60, desc: "Hasta 10 kg. Incluye corte de uñas y limpieza de oídos.", active: true },
        { id: "s12", name: "Baño y corte · perro grande", price: 70000, dur: 90, desc: "Más de 10 kg. Incluye secado y cepillado.", active: true },
        { id: "s13", name: "Baño para gato", price: 50000, dur: 60, desc: "Manejo de bajo estrés, con cita exclusiva.", active: true },
      ] },
    { id: "p2", name: "Clínica Veterinaria San Roque", type: "veterinaria", zone: "Teusaquillo", initials: "SR",
      desc: "Medicina general, vacunación y control preventivo para perros y gatos.",
      phone: "300 555 0102", email: "sanroque@petcare-demo.co", hours: "Lun a vie · 7:00 a 19:00", address: "Calle 39 # 20-15",
      services: [
        { id: "s21", name: "Consulta general", price: 80000, dur: 30, desc: "Revisión completa y plan de cuidado.", active: true },
        { id: "s22", name: "Vacunación", price: 60000, dur: 20, desc: "Aplicación y registro en el carné.", active: true },
        { id: "s23", name: "Desparasitación", price: 40000, dur: 20, desc: "Interna y externa según el peso.", active: true },
      ] },
    { id: "p3", name: "Paseos Felices", type: "paseo", zone: "Usaquén", initials: "PF",
      desc: "Paseos individuales y grupales con seguimiento por fotos. Paseador con experiencia de 5 años.",
      phone: "300 555 0103", email: "paseosfelices@petcare-demo.co", hours: "Todos los días · 6:00 a 19:00", address: "Cubre Usaquén y Santa Bárbara",
      services: [
        { id: "s31", name: "Paseo individual · 1 hora", price: 20000, dur: 60, desc: "Recogida y entrega en casa.", active: true },
        { id: "s32", name: "Paseo grupal · 1 hora", price: 15000, dur: 60, desc: "Grupos de máximo 4 perros.", active: true },
      ] },
    { id: "p4", name: "Hotel Canino El Refugio", type: "cuidado", zone: "Suba", initials: "ER",
      desc: "Guardería de día y hospedaje con zonas verdes y cuidado 24 horas.",
      phone: "300 555 0104", email: "elrefugio@petcare-demo.co", hours: "Todos los días · 24 horas", address: "Av. Suba # 120-30",
      services: [
        { id: "s41", name: "Guardería de día", price: 50000, dur: 600, desc: "De 7:00 a 17:00 con dos comidas.", active: true },
        { id: "s42", name: "Hospedaje · 1 noche", price: 90000, dur: 1440, desc: "Habitación individual y reporte diario.", active: true },
      ] },
    { id: "p5", name: "Estética Canina Patitas", type: "peluqueria", zone: "Usaquén", initials: "EP",
      desc: "Peluquería canina con estilistas certificados. Cortes por raza y baño medicado.",
      phone: "300 555 0105", email: "patitas@petcare-demo.co", hours: "Mar a dom · 9:00 a 18:00", address: "Calle 140 # 11-45",
      services: [
        { id: "s51", name: "Baño completo", price: 55000, dur: 75, desc: "Shampoo según tipo de pelo, secado y perfume.", active: true },
        { id: "s52", name: "Corte de uñas", price: 15000, dur: 15, desc: "Sin cita previa en horario de atención.", active: true },
      ] },
    { id: "p6", name: "VetCare 24 Horas", type: "veterinaria", zone: "Chapinero", initials: "VC",
      desc: "Atención veterinaria de urgencias y consulta en cualquier horario.",
      phone: "300 555 0106", email: "vetcare24@petcare-demo.co", hours: "Todos los días · 24 horas", address: "Calle 63 # 9-12",
      services: [
        { id: "s61", name: "Consulta general", price: 90000, dur: 30, desc: "Atención con médico veterinario.", active: true },
        { id: "s62", name: "Urgencias", price: 150000, dur: 60, desc: "Valoración prioritaria.", active: true },
      ] },
    { id: "p7", name: "Laura Méndez · Cuidadora", type: "cuidado", zone: "Chapinero", initials: "LM",
      desc: "Cuidado de mascotas en tu casa mientras viajas: alimentación, juego y paseo corto.",
      phone: "300 555 0107", email: "lauram@petcare-demo.co", hours: "Según reserva", address: "Visitas a domicilio en Chapinero",
      services: [
        { id: "s71", name: "Cuidado a domicilio · 1 día", price: 60000, dur: 480, desc: "Dos visitas diarias.", active: true },
      ] },
    { id: "p8", name: "Dog Walker Bogotá", type: "paseo", zone: "Teusaquillo", initials: "DW",
      desc: "Paseos con correa doble y rutas por parques del sector.",
      phone: "300 555 0108", email: "dogwalker@petcare-demo.co", hours: "Lun a sáb · 6:00 a 18:00", address: "Park Way y alrededores",
      services: [
        { id: "s81", name: "Paseo individual · 45 min", price: 18000, dur: 45, desc: "Incluye hidratación.", active: true },
      ] },
  ];

  const SEED_PETS = [
    { id: "m1", name: "Milo", species: "Perro", age: 3, breed: "Labrador" },
  ];

  const SEED_REQUESTS = [
    { id: "r1", owner: "Camila Torres", pet: "Milo", species: "Perro", provider: "p2", service: "s22", date: "2026-11-12", time: "10:00", status: "aceptada", notes: "", created: "2026-11-02" },
    { id: "r2", owner: "Camila Torres", pet: "Milo", species: "Perro", provider: "p3", service: "s31", date: "2026-11-15", time: "07:30", status: "pendiente", notes: "Es muy enérgico al inicio del paseo.", created: "2026-11-05" },
    { id: "r3", owner: "Camila Torres", pet: "Milo", species: "Perro", provider: "p4", service: "s42", date: "2026-10-20", time: "18:00", status: "rechazada", notes: "", created: "2026-10-12" },
    { id: "r4", owner: "Julián Pérez", pet: "Toby", species: "Perro", provider: "p1", service: "s12", date: "2026-11-10", time: "14:00", status: "pendiente", notes: "Tiene el pelo muy enredado.", created: "2026-11-06" },
    { id: "r5", owner: "Sara Gómez", pet: "Nala", species: "Gato", provider: "p1", service: "s13", date: "2026-11-11", time: "11:00", status: "pendiente", notes: "", created: "2026-11-06" },
    { id: "r6", owner: "Camila Torres", pet: "Milo", species: "Perro", provider: "p1", service: "s12", date: "2026-10-28", time: "09:00", status: "aceptada", notes: "", created: "2026-10-22" },
    { id: "r8", owner: "Valentina Ortiz", pet: "Coco", species: "Perro", provider: "p1", service: "s11", date: "2026-11-09", time: "08:30", status: "aceptada", notes: "", created: "2026-11-04" },
    { id: "r7", owner: "Diego Ruiz", pet: "Rocky", species: "Perro", provider: "p1", service: "s11", date: "2026-10-30", time: "16:00", status: "rechazada", notes: "", created: "2026-10-25" },
  ];

  const mem = {};
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function load(key, seed) {
    try { const v = localStorage.getItem(key); if (v) return JSON.parse(v); } catch (e) {}
    if (mem[key]) return mem[key];
    return clone(seed);
  }
  function save(key, val) {
    mem[key] = val;
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  // Servicios del proveedor "logueado" (p1) pueden editarse; el resto es fijo.
  function providers() {
    const p1services = load("pc_services_p1", PROVIDERS[0].services);
    return PROVIDERS.map((p) => (p.id === "p1" ? { ...p, services: p1services } : p));
  }
  function provider(id) { return providers().find((p) => p.id === id); }
  function service(pid, sid) { const p = provider(pid); return p && p.services.find((s) => s.id === sid); }

  return {
    TYPES, ZONES,
    providers, provider, service,
    pets: () => load("pc_pets", SEED_PETS),
    savePets: (v) => save("pc_pets", v),
    requests: () => load("pc_requests", SEED_REQUESTS),
    saveRequests: (v) => save("pc_requests", v),
    p1Services: () => load("pc_services_p1", PROVIDERS[0].services),
    saveP1Services: (v) => save("pc_services_p1", v),
    reset() { try { ["pc_pets", "pc_requests", "pc_services_p1"].forEach((k) => localStorage.removeItem(k)); } catch (e) {} Object.keys(mem).forEach((k) => delete mem[k]); },
    OWNER: { name: "Camila Torres", first: "Camila", email: "camila@correo.com", initials: "CT" },
    PROVIDER_ME: "p1",
    TODAY: "2026-11-07",
  };
})();
