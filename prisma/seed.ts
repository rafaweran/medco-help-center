import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "primeiros-passos" },
      update: {},
      create: {
        slug: "primeiros-passos",
        name: "Primeiros passos",
        description: "Tudo para começar a usar a plataforma Med.co",
        icon: "book",
        audience: "both",
        orderIndex: 0,
      },
    }),
    prisma.category.upsert({
      where: { slug: "teleorientacao" },
      update: {},
      create: {
        slug: "teleorientacao",
        name: "Teleorientação",
        description: "Dúvidas sobre consultas online e teleconsulta",
        icon: "stethoscope",
        audience: "both",
        orderIndex: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "telemonitoramento" },
      update: {},
      create: {
        slug: "telemonitoramento",
        name: "Telemonitoramento",
        description: "Acompanhamento de saúde à distância",
        icon: "stethoscope",
        audience: "both",
        orderIndex: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "conta-e-perfil" },
      update: {},
      create: {
        slug: "conta-e-perfil",
        name: "Conta e perfil",
        description: "Configurações da sua conta na Med.co",
        icon: "user",
        audience: "both",
        orderIndex: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "para-medicos" },
      update: {},
      create: {
        slug: "para-medicos",
        name: "Para médicos",
        description: "Recursos exclusivos para profissionais de saúde",
        icon: "stethoscope",
        audience: "doctor",
        orderIndex: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "para-pacientes" },
      update: {},
      create: {
        slug: "para-pacientes",
        name: "Para pacientes",
        description: "Tudo que você precisa saber como paciente",
        icon: "user",
        audience: "patient",
        orderIndex: 5,
      },
    }),
  ]);

  // Tags
  const tagData = [
    { slug: "teleconsulta", name: "Teleconsulta" },
    { slug: "video", name: "Vídeo" },
    { slug: "agendamento", name: "Agendamento" },
    { slug: "conta", name: "Conta" },
    { slug: "pagamento", name: "Pagamento" },
    { slug: "medico", name: "Médico" },
    { slug: "paciente", name: "Paciente" },
    { slug: "monitoramento", name: "Monitoramento" },
  ];

  const tags = await Promise.all(
    tagData.map((t: { slug: string; name: string }) =>
      prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t })
    )
  );

  const tagMap = Object.fromEntries(tags.map((t: { slug: string; id: string }) => [t.slug, t.id]));
  const catMap = Object.fromEntries(categories.map((c: { slug: string; id: string }) => [c.slug, c.id]));

  // Articles
  const articles = [
    {
      slug: "como-iniciar-teleconsulta",
      title: "Como iniciar uma teleconsulta na Med.co",
      summary: "Aprenda passo a passo como agendar e participar de uma teleconsulta pela plataforma Med.co.",
      content: `<h2>O que é a teleconsulta?</h2>
<p>A teleconsulta permite que você faça uma consulta médica de forma remota, por vídeo, sem precisar sair de casa. É rápida, segura e prática.</p>
<h2>Requisitos técnicos</h2>
<ul>
  <li>Conexão de internet estável (mínimo 2 Mbps)</li>
  <li>Câmera e microfone funcionando</li>
  <li>Navegador atualizado (Chrome, Firefox, Safari)</li>
</ul>`,
      steps: [
        { id: "s1", title: "Acesse sua conta", description: "Entre no app ou site da Med.co com seu email e senha" },
        { id: "s2", title: "Clique em 'Nova consulta'", description: "Encontre o botão na tela inicial ou no menu" },
        { id: "s3", title: "Escolha o médico", description: "Filtre por especialidade, data e horário disponível" },
        { id: "s4", title: "Confirme o agendamento", description: "Revise os dados e confirme. Você receberá um email de confirmação" },
        { id: "s5", title: "Entre na sala virtual", description: "No horário agendado, clique no link enviado por email ou acesse pelo app" },
      ],
      audience: "both" as const,
      status: "published" as const,
      isFeatured: true,
      isPinned: true,
      categoryId: catMap["teleorientacao"],
      tagIds: [tagMap["teleconsulta"], tagMap["video"], tagMap["agendamento"]],
      viewCount: 1240,
      helpfulYes: 89,
      helpfulNo: 7,
    },
    {
      slug: "criar-conta-medco",
      title: "Como criar sua conta na Med.co",
      summary: "Guia completo para criar sua conta e configurar seu perfil na Med.co, seja médico ou paciente.",
      content: `<h2>Criando sua conta</h2>
<p>Criar uma conta na Med.co é simples e leva menos de 2 minutos. Você pode se cadastrar como paciente ou como médico.</p>
<h2>Diferença entre os perfis</h2>
<p>O perfil de <strong>paciente</strong> permite agendar consultas, acompanhar histórico e receber monitoramento. O perfil de <strong>médico</strong> permite atender pacientes e gerenciar sua agenda.</p>`,
      steps: [
        { id: "s1", title: "Acesse med.co/cadastro", description: "Abra o link de cadastro no seu navegador" },
        { id: "s2", title: "Escolha seu perfil", description: "Selecione 'Sou paciente' ou 'Sou médico'" },
        { id: "s3", title: "Preencha seus dados", description: "Nome, email, CPF e senha. Médicos precisam informar o CRM." },
        { id: "s4", title: "Confirme seu email", description: "Clique no link enviado para o seu email" },
      ],
      audience: "both" as const,
      status: "published" as const,
      isFeatured: true,
      categoryId: catMap["primeiros-passos"],
      tagIds: [tagMap["conta"]],
      viewCount: 980,
      helpfulYes: 72,
      helpfulNo: 5,
    },
    {
      slug: "monitorar-pressao-arterial",
      title: "Como monitorar sua pressão arterial pelo app",
      summary: "Saiba como registrar e acompanhar suas medições de pressão arterial usando o telemonitoramento da Med.co.",
      content: `<h2>Por que monitorar a pressão?</h2>
<p>O acompanhamento regular da pressão arterial é fundamental para pacientes com hipertensão e para prevenção de doenças cardiovasculares.</p>
<p>Com a Med.co, você pode registrar suas medições e o médico acompanha em tempo real.</p>`,
      steps: [
        { id: "s1", title: "Abra a seção Monitoramento", description: "No menu inferior, toque em 'Saúde'" },
        { id: "s2", title: "Selecione 'Pressão arterial'", description: "Encontre na lista de indicadores" },
        { id: "s3", title: "Adicione nova medição", description: "Informe os valores sistólica e diastólica" },
        { id: "s4", title: "Salve o registro", description: "O médico responsável será notificado automaticamente" },
      ],
      audience: "patient" as const,
      status: "published" as const,
      isFeatured: false,
      categoryId: catMap["telemonitoramento"],
      tagIds: [tagMap["monitoramento"], tagMap["paciente"]],
      viewCount: 654,
      helpfulYes: 45,
      helpfulNo: 3,
    },
    {
      slug: "configurar-agenda-medico",
      title: "Como configurar sua agenda de atendimento",
      summary: "Passo a passo para médicos configurarem horários de atendimento, bloqueios e preferências de teleconsulta.",
      content: `<h2>Gerenciando sua agenda</h2>
<p>A agenda da Med.co permite configurar seus horários disponíveis, tempo de consulta, bloqueios e muito mais.</p>`,
      steps: [
        { id: "s1", title: "Acesse 'Minha Agenda'", description: "No painel médico, clique em Agenda" },
        { id: "s2", title: "Defina seus horários", description: "Configure os dias e horários disponíveis para consulta" },
        { id: "s3", title: "Tempo de consulta", description: "Configure a duração padrão (15, 30, 45 ou 60 min)" },
        { id: "s4", title: "Bloqueios", description: "Marque períodos em que não estará disponível" },
      ],
      audience: "doctor" as const,
      status: "published" as const,
      isFeatured: false,
      categoryId: catMap["para-medicos"],
      tagIds: [tagMap["agendamento"], tagMap["medico"]],
      viewCount: 420,
      helpfulYes: 38,
      helpfulNo: 2,
    },
    {
      slug: "recuperar-senha",
      title: "Como recuperar minha senha",
      summary: "Esqueceu sua senha? Veja como redefinir o acesso à sua conta Med.co de forma rápida e segura.",
      content: `<h2>Recuperação de senha</h2>
<p>Se você esqueceu sua senha, pode redefini-la em poucos passos. O processo é seguro e leva menos de 2 minutos.</p>`,
      steps: [
        { id: "s1", title: "Na tela de login, clique em 'Esqueci a senha'", description: "" },
        { id: "s2", title: "Informe seu email cadastrado", description: "Use o email com o qual criou sua conta" },
        { id: "s3", title: "Acesse seu email", description: "Clique no link de redefinição enviado pela Med.co" },
        { id: "s4", title: "Crie uma nova senha", description: "Mínimo 8 caracteres, com letras e números" },
      ],
      audience: "both" as const,
      status: "published" as const,
      isFeatured: false,
      categoryId: catMap["conta-e-perfil"],
      tagIds: [tagMap["conta"]],
      viewCount: 312,
      helpfulYes: 28,
      helpfulNo: 1,
    },
  ];

  for (const art of articles) {
    const { tagIds, ...data } = art;
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: { viewCount: art.viewCount, helpfulYes: art.helpfulYes, helpfulNo: art.helpfulNo },
      create: {
        ...data,
        publishedAt: art.status === "published" ? new Date() : null,
        steps: art.steps ? art.steps : undefined,
        tags: {
          create: tagIds.filter(Boolean).map((tagId) => ({ tagId })),
        },
      },
    });
  }

  // Sample search logs (no-result searches to show in dashboard)
  const noResultQueries = ["cancelar consulta", "reembolso", "plano de saúde", "receita médica"];
  for (const query of noResultQueries) {
    await prisma.searchLog.create({
      data: { query, resultsCount: 0, audience: "both" },
    });
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
