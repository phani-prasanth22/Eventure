import qrcode
import json
import os
from io import BytesIO
from django.core.files.base import ContentFile


def generate_registration_qr(registration):
    """
    Generates a QR code image for a registration and saves it to the
    registration's qr_code ImageField.

    QR payload contains enough info for backend verification on scan.
    Frontend never needs to decode this — backend does all verification.
    """

    # Build secure payload — backend uses this on scan to verify
    payload = {
        "registration_id": registration.id,
        "event_id": registration.event.id,
        "user_id": registration.user.id,
        "full_name": registration.full_name,
        "email": registration.email,
        "status": registration.status,
    }

    qr_data = json.dumps(payload)

    # Generate high quality QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Save to in-memory buffer
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    filename = f'registration_{registration.id}.png'

    # Delete old QR file if it exists to avoid orphaned files
    if registration.qr_code:
        old_path = registration.qr_code.path
        if os.path.exists(old_path):
            os.remove(old_path)

    # Save new QR image to the ImageField
    registration.qr_code.save(
        filename,
        ContentFile(buffer.read()),
        save=False  # we call registration.save() ourselves
    )