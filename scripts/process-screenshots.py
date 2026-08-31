#!/usr/bin/env python3
"""Copy README screenshots and blur email/contact fields on report views."""
from pathlib import Path
from typing import List, Optional, Tuple
from PIL import Image, ImageFilter

SRC = Path("/Users/obinw/.cursor/projects/Users-obinw-campus-lost-and-found/assets")
OUT = Path(__file__).resolve().parent.parent / "assets" / "screenshots"


def blur_box(img: Image.Image, box: Tuple[int, int, int, int], radius: int = 14) -> None:
    left, top, right, bottom = box
    w, h = img.size
    left = max(0, min(left, w - 1))
    top = max(0, min(top, h - 1))
    right = max(left + 1, min(right, w))
    bottom = max(top + 1, min(bottom, h))
    region = img.crop((left, top, right, bottom))
    img.paste(region.filter(ImageFilter.GaussianBlur(radius=radius)), (left, top))


def pct(img: Image.Image, x1: float, y1: float, x2: float, y2: float) -> Tuple[int, int, int, int]:
    w, h = img.size
    return (int(w * x1), int(h * y1), int(w * x2), int(h * y2))


def process(src_name: str, dest_name: str, blur_regions: Optional[List[Tuple[float, float, float, float]]] = None) -> None:
    src = SRC / src_name
    if not src.exists():
        raise FileNotFoundError(src)
    img = Image.open(src).convert("RGB")
    if blur_regions:
        for region in blur_regions:
            blur_box(img, pct(img, *region))
    dest = OUT / dest_name
    img.save(dest, quality=92, optimize=True)
    print(f"  {dest_name} ({img.size[0]}x{img.size[1]})")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # Landing — no emails
    print("Landing")
    process("image-7f2c4bee-c2d4-4519-b85f-ab0f3240d47f.jpg", "01-landing-hero.jpg")
    process("image-24562629-0156-45e9-ad00-7c17cc9f896a.png", "01-landing-steps.png")
    process("image-d2221df4-7371-4ecf-b72a-f9a3d548e8a1.jpg", "01-landing-features.jpg")

    # Browse — blur contact/email lines on all four cards
    print("Browse")
    process(
        "image-3612d96a-0a24-4170-99e7-6af1c42f9a38.jpg",
        "02-browse-home.jpg",
        [
            (0.03, 0.66, 0.49, 0.84),
            (0.51, 0.66, 0.97, 0.84),
            (0.03, 0.84, 0.49, 0.99),
            (0.51, 0.84, 0.97, 0.99),
        ],
    )

    # Report forms — blur email input + helper text
    print("Reports")
    process(
        "image-bfb7337e-6d64-44ec-acb0-7fe66851ccc5.png",
        "03-report-lost.png",
        [(0.08, 0.70, 0.92, 0.86)],
    )
    process(
        "image-1a9bd8ac-87e1-40df-b6b1-f2d3eca759d6.png",
        "04-report-found.png",
        [(0.08, 0.70, 0.92, 0.86)],
    )

    # Item detail — blur contact email row
    print("Item detail")
    process(
        "image-a16f820d-f351-487a-9866-a763a9b44fae.jpg",
        "05-item-detail-lost.jpg",
        [(0.04, 0.48, 0.72, 0.62)],
    )
    process(
        "image-272dec93-7b69-4768-aa00-4d03f0ebbab9.jpg",
        "06-item-detail-match.jpg",
        [(0.04, 0.54, 0.72, 0.68)],
    )
    process(
        "image-3dad6f39-d766-4280-842d-8648023dca9a.jpg",
        "05-item-detail-cancelled.jpg",
        [(0.04, 0.54, 0.72, 0.68)],
    )

    # Auth — placeholder emails only; light blur on email field for consistency
    print("Auth")
    process(
        "image-4efcd49a-83e1-4cb6-9928-6e0fa30e870e.png",
        "07-login.png",
        [(0.12, 0.36, 0.88, 0.44)],
    )
    process(
        "image-28050fb3-3101-4785-8d81-fdaa81236b8b.png",
        "08-register.png",
        [(0.12, 0.40, 0.88, 0.48)],
    )

    print("Done.")


if __name__ == "__main__":
    main()
