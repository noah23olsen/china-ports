export const processPortData = (data) => {
  return data.map((row) => ({
    name: row["Country Name"],
    code: row["Country Code"],
    debtToChina: parseFloat(row["Debt to China"]) || 0,
    totalDebt: parseFloat(row["Total debt"]) || 0,
    gni: parseFloat(row["GNI"]) || 0,
    debtToChinaShare: parseFloat(row["Debt to China as share of GNI"]) || 0,
    debtToChinaTotalShare:
      parseFloat(row["Debt to China as share of total debt"]) || 0,
    // We'll need to add coordinates for each country
    // This will be added later when we have the port locations
    coordinates: null,
  }));
};

export const calculateMarkerSize = (debt) => {
  // Scale the marker size based on debt amount
  const minSize = 0.5;
  const maxSize = 5;
  const scale = 0.0000001; // Adjust this value to get desired size range
  return Math.max(minSize, Math.min(maxSize, debt * scale));
};

export const calculateMarkerColor = (debtShare) => {
  // Color scale from green (low debt) to red (high debt)
  const hue = 120 - debtShare * 1.2; // 120 is green, 0 is red
  return `hsl(${hue}, 100%, 50%)`;
};
