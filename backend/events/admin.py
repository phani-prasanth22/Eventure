from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'category', 'status', 'created_by', 'event_date']
    list_filter = ['status', 'category', 'event_date']
    search_fields = ['title', 'category', 'venue']
    fields = [
        'title',
        'description',
        'category',
        'venue',
        'event_date',
        'event_time',
        'registration_deadline',
        'max_capacity',
        'ticket_price',
        'banner',
        'status',
        'created_by',
        'rejection_reason',
        'cancellation_reason',
    ]