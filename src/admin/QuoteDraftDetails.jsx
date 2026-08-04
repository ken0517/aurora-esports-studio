import {
  getDevicePlatformLabel,
  getHeroPowerRegionLabel,
  getServerCountryLabel,
  getServerRegionLabel,
} from "../data/gameConfig.js";

const regionalFields = [
  {
    id: "serverCountryId",
    label: "所在國家／地區",
    getLabel: getServerCountryLabel,
  },
  {
    id: "serverRegionId",
    label: "遊戲地區／伺服器大區",
    getLabel: getServerRegionLabel,
  },
  {
    id: "devicePlatformId",
    label: "手機系統",
    getLabel: getDevicePlatformLabel,
  },
  {
    id: "heroPowerRegionId",
    label: "戰力地區",
    getLabel: getHeroPowerRegionLabel,
  },
];

export default function QuoteDraftDetails({ draft }) {
  if (!draft?.gameId) return null;

  const rows = regionalFields.flatMap((field) => {
    const valueId = draft[field.id];
    if (!valueId) return [];
    const label = field.getLabel(draft.gameId, valueId, "zh-HK");
    return [{ ...field, value: label || `未識別（${valueId}）` }];
  });

  if (!rows.length) return null;

  return (
    <dl className="admin-detail-meta admin-quote-draft-details" aria-label="報價資料">
      {rows.map((row) => (
        <div key={row.id}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
