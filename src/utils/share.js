// `<a download>` sozinho não é confiável no Safari/iOS (principalmente dentro do PWA em modo
// standalone, sem aba nova pra "cair" o download). navigator.share com arquivo abre a folha
// nativa, que tem "Salvar Imagem" como opção de verdade; só cai pro <a download> em navegadores
// sem suporte a isso (desktop, por exemplo), onde o <a download> funciona normalmente.
// Centraliza o que antes estava reimplementado em ShareCard/SerieExport/AssessmentExport.
function downloadBlobNow(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
}
async function shareOrDownloadBlob(blob, filename, title) {
    if (!blob)
        return; // canvas.toBlob pode entregar null (ex. canvas sem conteúdo útil) — nada a salvar
    try {
        const file = new File([blob], filename, { type: blob.type || "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title });
            return;
        }
        downloadBlobNow(blob, filename);
    } catch (e) {
        if (e && e.name === "AbortError")
            return; // usuário cancelou a folha de compartilhar de propósito — não faz nada
        downloadBlobNow(blob, filename);
    }
}
export { downloadBlobNow, shareOrDownloadBlob };
