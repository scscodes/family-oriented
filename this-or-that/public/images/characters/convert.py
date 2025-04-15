from pathlib import Path

rename_map = {
    "ANewViewforThomaspromo4.webp": "show_thomas_harold-percy-thomas_01.webp",
}

base_dir = Path(__file__).parent.resolve()

for old_name, new_name in rename_map.items():
    old_path = base_dir / old_name
    new_path = base_dir / new_name
    if old_path.exists():
        old_path.rename(new_path)
        print(f"Renamed: {old_name} -> {new_name}")
    else:
        print(f"Missing: {old_name}")
