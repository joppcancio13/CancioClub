// Catálogo mestre de exercícios com mapa de ativação muscular (fração de série equivalente por
// músculo) e `grupo` (porção muscular ampla — usado pelo seletor em duas etapas no editor de
// ficha e pelo agrupamento do VolumeDashboard). Usado pelo calculador de volume
// (src/utils/volumeCalculator.js) — um exercício da ficha só entra na conta de volume se tiver um
// `catalogId` apontando pra uma chave aqui.
export const exerciseCatalog = {
  // ==========================================
  // COSTAS (Latíssimo, Redondos, Romboides e Trapézio)
  // ==========================================
  "cost_barra_supinada": {
    id: "cost_barra_supinada",
    nome: "Barra pegada Supinada",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 1.0, redondos: 0.5, biceps_cabeca_curta: 0.8, trapezio_inferior: 0.4 }
  },
  "cost_barra_neutra": {
    id: "cost_barra_neutra",
    nome: "Barra pegada Neutra",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 1.0, redondos: 0.6, braquial: 0.6, braquiorradial: 0.5, biceps_cabeca_longa: 0.4 }
  },
  "cost_barra_pronada": {
    id: "cost_barra_pronada",
    nome: "Barra pegada Pronada",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 0.8, redondos: 0.9, trapezio_inferior: 0.6, romboides: 0.5, deltoide_posterior: 0.5, biceps_cabeca_curta: 0.3 }
  },
  "cost_remada_aberta": {
    id: "cost_remada_aberta",
    nome: "Remada Aberta",
    motor_primario: "trapezio_medio",
    categoria: "Puxar Horizontal",
    grupo: "Costas",
    ativacao: { trapezio_medio: 1.0, romboides: 1.0, deltoide_posterior: 1.0, latissimo_dorso: 0.4, biceps_cabeca_longa: 0.4 }
  },
  "cost_remada_fechada": {
    id: "cost_remada_fechada",
    nome: "Remada Fechada",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Horizontal",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 1.0, romboides: 0.6, trapezio_medio: 0.5, braquial: 0.6, biceps_cabeca_longa: 0.4 }
  },
  "cost_puxada_aberta": {
    id: "cost_puxada_aberta",
    nome: "Puxada Aberta",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 0.9, redondos: 1.0, trapezio_inferior: 0.6, deltoide_posterior: 0.5, biceps_cabeca_curta: 0.4 }
  },
  "cost_puxada_fechada": {
    id: "cost_puxada_fechada",
    nome: "Puxada Fechada",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 1.0, redondos: 0.7, braquial: 0.6, biceps_cabeca_curta: 0.5 }
  },
  "cost_pulldown": {
    id: "cost_pulldown",
    nome: "Pulldown",
    motor_primario: "latissimo_dorso",
    categoria: "Isolador Dorsais",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 1.0, redondos: 0.8, triceps_longa: 0.4 }
  },
  "cost_kelso_shrugs": {
    id: "cost_kelso_shrugs",
    nome: "Kelso Shrugs",
    motor_primario: "trapezio_medio",
    categoria: "Isolador Escapular",
    grupo: "Costas",
    ativacao: { trapezio_medio: 1.0, trapezio_superior: 0.8, romboides: 1.0 }
  },

  // ==========================================
  // BÍCEPS & BRAQUIAL
  // ==========================================
  "bic_rosca_biceps": {
    id: "bic_rosca_biceps",
    nome: "Rosca Bíceps",
    motor_primario: "biceps_cabeca_longa",
    categoria: "Isolador Bíceps",
    grupo: "Bíceps",
    ativacao: { biceps_cabeca_longa: 0.8, biceps_cabeca_curta: 0.8, braquial: 0.5, braquiorradial: 0.4 }
  },
  "bic_rosca_scott": {
    id: "bic_rosca_scott",
    nome: "Rosca Scott",
    motor_primario: "biceps_cabeca_curta",
    categoria: "Isolador Bíceps (Pico de Contração)",
    grupo: "Bíceps",
    ativacao: { biceps_cabeca_curta: 1.0, biceps_cabeca_longa: 0.4, braquial: 0.6, braquiorradial: 0.4 }
  },
  "bic_rosca_martelo": {
    id: "bic_rosca_martelo",
    nome: "Rosca Martelo",
    motor_primario: "braquial",
    categoria: "Isolador Braquial",
    grupo: "Bíceps",
    ativacao: { braquial: 1.0, braquiorradial: 0.9, biceps_cabeca_longa: 0.3, biceps_cabeca_curta: 0.3 }
  },
  "bic_banco_inclinado": {
    id: "bic_banco_inclinado",
    nome: "Bíceps banco Inclinado",
    motor_primario: "biceps_cabeca_longa",
    categoria: "Isolador Bíceps (Alongamento)",
    grupo: "Bíceps",
    ativacao: { biceps_cabeca_longa: 1.0, biceps_cabeca_curta: 0.5, braquial: 0.3 }
  },

  // ==========================================
  // PEITORAL
  // ==========================================
  "peit_flexao_reta": {
    id: "peit_flexao_reta",
    nome: "Flexão Reta",
    motor_primario: "peitoral_esternocostal",
    categoria: "Empurrar Horizontal",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 0.8, peitoral_clavicular: 0.6, deltoide_anterior: 0.6, triceps_lateral: 0.5, triceps_medial: 0.5 }
  },
  "peit_flexao_inclinada": {
    id: "peit_flexao_inclinada",
    nome: "Flexão Inclinada (Mãos Apoiadas)",
    motor_primario: "peitoral_esternocostal",
    categoria: "Empurrar Horizontal (Foco Inferior)",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 1.0, peitoral_clavicular: 0.3, deltoide_anterior: 0.3, triceps_lateral: 0.4, triceps_medial: 0.4 }
  },
  "peit_flexao_declinada": {
    id: "peit_flexao_declinada",
    nome: "Flexão Declinada (Pés Apoiados)",
    motor_primario: "peitoral_clavicular",
    categoria: "Empurrar Horizontal (Foco Superior)",
    grupo: "Peitoral",
    ativacao: { peitoral_clavicular: 1.0, peitoral_esternocostal: 0.5, deltoide_anterior: 0.8, triceps_lateral: 0.5, triceps_medial: 0.5 }
  },
  "peit_supino_reto": {
    id: "peit_supino_reto",
    nome: "Supino Reto",
    motor_primario: "peitoral_esternocostal",
    categoria: "Empurrar Horizontal",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 0.9, peitoral_clavicular: 0.6, deltoide_anterior: 0.6, triceps_lateral: 0.6, triceps_medial: 0.6 }
  },
  "peit_supino_inclinado": {
    id: "peit_supino_inclinado",
    nome: "Supino Inclinado",
    motor_primario: "peitoral_clavicular",
    categoria: "Empurrar Inclinado",
    grupo: "Peitoral",
    ativacao: { peitoral_clavicular: 1.0, peitoral_esternocostal: 0.5, deltoide_anterior: 0.8, triceps_lateral: 0.5, triceps_medial: 0.5 }
  },
  "peit_crucifixo": {
    id: "peit_crucifixo",
    nome: "Crucifixo",
    motor_primario: "peitoral_esternocostal",
    categoria: "Isolador Peitoral",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 0.9, peitoral_clavicular: 0.6, deltoide_anterior: 0.4 }
  },
  "peit_cross_alta": {
    id: "peit_cross_alta",
    nome: "Cross Over Polia Alta",
    motor_primario: "peitoral_esternocostal",
    categoria: "Isolador Peitoral (Foco Inferior)",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 1.0, peitoral_menor: 0.6, peitoral_clavicular: 0.2, deltoide_anterior: 0.3 }
  },
  "peit_cross_baixa": {
    id: "peit_cross_baixa",
    nome: "Cross Over Polia Baixa",
    motor_primario: "peitoral_clavicular",
    categoria: "Isolador Peitoral (Foco Superior)",
    grupo: "Peitoral",
    ativacao: { peitoral_clavicular: 1.0, peitoral_esternocostal: 0.4, deltoide_anterior: 0.7 }
  },
  "peit_paralela": {
    id: "peit_paralela",
    nome: "Paralela",
    motor_primario: "peitoral_esternocostal",
    categoria: "Empurrar Vertical",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 1.0, peitoral_menor: 0.8, triceps_lateral: 0.8, triceps_medial: 0.8, triceps_longa: 0.4, deltoide_anterior: 0.6 }
  },

  // ==========================================
  // TRÍCEPS
  // ==========================================
  "tri_testa_polia": {
    id: "tri_testa_polia",
    nome: "Tríceps Testa Polia",
    motor_primario: "triceps_medial",
    categoria: "Isolador Tríceps",
    grupo: "Tríceps",
    ativacao: { triceps_longa: 0.8, triceps_lateral: 0.8, triceps_medial: 0.8 }
  },
  "tri_testa_halter": {
    id: "tri_testa_halter",
    nome: "Tríceps Testa Halter",
    motor_primario: "triceps_medial",
    categoria: "Isolador Tríceps",
    grupo: "Tríceps",
    ativacao: { triceps_longa: 0.8, triceps_lateral: 0.8, triceps_medial: 0.8 }
  },
  "tri_frances_polia": {
    id: "tri_frances_polia",
    nome: "Tríceps Francês Polia",
    motor_primario: "triceps_longa",
    categoria: "Isolador Tríceps (Cabeça Longa)",
    grupo: "Tríceps",
    ativacao: { triceps_longa: 1.0, triceps_lateral: 0.6, triceps_medial: 0.6 }
  },
  "tri_frances_halter": {
    id: "tri_frances_halter",
    nome: "Tríceps Francês Halter",
    motor_primario: "triceps_longa",
    categoria: "Isolador Tríceps (Cabeça Longa)",
    grupo: "Tríceps",
    ativacao: { triceps_longa: 1.0, triceps_lateral: 0.6, triceps_medial: 0.6 }
  },
  "tri_polia": {
    id: "tri_polia",
    nome: "Tríceps Polia",
    motor_primario: "triceps_lateral",
    categoria: "Isolador Tríceps",
    grupo: "Tríceps",
    ativacao: { triceps_lateral: 1.0, triceps_medial: 1.0, triceps_longa: 0.4 }
  },
  "tri_mergulho": {
    id: "tri_mergulho",
    nome: "Tríceps Mergulho no Banco",
    motor_primario: "triceps_lateral",
    categoria: "Empurrar Vertical",
    grupo: "Tríceps",
    ativacao: { triceps_lateral: 1.0, triceps_medial: 1.0, triceps_longa: 0.5, peitoral_esternocostal: 0.4, deltoide_anterior: 0.6 }
  },

  // ==========================================
  // QUADRÍCEPS & FLEXORES DO QUADRIL
  // ==========================================
  "quad_agachamento_livre": {
    id: "quad_agachamento_livre",
    nome: "Agachamento Livre",
    motor_primario: "vasto_lateral",
    categoria: "Joelho Dominante (Básico)",
    grupo: "Quadríceps",
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.9, adutores: 0.6, eretores_espinha: 0.6, reto_femoral: 0.1 }
  },
  "quad_leg_press_45": {
    id: "quad_leg_press_45",
    nome: "Leg Press 45",
    motor_primario: "vasto_lateral",
    categoria: "Joelho Dominante",
    grupo: "Quadríceps",
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.7, adutores: 0.4, reto_femoral: 0.1 }
  },
  "quad_pendulo": {
    id: "quad_pendulo",
    nome: "Pêndulo",
    motor_primario: "vasto_medial",
    categoria: "Joelho Dominante (Máquina)",
    grupo: "Quadríceps",
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.8, reto_femoral: 0.1 }
  },
  "quad_hack_machine": {
    id: "quad_hack_machine",
    nome: "Hack Machine",
    motor_primario: "vasto_lateral",
    categoria: "Joelho Dominante (Máquina)",
    grupo: "Quadríceps",
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.7, reto_femoral: 0.1 }
  },
  "quad_cadeira_extensora": {
    id: "quad_cadeira_extensora",
    nome: "Cadeira Extensora",
    motor_primario: "reto_femoral",
    categoria: "Isolador Quadríceps",
    grupo: "Quadríceps",
    ativacao: { reto_femoral: 1.0, vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0 }
  },
  "quad_afundo": {
    id: "quad_afundo",
    nome: "Afundo",
    motor_primario: "vasto_lateral",
    categoria: "Joelho Dominante (Unilateral)",
    grupo: "Quadríceps",
    ativacao: { vasto_lateral: 0.9, vasto_medial: 0.9, vasto_intermedio: 0.9, gluteo_maximo: 0.9, gluteo_medio: 0.4, adutores: 0.4, reto_femoral: 0.2 }
  },
  "quad_flexao_quadril_deitado": {
    id: "quad_flexao_quadril_deitado",
    nome: "Flexão de Quadril Deitado",
    motor_primario: "iliopsoas",
    categoria: "Isolador Flexores de Quadril",
    grupo: "Quadríceps",
    ativacao: { reto_femoral: 1.0, iliopsoas: 1.0 }
  },
  "quad_flexao_nordica_inversa": {
    id: "quad_flexao_nordica_inversa",
    nome: "Flexão Nórdica Inversa",
    motor_primario: "reto_femoral",
    categoria: "Isolador Quadríceps (Excêntrico/Alongamento)",
    grupo: "Quadríceps",
    ativacao: { reto_femoral: 1.0, vasto_lateral: 0.8, vasto_medial: 0.8, vasto_intermedio: 0.8 }
  },

  // ==========================================
  // ISQUIOTIBIAIS
  // ==========================================
  "isq_stiff": {
    id: "isq_stiff",
    nome: "Stiff",
    motor_primario: "isquiotibiais",
    categoria: "Quadril Dominante (Foco Isquiotibiais)",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 1.0, gluteo_maximo: 0.8, eretores_espinha: 0.6, adutores: 0.4 }
  },
  "isq_bom_dia": {
    id: "isq_bom_dia",
    nome: "Bom dia",
    motor_primario: "isquiotibiais",
    categoria: "Quadril Dominante",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 0.9, gluteo_maximo: 0.8, eretores_espinha: 0.9, adutores: 0.3 }
  },
  "isq_mesa_flexora": {
    id: "isq_mesa_flexora",
    nome: "Mesa Flexora",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 0.8, gastrocnemio: 0.3 }
  },
  "isq_cadeira_flexora": {
    id: "isq_cadeira_flexora",
    nome: "Cadeira Flexora",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais (Alongamento)",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 1.0, gastrocnemio: 0.3 }
  },
  "isq_flexora_em_pe": {
    id: "isq_flexora_em_pe",
    nome: "Flexora em pé",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais (Unilateral)",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 0.8, gastrocnemio: 0.3 }
  },
  "isq_flexao_nordica": {
    id: "isq_flexao_nordica",
    nome: "Flexão Nórdica",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais (Excêntrico/Força)",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 1.0, gastrocnemio: 0.4 }
  },

  // ==========================================
  // GLÚTEOS
  // ==========================================
  "glut_cadeira_abdutora": {
    id: "glut_cadeira_abdutora",
    nome: "Cadeira Abdutora",
    motor_primario: "gluteo_medio",
    categoria: "Isolador Glúteo (Médio/Mínimo)",
    grupo: "Glúteos",
    ativacao: { gluteo_medio: 1.0, gluteo_minimo: 1.0, gluteo_maximo: 0.2 }
  },
  "glut_rdl": {
    id: "glut_rdl",
    nome: "RDL",
    motor_primario: "gluteo_maximo",
    categoria: "Quadril Dominante (Foco Glúteo)",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.8, eretores_espinha: 0.6, adutores: 0.4 }
  },
  "glut_extensao_quadril_polia": {
    id: "glut_extensao_quadril_polia",
    nome: "Extensão de Quadril Polia (Perna Esticada)",
    motor_primario: "gluteo_maximo",
    categoria: "Isolador Glúteo (Máximo)",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.4, gluteo_medio: 0.3 }
  },
  "glut_coice_polia": {
    id: "glut_coice_polia",
    nome: "Coice Polia (Joelho Flexionado)",
    motor_primario: "gluteo_maximo",
    categoria: "Isolador Glúteo",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.1 }
  },
  "glut_levantamento_terra": {
    id: "glut_levantamento_terra",
    nome: "Levantamento Terra",
    motor_primario: "gluteo_maximo",
    categoria: "Híbrido Quadril/Joelho",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.7, eretores_espinha: 1.0, vasto_lateral: 0.6, vasto_medial: 0.6, vasto_intermedio: 0.6 }
  },
  "glut_elevacao_pelvica": {
    id: "glut_elevacao_pelvica",
    nome: "Elevação Pélvica",
    motor_primario: "gluteo_maximo",
    categoria: "Extensão de Quadril Pura",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.2, vasto_lateral: 0.3, vasto_medial: 0.3 }
  },
  "glut_bulgaro": {
    id: "glut_bulgaro",
    nome: "Búlgaro",
    motor_primario: "gluteo_maximo",
    categoria: "Híbrido Unilateral",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, gluteo_medio: 0.5, vasto_lateral: 0.8, vasto_medial: 0.8, vasto_intermedio: 0.8, adutores: 0.5 }
  },
  "glut_step_up": {
    id: "glut_step_up",
    nome: "Step Up",
    motor_primario: "gluteo_maximo",
    categoria: "Híbrido Unilateral",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, gluteo_medio: 0.6, vasto_lateral: 0.8, vasto_medial: 0.8, vasto_intermedio: 0.8 }
  },
  "glut_krause": {
    id: "glut_krause",
    nome: "Glúteo Krause",
    motor_primario: "gluteo_maximo",
    categoria: "Isolador Glúteo (Unilateral)",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.2 }
  },
  // Entrada solta no texto original (fora de qualquer seção comentada) — encaixada aqui por ser,
  // na prática, quase idêntica a glut_extensao_quadril_polia. `gluteos` corrigido pra
  // `gluteo_maximo` (ver aviso na resposta) pra não virar um músculo órfão fora do mapa de grupos.
  "extensao_quadril_romano": {
    id: "extensao_quadril_romano",
    nome: "Extensão de Quadril no Banco Romano",
    motor_primario: "gluteo_maximo",
    categoria: "Extensão de Quadril",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.8, eretores_espinha: 0.6 }
  },

  // ==========================================
  // ADUTORES
  // ==========================================
  "adut_cadeira_adutora": {
    id: "adut_cadeira_adutora",
    nome: "Cadeira Adutora",
    motor_primario: "adutores",
    categoria: "Isolador Adutores",
    grupo: "Adutores",
    ativacao: { adutores: 1.0 }
  },

  // ==========================================
  // OMBROS
  // ==========================================
  "omb_desenvolvimento": {
    id: "omb_desenvolvimento",
    nome: "Desenvolvimento",
    motor_primario: "deltoide_anterior",
    categoria: "Empurrar Vertical",
    grupo: "Ombros",
    ativacao: { deltoide_anterior: 1.0, deltoide_lateral: 0.5, triceps: 0.6, trapezio: 0.3 }
  },
  "omb_elevacao_frontal": {
    id: "omb_elevacao_frontal",
    nome: "Elevação Frontal",
    motor_primario: "deltoide_anterior",
    categoria: "Isolador Superior",
    grupo: "Ombros",
    ativacao: { deltoide_anterior: 1.0, peitoral_clavicular: 0.2 }
  },
  "omb_elevacao_lateral": {
    id: "omb_elevacao_lateral",
    nome: "Elevação Lateral",
    motor_primario: "deltoide_lateral",
    categoria: "Isolador Superior",
    grupo: "Ombros",
    ativacao: { deltoide_lateral: 1.0, trapezio: 0.3 }
  },
  "omb_crucifixo_inverso": {
    id: "omb_crucifixo_inverso",
    nome: "Crucifixo Inverso",
    motor_primario: "deltoide_posterior",
    categoria: "Isolador Superior",
    grupo: "Ombros",
    ativacao: { deltoide_posterior: 1.0, romboides: 0.5, trapezio: 0.4 }
  },
  "omb_face_pull": {
    id: "omb_face_pull",
    nome: "Face Pull",
    motor_primario: "deltoide_posterior",
    categoria: "Puxar Horizontal",
    grupo: "Ombros",
    ativacao: { deltoide_posterior: 1.0, trapezio: 0.6, romboides: 0.5, biceps: 0.3 }
  },

  // ==========================================
  // PANTURRILHAS
  // ==========================================
  "pant_em_pe": {
    id: "pant_em_pe",
    nome: "Panturrilha em Pé",
    motor_primario: "gastrocnemio",
    categoria: "Isolador Inferior",
    grupo: "Panturrilha",
    ativacao: { gastrocnemio: 1.0, soleo: 0.3 }
  },
  "pant_solear": {
    id: "pant_solear",
    nome: "Cadeira Solear",
    motor_primario: "soleo",
    categoria: "Isolador Inferior",
    grupo: "Panturrilha",
    ativacao: { soleo: 1.0, gastrocnemio: 0.1 }
  },

  // ==========================================
  // ABDÔMEN & CORE
  // ==========================================
  "abd_maquina": {
    id: "abd_maquina",
    nome: "Abdominal Máquina",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0 }
  },
  "abd_infra": {
    id: "abd_infra",
    nome: "Abdominal Infra",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, iliopsoas: 0.8 } // Forte ativação de flexores de quadril
  },
  "abd_remador": {
    id: "abd_remador",
    nome: "Abdominal Remador",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, iliopsoas: 0.5, transverso: 0.4 }
  },
  "abd_prancha": {
    id: "abd_prancha",
    nome: "Prancha Isometrica",
    motor_primario: "core",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, transverso: 1.0, core: 1.0 }
  },
  "abd_v_up": {
    id: "abd_v_up",
    nome: "V-Up (Canivete)",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, iliopsoas: 0.7, transverso: 0.5 }
  },
  "abd_v_up_alternado": {
    id: "abd_v_up_alternado",
    nome: "V-Up Alternado",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, obliquos: 0.6, iliopsoas: 0.6 }
  },
  "abd_banco_romano": {
    id: "abd_banco_romano",
    nome: "Abdominal no Banco Romano",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, iliopsoas: 0.4 }
  }
};

// Agrupado por `grupo` (porção muscular ampla) pra alimentar o seletor em duas etapas
// (CatalogPicker: escolhe o grupo, depois o exercício dentro dele) — dado estático, computado
// uma vez aqui em vez de recalcular em cada componente que o usa.
const catalogByGroup = (() => {
    const groups = {};
    Object.values(exerciseCatalog).forEach((entry) => {
        const g = entry.grupo || "Outros";
        (groups[g] = groups[g] || []).push(entry);
    });
    return Object.entries(groups).map(([grupo, entries]) => ({ grupo, entries: entries.slice().sort((a, b) => a.nome.localeCompare(b.nome)) }));
})();

export { catalogByGroup };
