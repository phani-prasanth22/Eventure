from rest_framework.permissions import BasePermission
from events.models import Event


class IsOrganizerOrAdmin(BasePermission):
    """
    Allows access only to the organizer of the event or admin users.
    event_id must be in URL kwargs as 'event_id'.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff or request.user.is_superuser:
            return True

        event_id = view.kwargs.get('event_id')
        if not event_id:
            return False

        try:
            event = Event.objects.get(id=event_id)
            return event.created_by == request.user
        except Event.DoesNotExist:
            return False