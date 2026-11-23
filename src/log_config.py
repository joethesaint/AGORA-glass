import logging
import sys
import structlog
import os

def configure_logging(log_level: int = logging.INFO):
    """Configures triple-mode logging for AGORA-glass.
    
    1. Console: High-fidelity structured logs (Colored).
    2. File (logs/sentinel.log): Neat, standard logging format with emojis.
    3. File (logs/agent.jsonl): Machine-readable JSON for audit and telemetry.
    """
    os.makedirs("logs", exist_ok=True)
    
    # Common processors
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # --- 1. Console Handler (Colored Structured) ---
    console_formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=structlog.dev.ConsoleRenderer(colors=True, pad_event=32),
    )
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)

    # --- 2. Neat File Handler (Standard format with emojis) ---
    def neat_file_renderer(_, __, event_dict):
        ts = event_dict.get("timestamp", "")
        level = event_dict.get("level", "").upper()
        logger_name = event_dict.get("logger", "root")
        msg = event_dict.get("event", "")
        return f"{ts} [{level}] {logger_name}: {msg}"

    neat_formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=neat_file_renderer,
    )
    neat_file_handler = logging.FileHandler("logs/sentinel.log", encoding="utf-8")
    neat_file_handler.setFormatter(neat_formatter)

    # --- 3. JSONL File Handler (Machine-readable) ---
    json_formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=structlog.processors.JSONRenderer(),
    )
    json_file_handler = logging.FileHandler("logs/agent.jsonl", encoding="utf-8")
    json_file_handler.setFormatter(json_formatter)

    # Configure Root Logger
    root_logger = logging.getLogger()
    root_logger.handlers = [] 
    root_logger.addHandler(console_handler)
    root_logger.addHandler(neat_file_handler)
    root_logger.addHandler(json_file_handler)
    root_logger.setLevel(log_level)

    structlog.configure(
        processors=shared_processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    structlog.contextvars.bind_contextvars(agent_id="agora-glass-01")

def get_logger(name: str):
    return structlog.get_logger(name)
