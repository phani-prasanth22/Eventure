from django.contrib import admin
from .models import Event, EventTeam


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "event_date",
        "status",
        "created_by",
    )
    list_filter = (
        "status",
        "category",
        "event_date",
    )
    search_fields = (
        "title",
        "venue",
    )


@admin.register(EventTeam)
class EventTeamAdmin(admin.ModelAdmin):
    list_display = (
        "event",
        "user",
        "role",
        "added_by",
        "created_at",
    )
    list_filter = (
        "role",
        "created_at",
    )
    search_fields = (
        "event__title",
        "user__username",
        "user__email",
    )