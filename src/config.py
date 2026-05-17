import yaml
import os
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class RiskConfig:
    max_leverage: float
    rescue_target_margin: float
    base_critical_threshold: float
    volatility_multiplier: float


@dataclass(frozen=True)
class Config:
    risk: RiskConfig


def load_config(config_path: str = "configs/settings.yaml") -> Config:
    """Loads configuration from a YAML file into a Config dataclass."""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")

    with open(config_path, "r") as f:
        data = yaml.safe_load(f)

    risk_data = data.get("risk", {})
    risk_config = RiskConfig(
        max_leverage=float(risk_data.get("max_leverage", 5.0)),
        rescue_target_margin=float(risk_data.get("rescue_target_margin", 0.25)),
        base_critical_threshold=float(risk_data.get("base_critical_threshold", 0.12)),
        volatility_multiplier=float(risk_data.get("volatility_multiplier", 0.05)),
    )

    return Config(risk=risk_config)


# Global config instance
settings = load_config()
