import json
from django.utils import timezone
from .models import Registration


def perform_checkin(qr_data, event_id, performed_by):
    """
    Validates and performs check-in from QR data.
    Returns (success, status_code, response_data)

    status_code values:
        'success'         - checked in successfully
        'already_checked' - already checked in
        'invalid_qr'      - QR data is malformed
        'not_found'       - registration not found
        'wrong_event'     - QR belongs to different event
        'not_registered'  - registration is cancelled
        'event_not_found' - event doesn't exist
    """
    from events.models import Event

    # Parse QR payload
    try:
        payload = json.loads(qr_data)
        registration_id = payload.get('registration_id')
        qr_event_id = payload.get('event_id')
    except (json.JSONDecodeError, AttributeError):
        return False, 'invalid_qr', {'message': 'Invalid QR code format.'}

    if not registration_id or not qr_event_id:
        return False, 'invalid_qr', {'message': 'QR code is missing required data.'}

    # Verify event exists
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return False, 'event_not_found', {'message': 'Event not found.'}

    # Check QR belongs to this event
    if int(qr_event_id) != int(event_id):
        return False, 'wrong_event', {
            'message': 'This QR code belongs to a different event.'
        }

    # Find registration — always verify from database, never trust QR contents
    try:
        registration = Registration.objects.select_related(
            'user', 'event', 'checked_in_by'
        ).get(id=registration_id, event_id=event_id)
    except Registration.DoesNotExist:
        return False, 'not_found', {'message': 'Registration not found for this event.'}

    # Check registration is still active
    if registration.status != 'registered':
        return False, 'not_registered', {
            'message': f'Registration is {registration.status}. Cannot check in.'
        }

    # Already checked in
    if registration.checked_in:
        return False, 'already_checked', {
            'message': 'Already checked in.',
            'registration': registration,
        }

    # Perform check-in
    registration.checked_in = True
    registration.checked_in_at = timezone.now()
    registration.checked_in_by = performed_by
    registration.save(update_fields=['checked_in', 'checked_in_at', 'checked_in_by'])

    return True, 'success', {'registration': registration}


def get_checkin_stats(event_id):
    """Returns attendance statistics for an event."""
    registrations = Registration.objects.filter(
        event_id=event_id,
        status='registered'
    )
    total = registrations.count()
    checked_in = registrations.filter(checked_in=True).count()
    remaining = total - checked_in
    percentage = round((checked_in / total * 100), 1) if total > 0 else 0

    return {
        'total_registered': total,
        'checked_in': checked_in,
        'remaining': remaining,
        'percentage': percentage,
    }


def search_registration(event_id, query):
    """
    Fallback search by registration ID, email, or name.
    Returns list of matching registrations.
    """
    from django.db.models import Q
    registrations = Registration.objects.filter(
        event_id=event_id,
        status='registered'
    ).filter(
        Q(id__icontains=query) |
        Q(email__icontains=query) |
        Q(full_name__icontains=query)
    ).select_related('user', 'event')

    return registrations