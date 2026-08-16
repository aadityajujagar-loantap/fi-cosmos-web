import type { AssignedQuestion, QuestionnaireAnswers, QuestionnaireAnswerValue } from "../../../domain/types";

interface AssignedQuestionnaireProps {
  answers: QuestionnaireAnswers;
  onChange: (questionId: string, value: QuestionnaireAnswerValue) => void;
  questions: AssignedQuestion[];
}

function fieldClass() {
  return "mt-1.5 w-full rounded-lg border border-[#d8e3f5] bg-white px-3 text-xs font-semibold text-[#07183f] outline-none focus:border-[#1158d4]";
}

export function AssignedQuestionnaire({ answers, onChange, questions }: AssignedQuestionnaireProps) {
  if (!questions.length) {
    return <p className="rounded-lg border border-[#ffd9d6] bg-[#fff5f5] p-3 text-xs font-bold text-[#d92525]">No product questionnaire is assigned to this task.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((question, index) => {
        const answer = answers[question.id];
        const stringValue = typeof answer === "string" ? answer : "";
        const selectedValues = Array.isArray(answer) ? answer : [];
        return (
          <fieldset key={question.id} className="m-0 border-0 p-0">
            <legend className="text-[10px] font-bold leading-snug text-[#4b6384]">
              {index + 1}. {question.prompt}{question.required ? <span className="ml-1 text-[#d92525]">*</span> : null}
            </legend>

            {question.responseType === "TEXT" ? <input value={stringValue} onChange={(event) => onChange(question.id, event.target.value)} className={`${fieldClass()} h-9`} type="text" /> : null}
            {question.responseType === "TEXTAREA" ? <textarea value={stringValue} onChange={(event) => onChange(question.id, event.target.value)} className={`${fieldClass()} min-h-20 resize-y py-2`} /> : null}
            {question.responseType === "NUMBER" ? <input value={stringValue} onChange={(event) => onChange(question.id, event.target.value)} className={`${fieldClass()} h-9`} inputMode="decimal" type="number" /> : null}
            {question.responseType === "DATE" ? <input value={stringValue} onChange={(event) => onChange(question.id, event.target.value)} className={`${fieldClass()} h-9`} type="date" /> : null}
            {question.responseType === "SELECT" ? (
              <select value={stringValue} onChange={(event) => onChange(question.id, event.target.value)} className={`${fieldClass()} h-9`}>
                <option value="">Select an answer</option>
                {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : null}
            {question.responseType === "YES_NO" ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {question.options.map((option) => <button key={option} onClick={() => onChange(question.id, option)} type="button" className={`h-9 rounded-lg border text-xs font-bold ${stringValue === option ? "border-[#1158d4] bg-[#edf5ff] text-[#1158d4]" : "border-[#d8e3f5] bg-white text-[#62728b]"}`}>{option}</button>)}
              </div>
            ) : null}
            {question.responseType === "MULTI_SELECT" ? (
              <div className="mt-2 grid gap-2">
                {question.options.map((option) => {
                  const checked = selectedValues.includes(option);
                  return <label key={option} className="flex items-center gap-2 rounded-lg border border-[#d8e3f5] bg-white px-3 py-2 text-xs font-semibold text-[#07183f]"><input checked={checked} onChange={() => onChange(question.id, checked ? selectedValues.filter((value) => value !== option) : [...selectedValues, option])} type="checkbox" className="h-4 w-4 accent-[#1158d4]" />{option}</label>;
                })}
              </div>
            ) : null}
          </fieldset>
        );
      })}
    </div>
  );
}
