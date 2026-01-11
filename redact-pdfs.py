#!/usr/bin/env python3
"""
Redact children's information from legal documents using PyMuPDF
"""

import fitz  # PyMuPDF
import os
from pathlib import Path

# Directories
SOURCE_DIR = Path(r"C:\Users\swillis\Documents\_Organized\01_Legal\Bar Complaint")
DEST_DIR = Path(r"C:\Users\swillis\Downloads\SAFESAPCR\public-records\timeline")

# Terms to redact (case-insensitive search)
REDACT_TERMS = [
    "JOHN JESUS WILLIS",
    "John Jesus Willis",
    "NICOLE ELIZABETH WILLIS",
    "Nicole Elizabeth Willis",
    "JOHN WILLIS",
    "John Willis",
    "NICOLE WILLIS",
    "Nicole Willis",
    "09/27/2012",
    "9/27/2012",
    "09/28/2012",
    "09/28/2014",
    "9/28/2014",
]

# Files to process
FILES = [
    ("2024-03-19 - 202417675 - SAPCR PETITION.pdf", "2024-03-19-sapcr-petition.pdf"),
    ("2024-04-12 - 250447901010 - CHARGING INSTRUMENT IN ASSAULT.PDF", "2024-04-12-assault-charge.pdf"),
    ("2024-04-28 - Email to Laci Rendon 01 - Scott A. Willis - Outlook.pdf", "2024-04-28-email-to-laci-01.pdf"),
    ("2024-04-30 - Email to Laci Rendon 02 - Scott A. Willis - Outlook.pdf", "2024-04-30-email-to-laci-02.pdf"),
    ("2024-05-09 - Email to Laci Rendon 03 - Scott A. Willis - Outlook.pdf", "2024-05-09-email-to-laci-03.pdf"),
    ("2024-06-04 - DISMISSED FOR WANT OF PROSECUTION.PDF", "2024-06-04-dismissed-want-of-prosecution.pdf"),
    ("2024-07-19 - 202517675 -SAPCR ATTORNEYS CERTIFICATE OF LKA.pdf", "2024-07-19-fraudulent-certificate-lka.pdf"),
    ("2024-08-20 - 202417675 - DEFAULT SAPCR JUDGMENT SIGNED.pdf", "2024-08-20-default-judgment-signed.pdf"),
    ("2024-08-23 - REVIEW OF BETTY P ON RENDONLEAGL.COM .pdf", "2024-08-23-betty-p-review.pdf"),
    ("2025-10-16 - 202417675 - First Disclosure of SAPCR Default Judgement.PDF", "2025-10-16-first-disclosure.pdf"),
    ("2025-10-31 - 250447901010 - DISPOSITION - DISCHARGE FROM COMMUNITY SERVICE.PDF", "2025-10-31-assault-dismissed.pdf"),
    ("2025-12-12 - 202592876 - Bill of Review to Set Aside Default Judgment and Ex Parte Emergency Motion for Tewmporary Posession of Children .pdf", "2025-12-12-bill-of-review.pdf"),
    ("2023-08-15 - 202353496 - PETITION FOR WRIT OF HABEUS COPRUS AND ATTACHMENT.pdf", "2023-08-15-habeas-corpus-petition.pdf"),
    ("2023-12-27 - 202353496 AMENDED PETITION FOR WRIT OF HABEAS CORPUS AND ATTACHMENT.pdf", "2023-12-27-amended-habeas-corpus.pdf"),
    ("2022-10-27 - 223100382686 - Eviction Petition.pdf", "2022-10-27-eviction-petition.pdf"),
    ("2022-10-27 - 223100382686 - Eviction.pdf", "2022-10-27-eviction.pdf"),
    ("2023-02-15 - 1196921 - Answer in Appeal.pdf", "2023-02-15-answer-in-appeal.pdf"),
    ("2023-02-20 - 1196921 Final Judgement.pdf", "2023-02-20-take-nothing-judgment.pdf"),
    ("2023-05-15 - 233100181071 - Writ of Re-Entry.pdf", "2023-05-15-writ-of-reentry.pdf"),
]

def redact_pdf(src_path, dest_path):
    """Redact sensitive terms from PDF and save to destination"""
    try:
        doc = fitz.open(src_path)
        redaction_count = 0

        for page_num, page in enumerate(doc):
            for term in REDACT_TERMS:
                # Search for the term
                text_instances = page.search_for(term)

                for inst in text_instances:
                    # Add redaction annotation (black rectangle)
                    page.add_redact_annot(inst, fill=(0, 0, 0))
                    redaction_count += 1

            # Apply all redactions on this page
            page.apply_redactions()

        # Save the redacted document
        doc.save(dest_path)
        doc.close()

        return redaction_count

    except Exception as e:
        return f"ERROR: {e}"

def main():
    print("PDF Redaction Tool - SAFE SAPCR Texas")
    print("=" * 50)

    # Create destination directory
    DEST_DIR.mkdir(parents=True, exist_ok=True)

    total_redactions = 0
    processed = 0
    errors = []

    for src_name, dest_name in FILES:
        src_path = SOURCE_DIR / src_name
        dest_path = DEST_DIR / dest_name

        if not src_path.exists():
            print(f"[SKIP] Not found: {src_name}")
            continue

        result = redact_pdf(str(src_path), str(dest_path))

        if isinstance(result, int):
            print(f"[OK] {dest_name} - {result} redactions")
            total_redactions += result
            processed += 1
        else:
            print(f"[ERR] {dest_name} - {result}")
            errors.append(dest_name)

    print("\n" + "=" * 50)
    print(f"Processed: {processed} files")
    print(f"Total redactions: {total_redactions}")
    print(f"Errors: {len(errors)}")

    if total_redactions > 0:
        print(f"\nRedacted files saved to: {DEST_DIR}")
        print("\nTerms redacted:")
        for term in REDACT_TERMS[:4]:
            print(f"  - {term}")

    return processed, total_redactions, errors

if __name__ == "__main__":
    main()
