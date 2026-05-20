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
class ServerConfig:
    port: int
    host: str


@dataclass
class Config:
    risk: RiskConfig
    server: ServerConfig
    agent_id: str
    agent_mode: str = "sentinel"


def load_config(config_path: str = "configs/settings.yaml") -> Config:
    """Loads configuration from a YAML file into a Config dataclass."""
    # Default Agent ID from env or fallback
    agent_id = os.getenv("AGENT_ID", "agora-glass-01")

    if not os.path.exists(config_path):
        # Allow running without settings.yaml in minimal mode
        risk_config = RiskConfig(5.0, 0.25, 0.12, 0.05)
        server_config = ServerConfig(8765, "0.0.0.0")
        return Config(
            risk=risk_config, 
            server=server_config, 
            agent_id=agent_id,
            agent_mode=os.getenv("AGENT_MODE", "sentinel")
        )

    with open(config_path, "r") as f:
        data = yaml.safe_load(f)

    risk_data = data.get("risk", {})
    risk_config = RiskConfig(
        max_leverage=float(risk_data.get("max_leverage", 5.0)),
        rescue_target_margin=float(risk_data.get("rescue_target_margin", 0.25)),
        base_critical_threshold=float(risk_data.get("base_critical_threshold", 0.12)),
        volatility_multiplier=float(risk_data.get("volatility_multiplier", 0.05)),
    )

    server_data = data.get("server", {})
    server_config = ServerConfig(
        port=int(server_data.get("port", 8765)),
        host=str(server_data.get("host", "0.0.0.0")),
    )

    return Config(
        risk=risk_config, 
        server=server_config,
        agent_id=os.getenv("AGENT_ID", data.get("agent_id", agent_id)),
        agent_mode=os.getenv("AGENT_MODE", data.get("agent_mode", "sentinel"))
    )


# Global config instance
settings = load_config()
