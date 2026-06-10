from io import BytesIO
from pathlib import Path

from docx import Document

from models import SAC
from schemas import fmt_date

TEMPLATE_PATH = Path(__file__).resolve().parents[1] / "templates" / "F01-PD-PR-02.05.docx"


def replace_in_paragraph(paragraph, replacements):
    full_text = "".join(run.text for run in paragraph.runs)
    for key, value in replacements.items():
        full_text = full_text.replace(f"{{{{{key}}}}}", str(value or ""))
    if paragraph.runs:
        paragraph.runs[0].text = full_text
        for run in paragraph.runs[1:]:
            run.text = ""


def replace_in_table(table, replacements):
    for row in table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                replace_in_paragraph(paragraph, replacements)


def sac_replacements(sac: SAC) -> dict:
    return {
        "codigo": sac.codigo,
        "code": sac.code,
        "campus": sac.campus,
        "proceso": sac.proceso,
        "proceso_sgc": sac.proceso_sgc,
        "norma": sac.norma,
        "clausula": sac.clausula,
        "originador": sac.originador,
        "fecha_registro": fmt_date(sac.fecha_registro),
        "fecha_compromiso": fmt_date(sac.fecha_compromiso),
        "responsable": sac.responsable,
        "prioridad": sac.prioridad,
        "fuente": sac.fuente,
        "nc": sac.nc,
        "accion_inmediata": sac.accion_inmediata,
        "accion_inm_responsable": sac.accion_inm_responsable,
        "accion_inm_fecha": fmt_date(sac.accion_inm_fecha),
        "analisis_causa": sac.analisis_causa,
        "estado": sac.estado,
        "implementacion": f"{sac.implementacion}%",
        "eficacia": sac.eficacia,
    }


def append_plan_table(document: Document, sac: SAC) -> None:
    document.add_heading("Plan de accion", level=2)
    table = document.add_table(rows=1, cols=5)
    table.style = "Table Grid"
    headers = ["N", "Descripcion", "Responsable", "Fecha", "Estado"]
    for idx, title in enumerate(headers):
        table.rows[0].cells[idx].text = title
    for action in sorted(sac.plan_acciones, key=lambda x: x.orden):
        row = table.add_row().cells
        row[0].text = str(action.orden)
        row[1].text = action.desc
        row[2].text = action.responsable
        row[3].text = fmt_date(action.fecha)
        row[4].text = action.estado


def build_fallback_document(sac: SAC) -> Document:
    document = Document()
    document.add_heading("F01-PD-PR-02.05 - Solicitud de Accion Correctiva", level=1)
    document.add_paragraph(f"Codigo: {sac.codigo}")
    document.add_paragraph(f"Campus: {sac.campus}")
    document.add_paragraph(f"Area / proceso: {sac.proceso}")
    document.add_paragraph(f"Proceso SGC: {sac.proceso_sgc}")
    document.add_paragraph(f"Norma / clausula: {sac.norma} - {sac.clausula}")
    document.add_paragraph(f"Fuente: {sac.fuente}")
    document.add_paragraph(f"Prioridad: {sac.prioridad}")
    document.add_paragraph(f"Responsable: {sac.responsable}")
    document.add_paragraph(f"Fecha de registro: {fmt_date(sac.fecha_registro)}")
    document.add_heading("Descripcion de la no conformidad", level=2)
    document.add_paragraph(sac.nc or sac.descripcion)
    document.add_heading("Accion inmediata", level=2)
    document.add_paragraph(sac.accion_inmediata)
    document.add_heading("Analisis de causa raiz", level=2)
    document.add_paragraph(sac.analisis_causa)
    append_plan_table(document, sac)
    return document


def build_docx(sac: SAC) -> BytesIO:
    if TEMPLATE_PATH.exists():
        document = Document(TEMPLATE_PATH)
        replacements = sac_replacements(sac)
        for paragraph in document.paragraphs:
            replace_in_paragraph(paragraph, replacements)
        for table in document.tables:
            replace_in_table(table, replacements)
        append_plan_table(document, sac)
    else:
        document = build_fallback_document(sac)

    buffer = BytesIO()
    document.save(buffer)
    buffer.seek(0)
    return buffer
