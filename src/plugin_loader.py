import os
import importlib
import inspect
from pathlib import Path
from src.base import BaseComponent
from src.log_config import get_logger

logger = get_logger("plugin_loader")

def load_plugins():
    """
    Dynamically discovers and initializes custom agent components 
    placed in the 'plugins/' directory.
    """
    plugins_dir = Path("plugins")
    if not plugins_dir.exists():
        return []

    loaded_instances = []

    for file_path in plugins_dir.glob("*.py"):
        if file_path.name == "__init__.py":
            continue

        module_name = f"plugins.{file_path.stem}"
        try:
            module = importlib.import_module(module_name)
            
            # Find classes in the module that inherit from BaseComponent
            for name, obj in inspect.getmembers(module, inspect.isclass):
                # Ensure it's a subclass, not BaseComponent itself, and defined in the module
                if issubclass(obj, BaseComponent) and obj is not BaseComponent and obj.__module__ == module_name:
                    logger.info(f"Loading custom plugin agent: {name}")
                    instance = obj()
                    loaded_instances.append(instance)
                    
        except Exception as e:
            logger.error(f"Failed to load plugin {file_path.name}: {e}")

    return loaded_instances
