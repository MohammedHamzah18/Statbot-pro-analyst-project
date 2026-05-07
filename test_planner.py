from app.models.schemas import DatasetSummary
from app.services.planner import PandasPlanner


def sample_summary() -> DatasetSummary:
    return DatasetSummary(
        dataset_id="demo",
        filename="sales.csv",
        rows=10,
        columns=["date", "region", "sales", "revenue", "marketing_spend"],
        numeric_columns=["sales", "revenue", "marketing_spend"],
        datetime_columns=["date"],
        categorical_columns=["region"],
        preview=[],
    )


def test_trend_plan_generates_chart_code():
    plan = PandasPlanner().build(sample_summary(), "plot sales over time")
    assert plan.intent == "trend"
    assert "save_chart" in plan.code


def test_correlation_plan_selects_marketing_spend():
    plan = PandasPlanner().build(sample_summary(), "how does revenue correlate with marketing spend")
    assert plan.intent == "correlation"
    assert "marketing_spend" in plan.code
