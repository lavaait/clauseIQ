from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("templates/clauses"))

def to_template_filename(name: str) -> str:
    name = name.lower().strip()
    name = name.replace("template", "")
    name = name.replace("-", "")
    name = name.replace(" ", "_")
    return f"{name}.jinja"

def generate_contract_from_template(template_name: str, metadata: dict) -> str:
    try:
        template_file = to_template_filename(template_name)
        template = env.get_template(template_file)
        return template.render(**metadata), "Rendered from template"
    except Exception as e:
        return "", f"Error: {str(e)}"