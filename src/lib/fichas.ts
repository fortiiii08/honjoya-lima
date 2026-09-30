export type FieldType = "text" | "textarea" | "select" | "radio" | "checkboxes" | "date" | "time" | "currency" | "cpf" | "cnpj" | "phone" | "cep" | "heading";
export type Condition = { id: string; values: string[] };
export type Field = { id: string; label: string; hint?: string; type?: FieldType; options?: string[]; full?: boolean; third?: boolean; required?: boolean; when?: Condition | undefined; group?: string | undefined };
export type Section = { id: string; title: string; subtitle: string; fields: Field[]; when?: Condition | undefined };
export type FichaId = "geral" | "farmacia" | "bancario";

export const fichas: { id: FichaId; label: string; title: string; description: string }[] = [
  { id: "geral", label: "Geral", title: "Reclamação Trabalhista – Geral", description: "Ficha padrão para qualquer categoria" },
  { id: "farmacia", label: "Farmácia", title: "Reclamação Trabalhista – Farmácia", description: "Turnos, loja e responsável técnico" },
  { id: "bancario", label: "Bancários", title: "Reclamação Trabalhista – Bancário e Enquadramento", description: "7ª e 8ª horas, agência e verbas de bancos" },
];

const yesNo = ["Sim", "Não"];
const when = (id: string, ...values: string[]): Condition => ({ id, values });
const sim = (id: string) => when(id, "Sim");
const yn = (id: string, label: string, extra: Partial<Field> = {}): Field => ({ id, label, type: "radio", options: yesNo, full: true, ...extra });
const gated = (cond: Condition, fields: Field[]): Field[] => fields.map((f) => ({ when: cond, ...f }));
const outrasInfo = (id: string, cond?: Condition): Field => ({ id, label: "Outras informações", type: "textarea", full: true, when: cond });
const repeat = (n: number, build: (i: number) => Field[]) => Array.from({ length: n }, (_, i) => build(i + 1)).flat();

function horario(prefix: string, label: string, group?: string): Field[] {
  return [
    { id: `${prefix}Ini`, label: `${label} · entrada`, type: "time", third: true, group },
    { id: `${prefix}Fim`, label: `${label} · saída`, type: "time", third: true, group },
    { id: `${prefix}Intra`, label: `${label} · intrajornada`, hint: "ex.: 1h", third: true, group },
  ];
}

const turnos = ["Matutino", "Vespertino", "Noturno"];

function periodo(ficha: FichaId, p: string): Field[] {
  const k = (s: string) => `he_${p}_${s}`;
  const bank = ficha === "bancario";
  const fields: Field[] = [
    { id: k("cargo"), label: "Cargo", full: true },
    { id: k("de"), label: "Período · de", type: "date" }, { id: k("ate"), label: "Período · até", type: "date" },
    { id: k("contratual"), label: "Jornada de trabalho contratual diária", type: "radio", options: bank ? ["4 horas", "6 horas", "8 horas"] : ["4 horas", "6 horas", "8 horas", "7h20", "12x36"], full: true },
    { id: k("dias"), label: "Jornada", type: "checkboxes", options: ["Segunda a sexta", "Segunda a sábado", "Domingos", "Feriados"], full: true },
    ...(bank ? [] : [yn(k("compensacao"), "Acordo de compensação")]),
    yn(k("ponto"), "Estava sujeito a cartão de ponto?"),
    { id: k("pontoSim"), label: "Tipo de controle de ponto", type: "checkboxes", options: ["Eletrônico", "Manual", "Sistema", "APP"], full: true, when: sim(k("ponto")) },
    { id: k("pontoNao"), label: "Sem controle de ponto por", type: "radio", options: ["Art. 62, I", "Art. 62, II", "Art. 62, III", "Externo com anotação do ponto no APP"], full: true, when: when(k("ponto"), "Não") },
  ];
  if (bank) {
    fields.push(
      { id: k("descaracterizacao"), label: "Descaracterização", type: "checkboxes", options: ["Converter 224, § 2º para caput 224 da CLT", "Converter 62, II para 224, § 2º"], full: true },
      yn(k("setimaOitava"), "Sétima e oitava horas"),
      { id: k("agencia"), label: "Agência" }, { id: k("endereco"), label: "Endereço da agência" },
    );
  } else {
    fields.push({ id: k("endereco"), label: ficha === "farmacia" ? "Endereço da loja" : "Endereço do local", full: true });
  }
  fields.push({ id: k("funcoes"), label: "Funções", type: "textarea", full: true });
  if (ficha === "farmacia") {
    fields.push({ id: k("turnos"), label: "Turnos trabalhados", hint: "marque para abrir os horários de cada turno", type: "checkboxes", options: turnos, full: true });
    turnos.forEach((turno) => {
      const group = `Turno ${turno.toLowerCase()}`;
      const tk = k(turno.toLowerCase());
      fields.push(...gated(when(k("turnos"), turno), [
        { id: `${tk}_h`, label: group, type: "heading" },
        ...horario(`${tk}_seg`, "Seg. a sex.", group), ...horario(`${tk}_sab`, "Sábado", group), ...horario(`${tk}_dom`, "Dom. e feriados", group),
      ]));
    });
  } else {
    fields.push(
      { id: k("h"), label: "Horários", type: "heading" },
      ...horario(k("seg"), "Seg. a sex."), ...horario(k("sab"), "Sábado"), ...horario(k("dom"), "Dom. e feriados"),
      { id: k("domQuais"), label: "Domingos e feriados · quantos/quais", full: true },
    );
    if (ficha === "geral") fields.push(
      yn(k("outrosTurnos"), "Outros turnos"),
      { id: k("outrosTurnosHorarios"), label: "Horários dos outros turnos", type: "textarea", full: true, when: sim(k("outrosTurnos")) },
      { id: k("bfDias"), label: "Black Friday · dias" }, { id: k("bfHorarios"), label: "Black Friday · horários" },
    );
  }
  fields.push(
    yn(k("interjornada"), "Intervalo interjornada (11 horas de descanso) suprimido"),
    { id: k("interjornadaFreq"), label: "Frequência e horários", full: true, when: sim(k("interjornada")) },
    yn(k("dsr"), "DSR em dobro (laborou sem folga 7 dias direto)"),
  );
  if (!bank) fields.push(yn(k("dominical"), "Descanso dominical desrespeitado (nunca folga aos domingos)"));
  return fields;
}

export function buildSections(ficha: FichaId): Section[] {
  const bank = ficha === "bancario";
  const atividades = bank ? ["Reunião", "Ações Universitárias", "Cursos", "Feirões", "Viagem"] : ["Reunião", "Cursos", "Viagem"];

  return [
    { id: "atendimento", title: "Atendimento", subtitle: "Controle interno", fields: [
      { id: "atendimento", label: "Atendimento" }, { id: "indicacao", label: "Indicação" },
      { id: "dataAtendimento", label: "Data do atendimento", type: "date" },
      yn("digital", "Processo 100% digital", { full: false }),
      yn("prioridade", "Prioridade na tramitação", { full: false }),
      { id: "prioridadeMotivo", label: "Motivo da prioridade", when: sim("prioridade") },
      { id: "urgencia", label: "Urgência", type: "checkboxes", options: ["Prescrição", "Reintegração"] },
      yn("segredo", "Segredo de justiça", { full: false }),
    ]},
    { id: "reclamante", title: "Dados do reclamante", subtitle: "Qualificação", fields: [
      { id: "nome", label: "Nome", full: true, required: true },
      { id: "estadoCivil", label: "Estado civil", type: "radio", options: ["Solteiro", "Casado", "Viúvo", "Divorciado"], full: true },
      { id: "rg", label: "RG" }, { id: "cpf", label: "CPF/MF", type: "cpf" },
      { id: "nascimento", label: "Data de nascimento", type: "date" },
      { id: "endereco", label: "Endereço", full: true },
      { id: "bairro", label: "Bairro", third: true }, { id: "cidade", label: "Cidade", third: true }, { id: "cep", label: "CEP", type: "cep", third: true },
      { id: "celular", label: "Telefone celular", type: "phone" }, { id: "email", label: "E-mail" },
      { id: "telRecado", label: "Telefone para recados", type: "phone" }, { id: "telRecadoDono", label: "A quem pertence" },
    ]},
    { id: "contrato", title: "Empresa e contrato", subtitle: "Reclamada, datas e remuneração", fields: [
      { id: "empresa", label: "Empresa reclamada", full: true },
      { id: "cnpj", label: "CNPJ", type: "cnpj" }, { id: "sindicato", label: "Sindicato" },
      { id: "admissao", label: "Data de admissão", type: "date" }, { id: "rescisao", label: "Data da rescisão", type: "date" },
      { id: "modalidade", label: "Situação do contrato", type: "radio", options: ["Pedido de demissão", "Demissão", "Demissão por justa causa", "Trabalhando", "Acordo CLT"], full: true },
      { id: "remuneracao", label: "Última remuneração bruta (média)", type: "currency" },
      { id: "resumoPedidos", label: "Resumo de pedidos", type: "textarea", full: true },
    ]},
    { id: "responsabilidade", title: "Responsabilidade", subtitle: "Solidária e subsidiária", fields: [
      yn("solidaria", "Responsabilidade solidária"),
      ...gated(sim("solidaria"), [{ id: "solidariaEmpresa", label: "Empresa(s) com CNPJ", type: "textarea", full: true }, { id: "solidariaMotivo", label: "Motivo", full: true }]),
      yn("subsidiaria", "Responsabilidade subsidiária"),
      ...gated(sim("subsidiaria"), [{ id: "subsidiariaEmpresa", label: "Empresa(s) com CNPJ", type: "textarea", full: true }, { id: "subsidiariaMotivo", label: "Motivo", full: true }]),
    ]},
    { id: "vinculo", title: "Vínculo e rescisão", subtitle: "Reconhecimento, rescisão indireta e justa causa", fields: [
      yn("vinculo", bank ? "Vínculo empregatício ou enquadramento não reconhecido na CTPS" : "Vínculo empregatício não reconhecido na CTPS"),
      ...gated(sim("vinculo"), [
        { id: "vinculoTipo", label: "Situação", type: "checkboxes", options: bank ? ["Período de estágio", "Bancário", "Financiário", "Telemarketing", "Outro"] : ["Período de estágio", "Telemarketing", "Ausência de registro", "Outro"], full: true },
        { id: "vinculoOutro", label: "Outro · qual", full: true, when: when("vinculoTipo", "Outro") },
        { id: "subordinado", label: "A quem ficava subordinado" }, { id: "subordinadoCargo", label: "Cargo" },
        outrasInfo("vinculoInfo"),
      ]),
      yn("rescisaoIndireta", "Rescisão indireta"),
      ...gated(sim("rescisaoIndireta"), [
        { id: "rescisaoIndiretaMotivo", label: "Motivo", type: "checkboxes", options: ["Ausência de pagamento do salário", "Ausência de pagamento do FGTS", "Agressão ou perigo"], full: true },
        outrasInfo("rescisaoIndiretaInfo"),
      ]),
      yn("reversaoJustaCausa", "Reversão da justa causa"),
      { id: "alegacaoEmpresa", label: "Alegação da empresa", type: "textarea", full: true, when: sim("reversaoJustaCausa") },
    ]},
    { id: "saude", title: "Acidente e afastamento", subtitle: "Saúde no trabalho e INSS", fields: [
      yn("acidente", "Ocorreu acidente de trabalho?"),
      ...gated(sim("acidente"), [
        { id: "acidenteTipo", label: "Tipo", type: "checkboxes", options: ["LER/DORT", "Psicológico", "Outro"], full: true },
        { id: "acidentePsicologico", label: "Psicológico · qual", when: when("acidenteTipo", "Psicológico") },
        { id: "acidenteOutro", label: "Outro · qual", when: when("acidenteTipo", "Outro") },
        { id: "acidentePedidos", label: "Pedidos", type: "checkboxes", options: ["Danos materiais", "Lucros cessantes"], full: true },
      ]),
      yn("afastamentoInss", "Período de afastamento INSS"),
      ...gated(sim("afastamentoInss"), [
        { id: "inssDe", label: "Afastamento · de", type: "date" }, { id: "inssAte", label: "Afastamento · até", type: "date" },
        { id: "inssMotivo", label: "Motivo", type: "radio", options: ["Acidente de trabalho", "Acidente comum"], full: true },
      ]),
      yn("planoSaude", "Manutenção do plano de saúde"),
      { id: "documentosSaude", label: "Documentos", type: "checkboxes", options: ["INSS", "CAT", "Laudos médicos", "Exames", "Atestados"], full: true },
      outrasInfo("saudeInfo"),
    ]},
    { id: "maternidade", title: "Maternidade e reintegração", subtitle: "Licença, amamentação e estabilidade", fields: [
      yn("maternidade", "Período de afastamento INSS por auxílio-maternidade"),
      ...gated(sim("maternidade"), [
        { id: "maternidadeDe", label: "Afastamento · de", type: "date" }, { id: "maternidadeAte", label: "Afastamento · até", type: "date" },
        yn("amamentacao", "Intervalo para amamentação suprimido (art. 396 CLT)"),
        { id: "retornoMaternidade", label: "Data de retorno ao trabalho após auxílio-maternidade", type: "date", full: true },
      ]),
      yn("reintegracao", "Pedido de reintegração ao trabalho?"),
      ...gated(sim("reintegracao"), [
        { id: "reintegracaoRazao", label: "Razão para a reintegração", type: "checkboxes", options: ["Pré-aposentadoria", "Doença ocupacional", "Gestante", "Dispensa discriminatória (HIV ou doença grave que suscite estigma)"], full: true },
        { id: "reintegracaoDetalhes", label: "Detalhes", type: "textarea", full: true },
      ]),
    ]},
    { id: "sobreaviso", title: "Sobreaviso", subtitle: "Adicional de sobreaviso 24 horas", fields: [
      yn("sobreaviso", "Adicional de sobreaviso 24 horas", { hint: "apenas se o empregado não podia se deslocar para local longe do estabelecimento" }),
      ...gated(sim("sobreaviso"), [
        { id: "sobreavisoTipo", label: "Situação", type: "checkboxes", options: ["Disparos de alarme", "Trabalhava e dormia dentro do local", "Outro"], full: true },
        { id: "sobreavisoOutro", label: "Outro · qual", when: when("sobreavisoTipo", "Outro") },
        { id: "sobreavisoHorario", label: "Qual horário ficava em sobreaviso" },
      ]),
    ]},
    { id: "jornada", title: "Jornada", subtitle: "Horas extras", fields: [
      yn("horasExtras", "Há pedido de horas extras?"),
      ...gated(when("horasExtras", "Não"), [
        { id: "ultimoCargo", label: "Último cargo", full: true },
        { id: "jornadaIni", label: "Jornada praticada · entrada", type: "time", third: true },
        { id: "jornadaFim", label: "Jornada praticada · saída", type: "time", third: true },
        { id: "jornadaIntra", label: "Intrajornada", hint: "ex.: 1h", third: true },
      ]),
      { id: "qtdPeriodos", label: "Quantos cargos/períodos serão inseridos na inicial?", type: "radio", options: ["1", "2", "3"], full: true, when: sim("horasExtras") },
    ]},
    { id: "periodoA", title: "Período a)", subtitle: "Jornada para a inicial", when: sim("horasExtras"), fields: periodo(ficha, "a") },
    { id: "periodoB", title: "Período b)", subtitle: "Jornada para a inicial", when: when("qtdPeriodos", "2", "3"), fields: periodo(ficha, "b") },
    { id: "periodoC", title: "Período c)", subtitle: "Jornada para a inicial", when: when("qtdPeriodos", "3"), fields: periodo(ficha, "c") },
    { id: "alemJornada", title: "Trabalhos além da jornada", subtitle: "Reuniões, cursos, viagens", fields: [
      { id: "alemJornada", label: "Atividades", hint: "marque para abrir os detalhes", type: "checkboxes", options: atividades, full: true },
      ...atividades.flatMap((a) => {
        const key = `alem_${a.replace(/\W/g, "")}`;
        return gated(when("alemJornada", a), [
          { id: `${key}Freq`, label: `${a} · frequência`, third: true },
          { id: `${key}Lapso`, label: `${a} · lapso temporal`, third: true },
          { id: `${key}Duracao`, label: `${a} · duração`, third: true },
        ]);
      }),
      outrasInfo("alemJornadaInfo"),
    ]},
    { id: "pagamentos", title: "Transferência e pagamentos", subtitle: "Transferência, pagamento por fora e comissões", fields: [
      yn("transferencia", "Adicional de transferência"),
      ...gated(sim("transferencia"), repeat(2, (i) => [
        { id: `transf${i}De`, label: `Transferência ${i} · de`, third: true },
        { id: `transf${i}Para`, label: "Para", third: true },
        { id: `transf${i}Data`, label: "Transferido em", type: "date", third: true },
      ])),
      yn("porFora", "Incorporação de pagamento por fora"),
      ...gated(sim("porFora"), [
        { id: "porForaTipo", label: "O que era pago por fora", type: "checkboxes", options: ["Salário", "Comissão", "Outros"], full: true },
        { id: "porForaTipoOutros", label: "Outros · qual", when: when("porForaTipo", "Outros") },
        { id: "porForaValor", label: "Valor", type: "currency" },
        { id: "porForaMeio", label: "Forma de pagamento", type: "checkboxes", options: ["Em mãos", "Transferência bancária", "Cartão", "Outros"], full: true },
        { id: "porForaMeioOutros", label: "Outra forma · qual", full: true, when: when("porForaMeio", "Outros") },
      ]),
      yn("comissoes", "Diferença no pagamento de comissões"),
      ...gated(sim("comissoes"), [
        { id: "comissoesPagamento", label: "Pagamento", type: "radio", options: ["Mensal", "Semestral", "Anual", "Outros"], full: true },
        { id: "comissoesPagamentoOutros", label: "Outra periodicidade · qual", full: true, when: when("comissoesPagamento", "Outros") },
        { id: "comissoesMotivo", label: "Motivo", type: "checkboxes", options: ["Dedução por cliente inadimplente", "Mudança de metas no mês", "Registro para colegas", "Outro"], full: true },
        { id: "comissoesMotivoOutro", label: "Outro motivo", when: when("comissoesMotivo", "Outro") },
        { id: "comissoesValor", label: "Valor médio sonegado", type: "currency" },
        { id: "programaMetas", label: "Nome do programa de metas", full: true },
        outrasInfo("comissoesInfo"),
      ]),
    ]},
    { id: "funcoes", title: "Funções e salário", subtitle: "Equiparação, desvio, acúmulo e substituição", fields: [
      yn("equiparacao", "Equiparação salarial", { hint: "apenas com os 5 requisitos: identidade de funções, mesma perfeição técnica, mesmo estabelecimento, mesma atividade por tempo inferior a 2 anos e até 4 anos de diferença de admissão" }),
      ...gated(sim("equiparacao"), repeat(3, (i) => [
        { id: `equip${i}Periodo`, label: `Paradigma ${i} · período`, third: true },
        { id: `equip${i}Paradigma`, label: "Paradigma", third: true },
        { id: `equip${i}Salario`, label: "Salário", type: "currency", third: true },
      ])),
      yn("desvio", "Desvio de função"),
      ...gated(sim("desvio"), repeat(2, (i) => [
        { id: `desvio${i}Periodo`, label: `Desvio ${i} · período`, third: true },
        { id: `desvio${i}Cargo`, label: "Cargo", third: true },
        { id: `desvio${i}Salario`, label: "Salário", type: "currency", third: true },
      ])),
      yn("acumulo", "Acúmulo de função"),
      ...gated(sim("acumulo"), repeat(2, (i) => [
        { id: `acumulo${i}Periodo`, label: `Acúmulo ${i} · período`, third: true },
        { id: `acumulo${i}Funcao`, label: "Função", third: true },
        { id: `acumulo${i}Atividades`, label: "Atividades", third: true },
      ])),
      yn("substituicao", "Salário substituição"),
      ...gated(sim("substituicao"), repeat(2, (i) => [
        { id: `subst${i}Periodo`, label: `Substituição ${i} · período`, third: true },
        { id: `subst${i}Substituido`, label: "Substituído", third: true },
        { id: `subst${i}Salario`, label: "Salário", type: "currency", third: true },
      ])),
    ]},
    { id: "danoMoral", title: "Dano moral e assédio", subtitle: "Dano moral, assédio moral e sexual", fields: [
      yn("danoMoral", "Dano moral"),
      ...gated(sim("danoMoral"), [
        { id: "danoMoralMotivo", label: "Motivo", type: "checkboxes", options: ["Retenção CTPS", "Ausência de registro de vínculo", "Assalto ou agressão física no local", "Outros"], full: true },
        { id: "danoMoralOutros", label: "Outros · qual", full: true, when: when("danoMoralMotivo", "Outros") },
        { id: "danoMoralData", label: "Data dos fatos", type: "date" },
        outrasInfo("danoMoralInfo"),
      ]),
      yn("assedioMoral", "Assédio moral"),
      ...gated(sim("assedioMoral"), [
        ...repeat(3, (i) => [{ id: `assedioMoral${i}Nome`, label: `Assediador ${i}` }, { id: `assedioMoral${i}Cargo`, label: "Cargo" }]),
        { id: "ameacas", label: "Ameaças", type: "checkboxes", options: ["Demissão", "Rebaixamento", "Transferência", "Palavras de baixo calão e chacotas", "Exposição em rankings", "Outros"], full: true },
        { id: "ameacasOutros", label: "Outras ameaças", full: true, when: when("ameacas", "Outros") },
        outrasInfo("assedioMoralInfo"),
      ]),
      yn("assedioSexual", "Assédio sexual"),
      ...gated(sim("assedioSexual"), [
        ...repeat(2, (i) => [{ id: `assedioSexual${i}Nome`, label: `Assediador ${i}` }, { id: `assedioSexual${i}Cargo`, label: "Cargo" }]),
        outrasInfo("assedioSexualInfo"),
      ]),
    ]},
    { id: "despesas", title: "Despesas e adicionais", subtitle: "Numerário, veículo, periculosidade e insalubridade", fields: [
      yn("numerario", "Transporte de numerário", { hint: "apenas transporte de valores acima de R$ 8.000,00" }),
      ...gated(sim("numerario"), [
        { id: "numerarioLocais", label: "De qual local para qual local", full: true },
        { id: "numerarioQuando", label: "Quando ocorreu" }, { id: "numerarioValor", label: "Valor", type: "currency" },
      ]),
      yn("veiculo", "Despesa com veículo"),
      ...gated(sim("veiculo"), [
        { id: "veiculoTipo", label: "Despesas", type: "checkboxes", options: ["Combustível", "Desgaste e depreciação de veículo", "Estacionamento", "Outros"], full: true },
        { id: "veiculoOutros", label: "Outros · qual", full: true, when: when("veiculoTipo", "Outros") },
        { id: "veiculoKm", label: "Km rodados por mês", third: true }, { id: "veiculoLocais", label: "Locais", third: true },
        { id: "veiculoMedia", label: "Média de gasto mensal", type: "currency", third: true },
      ]),
      yn("outrosGastos", "Outros valores gastos e não reembolsados (ex.: vestimentas)"),
      ...gated(sim("outrosGastos"), [{ id: "outrosGastosMotivo", label: "Motivo" }, { id: "outrosGastosValor", label: "Valor médio gasto", type: "currency" }]),
      yn("periculosidade", "Adicional de periculosidade"),
      ...gated(sim("periculosidade"), [
        { id: "periculosidadeAgente", label: "Agente perigoso", type: "checkboxes", options: ["Gás", "Inflamáveis", "Motocicleta", "Energia elétrica", "Vigilante ou segurança"], full: true },
        outrasInfo("periculosidadeInfo"),
      ]),
      { id: "insalubridade", label: "Adicional de insalubridade", type: "radio", options: bank ? yesNo : [...yesNo, "Majorar de 20% para 40%"], full: true },
      ...gated(when("insalubridade", "Sim", "Majorar de 20% para 40%"), [
        { id: "insalubridadeAgente", label: "Agente insalubre", type: "checkboxes", options: ["Frio", "Calor", "Biológico", "Químico", "Ruído", "Vibração", "Poeira"], full: true },
        outrasInfo("insalubridadeInfo"),
      ]),
    ]},
    { id: "ferias", title: "Férias e FGTS", subtitle: "Férias forçadas, trabalho nas férias e FGTS", fields: [
      yn("feriasForcadas", "Férias forçadas de 20 dias"),
      ...gated(sim("feriasForcadas"), [
        { id: "feriasSituacao", label: "Situação", type: "radio", options: ["Nunca gozou férias de 30 dias nos últimos cinco anos", "Gozou 30 dias em alguns anos"], full: true },
        { id: "feriasAnos", label: "Anos em que gozou 30 dias", full: true, when: when("feriasSituacao", "Gozou 30 dias em alguns anos") },
      ]),
      yn("trabalhoFerias", "Trabalho durante as férias"),
      { id: "trabalhoFeriasPeriodo", label: "Período", full: true, when: sim("trabalhoFerias") },
      yn("fgts", "Diferença no FGTS (ex.: afastamento INSS cód. 91)"),
      { id: "fgtsPeriodo", label: "Período", full: true, when: sim("fgts") },
    ]},
    { id: "verbas", title: bank ? "Rescisão e verbas bancárias" : "Rescisão e benefícios", subtitle: bank ? "Verbas rescisórias, PLR e verbas de bancos" : "Verbas rescisórias, PLR e benefícios", fields: [
      yn("verbas", "Recebimento de verbas rescisórias"),
      { id: "verbasProblema", label: "Problema nas verbas", type: "checkboxes", options: ["Desconto indevido", "Não recebeu nada"], full: true },
      { id: "motivoDesconto", label: "Motivo do desconto", full: true, when: when("verbasProblema", "Desconto indevido") },
      yn("prazo10", "Entrega de documentação e pagamento no prazo de 10 dias", { full: false }),
      yn("homologacao", "Houve homologação da rescisão", { full: false }),
      yn("plr", "PLR proporcional não paga"),
      ...(ficha === "farmacia" ? [yn("responsavelTecnico", "Adicional responsável técnico (farmacêutico)")] : []),
      ...(bank ? [
        yn("plrDiferenca", "Diferença pelo cálculo incorreto da PLR (mais de 1 ano de contrato)"),
        yn("rp52", "RP-52 Itaú (admitidos até 06/2015)"),
        yn("gratSantander", "Gratificação especial Santander (10 anos e demissão sem justa causa)"),
        yn("verbaBradesco", "Verba de representação Bradesco"),
        yn("pdeBradesco", "PDE Bradesco"),
      ] : []),
      yn("reducao", "Redução salarial"),
      ...gated(sim("reducao"), [{ id: "reducaoMotivo", label: "Motivo" }, { id: "reducaoNovoSalario", label: "Novo salário", type: "currency" }]),
      ...(bank ? [] : [
        yn("salarioFamilia", "Salário-família (salário até R$ 1.819,26)"),
        ...gated(sim("salarioFamilia"), [{ id: "filhos", label: "Quantidade de filhos" }, { id: "filhosRecebia", label: "Recebia de algum?" }]),
        yn("vt", "Vale-transporte"),
        ...gated(sim("vt"), [{ id: "vtPeriodo", label: "Período" }, { id: "vtValor", label: "Valor gasto mensalmente", type: "currency" }]),
        yn("vr", "Vale-refeição"),
        ...gated(sim("vr"), [{ id: "vrPeriodo", label: "Período" }, { id: "vrValor", label: "Valor gasto mensalmente", type: "currency" }]),
      ]),
    ]},
    { id: "outras", title: "Outras informações", subtitle: "Informações e pedidos adicionais", fields: [
      { id: "outrasInformacoes", label: "Outras informações / pedidos", type: "textarea", full: true },
    ]},
  ];
}

const matches = (value: string | undefined, cond: Condition) => !!value && value.split(" | ").some((v) => cond.values.includes(v));

/** Seções e campos visíveis para a ficha, considerando as respostas (campos condicionais em cadeia). */
export function visibleSections(ficha: FichaId, values: Record<string, string>): Section[] {
  const all = buildSections(ficha);
  const byId = new Map(all.flatMap((s) => s.fields.map((f) => [f.id, f] as const)));
  const shown = (cond?: Condition, depth = 0): boolean => {
    if (!cond) return true;
    if (!matches(values[cond.id], cond)) return false;
    return depth > 10 || shown(byId.get(cond.id)?.when, depth + 1);
  };
  return all.filter((s) => shown(s.when)).map((s) => ({ ...s, fields: s.fields.filter((f) => shown(f.when)) }));
}
