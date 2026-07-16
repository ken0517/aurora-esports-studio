import { useState } from "react";
import { Save, UserPlus } from "lucide-react";

import {
  getCentralServiceLabel,
  getGameLabel,
  serviceDefinitions,
  supportedGameIds,
} from "../data/gameConfig.js";

const days = [
  ["monday", "星期一"], ["tuesday", "星期二"], ["wednesday", "星期三"],
  ["thursday", "星期四"], ["friday", "星期五"], ["saturday", "星期六"], ["sunday", "星期日"],
];

const emptyStaff = { displayName: "", active: true, gameIds: [], serviceIds: [], notes: "" };

export default function StaffRulesPanel({ state, onAction, busy }) {
  const [staffDraft, setStaffDraft] = useState(emptyStaff);
  const [rules, setRules] = useState(state.businessRules);
  const [closureText, setClosureText] = useState(state.businessRules.closureDates.join("\n"));

  const toggleList = (field, value) => setStaffDraft((current) => ({
    ...current,
    [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value],
  }));
  const editStaff = (staff) => setStaffDraft({ ...staff, notes: staff.notes || "" });
  const saveStaff = async () => {
    await onAction({ action: "upsert_staff", staff: staffDraft });
    setStaffDraft(emptyStaff);
  };
  const patchRules = (field, value) => setRules((current) => ({ ...current, [field]: value }));
  const patchHours = (day, field, value) => setRules((current) => ({
    ...current,
    weeklyHours: { ...current.weeklyHours, [day]: { ...current.weeklyHours[day], [field]: value } },
  }));
  const saveRules = () => onAction({
    action: "update_business_rules",
    businessRules: {
      ...rules,
      closureDates: closureText.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean),
      dailyCapacity: Number(rules.dailyCapacity),
      minimumLeadHours: Number(rules.minimumLeadHours),
      rescheduleNoticeHours: Number(rules.rescheduleNoticeHours),
      retentionDays: Number(rules.retentionDays),
    },
  });

  return (
    <div className="admin-staff-rules-grid">
      <section className="admin-settings-card">
        <header><div><span>TEAM</span><h2>服務人員</h2></div><UserPlus size={20} /></header>
        <div className="admin-staff-list">
          {state.staff.map((staff) => <button type="button" key={staff.id} onClick={() => editStaff(staff)}><strong>{staff.displayName}</strong><small>{staff.active ? "可接單" : "暫停接單"}</small></button>)}
        </div>
        <div className="admin-form-grid">
          <label className="admin-field-wide"><span>顯示名稱</span><input value={staffDraft.displayName} onChange={(event) => setStaffDraft({ ...staffDraft, displayName: event.target.value })} /></label>
          <label className="admin-inline-check"><input type="checkbox" checked={staffDraft.active} onChange={(event) => setStaffDraft({ ...staffDraft, active: event.target.checked })} />可接訂單</label>
          <fieldset className="admin-field-wide"><legend>可接遊戲</legend>{supportedGameIds.map((id) => <label className="admin-inline-check" key={id}><input type="checkbox" checked={staffDraft.gameIds.includes(id)} onChange={() => toggleList("gameIds", id)} />{getGameLabel(id, "zh-HK")}</label>)}</fieldset>
          <fieldset className="admin-field-wide"><legend>可接服務</legend>{serviceDefinitions.map((service) => <label className="admin-inline-check" key={service.id}><input type="checkbox" checked={staffDraft.serviceIds.includes(service.id)} onChange={() => toggleList("serviceIds", service.id)} />{getCentralServiceLabel(service.id, "zh-HK")}</label>)}</fieldset>
          <label className="admin-field-wide"><span>內部備註</span><textarea rows="2" value={staffDraft.notes} onChange={(event) => setStaffDraft({ ...staffDraft, notes: event.target.value })} /></label>
        </div>
        <button className="admin-action-button admin-action-button--primary" type="button" disabled={busy || !staffDraft.displayName.trim()} onClick={saveStaff}><Save size={16} /> 儲存服務人員</button>
      </section>

      <section className="admin-settings-card">
        <header><div><span>AVAILABILITY</span><h2>營業規則</h2></div></header>
        <h3>每週營業時間</h3>
        <div className="admin-hours-list">
          {days.map(([id, label]) => <div key={id}><label className="admin-inline-check"><input type="checkbox" checked={rules.weeklyHours[id].enabled} onChange={(event) => patchHours(id, "enabled", event.target.checked)} />{label}</label><input aria-label={`${label}開始`} type="time" value={rules.weeklyHours[id].start} onChange={(event) => patchHours(id, "start", event.target.value)} /><input aria-label={`${label}結束`} type="time" value={rules.weeklyHours[id].end} onChange={(event) => patchHours(id, "end", event.target.value)} /></div>)}
        </div>
        <div className="admin-form-grid">
          <label className="admin-field-wide"><span>休息日期（每行一個 YYYY-MM-DD）</span><textarea rows="3" value={closureText} onChange={(event) => setClosureText(event.target.value)} /></label>
          <label><span>每日接單上限</span><input type="number" min="1" max="100" value={rules.dailyCapacity} onChange={(event) => patchRules("dailyCapacity", event.target.value)} /></label>
          <label><span>最早預約時間（小時）</span><input type="number" min="0" value={rules.minimumLeadHours} onChange={(event) => patchRules("minimumLeadHours", event.target.value)} /></label>
          <label><span>免費改期通知（小時）</span><input type="number" min="0" value={rules.rescheduleNoticeHours} onChange={(event) => patchRules("rescheduleNoticeHours", event.target.value)} /></label>
          <label><span>對話保存日數</span><input type="number" min="7" max="365" value={rules.retentionDays} onChange={(event) => patchRules("retentionDays", event.target.value)} /></label>
        </div>
        <button className="admin-action-button admin-action-button--primary" type="button" disabled={busy} onClick={saveRules}><Save size={16} /> 儲存營業規則</button>
      </section>
    </div>
  );
}
