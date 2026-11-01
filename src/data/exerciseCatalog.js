// Catálogo mestre de exercícios com mapa de ativação muscular (fração de série equivalente por
// músculo). Usado pelo calculador de volume (src/utils/volumeCalculator.js) — um exercício da
// ficha só entra na conta de volume se tiver um `catalogId` apontando pra uma chave aqui (ver
// nota em FichaEditor/addExercise sobre como esse vínculo é feito).
export const exerciseCatalog = {
  // ==========================================
  // COSTAS (Motor Primário: Dorsais e Trapézio/Romboides)
  // ==========================================
  "cost_barra_supinada": {
    id: "cost_barra_supinada",
    nome: "Barra pegada Supinada",
    motor_primario: "dorsais",
    categoria: "Puxar Vertical",
    ativacao: { dorsais: 1.0, biceps: 0.75, deltoide_posterior: 0.25 }
  },
  "cost_barra_neutra": {
    id: "cost_barra_neutra",
    nome: "Barra pegada Neutra",
    motor_primario: "dorsais",
    categoria: "Puxar Vertical",
    ativacao: { dorsais: 1.0, biceps: 0.5, braquiorradial: 0.5 }
  },
  "cost_barra_pronada": {
    id: "cost_barra_pronada",
    nome: "Barra pegada Pronada",
    motor_primario: "dorsais",
    categoria: "Puxar Vertical",
    ativacao: { dorsais: 1.0, biceps: 0.25, deltoide_posterior: 0.5 }
  },
  "cost_remada_aberta": {
    id: "cost_remada_aberta",
    nome: "Remada Aberta",
    motor_primario: "dorsais",
    categoria: "Puxar Horizontal",
    ativacao: { trapezio: 1.0, deltoide_posterior: 1.0, dorsais: 0.5, biceps: 0.25 }
  },
  "cost_remada_fechada": {
    id: "cost_remada_fechada",
    nome: "Remada Fechada",
    motor_primario: "dorsais",
    categoria: "Puxar Horizontal",
    ativacao: { dorsais: 1.0, biceps: 0.5, trapezio: 0.25 }
  },
  "cost_puxada_aberta": {
    id: "cost_puxada_aberta",
    nome: "Puxada Aberta",
    motor_primario: "dorsais",
    categoria: "Puxar Vertical",
    ativacao: { dorsais: 1.0, deltoide_posterior: 0.5, biceps: 0.25 }
  },
  "cost_puxada_fechada": {
    id: "cost_puxada_fechada",
    nome: "Puxada Fechada",
    motor_primario: "dorsais",
    categoria: "Puxar Vertical",
    ativacao: { dorsais: 1.0, biceps: 0.5 }
  },
  "cost_pulldown": {
    id: "cost_pulldown",
    nome: "Pulldown",
    motor_primario: "dorsais",
    categoria: "Isolador Dorsais",
    ativacao: { dorsais: 1.0, triceps_cabeça_longa: 0.25 }
  },
  "cost_kelso_shrugs": {
    id: "cost_kelso_shrugs",
    nome: "Kelso Shrugs",
    motor_primario: "trapezio",
    categoria: "Isolador Escapular",
    ativacao: { trapezio: 1.0, romboides: 1.0 }
  },

  // ==========================================
  // BÍCEPS
  // ==========================================
  "bic_rosca_biceps": {
    id: "bic_rosca_biceps",
    nome: "Rosca Bíceps",
    motor_primario: "biceps",
    categoria: "Isolador Bíceps",
    ativacao: { biceps: 1.0, antebraco: 0.25 }
  },
  "bic_rosca_scott": {
    id: "bic_rosca_scott",
    nome: "Rosca Scott",
    motor_primario: "biceps",
    categoria: "Isolador Bíceps (Pico de Contração)",
    ativacao: { biceps: 1.0, antebraco: 0.25 }
  },
  "bic_rosca_martelo": {
    id: "bic_rosca_martelo",
    nome: "Rosca Martelo",
    motor_primario: "braquial",
    categoria: "Isolador Braquial/Bíceps",
    ativacao: { braquial: 1.0, braquiorradial: 1.0, biceps: 0.5 }
  },
  "bic_banco_inclinado": {
    id: "bic_banco_inclinado",
    nome: "Bíceps banco Inclinado",
    motor_primario: "biceps",
    categoria: "Isolador Bíceps (Alongamento)",
    ativacao: { biceps: 1.0, antebraco: 0.25 }
  },

  // ==========================================
  // PEITO
  // ==========================================
  "peit_flexao_reta": {
    id: "peit_flexao_reta",
    nome: "Flexão Reta",
    motor_primario: "peitoral",
    categoria: "Empurrar Horizontal",
    ativacao: { peitoral: 1.0, deltoide_anterior: 0.5, triceps: 0.5 }
  },
  "peit_flexao_inclinada": {
    id: "peit_flexao_inclinada",
    nome: "Flexão Inclinada",
    motor_primario: "peitoral",
    categoria: "Empurrar Horizontal (Foco Inferior)",
    ativacao: { peitoral: 1.0, triceps: 0.5, deltoide_anterior: 0.25 }
  },
  "peit_flexao_declinada": {
    id: "peit_flexao_declinada",
    nome: "Flexão Declinada",
    motor_primario: "peitoral",
    categoria: "Empurrar Horizontal (Foco Superior)",
    ativacao: { peitoral: 1.0, deltoide_anterior: 0.75, triceps: 0.5 }
  },
  "peit_supino_reto": {
    id: "peit_supino_reto",
    nome: "Supino Reto",
    motor_primario: "peitoral",
    categoria: "Empurrar Horizontal",
    ativacao: { peitoral: 1.0, deltoide_anterior: 0.5, triceps: 0.5 }
  },
  "peit_supino_inclinado": {
    id: "peit_supino_inclinado",
    nome: "Supino Inclinado",
    motor_primario: "peitoral",
    categoria: "Empurrar Inclinado",
    ativacao: { peitoral: 1.0, deltoide_anterior: 0.75, triceps: 0.5 }
  },
  "peit_crucifixo": {
    id: "peit_crucifixo",
    nome: "Crucifixo",
    motor_primario: "peitoral",
    categoria: "Isolador Peitoral",
    ativacao: { peitoral: 1.0, deltoide_anterior: 0.5 }
  },
  "peit_cross_alta": {
    id: "peit_cross_alta",
    nome: "Cross Over Polia Alta",
    motor_primario: "peitoral",
    categoria: "Isolador Peitoral (Foco Inferior)",
    ativacao: { peitoral: 1.0, deltoide_anterior: 0.25 }
  },
  "peit_cross_baixa": {
    id: "peit_cross_baixa",
    nome: "Cross Over Polia Baixa",
    motor_primario: "peitoral",
    categoria: "Isolador Peitoral (Foco Superior)",
    ativacao: { peitoral: 1.0, deltoide_anterior: 0.5 }
  },
  "peit_paralela": {
    id: "peit_paralela",
    nome: "Paralela",
    motor_primario: "peitoral",
    categoria: "Empurrar Vertical",
    ativacao: { peitoral: 1.0, triceps: 1.0, deltoide_anterior: 0.5 }
  },

  // ==========================================
  // TRÍCEPS
  // ==========================================
  "tri_testa_polia": {
    id: "tri_testa_polia",
    nome: "Tríceps Testa Polia",
    motor_primario: "triceps",
    categoria: "Isolador Tríceps",
    ativacao: { triceps: 1.0 }
  },
  "tri_testa_halter": {
    id: "tri_testa_halter",
    nome: "Tríceps Testa Halter",
    motor_primario: "triceps",
    categoria: "Isolador Tríceps",
    ativacao: { triceps: 1.0 }
  },
  "tri_frances_polia": {
    id: "tri_frances_polia",
    nome: "Tríceps Francês Polia",
    motor_primario: "triceps",
    categoria: "Isolador Tríceps (Cabeça Longa)",
    ativacao: { triceps: 1.0 }
  },
  "tri_frances_halter": {
    id: "tri_frances_halter",
    nome: "Tríceps Francês Halter",
    motor_primario: "triceps",
    categoria: "Isolador Tríceps (Cabeça Longa)",
    ativacao: { triceps: 1.0 }
  },
  "tri_polia": {
    id: "tri_polia",
    nome: "Tríceps Polia",
    motor_primario: "triceps",
    categoria: "Isolador Tríceps",
    ativacao: { triceps: 1.0 }
  },
  "tri_mergulho": {
    id: "tri_mergulho",
    nome: "Tríceps Mergulho",
    motor_primario: "triceps",
    categoria: "Empurrar Vertical",
    ativacao: { triceps: 1.0, peitoral: 0.5, deltoide_anterior: 0.5 }
  },

  // ==========================================
  // QUADRÍCEPS
  // ==========================================
  "quad_agachamento_livre": {
    id: "quad_agachamento_livre",
    nome: "Agachamento Livre",
    motor_primario: "quadriceps",
    categoria: "Joelho Dominante (Básico)",
    ativacao: { quadriceps: 1.0, gluteos: 0.75, adutores: 0.5, eretores_espinha: 0.5 }
  },
  "quad_leg_press_45": {
    id: "quad_leg_press_45",
    nome: "Leg Press 45",
    motor_primario: "quadriceps",
    categoria: "Joelho Dominante",
    ativacao: { quadriceps: 1.0, gluteos: 0.5, adutores: 0.25 }
  },
  "quad_pendulo": {
    id: "quad_pendulo",
    nome: "Pêndulo",
    motor_primario: "quadriceps",
    categoria: "Joelho Dominante (Máquina)",
    ativacao: { quadriceps: 1.0, gluteos: 0.5 }
  },
  "quad_hack_machine": {
    id: "quad_hack_machine",
    nome: "Hack Machine",
    motor_primario: "quadriceps",
    categoria: "Joelho Dominante (Máquina)",
    ativacao: { quadriceps: 1.0, gluteos: 0.5 }
  },
  "quad_cadeira_extensora": {
    id: "quad_cadeira_extensora",
    nome: "Cadeira Extensora",
    motor_primario: "quadriceps",
    categoria: "Isolador Quadríceps",
    ativacao: { quadriceps: 1.0 }
  },
  "quad_afundo": {
    id: "quad_afundo",
    nome: "Afundo",
    motor_primario: "quadriceps",
    categoria: "Joelho Dominante (Unilateral)",
    ativacao: { quadriceps: 1.0, gluteos: 0.75, adutores: 0.25 }
  },
  "quad_flexao_quadril_deitado": {
    id: "quad_flexao_quadril_deitado",
    nome: "Flexão de Quadril Deitado",
    motor_primario: "reto_femoral",
    categoria: "Isolador Flexores de Quadril",
    ativacao: { reto_femoral: 1.0, iliopsoas: 1.0 }
  },
  "quad_flexao_nordica_inversa": {
    id: "quad_flexao_nordica_inversa",
    nome: "Flexão Nórdica Inversa",
    motor_primario: "quadriceps",
    categoria: "Isolador Quadríceps (Excêntrico/Alongamento)",
    ativacao: { quadriceps: 1.0 }
  },

  // ==========================================
  // ISQUIOTIBIAIS
  // ==========================================
  "isq_stiff": {
    id: "isq_stiff",
    nome: "Stiff",
    motor_primario: "isquiotibiais",
    categoria: "Quadril Dominante (Foco Isquiotibiais)",
    ativacao: { isquiotibiais: 1.0, gluteos: 0.75, eretores_espinha: 0.5 }
  },
  "isq_bom_dia": {
    id: "isq_bom_dia",
    nome: "Bom dia",
    motor_primario: "isquiotibiais",
    categoria: "Quadril Dominante",
    ativacao: { isquiotibiais: 1.0, gluteos: 0.75, eretores_espinha: 0.75 }
  },
  "isq_mesa_flexora": {
    id: "isq_mesa_flexora",
    nome: "Mesa Flexora",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais",
    ativacao: { isquiotibiais: 1.0, panturrilhas: 0.25 }
  },
  "isq_cadeira_flexora": {
    id: "isq_cadeira_flexora",
    nome: "Cadeira Flexora",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais (Alongamento)",
    ativacao: { isquiotibiais: 1.0, panturrilhas: 0.25 }
  },
  "isq_flexora_em_pe": {
    id: "isq_flexora_em_pe",
    nome: "Flexora em pé",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais (Unilateral)",
    ativacao: { isquiotibiais: 1.0 }
  },
  "isq_flexao_nordica": {
    id: "isq_flexao_nordica",
    nome: "Flexão Nórdica",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais (Excêntrico/Força)",
    ativacao: { isquiotibiais: 1.0 }
  },

  // ==========================================
  // GLÚTEOS
  // ==========================================
  "glut_cadeira_abdutora": {
    id: "glut_cadeira_abdutora",
    nome: "Cadeira Abdutora",
    motor_primario: "gluteos",
    categoria: "Isolador Glúteo (Médio/Mínimo)",
    ativacao: { gluteo_medio: 1.0, gluteo_minimo: 1.0 }
  },
  "glut_rdl": {
    id: "glut_rdl",
    nome: "RDL",
    motor_primario: "gluteos",
    categoria: "Quadril Dominante (Foco Glúteo)",
    ativacao: { gluteos: 1.0, isquiotibiais: 0.75, eretores_espinha: 0.5 }
  },
  "glut_extensao_quadril_polia": {
    id: "glut_extensao_quadril_polia",
    nome: "Extensão de Quadril Polia",
    motor_primario: "gluteos",
    categoria: "Isolador Glúteo (Máximo)",
    ativacao: { gluteos: 1.0, isquiotibiais: 0.25 }
  },
  "glut_coice_polia": {
    id: "glut_coice_polia",
    nome: "Coice Polia",
    motor_primario: "gluteos",
    categoria: "Isolador Glúteo",
    ativacao: { gluteos: 1.0, isquiotibiais: 0.25 }
  },
  "glut_levantamento_terra": {
    id: "glut_levantamento_terra",
    nome: "Levantamento Terra",
    motor_primario: "gluteos",
    categoria: "Híbrido Quadril/Joelho",
    ativacao: { gluteos: 1.0, isquiotibiais: 0.75, eretores_espinha: 1.0, quadriceps: 0.5 }
  },
  "glut_elevacao_pelvica": {
    id: "glut_elevacao_pelvica",
    nome: "Elevação Pélvica",
    motor_primario: "gluteos",
    categoria: "Extensão de Quadril Pura",
    ativacao: { gluteos: 1.0, isquiotibiais: 0.25 }
  },
  "glut_bulgaro": {
    id: "glut_bulgaro",
    nome: "Búlgaro",
    motor_primario: "gluteos",
    categoria: "Híbrido Unilateral",
    ativacao: { gluteos: 1.0, quadriceps: 0.75, adutores: 0.25 }
  },
  "glut_step_up": {
    id: "glut_step_up",
    nome: "Step Up",
    motor_primario: "gluteos",
    categoria: "Híbrido Unilateral",
    ativacao: { gluteos: 1.0, quadriceps: 0.75 }
  },
  "glut_krause": {
    id: "glut_krause",
    nome: "Glúteo Krause",
    motor_primario: "gluteos",
    categoria: "Isolador Glúteo (Unilateral)",
    ativacao: { gluteos: 1.0, quadriceps: 0.25 }
  },

  // ==========================================
  // ADUTORES
  // ==========================================
  "adut_cadeira_adutora": {
    id: "adut_cadeira_adutora",
    nome: "Cadeira Adutora",
    motor_primario: "adutores",
    categoria: "Isolador Adutores",
    ativacao: { adutores: 1.0 }
  }
};

// Agrupado por categoria pra popular o <select> de vínculo no editor de ficha (CatalogSelect) —
// dado estático, computado uma vez aqui em vez de recalcular em cada componente que o usa.
const catalogByCategory = (() => {
    const groups = {};
    Object.values(exerciseCatalog).forEach((entry) => {
        const cat = entry.categoria || "Outros";
        (groups[cat] = groups[cat] || []).push(entry);
    });
    return Object.entries(groups).map(([categoria, entries]) => ({ categoria, entries: entries.slice().sort((a, b) => a.nome.localeCompare(b.nome)) }));
})();

export { catalogByCategory };
