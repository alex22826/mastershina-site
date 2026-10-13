"""Вырезает объект со студийного фона (белого или чёрного) и сохраняет WebP с прозрачностью.

usage: cutout.py in.png out.webp white|black target_h [quality] [thr]
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, dst, bgkind, target_h = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
quality = int(sys.argv[5]) if len(sys.argv) > 5 else 80
thr = float(sys.argv[6]) if len(sys.argv) > 6 else (0.62 if bgkind == 'white' else 40)

im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
h, w, _ = im.shape
L = im @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
chroma = im.max(2) - im.min(2)

# фон — плавный градиент: аппроксимируем яркость краёв кадра квадратичной поверхностью
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
b = 24
border = np.zeros((h, w), bool); border[:b] = border[-b:] = True; border[:, :b] = border[:, -b:] = True
def design(x, y):
    x = x / w; y = y / h
    return np.stack([np.ones_like(x), x, y, x * x, y * y, x * y], -1)
coef, *_ = np.linalg.lstsq(design(xx[border], yy[border]), L[border], rcond=None)
B = design(xx, yy) @ coef

if bgkind == 'white':
    # очень светлые пиксели — фон даже с оттенком (розовые отражения диска на «полу»)
    bglike = ((chroma < 24) & (L > thr * B)) | (L > 0.86 * B)
else:
    bglike = (chroma < 24) & (L < thr)

# фон = «фоновые» пиксели, связанные с краем кадра (внутренние блики/отверстия не трогаем)
lab, n = ndi.label(bglike)
edge_labels = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, edge_labels[edge_labels > 0])
core = ~bg

# оставляем только самый крупный объект; «открытие» рвёт тонкие перемычки к мелким артефактам
opened = ndi.binary_opening(core, iterations=4)
lab2, n2 = ndi.label(opened)
if n2 >= 1:
    sizes = ndi.sum(opened, lab2, range(1, n2 + 1))
    main = lab2 == (1 + int(np.argmax(sizes)))
    core = core & ndi.binary_dilation(main, iterations=5)

# альфа: ядро = 1, кромка шириной ~2.5px — по смешиванию с фоном, дальше (тень на полу) = 0
dist = ndi.distance_transform_edt(~core)
near = (dist > 0) & (dist <= 2.5)
alpha = core.astype(np.float32)
rgb = im.copy()
if bgkind == 'white':
    a_edge = np.clip((B - L) / np.maximum(B, 1), 0, 1)
    alpha[near] = a_edge[near]
    rgb[near] = rgb[near] * 0.35  # кромка шины — тёмная, убираем светлый ореол
else:
    a_edge = np.clip((L - 10) / 50, 0, 1)
    alpha[near] = a_edge[near]
    rgb[near] = np.clip(rgb[near] / np.maximum(a_edge[near], 0.05)[:, None], 0, 255)
alpha = ndi.gaussian_filter(alpha, 0.6) * (dist <= 3)

# шины: мягкое затухание в самом низу — убирает контактную тень на «полу», шина «садится» на CSS-тень
if bgkind == 'white':
    ys_a = np.where(alpha.max(1) > 0.5)[0]
    yb, yt = ys_a.max(), ys_a.min()
    span = yb - yt
    f0, f1 = yb - 0.06 * span, yb - 0.012 * span
    fade = np.clip((f1 - yy[:, :1]) / (f1 - f0), 0, 1)
    fade = fade * fade * (3 - 2 * fade)
    alpha = alpha * fade

# обрезка по объекту
ys, xs = np.where(alpha > 0.02)
pad = 6
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, h)
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, w)
rgba = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)[y0:y1, x0:x1]

out = Image.fromarray(rgba, 'RGBA').convert('RGBa')  # ресайз в премультиплицированном виде — без ореолов
scale = target_h / out.height
if scale < 1:
    out = out.resize((round(out.width * scale), target_h), Image.LANCZOS)
out = out.convert('RGBA')
out.save(dst, 'WEBP', quality=quality, method=6, alpha_quality=90)
print(dst.split('\\')[-1], out.size, round(__import__('os').path.getsize(dst) / 1024), 'KB')
