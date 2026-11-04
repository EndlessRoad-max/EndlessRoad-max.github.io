"""Offline asset preparation: Pillow, NumPy and fontTools. No runtime dependencies.
Usage: python scripts/build-motto-lettering.py path/to/GreatVibes-Regular.ttf
The skeleton guides an ink mask over the original filled glyph, preserving contrast.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

source = Path(sys.argv[1])
font = TTFont(source)
glyphset = font.getGlyphSet()
cmap = font.getBestCmap()
units = font['head'].unitsPerEm
size = 180
render_font = ImageFont.truetype(str(source), size)
sentence = 'Still curious. Still moving forward.'

def skeleton(image):
    a = image.copy()
    while True:
        before = a.sum()
        for phase in (0, 1):
            p = np.pad(a, 1)
            ns = [p[:-2,1:-1],p[:-2,2:],p[1:-1,2:],p[2:,2:],p[2:,1:-1],p[2:,:-2],p[1:-1,:-2],p[:-2,:-2]]
            count = sum(n.astype(int) for n in ns)
            transitions = sum((~ns[i] & ns[(i+1)%8]).astype(int) for i in range(8))
            if phase == 0:
                keep = ~(ns[0]&ns[2]&ns[4]) & ~(ns[2]&ns[4]&ns[6])
            else:
                keep = ~(ns[0]&ns[2]&ns[6]) & ~(ns[0]&ns[4]&ns[6])
            a &= ~(a & (count>=2) & (count<=6) & (transitions==1) & keep)
        if a.sum() == before:
            return a

def traces(a):
    pixels = set(map(tuple, np.argwhere(a)))
    neighbors = {p: sorted(q for dy,dx in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]
                            if (q:=(p[0]+dy,p[1]+dx)) in pixels
                            and not (dy and dx and ((p[0],p[1]+dx) in pixels or (p[0]+dy,p[1]) in pixels))) for p in pixels}
    used=set(); paths=[]
    def edge(a,b):return tuple(sorted((a,b)))
    for start in sorted(pixels, key=lambda p:(len(neighbors[p])==2,p)):
        if not neighbors[start]:paths.append([start,start]);continue
        for nxt in neighbors[start]:
            if edge(start,nxt) in used:continue
            chain=[start,nxt];used.add(edge(start,nxt))
            while len(neighbors[nxt])==2:
                candidates=[p for p in neighbors[nxt] if edge(nxt,p) not in used]
                if not candidates:break
                end=candidates[0];used.add(edge(nxt,end));chain.append(end);nxt=end
            paths.append(chain)
    ordered=[]
    # Prefer substantial strokes, and dot the i / punctuation after the main body.
    for group in ([p for p in paths if len(p)>3],[p for p in paths if len(p)<=3]):
        last = min((p[0] for p in group),default=(0,0))
        while group:
            candidates=[(sum((endpoint[k]-last[k])**2 for k in (0,1)),i,reverse)
                        for i,p in enumerate(group) for reverse,endpoint in [(False,p[0]),(True,p[-1])]]
            _,i,reverse=min(candidates);p=group.pop(i)
            if reverse:p=p[::-1]
            ordered.append(p);last=p[-1]
    return ordered

glyphs={}
for char in sorted(set(sentence)-{' '}):
    name=cmap[ord(char)]
    pen=SVGPathPen(glyphset)
    glyphset[name].draw(TransformPen(pen,(1,0,0,-1,0,0)))
    bbox=render_font.getbbox(char,anchor='ls')
    left,top,right,bottom=bbox
    img=Image.new('L',(right-left+16,bottom-top+16))
    ImageDraw.Draw(img).text((8-left,8-top),char,font=render_font,anchor='ls',fill=255)
    binary=np.array(img)>80
    thin=skeleton(binary)
    # Width large enough to reveal every filled contour, with round mask caps.
    dilated=thin.copy(); radius=0
    while np.any(binary & ~dilated):
        p=np.pad(dilated,1)
        dilated=np.logical_or.reduce([p[y:y+thin.shape[0],x:x+thin.shape[1]] for y in range(3) for x in range(3)])
        radius+=1
    paths=[]
    for trace in traces(thin):
        pts=[(round((x+left-8)*units/size,1),round((y+top-8)*units/size,1)) for y,x in trace]
        # Keep all turns but omit collinear raster steps.
        reduced=[pts[0]]
        for i in range(1,len(pts)-1):
            a,b,c=pts[i-1:i+2]
            if abs((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]))>0.1:reduced.append(b)
        reduced.append(pts[-1])
        paths.append(' '.join(('M' if i==0 else 'L')+f'{x} {y}' for i,(x,y) in enumerate(reduced)))
    glyphs[char]={'outline':pen.getCommands(),'paths':paths,'maskWidth':round((radius*2.9+3)*units/size,1),'advance':font['hmtx'][name][0]}

lines=[]
for text in ['Still curious.','Still moving forward.']:
    x=0; letters=[]
    for char in text:
        if char==' ':x+=font['hmtx'][cmap[32]][0];continue
        letters.append({'char':char,'x':x});x+=glyphs[char]['advance']
    lines.append({'text':text,'width':x,'letters':letters})
out=Path('src/assets/handwriting/great-vibes.json')
out.write_text(json.dumps({'units':units,'glyphs':glyphs,'lines':lines},ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(f'{len(glyphs)} glyphs, {sum(len(g["paths"]) for g in glyphs.values())} pen segments, {out.stat().st_size} bytes')
