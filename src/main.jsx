import React from "react";
import ReactDOM from "react-dom/client";
import { CancioClub } from "./App.jsx";
import { AssessmentInicialScreen } from "./components/assessment/AssessmentInicialScreen.jsx";

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("Cancio: erro na tela", err, info && info.componentStack); }
  render() {
    if (!this.state.err) return this.props.children;
    const m = String((this.state.err && (this.state.err.stack || this.state.err.message)) || this.state.err).split("\n").slice(0, 4).join("\n");
    return React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, boxSizing: "border-box", color: "#F2F5FA", fontFamily: "Archivo, system-ui, sans-serif", textAlign: "center" } },
      React.createElement("b", { style: { fontSize: 18 } }, "Algo deu errado nesta tela."),
      React.createElement("span", { style: { fontSize: 15, color: "#AEB7C6" } }, "Seus dados estão salvos. Tire um print desta tela e mande pro suporte."),
      React.createElement("pre", { style: { maxWidth: 420, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 11, color: "#7D8698", background: "#0E1015", padding: 12, borderRadius: 10, textAlign: "left" } }, m),
      React.createElement("button", { onClick: () => window.location.reload(), style: { minHeight: 48, padding: "0 24px", borderRadius: 16, border: "none", background: "#F2F5FA", color: "#05060A", fontWeight: 800, fontSize: 15 } }, "Recarregar"));
  }
}

function fail(msg) {
  const r = document.getElementById("root");
  if (r) {
    r.innerHTML =
      '<div style="color:#F2F5FA;font-family:system-ui;max-width:460px;margin:0 auto;padding:44px 24px;line-height:1.65;text-align:center;font-size:15px">' +
      msg +
      "</div>";
  }
}

try {
  const Entry = window.location.hash === "#assessment" ? AssessmentInicialScreen : CancioClub;
  ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Boundary, null, React.createElement(Entry, null)));
} catch (e) {
  console.error(e);
  fail(
    "<b>Erro ao iniciar o app.</b><br><br><span style=\"color:#7D8698;font-size:13px\">" +
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
