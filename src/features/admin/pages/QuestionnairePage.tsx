import { useMemo, useState } from "react";

import { useAppData } from "../../../data/dataContext";
import { productService } from "../../../data/services";
import type { ProductQuestion, QuestionResponseType } from "../../../domain/types";
import { PageFrame } from "../components/PageFrame";
import { AdminButton } from "../ui/AdminButton";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Panel } from "../ui/Panel";

const questionTypes: Array<{ value: QuestionResponseType; label: string }> = [
  { value: "TEXT", label: "Short text" },
  { value: "TEXTAREA", label: "Long text" },
  { value: "YES_NO", label: "Yes / No" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
  { value: "SELECT", label: "Single select" },
  { value: "MULTI_SELECT", label: "Multi select" },
];

const choiceTypes = new Set<QuestionResponseType>(["YES_NO", "SELECT", "MULTI_SELECT"]);

function productCode(name: string) {
  return name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 30);
}

function newQuestion(sortOrder: number): ProductQuestion {
  return {
    id: crypto.randomUUID(), loanProductId: "", prompt: "", responseType: "TEXT", options: [],
    required: true, sortOrder, active: true,
  };
}

export function QuestionnairePage() {
  const { state, adminActor } = useAppData();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<{ productId: string; name: string; questions: ProductQuestion[] } | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const orderedProducts = useMemo(
    () => [...state.loanProducts].sort((left, right) => Number(right.active) - Number(left.active) || left.name.localeCompare(right.name)),
    [state.loanProducts],
  );
  const selectedProduct = state.loanProducts.find((product) => product.id === selectedId) ?? orderedProducts[0] ?? null;
  const selectedDraft = selectedProduct && draft?.productId === selectedProduct.id ? draft : null;
  const questions = selectedDraft?.questions ?? selectedProduct?.questions ?? [];
  const productName = selectedDraft?.name ?? selectedProduct?.name ?? "";

  const changeQuestions = (update: (current: ProductQuestion[]) => ProductQuestion[]) => {
    if (!selectedProduct) return;
    setDraft((current) => {
      const base = current?.productId === selectedProduct.id
        ? current
        : { productId: selectedProduct.id, name: selectedProduct.name, questions: selectedProduct.questions.map((question) => ({ ...question, options: [...question.options] })) };
      return { ...base, questions: update(base.questions) };
    });
  };

  const changeProductName = (name: string) => {
    if (!selectedProduct) return;
    setDraft((current) => ({
      productId: selectedProduct.id,
      name,
      questions: current?.productId === selectedProduct.id ? current.questions : selectedProduct.questions.map((question) => ({ ...question, options: [...question.options] })),
    }));
  };

  const selectProduct = (productId: string) => {
    setSelectedId(productId);
    setDraft(null);
    setError("");
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const updateQuestion = (id: string, patch: Partial<ProductQuestion>) => {
    changeQuestions((current) => current.map((question) => question.id === id ? { ...question, ...patch } : question));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    changeQuestions((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((question, sortOrder) => ({ ...question, sortOrder }));
    });
  };

  const saveProduct = async () => {
    if (!selectedProduct || saving) return;
    const normalized = questions.map((question, sortOrder) => ({
      ...question,
      prompt: question.prompt.trim(),
      options: choiceTypes.has(question.responseType)
        ? (question.responseType === "YES_NO" && question.options.length < 2 ? ["Yes", "No"] : question.options.map((option) => option.trim()).filter(Boolean))
        : [],
      sortOrder,
    }));
    if (!productName.trim()) { setError("Product name is required."); return; }
    if (!normalized.length) { setError("Add at least one question."); return; }
    const invalid = normalized.find((question) => question.prompt.length < 3 || (choiceTypes.has(question.responseType) && question.options.length < 2));
    if (invalid) { setError("Every question needs a prompt, and choice questions need at least two options."); return; }

    setSaving(true);
    try {
      if (productName.trim() !== selectedProduct.name) {
        await productService.update(adminActor, selectedProduct.id, { name: productName.trim() });
      }
      await productService.replaceQuestions(adminActor, selectedProduct.id, normalized);
      setDraft(null);
      setError("");
      showNotice(`${productName.trim()} questionnaire saved to Supabase.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Questionnaire could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const createProduct = async () => {
    const name = newProductName.trim();
    const code = productCode(name);
    if (!name || code.length < 2) { setError("Enter a valid product name."); return; }
    setCreating(true);
    try {
      const id = await productService.create(adminActor, { code, name });
      setNewProductName("");
      setSelectedId(id);
      setDraft({ productId: id, name, questions: [newQuestion(0)] });
      setError("");
      showNotice(`${name} created. Add and save its questions.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Loan product could not be created.");
    } finally {
      setCreating(false);
    }
  };

  const toggleProduct = async () => {
    if (!selectedProduct) return;
    try {
      await productService.update(adminActor, selectedProduct.id, { active: !selectedProduct.active });
      setError("");
      showNotice(`${selectedProduct.name} ${selectedProduct.active ? "deactivated" : "activated"}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Product status could not be updated.");
    }
  };

  return (
    <PageFrame
      actions={selectedProduct ? <><AdminButton onClick={toggleProduct}>{selectedProduct.active ? "Deactivate" : "Activate"}</AdminButton><AdminButton disabled={saving} onClick={saveProduct} variant="primary">{saving ? "Saving..." : "Save Questionnaire"}</AdminButton></> : undefined}
      title="Product Questionnaires"
      subtitle="Configure the exact field questionnaire assigned with each loan product"
    >
      {notice ? <div className="mb-4 border border-[#cfe7d8] bg-[#f0fbf3] px-4 py-3 text-sm font-bold text-[#07883a]">{notice}</div> : null}
      {error ? <div className="mb-4 border border-[#ffd9d6] bg-[#fff5f5] px-4 py-3 text-sm font-bold text-[#d92525]">{error}</div> : null}

      <div className="grid min-h-[620px] grid-cols-1 border border-[#dfe7f2] bg-white lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-[#dfe7f2] bg-[#f8fafd] lg:border-b-0 lg:border-r">
          <div className="border-b border-[#dfe7f2] p-4">
            <p className="text-xs font-bold uppercase text-[#62728b]">Loan products</p>
            <div className="mt-3 flex gap-2">
              <input value={newProductName} onChange={(event) => setNewProductName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void createProduct(); }} placeholder="New product" className="h-10 min-w-0 flex-1 border border-[#d8e3f5] bg-white px-3 text-sm font-semibold" />
              <button disabled={creating} onClick={() => void createProduct()} type="button" title="Add loan product" className="grid h-10 w-10 place-items-center bg-[#1454c8] text-white disabled:opacity-50"><Icon name="plus" className="h-4 w-4" /></button>
            </div>
          </div>
          <nav className="admin-scrollbar max-h-[560px] overflow-y-auto p-3">
            {orderedProducts.map((product) => (
              <button key={product.id} onClick={() => selectProduct(product.id)} type="button" className={`mb-2 flex w-full items-center justify-between border px-3 py-3 text-left ${selectedProduct?.id === product.id ? "border-[#1454c8] bg-white" : "border-transparent hover:bg-white"}`}>
                <span className="min-w-0"><span className="block truncate text-sm font-bold text-[#07183f]">{product.name}</span><span className="mt-1 block text-xs text-[#7b8faa]">{product.questions.length} questions - v{product.version}</span></span>
                <span className={`h-2.5 w-2.5 flex-none rounded-full ${product.active ? "bg-[#07883a]" : "bg-[#a5afbf]"}`} />
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          {selectedProduct ? (
            <>
              <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dfe7f2] p-5">
                <label className="min-w-[240px] flex-1"><span className="text-xs font-bold uppercase text-[#62728b]">Product name</span><input value={productName} onChange={(event) => changeProductName(event.target.value)} className="mt-2 h-11 w-full border border-[#d8e3f5] px-3 text-base font-bold text-[#07183f]" /></label>
                <div className="text-right"><p className="text-xs font-bold text-[#62728b]">Assignment snapshot</p><p className="mt-1 text-sm font-semibold text-[#07183f]">{questions.length} configured questions</p></div>
              </header>
              <div className="space-y-3 p-5">
                {questions.map((question, index) => (
                  <article key={question.id} className="border border-[#dfe7f2] bg-white p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-8 w-8 flex-none place-items-center bg-[#edf4ff] text-xs font-bold text-[#1454c8]">{index + 1}</span>
                      <div className="grid min-w-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_180px]">
                        <input value={question.prompt} onChange={(event) => updateQuestion(question.id, { prompt: event.target.value })} placeholder="Question shown to the agent" className="h-10 min-w-0 border border-[#d8e3f5] px-3 text-sm font-semibold text-[#07183f]" />
                        <select value={question.responseType} onChange={(event) => { const responseType = event.target.value as QuestionResponseType; updateQuestion(question.id, { responseType, options: responseType === "YES_NO" ? ["Yes", "No"] : choiceTypes.has(responseType) ? question.options : [] }); }} className="h-10 border border-[#d8e3f5] px-3 text-sm font-bold text-[#07183f]">{questionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
                        {choiceTypes.has(question.responseType) ? <input value={question.options.join(", ")} onChange={(event) => updateQuestion(question.id, { options: event.target.value.split(",") })} placeholder="Options separated by commas" className="h-10 min-w-0 border border-[#d8e3f5] px-3 text-sm text-[#07183f] xl:col-span-2" /> : null}
                      </div>
                      <div className="flex flex-none items-center gap-1">
                        <button onClick={() => moveQuestion(index, -1)} disabled={index === 0} type="button" title="Move question up" className="grid h-8 w-8 place-items-center text-[#4b6384] disabled:opacity-25"><span aria-hidden="true">&uarr;</span></button>
                        <button onClick={() => moveQuestion(index, 1)} disabled={index === questions.length - 1} type="button" title="Move question down" className="grid h-8 w-8 place-items-center text-[#4b6384] disabled:opacity-25"><span aria-hidden="true">&darr;</span></button>
                        <button onClick={() => changeQuestions((current) => current.filter((item) => item.id !== question.id))} type="button" title="Remove question" className="grid h-8 w-8 place-items-center text-[#d92525]"><Icon name="trash" className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <label className="mt-3 flex w-max items-center gap-2 text-xs font-bold text-[#4b6384]"><input checked={question.required} onChange={(event) => updateQuestion(question.id, { required: event.target.checked })} type="checkbox" className="h-4 w-4 accent-[#1454c8]" />Required answer</label>
                  </article>
                ))}
                {!questions.length ? <EmptyState title="No questions configured" subtitle="Add the first question before this product can be assigned." /> : null}
                <button onClick={() => changeQuestions((current) => [...current, newQuestion(current.length)])} type="button" className="flex h-12 w-full items-center justify-center gap-2 border-2 border-dashed border-[#cbdaf4] text-sm font-bold text-[#1454c8]"><Icon name="plus" className="h-4 w-4" />Add Question</button>
              </div>
            </>
          ) : <div className="p-8"><EmptyState title="Create a loan product" subtitle="Products define which questions are assigned to field agents." /></div>}
        </main>
      </div>
      <Panel className="mt-4 p-4"><p className="text-sm font-bold text-[#07183f]">Assignment behavior</p><p className="mt-1 text-sm text-[#62728b]">The latest active questions are copied to the case on its first assignment. Later template edits do not change questionnaires already assigned to agents.</p></Panel>
    </PageFrame>
  );
}
