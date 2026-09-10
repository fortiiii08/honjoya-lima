import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileDown,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import teamAsset from "../assets/honjoya-lima-equipe.png.asset.json";
import logoAsset from "../assets/honjoya-lima-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Triagem Trabalhista | Honjoya & Lima Advogados" },
      {
        name: "description",
        content:
          "Ficha confidencial de atendimento trabalhista do escritório Honjoya & Lima Advogados.",
      },
      { property: "og:title", content: "Triagem Trabalhista | Honjoya & Lima" },
      {
        property: "og:description",
        content: "Conte seu caso com segurança para a análise de nossa equipe jurídica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type FieldType = "text" | "textarea" | "select" | "radio" | "checkboxes" | "date" | "currency" | "cpf" | "cnpj" | "phone" | "cep";
type Field = { id: string; label: string; hint?: string; type?: FieldType; options?: string[]; full?: boolean; required?: boolean };
type Section = { title: string; subtitle: string; fields: Field[] };

const yesNo = ["Sim", "Não"];
const sections: Section[] = [
  { title: "Seus dados", subtitle: "Quem é você", fields: [
    { id: "nome", label: "Nome completo", full: true, required: true },
    { id: "cpf", label: "CPF", hint: "só os números", type: "cpf", full: true },
    { id: "rg", label: "RG" }, { id: "nascimento", label: "Data de nascimento", type: "date" },
    { id: "estadoCivil", label: "Estado civil", type: "select", options: ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)"] },
    { id: "profissao", label: "Profissão" },
    { id: "ctps", label: "Nº da Carteira de Trabalho (CTPS)", hint: "se souber", full: true },
    { id: "pis", label: "PIS/PASEP/NIT", hint: "se souber", full: true },
    { id: "endereco", label: "Endereço", hint: "rua, número, bairro", full: true },
    { id: "cidade", label: "Cidade" }, { id: "cep", label: "CEP", type: "cep" },
    { id: "telefone", label: "Telefone", type: "phone" }, { id: "whatsapp", label: "WhatsApp", type: "phone" },
    { id: "email", label: "E-mail", full: true },
  ]},
  { title: "A empresa", subtitle: "Onde você trabalhou", fields: [
    { id: "empresa", label: "Nome da empresa", full: true }, { id: "cnpj", label: "CNPJ", hint: "se souber (está no holerite)", type: "cnpj", full: true },
    { id: "empresaEndereco", label: "Endereço da empresa", full: true }, { id: "empresaCidade", label: "Cidade" }, { id: "empresaTelefone", label: "Telefone da empresa", type: "phone" },
    { id: "responsavel", label: "Nome do dono / responsável", full: true }, { id: "ramo", label: "Ramo de atividade", hint: "ex.: comércio", full: true },
    { id: "ativa", label: "A empresa ainda está funcionando?", type: "radio", options: ["Sim", "Não", "Não sei"], full: true },
    { id: "terceirizacao", label: "Você foi contratado por outra empresa que prestava serviço a essa? (terceirização)", type: "radio", options: yesNo, full: true },
    { id: "tomadora", label: "Qual era a empresa que tomava o serviço (onde você realmente trabalhava)?", full: true },
  ]},
  { title: "Seu contrato", subtitle: "Admissão, cargo e salário", fields: [
    { id: "admissao", label: "Data de admissão", type: "date" }, { id: "saida", label: "Data da saída", hint: "se saiu", type: "date" },
    { id: "trabalhaAinda", label: "Você ainda trabalha na empresa?", type: "radio", options: yesNo, full: true },
    { id: "cargo", label: "Cargo registrado na carteira", full: true }, { id: "funcao", label: "Função que você realmente exercia", hint: "o que fazia de verdade", full: true },
    { id: "mudancaFuncao", label: "Houve mudança de função?", type: "radio", options: yesNo }, { id: "carteiraAssinada", label: "Sua carteira de trabalho foi assinada?", type: "radio", options: yesNo },
    { id: "salario", label: "Salário registrado", type: "currency" }, { id: "salarioReal", label: "Salário que recebia de verdade", type: "currency" },
    { id: "porFora", label: "Recebia alguma parte “por fora”?", type: "radio", options: yesNo, full: true },
    { id: "pagamento", label: "Forma de pagamento", type: "radio", options: ["Dinheiro", "Pix", "Depósito", "Cheque"], full: true },
    { id: "banco", label: "Banco em que recebia", full: true },
    { id: "contrato", label: "Seu contrato era…", type: "radio", options: ["Sem prazo", "Experiência/prazo", "Temporário", "Intermitente"], full: true },
  ]},
  { title: "Seus horários", subtitle: "Jornada de trabalho", fields: [
    { id: "dias", label: "Dias em que trabalhava", type: "checkboxes", options: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"], full: true },
    { id: "entrada", label: "Horário de entrada" }, { id: "horarioSaida", label: "Horário de saída" },
    { id: "intervalo", label: "Intervalo de almoço/descanso", hint: "quanto tempo tinha de verdade", full: true },
    { id: "extras", label: "Fazia horas extras?", type: "radio", options: yesNo }, { id: "quantasExtras", label: "Quantas horas extras por dia, em média?" },
    { id: "sabado", label: "Trabalhava aos sábados?", type: "radio", options: yesNo }, { id: "domingo", label: "E aos domingos?", type: "radio", options: yesNo },
    { id: "feriados", label: "E em feriados?", type: "radio", options: yesNo }, { id: "plantao", label: "Fazia plantão?", type: "radio", options: yesNo },
    { id: "noturno", label: "Trabalhava à noite, depois das 22h?", type: "radio", options: yesNo, full: true },
    { id: "ponto", label: "A empresa tinha controle de ponto?", type: "radio", options: ["Sim, manual", "Sim, eletrônico", "Não"], full: true },
  ]},
  { title: "O que não foi pago", subtitle: "Verbas e benefícios", fields: [
    { id: "naoPago", label: "Marque tudo que deixou de receber ou veio errado", type: "checkboxes", options: ["Férias", "13º salário", "FGTS", "INSS", "Horas extras", "Adicional noturno", "Insalubridade", "Periculosidade", "Comissões", "Vale-transporte", "Vale-alimentação", "Cesta básica", "PLR", "Salário atrasado", "Desvio de função"], full: true },
    { id: "outrosBeneficios", label: "Outros benefícios não pagos", hint: "se houver", full: true },
    { id: "exposicao", label: "Trabalhava exposto a algo perigoso ou prejudicial à saúde?", hint: "calor, ruído, produtos químicos, eletricidade, inflamáveis etc.", type: "radio", options: yesNo, full: true },
    { id: "epi", label: "A que exatamente você ficava exposto e recebia equipamento de proteção (EPI)?", type: "textarea", full: true },
  ]},
  { title: "Como terminou", subtitle: "Rescisão do contrato", fields: [
    { id: "termino", label: "Como terminou o contrato?", type: "radio", options: ["Fui dispensado(a)", "Pedi demissão", "Justa causa", "Acordo"], full: true },
    { id: "pressionado", label: "Você foi forçado ou pressionado a pedir demissão?", type: "radio", options: yesNo, full: true },
    { id: "acerto", label: "Recebeu o acerto (verbas rescisórias)?", type: "radio", options: ["Sim", "Não", "Em parte"], full: true },
    { id: "aviso", label: "Recebeu aviso prévio (trabalhado ou indenizado)?", type: "radio", options: yesNo }, { id: "seguro", label: "Recebeu o seguro-desemprego?", type: "radio", options: yesNo },
    { id: "fgtsCerto", label: "O FGTS foi depositado certinho?", type: "radio", options: ["Sim", "Não", "Não sei"] }, { id: "fgtsSaque", label: "Conseguiu sacar o FGTS?", type: "radio", options: yesNo },
    { id: "multaFgts", label: "Recebeu a multa de 40% do FGTS?", type: "radio", options: ["Sim", "Não", "Não sei"] },
    { id: "documentosRescisao", label: "Recebeu os documentos da rescisão?", hint: "TRCT, chave para saque, guias", type: "radio", options: yesNo, full: true },
  ]},
  { title: "Saúde no trabalho", subtitle: "Acidente ou doença", fields: [
    { id: "acidente", label: "Sofreu algum acidente ou adoeceu por causa do trabalho?", type: "radio", options: yesNo, full: true },
    { id: "dataAcidente", label: "Data do acidente/início da doença", type: "date" }, { id: "localAcidente", label: "Onde aconteceu?" },
    { id: "cat", label: "A empresa emitiu a CAT?", hint: "Comunicação de Acidente de Trabalho", type: "radio", options: ["Sim", "Não", "Não sei"], full: true },
    { id: "afastado", label: "Ficou afastado pelo INSS?", type: "radio", options: yesNo }, { id: "auxilio", label: "Recebeu auxílio-doença/auxílio-acidente?", type: "radio", options: yesNo },
    { id: "sequela", label: "Ficou com alguma sequela ou limitação?", type: "radio", options: yesNo }, { id: "laudos", label: "Tem laudos ou exames médicos guardados?", type: "radio", options: yesNo },
    { id: "tratamento", label: "Faz tratamento atualmente?", type: "radio", options: yesNo, full: true },
    { id: "relatoAcidente", label: "Conte como o acidente ou a doença aconteceu", type: "textarea", full: true },
  ]},
  { title: "Tratamento no trabalho", subtitle: "Assédio, humilhações, ofensas", fields: [
    { id: "assedioMoral", label: "Sofreu assédio moral?", hint: "pressão, perseguição, tratamento humilhante repetido", type: "radio", options: yesNo, full: true },
    { id: "assedioSexual", label: "Sofreu assédio sexual?", type: "radio", options: yesNo }, { id: "humilhacoes", label: "Passou por humilhações?", type: "radio", options: yesNo },
    { id: "ofensas", label: "Recebeu xingamentos ou ofensas?", type: "radio", options: yesNo },
    { id: "discriminacao", label: "Sofreu discriminação?", hint: "por sexo, raça, idade, religião, gravidez, doença etc.", type: "radio", options: yesNo, full: true },
    { id: "presenciou", label: "Alguém presenciou essas situações?", type: "radio", options: yesNo }, { id: "quemPraticava", label: "Quem praticava?", hint: "nome ou cargo (ex.: gerente)", full: true },
  ]},
  { title: "Antes de nos procurar", subtitle: "Acordos, prazos e ações anteriores", fields: [
    { id: "maisDoisAnos", label: "Faz mais de 2 anos que você saiu dessa empresa?", hint: "o prazo para entrar com ação costuma ser de 2 anos após a saída", type: "radio", options: ["Sim", "Não", "Ainda trabalho lá"], full: true },
    { id: "acaoAnterior", label: "Você já entrou com alguma ação trabalhista contra essa empresa antes?", type: "radio", options: yesNo, full: true },
    { id: "processoAnterior", label: "Se já entrou, informe o número do processo e como terminou", hint: "se souber", full: true },
    { id: "quitacao", label: "Ao sair, assinou algum acordo ou termo dizendo que estava “tudo quitado”?", type: "radio", options: ["Sim", "Não", "Não sei"], full: true },
    { id: "acordoGrupo", label: "Participou de acordo em grupo, PDV ou homologação no sindicato?", type: "radio", options: yesNo, full: true },
    { id: "procurou", label: "Já procurou o sindicato, Ministério do Trabalho ou outro advogado?", type: "radio", options: yesNo, full: true },
    { id: "orientacao", label: "Onde procurou e o que foi orientado?", type: "textarea", full: true },
    { id: "negociacao", label: "Se houve alguma negociação ou promessa da empresa, conte os detalhes", type: "textarea", full: true },
  ]},
  { title: "Documentos e provas", subtitle: "O que você tem guardado", fields: [
    { id: "provas", label: "Marque tudo que você tem guardado", type: "checkboxes", options: ["Carteira de Trabalho", "Holerites", "Extrato do FGTS", "Extrato do CNIS", "Contrato", "Termo de rescisão", "Advertências", "Suspensões", "Mensagens de WhatsApp", "E-mails", "Fotos", "Vídeos", "Áudios", "Escalas", "Cartões de ponto", "Laudos médicos", "Comprovantes Pix/depósito"], full: true },
    { id: "outrasProvas", label: "Outras provas", full: true },
    { id: "provaDetalhes", label: "Existe outro documento, mensagem, foto, vídeo ou áudio que ajude a comprovar o que aconteceu?", type: "textarea", full: true },
    { id: "documentosPendentes", label: "Documentos que você ainda precisa providenciar", hint: "que não tem em mãos agora", type: "textarea", full: true },
  ]},
  { title: "Testemunhas", subtitle: "Pessoas que podem confirmar sua história", fields: [1, 2, 3].flatMap((n) => [
    { id: `testemunha${n}Nome`, label: `Testemunha ${n} · Nome`, full: true },
    { id: `testemunha${n}Telefone`, label: "Telefone", type: "phone" as FieldType }, { id: `testemunha${n}Cargo`, label: "Cargo / relação" },
    { id: `testemunha${n}Junto`, label: "Trabalhou junto com você?", type: "radio" as FieldType, options: yesNo, full: true },
    { id: `testemunha${n}Relato`, label: "O que essa pessoa presenciou ou pode confirmar?", type: "textarea" as FieldType, full: true },
  ])},
  { title: "Sua história", subtitle: "Conte com suas palavras", fields: [
    { id: "historia", label: "Agora conte, com suas próprias palavras, o que aconteceu — do início até hoje", hint: "escreva à vontade, sem se preocupar com termos técnicos", type: "textarea", full: true, required: true },
    { id: "objetivo", label: "O que você espera resolver?", type: "textarea", full: true },
  ]},
];

const digits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);
function mask(value: string, type?: FieldType) {
  const d = digits(value, type === "cnpj" ? 14 : type === "cpf" ? 11 : type === "cep" ? 8 : type === "phone" ? 11 : 99);
  if (type === "cpf") return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  if (type === "cnpj") return d.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  if (type === "cep") return d.replace(/(\d{5})(\d)/, "$1-$2");
  if (type === "phone") return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{4})$/, "$1-$2");
  if (type === "currency") return d ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(d) / 100) : "";
  return value;
}

function Index() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const completed = useMemo(() => sections.filter((s) => s.fields.some((f) => values[f.id]?.trim())).length, [values]);
  const setValue = (id: string, value: string, type?: FieldType) => setValues((old) => ({ ...old, [id]: mask(value, type) }));

  const reportText = () => [
    "FICHA DE ATENDIMENTO TRABALHISTA",
    "HONJOYA & LIMA ADVOGADOS",
    "",
    ...sections.flatMap((section, i) => [
      `${i + 1}. ${section.title.toUpperCase()}`,
      ...section.fields.filter((field) => values[field.id]).map((field) => `${field.label}: ${values[field.id]}`),
      "",
    ]),
  ].join("\n");

  const downloadText = () => {
    const blob = new Blob([reportText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "triagem-trabalhista-honjoya-lima.txt"; anchor.click(); URL.revokeObjectURL(url);
  };
  const buildPdf = async () => {
    const { jsPDF } = await import("jspdf");

    // Load logo as base64
    let logoDataUrl: string | null = null;
    try {
      const resp = await fetch("/honjoya-lima-logo.png");
      const blob = await resp.blob();
      logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { /* logo not critical */ }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    const marginL = 18;
    const marginR = 18;
    const contentW = W - marginL - marginR;

    // ── HEADER ──────────────────────────────────────────────────────────
    // Dark green background
    doc.setFillColor(15, 54, 46);
    doc.rect(0, 0, W, 42, "F");

    // Logo
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", marginL, 4, 32, 32);
    }

    // Title text
    const txtX = logoDataUrl ? marginL + 36 : marginL;
    doc.setTextColor(176, 139, 62); // gold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("HONJOYA & LIMA ADVOGADOS", txtX, 16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Ficha de Atendimento Trabalhista · Confidencial", txtX, 24);

    // Date
    const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    doc.setFontSize(7.5);
    doc.setTextColor(176, 139, 62);
    doc.text(today, txtX, 32);

    // Gold divider line
    doc.setDrawColor(176, 139, 62);
    doc.setLineWidth(0.6);
    doc.line(0, 42, W, 42);

    let y = 52;

    const checkPage = (needed = 6) => {
      if (y + needed > 282) { doc.addPage(); y = 18; }
    };

    // ── SECTIONS ────────────────────────────────────────────────────────
    sections.forEach((section, idx) => {
      const filled = section.fields.filter((f) => values[f.id]?.trim());
      if (filled.length === 0) return;

      checkPage(14);

      // Section header bar
      doc.setFillColor(238, 232, 218); // paper tone
      doc.rect(marginL, y - 4, contentW, 10, "F");
      doc.setDrawColor(176, 139, 62);
      doc.setLineWidth(0.4);
      doc.rect(marginL, y - 4, contentW, 10);

      // Section number badge
      doc.setFillColor(15, 54, 46);
      doc.rect(marginL, y - 4, 10, 10, "F");
      doc.setTextColor(176, 139, 62);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(String(idx + 1), marginL + 5, y + 2, { align: "center" });

      // Section title
      doc.setTextColor(15, 54, 46);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(section.title.toUpperCase(), marginL + 13, y + 2);

      // Section subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 90, 70);
      doc.text(section.subtitle, marginL + 13, y + 6.5);

      y += 14;

      // Fields
      filled.forEach((field) => {
        const labelText = field.label;
        const valueText = values[field.id]!;

        // Measure label width to place value right after
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        const labelWidth = doc.getTextWidth(labelText + ": ");

        // Wrap value text
        doc.setFont("helvetica", "normal");
        const maxValueW = contentW - labelWidth - 2;
        const valueLines = doc.splitTextToSize(valueText, maxValueW > 60 ? maxValueW : contentW);

        const blockHeight = valueLines.length * 5 + 3;
        checkPage(blockHeight + 2);

        // Label bullet
        doc.setFillColor(176, 139, 62);
        doc.circle(marginL + 1.5, y - 0.5, 0.8, "F");

        // Label in bold dark green
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 54, 46);
        doc.text(labelText + ":", marginL + 4, y);

        // Value — if fits on same line
        doc.setFont("helvetica", "normal");
        doc.setTextColor(35, 35, 35);
        if (valueLines.length === 1 && labelWidth + doc.getTextWidth(valueLines[0]) < contentW - 2) {
          doc.text(valueLines[0], marginL + 4 + labelWidth, y);
          y += 6;
        } else {
          y += 5.5;
          valueLines.forEach((line: string) => {
            checkPage(5);
            doc.text(line, marginL + 6, y);
            y += 4.8;
          });
          y += 1;
        }
      });

      // Thin separator after section
      checkPage(6);
      doc.setDrawColor(200, 190, 170);
      doc.setLineWidth(0.2);
      doc.line(marginL, y + 2, marginL + contentW, y + 2);
      y += 8;
    });

    // ── FOOTER on each page ─────────────────────────────────────────────
    const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(15, 54, 46);
      doc.rect(0, 287, W, 10, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(176, 139, 62);
      doc.text("HONJOYA & LIMA ADVOGADOS · Sigilo profissional garantido", marginL, 293);
      doc.setTextColor(255, 255, 255);
      doc.text(`Página ${p} de ${totalPages}`, W - marginR, 293, { align: "right" });
    }

    const pdfBlob = doc.output("blob");
    return pdfBlob;
  };

  const downloadPdf = async () => {
    const blob = await buildPdf();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "triagem-trabalhista-honjoya-lima.pdf"; a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => { await navigator.clipboard.writeText(reportText()); setCopied(true); window.setTimeout(() => setCopied(false), 2200); };

  const whatsapp = async (pdf = false) => {
    if (!pdf) {
      window.open(`https://wa.me/5511964799380?text=${encodeURIComponent(reportText())}`, "_blank", "noopener,noreferrer");
      return;
    }

    const blob = await buildPdf();
    const file = new File([blob], "triagem-trabalhista-honjoya-lima.pdf", { type: "application/pdf" });

    // On mobile: use native share sheet so the PDF goes straight as attachment
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Ficha Trabalhista – Honjoya & Lima",
          text: "Olá! Segue minha ficha de atendimento trabalhista.",
        });
        return;
      } catch { /* user cancelled or error — fall through to desktop flow */ }
    }

    // Desktop fallback: download PDF + open WhatsApp
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "triagem-trabalhista-honjoya-lima.pdf"; a.click();
    URL.revokeObjectURL(url);
    window.open(`https://wa.me/5511964799380?text=${encodeURIComponent("Olá! Preenchi minha ficha trabalhista. Vou anexar o PDF nesta conversa.")}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-brand-gold/40 bg-brand-deep/95 shadow-header backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-8">
          <a href="#inicio" aria-label="Honjoya & Lima Advogados" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Logo Honjoya & Lima Advogados" className="h-28 w-28 object-contain sm:h-36 sm:w-36" />
            <div className="text-brand-light"><div className="font-display text-lg leading-none sm:text-2xl">HONJOYA & LIMA</div><div className="mt-1 text-[9px] tracking-[0.32em] text-brand-gold sm:text-[10px]">ADVOGADOS</div></div>
          </a>
          <div className="hidden items-center gap-2 text-xs text-brand-light/75 sm:flex"><ShieldCheck className="size-4 text-brand-gold" /> Sigilo profissional</div>
        </div>
      </header>

      <section id="inicio" className="relative isolate overflow-hidden bg-brand-deep">
        <img src={teamAsset.url} alt="Advogados da Honjoya & Lima no escritório" className="h-[580px] w-full object-cover object-[68%_center] sm:h-[720px] lg:h-[860px]" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl items-end px-5 pb-10 sm:px-8 sm:pb-16">
          <div className="max-w-2xl text-brand-light">
            <div className="mb-4 h-px w-16 bg-brand-gold" />
            <h1 className="font-display text-4xl leading-tight sm:text-6xl">Ficha de Atendimento Trabalhista</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-brand-light/85 sm:text-base">Conte o que aconteceu com calma. Nossa equipe analisará cada detalhe do seu caso com atenção e confidencialidade.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-gold/30 bg-brand-paper px-4 py-7 text-center">
        <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">Leva cerca de <strong className="text-foreground">10 minutos</strong>. Pontos, barras e traços aparecem sozinhos. Se não souber alguma resposta, pode deixar em branco.</p>
      </section>

      <div className="sticky top-20 z-40 border-b border-brand-gold/30 bg-brand-ink px-4 py-3 text-brand-light sm:top-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold tracking-[0.16em]"><span>SEU PROGRESSO</span><span className="text-brand-gold">{completed} DE 12 SEÇÕES</span></div>
          <div className="h-1 overflow-hidden bg-brand-light/15"><div className="h-full bg-brand-gold transition-all duration-500" style={{ width: `${(completed / 12) * 100}%` }} /></div>
        </div>
      </div>

      <form className="mx-auto max-w-4xl space-y-3 px-3 py-8 sm:px-6 sm:py-12" onSubmit={(e) => e.preventDefault()}>
        {sections.map((section, index) => {
          const isOpen = open === index;
          const hasAnswer = section.fields.some((f) => values[f.id]?.trim());
          return <section key={section.title} className={`overflow-hidden border bg-card shadow-card transition-colors ${isOpen ? "border-brand-gold" : "border-border"}`}>
            <button type="button" onClick={() => setOpen(isOpen ? null : index)} className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-6" aria-expanded={isOpen}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-deep text-sm font-bold text-brand-gold">{index + 1}</span>
              <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{section.subtitle}</span><span className="block font-display text-lg leading-tight">{section.title}</span></span>
              <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold sm:block ${hasAnswer ? "bg-brand-mint text-brand-deep" : "bg-muted text-muted-foreground"}`}>{hasAnswer ? "em andamento" : "em branco"}</span>
              <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <div className="grid grid-cols-1 gap-x-4 gap-y-5 border-t border-border px-4 py-6 sm:grid-cols-2 sm:px-6">
              {section.fields.map((field) => <FieldControl key={field.id} field={field} value={values[field.id] ?? ""} onChange={(value) => setValue(field.id, value, field.type)} />)}
              <div className="col-span-full flex justify-end border-t border-border pt-5">
                <button type="button" onClick={() => { setOpen(index < sections.length - 1 ? index + 1 : null); requestAnimationFrame(() => window.scrollBy({ top: 180, behavior: "smooth" })); }} className="inline-flex min-h-11 items-center gap-2 bg-brand-deep px-5 text-sm font-semibold text-brand-light transition hover:bg-brand-green">
                  {index === sections.length - 1 ? <Check className="size-4" /> : null}{index === sections.length - 1 ? "Concluir triagem" : "Próxima seção"}
                </button>
              </div>
            </div>}
          </section>;
        })}
      </form>

      <section className="border-t border-brand-gold/30 bg-brand-deep px-4 py-14 text-brand-light">
        <div className="mx-auto max-w-4xl text-center">
          <LockKeyhole className="mx-auto size-7 text-brand-gold" />
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Tudo pronto?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-brand-light/70">Revise suas respostas e envie para o escritório. Suas informações são protegidas por sigilo profissional.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Action onClick={() => void whatsapp(true)} primary icon={<MessageCircle className="size-5" />}>Baixar PDF e abrir WhatsApp</Action>
            <Action onClick={() => void downloadPdf()} icon={<FileDown className="size-5" />}>Baixar PDF</Action>
            <Action onClick={() => void whatsapp(false)} icon={<MessageCircle className="size-5" />}>Enviar por texto no WhatsApp</Action>
            <Action onClick={() => void copy()} icon={copied ? <Check className="size-5" /> : <Clipboard className="size-5" />}>{copied ? "Respostas copiadas" : "Copiar respostas"}</Action>
            <div className="sm:col-span-2"><Action onClick={downloadText} icon={<Download className="size-5" />}>Baixar arquivo de texto (.txt)</Action></div>
          </div>
          <p className="mt-8 text-xs leading-5 text-brand-light/55">Este formulário não guarda dados em nenhum servidor. As respostas ficam somente neste aparelho até você enviá-las.</p>
        </div>
      </section>
      <footer className="bg-brand-ink px-4 py-5 text-center text-xs text-brand-light/50">© {new Date().getFullYear()} Honjoya & Lima Advogados · Sigilo profissional garantido</footer>
    </main>
  );
}

function Action({ children, icon, onClick, primary }: { children: ReactNode; icon: ReactNode; onClick: () => void; primary?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-12 w-full items-center justify-center gap-2 border px-4 text-sm font-semibold transition ${primary ? "border-brand-gold bg-brand-gold text-brand-ink hover:bg-brand-gold-soft" : "border-brand-light/25 bg-transparent text-brand-light hover:border-brand-gold hover:text-brand-gold"}`}>{icon}{children}</button>;
}

function FieldControl({ field, value, onChange }: { field: Field; value: string; onChange: (value: string) => void }) {
  const common = `min-h-12 w-full border border-input bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15`;
  const wrap = field.full ? "sm:col-span-2" : "";
  const label = <span className="mb-2 block text-xs font-semibold leading-5 text-foreground">{field.label}{field.required && <span className="ml-1 text-brand-gold">*</span>}{field.hint && <span className="font-normal text-muted-foreground"> · {field.hint}</span>}</span>;
  if (field.type === "radio") return <fieldset className={wrap}><legend>{label}</legend><div className="flex flex-wrap gap-2">{field.options?.map((option) => <label key={option} className={`cursor-pointer border px-3 py-2 text-sm transition ${value === option ? "border-brand-gold bg-brand-mint text-brand-deep" : "border-input bg-background hover:border-brand-gold/60"}`}><input className="sr-only" type="radio" name={field.id} checked={value === option} onChange={() => onChange(option)} />{option}</label>)}</div></fieldset>;
  if (field.type === "checkboxes") {
    const selected = value ? value.split(" | ") : [];
    return <fieldset className={wrap}><legend>{label}</legend><div className="flex flex-wrap gap-2">{field.options?.map((option) => { const active = selected.includes(option); return <label key={option} className={`cursor-pointer border px-3 py-2 text-sm transition ${active ? "border-brand-gold bg-brand-mint text-brand-deep" : "border-input bg-background hover:border-brand-gold/60"}`}><input className="sr-only" type="checkbox" checked={active} onChange={() => onChange(active ? selected.filter((item) => item !== option).join(" | ") : [...selected, option].join(" | "))} />{active && <Check className="mr-1 inline size-3" />}{option}</label>; })}</div></fieldset>;
  }
  if (field.type === "select") return <label className={wrap}>{label}<select className={common} value={value} onChange={(e) => onChange(e.target.value)}><option value="">Escolher…</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select></label>;
  if (field.type === "textarea") return <label className={wrap}>{label}<textarea className={`${common} min-h-32 resize-y py-3`} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
  const placeholder = field.type === "cpf" ? "000.000.000-00" : field.type === "cnpj" ? "00.000.000/0000-00" : field.type === "phone" ? "(00) 00000-0000" : field.type === "cep" ? "00000-000" : field.type === "currency" ? "R$ 0,00" : undefined;
  return <label className={wrap}>{label}<input className={common} type={field.type === "date" ? "date" : field.id === "email" ? "email" : "text"} inputMode={["cpf", "cnpj", "phone", "cep", "currency"].includes(field.type ?? "") ? "numeric" : undefined} value={value} placeholder={placeholder} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} /></label>;
}