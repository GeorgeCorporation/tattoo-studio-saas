import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  createPayment,
  getAppointmentsForPayment,
  type FinancialAppointmentOption,
  type PaymentMethod,
  type PaymentType,
} from "@/services/financial.service";

type PaymentModalProps = {
  open: boolean;
  studioId: string;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

export function PaymentModal({ open, studioId, onClose, onCreated }: PaymentModalProps) {
  const [appointments, setAppointments] = useState<FinancialAppointmentOption[]>([]);
  const [appointmentId, setAppointmentId] = useState("");
  const [type, setType] = useState<PaymentType>("signal");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !studioId) return;

    async function loadAppointments() {
      try {
        const data = await getAppointmentsForPayment(studioId);
        setAppointments(data);
        setAppointmentId(data[0]?.id ?? "");
        setCreated(false);
        setError("");
      } catch {
        setError("Não foi possível carregar os agendamentos.");
      }
    }

    loadAppointments();
  }, [open, studioId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!appointmentId || !amount || !paidAt) {
      setError("Preencha agendamento, valor e data.");
      return;
    }

    try {
      setSaving(true);
      await createPayment({
        studioId,
        appointmentId,
        type,
        amount: Number(amount),
        method,
        paidAt: new Date(`${paidAt}T12:00:00`).toISOString(),
      });
      setCreated(true);

      try {
        await onCreated();
        onClose();
      } catch {
        setError(
          "O pagamento foi registrado, mas não foi possível atualizar o financeiro. Feche e tente atualizar novamente.",
        );
      }
    } catch {
      setError("Não foi possível registrar pagamento.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <section className="w-full max-w-xl rounded-xl border border-white/10 bg-[#1a1a1a] text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-xl font-semibold">Registrar pagamento</h2>
            <p className="mt-1 text-sm text-zinc-400">Vincule pagamento a um agendamento.</p>
          </div>
          <button className="rounded-lg p-2 hover:bg-white/5" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>

        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          <Select label="Agendamento" value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)}>
            {appointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {appointment.date} {appointment.time.slice(0, 5)} - {appointment.clients?.name ?? "Cliente"}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Tipo" value={type} onChange={(event) => setType(event.target.value as PaymentType)}>
              <option value="signal">Sinal</option>
              <option value="final">Pagamento final</option>
            </Select>

            <Select label="Metodo" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
              <option value="pix">PIX</option>
              <option value="cash">Dinheiro</option>
              <option value="card">Cartao</option>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Valor"
              min="0"
              prefix="R$"
              step="0.01"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />

            <Input
              label="Data do pagamento"
              type="date"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <Button disabled={saving || created} type="submit">
            {saving ? "Registrando..." : created ? "Pagamento registrado" : "Registrar pagamento"}
          </Button>
        </form>
      </section>
    </div>
  );
}
