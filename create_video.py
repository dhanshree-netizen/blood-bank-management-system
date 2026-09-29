from PIL import Image, ImageDraw, ImageFont
import imageio.v2 as imageio
import numpy as np
from pathlib import Path

out = Path('videos/blood-donation.mp4')
out.parent.mkdir(exist_ok=True)

W, H = 640, 360
frames = []
font = ImageFont.load_default()

for i in range(90):
    img = Image.new('RGB', (W, H), (255, 248, 248))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        r = 255 - int((y / H) * 20)
        g = 248 - int((y / H) * 10)
        b = 248 - int((y / H) * 10)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    heart_x = 120 + (i % 20) * 2
    draw.ellipse([heart_x, 110, heart_x + 90, 190], fill=(211, 47, 47))
    draw.ellipse([heart_x + 40, 110, heart_x + 130, 190], fill=(211, 47, 47))
    draw.polygon([(heart_x + 10, 135), (heart_x + 65, 205), (heart_x + 120, 135)], fill=(211, 47, 47))
    draw.ellipse([250, 112, 440, 232], fill=(255, 255, 255), outline=(211, 47, 47), width=4)
    draw.text((275, 145), 'Donate Blood', fill=(211, 47, 47), font=font)
    draw.text((235, 270), 'Save Lives Together', fill=(51, 51, 51), font=font)
    frames.append(np.array(img))

imageio.mimsave(str(out), frames, fps=12, codec='libx264', bitrate='1800k')
print(out.resolve())
