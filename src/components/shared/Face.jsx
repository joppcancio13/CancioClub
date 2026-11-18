import React from "react";
import { C, F } from "../../styles/tokens";

// Foto redonda de uma pessoa (aluno ou professor), com as iniciais quando não há foto.
// Usada na lista de alunos, nos Recados (lista, conversa, nova conversa) e no topo do chat do aluno.
const initialsOf = (name) => String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");

function Face({ src, name, size = 36, ring = false }) {
    return (
        <span aria-hidden="true" style={{ width: size, height: size, flex: "none", borderRadius: "50%", overflow: "hidden", background: C.raised, boxShadow: ring ? `inset 0 0 0 1.5px ${C.text2}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body, fontSize: Math.max(11, Math.round(size * 0.34)), fontWeight: 700, color: C.text }}>
            {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initialsOf(name)}
        </span>
    );
}

// reduz a foto a um quadrado de 320 px em JPEG (~25 KB): cabe no registro e sincroniza sem bucket
function readSquarePhoto(file, S = 320) {
    return new Promise((res, rej) => {
        const r = new FileReader(); r.onerror = rej;
        r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const c = document.createElement("canvas"); c.width = S; c.height = S; const k = Math.max(S / img.width, S / img.height); c.getContext("2d").drawImage(img, (S - img.width * k) / 2, (S - img.height * k) / 2, img.width * k, img.height * k); res(c.toDataURL("image/jpeg", 0.8)); }; img.src = r.result; };
        r.readAsDataURL(file);
    });
}

// foto de corpo: mantém a proporção (retrato), lado maior 480 px (~35 KB; vai no registro do aluno)
function readBodyPhoto(file, S = 480) {
    return new Promise((res, rej) => {
        const r = new FileReader(); r.onerror = rej;
        r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const c = document.createElement("canvas"); const k = Math.min(1, S / Math.max(img.width, img.height)); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.72)); }; img.src = r.result; };
        r.readAsDataURL(file);
    });
}

export { Face, initialsOf, readSquarePhoto, readBodyPhoto };
