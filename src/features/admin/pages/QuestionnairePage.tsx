import { useState } from "react";

import { PageFrame } from "../components/PageFrame";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Panel, PanelHeader } from "../ui/Panel";
import { classNames } from "../utils/classNames";

const questionTypes = ["Text Input", "Photo Required", "Dropdown", "Checkboxes", "GPS Location", "Signature", "Number"];
const templates = ["Residence Verification", "Office Verification", "Stock Verification", "CPV", "Property Verification"];

interface QuestionItem {
  fieldType: string;
  label: string;
  required: boolean;
}

const initialQuestions: QuestionItem[] = [
  { fieldType: "Text Field", label: "Customer's full name as per Aadhaar", required: true },
  { fieldType: "Photo Field", label: "Photo of main entrance / shopfront", required: true },
  { fieldType: "Dropdown Field", label: "Type of residence", required: true },
  { fieldType: "Location Field", label: "GPS Location at premises", required: true },
  { fieldType: "Checkbox Field", label: "Verify the following documents", required: false },
  { fieldType: "Signature Field", label: "Customer signature / OTP consent", required: true },
];

function iconForType(fieldType: string) {
  if (fieldType.includes("Photo")) return "grid";
  if (fieldType.includes("Location")) return "map";
  if (fieldType.includes("Signature")) return "file";
  return "clipboard";
}

export function QuestionnairePage() {
  const [template, setTemplate] = useState("Residence Verification");
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);
  const [preview, setPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const addQuestion = (fieldType = "Text Input") => {
    setQuestions((current) => [...current, { fieldType: fieldType.replace("Input", "Field"), label: `New ${fieldType.toLowerCase()} question`, required: fieldType !== "Checkboxes" }]);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setDraft(questions[index].label);
  };

  const saveEdit = () => {
    if (editingIndex === null || !draft.trim()) return;
    setQuestions((current) => current.map((item, index) => (index === editingIndex ? { ...item, label: draft.trim() } : item)));
    setEditingIndex(null);
    setDraft("");
    showNotice("Question updated in the local template.");
  };

  return (
    <PageFrame
      actions={
        <>
          <AdminButton onClick={() => setPreview((current) => !current)}>{preview ? "Hide Preview" : "Preview"}</AdminButton>
          <AdminButton onClick={() => showNotice(`${template} template saved locally.`)} variant="primary">
            Save Template
          </AdminButton>
        </>
      }
      title="Questionnaire Builder"
      subtitle="Build dynamic investigation forms for field agents"
    >
      {notice ? <div className="mb-4 rounded-xl border border-[#cfe7d8] bg-[#f0fbf3] px-4 py-3 text-sm font-bold text-[#07883a]">{notice}</div> : null}
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <div className="admin-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
            {templates.map((item) => (
              <button
                key={item}
                onClick={() => setTemplate(item)}
                type="button"
                className={classNames("shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition", template === item ? "bg-[#1454c8] text-white" : "border border-[#d8e3f5] bg-white text-[#4b6384] hover:bg-[#f7faff]")}
              >
                {item}
              </button>
            ))}
          </div>
          <Panel>
            <PanelHeader title={template} subtitle={`${questions.length} questions configured`} />
            <div className="space-y-3 p-4">
              {questions.length ? (
                questions.map((question, index) => (
                  <article key={`${question.label}-${index}`} className="flex items-center gap-4 rounded-[14px] border border-[#dfe7f2] bg-white p-4">
                    <span className="text-[#c5d2e4]">
                      <Icon name="drag" className="h-5 w-5" />
                    </span>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf4ff] text-[#1454c8]">
                      <Icon name={iconForType(question.fieldType)} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingIndex === index ? (
                        <input value={draft} onChange={(event) => setDraft(event.target.value)} className="h-10 w-full rounded-xl border border-[#d8e3f5] px-3 text-sm font-semibold text-[#07183f]" autoFocus />
                      ) : (
                        <h3 className="truncate font-bold text-[#07183f]">{question.label}</h3>
                      )}
                      <p className="mt-1 text-sm text-[#62728b]">
                        {question.fieldType} - {question.required ? "Required" : "Optional"}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#4b6384]">Q{String(index + 1).padStart(2, "0")}</span>
                    {editingIndex === index ? (
                      <AdminButton onClick={saveEdit} size="sm" variant="primary">
                        Save
                      </AdminButton>
                    ) : (
                      <button type="button" title="Edit question" onClick={() => startEdit(index)} className="text-[#5c6a85]">
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => setQuestions((current) => current.filter((_, qIndex) => qIndex !== index))} type="button" title="Delete question" className="text-[#d92525]">
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </article>
                ))
              ) : (
                <EmptyState title="No questions in this template" subtitle="Use the question type palette to add fields back into the template." />
              )}
            </div>
          </Panel>
          <button onClick={() => addQuestion()} type="button" className="mt-4 h-12 w-full rounded-[14px] border-2 border-dashed border-[#cbdaf4] text-sm font-bold text-[#5c6a85]">
            + Add Question
          </button>
        </section>
        <aside className="space-y-4">
          {preview ? (
            <Panel>
              <PanelHeader title="Preview" subtitle="Field agent form view" />
              <div className="space-y-3 p-4">
                {questions.map((question, index) => (
                  <label key={`${question.label}-preview`} className="block">
                    <span className="text-xs font-bold text-[#62728b]">
                      {index + 1}. {question.label}
                    </span>
                    <div className="mt-2 h-10 rounded-xl border border-[#d8e3f5] bg-[#f8fafd]" />
                  </label>
                ))}
              </div>
            </Panel>
          ) : null}
          <Panel>
            <PanelHeader title="Question Types" subtitle="Add fields to the selected template" />
            <div className="space-y-2 p-4">
              {questionTypes.map((item) => (
                <button key={item} onClick={() => addQuestion(item)} type="button" className="flex h-14 w-full items-center gap-3 rounded-xl border border-[#dfe7f2] bg-white px-4 text-sm font-bold text-[#07183f] transition hover:bg-[#f8fafd]">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf4ff] text-[#1454c8]">
                    <Icon name="plus" className="h-4 w-4" />
                  </span>
                  {item}
                </button>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </PageFrame>
  );
}
