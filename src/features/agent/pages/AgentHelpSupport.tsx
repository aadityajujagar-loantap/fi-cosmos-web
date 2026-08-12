import { useMemo, useState } from "react";

interface AgentHelpSupportProps {
  onBack: () => void;
}

interface FaqItem {
  answer: string;
  question: string;
}

const faqs: FaqItem[] = [
  {
    question: "How do I start a field task?",
    answer: "Open My Tasks, tap the assigned task, review the customer details, then press Start Task.",
  },
  {
    question: "What should I do if documents fail to upload?",
    answer: "Save the task offline, check network status, then use Offline Data to sync once connectivity returns.",
  },
  {
    question: "How do I sync offline task data?",
    answer: "Go to Profile > Offline Data and tap Sync Pending Data. The queue keeps your latest captured files.",
  },
  {
    question: "How can I change my work availability?",
    answer: "Open Profile > Work Settings and update your availability, preferred radius and reminder settings.",
  },
];

function SupportCard({
  active,
  title,
  subtitle,
  icon,
  onClick,
  tone,
}: {
  active: boolean;
  icon: string;
  onClick: () => void;
  subtitle: string;
  title: string;
  tone: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`flex min-h-[92px] flex-col items-start justify-between rounded-2xl border p-3 text-left transition ${tone} ${active ? "ring-2 ring-[#1158d4]/20" : ""}`}
    >
      <span className="text-2xl font-bold leading-none">{icon}</span>
      <span>
        <span className="block text-xs font-bold leading-none text-[#07183f]">{title}</span>
        <span className="mt-1 block text-[10px] font-medium leading-tight text-[#5c6a85]">{subtitle}</span>
      </span>
    </button>
  );
}

export function AgentHelpSupport({ onBack }: AgentHelpSupportProps) {
  const [query, setQuery] = useState("");
  const [activeAction, setActiveAction] = useState("FAQs");
  const [expandedFaq, setExpandedFaq] = useState(faqs[0].question);
  const [ticketMessage, setTicketMessage] = useState("Unable to upload address proof for Field Investigation.");
  const [supportStatus, setSupportStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return faqs;
    return faqs.filter((faq) => `${faq.question} ${faq.answer}`.toLowerCase().includes(normalized));
  }, [query]);

  const createTicket = () => {
    if (!ticketMessage.trim()) {
      setSupportStatus("Describe the issue before creating a ticket.");
      return;
    }
    setIsSubmitting(true);
    setSupportStatus("");
    window.setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = `SUP-${Date.now().toString().slice(-5)}`;
      localStorage.setItem("agent-last-support-ticket", JSON.stringify({ ticketId, ticketMessage, createdAt: new Date().toISOString() }));
      setSupportStatus(`${ticketId} created. Support will respond in the app.`);
    }, 1000);
  };

  return (
    <section className="relative flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-white text-[#07183f] animate-slide-up">
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-5 pb-5 pt-4">
        <header className="relative flex h-12 flex-none items-center justify-center">
          <button onClick={onBack} type="button" aria-label="Back" className="absolute left-0 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#07183f] hover:bg-slate-50">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
              <path d="M15 5 8 12l7 7M9 12h11" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Help & Support</h1>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <section className="mt-3 rounded-[18px] border border-[#d3e5fe] bg-gradient-to-r from-[#f5f9ff] to-[#edf5ff] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#1158d4]">Support center</p>
            <h2 className="mt-1 text-xl font-bold leading-tight">Get help with tasks, uploads, sync and app settings.</h2>
            <label className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-[#d8e6ff] bg-white px-3">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1158d4]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search help topics" className="min-w-0 flex-1 border-0 text-xs font-bold text-[#07183f] outline-none placeholder:text-[#9aa4b5]" />
            </label>
          </section>

          <section className="mt-4 grid grid-cols-2 gap-3">
            <SupportCard active={activeAction === "FAQs"} icon="?" onClick={() => setActiveAction("FAQs")} title="FAQs" subtitle="Task and app answers" tone="border-[#d8e6ff] bg-[#f4f8ff]" />
            <SupportCard active={activeAction === "Urgent Help"} icon="!" onClick={() => setActiveAction("Urgent Help")} title="Urgent Help" subtitle="Escalate field blockers" tone="border-[#ffd9d6] bg-[#fff5f5]" />
            <SupportCard active={activeAction === "Create Ticket"} icon="+" onClick={() => setActiveAction("Create Ticket")} title="Create Ticket" subtitle="Report a technical issue" tone="border-[#d4f3dd] bg-[#f5fdf7]" />
            <SupportCard active={activeAction === "Tutorials"} icon="i" onClick={() => setActiveAction("Tutorials")} title="Tutorials" subtitle="Learn standard workflows" tone="border-[#fdecd5] bg-[#fffbf5]" />
          </section>

          {activeAction === "Urgent Help" ? (
            <section className="mt-4 rounded-[18px] border border-[#ffd9d6] bg-[#fff5f5] p-4">
              <h2 className="text-sm font-bold text-[#ee0f1a]">Urgent escalation ready</h2>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#5c6a85]">Use this when a customer visit is blocked, safety is affected, or upload failure prevents task completion.</p>
              <button onClick={() => setSupportStatus("Priority escalation prepared for Field Support.")} type="button" className="mt-3 h-10 w-full rounded-xl bg-[#ee0f1a] text-xs font-bold text-white">
                Prepare Escalation
              </button>
            </section>
          ) : null}

          {activeAction === "Tutorials" ? (
            <section className="mt-4 rounded-[18px] border border-[#fdecd5] bg-[#fffbf5] p-4">
              <h2 className="text-sm font-bold">Quick tutorials</h2>
              <div className="mt-3 grid gap-2">
                {["Starting a task", "Uploading documents", "Using offline mode"].map((title) => (
                  <button key={title} onClick={() => setSupportStatus(`${title} tutorial opened.`)} type="button" className="h-10 rounded-xl bg-white px-3 text-left text-xs font-bold text-[#07183f]">
                    {title}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-4 overflow-hidden rounded-[18px] border border-[#edf1f5] bg-white shadow-sm">
            <h2 className="border-b border-[#edf1f5] px-4 py-3 text-sm font-bold">Popular Questions</h2>
            {filteredFaqs.map((faq) => (
              <button key={faq.question} onClick={() => setExpandedFaq(expandedFaq === faq.question ? "" : faq.question)} type="button" className="w-full border-b border-[#edf1f5] px-4 py-3 text-left last:border-b-0">
                <span className="flex items-center justify-between gap-3 text-xs font-bold text-[#07183f]">
                  {faq.question}
                  <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-slate-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden="true">
                    <path d={expandedFaq === faq.question ? "m18 15-6-6-6 6" : "m9 5 7 7-7 7"} />
                  </svg>
                </span>
                {expandedFaq === faq.question ? <span className="mt-2 block text-[10px] font-medium leading-relaxed text-[#5c6a85]">{faq.answer}</span> : null}
              </button>
            ))}
          </section>

          <section className="mt-4 rounded-[18px] border border-[#edf1f5] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold">Contact Support</h2>
            <textarea
              onChange={(event) => setTicketMessage(event.target.value)}
              value={ticketMessage}
              className="mt-3 min-h-[82px] w-full resize-none rounded-xl border border-[#d8e0eb] p-3 text-xs font-medium text-[#07183f] outline-none focus:border-[#1158d4]"
            />
            <div className="mt-3 grid gap-2.5">
              <button onClick={() => setSupportStatus("Calling field support: +91 1800 102 4242")} type="button" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1158d4] text-xs font-bold text-white">
                Call field support
              </button>
              <button
                onClick={createTicket}
                disabled={isSubmitting}
                type="button"
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#1158d4] bg-white text-xs font-bold text-[#1158d4] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#1158d4]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting ticket...</span>
                  </>
                ) : (
                  "Create support ticket"
                )}
              </button>
            </div>
            {supportStatus ? <p className="mt-3 rounded-xl bg-[#f4f8ff] px-3 py-2 text-[10px] font-bold leading-relaxed text-[#1158d4]">{supportStatus}</p> : null}
            <p className="mt-3 text-[10px] font-medium leading-relaxed text-[#5c6a85]">
              Support hours: 8:00 AM to 9:00 PM. Critical task escalations are prioritized.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
