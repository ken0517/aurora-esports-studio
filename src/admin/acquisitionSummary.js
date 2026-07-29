export const acquisitionChannelLabels = Object.freeze({
  google: "Google",
  carousell: "Carousell",
  instagram: "Instagram",
  direct: "直接進入",
  other: "其他來源",
  unknown: "未記錄",
});

function roundPercent(value) {
  return Math.round(value * 100) / 100;
}

export function enquiryAcquisitionChannel(enquiry) {
  return enquiry?.acquisition?.firstTouch?.channel || "unknown";
}

export function summarizeAcquisition({ enquiries = [], orders = [] } = {}) {
  const orderEnquiryIds = new Set(orders.map((order) => order.enquiryId).filter(Boolean));
  const groups = new Map();
  for (const enquiry of enquiries) {
    const channel = enquiryAcquisitionChannel(enquiry);
    const group = groups.get(channel) || { channel, enquiries: 0, orders: 0 };
    group.enquiries += 1;
    if (orderEnquiryIds.has(enquiry.id)) group.orders += 1;
    groups.set(channel, group);
  }
  const convertedOrders = enquiries.reduce(
    (total, enquiry) => total + (orderEnquiryIds.has(enquiry.id) ? 1 : 0),
    0,
  );
  return {
    totalEnquiries: enquiries.length,
    convertedOrders,
    conversionRate: enquiries.length ? roundPercent((convertedOrders / enquiries.length) * 100) : 0,
    channels: [...groups.values()]
      .map((group) => ({
        ...group,
        conversionRate: group.enquiries ? roundPercent((group.orders / group.enquiries) * 100) : 0,
      }))
      .sort((left, right) => right.enquiries - left.enquiries || left.channel.localeCompare(right.channel)),
  };
}
