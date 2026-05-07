# StatBot Pro Architecture

## Flow

1. The user uploads a CSV or Excel file through the frontend.
2. FastAPI stores the file under `backend/storage/uploads/<dataset_id>` and profiles rows, columns, numeric fields, probable date fields, categorical fields, and preview rows.
3. The user asks a natural-language analytics question.
4. `PandasPlanner` maps the question to a bounded Pandas program.
5. `SandboxExecutor` validates the program with AST checks and executes it either locally or inside the Docker sandbox.
6. The backend returns the answer, generated code, agent steps, diagnostics, and optional chart URL.

## Security Controls

- Only CSV/XLS/XLSX uploads are accepted.
- Generated code is parsed before execution.
- Dangerous imports and calls are rejected, including `os`, `sys`, `subprocess`, `open`, `eval`, and `exec`.
- Docker mode runs without network access and with CPU/memory limits.
- Docker mode mounts datasets read-only and exposes only the chart directory as writable.

## Agent Behavior

The planner currently supports:

- Dataset overview and missing-value summaries.
- Aggregation by likely business dimensions such as region, product, category, or segment.
- Correlation between likely metrics such as sales/revenue and marketing spend.
- Monthly trend charts with optional categorical split and 3-period rolling averages.
- Safe fallback summary when intent is unclear.

The agent records each step so the UI can show the intermediate reasoning path required by the assignment brief.

## Production Extensions

- Add an OpenAI or LangChain planner that emits code into the same sandbox contract.
- Add authentication and per-user storage.
- Add persistent job history in Postgres.
- Add streaming responses for long-running analysis.
- Add a queue worker for larger datasets.
