import numpy as np, wave, os
SR = 44100
rng = np.random.default_rng(7)
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'sfx')  # sons curtos sintetizados (sem direitos autorais)
os.makedirs(out, exist_ok=True)

def t_(d): return np.arange(int(SR*d)) / SR
def save(name, x, peak=0.85):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    # tiny fade to avoid clicks
    n = min(len(x)//2, 80)
    x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    with wave.open(os.path.join(out, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def swept_noise(d, f0, f1, shape='bell', q=0.15):
    n = int(SR*d); t = np.arange(n)/n
    noise = rng.standard_normal(n)
    f = f0 * (f1/f0) ** t
    a = np.clip(2*np.pi*f/SR, 0, 0.99)
    # two cascaded one-pole low-pass + subtract slower low-pass => band-ish
    y = np.zeros(n); z = 0.0
    for i in range(n):
        z += a[i]*(noise[i]-z); y[i] = z
    y2 = np.zeros(n); z = 0.0
    for i in range(n):
        z += a[i]*0.35*(y[i]-z); y2[i] = z
    band = y - y2*0.9
    env = np.sin(np.pi*np.clip(t, 0, 1))**1.6 if shape == 'bell' else (t**2)
    return band*env

save('whoosh_in', swept_noise(0.45, 300, 5500))
save('whoosh_out', swept_noise(0.40, 5000, 280))
save('swipe', swept_noise(0.22, 1500, 7000), 0.7)

t = t_(0.12); save('pop', np.sin(2*np.pi*(250+450*np.exp(-t*45))*t)*np.exp(-t*38))
t = t_(0.05); save('tick', (np.sin(2*np.pi*2400*t)+0.4*rng.standard_normal(len(t)))*np.exp(-t*140), 0.6)
t = t_(0.03); save('blip', np.sin(2*np.pi*1500*t)*np.exp(-t*90), 0.5)
t = t_(1.1)
save('ding', (np.sin(2*np.pi*1318*t)+0.5*np.sin(2*np.pi*1976*t)+0.25*np.sin(2*np.pi*2637*t))*np.exp(-t*4.5), 0.7)
t1 = t_(0.28)
coin = np.zeros(len(t1))
a = np.sin(2*np.pi*988*t1)*np.exp(-t1*14); coin += a
b = np.zeros(len(t1)); k = int(0.07*SR); tb = t1[:len(t1)-k]
b[k:] = np.sin(2*np.pi*1319*tb)*np.exp(-tb*9); coin += b
save('coin', coin, 0.7)
t = t_(0.6)
thud = np.sin(2*np.pi*(45+90*np.exp(-t*18))*t)*np.exp(-t*7)
nz = rng.standard_normal(len(t)); lp = np.zeros(len(t)); z = 0
for i in range(len(t)): z += 0.06*(nz[i]-z); lp[i] = z
save('thud', thud + lp*np.exp(-t*30)*0.8)
t = t_(0.4)
buzz = (np.sign(np.sin(2*np.pi*110*t)) + np.sign(np.sin(2*np.pi*117*t)))*np.exp(-t*3.5)*(t < 0.34)
save('buzz', buzz, 0.5)
t = t_(1.6); n = len(t); u = t/1.6
freq = 200*(5**u)
tone = np.sin(2*np.pi*np.cumsum(freq)/SR)*0.5
save('riser', (swept_noise(1.6, 300, 6000, shape='ramp')*1.0 + tone*u**2), 0.7)
notes = [523.25, 659.25, 783.99]; x = np.zeros(int(SR*0.8))
for i, f in enumerate(notes):
    tt = t_(0.8 - i*0.12); s = np.sin(2*np.pi*f*tt)*np.exp(-tt*5); x[int(i*0.12*SR):] += s
save('success', x, 0.65)
print(sorted(os.listdir(out)))
