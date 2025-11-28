import pandas as pd
import glob

files = glob.glob("*.csv")  # matches all CSV files in folder
df = pd.concat([pd.read_csv(f) for f in files], ignore_index=True)
df.to_csv("combined.csv", index=False)

print("CSV files combined successfully!")
