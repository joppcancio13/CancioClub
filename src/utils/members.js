// Número de membro por ordem de entrada. Os dois primeiros são fixos.
const FIXED = { "joão pedro cancio": 0, "ana bia": 1 };
const norm = (s) => (s || "").trim().toLowerCase().normalize("NFC");

// devolve { [id]: número } só para quem ainda não tem memberNo (na ordem da lista de alunos)
function assignMemberNumbers(students) {
    const used = new Set(students.filter((s) => Number.isInteger(s.memberNo)).map((s) => s.memberNo));
    Object.values(FIXED).forEach((n) => used.add(n));
    const out = {};
    // ordem de entrada: data de início da ficha (quem não tem vai pro fim, na ordem da lista)
    const order = students.map((s, i) => ({ s, i })).sort((a, b) => { const da = a.s.startDate || "9999", db = b.s.startDate || "9999"; return da < db ? -1 : da > db ? 1 : a.i - b.i; }).map((x) => x.s);
    order.forEach((s) => {
        if (Number.isInteger(s.memberNo)) return;
        const f = FIXED[norm(s.name)];
        if (f != null && !students.some((o) => o.id !== s.id && o.memberNo === f) && !Object.values(out).includes(f)) { out[s.id] = f; return; }
        let n = 0; while (used.has(n)) n++;
        used.add(n); out[s.id] = n;
    });
    return out;
}
const fmtMemberNo = (n) => (Number.isInteger(n) ? String(n).padStart(4, "0") : "—");
const MO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const fmtSince = (iso) => { if (!iso) return "—"; const [y, m] = String(iso).slice(0, 10).split("-").map(Number); return y && m ? `${MO[m - 1]} ${y}` : "—"; };

export { assignMemberNumbers, fmtMemberNo, fmtSince };
