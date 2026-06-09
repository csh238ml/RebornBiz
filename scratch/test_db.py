import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.database import init_db

print("Running DB initialization...")
init_db()
print("DB initialized.")
