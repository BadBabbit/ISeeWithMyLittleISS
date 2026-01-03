import yaml
import os

def _flatten_dict(d, parent_key='', sep='_'):
    """ recursively flatten nested dictionary with separator
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(_flatten_dict(v, new_key, sep=sep).items()) # recurseively flattten
        else:
            items.append((new_key, v))
    return dict(items)

def _load_config():
    """ load and flatten config, then inject into module globals
    """
    config_path = os.path.join(os.path.dirname(__file__), "config.yaml")
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    
    # flatten the config
    flat_config = _flatten_dict(config)
    
    # convert keys to uppercase and inject into module namespace
    for key, value in flat_config.items():
        var_name = key.upper()
        globals()[var_name] = value

# load config when module is imported
_load_config()