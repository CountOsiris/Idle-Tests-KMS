// THROWAWAY prototype: phone layout variants. ?v=base|a|b|c  &tab=skills
(function () {
  const q = new URLSearchParams(location.search);
  const v = q.get("v") || "a";
  document.body.classList.add("v-" + v);
  if (v !== "base") document.body.classList.add("proto");

  function tick() {
    const tip = document.getElementById("tip");
    if (tip) tip.hidden = true;
    const away = document.getElementById("away-report");
    if (away) away.hidden = true;
    if (v === "base") return;
    const $ = (id) => document.getElementById(id);
    const chosen = document.querySelector(".hero-tile.chosen img");
    const face = document.querySelector("#pbar .p-face");
    if (chosen && face.dataset.src !== chosen.src) {
      face.dataset.src = chosen.src;
      face.innerHTML = '<img src="' + chosen.src + '">';
    }
    document.querySelector("#pbar .p-lvl").textContent = $("header-level").textContent;
    document.querySelector("#pbar .hp i").style.width = $("player-hp-bar").style.width;
    document.querySelector("#pbar .hp b").textContent = $("player-hp").textContent + " HP";
    document.querySelector("#pbar .xp i").style.width = $("header-level-bar").style.width;
    document.querySelector("#pbar .xp b").textContent = $("xp").textContent + " exp";
    document.querySelector("#pbar .p-gold").textContent = $("gold").textContent;
    document.querySelector("#pbar .p-bank").textContent = $("bank").textContent;
    const fl = document.querySelector(".p-floor");
    if (fl) fl.textContent = "Floor " + $("floor").textContent;
  }

  function build() {
    if (v !== "base") {
      const bar = document.createElement("div");
      bar.id = "pbar";
      bar.innerHTML =
        '<button class="p-ava" onclick="showTab(\'character\')"><span class="p-face"></span><span class="p-lvl"></span></button>' +
        '<div class="p-bars"><div class="p-bar hp"><i></i><b></b></div><div class="p-bar xp"><i></i><b></b></div></div>' +
        '<div class="p-money"><span class="p-gold"></span><span class="p-bank"></span></div>' +
        '<button class="p-gear" onclick="showTab(\'save\')">⚙️</button>';
      document.body.prepend(bar);

      // The scene: the tower's picture with the fighters, and the waiting things over its edge
      const card = document.querySelector(".fight-card");
      const scene = document.createElement("div");
      scene.className = "p-scene";
      const stage = document.getElementById("stage");
      card.insertBefore(scene, stage);
      scene.append(stage, document.getElementById("ready"));
      const floor = document.createElement("span");
      floor.className = "p-floor";
      scene.append(floor);

      const info = document.createElement("div");
      info.className = "p-info";
      for (const id of ["boss-rules", "monster-text", "pressure", "ability-bar", "goals"]) {
        info.append(document.getElementById(id));
      }
      info.prepend(document.querySelector(".weak-line"), document.getElementById("monster-numbers"));
      if (v !== "b") info.prepend(document.querySelector(".tower-head"));
      card.append(info);
    }
    const tab = q.get("tab");
    if (tab) showTab(tab);
    tick();
    setInterval(tick, 250);
  }
  setTimeout(build, 300);
})();
