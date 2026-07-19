from django.contrib.auth.models import User
from django.db import IntegrityError

from .models import Event, EventTeam

def add_team_member(event, email, added_by, role="volunteer"):
    """
    Add a registered user to an event team.
    """

    email = email.strip().lower()

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        raise ValueError("No registered user found with this email.")

    if event.created_by != added_by and not added_by.is_staff:
        raise PermissionError("You are not allowed to manage this event.")

    try:
        member = EventTeam.objects.create(
            event=event,
            user=user,
            added_by=added_by,
            role=role,
        )
    except IntegrityError:
        raise ValueError("User is already a team member.")

    return member

def get_team_members(event):
    return (
        EventTeam.objects
        .filter(event=event)
        .select_related("user", "added_by")
    )
    
def remove_team_member(event, member_id, removed_by):
    if event.created_by != removed_by and not removed_by.is_staff:
        raise PermissionError("You are not allowed to manage this event.")

    member = EventTeam.objects.get(
        id=member_id,
        event=event,
    )

    member.delete()
    
def remove_team_member(event, member_id, removed_by):
    if event.created_by != removed_by and not removed_by.is_staff:
        raise PermissionError("You are not allowed to manage this event.")

    member = EventTeam.objects.get(
        id=member_id,
        event=event,
    )

    member.delete()
    
def get_assigned_events(user):
    return (
        Event.objects
        .filter(team_members__user=user)
        .distinct()
    )