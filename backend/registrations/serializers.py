from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = [
            'id', 'user', 'event', 'full_name', 'email',
            'phone', 'college', 'year', 'status',
            'registered_at', 'qr_code',
            'checked_in', 'checked_in_at', 'checked_in_by',
        ]
        read_only_fields = [
            'user', 'status', 'registered_at', 'qr_code',
            'checked_in', 'checked_in_at', 'checked_in_by',
        ]


class CheckInSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    checked_in_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [
            'id', 'full_name', 'email', 'college', 'year',
            'status', 'event_title', 'checked_in',
            'checked_in_at', 'checked_in_by_name',
        ]

    def get_checked_in_by_name(self, obj):
        if obj.checked_in_by:
            return obj.checked_in_by.get_full_name() or obj.checked_in_by.username
        return None