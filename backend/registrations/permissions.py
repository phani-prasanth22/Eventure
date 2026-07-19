from rest_framework.permissions import BasePermission
from events.models import Event, EventTeam


class IsOrganizerOrAdmin(BasePermission):
    """
    Allows access to:
    - Admin / staff
    - Organizer of the event
    - Assigned event team member (volunteer or lead)

    event_id must be in URL kwargs as 'event_id'.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin always allowed
        if request.user.is_staff or request.user.is_superuser:
            return True

        event_id = view.kwargs.get('event_id')
        if not event_id:
            return False

        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return False

        # Organizer allowed
        if event.created_by == request.user:
            return True

        # Team member allowed
        return EventTeam.objects.filter(
            event=event,
            user=request.user
        ).exists()