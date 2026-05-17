import logging
import sys
import structlog
import os

def configure_logging(log_level: int = logging.INFO):
    """Configures dual-mode logging for AGORA-glass.
    
    1. Console: High-fidelity structured logs (structlog ConsoleRenderer).
    2. File (logs/sentinel.log): Neat, standard logging format with emojis.
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

    # Console: Full structured output with colors
    console_formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=structlog.dev.ConsoleRenderer(colors=True, pad_event=32),
    )

    # File: "Neat" format using a custom string renderer
    # We want the file to look like standard logging but with the emoji messages
    def file_renderer(_, __, event_dict):
        # Extract the main message (event)
        msg = event_dict.pop("event", "")
        # If there are other keys, append them neatly (optional, but keep it clean)
        # For the "neat" requirement, we'll mostly focus on the message
        return str(msg)

    file_formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=file_renderer,
    )

    # Setup Handlers
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)

    file_handler = logging.FileHandler("logs/sentinel.log", encoding="utf-8")
    # The standard prefix is added by the Formatter's fmt string
    # We use a standard Formatter that wraps our structlog processors
    file_prefix_formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    # Actually, ProcessorFormatter allows us to do both.
    # We'll set the standard formatter to handle the timestamp/level/name
    # and the ProcessorFormatter to handle the message content.
    file_handler.setFormatter(file_formatter)
    
    # Wait, if I use file_formatter as a ProcessorFormatter, 
    # I can't easily use a standard logging.Formatter fmt string on top.
    # Let's do it manually in the file_renderer.

    def neat_file_renderer(_, __, event_dict):
        ts = event_dict.get("timestamp", "")
        level = event_dict.get("level", "").upper()
        logger_name = event_dict.get("logger", "root")
        msg = event_dict.get("event", "")
        return f"{ts} [{level}] {logger_name}: {msg}"

    final_file_formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processor=neat_file_renderer,
    )
    file_handler.setFormatter(final_file_formatter)

    # Configure Root Logger
    root_logger = logging.getLogger()
    root_logger.handlers = [] 
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

    structlog.contextvars.bind_contextvars(agent_id="agora-glass-01")

def get_logger(name: str):
    return structlog.get_logger(name)
