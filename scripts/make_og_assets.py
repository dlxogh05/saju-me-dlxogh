"""Crop Wu Xing reference into proper OG + favicon PNGs."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / "reference" / "e882ad27c83fd425f855b1249c6b13da.jpg"
OG_DIR = ROOT / "public" / "og"
FAV_DIR = ROOT / "public" / "favicons"
PUBLIC = ROOT / "public"

# Tuned on the saved reference (1039x1831): Wu Xing wheel only
DIAGRAM_BOX = (240, 450, 760, 970)


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\malgunbd.ttf" if bold else r"C:\Windows\Fonts\malgun.ttf",
        r"C:\Windows\Fonts\malgun.ttf",
        r"C:\Windows\Fonts\seguisb.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def circular_mask(size: int, inset: int = 2) -> Image.Image:
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((inset, inset, size - 1 - inset, size - 1 - inset), fill=255)
    return m.filter(ImageFilter.GaussianBlur(0.8))


def cover_crop(img: Image.Image, size: tuple[int, int], bias_y: float = 0.2) -> Image.Image:
    tw, th = size
    iw, ih = img.size
    scale = max(tw / iw, th / ih)
    nw, nh = int(iw * scale + 0.5), int(ih * scale + 0.5)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = int((nh - th) * bias_y)
    top = max(0, min(top, nh - th))
    return resized.crop((left, top, left + tw, top + th))


def build_mark(diagram: Image.Image, zoom: float = 1.0) -> Image.Image:
    """512px circular gold-on-teal mark suitable for favicons."""
    master = 512
    src = diagram
    if zoom > 1.0:
        w, h = diagram.size
        cw, ch = int(w / zoom), int(h / zoom)
        left, top = (w - cw) // 2, (h - ch) // 2
        src = diagram.crop((left, top, left + cw, top + ch))

    base = src.resize((master, master), Image.Resampling.LANCZOS)
    base = ImageEnhance.Contrast(base).enhance(1.22)
    base = ImageEnhance.Color(base).enhance(1.1)
    base = ImageEnhance.Sharpness(base).enhance(1.35)
    base = ImageEnhance.Brightness(base).enhance(1.06)

    teal = Image.new("RGB", (master, master), (8, 36, 42))
    mask = circular_mask(master, inset=14)
    composed = Image.composite(base, teal, mask).convert("RGBA")

    ring = Image.new("RGBA", (master, master), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse((10, 10, master - 11, master - 11), outline=(212, 175, 88, 230), width=7)
    rd.ellipse((22, 22, master - 23, master - 23), outline=(212, 175, 88, 100), width=2)
    return Image.alpha_composite(composed, ring).convert("RGB")


def save_sizes(mark: Image.Image, stem_paths: dict[Path, int]) -> None:
    for path, size in stem_paths.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        mark.resize((size, size), Image.Resampling.LANCZOS).save(
            path, format="PNG", optimize=True
        )
        print("wrote", path.relative_to(ROOT))


def make_favicons(diagram: Image.Image) -> None:
    mark_a = build_mark(diagram, zoom=1.0)
    mark_b = build_mark(diagram, zoom=1.28)  # tighter on yin-yang + star
    mark_c = build_mark(diagram, zoom=1.0)
    mark_c = ImageEnhance.Brightness(mark_c).enhance(0.9)

    save_sizes(
        mark_a,
        {
            FAV_DIR / "favicon-a.png": 32,
            FAV_DIR / "favicon-a-180.png": 180,
            FAV_DIR / "favicon.png": 32,
            FAV_DIR / "favicon-32.png": 32,
            FAV_DIR / "favicon-48.png": 48,
            FAV_DIR / "favicon-180.png": 180,
            FAV_DIR / "favicon-512.png": 512,
            PUBLIC / "favicon.png": 32,
            PUBLIC / "apple-touch-icon.png": 180,
        },
    )
    save_sizes(
        mark_b,
        {
            FAV_DIR / "favicon-b.png": 32,
            FAV_DIR / "favicon-b-180.png": 180,
        },
    )
    save_sizes(
        mark_c,
        {
            FAV_DIR / "favicon-c.png": 32,
            FAV_DIR / "favicon-c-180.png": 180,
        },
    )


def make_og(src: Image.Image, diagram: Image.Image) -> None:
    OG_DIR.mkdir(parents=True, exist_ok=True)
    title = load_font(64, bold=True)
    lead = load_font(26)

    # A — diagram seal + brand (default)
    bg = cover_crop(src.crop((0, 0, src.width, int(src.height * 0.58))), (1200, 630), 0.15)
    bg = ImageEnhance.Brightness(bg).enhance(0.52)
    veil = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    for y in range(630):
        a = int(50 + 110 * (y / 630) ** 1.15)
        vd.line([(0, y), (1200, y)], fill=(6, 28, 34, a))
    canvas = Image.alpha_composite(bg.convert("RGBA"), veil).convert("RGB")

    dsize = 430
    mark = build_mark(diagram).resize((dsize, dsize), Image.Resampling.LANCZOS)
    plate = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    dx, dy = 95, (630 - dsize) // 2
    plate.paste(mark.convert("RGBA"), (dx, dy))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), plate).convert("RGB")
    draw = ImageDraw.Draw(canvas)
    tx, ty = 575, 235
    draw.text((tx, ty), "SAJU ME", font=title, fill=(232, 210, 150))
    draw.text((tx, ty + 84), "한지 위에 펼치는 사주 읽기", font=lead, fill=(200, 190, 165))
    canvas.save(OG_DIR / "og-a.png", format="PNG", optimize=True)
    canvas.save(PUBLIC / "og-image.png", format="PNG", optimize=True)
    print("wrote og-a / og-image")

    # B — upper reference landscape
    b_img = cover_crop(src.crop((0, 0, src.width, int(src.height * 0.62))), (1200, 630), 0.25)
    b_img = ImageEnhance.Brightness(b_img).enhance(0.68)
    b_veil = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    bd = ImageDraw.Draw(b_veil)
    for x in range(560):
        a = int(170 * (1 - x / 560))
        bd.line([(x, 0), (x, 630)], fill=(6, 28, 34, a))
    for y in range(630):
        a = int(100 * (y / 630) ** 1.4)
        bd.line([(0, y), (1200, y)], fill=(6, 28, 34, a))
    b_img = Image.alpha_composite(b_img.convert("RGBA"), b_veil).convert("RGB")
    bd2 = ImageDraw.Draw(b_img)
    bd2.text((64, 400), "SAJU ME", font=title, fill=(232, 210, 150))
    bd2.text((64, 482), "오행의 흐름으로 읽는 명식", font=lead, fill=(200, 190, 165))
    b_img.save(OG_DIR / "og-b.png", format="PNG", optimize=True)
    print("wrote og-b")

    # C — lower 五行 title area
    c_top = int(src.height * 0.35)
    c_img = cover_crop(src.crop((0, c_top, src.width, src.height)), (1200, 630), 0.35)
    c_img = ImageEnhance.Brightness(c_img).enhance(0.7)
    c_veil = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    cd = ImageDraw.Draw(c_veil)
    for y in range(630):
        a = int(130 * (y / 630))
        cd.line([(0, y), (1200, y)], fill=(6, 28, 34, a))
    c_img = Image.alpha_composite(c_img.convert("RGBA"), c_veil).convert("RGB")
    cd2 = ImageDraw.Draw(c_img)
    cd2.text((64, 400), "SAJU ME", font=title, fill=(232, 210, 150))
    cd2.text((64, 482), "흐름을 맞추는 사주", font=lead, fill=(200, 190, 165))
    c_img.save(OG_DIR / "og-c.png", format="PNG", optimize=True)
    print("wrote og-c")


def main() -> None:
    if not REF.exists():
        raise SystemExit(f"Missing reference: {REF}")
    src = Image.open(REF).convert("RGB")
    diagram = src.crop(DIAGRAM_BOX)
    FAV_DIR.mkdir(parents=True, exist_ok=True)
    diagram.save(FAV_DIR / "_debug-diagram.png")
    make_favicons(diagram)
    make_og(src, diagram)


if __name__ == "__main__":
    main()
