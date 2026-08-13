import { useState } from "react";

import { PageFrame } from "../components/PageFrame";
import { initialRoles } from "../data/adminData";
import type { RoleRecord } from "../types/admin";
import { AdminButton } from "../ui/AdminButton";
import { Icon } from "../ui/Icon";
import { Panel, PanelHeader } from "../ui/Panel";

export function RolesPage() {
  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const addRole = () => {
    setRoles((current) => [...current, { name: "Credit Reviewer", users: "0 users", permissions: ["Review Queue", "Decision Notes"] }]);
    showNotice("Role added locally for demo review.");
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setDraftName(roles[index].name);
  };

  const saveEdit = () => {
    if (editingIndex === null || !draftName.trim()) return;
    setRoles((current) => current.map((role, index) => (index === editingIndex ? { ...role, name: draftName.trim() } : role)));
    setEditingIndex(null);
    setDraftName("");
    showNotice("Role updated locally.");
  };

  return (
    <PageFrame
      actions={
        <AdminButton onClick={addRole} variant="primary">
          + Add Role
        </AdminButton>
      }
      title="Roles & Permissions"
      subtitle="Role-based access for admin and field operations"
    >
      {notice ? <div className="mb-4 rounded-xl border border-[#cfe7d8] bg-[#f0fbf3] px-4 py-3 text-sm font-bold text-[#07883a]">{notice}</div> : null}
      <Panel>
        <PanelHeader title="Access Roles" subtitle={`${roles.length} roles configured`} />
        <div className="space-y-3 p-4">
          {roles.map((role, index) => (
            <article key={`${role.name}-${index}`} className="flex flex-col gap-4 rounded-[14px] border border-[#dfe7f2] bg-white p-5 shadow-[0_1px_2px_rgba(7,24,63,0.04)] xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#edf4ff] text-[#1454c8]">
                  <Icon name="shield" />
                </div>
                <div className="min-w-0">
                  {editingIndex === index ? (
                    <input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="h-10 w-full rounded-xl border border-[#d8e3f5] px-3 text-sm font-bold text-[#07183f]" autoFocus />
                  ) : (
                    <h3 className="font-bold text-[#07183f]">{role.name}</h3>
                  )}
                  <p className="mt-1 text-sm text-[#62728b]">{role.users}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <span key={permission} className="rounded-full bg-[#edf4ff] px-3 py-1 text-sm font-bold text-[#1454c8]">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 xl:justify-end">
                {editingIndex === index ? (
                  <AdminButton onClick={saveEdit} size="sm" variant="primary">
                    Save
                  </AdminButton>
                ) : (
                  <button type="button" title="Edit role" onClick={() => startEdit(index)} className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf2f7] text-[#5c6a85]">
                    <Icon name="edit" className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setRoles((current) => current.filter((_, roleIndex) => roleIndex !== index))} type="button" title="Delete role" className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0ef] text-[#d92525]">
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </PageFrame>
  );
}
