"""Extract documented atlas frames without executing game JavaScript.
SpriteCollab artwork: CC BY-NC 4.0, full credits retained in public/credits.
"""
import json
import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw

source = Path(sys.argv[1]).resolve()
metadata = json.loads(Path('src/data/game/sprite-metadata.json').read_text(encoding='utf-8'))
pokemon = json.loads(Path('src/data/pokedex/pokemon.json').read_text(encoding='utf-8'))
icons = json.loads(Path('src/data/game/icon-definitions.json').read_text(encoding='utf-8'))
destination = Path('public/game')
(destination / 'pokemon').mkdir(parents=True, exist_ok=True)
(destination / 'icons').mkdir(parents=True, exist_ok=True)
(destination / 'moves').mkdir(parents=True, exist_ok=True)

def sprite_frame(sheet, geometry, index=0):
    w, h = geometry['w'], geometry['h']
    return sheet.crop((index*w, 0, (index+1)*w, h)).convert('RGBA')

def fit_frame(frame, bounds=None):
    box = bounds or frame.getbbox()
    canvas = Image.new('RGBA', (96, 96))
    if not box:
        return canvas
    art = frame.crop(box)
    scale = min(88/art.width, 88/art.height)
    if scale >= 1:
        scale = max(1, math.floor(scale))
    art = art.resize((max(1, round(art.width*scale)), max(1, round(art.height*scale))), Image.Resampling.NEAREST)
    canvas.alpha_composite(art, ((96-art.width)//2, 92-art.height))
    return canvas

manifest = []
for mon in ([] if '--icons-only' in sys.argv else pokemon):
    dex = str(mon['id'])
    meta = metadata[dex]
    record = {'id': mon['id'], 'normal': None, 'shiny': None, 'animations': []}
    for shiny in [False, True]:
        if shiny and not meta.get('sh'):
            continue
        folder = source / 'assets/pokemon' / dex
        if shiny:
            folder = folder / 's'
        idle = 'Idle' if (folder/'Idle.png').exists() else 'Walk'
        geometry = meta.get('sa', {}).get(idle, meta['a'][idle]) if shiny else meta['a'][idle]
        name = f'{dex}{"-shiny" if shiny else ""}.webp'
        with Image.open(folder/f'{idle}.png') as sheet:
            fit_frame(sprite_frame(sheet, geometry)).save(destination/'pokemon'/name, lossless=True)
        record['shiny' if shiny else 'normal'] = f'/game/pokemon/{name}'
        if not mon['hasDetailPage']:
            continue
        for animation, base_geometry in meta['a'].items():
            if animation not in ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint'] or not (folder/f'{animation}.png').exists():
                continue
            geometry = meta.get('sa', {}).get(animation, base_geometry) if shiny else base_geometry
            with Image.open(folder/f'{animation}.png') as sheet:
                raw_frames = [sprite_frame(sheet, geometry, i) for i in range(geometry['n'])]
            bounds = [f.getbbox() for f in raw_frames if f.getbbox()]
            box = (min(b[0] for b in bounds), min(b[1] for b in bounds), max(b[2] for b in bounds), max(b[3] for b in bounds))
            frames = [fit_frame(f, box) for f in raw_frames]
            durations = [max(1, round(d*1000/60)) for d in geometry['d']]
            if len(durations) != len(frames):
                raise ValueError(f'{dex}/{animation}: invalid frame durations')
            target = destination/'animations'/dex
            target.mkdir(parents=True, exist_ok=True)
            name = f'{animation.lower()}-{"shiny" if shiny else "normal"}.webp'
            still = name.replace('.webp', '-still.webp')
            frames[0].save(target/still, lossless=True)
            frames[0].save(target/name, save_all=True, append_images=frames[1:], duration=durations, loop=0, lossless=True)
            record['animations'].append({'name':animation,'shiny':shiny,'src':f'/game/animations/{dex}/{name}','still':f'/game/animations/{dex}/{still}','frames':len(frames),'durationMs':sum(durations)})
    manifest.append(record)

# Reconstruct the game's own palette/character-grid icons, not screenshots.
for name, definition in icons['ui'].items():
    rows = definition.get('rows')
    if not rows:
        continue
    pad = 1 if definition.get('outline') else 0
    image = Image.new('RGBA', (max(map(len,rows))+pad*2,len(rows)+pad*2))
    draw = ImageDraw.Draw(image)
    palette = {'k':'#1b1528', **definition.get('pal',{})}
    for y,row in enumerate(rows):
        for x,char in enumerate(row):
            if char not in '. ' and definition.get('outline'):
                for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]:
                    draw.point((x+pad+dx,y+pad+dy), fill='#1b1528')
    for y,row in enumerate(rows):
        for x,char in enumerate(row):
            if char not in '. ' and char in palette:
                draw.point((x+pad,y+pad), fill=palette[char])
    image.save(destination/'icons'/f'{name}.png')

colors = icons['colors']
def shade(color, factor):
    values = [min(255,max(0,math.floor(int(color[i:i+2],16)*factor+0.5))) for i in (1,3,5)]
    return '#' + ''.join(f'{v:02x}' for v in values)
def emblem(kind, family=None):
    image = Image.new('RGBA', (16,16))
    draw = ImageDraw.Draw(image)
    for y in range(16):
        for x in range(16):
            d = math.hypot(x-7.5,y-7.5)
            if d<=7.6:
                base = colors[kind]
                color = '#1b1528' if d>6.6 else shade(base,0.55) if (x-7.5)+(y-7.5)>6 else shade(base,1.3) if (x-7.5)+(y-7.5)<-6.5 else base
                draw.point((x,y),fill=color)
    for y,row in enumerate(icons['types'][kind]):
        for x,char in enumerate(row):
            if char=='#': draw.point((x+5,y+5),fill=shade(colors[kind],0.55))
    for y,row in enumerate(icons['types'][kind]):
        for x,char in enumerate(row):
            if char=='#': draw.point((x+4,y+4),fill='white')
    if family:
        draw.rectangle((9,9,15,15),fill='#1b1528')
        draw.rectangle((10,10,14,14),fill='#2b3454')
        for y,row in enumerate(icons['families'][family]):
            for x,char in enumerate(row):
                if char=='#': draw.point((x+10,y+10),fill='#ffd23f')
    return image

for kind in icons['types']:
    emblem(kind).save(destination/'icons'/f'type-{kind}.png')
moves = json.loads(Path('src/data/moves/moves.json').read_text(encoding='utf-8'))
for move in moves:
    emblem(move['type'].lower(),move['behavior']).save(destination/'moves'/f'{move["id"]}.png')
if '--icons-only' not in sys.argv:
    Path('src/data/game/assets.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Generated {len(moves)} move icons and the original game UI/type emblems.' if '--icons-only' in sys.argv else f'Extracted {len(manifest)} normal sprites, {sum(bool(m["shiny"]) for m in manifest)} shiny sprites, {sum(len(m["animations"]) for m in manifest)} animations, {len(icons["ui"])} UI definitions, 18 type icons and {len(moves)} move icons.')
