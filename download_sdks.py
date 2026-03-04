import urllib.request
import os
import sys

vendor_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vendor')
os.makedirs(vendor_dir, exist_ok=True)

files = [
    {
        'url': 'https://cdn.jsdelivr.net/npm/algosdk@2.7.0/dist/browser/algosdk.min.js',
        'dest': os.path.join(vendor_dir, 'algosdk.min.js'),
        'name': 'Algorand SDK'
    },
    {
        'url': 'https://cdn.jsdelivr.net/npm/@perawallet/connect@1.3.4/dist/umd/index.js',
        'dest': os.path.join(vendor_dir, 'pera-wallet.js'),
        'name': 'Pera Wallet SDK'
    }
]

print("=" * 50)
print("  Campus Wallet - SDK Downloader (Python)")
print("=" * 50)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

for f in files:
    if os.path.exists(f['dest']) and os.path.getsize(f['dest']) > 10000:
        size_kb = os.path.getsize(f['dest']) / 1024
        print(f"\n✅ {f['name']} already exists ({size_kb:.0f} KB) — skipping")
        continue

    print(f"\n⬇  Downloading {f['name']}...")
    try:
        req = urllib.request.Request(f['url'], headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read()
        with open(f['dest'], 'wb') as out:
            out.write(content)
        size_kb = os.path.getsize(f['dest']) / 1024
        print(f"✅ {f['name']} saved ({size_kb:.0f} KB)")
    except Exception as e:
        print(f"❌ Failed: {e}")
        sys.exit(1)

print("\n" + "=" * 50)
print("  ✅ All SDKs ready in vendor/ folder!")
print("  Run: python -m http.server 3000")
print("  Open: http://localhost:3000/dashboard.html")
print("=" * 50)