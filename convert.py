import csv
import json
import os

input_file = '/Users/roelly/.gemini/antigravity-ide/scratch/Monev Mockup/Dataset Revitalisasi Satuan Pendidikan Dit SMP - Compiled Data.csv'
output_file = '/Users/roelly/.gemini/antigravity-ide/scratch/Monev Mockup/src/data/schools.json'

data = []
with open(input_file, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # We only want SMP jenjang just to be safe, and clean up empty rows
        if row.get('Jenjang') == 'SMP':
            data.append(row)

# Ensure data dir exists
os.makedirs(os.path.dirname(output_file), exist_ok=True)

with open(output_file, mode='w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',', ':'))

print(f"Successfully converted {len(data)} rows to {output_file}")
