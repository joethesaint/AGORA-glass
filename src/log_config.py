import logging
import sys
import structlog
import os

def configure_logging(log_level: int = logging.INFO):
    """Configures dual-mode logging for AGORA-glass.
    
    1. Console: Human-friendly, colored, with emojis (for developers/demos).
    2. File (agent.jsonl): Structured JSON (for machine-readable audit trail).
    """
    os.makedirs("logs", exist_ok=True)
    
    # core processors (shared)
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # 1. Console Formatter (Human-Friendly)
    console_formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=structlog.dev.ConsoleRenderer(colors=True),
    )

    # 2. JSON Formatter (Machine-Friendly for Audit)
    json_formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=structlog.processors.JSONRenderer(),
    )

    # Setup Handlers
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)

    file_handler = logging.FileHandler("logs/agent.jsonl", encoding="utf-8")
    file_handler.setFormatter(json_formatter)

    # Configure Root Logger
    root_logger = logging.getLogger()
    root_logger.handlers = [] # Clear existing handlers
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.setLevel(log_level)

    structlog.configure(
        processors=shared_processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Bind default context
    structlog.contextvars.bind_contextvars(agent_id="agora-glass-01")

def get_logger(name: str):
    """Returns a structured logger for the specified component."""
    return structlog.get_logger(name)
