"""Crop Wu Xing reference into proper OG + favicon PNGs."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / "reference" / "e882ad27c83fd425f855b1249c6b13da.jpg"
OG_DIR = ROOT / "public" / "og"
FAV_DIR = ROOT / "public" / "favicons"
PUBLIC = ROOT / "public"

# Tuned on the saved reference (1039x1831): Wu Xing wheel only
DIAGRAM_BOX = (240, 450, 760, 970)

# Marketing hooks (OG / meta) — not soft editorial, conversion-focused
BRAND = "SAJU ME"
HOOK = "지금, 당신의 사주를 분석합니다"
HOOK_SUPPORT = "이름·생년월일만 넣으면, 기질이 읽힙니다"
META_DESC = (
    "이름과 생년월일로 성격·기질·흐름을 바로 분석합니다. "
    "SAJU ME에서 지금 사주 해석을 받아보세요."
)
OG_TITLE = f"{BRAND} — {HOOK}"


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
    # Keep edge crisp for high-res marks (tiny blur only)
    return m.filter(ImageFilter.GaussianBlur(0.4))


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


def build_line_mark(
    diagram: Image.Image,
    zoom: float = 1.0,
    *,
    master: int = 1024,
    tone_down: bool = True,
) -> Image.Image:
    """Keep only Wu Xing stroke lines; force pure white behind them."""
    src = diagram
    if zoom > 1.0:
        w, h = diagram.size
        cw, ch = int(w / zoom), int(h / zoom)
        left, top = (w - cw) // 2, (h - ch) // 2
        src = diagram.crop((left, top, left + cw, top + ch))

    base = src.resize((master, master), Image.Resampling.LANCZOS)
    base = ImageEnhance.Contrast(base).enhance(1.55)
    arr = np.asarray(base).astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    lum = 0.3 * r + 0.59 * g + 0.11 * b

    # Local contrast: keep strong strokes, drop faint luopan grid/text
    blur = np.asarray(
        Image.fromarray(lum.astype(np.uint8), mode="L").filter(
            ImageFilter.GaussianBlur(radius=7)
        )
    ).astype(np.float32)
    detail = lum - blur

    lines = (detail > 18) & (lum > 72)
    # Prefer gold / warm stroke pixels of the Wu Xing wheel
    goldish = (r > 90) & (g > 70) & ((r + g) > 1.5 * b) & (lum > 58) & (detail > 8)
    lines |= goldish
    # Drop isolated speckles
    mask_img = Image.fromarray((lines.astype(np.uint8) * 255), mode="L")
    mask_img = mask_img.filter(ImageFilter.MinFilter(3))
    mask_img = mask_img.filter(ImageFilter.MaxFilter(3))
    mask_img = mask_img.filter(ImageFilter.MaxFilter(3))  # slight thicken for tab size
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(0.45))
    alpha = np.asarray(mask_img).astype(np.float32) / 255.0

    if tone_down:
        ink = np.array([24, 42, 56], dtype=np.float32)
    else:
        ink = np.array([105, 78, 24], dtype=np.float32)

    out = np.full((master, master, 3), 255.0, dtype=np.float32)
    for c in range(3):
        out[:, :, c] = out[:, :, c] * (1.0 - alpha) + ink[c] * alpha
    mark = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), mode="RGB")

    plate = Image.new("RGB", (master, master), (255, 255, 255))
    inset = max(10, master // 40)
    circ = circular_mask(master, inset=inset)
    mark = Image.composite(mark, plate, circ)

    rgba = mark.convert("RGBA")
    ring = Image.new("RGBA", (master, master), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    pad = max(8, master // 90)
    width = max(5, master // 85)
    rd.ellipse(
        (pad, pad, master - 1 - pad, master - 1 - pad),
        outline=(36, 56, 70, 220) if tone_down else (150, 115, 45, 230),
        width=width,
    )
    return Image.alpha_composite(rgba, ring).convert("RGB")


def build_mark(
    diagram: Image.Image,
    zoom: float = 1.0,
    *,
    master: int = 1024,
    brightness: float = 1.0,
    contrast: float = 1.28,
    sharpness: float = 1.55,
    bg_rgb: tuple[int, int, int] = (8, 36, 42),
) -> Image.Image:
    """Full-color circular mark (used for OG seal on dark canvas)."""
    src = diagram
    if zoom > 1.0:
        w, h = diagram.size
        cw, ch = int(w / zoom), int(h / zoom)
        left, top = (w - cw) // 2, (h - ch) // 2
        src = diagram.crop((left, top, left + cw, top + ch))

    base = src.resize((master, master), Image.Resampling.LANCZOS)
    base = ImageEnhance.Contrast(base).enhance(contrast)
    base = ImageEnhance.Color(base).enhance(1.12)
    base = ImageEnhance.Sharpness(base).enhance(sharpness)
    base = ImageEnhance.Brightness(base).enhance(brightness)
    base = base.filter(ImageFilter.UnsharpMask(radius=1.6, percent=140, threshold=2))

    plate = Image.new("RGB", (master, master), bg_rgb)
    inset = max(12, master // 36)
    mask = circular_mask(master, inset=inset)
    composed = Image.composite(base, plate, mask).convert("RGBA")

    ring = Image.new("RGBA", (master, master), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    w_outer = max(6, master // 70)
    w_inner = max(2, master // 200)
    pad = max(8, master // 90)
    rd.ellipse(
        (pad, pad, master - 1 - pad, master - 1 - pad),
        outline=(212, 175, 88, 235),
        width=w_outer,
    )
    pad2 = pad + w_outer + 4
    rd.ellipse(
        (pad2, pad2, master - 1 - pad2, master - 1 - pad2),
        outline=(212, 175, 88, 110),
        width=w_inner,
    )
    return Image.alpha_composite(composed, ring).convert("RGB")


def save_sizes(mark: Image.Image, stem_paths: dict[Path, int]) -> None:
    for path, size in stem_paths.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        mark.resize((size, size), Image.Resampling.LANCZOS).save(
            path, format="PNG", optimize=True
        )
        print("wrote", path.relative_to(ROOT), f"{size}px")


def make_favicons(diagram: Image.Image) -> None:
    # Line-only on white (오행 선만)
    mark_a = build_line_mark(diagram, zoom=1.0, tone_down=False)
    mark_b = build_line_mark(diagram, zoom=1.28, tone_down=True)
    mark_c = build_line_mark(diagram, zoom=1.0, tone_down=True)  # default

    # Candidates for preview
    save_sizes(
        mark_a,
        {
            FAV_DIR / "favicon-a.png": 64,
            FAV_DIR / "favicon-a-180.png": 180,
            FAV_DIR / "favicon-a-512.png": 512,
        },
    )
    save_sizes(
        mark_b,
        {
            FAV_DIR / "favicon-b.png": 64,
            FAV_DIR / "favicon-b-180.png": 180,
            FAV_DIR / "favicon-b-512.png": 512,
        },
    )
    save_sizes(
        mark_c,
        {
            FAV_DIR / "favicon-c.png": 64,
            FAV_DIR / "favicon-c-128.png": 128,
            FAV_DIR / "favicon-c-180.png": 180,
            FAV_DIR / "favicon-c-512.png": 512,
            # Default site icons = C (tone-down), higher px
            FAV_DIR / "favicon.png": 64,
            FAV_DIR / "favicon-32.png": 32,
            FAV_DIR / "favicon-48.png": 48,
            FAV_DIR / "favicon-64.png": 64,
            FAV_DIR / "favicon-128.png": 128,
            FAV_DIR / "favicon-180.png": 180,
            FAV_DIR / "favicon-512.png": 512,
            PUBLIC / "favicon.png": 64,
            PUBLIC / "favicon-128.png": 128,
            PUBLIC / "apple-touch-icon.png": 180,
        },
    )


def draw_marketing_copy(
    canvas: Image.Image,
    *,
    x: int,
    y: int,
    brand_size: int = 56,
    hook_size: int = 34,
    support_size: int = 22,
) -> None:
    draw = ImageDraw.Draw(canvas)
    brand_font = load_font(brand_size, bold=True)
    hook_font = load_font(hook_size, bold=True)
    support_font = load_font(support_size)
    draw.text((x, y), BRAND, font=brand_font, fill=(232, 210, 150))
    draw.text((x, y + int(brand_size * 1.25)), HOOK, font=hook_font, fill=(245, 240, 230))
    draw.text(
        (x, y + int(brand_size * 1.25 + hook_size * 1.45)),
        HOOK_SUPPORT,
        font=support_font,
        fill=(180, 175, 160),
    )


def make_og(src: Image.Image, diagram: Image.Image) -> None:
    OG_DIR.mkdir(parents=True, exist_ok=True)

    # A — diagram seal + marketing hook (default)
    bg = cover_crop(src.crop((0, 0, src.width, int(src.height * 0.58))), (1200, 630), 0.15)
    bg = ImageEnhance.Brightness(bg).enhance(0.48)
    veil = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    for y in range(630):
        a = int(55 + 120 * (y / 630) ** 1.15)
        vd.line([(0, y), (1200, y)], fill=(6, 28, 34, a))
    canvas = Image.alpha_composite(bg.convert("RGBA"), veil).convert("RGB")

    dsize = 430
    mark = build_mark(
        diagram,
        brightness=0.9,
        bg_rgb=(8, 36, 42),
    ).resize((dsize, dsize), Image.Resampling.LANCZOS)
    plate = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    dx, dy = 70, (630 - dsize) // 2
    plate.paste(mark.convert("RGBA"), (dx, dy))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), plate).convert("RGB")
    draw_marketing_copy(canvas, x=540, y=185, brand_size=52, hook_size=30, support_size=20)
    canvas.save(OG_DIR / "og-a.png", format="PNG", optimize=True)
    canvas.save(PUBLIC / "og-image.png", format="PNG", optimize=True)
    print("wrote og-a / og-image")

    # B — wide atmosphere + hook
    b_img = cover_crop(src.crop((0, 0, src.width, int(src.height * 0.62))), (1200, 630), 0.25)
    b_img = ImageEnhance.Brightness(b_img).enhance(0.62)
    b_veil = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    bd = ImageDraw.Draw(b_veil)
    for x in range(620):
        a = int(180 * (1 - x / 620))
        bd.line([(x, 0), (x, 630)], fill=(6, 28, 34, a))
    for y in range(630):
        a = int(110 * (y / 630) ** 1.4)
        bd.line([(0, y), (1200, y)], fill=(6, 28, 34, a))
    b_img = Image.alpha_composite(b_img.convert("RGBA"), b_veil).convert("RGB")
    draw_marketing_copy(b_img, x=56, y=340, brand_size=48, hook_size=28, support_size=20)
    b_img.save(OG_DIR / "og-b.png", format="PNG", optimize=True)
    print("wrote og-b")

    # C — lower title region + hook
    c_top = int(src.height * 0.35)
    c_img = cover_crop(src.crop((0, c_top, src.width, src.height)), (1200, 630), 0.35)
    c_img = ImageEnhance.Brightness(c_img).enhance(0.64)
    c_veil = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    cd = ImageDraw.Draw(c_veil)
    for y in range(630):
        a = int(140 * (y / 630))
        cd.line([(0, y), (1200, y)], fill=(6, 28, 34, a))
    c_img = Image.alpha_composite(c_img.convert("RGBA"), c_veil).convert("RGB")
    draw_marketing_copy(c_img, x=56, y=340, brand_size=48, hook_size=28, support_size=20)
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
    print("done: favicons + og")


if __name__ == "__main__":
    main()
