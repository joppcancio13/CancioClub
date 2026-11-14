import React from "react";
import ReactDOM from "react-dom/client";
import { CancioClub } from "./App.jsx";
import { AssessmentInicialScreen } from "./components/assessment/AssessmentInicialScreen.jsx";

function fail(msg) {
  const r = document.getElementById("root");
  if (r) {
    r.innerHTML =
      '<div style="color:#F5F5F7;font-family:system-ui;max-width:460px;margin:0 auto;padding:44px 24px;line-height:1.65;text-align:center;font-size:15px">' +
      msg +
      "</div>";
  }
}

try {
  const Entry = window.location.hash === "#assessment" ? AssessmentInicialScreen : CancioClub;
  ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Entry, null));
} catch (e) {
  console.error(e);
  fail(
    "<b>Erro ao iniciar o app.</b><br><br><span style=\"color:#8E8E93;font-size:13px\">" +
      (e && e.message ? e.message : "") +
      "</span>"
  );
}

if ("serviceWorker" in navigator) {
  // quando um SW novo assume (deploy novo), recarrega uma vez pra trocar o JS antigo pelo novo
  var hadController = !!navigator.serviceWorker.controller, reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (!hadController || reloaded) return;
    reloaded = true; window.location.reload();
  });
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
      reg.update();
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") reg.update(); });
    }).catch(function (e) {
      console.error("Cancio: Service Worker não registrou:", e);
    });
  });
}
