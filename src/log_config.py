import logging
import sys
import structlog

def configure_logging(log_level: int = logging.INFO):
    """Configures high-fidelity structured logging for AGORA-glass.
    
    This follows the 'Glass-Box' philosophy: all actions are observable, 
    verifiable, and consistent across modules.
    
    Args:
        log_level: The standard logging level (default: INFO).
    """
    
    # Standard library logging setup for file output
    import os
    os.makedirs("logs", exist_ok=True)
    
    # Shared processors for both structlog and standard logging
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # Renderer for production: Structured JSON
    json_renderer = structlog.processors.JSONRenderer()

    structlog.configure(
        processors=processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Setup standard logging handler with the structlog formatter
    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=processors,
        processor=json_renderer,
    )

    # Console Handler (Stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # File Handler (logs/agent.log)
    file_handler = logging.FileHandler("logs/agent.log", encoding="utf-8")
    file_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.setLevel(log_level)

    # Bind default context
    structlog.contextvars.bind_contextvars(agent_id="agora-glass-01")

def get_logger(name: str):
    """Returns a structured logger for the specified component.
    
    Args:
        name: The name of the module or component.
    """
    return structlog.get_logger(name)
