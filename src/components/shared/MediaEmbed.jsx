import React from "react";
import { C, F } from "../../styles/tokens";
import { ytId } from "../../utils/misc";

function MediaEmbed({ url }) {
    const yt = ytId(url);
    if (yt)
        return React.createElement("div", { style: { position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", marginTop: 10 } },
            React.createElement("iframe", { src: `https://www.youtube.com/embed/${yt}`, title: "demonstra\u00E7\u00E3o", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, style: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 } }));
    if (/\.(gif|png|jpe?g|webp)(\?|$)/i.test(url))
        return React.createElement("img", { src: url, alt: "demonstra\u00E7\u00E3o", style: { width: "100%", borderRadius: 10, marginTop: 10 } });
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(url))
        return React.createElement("video", { src: url, controls: true, playsInline: true, style: { width: "100%", borderRadius: 10, marginTop: 10 } });
    return React.createElement("a", { href: url, target: "_blank", rel: "noreferrer", style: { display: "inline-block", marginTop: 10, fontFamily: F.mono, fontSize: 13, color: C.amber } }, "Abrir v\u00EDdeo \u2197");
}
export { MediaEmbed };
