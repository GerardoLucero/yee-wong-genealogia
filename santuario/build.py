#!/usr/bin/env python3
"""Arma santuario/index.html a partir de css/, acts/, img/motifs.svg y js/.

Uso:
  python3 santuario/build.py            # construye index.html
  python3 santuario/build.py --check    # ademas valida ids, cabeceras y etiquetas
  python3 santuario/build.py --check-only
Solo stdlib. Tolera archivos ausentes y los lista al final.
"""
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "index.html"
GSAP_VERSION = "3.12.5"
CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/%s/%%s" % GSAP_VERSION
DEFAULT_FONTS = (
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400"
    "&family=Noto+Serif+SC:wght@400;600&display=swap"
)
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}

omitted = []


def read(rel, required_label=None):
    p = ROOT / rel
    if p.is_file():
        return p.read_text(encoding="utf-8")
    omitted.append(rel)
    return None


def glob_sorted(pattern):
    return sorted(ROOT.glob(pattern), key=lambda p: p.name)


def fonts_href():
    art = ROOT / "content" / "ART.md"
    if art.is_file():
        m = re.search(r"https://fonts\.googleapis\.com/css2?\?[^\s\"'<>)\]`]+", art.read_text(encoding="utf-8"))
        if m:
            return m.group(0).replace("&amp;", "&")
    omitted.append("content/ART.md (fuentes: se usan las de respaldo)")
    return DEFAULT_FONTS


def style_block(name, css):
    return "<style data-src=\"%s\">\n%s\n</style>" % (name, css.strip())


def collect_css():
    blocks = []
    for rel in ["css/tokens.css", "css/base.css", "css/chrome.css"]:
        css = read(rel)
        if css is not None:
            blocks.append(style_block(rel, css))
    acts = glob_sorted("css/act*.css")
    if not acts:
        omitted.append("css/act*.css")
    for p in acts:
        blocks.append(style_block("css/" + p.name, p.read_text(encoding="utf-8")))
    return "\n".join(blocks)


def collect_acts():
    files = glob_sorted("acts/*.html")
    if not files:
        omitted.append("acts/*.html")
    return [(p.name, p.read_text(encoding="utf-8")) for p in files]


def collect_sprite():
    svg = read("img/motifs.svg")
    if svg is None:
        return ""
    svg = re.sub(r"<\?xml[^>]*\?>\s*", "", svg).strip()
    # el sprite no debe ocupar espacio ni ser leido por lectores de pantalla
    if "<svg" in svg and "aria-hidden" not in svg.split(">", 1)[0]:
        svg = svg.replace("<svg", '<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"', 1)
    return svg


def script_tag(rel):
    src = read(rel)
    if src is None:
        return ""
    src = src.replace("</script", "<\\/script")
    return "<script data-src=\"%s\">\n%s\n</script>" % (rel, src.strip())


def collect_scripts():
    out = [
        '<script src="%s"></script>' % (CDN % "gsap.min.js"),
        '<script src="%s"></script>' % (CDN % "ScrollTrigger.min.js"),
        script_tag("js/engine.js"),
    ]
    audio = ROOT / "js" / "audio.js"
    if audio.is_file():
        out.append(script_tag("js/audio.js"))
    else:
        omitted.append("js/audio.js (opcional)")
    acts = glob_sorted("js/act*.js")
    if not acts:
        omitted.append("js/act*.js")
    for p in acts:
        out.append(script_tag("js/" + p.name))
    return "\n".join(s for s in out if s)


def build():
    fonts = fonts_href()
    acts = collect_acts()
    sprite = collect_sprite()
    html = "\n".join([
        "<!doctype html>",
        '<html lang="es" data-lang="es">',
        "<head>",
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        "<title>Santuario Yee Wong</title>",
        '<meta name="description" content="Santuario Yee Wong: la historia de una familia entre Taishan y Baja California Sur.">',
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link rel="stylesheet" href="%s">' % fonts,
        collect_css(),
        "</head>",
        "<body>",
        sprite,
        "<main id=\"santuario\">",
        "\n".join(body for _, body in acts),
        "</main>",
        "<noscript><p style=\"padding:16px\">Esta página usa animaciones; el contenido se lee igual sin JavaScript.</p></noscript>",
        collect_scripts(),
        "</body>",
        "</html>",
        "",
    ])
    OUT.write_text(html, encoding="utf-8")
    return html, acts


class Scan(HTMLParser):
    def __init__(self, name):
        super().__init__(convert_charrefs=True)
        self.name = name
        self.ids = []
        self.refs = []
        self.headings = []
        self.h1 = 0
        self.stack = []
        self.errors = []
        self._h = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        for k in ("href", "xlink:href"):
            v = a.get(k, "")
            if v.startswith("#") and len(v) > 1:
                self.refs.append(v[1:])
        for v in a.values():
            if v:
                for m in re.finditer(r"url\(#([^)]+)\)", v):
                    self.refs.append(m.group(1))
        if tag == "h1":
            self.h1 += 1
        if tag in ("h1", "h2", "h3"):
            self._h = [tag, ""]
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_startendtag(self, tag, attrs):
        # <br/>, <path/>: autocierre, no entra a la pila
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        for k in ("href", "xlink:href"):
            v = a.get(k, "")
            if v.startswith("#") and len(v) > 1:
                self.refs.append(v[1:])

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self._h and self._h[0] == tag:
            text = " ".join(self._h[1].split())
            if text:
                self.headings.append((tag, text))
            self._h = None
        if not self.stack or self.stack[-1][0] != tag:
            self.errors.append("%s:%d etiqueta de cierre </%s> inesperada" % (self.name, self.getpos()[0], tag))
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i][0] == tag:
                    del self.stack[i:]
                    break
        else:
            self.stack.pop()

    def handle_data(self, data):
        if self._h is not None:
            self._h[1] += data

    def finish(self):
        for tag, line in self.stack:
            self.errors.append("%s:%d <%s> sin cerrar" % (self.name, line, tag))


def check(acts, sprite):
    problems = []
    all_ids = Counter()
    all_refs = []
    all_headings = Counter()
    h1_total = 0
    act_numbers = Counter()

    parts = [(n, b) for n, b in acts]
    if sprite:
        parts.append(("img/motifs.svg", sprite))

    for name, body in parts:
        s = Scan(name)
        s.feed(body)
        s.close()
        s.finish()
        problems += s.errors
        all_ids.update(s.ids)
        all_refs += [(name, r) for r in s.refs]
        h1_total += s.h1
        for tag, text in s.headings:
            all_headings[(tag, text)] += 1
        if name.endswith(".html"):
            for m in re.finditer(r'<section[^>]*class="[^"]*\bact\b[^"]*"[^>]*>', body):
                tagtxt = m.group(0)
                n = re.search(r'data-act="(\d+)"', tagtxt)
                idm = re.search(r'\bid="([^"]+)"', tagtxt)
                if not n:
                    problems.append("%s: <section class=\"act\"> sin data-act" % name)
                    continue
                act_numbers[n.group(1)] += 1
                if not idm or idm.group(1) != "acto" + n.group(1):
                    problems.append("%s: id de seccion deberia ser acto%s" % (name, n.group(1)))
                for lang in ("es", "en", "zh"):
                    if 'data-title-%s=' % lang not in tagtxt:
                        problems.append("%s: falta data-title-%s" % (name, lang))
                fn = re.match(r"(\d+)-", name)
                if fn and int(fn.group(1)) != int(n.group(1)):
                    problems.append("%s: el numero de archivo no coincide con data-act=%s" % (name, n.group(1)))

    for i, c in all_ids.items():
        if c > 1:
            problems.append("id duplicado: %s (x%d)" % (i, c))
    for name, r in all_refs:
        if r not in all_ids:
            problems.append("%s: referencia a #%s sin id correspondiente" % (name, r))
    for (tag, text), c in all_headings.items():
        if c > 1:
            problems.append("cabecera duplicada <%s> '%s' (x%d)" % (tag, text, c))
    if h1_total > 1:
        problems.append("hay %d <h1>; debe haber uno solo" % h1_total)
    for n, c in act_numbers.items():
        if c > 1:
            problems.append("data-act=%s repetido (x%d)" % (n, c))
    expected = set(str(i) for i in range(1, 8))
    missing = sorted(expected - set(act_numbers), key=int)
    if missing:
        problems.append("actos aun ausentes: " + ", ".join(missing))
    return problems


def main(argv):
    do_check = "--check" in argv or "--check-only" in argv
    html, acts = build() if "--check-only" not in argv else (None, collect_acts())
    if "--check-only" in argv:
        sprite = collect_sprite()
    else:
        sprite = collect_sprite()
    if html is not None:
        print("escrito %s (%d KB, %d actos)" % (OUT.relative_to(ROOT.parent), len(html.encode()) // 1024, len(acts)))
    if omitted:
        print("omitido (no existe aun):")
        for o in sorted(set(omitted)):
            print("  - " + o)
    if do_check:
        problems = check(acts, sprite)
        if problems:
            print("check: %d problema(s)" % len(problems))
            for p in problems:
                print("  * " + p)
            return 1
        print("check: sin problemas")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
