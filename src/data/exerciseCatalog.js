// Catálogo mestre de exercícios com mapa de ativação muscular (fração de série equivalente por
// músculo) e `grupo` (porção muscular ampla — usado pelo seletor em duas etapas no editor de
// ficha e pelo agrupamento do VolumeDashboard). Usado pelo calculador de volume
// (src/utils/volumeCalculator.js) — um exercício da ficha só entra na conta de volume se tiver um
// `catalogId` apontando pra uma chave aqui.
//
// Revisão biomecânica (nov/2026): frações de ativação recalibradas e comentários de técnica
// adicionados por exercício; a seção Ombros deixou de usar nomes genéricos de músculo
// (triceps/trapezio/biceps) e passou a usar as cabeças específicas, como o resto do catálogo.
// Mesmos 67 ids de antes — nenhum vínculo (`catalogId`) existente quebra com esta troca.
export const exerciseCatalog = {
  // ==========================================
  // COSTAS (Atenção: Intermediários puxam muito com braço)
  // ==========================================
  "cost_barra_supinada": {
    id: "cost_barra_supinada",
    nome: "Barra Fixa pegada Supinada",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 0.8, redondos: 0.5, biceps_cabeca_curta: 0.8, biceps_cabeca_longa: 0.5 }
  },
  "cost_barra_neutra": {
    id: "cost_barra_neutra",
    nome: "Barra Fixa pegada Neutra",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 0.9, redondos: 0.6, braquial: 0.8, braquiorradial: 0.6 }
  },
  "cost_barra_pronada": {
    id: "cost_barra_pronada",
    nome: "Barra Fixa pegada Pronada",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 0.8, redondos: 1.0, trapezio_inferior: 0.5, biceps_cabeca_curta: 0.4 }
  },
  "cost_remada_aberta": {
    id: "cost_remada_aberta",
    nome: "Remada Aberta (Cotovelo a 90º)",
    motor_primario: "trapezio_medio",
    categoria: "Puxar Horizontal",
    grupo: "Costas",
    ativacao: { trapezio_medio: 1.0, romboides: 1.0, deltoide_posterior: 1.0, latissimo_dorso: 0.0, biceps_cabeca_longa: 0.3 }
  },
  "cost_remada_fechada": {
    id: "cost_remada_fechada",
    nome: "Remada Fechada",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Horizontal",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 0.8, romboides: 0.6, braquial: 0.7, trapezio_medio: 0.5 }
  },
  "cost_puxada_aberta": {
    id: "cost_puxada_aberta",
    nome: "Puxada Aberta",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 0.9, redondos: 1.0, biceps_cabeca_curta: 0.5 }
  },
  "cost_puxada_fechada": {
    id: "cost_puxada_fechada",
    nome: "Puxada Fechada",
    motor_primario: "latissimo_dorso",
    categoria: "Puxar Vertical",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 1.0, braquial: 0.7, biceps_cabeca_curta: 0.5 }
  },
  "cost_pulldown": {
    id: "cost_pulldown",
    nome: "Pulldown (Braços Esticados)",
    motor_primario: "latissimo_dorso",
    categoria: "Isolador Dorsais",
    grupo: "Costas",
    ativacao: { latissimo_dorso: 1.0, redondos: 0.8, triceps_longa: 0.2 } // Tríceps longa entra muito pouco, apenas isometria
  },
  "cost_kelso_shrugs": {
    id: "cost_kelso_shrugs",
    nome: "Kelso Shrugs (Encolhimento no banco)",
    motor_primario: "trapezio_medio",
    categoria: "Isolador Escapular",
    grupo: "Costas",
    ativacao: { trapezio_medio: 1.0, romboides: 1.0, trapezio_superior: 0.4 }
  },

  // ==========================================
  // BÍCEPS & BRAQUIAL
  // ==========================================
  "bic_rosca_biceps": {
    id: "bic_rosca_biceps",
    nome: "Rosca Direta (Barra/Halter)",
    motor_primario: "biceps_cabeca_longa",
    categoria: "Isolador Bíceps",
    grupo: "Bíceps",
    ativacao: { biceps_cabeca_longa: 1.0, biceps_cabeca_curta: 1.0, braquiorradial: 0.4 }
  },
  "bic_rosca_scott": {
    id: "bic_rosca_scott",
    nome: "Rosca Scott",
    motor_primario: "biceps_cabeca_curta",
    categoria: "Isolador Bíceps",
    grupo: "Bíceps",
    ativacao: { biceps_cabeca_curta: 1.0, braquial: 0.7, biceps_cabeca_longa: 0.2 } // Ombro fletido anula quase toda a força da cabeça longa
  },
  "bic_rosca_martelo": {
    id: "bic_rosca_martelo",
    nome: "Rosca Martelo",
    motor_primario: "braquial",
    categoria: "Isolador Braquial",
    grupo: "Bíceps",
    ativacao: { braquial: 1.0, braquiorradial: 1.0, biceps_cabeca_longa: 0.2, biceps_cabeca_curta: 0.2 } // Neutralidade de pulso desfavorece o bíceps principal
  },
  "bic_banco_inclinado": {
    id: "bic_banco_inclinado",
    nome: "Rosca Banco Inclinado",
    motor_primario: "biceps_cabeca_longa",
    categoria: "Isolador Bíceps (Alongamento)",
    grupo: "Bíceps",
    ativacao: { biceps_cabeca_longa: 1.0, biceps_cabeca_curta: 0.4 }
  },

  // ==========================================
  // PEITORAL (Onde o intermediário destrói o ombro frontal)
  // ==========================================
  "peit_flexao_reta": {
    id: "peit_flexao_reta",
    nome: "Flexão Reta",
    motor_primario: "peitoral_esternocostal",
    categoria: "Empurrar Horizontal",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 0.9, peitoral_clavicular: 0.5, deltoide_anterior: 0.8, triceps_lateral: 0.6, triceps_medial: 0.6 }
  },
  "peit_flexao_inclinada": {
    id: "peit_flexao_inclinada",
    nome: "Flexão Inclinada (Mãos Apoiadas/Alta)",
    motor_primario: "peitoral_esternocostal",
    categoria: "Empurrar Horizontal (Foco Inferior)",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 1.0, deltoide_anterior: 0.4, triceps_lateral: 0.4, triceps_medial: 0.4, peitoral_clavicular: 0.1 }
  },
  "peit_flexao_declinada": {
    id: "peit_flexao_declinada",
    nome: "Flexão Declinada (Pés Apoiados/Alta)",
    motor_primario: "peitoral_clavicular",
    categoria: "Empurrar Horizontal (Foco Superior)",
    grupo: "Peitoral",
    ativacao: { peitoral_clavicular: 1.0, peitoral_esternocostal: 0.4, deltoide_anterior: 0.9, triceps_lateral: 0.5, triceps_medial: 0.5 }
  },
  "peit_supino_reto": {
    id: "peit_supino_reto",
    nome: "Supino Reto",
    motor_primario: "peitoral_esternocostal",
    categoria: "Empurrar Horizontal",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 1.0, peitoral_clavicular: 0.5, deltoide_anterior: 0.8, triceps_lateral: 0.6, triceps_medial: 0.6, triceps_longa: 0.1 } // Supino reto quase não toca na cabeça longa do tríceps
  },
  "peit_supino_inclinado": {
    id: "peit_supino_inclinado",
    nome: "Supino Inclinado",
    motor_primario: "peitoral_clavicular",
    categoria: "Empurrar Inclinado",
    grupo: "Peitoral",
    ativacao: { peitoral_clavicular: 1.0, peitoral_esternocostal: 0.3, deltoide_anterior: 1.0, triceps_lateral: 0.5, triceps_medial: 0.5 } // Intermediário no inclinado sobrecarrega MUITO o ombro
  },
  "peit_crucifixo": {
    id: "peit_crucifixo",
    nome: "Crucifixo",
    motor_primario: "peitoral_esternocostal",
    categoria: "Isolador Peitoral",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 1.0, peitoral_clavicular: 0.4, deltoide_anterior: 0.4 }
  },
  "peit_cross_alta": {
    id: "peit_cross_alta",
    nome: "Cross Over Polia Alta",
    motor_primario: "peitoral_esternocostal",
    categoria: "Isolador Peitoral (Foco Inferior)",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 1.0, peitoral_menor: 0.8, peitoral_clavicular: 0.0, deltoide_anterior: 0.2 }
  },
  "peit_cross_baixa": {
    id: "peit_cross_baixa",
    nome: "Cross Over Polia Baixa",
    motor_primario: "peitoral_clavicular",
    categoria: "Isolador Peitoral (Foco Superior)",
    grupo: "Peitoral",
    ativacao: { peitoral_clavicular: 1.0, peitoral_esternocostal: 0.3, deltoide_anterior: 0.7 }
  },
  "peit_paralela": {
    id: "peit_paralela",
    nome: "Paralela",
    motor_primario: "peitoral_esternocostal",
    categoria: "Empurrar Vertical",
    grupo: "Peitoral",
    ativacao: { peitoral_esternocostal: 1.0, peitoral_menor: 0.8, triceps_lateral: 0.8, triceps_medial: 0.8, deltoide_anterior: 0.7, triceps_longa: 0.2 }
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
    ativacao: { triceps_medial: 1.0, triceps_lateral: 1.0, triceps_longa: 0.6 } // Ombro a 90º, meia ativação da longa
  },
  "tri_testa_halter": {
    id: "tri_testa_halter",
    nome: "Tríceps Testa Halter",
    motor_primario: "triceps_medial",
    categoria: "Isolador Tríceps",
    grupo: "Tríceps",
    ativacao: { triceps_medial: 1.0, triceps_lateral: 1.0, triceps_longa: 0.6 }
  },
  "tri_frances_polia": {
    id: "tri_frances_polia",
    nome: "Tríceps Francês Polia (Acima da cabeça)",
    motor_primario: "triceps_longa",
    categoria: "Isolador Tríceps",
    grupo: "Tríceps",
    ativacao: { triceps_longa: 1.0, triceps_lateral: 0.5, triceps_medial: 0.5 }
  },
  "tri_frances_halter": {
    id: "tri_frances_halter",
    nome: "Tríceps Francês Halter",
    motor_primario: "triceps_longa",
    categoria: "Isolador Tríceps",
    grupo: "Tríceps",
    ativacao: { triceps_longa: 1.0, triceps_lateral: 0.5, triceps_medial: 0.5 }
  },
  "tri_polia": {
    id: "tri_polia",
    nome: "Tríceps Pulley (Pushdown)",
    motor_primario: "triceps_lateral",
    categoria: "Isolador Tríceps",
    grupo: "Tríceps",
    ativacao: { triceps_lateral: 1.0, triceps_medial: 1.0, triceps_longa: 0.1 } // Ombro em extensão anula a cabeça longa
  },
  "tri_mergulho": {
    id: "tri_mergulho",
    nome: "Tríceps Mergulho no Banco",
    motor_primario: "triceps_lateral",
    categoria: "Empurrar Vertical",
    grupo: "Tríceps",
    ativacao: { triceps_lateral: 1.0, triceps_medial: 1.0, deltoide_anterior: 0.9, peitoral_esternocostal: 0.4, triceps_longa: 0.1 } // Péssimo exercício p/ longa, massacra o ombro
  },

  // ==========================================
  // OMBROS
  // ==========================================
  "omb_desenvolvimento": {
    id: "omb_desenvolvimento",
    nome: "Desenvolvimento (Halter/Máquina)",
    motor_primario: "deltoide_anterior",
    categoria: "Empurrar Vertical",
    grupo: "Ombros",
    ativacao: { deltoide_anterior: 1.0, deltoide_lateral: 0.3, triceps_lateral: 0.8, triceps_medial: 0.8, triceps_longa: 0.2 }
  },
  "omb_elevacao_frontal": {
    id: "omb_elevacao_frontal",
    nome: "Elevação Frontal",
    motor_primario: "deltoide_anterior",
    categoria: "Isolador Superior",
    grupo: "Ombros",
    ativacao: { deltoide_anterior: 1.0, peitoral_clavicular: 0.4 }
  },
  "omb_elevacao_lateral": {
    id: "omb_elevacao_lateral",
    nome: "Elevação Lateral",
    motor_primario: "deltoide_lateral",
    categoria: "Isolador Superior",
    grupo: "Ombros",
    ativacao: { deltoide_lateral: 1.0, trapezio_superior: 0.5 } // Intermediário levanta muito a escápula
  },
  "omb_crucifixo_inverso": {
    id: "omb_crucifixo_inverso",
    nome: "Crucifixo Inverso",
    motor_primario: "deltoide_posterior",
    categoria: "Isolador Superior",
    grupo: "Ombros",
    ativacao: { deltoide_posterior: 1.0, romboides: 0.6, trapezio_medio: 0.6 }
  },
  "omb_face_pull": {
    id: "omb_face_pull",
    nome: "Face Pull",
    motor_primario: "deltoide_posterior",
    categoria: "Puxar Horizontal",
    grupo: "Ombros",
    ativacao: { deltoide_posterior: 1.0, trapezio_medio: 0.5, romboides: 0.5, trapezio_inferior: 0.4 }
  },

  // ==========================================
  // QUADRÍCEPS & FLEXORES DO QUADRIL (A limpa nos biarticulares)
  // ==========================================
  "quad_agachamento_livre": {
    id: "quad_agachamento_livre",
    nome: "Agachamento Livre",
    motor_primario: "vasto_lateral",
    categoria: "Joelho Dominante (Básico)",
    grupo: "Quadríceps",
    // Intermediários cortam amplitude, logo o glúteo máximo não atinge pico de alongamento
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.7, adutores: 0.5, eretores_espinha: 0.8, reto_femoral: 0.0, isquiotibiais: 0.0 }
  },
  "quad_leg_press_45": {
    id: "quad_leg_press_45",
    nome: "Leg Press 45",
    motor_primario: "vasto_lateral",
    categoria: "Joelho Dominante",
    grupo: "Quadríceps",
    // Pelve travada = quase zero de extensão de quadril útil. Foco maciço em vastos.
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.3, adutores: 0.3, reto_femoral: 0.0, isquiotibiais: 0.0 }
  },
  "quad_pendulo": {
    id: "quad_pendulo",
    nome: "Pêndulo",
    motor_primario: "vasto_medial",
    categoria: "Joelho Dominante (Máquina)",
    grupo: "Quadríceps",
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.4, reto_femoral: 0.0 }
  },
  "quad_hack_machine": {
    id: "quad_hack_machine",
    nome: "Hack Machine",
    motor_primario: "vasto_lateral",
    categoria: "Joelho Dominante (Máquina)",
    grupo: "Quadríceps",
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.3, reto_femoral: 0.0 }
  },
  "quad_cadeira_extensora": {
    id: "quad_cadeira_extensora",
    nome: "Cadeira Extensora",
    motor_primario: "reto_femoral",
    categoria: "Isolador Quadríceps",
    grupo: "Quadríceps",
    // O ÚNICO que fatiga o Reto Femoral.
    ativacao: { reto_femoral: 1.0, vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0 }
  },
  "quad_afundo": {
    id: "quad_afundo",
    nome: "Afundo / Passada",
    motor_primario: "vasto_lateral",
    categoria: "Joelho Dominante (Unilateral)",
    grupo: "Quadríceps",
    ativacao: { vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_maximo: 0.8, gluteo_medio: 0.5, adutores: 0.4, reto_femoral: 0.0 }
  },
  "quad_flexao_quadril_deitado": {
    id: "quad_flexao_quadril_deitado",
    nome: "Flexão de Quadril (Polia/Caneleira)",
    motor_primario: "iliopsoas",
    categoria: "Isolador Flexores de Quadril",
    grupo: "Quadríceps",
    ativacao: { iliopsoas: 1.0, reto_femoral: 0.8 }
  },
  "quad_flexao_nordica_inversa": {
    id: "quad_flexao_nordica_inversa",
    nome: "Flexão Nórdica Inversa (Sissy Squat)",
    motor_primario: "reto_femoral",
    categoria: "Isolador Quadríceps",
    grupo: "Quadríceps",
    ativacao: { reto_femoral: 1.0, vasto_lateral: 0.9, vasto_medial: 0.9, vasto_intermedio: 0.9 }
  },

  // ==========================================
  // ISQUIOTIBIAIS
  // ==========================================
  "isq_stiff": {
    id: "isq_stiff",
    nome: "Stiff",
    motor_primario: "isquiotibiais",
    categoria: "Quadril Dominante",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 1.0, gluteo_maximo: 0.8, eretores_espinha: 0.8 } // Lombar de intermediário queima muito aqui
  },
  "isq_bom_dia": {
    id: "isq_bom_dia",
    nome: "Bom dia (Good Morning)",
    motor_primario: "isquiotibiais",
    categoria: "Quadril Dominante",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 1.0, gluteo_maximo: 0.8, eretores_espinha: 1.0 } // Fadigará a lombar antes dos isquios na maioria das vezes
  },
  "isq_mesa_flexora": {
    id: "isq_mesa_flexora",
    nome: "Mesa Flexora (Deitado)",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 0.8, gastrocnemio: 0.3 } // Quadril estendido não alonga totalmente os isquiotibiais
  },
  "isq_cadeira_flexora": {
    id: "isq_cadeira_flexora",
    nome: "Cadeira Flexora (Sentado)",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais (Alongamento Máximo)",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 1.0, gastrocnemio: 0.2 } // Quadril flexionado = alongamento absurdo, superior à mesa
  },
  "isq_flexora_em_pe": {
    id: "isq_flexora_em_pe",
    nome: "Flexora em pé",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 0.8, gastrocnemio: 0.3 }
  },
  "isq_flexao_nordica": {
    id: "isq_flexao_nordica",
    nome: "Flexão Nórdica (Raiz)",
    motor_primario: "isquiotibiais",
    categoria: "Isolador Isquiotibiais (Força Excêntrica)",
    grupo: "Isquiotibiais",
    ativacao: { isquiotibiais: 1.0, gastrocnemio: 0.4 }
  },

  // ==========================================
  // GLÚTEOS E CADEIA POSTERIOR HÍBRIDA
  // ==========================================
  "glut_cadeira_abdutora": {
    id: "glut_cadeira_abdutora",
    nome: "Cadeira Abdutora",
    motor_primario: "gluteo_medio",
    categoria: "Isolador Glúteo (Médio/Mínimo)",
    grupo: "Glúteos",
    ativacao: { gluteo_medio: 1.0, gluteo_minimo: 1.0, gluteo_maximo: 0.1 }
  },
  "glut_rdl": {
    id: "glut_rdl",
    nome: "RDL",
    motor_primario: "gluteo_maximo",
    categoria: "Quadril Dominante (Foco Glúteo)",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.7, eretores_espinha: 0.6 } // Joelho mais flexionado que stiff tira um pouco dos isquios
  },
  "glut_extensao_quadril_polia": {
    id: "glut_extensao_quadril_polia",
    nome: "Extensão de Quadril Polia (Perna Esticada)",
    motor_primario: "gluteo_maximo",
    categoria: "Isolador Glúteo (Máximo)",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.3, gluteo_medio: 0.2 }
  },
  "glut_coice_polia": {
    id: "glut_coice_polia",
    nome: "Coice Polia (Joelho Flexionado)",
    motor_primario: "gluteo_maximo",
    categoria: "Isolador Glúteo",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.0 } // Joelho flexionado entra em insuficiência ativa dos isquios. Isola o glúteo.
  },
  "glut_levantamento_terra": {
    id: "glut_levantamento_terra",
    nome: "Levantamento Terra (Deadlift)",
    motor_primario: "gluteo_maximo",
    categoria: "Híbrido Quadril/Joelho",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, eretores_espinha: 1.0, vasto_lateral: 0.8, vasto_medial: 0.8, isquiotibiais: 0.4 } // Isquios agem muito mais isométricos aqui
  },
  "glut_elevacao_pelvica": {
    id: "glut_elevacao_pelvica",
    nome: "Elevação Pélvica",
    motor_primario: "gluteo_maximo",
    categoria: "Extensão de Quadril Pura",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.1, vasto_lateral: 0.2 }
  },
  "glut_bulgaro": {
    id: "glut_bulgaro",
    nome: "Agachamento Búlgaro",
    motor_primario: "gluteo_maximo",
    categoria: "Híbrido Unilateral",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, vasto_lateral: 1.0, vasto_medial: 1.0, vasto_intermedio: 1.0, gluteo_medio: 0.6, reto_femoral: 0.0 }
  },
  "glut_step_up": {
    id: "glut_step_up",
    nome: "Step Up (Subida no Banco)",
    motor_primario: "gluteo_maximo",
    categoria: "Híbrido Unilateral",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, vasto_lateral: 1.0, vasto_medial: 1.0, gluteo_medio: 0.6, reto_femoral: 0.0 }
  },
  "glut_krause": {
    id: "glut_krause",
    nome: "Glúteo Krause",
    motor_primario: "gluteo_maximo",
    categoria: "Isolador Glúteo (Unilateral)",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.1 }
  },

  // ==========================================
  // ADUTORES E PANTURRILHAS
  // ==========================================
  "adut_cadeira_adutora": {
    id: "adut_cadeira_adutora",
    nome: "Cadeira Adutora",
    motor_primario: "adutores",
    categoria: "Isolador Adutores",
    grupo: "Adutores",
    ativacao: { adutores: 1.0 }
  },
  "pant_em_pe": {
    id: "pant_em_pe",
    nome: "Panturrilha em Pé (Joelho esticado)",
    motor_primario: "gastrocnemio",
    categoria: "Isolador Inferior",
    grupo: "Panturrilha",
    ativacao: { gastrocnemio: 1.0, soleo: 0.3 }
  },
  "pant_solear": {
    id: "pant_solear",
    nome: "Cadeira Solear (Joelho dobrado)",
    motor_primario: "soleo",
    categoria: "Isolador Inferior",
    grupo: "Panturrilha",
    ativacao: { soleo: 1.0, gastrocnemio: 0.0 } // Dobrou o joelho, gastrocnêmio desligou
  },

  // ==========================================
  // ABDÔMEN & CORE (O império do Iliopsoas)
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
    nome: "Abdominal Infra (Elevação de Pernas)",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, iliopsoas: 1.0, reto_femoral: 0.6 } // Intermediário faz força imensa com o quadril aqui
  },
  "abd_remador": {
    id: "abd_remador",
    nome: "Abdominal Remador",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, iliopsoas: 0.7 }
  },
  "abd_prancha": {
    id: "abd_prancha",
    nome: "Prancha Isometrica",
    motor_primario: "transverso",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { transverso: 1.0, reto_abdominal: 0.6, core: 1.0 }
  },
  "abd_v_up": {
    id: "abd_v_up",
    nome: "V-Up (Canivete)",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, iliopsoas: 0.9 }
  },
  "abd_v_up_alternado": {
    id: "abd_v_up_alternado",
    nome: "V-Up Alternado",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, obliquos: 0.8, iliopsoas: 0.8 }
  },
  "abd_banco_romano": {
    id: "abd_banco_romano",
    nome: "Abdominal no Banco Romano",
    motor_primario: "reto_abdominal",
    categoria: "Core",
    grupo: "Abdômen",
    ativacao: { reto_abdominal: 1.0, iliopsoas: 0.7 }
  },
  "extensao_quadril_romano": {
    id: "extensao_quadril_romano",
    nome: "Extensão de Quadril no Banco Romano",
    motor_primario: "gluteo_maximo",
    categoria: "Extensão de Quadril",
    grupo: "Glúteos",
    ativacao: { gluteo_maximo: 1.0, isquiotibiais: 0.8, eretores_espinha: 0.7 }
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
