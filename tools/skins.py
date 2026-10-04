# Генератор скинов для Kenney Blocky Characters (CC0) — собственные «лубочные» костюмы героев.
# Раскладка UV (1024×1024) вычислена из base.glb. Запуск: python3 tools/skins.py
from PIL import Image, ImageDraw
import random, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'kits', 'blocky', 'skins')
HEAD = dict(top=(128, 0, 256, 128), front=(128, 128, 256, 256), left=(0, 128, 128, 256), right=(256, 128, 384, 256), back=(384, 128, 512, 256), bottom=(128, 256, 256, 384))
TORSO = dict(top=(96, 688, 224, 784), bottom=(96, 928, 224, 1024), band=(0, 784, 448, 928), front=(96, 784, 224, 928), back=(320, 784, 448, 928))
LIMB = lambda bx, y0: dict(top=(bx, y0, bx + 64, y0 + 68), bot=(bx + 64, y0, bx + 128, y0 + 68), band=(bx, y0 + 68, bx + 256, y0 + 236), front=(bx + 64, y0 + 68, bx + 128, y0 + 236))
ARMS = [LIMB(768, 532), LIMB(480, 532)]
LEGS = [LIMB(768, 800), LIMB(480, 800)]

def C(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)

class Skin:
    def __init__(s):
        s.im = Image.new('RGB', (1024, 1024), (30, 30, 35)); s.d = ImageDraw.Draw(s.im)
    def rect(s, r, col, grad=0.0):
        x0, y0, x1, y1 = r
        if not grad: s.d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=col); return
        for y in range(y0, y1):
            t = (y - y0) / max(1, y1 - y0); s.d.line((x0, y, x1 - 1, y), fill=shade(col, 1 + grad * (0.5 - t)))
    def band(s, r, y0f, y1f, col):  # горизонтальная полоса внутри области
        x0, y0, x1, y1 = r; h = y1 - y0; s.rect((x0, int(y0 + h * y0f), x1, int(y0 + h * y1f)), col)
    def dots(s, r, col, n=30, sz=4, seed=1):
        rnd = random.Random(seed); x0, y0, x1, y1 = r
        for _ in range(n):
            x, y = rnd.randint(x0 + sz, x1 - sz), rnd.randint(y0 + sz, y1 - sz); s.d.ellipse((x - sz, y - sz, x + sz, y + sz), fill=col)
    def zigzag(s, x0, x1, y, col, a=6, w=3):
        pts = [(x, y + (a if (i % 2) else -a)) for i, x in enumerate(range(x0, x1 + 1, 2 * a))]; s.d.line(pts, fill=col, width=w)
    def save(s, name):
        s.im.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, name + '.png'), optimize=True)

def face(s, o):
    x0, y0, x1, y1 = HEAD['front']; skin = o['skin']
    s.rect(HEAD['front'], skin, 0.12)
    for k in ('left', 'right', 'back', 'bottom'): s.rect(HEAD[k], skin, 0.12)
    hair = o['hair']
    # волосы: макушка, затылок, верх боков и чёлка
    s.rect(HEAD['top'], hair); s.rect(HEAD['back'], hair, 0.15)
    hb = o.get('hairLen', 0.45)
    for k in ('left', 'right'): s.band(HEAD[k], 0, hb, hair)
    fr = o.get('fringe', 0.22); s.band(HEAD['front'], 0, fr, hair)
    if o.get('fringeCut', True):
        for i in range(5):  # прядки чёлки
            cx = x0 + 12 + i * 26; s.d.polygon([(cx, y0 + int(128 * fr)), (cx + 26, y0 + int(128 * fr)), (cx + 13, y0 + int(128 * fr) + 12)], fill=hair)
    if o.get('scarf'):  # платок
        sc = o['scarf']; s.rect(HEAD['top'], sc); s.rect(HEAD['back'], sc, 0.1)
        for k in ('left', 'right'): s.band(HEAD[k], 0, 0.85, sc)
        s.band(HEAD['front'], 0, 0.26, sc); s.dots(HEAD['back'], (255, 255, 255), 14, 4, 3); s.dots((x0, y0, x1, y0 + 30), (255, 255, 255), 5, 3, 4)
    # глаза
    ey = y0 + o.get('eyeY', 66); ew = o.get('eyeW', 9); ec = o.get('eyeC', (40, 30, 30))
    for ex in (x0 + 40, x1 - 40):
        if o.get('glowEyes'):
            s.d.ellipse((ex - 12, ey - 9, ex + 12, ey + 9), fill=o['glowEyes'])
            s.d.ellipse((ex - 4, ey - 6, ex + 4, ey + 6), fill=(30, 20, 0))
        else:
            s.d.ellipse((ex - ew, ey - ew - 2, ex + ew, ey + ew + 2), fill=(250, 250, 250))
            s.d.ellipse((ex - ew + 3, ey - ew + 1, ex + ew - 3, ey + ew - 1), fill=ec)
            s.d.ellipse((ex - 2, ey - 6, ex + 2, ey - 2), fill=(255, 255, 255))
        if o.get('lashes'): s.d.line((ex - ew - 2, ey - ew - 2, ex - ew - 7, ey - ew - 7), fill=(30, 20, 20), width=3); s.d.line((ex + ew + 2, ey - ew - 2, ex + ew + 7, ey - ew - 7), fill=(30, 20, 20), width=3)
        bc = o.get('brow', shade(hair, 0.7)); by = ey - ew - 12 + o.get('browTilt', 0)
        s.d.line((ex - 12, by + (o.get('angry', 0)) * (1 if ex < (x0 + x1) / 2 else -1) * 0, ex + 12, by), fill=bc, width=5)
        if o.get('angry'):
            s.d.line((ex - 12, by - 4 if ex < (x0 + x1) / 2 else by + 4, ex + 12, by + 4 if ex < (x0 + x1) / 2 else by - 4), fill=bc, width=6)
    if o.get('blush', True):
        for ex in (x0 + 28, x1 - 28): s.d.ellipse((ex - 10, ey + 18, ex + 10, ey + 30), fill=shade(skin, 0.9) if not o.get('blushC') else o['blushC'])
    # нос
    nx = (x0 + x1) // 2; s.d.rectangle((nx - 5, ey + 4, nx + 5, ey + 20), fill=shade(skin, 0.86))
    # рот
    my = y0 + o.get('mouthY', 104)
    m = o.get('mouth', 'smile')
    if m == 'smile': s.d.arc((nx - 18, my - 16, nx + 18, my + 8), 20, 160, fill=(150, 50, 50), width=5)
    elif m == 'grin': s.d.chord((nx - 20, my - 12, nx + 20, my + 14), 0, 180, fill=(120, 30, 40)); s.d.rectangle((nx - 14, my, nx + 14, my + 4), fill=(255, 255, 255))
    elif m == 'flat': s.d.line((nx - 14, my, nx + 14, my), fill=(120, 50, 50), width=5)
    elif m == 'sad': s.d.arc((nx - 16, my - 2, nx + 16, my + 22), 200, 340, fill=(120, 50, 50), width=5)
    if o.get('beard'):
        bcol = o['beard']; L = o.get('beardLen', 1.0)
        s.d.polygon([(x0, y0 + 84), (x1, y0 + 84), (x1, y1), (nx + 30, y1), (nx, y1), (x0, y1)], fill=bcol)
        s.d.ellipse((nx - 30, my - 18, nx + 30, my + 6), fill=bcol)  # усы
        s.d.chord((nx - 14, my - 6, nx + 14, my + 12), 0, 180, fill=(110, 40, 40))
        for k in ('left', 'right'): s.band(HEAD[k], 0.7, 1, bcol)
        s.rect(HEAD['bottom'], bcol)
        for i in range(6): s.d.line((x0 + 10 + i * 22, y0 + 100, x0 + 14 + i * 22, y1 - 4), fill=shade(bcol, 0.88), width=3)
    if o.get('ribs'): pass
    if o.get('wrinkles'):
        for dy in (0, 8): s.d.line((x0 + 30, y0 + 30 + dy, x1 - 30, y0 + 30 + dy), fill=shade(skin, 0.85), width=2)

def body(s, o):
    sh = o['shirt']
    s.rect(TORSO['band'], sh, 0.18); s.rect(TORSO['top'], sh); s.rect(TORSO['bottom'], o.get('pants', sh))
    fx0, fy0, fx1, fy1 = TORSO['front']
    if o.get('collar'):  # вышитый ворот-косоворотка
        cc = o['collar']; s.d.rectangle((fx0 + 20, fy0, fx1 - 20, fy0 + 14), fill=cc)
        s.d.rectangle((fx0 + 70, fy0, fx0 + 84, fy0 + 60), fill=cc)
        for y in range(fy0 + 18, fy0 + 60, 12): s.d.ellipse((fx0 + 73, y, fx0 + 81, y + 8), fill=o.get('collar2', (255, 255, 255)))
        s.zigzag(fx0 + 20, fx1 - 20, fy0 + 7, o.get('collar2', (255, 255, 255)), 4, 2)
        x0b, y0b, x1b, y1b = TORSO['band']; s.d.rectangle((x0b, fy1 - 22, x1b, fy1 - 14), fill=cc)
    if o.get('belt'):
        x0b, y0b, x1b, y1b = TORSO['band']; s.d.rectangle((x0b, fy0 + 92, x1b, fy0 + 104), fill=o['belt'])
        s.d.rectangle((fx0 + 20, fy0 + 104, fx0 + 28, fy0 + 134), fill=o['belt']); s.d.rectangle((fx0 + 32, fy0 + 104, fx0 + 40, fy0 + 128), fill=o['belt'])
    if o.get('sarafan'):  # сарафан: лиф с бретелями и золотым позументом
        sf = o['sarafan']; x0b, y0b, x1b, y1b = TORSO['band']
        s.d.rectangle((x0b, fy0 + 40, x1b, y1b), fill=sf)
        for bx in (fx0 + 26, fx1 - 40): s.d.rectangle((bx, fy0, bx + 14, fy0 + 40), fill=sf)
        s.d.rectangle((x0b, fy0 + 40, x1b, fy0 + 50), fill=o.get('trim', (240, 200, 60)))
        s.d.rectangle((fx0 + 56, fy0 + 50, fx0 + 72, fy1), fill=o.get('trim', (240, 200, 60)))
        for y in range(fy0 + 58, fy1, 16): s.d.ellipse((fx0 + 59, y, fx0 + 69, y + 10), fill=(255, 255, 255))
    if o.get('coat'):  # шуба с меховой оторочкой
        fur = o['fur']; x0b, y0b, x1b, y1b = TORSO['band']
        s.d.rectangle((fx0 + 52, fy0, fx0 + 76, fy1), fill=fur); s.d.rectangle((x0b, fy1 - 20, x1b, fy1), fill=fur); s.d.rectangle((fx0, fy0, fx1, fy0 + 16), fill=fur)
        s.dots((fx0 + 52, fy0, fx0 + 76, fy1), shade(fur, 0.9), 20, 3, 5)
    if o.get('snow'):
        x0b, y0b, x1b, y1b = TORSO['band']; rnd = random.Random(7)
        for _ in range(14):
            x, y = rnd.randint(x0b + 10, x1b - 10), rnd.randint(y0b + 20, y1b - 30)
            for a in range(3): s.d.line((x - 6, y, x + 6, y), fill=(255, 255, 255), width=2); s.d.line((x, y - 6, x, y + 6), fill=(255, 255, 255), width=2); s.d.line((x - 4, y - 4, x + 4, y + 4), fill=(255, 255, 255), width=2)
    if o.get('ribs'):
        x0b, y0b, x1b, y1b = TORSO['band']
        s.d.rectangle((fx0 + 58, fy0 + 10, fx0 + 70, fy1 - 20), fill=o['ribs'])
        for i in range(5):
            y = fy0 + 18 + i * 18; s.d.line((fx0 + 20, y + 6, fx0 + 58, y), fill=o['ribs'], width=6); s.d.line((fx0 + 70, y, fx1 - 20, y + 6), fill=o['ribs'], width=6)
    if o.get('patches'):
        for (px, py, c) in o['patches']: s.d.rectangle((px, py, px + 26, py + 22), fill=c); s.d.rectangle((px, py, px + 26, py + 22), outline=shade(c, 0.7), width=2)
    if o.get('feathers'):
        x0b, y0b, x1b, y1b = TORSO['band']
        for row in range(4):
            for i in range(0, 448, 22): y = y0b + 20 + row * 26 + (i // 22 % 2) * 6; s.d.arc((x0b + i, y, x0b + i + 22, y + 22), 0, 180, fill=o['feathers'], width=3)
    if o.get('moss'):
        s.dots(TORSO['band'], o['moss'], 60, 6, 9); s.dots(TORSO['band'], shade(o['moss'], 0.7), 40, 4, 10)
    if o.get('back'): s.dots(TORSO['back'], o['back'], 16, 6, 11)
    # руки
    for A in ARMS:
        sl = o.get('sleeve', sh); s.rect(A['top'], sl); s.rect(A['bot'], o['skin'])
        s.rect(A['band'], sl, 0.12); s.band(A['band'], 0.82, 1, o['skin'])
        if o.get('cuff'): s.band(A['band'], 0.7, 0.82, o['cuff'])
        if o.get('sleeveDots'): s.dots(A['band'], o['sleeveDots'], 10, 4, 12)
    # ноги
    for Lg in LEGS:
        p = o.get('pants', sh); s.rect(Lg['top'], p); s.rect(Lg['bot'], o.get('boots', (80, 50, 30)))
        s.rect(Lg['band'], p, 0.12); s.band(Lg['band'], o.get('bootH', 0.72), 1, o.get('boots', (80, 50, 30)))
        if o.get('lapti'):
            for k in range(4): s.band(Lg['band'], 0.74 + k * 0.065, 0.76 + k * 0.065, shade(o['boots'], 0.75))
        if o.get('hem'): s.band(Lg['band'], o.get('bootH', 0.72) - 0.08, o.get('bootH', 0.72), o['hem'])
        if o.get('legDots'): s.dots(Lg['band'], o['legDots'], 8, 4, 13)

SK = C('f2c49b')
CH = {
 'ivan':       dict(skin=SK, hair=C('e8b84a'), shirt=C('d23a2c'), collar=C('f4e7c8'), collar2=C('2c5aa0'), belt=C('f2c033'), pants=C('34508c'), boots=C('6b3f22'), mouth='grin'),
 'ivanushka':  dict(skin=SK, hair=C('f0cf6a'), shirt=C('f4efe2'), collar=C('d23a2c'), belt=C('d23a2c'), pants=C('7a8fb8'), boots=C('c9a36a'), lapti=True, mouth='smile', eyeW=10),
 'ivan_false': dict(skin=C('b9b9b9'), hair=C('8c8c8c'), shirt=C('8a8a8a'), collar=C('a8a8a8'), belt=C('9a9a9a'), pants=C('6f6f6f'), boots=C('555555'), mouth='flat', eyeC=(90, 90, 90), blush=False),
 'vasilisa':   dict(skin=SK, hair=C('5a3420'), hairLen=0.9, shirt=C('f6f1e6'), sleeve=C('f6f1e6'), cuff=C('d23a2c'), sarafan=C('2f5fb3'), trim=C('f2c033'), pants=C('2f5fb3'), boots=C('a03030'), bootH=0.9, hem=C('f2c033'), lashes=True, mouth='smile', eyeC=(40, 80, 140), fringe=0.16),
 'finist':     dict(skin=SK, hair=C('3b2a1e'), shirt=C('c58a4a'), feathers=C('7a4f26'), belt=C('3b2a1e'), sleeve=C('a87038'), pants=C('5a6a7a'), boots=C('3b2a1e'), mouth='smile', eyeC=(150, 100, 30), brow=C('2a1a10')),
 'ded':        dict(skin=SK, hair=C('e9e9e9'), shirt=C('e8dcc2'), collar=C('b03a2e'), belt=C('b03a2e'), pants=C('7d7d86'), boots=C('d0ab6c'), lapti=True, beard=C('f2f2f2'), mouth='smile', wrinkles=True),
 'yaga':       dict(skin=C('e2c3a0'), hair=C('b8b8b0'), scarf=C('b8322a'), shirt=C('5a4a3a'), patches=[(110, 820, C('6a8a3a')), (170, 870, C('a06a3a')), (20, 840, C('3a5a8a')), (340, 830, C('8a3a5a'))], sleeve=C('4a3a2e'), pants=C('3a2e24'), boots=C('2a2018'), bootH=0.85, mouth='grin', wrinkles=True, eyeC=(60, 110, 50)),
 'koschei':    dict(skin=C('c8d0c0'), hair=C('1a1420'), hairLen=0.6, shirt=C('231a2e'), ribs=C('d8d8cc'), sleeve=C('2e2240'), pants=C('1a1420'), boots=C('0e0a12'), mouth='flat', glowEyes=(180, 120, 255), blush=False, angry=True, belt=C('6a3aa0'), brow=C('100810')),
 'morozko':    dict(skin=SK, hair=C('f4f8ff'), shirt=C('3a72c8'), coat=True, fur=C('f4f8ff'), snow=True, sleeve=C('3a72c8'), cuff=C('f4f8ff'), pants=C('3a72c8'), boots=C('f4f8ff'), bootH=0.86, beard=C('f4f8ff'), mouth='smile', eyeC=(60, 110, 190), blushC=C('f0a0a8')),
 'snegurochka':dict(skin=C('f8dcc8'), hair=C('f2dc8a'), hairLen=0.9, shirt=C('9fd2f2'), coat=True, fur=C('ffffff'), snow=True, sleeve=C('9fd2f2'), cuff=C('ffffff'), pants=C('9fd2f2'), boots=C('ffffff'), bootH=0.9, lashes=True, mouth='smile', eyeC=(70, 140, 200), blushC=C('f4b0c0'), fringe=0.16),
 'leshy':      dict(skin=C('8a9a5a'), hair=C('3e6a2a'), hairLen=0.8, shirt=C('5a4a2a'), moss=C('4f7a2e'), sleeve=C('4a3a20'), pants=C('3e3220'), boots=C('2a2014'), beard=C('4f7a2e'), glowEyes=(255, 220, 60), blush=False, mouth='grin'),
 'alyonushka': dict(skin=SK, hair=C('8a5a2e'), hairLen=0.9, shirt=C('f6f1e6'), sleeve=C('f6f1e6'), cuff=C('e05a7a'), sarafan=C('d83a5a'), trim=C('ffffff'), pants=C('d83a5a'), boots=C('8a4a2a'), bootH=0.9, hem=C('ffffff'), lashes=True, mouth='sad', eyeC=(90, 60, 40), fringe=0.16),
 'ilya':       dict(skin=SK, hair=C('7a4a22'), shirt=C('9aa4ae'), sleeve=C('8a949e'), collar=C('c8302a'), collar2=C('f2c033'), belt=C('c8302a'), pants=C('3a4a6a'), boots=C('8a2a20'), bootH=0.82, beard=C('7a4a22'), beardLen=1.0, mouth='smile', eyeC=(60, 90, 140), feathers=C('b8c0c8')),
 'sadko':      dict(skin=SK, hair=C('c88a3a'), shirt=C('2a6ab0'), collar=C('f2c033'), collar2=C('c8302a'), belt=C('f2c033'), sleeve=C('2a6ab0'), cuff=C('f2c033'), pants=C('8a2a3a'), boots=C('c8a040'), mouth='grin', eyeC=(50, 110, 160)),
 'seaking':    dict(skin=C('bfe0d8'), hair=C('dff4f0'), hairLen=0.8, shirt=C('1f7a8a'), coat=True, fur=C('e8f0e0'), sleeve=C('1f6a7a'), cuff=C('f2c033'), pants=C('16505c'), boots=C('0f3a44'), bootH=0.86, beard=C('cfeee6'), mouth='smile', eyeC=(30, 120, 130), blushC=C('9fd8d0')),
 'starik':     dict(skin=SK, hair=C('d8d8d0'), shirt=C('c8c0a8'), patches=[(110, 820, C('9a8a6a')), (330, 840, C('7a8a9a'))], belt=C('6a5a3a'), pants=C('6a6a72'), boots=C('c9a36a'), lapti=True, beard=C('ececec'), mouth='smile', wrinkles=True),
 'staruha':    dict(skin=SK, hair=C('c8c8c0'), scarf=C('5a7a3a'), shirt=C('8a5a3a'), sleeve=C('7a4a2e'), sarafan=C('6a3a5a'), trim=C('d8b060'), pants=C('6a3a5a'), boots=C('3a2a1a'), bootH=0.9, mouth='flat', wrinkles=True, angry=True),
 'tsarevna':   dict(skin=C('f8dcc8'), hair=C('3a2a1a'), hairLen=0.9, shirt=C('f6f1e6'), sleeve=C('f6f1e6'), cuff=C('3aa04a'), sarafan=C('2e8a4a'), trim=C('f2c033'), pants=C('2e8a4a'), boots=C('c8a040'), bootH=0.9, hem=C('f2c033'), lashes=True, mouth='smile', eyeC=(40, 120, 60), fringe=0.16),
 'elena':      dict(skin=C('f8dcc8'), hair=C('f2c860'), hairLen=0.9, shirt=C('fff6f0'), sleeve=C('fff6f0'), cuff=C('e86a9a'), sarafan=C('e86a9a'), trim=C('ffffff'), pants=C('e86a9a'), boots=C('c8a040'), bootH=0.9, hem=C('f2c033'), lashes=True, mouth='smile', eyeC=(60, 100, 170), fringe=0.16),
}
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for k, o in CH.items():
        s = Skin(); body(s, o); face(s, o); s.save(k)
    print('ok', sorted(os.listdir(OUT)))
