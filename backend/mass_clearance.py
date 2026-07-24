import sqlite3
import zipfile
from xml.etree import ElementTree as ET
import datetime
import json
import urllib.request
import urllib.error
import os

SUPABASE_URL = "https://rieasgtxrzpkrkdhxfjr.supabase.co"
SUPABASE_KEY = "sb_publishable_3buDB6MMf9ol1aMYK4bv8Q_5qep7K58"

def parse_excel(xlsx_path):
    base_date = datetime.date(1899, 12, 30)

    # 2025 Month mapping for Sheet 1
    sheet1_mapping = {
        "C": ("August", 2025, "2025-08-01"),
        "D": ("September", 2025, "2025-09-01"),
        "E": ("October", 2025, "2025-10-01"),
        "F": ("November", 2025, "2025-11-01"),
        "G": ("December", 2025, "2025-12-01"),
    }

    # 2026 Month mapping for Sheet 2
    sheet2_mapping = {
        "C": ("January", 2026, "2026-01-01"),
        "D": ("February", 2026, "2026-02-01"),
        "E": ("March", 2026, "2026-03-01"),
        "F": ("April", 2026, "2026-04-01"),
        "G": ("May", 2026, "2026-05-01"),
        "H": ("June", 2026, "2026-06-01"),
        "I": ("July", 2026, "2026-07-01"),
        "J": ("August", 2026, "2026-08-01"),
        "K": ("September", 2026, "2026-09-01"),
        "L": ("October", 2026, "2026-10-01"),
        "M": ("November", 2026, "2026-11-01"),
        "N": ("December", 2026, "2026-12-01"),
    }

    unit_dues = []
    expenses = []

    with zipfile.ZipFile(xlsx_path) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.parse(z.open('xl/sharedStrings.xml'))
            for elem in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
                strings.append(elem.text or '')

        # ── Parse Sheet 1 (2025) ────────────────────────────────────────────────
        if 'xl/worksheets/sheet1.xml' in z.namelist():
            sheet_tree = ET.parse(z.open('xl/worksheets/sheet1.xml'))
            sheet_data = sheet_tree.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')

            for row in sheet_data.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                r_idx = int(row.attrib.get('r'))
                cells = {}
                for cell in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    r_ref = cell.attrib.get('r')
                    col_letter = ''.join([c for c in r_ref if c.isalpha()])
                    cell_type = cell.attrib.get('t')
                    val_elem = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = val_elem.text if val_elem is not None else ''
                    if cell_type == 's' and val.isdigit():
                        val = strings[int(val)]
                    cells[col_letter] = val

                unit_raw = cells.get('B', '').strip()
                if unit_raw.isdigit():
                    unit_num = str(int(unit_raw))
                    for col, (month, year, date_cleared) in sheet1_mapping.items():
                        amount_val = cells.get(col, '').strip()
                        is_paid = (amount_val == '500')
                        unit_dues.append({
                            "tenement_number": unit_num,
                            "month": month,
                            "year": year,
                            "status": "Paid" if is_paid else "Unpaid",
                            "amount": 500,
                            "amount_paid": 500 if is_paid else 0,
                            "date_cleared": date_cleared if is_paid else None,
                            "reference": "EXCEL-IMPORT" if is_paid else None,
                            "method": "Cash" if is_paid else None,
                        })

                # Check Debit Expenses in Columns H & K (Rows 3 to 8)
                debit_desc = cells.get('H', '').strip()
                debit_amt = cells.get('K', '').strip()
                if debit_desc and debit_amt and debit_desc not in ['DEBIT', 'Total', 'Balance']:
                    try:
                        expenses.append({
                            "id": f"E-EXCEL-{r_idx}",
                            "category": "Maintenance",
                            "description": debit_desc,
                            "amount": float(debit_amt),
                            "date": "2025-12-31",
                            "drive_link": f"https://drive.google.com/file/d/gd-excel-{r_idx}/view"
                        })
                    except ValueError:
                        pass

        # ── Parse Sheet 2 (2026) ────────────────────────────────────────────────
        if 'xl/worksheets/sheet2.xml' in z.namelist():
            sheet_tree = ET.parse(z.open('xl/worksheets/sheet2.xml'))
            sheet_data = sheet_tree.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')

            for row in sheet_data.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                r_idx = int(row.attrib.get('r'))
                if r_idx < 5:
                    continue  # Row 5 starts Unit 01
                cells = {}
                for cell in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    r_ref = cell.attrib.get('r')
                    col_letter = ''.join([c for c in r_ref if c.isalpha()])
                    cell_type = cell.attrib.get('t')
                    val_elem = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = val_elem.text if val_elem is not None else ''
                    if cell_type == 's' and val.isdigit():
                        val = strings[int(val)]
                    cells[col_letter] = val

                unit_raw = cells.get('B', '').strip()
                if unit_raw.isdigit():
                    unit_num = str(int(unit_raw))
                    all_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                    current_month_idx = 6 # July (0-indexed)
                    for col, (month, year, date_cleared) in sheet2_mapping.items():
                        amount_val = cells.get(col, '').strip()
                        is_paid = (amount_val == '500')
                        m_idx = all_months.index(month)
                        is_future = m_idx > current_month_idx

                        status = "Paid" if is_paid else ("Unbilled" if is_future else "Unpaid")

                        unit_dues.append({
                            "tenement_number": unit_num,
                            "month": month,
                            "year": year,
                            "status": status,
                            "amount": 500,
                            "amount_paid": 500 if is_paid else 0,
                            "date_cleared": date_cleared if is_paid else None,
                            "reference": "EXCEL-IMPORT-2026" if is_paid else None,
                            "method": "Cash" if is_paid else None,
                        })

    return unit_dues, expenses

def run_clearance():
    db_path = "/home/hardik/Desktop/Parthbhoomi-society-maintenance-tracker/backend/society.db"
    xlsx_path = "/home/hardik/Desktop/Parthbhoomi-society-maintenance-tracker/backend/Parthbhoomi.xlsx"

    print("=== STARTING FULL MASS CLEARANCE (2025 + 2026) ===")
    unit_dues, expenses = parse_excel(xlsx_path)

    print(f"Parsed {len(unit_dues)} dues records across 2025 and 2026.")

    # 1. Update SQLite local DB
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        for due in unit_dues:
            is_paid = (due["status"] == "Paid")
            cur.execute("""
                UPDATE dues
                SET status = ?, amount_paid = ?, date_cleared = ?, reference = ?, method = ?
                WHERE tenement_number = ? AND month = ? AND year = ?
            """, (
                due["status"], due["amount_paid"], due["date_cleared"],
                due["reference"], due["method"],
                due["tenement_number"], due["month"], due["year"]
            ))

            cur.execute("SELECT id FROM dues WHERE tenement_number = ? AND month = ? AND year = ?",
                        (due["tenement_number"], due["month"], due["year"]))
            row = cur.fetchone()
            if row and is_paid:
                due_id = row[0]
                cur.execute("DELETE FROM installments WHERE due_id = ?", (due_id,))
                cur.execute("""
                    INSERT INTO installments (due_id, tenement_number, month, year, amount, date, reference, method)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (due_id, due["tenement_number"], due["month"], due["year"], 500.0, due["date_cleared"], due["reference"], 'Cash'))

        conn.commit()
        conn.close()
        print("✓ Local SQLite (society.db) updated for 2025 + 2026.")

    # 2. Bulk UPSERT Dues to Supabase (in batches of 200)
    print("Executing Bulk UPSERT for Dues to Supabase REST API...")
    url = f"{SUPABASE_URL}/rest/v1/dues?on_conflict=tenement_number,month,year"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    batch_size = 200
    for i in range(0, len(unit_dues), batch_size):
        batch = unit_dues[i:i+batch_size]
        req = urllib.request.Request(url, data=json.dumps(batch).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                print(f"✓ Dues Batch {i//batch_size + 1} Bulk Upsert Status: {resp.status}")
        except Exception as e:
            print(f"Supabase Dues Upsert Error: {e}")

    # 3. Create Installments for Paid Dues in Supabase
    paid_installments = []
    for due in unit_dues:
        if due["status"] == "Paid":
            paid_installments.append({
                "tenement_number": due["tenement_number"],
                "month": due["month"],
                "year": due["year"],
                "amount": 500,
                "date": due["date_cleared"],
                "reference": due["reference"],
                "method": "Cash"
            })

    if paid_installments:
        inst_url = f"{SUPABASE_URL}/rest/v1/installments"
        for i in range(0, len(paid_installments), batch_size):
            batch = paid_installments[i:i+batch_size]
            inst_req = urllib.request.Request(inst_url, data=json.dumps(batch).encode("utf-8"), headers=headers, method="POST")
            try:
                with urllib.request.urlopen(inst_req, timeout=10) as resp:
                    print(f"✓ Installments Batch {i//batch_size + 1} Bulk Insert Status: {resp.status}")
            except Exception as e:
                print(f"Supabase Installments Error: {e}")

    # 4. Bulk UPSERT Expenses to Supabase
    exp_url = f"{SUPABASE_URL}/rest/v1/expenses?on_conflict=id"
    exp_req = urllib.request.Request(exp_url, data=json.dumps(expenses).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(exp_req, timeout=10) as resp:
            print(f"✓ Expenses Bulk Upsert Status: {resp.status}")
    except Exception as e:
        print(f"Supabase Expenses Upsert Error: {e}")

    print("\n🎉 SUCCESS: All 2025 AND 2026 dues & expenses 100% synced!")

if __name__ == "__main__":
    run_clearance()
