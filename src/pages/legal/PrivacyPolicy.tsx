import { Link } from "react-router-dom";

export function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
        <Link className="text-sm font-semibold text-[#E8650A]" to="/">
          Voltar
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">Política de Privacidade</h1>
        <p className="mt-4 text-zinc-300">
          Esta página informa, de forma inicial, quais dados a Inkora coleta para operar agenda, página pública,
          cadastro de clientes, entregas de fotos e gestão do estúdio.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Dados coletados</h2>
        <p className="mt-3 text-zinc-300">
          Podemos armazenar nome, WhatsApp, email, Instagram, descrição da tatuagem, fotos de referência, dados do
          estúdio, dados dos tatuadores e registros de atendimento.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Uso dos dados</h2>
        <p className="mt-3 text-zinc-300">
          Os dados são usados para criar agendamentos, organizar histórico de clientes, exibir páginas públicas do
          estúdio e permitir que o gestor acompanhe os atendimentos.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Solicitação de exclusão</h2>
        <p className="mt-3 text-zinc-300">
          Clientes podem solicitar remoção dos dados diretamente ao estúdio responsável. O gestor deve excluir ou
          anonimizar os registros no painel quando a solicitação for confirmada.
        </p>
        <p className="mt-8 text-sm text-zinc-500">
          Texto provisório. Antes de uso comercial amplo, revisar com profissional jurídico.
        </p>
      </section>
    </main>
  );
}
