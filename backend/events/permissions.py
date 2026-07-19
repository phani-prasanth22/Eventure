from rest_framework.permissions import BasePermission

from .models import EventTeam


class IsOrganizerOrAdmin(BasePermission):
    """
    Allows access only to the event organizer or an admin.
    """

    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_staff or
            obj.created_by == request.user
        )
        
        