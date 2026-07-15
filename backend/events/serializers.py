from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    capacity = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    organizer = serializers.SerializerMethodField()
    registered = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()
    speakers = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category',
            'venue', 'location', 'date', 'time',
            'registration_deadline', 'capacity', 'price',
            'image', 'banner', 'status', 'created_by',
            'organizer', 'registered', 'schedule', 'speakers',
            'rejection_reason', 'cancellation_reason',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'status', 'rejection_reason', 'cancellation_reason']
        extra_kwargs = {
            'venue': {'required': False},  # we handle it manually in to_internal_value
        }

    def get_date(self, obj):
        return str(obj.event_date) if obj.event_date else None

    def get_time(self, obj):
        return str(obj.event_time) if obj.event_time else None

    def get_location(self, obj):
        return obj.venue

    def get_capacity(self, obj):
        return obj.max_capacity

    def get_price(self, obj):
        return str(obj.ticket_price)

    def get_image(self, obj):
        if obj.banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.banner.url)
            return obj.banner.url
        return None

    def get_organizer(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return 'Unknown'

    def get_registered(self, obj):
        return obj.registrations.filter(status='registered').count()

    def get_schedule(self, obj):
        return []

    def get_speakers(self, obj):
        return []

    def to_internal_value(self, data):
        # Make a mutable copy
        if hasattr(data, '_mutable'):
            data._mutable = True
        data = data.dict() if hasattr(data, 'dict') else dict(data)

        # Remap frontend names to model field names
        if 'location' in data:
            data['venue'] = data.pop('location')
        if 'date' in data:
            data['event_date'] = data.pop('date')
        if 'time' in data:
            data['event_time'] = data.pop('time')
        if 'capacity' in data:
            data['max_capacity'] = data.pop('capacity')
        if 'price' in data:
            data['ticket_price'] = data.pop('price')
        if 'image' in data:
            data['banner'] = data.pop('image')

        # Remove blank venue if it somehow still exists after remapping
        if 'venue' in data and not data['venue']:
            data.pop('venue')

        return super().to_internal_value(data)

    def validate(self, data):
        # Ensure venue is present after all remapping
        if not data.get('venue') and not data.get('event_date'):
            raise serializers.ValidationError("Required fields are missing.")
        return data
    def validate(self, data):
        print("DATA AFTER to_internal_value:", data)
        return data