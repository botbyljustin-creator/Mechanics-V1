"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

export function SopList({ sops, canEdit, onAdd, onEdit, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);

  function startAdd() {
    setDraft({ title: "", body: "" });
    setAdding(true);
    setEditingId(null);
  }
  function startEdit(sop) {
    setDraft({ title: sop.title, body: sop.body });
    setEditingId(sop.id);
    setAdding(false);
  }

  async function saveNew() {
    if (!draft.title.trim()) return;
    setBusy(true);
    try {
      await onAdd({ title: draft.title.trim(), body: draft.body.trim() });
      setAdding(false);
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    setBusy(true);
    try {
      await onEdit(editingId, { title: draft.title.trim(), body: draft.body.trim() });
      setEditingId(null);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    try {
      await onDelete(id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sop-list">
      {sops.length === 0 && !adding && <div className="sop-empty">No procedures documented yet.</div>}
      {sops.map((sop) =>
        editingId === sop.id ? (
          <div className="sop-card sop-form" key={sop.id}>
            <input
              className="sop-input-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Procedure title"
            />
            <textarea
              className="sop-input-body"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="Steps..."
              rows={3}
            />
            <div className="sop-form-actions">
              <button className="text-btn" onClick={saveEdit} disabled={busy}>
                Save
              </button>
              <button className="text-btn muted" onClick={() => setEditingId(null)} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="sop-card" key={sop.id}>
            <div className="sop-card-head">
              <span className="sop-title">{sop.title}</span>
              {canEdit && (
                <div className="sop-card-actions">
                  <button className="icon-btn" onClick={() => startEdit(sop)} aria-label="Edit">
                    <Pencil size={13} />
                  </button>
                  <button className="icon-btn" onClick={() => remove(sop.id)} aria-label="Delete" disabled={busy}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
            <p className="sop-body">{sop.body}</p>
          </div>
        )
      )}

      {canEdit &&
        (adding ? (
          <div className="sop-card sop-form">
            <input
              className="sop-input-title"
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Procedure title"
            />
            <textarea
              className="sop-input-body"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="Steps..."
              rows={3}
            />
            <div className="sop-form-actions">
              <button className="text-btn" onClick={saveNew} disabled={busy}>
                Add procedure
              </button>
              <button className="text-btn muted" onClick={() => setAdding(false)} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="add-sop-btn" onClick={startAdd}>
            <Plus size={14} strokeWidth={2} /> Add procedure
          </button>
        ))}
    </div>
  );
}
