import React from "react";
import { C, F } from "../../styles/tokens";

// Rosto de quem está na conversa (18/nov): foto quando existe, senão as iniciais.
const initialsOf = (name) => String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");

function PersonAvatar({ photo, name, size = 36, style }) {
    return (
        <span aria-hidden="true" style={{ width: size, height: size, flex: "none", borderRadius: "50%", overflow: "hidden", background: C.raised, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body, fontSize: Math.round(size * 0.36), fontWeight: 700, color: C.text, ...style }}>
            {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : initialsOf(name)}
        </span>
    );
}

// reduz uma foto escolhida no celular pra um quadrado pequeno (JPEG), bom pra avatar
const avatarFromFile = (file, S = 240) => new Promise((res, rej) => {
    const r = new FileReader(); r.onerror = rej;
    r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const c = document.createElement("canvas"); c.width = S; c.height = S; const k = Math.max(S / img.width, S / img.height); const w = img.width * k, h = img.height * k; c.getContext("2d").drawImage(img, (S - w) / 2, (S - h) / 2, w, h); res(c.toDataURL("image/jpeg", 0.82)); }; img.src = r.result; };
    r.readAsDataURL(file);
});

export { PersonAvatar, initialsOf, avatarFromFile };
