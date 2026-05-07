# StatBot Pro

StatBot Pro is a full-stack autonomous CSV data analyst agent. Business users upload messy CSV or Excel files, ask natural-language analytics questions, and receive an answer, generated Pandas code, agent trace, diagnostics, and optional Matplotlib charts.

## What It Includes

- FastAPI backend with dataset upload, profiling, analysis, and static chart delivery.
- Pandas analyst planner for common operations questions: overviews, aggregations, correlations, and trend charts.
- Sandbox executor with AST safety checks, Docker-first isolated execution, and a local development fallback.
- Frontend dashboard for uploads, questions, intermediate steps, generated code, answers, charts, and table previews.
- Sample sales dataset in `data/sample_sales.csv`.

## Project Layout

```text
backend/
  app/
    main.py
    services/
      agent.py
      datasets.py
      executor.py
      planner.py
  sandbox/
    Dockerfile
frontend/
  index.html
  styles.css
  app.js
data/
  sample_sales.csv
docs/
  architecture.md
```

## Run Locally

Create and activate a Python 3.12 virtual environment, then install dependencies:

```bash
pip install -r requirements.txt
uvicorn app.main:app --app-dir backend --reload
```

Open `http://127.0.0.1:8000`, upload `data/sample_sales.csv`, and try:

```text
Plot sales over time with a 3-month rolling average.
```

## Docker Sandbox

Build the restricted analysis image:

```bash
docker build -t statbot-sandbox:latest backend/sandbox
```

Set:

```bash
STATBOT_SANDBOX_MODE=docker
```

Then start the API. Docker mode runs generated Pandas code with no network, limited CPU, limited memory, read-only dataset mount, and a writable chart mount only.

On Windows, make sure a real Python installation is available in addition to the `py` launcher. Docker mode also requires Docker Desktop or another Docker daemon.

## Notes

The current analyst is intentionally auditable: it generates bounded Pandas programs from transparent patterns before execution. The LLM integration point is the planner layer, where an OpenAI-compatible planner can be added while keeping the sandbox and API contract unchanged.
