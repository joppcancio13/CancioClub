import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xyeydcgohqylaytpeabk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZXlkY2dvaHF5bGF5dHBlYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDU1NzksImV4cCI6MjA5ODc4MTU3OX0.s4hwY7FNr6Nbmxv_mPFMAdDbz6XXNkWgkDSZqrYhdRk";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
function withTimeout(promise, ms) { return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]); }
// Tudo que é ação do ALUNO (login por código, salvar carga/reps) passa por essa Edge Function em vez
// de falar direto com a tabela `cancio` — o aluno nunca autentica de verdade, então a única forma de
// não expor a ficha de TODOS os alunos pra anon key é validar o código no servidor, com a service
// role key, e só então tocar na linha certa. O professor continua indo direto pra tabela (linha
// abaixo em saveGlobalToCloud/saveStudentToCloud/loadData) porque ele autentica de verdade e a RLS
// já cobre esse caso.
async function callStudentApi(action, payload) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ action, ...payload }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok)
        throw new Error((body && body.error) || `erro ${res.status}`);
    return body;
}
const saveGlobalToCloud = async (globalData) => {
    if (globalData.isSeed)
        return false;
    if (!sb)
        return false;
    try {
        const { error } = await sb.from("cancio").upsert({ id: "global", data: { ...globalData, updatedAt: Date.now() } });
        if (error)
            throw error;
        return true;
    }
    catch (e) {
        console.error("Cancio: falha ao sincronizar dados globais:", e);
        return false;
    }
};
const saveStudentToCloud = async (studentData, isSeed) => {
    if (isSeed)
        return false;
    if (!sb)
        return false;
    try {
        const { error } = await sb.from("cancio").upsert({ id: "student_" + studentData.id, data: { ...studentData, updatedAt: Date.now() } });
        if (error)
            throw error;
        return true;
    }
    catch (e) {
        console.error("Cancio: falha ao sincronizar aluno " + studentData.id + ":", e);
        return false;
    }
};
async function deleteStudentFromCloud(id) {
    if (!sb)
        return false;
    try {
        const { error } = await sb.from("cancio").delete().eq("id", "student_" + id);
        if (error)
            throw error;
        return true;
    }
    catch (e) {
        console.error("Cancio: falha ao remover aluno da nuvem:", e);
        return false;
    }
}
export { SUPABASE_URL, SUPABASE_ANON_KEY, sb, withTimeout, callStudentApi, saveGlobalToCloud, saveStudentToCloud, deleteStudentFromCloud };
