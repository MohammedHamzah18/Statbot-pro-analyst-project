const state = {
  activeDataset: null,
};

const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || response.statusText);
  }
  return response.json();
}

function setBusy(isBusy) {
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
  });
}

function renderDatasets(datasets) {
  const host = $("datasets");
  host.innerHTML = "";
  if (!datasets.length) {
    host.innerHTML = '<p class="muted">No uploads yet.</p>';
    return;
  }
  datasets.forEach((dataset) => {
    const button = document.createElement("button");
    button.className = "dataset-item";
    button.type = "button";
    button.innerHTML = `<strong>${dataset.filename}</strong><span>${dataset.rows} rows, ${dataset.columns.length} columns</span>`;
    button.addEventListener("click", () => setActiveDataset(dataset));
    host.appendChild(button);
  });
}

function setActiveDataset(dataset) {
  state.activeDataset = dataset;
  $("active-title").textContent = dataset.filename;
  $("rows").textContent = dataset.rows.toLocaleString();
  $("columns").textContent = dataset.columns.length;
  $("numeric").textContent = dataset.numeric_columns.length;
  $("dates").textContent = dataset.datetime_columns.length;
  renderPreview(dataset.preview);
}

function renderPreview(rows) {
  const host = $("preview");
  if (!rows || !rows.length) {
    host.innerHTML = "";
    return;
  }
  const columns = Object.keys(rows[0]);
  const head = columns.map((column) => `<th>${column}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${columns.map((column) => `<td>${row[column] ?? ""}</td>`).join("")}</tr>`)
    .join("");
  host.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderSteps(steps) {
  const host = $("steps");
  host.innerHTML = "";
  steps.forEach((step) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${step.title}</strong><span>${step.detail}</span>`;
    host.appendChild(item);
  });
}

async function refreshDatasets() {
  const datasets = await api("/api/datasets");
  renderDatasets(datasets);
  if (!state.activeDataset && datasets.length) {
    setActiveDataset(datasets[0]);
  }
}

async function checkHealth() {
  try {
    await api("/health");
    $("health").textContent = "API online";
    $("health").className = "health ok";
  } catch {
    $("health").textContent = "API offline";
    $("health").className = "health bad";
  }
}

$("upload-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = $("dataset-file").files[0];
  if (!file) return;
  const form = new FormData();
  form.append("file", file);
  setBusy(true);
  try {
    const dataset = await api("/api/datasets", { method: "POST", body: form });
    setActiveDataset(dataset);
    await refreshDatasets();
  } catch (error) {
    alert(error.message);
  } finally {
    setBusy(false);
  }
});

$("question-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.activeDataset) {
    alert("Upload or select a dataset first.");
    return;
  }
  const question = $("question").value.trim();
  if (!question) return;

  setBusy(true);
  $("answer").textContent = "Working through the analysis...";
  $("code").textContent = "";
  $("diagnostics").textContent = "";
  $("chart").classList.add("hidden");
  renderSteps([{ title: "Queued", detail: "Sending the question to the analyst agent." }]);

  try {
    const result = await api("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset_id: state.activeDataset.dataset_id, question }),
    });
    renderSteps(result.steps);
    $("answer").textContent = result.answer;
    $("code").textContent = result.code;
    $("diagnostics").textContent = JSON.stringify(result.diagnostics, null, 2);
    if (result.chart_url) {
      $("chart").src = result.chart_url;
      $("chart").classList.remove("hidden");
    }
  } catch (error) {
    $("answer").textContent = error.message;
  } finally {
    setBusy(false);
  }
});

checkHealth();
refreshDatasets().catch(() => {});
