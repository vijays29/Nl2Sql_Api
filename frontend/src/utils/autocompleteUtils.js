export const getAutocompleteSuggestions = () => {
  const rawRecommendationData = [
    "LEAF_AND_SPINE_C93180YC_REPRT:ID VARCHAR NOT NULL ENABLE,HOST_NAME VARCHAR,DVCIP VARCHAR,LOC_CODE VARCHAR,RTR_MODEL VARCHAR,DVC_TYPE VARCHAR,TOTA_L100G_PRTS VARCHAR,USE_D100G_PRTS VARCHAR,FRE_E100G_PRTS VARCHAR,TOTA_L10G_PRTS VARCHAR,USE_D10G_PRTS VARCHAR,FRE_E10G_PRTS VARCHAR,TOTA_L1G_PRTS VARCHAR,USE_D1G_PRTS VARCHAR,FRE_E1G_PRTS VARCHAR,PRIMARY KEY (ID)",
    "CARD_SLOT_HIERARCHY_REPRT:ID VARCHAR NOT NULL ENABLE,MODEL VARCHAR2,SERIAL_NUM VARCHAR,FIRMWARE_REV VARCHAR,MANUFACTURER VARCHAR,DESC VARCHAR,CITY VARCHAR,STATE VARCHAR,SW_REV VARCHAR,HARDWARE_REV VARCHAR,REGION VARCHAR,HOST_NAME VARCHAR,DVC_ROLE VARCHAR,SLOT_HIERARCHY_DETS VARCHAR,ISSFP VARCHAR,DOM VARCHAR,MODEL_NAME VARCHAR,DVCID VARCHAR,PRIMARY KEY (ID)",
    "LEAF_SPIN_E100G_UTIL_REPRT:ID VARCHAR NOT NULL ENABLE,HOST_NAME VARCHAR,DVCIP VARCHAR,LOC_CODE VARCHAR,RTR_MODEL VARCHAR,DVC_TYPE VARCHAR,TOTA_L100G_PRTS VARCHAR,USE_D100G_PRTS VARCHAR,FRE_E100G_PRTS VARCHAR,FRE_E100G_PERCENT VARCHAR,BREAKOU_T10G_PRTS VARCHAR,TOTA_L10G_PRTS VARCHAR,USE_D10G_PRTS VARCHAR,FRE_E10G_PRTS VARCHAR,FRE_E10G_PERCENT VARCHAR,TOTA_L100G_CARD_PRTS VARCHAR,PRIMARY KEY (ID)",
  ];

  const suggestions = [];

  rawRecommendationData.forEach((entry) => {
    const [table, colsRaw] = entry.split(":");
    const columns = colsRaw
      .split(",")
      .map((c) => c.split(" ")[0].trim())
      .filter((c) => c && c !== "PRIMARY" && c !== "KEY");

    suggestions.push({ label: table, type: "table" });
    columns.forEach((col) =>
      suggestions.push({ label: col, table, type: "column" })
    );
  });

  return suggestions;
};

export const filterSuggestions = (input, suggestions) => {
  const lowerInput = input.trim().toLowerCase();
  if (!lowerInput) return suggestions;

  return suggestions.filter((s) =>
    s.label.toLowerCase().includes(lowerInput)
  );
};