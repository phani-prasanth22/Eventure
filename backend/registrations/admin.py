from django.contrib import admin
from .models import Registration


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'event', 'email', 'phone', 'status', 'registered_at']
    list_filter = ['status', 'registered_at']
    search_fields = ['full_name', 'email', 'event__title']