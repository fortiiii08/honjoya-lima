export type FieldType = "text" | "textarea" | "select" | "radio" | "checkboxes" | "date" | "time" | "currency" | "cpf" | "cnpj" | "phone" | "cep" | "heading" | "note";
export type Field = { id: string; label: string; hint?: string; type?: FieldType; options?: string[]; full?: boolean; third?: boolean; required?: boolean; group?: string | undefined };
export type Section = { id: string; title: string; subtitle: string; fields: Field[] };
export type FichaId = "geral" | "farmacia" | "bancario";

export const fichas: { id: FichaId; label: string; title: string; description: string }[] = [
  { id: "geral", label: "Geral", title: "Reclamação Trabalhista – Geral", description: "Ficha padrão para qualquer categoria" },
  { id: "farmacia", label: "Farmácia", title: "Reclamação Trabalhista – Farmácia", description: "Turnos, loja e responsável técnico" },
  { id: "bancario", label: "Bancários", title: "Reclamação Trabalhista – Bancário e Enquadramento", description: "7ª e 8ª horas, agência e verbas de bancos" },
];

/** Campos que não guardam resposta (títulos e notas da ficha). */
export const isDisplayOnly = (field: Field) => field.type === "heading" || field.type === "note";

const yesNo = ["Sim", "Não"];
type Extra = Partial<Omit<Field, "id" | "label">>;
const f = (id: string, label: string, extra: Extra = {}): Field => ({ id, label, ...extra });
const full = (id: string, label: string, extra: Extra = {}) => f(id, label, { full: true, ...extra });
const third = (id: string, label: string, extra: Extra = {}) => f(id, label, { third: true, ...extra });
const yn = (id: string, label: string, extra: Extra = {}) => f(id, label, { type: "radio", options: yesNo, full: true, ...extra });
const checks = (id: string, label: string, options: string[], extra: Extra = {}) => f(id, label, { type: "checkboxes", options, full: true, ...extra });
const radio = (id: string, label: string, options: string[], extra: Extra = {}) => f(id, label, { type: "radio", options, full: true, ...extra });
const date = (id: string, label: string, extra: Extra = {}) => f(id, label, { type: "date", ...extra });
const money = (id: string, label: string, extra: Extra = {}) => f(id, label, { type: "currency", ...extra });
const textarea = (id: string, label: string, extra: Extra = {}) => full(id, label, { type: "textarea", ...extra });
const heading = (id: string, label: string): Field => ({ id, label, type: "heading" });
const note = (id: string, label: string): Field => ({ id, label, type: "note" });
/** Dá contexto no relatório/PDF aos campos com rótulo genérico ("Motivo", "Período"...). */
const grp = (group: string, fields: Field[]) => fields.map((x) => ({ group, ...x }));
const repeat = (n: number, build: (i: number) => Field[]) => Array.from({ length: n }, (_, i) => build(i + 1)).flat();

/** "das ___ às ___ Intrajornada ___" */
function horario(prefix: string, das: string, intra: string, group?: string): Field[] {
  return grp(group ?? das.replace(/ das$/, ""), [
    third(`${prefix}Ini`, das, { type: "time" }),
    third(`${prefix}Fim`, "às", { type: "time" }),
    third(`${prefix}Intra`, intra),
  ]);
}

const pontoSim = ["eletrônico", "manual", "sistema", "APP"];
const pontoNao = ["62, I", "62, II", "62, III", "externo com anotação do ponto no APP"];
const diasJornada = ["segunda a sexta", "segunda a sábado", "domingos", "feriados"];

function periodo(ficha: FichaId, p: "a" | "b" | "c"): Field[] {
  const k = (s: string) => `he_${p}_${s}`;
  const fields: Field[] = [
    full(k("cargo"), "Cargo"),
    date(k("de"), "Período"), date(k("ate"), "até"),
  ];

  if (ficha === "bancario") {
    fields.push(
      radio(k("contratual"), "Jornada de trabalho contratual diária", p === "a" ? ["6 horas", "8 horas"] : ["4 horas", "6 horas", "8 horas"]),
      checks(k("dias"), "Jornada", diasJornada),
      checks(k("pontoSim"), "Estava sujeito a Cartão Ponto: Sim", pontoSim),
      checks(k("pontoNao"), "Estava sujeito a Cartão Ponto: Não", pontoNao),
      checks(k("descaracterizacao"), "Descaracterização", ["converter 224, § 2º para caput 224 da CLT", "converter 62, II para 224, § 2º"]),
      yn(k("setimaOitava"), p === "a" ? "Sétima e oitava horas" : "Sétima e oitava hora"),
      f(k("agencia"), "Agência"), f(k("endereco"), "Endereço"),
      textarea(k("funcoes"), "Funções"),
      heading(k("h"), "Horários"),
      ...horario(k("seg"), "Segunda a sexta das", "Intrajornada"),
      ...horario(k("sab"), "Sábado das", "Intrajornada"),
      ...horario(k("dom"), "Domingos e feriados das", "Intrajornada"),
      full(k("domQuais"), "Domingos e feriados · quantos/quais"),
      yn(k("interjornada"), "Intervalo interjornada (11 horas de descanso) suprimido"),
      full(k("interjornadaFreq"), "Frequência e horários"),
      yn(k("dsr"), "DSR em dobro (laborou sem folga 7 dias direto)"),
    );
    return fields;
  }

  fields.push(
    radio(k("contratual"), "Jornada de trabalho contratual diária", ["4 horas", "6 horas", "8 horas", "7h20", "12x36"]),
    checks(k("dias"), "Jornada", diasJornada),
    radio(k("compensacao"), "Acordo de Compensação", ficha === "farmacia" ? ["sim", "não"] : yesNo),
    checks(k("pontoSim"), "Estava sujeito a Cartão Ponto: Sim", pontoSim),
    checks(k("pontoNao"), "Estava sujeito a Cartão Ponto: Não", pontoNao),
    full(k("endereco"), ficha === "farmacia" && p === "a" ? "Endereço da loja" : "Endereço do local"),
    textarea(k("funcoes"), "Funções"),
    heading(k("h"), "Horários"),
  );

  if (ficha === "farmacia") {
    for (const turno of ["matutino", "vespertino", "noturno"]) {
      const group = `Turno ${turno}`;
      const tk = k(turno);
      fields.push(
        heading(`${tk}_h`, group),
        ...horario(`${tk}_seg`, "Segunda a sexta das", "Intrajornada", `${group} · Segunda a sexta`),
        ...horario(`${tk}_sab`, "Sábado das", "Intra", `${group} · Sábado`),
        ...horario(`${tk}_dom`, "Domingos e feriados das", "Intra", `${group} · Domingos e feriados`),
      );
    }
  } else {
    fields.push(
      ...horario(k("seg"), "Segunda a sexta das", "Intrajornada"),
      ...horario(k("sab"), "Sábado das", "Intrajornada"),
      ...horario(k("dom"), "Domingos e feriados das", "Intrajornada"),
      full(k("domQuais"), "Domingos e feriados · quantos/quais"),
      yn(k("outrosTurnos"), "Outros turnos"),
      textarea(k("outrosTurnosHorarios"), "Horários", { group: "Outros turnos" }),
      f(k("bfDias"), "Black Friday – Dias"), f(k("bfHorarios"), "Horários", { group: "Black Friday" }),
    );
  }

  fields.push(
    yn(k("interjornada"), "Intervalo interjornada (11 horas de descanso) suprimido"),
    full(k("interjornadaFreq"), "Frequência e horários"),
    yn(k("dsr"), "DSR em dobro (laborou sem folga 7 dias direto)"),
    yn(k("dominical"), "Descanso dominical desrespeitado (Nunca folga aos domingos)"),
  );
  return fields;
}

export function buildSections(ficha: FichaId): Section[] {
  const bank = ficha === "bancario";
  const atividades = bank ? ["Reunião", "Ações Universitárias", "Cursos", "Feirões", "Viagem"] : ["Reunião", "Cursos", "Viagem"];

  return [
    { id: "atendimento", title: "Atendimento", subtitle: "Dados do atendimento", fields: [
      f("atendimento", "Atendimento"), f("indicacao", "Indicação"),
      date("dataAtendimento", "Data do Atendimento"),
      yn("digital", "Processo 100% digital", { full: false }),
      yn("prioridade", "Prioridade na tramitação", { full: false }),
      f("prioridadeMotivo", "Motivo", { group: "Prioridade na tramitação" }),
      checks("urgencia", "Urgência", ["Prescrição", "Reintegração"], { full: false }),
      yn("segredo", "Segredo de Justiça", { full: false }),
    ]},
    { id: "qualificacao", title: "Qualificação", subtitle: "Dados do reclamante", fields: [
      full("nome", "Nome", { required: true }),
      radio("estadoCivil", "Estado Civil", ["solteiro", "casado", "viúvo", "divorciado"]),
      third("rg", "RG n.º"), third("cpf", "CPF/MF n.º", { type: "cpf" }), third("nascimento", "Data de nascimento", { type: "date" }),
      full("endereco", "Endereço"),
      third("bairro", "Bairro"), third("cidade", "Cidade"), third("cep", "CEP", { type: "cep" }),
      f("celular", "Telefone Celular", { type: "phone" }), f("email", "E-mail"),
      f("telRecado", "Telefone para recados", { type: "phone" }), f("telRecadoDono", "A quem pertence"),
    ]},
    { id: "contrato", title: "Empresa reclamada", subtitle: "Contrato e remuneração", fields: [
      full("empresa", "Empresa Reclamada"),
      f("cnpj", "CNPJ", { type: "cnpj" }), f("sindicato", "Sindicato"),
      date("admissao", "Data de Admissão"), date("rescisao", "Data da Rescisão"),
      radio("modalidade", "Forma de saída", ["pedido de demissão", "demissão", "demissão por justa causa", "trabalhando", "acordo CLT"]),
      money("remuneracao", "Última remuneração bruta (média)"),
      textarea("resumoPedidos", "Resumo de pedidos"),
    ]},
    { id: "responsabilidade", title: "Responsabilidade", subtitle: "Solidária e subsidiária", fields: [
      yn("solidaria", "Responsabilidade Solidária"),
      ...grp("Responsabilidade Solidária", [textarea("solidariaEmpresa", "Empresa com CNPJ"), full("solidariaMotivo", "Motivo")]),
      yn("subsidiaria", "Responsabilidade Subsidiária"),
      ...grp("Responsabilidade Subsidiária", [textarea("subsidiariaEmpresa", "Empresa com CNPJ"), full("subsidiariaMotivo", "Motivo")]),
    ]},
    { id: "vinculo", title: "Vínculo e rescisão", subtitle: bank ? "Vínculo/enquadramento, rescisão indireta e justa causa" : "Vínculo, rescisão indireta e justa causa", fields: [
      yn("vinculo", bank ? "Vínculo empregatício ou enquadramento não reconhecido na CTPS" : "Vínculo empregatício não reconhecido na CTPS"),
      ...grp("Vínculo", [
        checks("vinculoTipo", "Situação", bank ? ["período de estágio", "bancário", "financiário", "telemarketing", "outro"] : ["período de estágio", "telemarketing", "ausência de registro", "outro"]),
        full("vinculoOutro", "outro"),
        f("subordinado", "A quem ficava subordinado"), f("subordinadoCargo", "Cargo"),
        textarea("vinculoInfo", "Outras informações"),
      ]),
      yn("rescisaoIndireta", "Rescisão indireta"),
      ...grp("Rescisão indireta", [
        checks("rescisaoIndiretaMotivo", "Motivo", ["ausência de pagamento do salário", "ausência de pagamento do FGTS", "agressão ou perigo"]),
        textarea("rescisaoIndiretaInfo", "Outras informações"),
      ]),
      yn("reversaoJustaCausa", "Reversão da justa causa"),
      textarea("alegacaoEmpresa", "Alegação da empresa", { group: "Reversão da justa causa" }),
    ]},
    { id: "acidente", title: "Acidente e afastamento INSS", subtitle: "Acidente de trabalho, INSS e plano de saúde", fields: [
      yn("acidente", "Ocorreu acidente de trabalho?"),
      ...grp("Acidente de trabalho", [
        checks("acidenteTipo", "Tipo", ["LER/ DORT", "Psicológico", "Outro"]),
        f("acidentePsicologico", "Psicológico, qual"), f("acidenteOutro", "Outro"),
        checks("acidentePedidos", "Pedidos", ["danos materiais", "lucros cessantes"]),
      ]),
      yn("afastamentoInss", "Período de afastamento INSS"),
      ...grp("Afastamento INSS", [
        date("inssDe", "De"), date("inssAte", "a"),
        radio("inssMotivo", "Motivo", ["Acidente de trabalho", "Acidente comum"]),
      ]),
      yn("planoSaude", "Manutenção do plano de saúde"),
      checks("documentosSaude", "Documentos", ["INSS", "CAT", "Laudos médicos", "Exames", "Atestados"]),
      textarea("saudeInfo", "Outras informações"),
    ]},
    { id: "maternidade", title: "Auxílio-maternidade e reintegração", subtitle: "Afastamento, amamentação e reintegração", fields: [
      yn("maternidade", "Período de afastamento INSS por auxílio maternidade"),
      ...grp("Auxílio maternidade", [date("maternidadeDe", "De"), date("maternidadeAte", "até")]),
      yn("amamentacao", "Intervalo para amamentação suprimido (art. 396 CLT)"),
      date("retornoMaternidade", "Data de retorno ao trabalho após auxílio maternidade", { full: true }),
      yn("reintegracao", "Pedido de reintegração ao trabalho?"),
      ...grp("Reintegração", [
        checks("reintegracaoRazao", "Qual a razão para a reintegração?", ["Pré-aposentadoria", "Doença Ocupacional", "Gestante", "Dispensa Discriminatória (portador de HIV ou outra doença grave que suscite estigma ou preconceito)"]),
        textarea("reintegracaoDetalhes", "Detalhes"),
      ]),
    ]},
    { id: "sobreaviso", title: "Sobreaviso", subtitle: "Adicional de sobreaviso 24 horas", fields: [
      yn("sobreaviso", "Adicional de SOBREAVISO 24 horas"),
      ...grp("Sobreaviso", [
        checks("sobreavisoTipo", "Situação", ["disparos de alarme", "trabalhava e dormia dentro do local", "outro"]),
        f("sobreavisoOutro", "outro"),
        f("sobreavisoHorario", "Qual horário ficava em sobreaviso"),
      ]),
      note("sobreavisoNota", "Nota: Apenas na hipótese de o empregado não poder se deslocar para local longe do estabelecimento."),
    ]},
    { id: "semExtras", title: "Jornada sem horas extras", subtitle: "Caso não tenha pedido de horas extras", fields: [
      note("semExtrasNota", "Caso não tenha pedido de horas extras, preencher:"),
      full("ultimoCargo", "Último cargo"),
      ...grp("Jornada praticada", [third("jornadaIni", "Jornada praticada", { type: "time" }), third("jornadaFim", "às", { type: "time" }), third("jornadaIntra", "Intrajornada")]),
    ]},
    ...(["a", "b", "c"] as const).map((p) => ({
      id: `periodo_${p}`, title: `Horas extras – ${p})`, subtitle: "Jornada que será inserida na inicial",
      fields: [note(`he_${p}_nota`, "Caso tenha pedido de horas extras, preencher com a jornada que será inserida na inicial:"), ...periodo(ficha, p)],
    })),
    { id: "alemJornada", title: "Trabalhos além da jornada", subtitle: bank ? "Reuniões, ações universitárias, cursos, feirões e viagens" : "Reuniões, cursos e viagens", fields: [
      checks("alemJornada", "Trabalhos além da jornada", atividades),
      ...atividades.flatMap((a) => {
        const key = `alem_${a.normalize("NFD").replace(/\W/g, "")}`;
        return grp(a, [third(`${key}Freq`, `${a} - Frequência`), third(`${key}Lapso`, "Lapso temporal"), third(`${key}Duracao`, "Duração")]);
      }),
      textarea("alemJornadaInfo", "Outras informações"),
    ]},
    { id: "pagamentos", title: "Transferência e pagamentos", subtitle: "Transferência, pagamento por fora e comissões", fields: [
      yn("transferencia", "Adicional de Transferência"),
      ...repeat(2, (i) => grp(`Transferência ${i}`, [third(`transf${i}De`, "De"), third(`transf${i}Para`, "para"), third(`transf${i}Data`, "transferido em", { type: "date" })])),
      yn("porFora", "Incorporação de pagamento por fora"),
      ...grp("Pagamento por fora", [
        checks("porForaTipo", "O que era pago", ["salário", "comissão", "outros"]),
        f("porForaTipoOutros", "outros"), money("porForaValor", "Valor"),
        checks("porForaMeio", "Forma de pagamento", ["em mãos", "via transferência bancária", "cartão", "outros"]),
        full("porForaMeioOutros", "outros"),
      ]),
      yn("comissoes", "Diferença no pagamento de comissões"),
      ...grp("Comissões", [
        checks("comissoesPagamento", "Pagamento", ["mensal", "semestral", "anual", "outros"]),
        full("comissoesPagamentoOutros", "outros"),
        checks("comissoesMotivo", "Motivo", ["dedução por cliente inadimplente", "mudança de metas no mês", "registro para colegas"]),
        f("comissoesMotivoOutro", "Outro"), money("comissoesValor", "Valor médio sonegado"),
        full("programaMetas", "Nome do programa de metas"),
        textarea("comissoesInfo", "Outras informações"),
      ]),
    ]},
    { id: "funcoes", title: "Funções e salário", subtitle: "Equiparação, desvio, acúmulo e substituição", fields: [
      yn("equiparacao", "Equiparação salarial"),
      ...repeat(3, (i) => grp(`Equiparação ${i}`, [third(`equip${i}Periodo`, "Período"), third(`equip${i}Paradigma`, "Paradigma"), third(`equip${i}Salario`, "Salário", { type: "currency" })])),
      note("equipNota", "Nota: Apenas se preenchidos os 5 requisitos: identidade de funções, mesma perfeição técnica, mesmo estabelecimento, mesma atividade por tempo inferior a 2 anos e até 4 anos de diferença de admissão."),
      yn("desvio", "Desvio de função"),
      ...repeat(2, (i) => grp(`Desvio ${i}`, [third(`desvio${i}Periodo`, "Período"), third(`desvio${i}Cargo`, "Cargo"), third(`desvio${i}Salario`, "Salário", { type: "currency" })])),
      yn("acumulo", "Acúmulo de função"),
      ...repeat(2, (i) => grp(`Acúmulo ${i}`, [third(`acumulo${i}Periodo`, "Período"), third(`acumulo${i}Funcao`, "Função"), third(`acumulo${i}Atividades`, "Atividades")])),
      yn("substituicao", "Salário substituição"),
      ...repeat(2, (i) => grp(`Substituição ${i}`, [third(`subst${i}Periodo`, "Período"), third(`subst${i}Substituido`, "Substituído"), third(`subst${i}Salario`, "Salário", { type: "currency" })])),
    ]},
    { id: "danoMoral", title: "Dano moral e assédio", subtitle: "Dano moral, assédio moral e assédio sexual", fields: [
      yn("danoMoral", "Dano moral"),
      ...grp("Dano moral", [
        checks("danoMoralMotivo", "Motivo", ["Retenção CTPS", "Ausência de registro de vínculo", "Assalto ou agressão física no local", "Outros"]),
        full("danoMoralOutros", "Outros"),
        date("danoMoralData", "Data dos fatos"), f("danoMoralInfo", "outras informações"),
      ]),
      yn("assedioMoral", "Assédio moral"),
      ...repeat(3, (i) => grp(`Assédio moral · Assediador ${i}`, [f(`assedioMoral${i}Nome`, "Assediador"), f(`assedioMoral${i}Cargo`, "Cargo")])),
      ...grp("Assédio moral", [
        checks("ameacas", "Ameaças", ["demissão", "rebaixamento", "transferência", "palavras de baixo calão e chacotas", "exposição em rankings", "outros"]),
        full("ameacasOutros", "outros"),
        textarea("assedioMoralInfo", "Outras informações"),
      ]),
      yn("assedioSexual", "Assédio sexual"),
      ...repeat(2, (i) => grp(`Assédio sexual · Assediador ${i}`, [f(`assedioSexual${i}Nome`, "Assediador"), f(`assedioSexual${i}Cargo`, "Cargo")])),
      textarea("assedioSexualInfo", "Outras informações", { group: "Assédio sexual" }),
    ]},
    { id: "despesas", title: "Despesas e adicionais", subtitle: "Numerário, veículo, periculosidade e insalubridade", fields: [
      yn("numerario", "Transporte de numerário"),
      ...grp("Transporte de numerário", [
        full("numerarioLocais", "De qual local para qual local"),
        f("numerarioQuando", "Quando ocorreu"), money("numerarioValor", "valor"),
      ]),
      note("numerarioNota", "Nota: Apenas transporte de valores acima de R$ 8.000,00."),
      yn("veiculo", "Despesa com veículo"),
      ...grp("Despesa com veículo", [
        checks("veiculoTipo", "Despesas", ["combustível", "desgaste e depreciação de veículo", "estacionamento", "outros"]),
        full("veiculoOutros", "outros"),
        third("veiculoKm", "Km rodados por mês"), third("veiculoLocais", "locais"),
        money("veiculoMedia", "Média de gasto mensal", { third: true }),
      ]),
      yn("outrosGastos", "Outros valores gastos e não reembolsados (ex: vestimentas)"),
      ...grp("Outros valores gastos", [f("outrosGastosMotivo", "Motivo"), money("outrosGastosValor", "Valor médio gasto")]),
      yn("periculosidade", "Adicional de periculosidade"),
      ...grp("Periculosidade", [
        checks("periculosidadeAgente", "Agente perigoso", ["gás", "inflamáveis", "motocicleta", "energia elétrica", "vigilante ou segurança"]),
        textarea("periculosidadeInfo", "Outras informações"),
      ]),
      radio("insalubridade", "Adicional de insalubridade", bank ? yesNo : [...yesNo, "Majorar de 20% para 40%"]),
      ...grp("Insalubridade", [
        checks("insalubridadeAgente", "Agente insalubre", ["frio", "calor", "biológico", "químico", "ruído", "vibração", "poeira"]),
        textarea("insalubridadeInfo", "Outras informações"),
      ]),
    ]},
    { id: "ferias", title: "Férias e FGTS", subtitle: "Férias forçadas, trabalho nas férias e FGTS", fields: [
      yn("feriasForcadas", "Férias forçadas de 20 dias"),
      ...grp("Férias forçadas", [
        checks("feriasSituacao", "Situação", ["Nunca gozei de férias de 30 dias nos últimos cinco anos", "Gozei 30 dias nos seguintes anos"]),
        full("feriasAnos", "Gozei 30 dias nos seguintes anos"),
      ]),
      yn("trabalhoFerias", "Trabalho durante as férias"),
      full("trabalhoFeriasPeriodo", "Período", { group: "Trabalho durante as férias" }),
      yn("fgts", "Diferença no FGTS (ex: afastamento INSS cód. 91)"),
      full("fgtsPeriodo", "Período", { group: "Diferença no FGTS" }),
    ]},
    { id: "verbas", title: bank ? "Verbas rescisórias e verbas bancárias" : "Verbas rescisórias e benefícios", subtitle: bank ? "Rescisão, PLR e verbas de bancos" : "Rescisão, PLR, salário-família e vales", fields: [
      yn("verbas", bank ? "Verbas rescisórias" : "Recebimento de verbas rescisórias"),
      checks("verbasProblema", "Verbas rescisórias", ["desconto indevido", "não recebeu nada"]),
      yn("prazo10", "Entrega de documentação e pagamento no prazo de 10 dias"),
      yn("homologacao", "Houve homologação da rescisão"),
      full("motivoDesconto", "Motivo do desconto"),
      yn("plr", "PLR proporcional não paga"),
      ...(ficha === "farmacia" ? [yn("responsavelTecnico", "Adicional Responsável Técnico (Farmacêutico)")] : []),
      ...(bank ? [
        yn("plrDiferenca", "Diferença pelo cálculo incorreto da PLR (mais de 1 anos de contrato)"),
        yn("rp52", "RP-52 Itaú (admitidos até 06/2015)"),
        yn("gratSantander", "Gratificação Especial Santander (10 anos e demissão sem justa causa)"),
        yn("verbaBradesco", "Verba de representação Bradesco"),
        yn("pdeBradesco", "PDE Bradesco"),
      ] : []),
      yn("reducao", "Redução salarial"),
      ...grp("Redução salarial", [f("reducaoMotivo", "Motivo"), money("reducaoNovoSalario", "novo salário")]),
      ...(bank ? [] : [
        yn("salarioFamilia", "Salário família (salário até R$ 1.819,26)"),
        ...grp("Salário família", [f("filhos", "Quantidade de filhos"), f("filhosRecebia", "Recebia de algum?")]),
        yn("vt", "Vale transporte"),
        ...grp("Vale transporte", [f("vtPeriodo", "Período"), money("vtValor", "Valor gasto mensalmente")]),
        yn("vr", "Vale refeição"),
        ...grp("Vale refeição", [f("vrPeriodo", "Período"), money("vrValor", "Valor gasto mensalmente")]),
      ]),
    ]},
    { id: "outras", title: "Outras informações/ pedidos", subtitle: "Informações e pedidos adicionais", fields: [
      textarea("outrasInformacoes", "Outras informações/ pedidos"),
    ]},
  ];
}
